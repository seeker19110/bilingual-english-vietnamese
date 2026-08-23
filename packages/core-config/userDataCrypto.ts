// packages/core-config/userDataCrypto.ts — Mã hoá AES-256-GCM cho DỮ LIỆU NGƯỜI DÙNG.
//
// Vì sao cần: bản dump PostgreSQL và file backup đẩy lên Cloudflare R2 hiện là PLAINTEXT. Lộ khoá
// R2 = lộ toàn bộ dữ liệu người dùng. Module này đóng đúng lỗ hổng đó: dữ liệu nhạy cảm nằm trong
// DB (và do đó trong mọi bản backup) ở dạng ciphertext.
//
// Phạm vi bảo vệ — nói thẳng để không hiểu nhầm (xem docs/research/dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md):
//   ✅ Chống: lộ bản dump DB · lộ backup R2 · người đọc được DB nhưng không vào được server.
//   ❌ KHÔNG chống: kẻ chiếm được quyền chạy mã trên server (khoá gốc cũng ở đó), và KHÔNG chống
//      lỗi phân quyền trong chính API — handler tự giải mã rồi trả về, nên `validateAuth()` vẫn là
//      tuyến phòng thủ số 1. Mã hoá KHÔNG thay thế được việc kiểm quyền.
//
// Khác `packages/core-ai/ttsCrypto.ts` (mã hoá cache TTS) ở ba điểm, đều có lý do:
//   1. Khoá suy ra từ `user_id` (mỗi người một khoá) thay vì từ hash nội dung.
//   2. IV LUÔN ngẫu nhiên và nằm ngay trong chuỗi kết quả — không có nhánh "iv tất định" nào cả.
//      ttsCrypto từng mắc lỗi dùng lại nonce và phải sửa (audit 2026-08-12); ở đây tránh từ đầu.
//   3. Có sẵn `keyVersion` NGAY TỪ BẢN ĐẦU. Thêm sau thì phải viết lại toàn bộ dữ liệu đã mã hoá.
//
// ⚠️ TRẠNG THÁI: module này đang NGỦ — chưa chỗ nào gọi (quyết định 2026-08-23: người dùng ghi nợ
// việc mã hoá). Lý do hoãn: chưa chốt được CẤT KHOÁ GỐC Ở ĐÂU. Khoá phải nằm khác chỗ với backup
// DB (cất chung thì mã hoá vô nghĩa), mà mất khoá = mất vĩnh viễn dữ liệu đã mã hoá. Xem
// PROGRESS.md mục "Nợ kỹ thuật còn mở" để biết điều kiện gỡ nợ và rủi ro đang chấp nhận.
//
// Định dạng chuỗi lưu vào DB (tự mô tả, không cần thêm cột nào):
//     v<keyVersion>:<iv_base64>:<ciphertext_base64>
// Base64 không chứa ':' nên tách bằng ':' là an toàn.

const IV_LENGTH = 12 // 96 bit — độ dài nonce chuẩn cho AES-GCM
const KEY_LENGTH = 32 // AES-256
const ENVELOPE_PREFIX = 'v'
const SEPARATOR = ':'

// Phiên bản khoá đang dùng để MÃ HOÁ MỚI. Đọc thì hỗ trợ mọi phiên bản còn khoá trong env.
function getCurrentKeyVersion(): number {
  const raw = process.env.USER_DATA_KEY_VERSION
  if (!raw) return 1
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('USER_DATA_KEY_VERSION phải là số nguyên ≥ 1')
  }
  return n
}

/**
 * Đọc khoá gốc của một phiên bản.
 *
 * Phiên bản hiện tại đọc `USER_DATA_MASTER_KEY`; các phiên bản cũ (chỉ cần khi xoay khoá, để còn
 * giải mã được dữ liệu chưa viết lại) đọc `USER_DATA_MASTER_KEY_V<n>`. Nhờ vậy việc xoay khoá
 * không cần dừng dịch vụ: đặt khoá mới + tăng version, giữ khoá cũ lại cho tới khi viết lại xong.
 */
function getMasterKeyBytes(version: number): Uint8Array {
  const isCurrent = version === getCurrentKeyVersion()
  const envName = isCurrent ? 'USER_DATA_MASTER_KEY' : `USER_DATA_MASTER_KEY_V${version}`
  const b64 = process.env[envName]
  if (!b64) {
    throw new Error(`Server chưa cấu hình ${envName} (xem .env.example)`)
  }
  const bytes = base64ToBytes(b64)
  if (bytes.length !== KEY_LENGTH) {
    throw new Error(
      `${envName} phải là khoá ${KEY_LENGTH} byte dạng base64 — tạo lại bằng lệnh trong .env.example`,
    )
  }
  return bytes
}

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

