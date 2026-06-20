// api/_lib/ttsCrypto.ts
// Mã hóa AES-256-GCM cho audio TTS cache (câu ví dụ, cụm từ — nội dung TĨNH, lưu lâu dài
// trên Supabase Storage). Mục tiêu: ai có link Storage cũng không nghe được nội dung nếu
// chưa đăng nhập — server chỉ trả khoá giải mã cho request có JWT Supabase hợp lệ.
//
// Cách sinh khoá: KHÔNG lưu khoá riêng cho từng file vào DB (đỡ phải thêm cột/migration).
// Khoá + iv được "suy ra" (derive) từ `text_hash` (đã có sẵn) bằng HMAC-SHA256 với 1 khoá
// gốc duy nhất `TTS_ENCRYPTION_MASTER_KEY` — cùng text_hash thì luôn ra cùng khoá/iv, không
// cần lưu lại ở đâu cả ("deterministic key derivation").
//
// ⚠️ Lưu ý quan trọng về phạm vi bảo vệ: cơ chế này gắn quyền xem vào "đã đăng nhập hay
// chưa", KHÔNG phân quyền theo từng người dùng/gói cước (nội dung này dùng chung cho mọi
// người học, không phải nội dung trả phí riêng). Nếu sau này có audio riêng theo gói Pro,
// phải thêm kiểm tra quyền (vd. `plan` từ bảng server-side, không dùng user_metadata) trước
// khi gọi getClientKeyMaterial().

import { getSupabaseAdmin } from './supabaseAdmin'

const IV_LENGTH = 12 // 96 bit — độ dài iv chuẩn, khuyến nghị cho AES-GCM

// Đọc + decode khoá gốc từ biến môi trường (base64 → 32 byte).
function getMasterKeyBytes(): Uint8Array {
  const b64 = process.env.TTS_ENCRYPTION_MASTER_KEY
  if (!b64) {
    throw new Error('Server chưa cấu hình TTS_ENCRYPTION_MASTER_KEY (xem TTS_CACHE_SETUP.md)')
  }
  const bytes = base64ToBytes(b64)
  if (bytes.length !== 32) {
    throw new Error('TTS_ENCRYPTION_MASTER_KEY phải là khoá 32 byte dạng base64 — tạo lại bằng lệnh trong .env.example')
  }
  return bytes
}

// HMAC-SHA256(key, message) — dùng Web Crypto, có sẵn trên Edge Runtime.
async function hmacSha256(keyBytes: Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message))
  return new Uint8Array(sig)
}

// Suy ra khoá AES (32 byte) + iv (12 byte) từ text_hash — luôn ra kết quả giống nhau với
// cùng 1 text_hash, không cần lưu trữ riêng cho mỗi file.
async function deriveKeyAndIv(textHash: string): Promise<{ keyBytes: Uint8Array; iv: Uint8Array }> {
  const master = getMasterKeyBytes()
  const keyBytes = await hmacSha256(master, `dek:${textHash}`) // 32 byte → dùng thẳng làm khoá AES-256
  const ivFull = await hmacSha256(master, `iv:${textHash}`)
  return { keyBytes, iv: ivFull.slice(0, IV_LENGTH) }
}

// Mã hóa bytes audio (mp3 gốc) → ciphertext để upload lên Storage.
export async function encryptAudio(plain: ArrayBuffer, textHash: string): Promise<ArrayBuffer> {
  const { keyBytes, iv } = await deriveKeyAndIv(textHash)
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt'])
  return crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain)
}

// Khoá + iv dạng base64 để gửi cho client giải mã — CHỈ gọi sau khi đã xác thực người dùng
// (isAuthenticatedRequest trả true), tránh phát khoá cho người chưa đăng nhập.
export async function getClientKeyMaterial(textHash: string): Promise<{ key_b64: string; iv_b64: string }> {
  const { keyBytes, iv } = await deriveKeyAndIv(textHash)
  return { key_b64: bytesToBase64(keyBytes), iv_b64: bytesToBase64(iv) }
}

// Kiểm tra request có kèm JWT Supabase hợp lệ không (header Authorization: Bearer <token>).
// Dùng để quyết định có trả khoá giải mã audio cache hay không — không kiểm tra này thì
// việc mã hóa vô nghĩa vì ai cũng xin được khoá.
export async function isAuthenticatedRequest(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) return false
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.getUser(token)
    return !error && !!data.user
  } catch {
    return false // SUPABASE_* chưa cấu hình hoặc lỗi mạng → coi như chưa đăng nhập (an toàn hơn)
  }
}

// ── Tiện ích base64 ↔ bytes (Edge Runtime có sẵn atob/btoa) ─────────────────
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}
