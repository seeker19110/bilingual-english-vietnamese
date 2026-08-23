// api/_lib/ttsCrypto.ts
// Mã hóa AES-256-GCM cho audio TTS cache (câu ví dụ, cụm từ — nội dung TĨNH, lưu lâu dài
// local VPS hoặc Cloudflare R2 tùy STORAGE_DRIVER, thư mục/prefix "tts-cache"). Mục tiêu: ai
// có link cũng không nghe được nội dung nếu chưa đăng nhập — server chỉ trả khoá giải mã cho
// request có Bearer token hợp lệ (việc xác thực đã được api/tts.ts thực hiện qua validateAuth()
// ở api/_lib/security.ts TRƯỚC khi gọi tới các hàm trong file này — file này không tự kiểm tra
// auth nữa, tránh trùng logic).
//
// Cách sinh khoá: KHÔNG lưu khoá riêng cho từng file vào DB (đỡ phải thêm cột/migration).
// Khoá + iv được "suy ra" (derive) từ `hash` (cột khoá cache, đã có sẵn) bằng HMAC-SHA256 với 1
// khoá gốc duy nhất `TTS_ENCRYPTION_MASTER_KEY` — cùng hash thì luôn ra cùng khoá/iv, không cần
// lưu lại ở đâu cả ("deterministic key derivation").
//
// ⚠️ Lưu ý quan trọng về phạm vi bảo vệ: cơ chế này gắn quyền xem vào "đã đăng nhập hay
// chưa", KHÔNG phân quyền theo từng người dùng/gói cước (nội dung này dùng chung cho mọi
// người học, không phải nội dung trả phí riêng). Nếu sau này có audio riêng theo gói Pro,
// phải thêm kiểm tra quyền (vd. `plan` từ bảng server-side, không dùng user_metadata) trước
// khi gọi getClientKeyMaterial().

const IV_LENGTH = 12 // 96 bit — độ dài iv chuẩn, khuyến nghị cho AES-GCM

// Đọc + decode khoá gốc từ biến môi trường (base64 → 32 byte).
function getMasterKeyBytes(): Uint8Array {
  const b64 = process.env.TTS_ENCRYPTION_MASTER_KEY
  if (!b64) {
    throw new Error('Server chưa cấu hình TTS_ENCRYPTION_MASTER_KEY (xem .env.example)')
  }
  const bytes = base64ToBytes(b64)
  if (bytes.length !== 32) {
    throw new Error(
      'TTS_ENCRYPTION_MASTER_KEY phải là khoá 32 byte dạng base64 — tạo lại bằng lệnh trong .env.example',
    )
  }
  return bytes
}

// HMAC-SHA256(key, message) — dùng Web Crypto, có sẵn trên Edge Runtime.
async function hmacSha256(keyBytes: Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message))
  return new Uint8Array(sig)
}

// ⚠️ IV TẤT ĐỊNH LÀ DI SẢN — chỉ dùng để ĐỌC bản ghi cũ (audit 2026-08-12).
//
// Bản đầu suy ra CẢ khoá LẪN iv từ `hash`. Khoá suy ra từ hash thì không sao (mỗi hash một
// khoá), nhưng iv suy ra từ hash là NONCE CỐ ĐỊNH theo khoá: nếu cùng một hash từng mã hoá
// HAI audio khác nhau thì đó là dùng lại nonce trong AES-GCM — hỏng nặng, không chỉ lộ XOR
// của hai bản rõ mà còn cho phép khôi phục khoá xác thực GCM và giả mạo dữ liệu.
// Điều đó KHÔNG chỉ là lý thuyết ở đây: provider TTS không trả byte giống hệt giữa các lần
// gọi, mà bảng tts_cache có nhánh `on conflict (hash) do update`, tức cùng một hash có thể
// được sinh lại ở hai thời điểm khác nhau. Khoá "claim" chỉ chặn hai request ĐỒNG THỜI.
//
// Từ nay: encryptAudio() sinh iv NGẪU NHIÊN mỗi lần và trả về để nơi gọi LƯU LẠI (cột
// tts_cache.iv, migration 0034). Bản ghi cũ chưa có iv thì rơi về công thức suy ra dưới đây —
// vẫn giải mã được, không phải sinh lại audio đã trả tiền.
async function deriveKeyAndLegacyIv(
  hash: string,
): Promise<{ keyBytes: Uint8Array; iv: Uint8Array }> {
  const master = getMasterKeyBytes()
  const keyBytes = await hmacSha256(master, `dek:${hash}`) // 32 byte → dùng thẳng làm khoá AES-256
  const ivFull = await hmacSha256(master, `iv:${hash}`)
  return { keyBytes, iv: ivFull.slice(0, IV_LENGTH) }
}

// Chọn iv: có iv đã lưu (base64) thì dùng, không thì rơi về iv suy ra từ hash (bản ghi cũ).
function pickIv(legacyIv: Uint8Array, ivB64?: string | null): Uint8Array {
  if (!ivB64) return legacyIv
  const iv = base64ToBytes(ivB64)
  if (iv.length !== IV_LENGTH) {
    throw new Error(`IV đã lưu không hợp lệ: cần ${IV_LENGTH} byte, nhận ${iv.length}`)
  }
  return iv
}

// Mã hóa bytes audio (mp3 gốc) → ciphertext để upload lên Storage.
// Trả kèm `iv_b64` — nơi gọi PHẢI lưu chuỗi này cùng bản ghi, không có nó thì không giải mã được.
export async function encryptAudio(
  plain: ArrayBuffer,
  hash: string,
): Promise<{ cipher: ArrayBuffer; iv_b64: string }> {
  const { keyBytes } = await deriveKeyAndLegacyIv(hash)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, 'AES-GCM', false, [
    'encrypt',
  ])
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    plain,
  )
  return { cipher, iv_b64: bytesToBase64(iv) }
}

// Giải mã ciphertext audio → bytes mp3 gốc (dùng khi remap cache sang hash mới).
// `ivB64` bỏ trống = bản ghi CŨ chưa lưu iv → dùng iv suy ra từ hash.
export async function decryptAudio(
  cipher: ArrayBuffer,
  hash: string,
  ivB64?: string | null,
): Promise<ArrayBuffer> {
  const { keyBytes, iv: legacyIv } = await deriveKeyAndLegacyIv(hash)
  const iv = pickIv(legacyIv, ivB64)
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, 'AES-GCM', false, [
    'decrypt',
  ])
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, cipher)
}

// Khoá + iv dạng base64 để gửi cho client giải mã — CHỈ gọi sau khi validateAuth() (security.ts)
// đã xác nhận request có JWT hợp lệ, tránh phát khoá cho người chưa đăng nhập.
// `ivB64` = giá trị cột tts_cache.iv của chính bản ghi đó (null với bản ghi cũ).
export async function getClientKeyMaterial(
  hash: string,
  ivB64?: string | null,
): Promise<{ key_b64: string; iv_b64: string }> {
  const { keyBytes, iv: legacyIv } = await deriveKeyAndLegacyIv(hash)
  const iv = pickIv(legacyIv, ivB64)
  return { key_b64: bytesToBase64(keyBytes), iv_b64: bytesToBase64(iv) }
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
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!) // i < length nên có
  return btoa(binary)
}