// Khoá riêng của từng người dùng, suy ra từ khoá gốc — KHÔNG lưu ở đâu cả, nên không có bảng khoá
// để mất và không cần migration thêm cột. Tiền tố 'user-data:' tách không gian khoá khỏi mọi mục
// đích khác dùng chung khoá gốc (vd. hashLookup bên dưới dùng tiền tố khác).
async function deriveUserKey(userId: string, version: number): Promise<Uint8Array> {
  return hmacSha256(getMasterKeyBytes(version), `user-data:${userId}`)
}

/**
 * Mã hoá một trường dữ liệu của người dùng.
 *
 * Trả về chuỗi tự mô tả `v<n>:<iv>:<cipher>` — lưu thẳng vào cột `text`, không cần cột phụ cho iv
 * hay phiên bản khoá. Chuỗi rỗng vẫn mã hoá bình thường (để không lộ "trường này rỗng" qua việc
 * nó là plaintext).
 */
export async function encryptUserField(userId: string, plaintext: string): Promise<string> {
  if (!userId) throw new Error('encryptUserField: thiếu userId')
  const version = getCurrentKeyVersion()
  const keyBytes = await deriveUserKey(userId, version)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, 'AES-GCM', false, [
    'encrypt',
  ])
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext),
  )
  return [
    `${ENVELOPE_PREFIX}${version}`,
    bytesToBase64(iv),
    bytesToBase64(new Uint8Array(cipher)),
  ].join(SEPARATOR)
}

/**
 * Chuỗi này có phải do `encryptUserField` tạo ra không?
 *
 * Dùng để chuyển đổi DẦN: bản ghi cũ còn plaintext thì đọc thẳng, bản ghi mới thì giải mã — không
 * cần dừng dịch vụ để viết lại toàn bộ dữ liệu trước khi bật tính năng.
 */
export function isEncryptedField(value: string): boolean {
  const parts = value.split(SEPARATOR)
  if (parts.length !== 3) return false
  const [tag, iv, cipher] = parts
  if (!tag || !iv || !cipher) return false
  if (!tag.startsWith(ENVELOPE_PREFIX)) return false
  return /^\d+$/.test(tag.slice(ENVELOPE_PREFIX.length))
}

/**
 * Giải mã một trường đã mã hoá.
 *
 * Giá trị KHÔNG phải ciphertext được trả về nguyên vẹn (bản ghi cũ chưa mã hoá) — chủ ý, để việc
 * chuyển đổi dần không làm hỏng dữ liệu đang có.
 */
export async function decryptUserField(userId: string, stored: string): Promise<string> {
  if (!isEncryptedField(stored)) return stored
  if (!userId) throw new Error('decryptUserField: thiếu userId')

  const parts = stored.split(SEPARATOR)
  const tag = parts[0] as string
  const ivB64 = parts[1] as string
  const cipherB64 = parts[2] as string

  const version = Number(tag.slice(ENVELOPE_PREFIX.length))
  const iv = base64ToBytes(ivB64)
  if (iv.length !== IV_LENGTH) {
    throw new Error(`IV không hợp lệ: cần ${IV_LENGTH} byte, nhận ${iv.length}`)
  }
  const keyBytes = await deriveUserKey(userId, version)
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, 'AES-GCM', false, [
    'decrypt',
  ])
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    base64ToBytes(cipherB64) as BufferSource,
  )
  return new TextDecoder().decode(plain)
}

/**
 * Băm TẤT ĐỊNH cho trường cần TRA CỨU (điển hình: email lúc đăng nhập).
 *
 * Vì sao cần: ciphertext AES-GCM khác nhau mỗi lần mã hoá cùng một giá trị, nên không thể
 * `where email = $1`. Cột băm giải quyết việc đó — vẫn tra cứu được mà không lưu plaintext.
 *
 * LUÔN dùng khoá phiên bản 1: xoay khoá mà đổi luôn giá trị băm thì mọi bản ghi cũ hoá "không tìm
 * thấy" và người dùng không đăng nhập được nữa. Đây là đánh đổi có chủ ý và phải giữ nguyên.
 *
 * Chuẩn hoá (thường + bỏ khoảng trắng thừa) trước khi băm để "A@B.com " và "a@b.com" ra cùng kết
 * quả — nếu không, người dùng gõ hoa một chữ là không đăng nhập được.
 */
export async function hashLookupValue(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase()
  const digest = await hmacSha256(getMasterKeyBytes(1), `lookup:${normalized}`)
  return bytesToBase64(digest)
}

// ── Tiện ích base64 ↔ bytes ────────────────────────────────────────────────
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!) // i < length nên luôn có
  return btoa(binary)
}
