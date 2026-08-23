// packages/core-auth/totp.ts — Lõi TOTP (RFC 6238) cho xác thực hai bước.
//
// Vì sao TỰ CÀI thay vì thêm thư viện: thuật toán chỉ khoảng 60 dòng, chuẩn đã đóng băng nhiều
// năm, và đây là code bảo mật — tự cài thì đọc kiểm được toàn bộ, không phải tin một gói npm mới
// trong chuỗi cung ứng. Dự án cũng chủ trương tối thiểu phụ thuộc.
//
// Tham số cố ý chọn theo MẶC ĐỊNH của mọi app xác thực (Google Authenticator, Authy, 1Password…):
// SHA-1, 6 chữ số, chu kỳ 30 giây. Đổi sang SHA-256 nghe có vẻ "an toàn hơn" nhưng nhiều app phổ
// biến bỏ qua tham số algorithm trong URI và vẫn tính bằng SHA-1 ⇒ người dùng nhập mã đúng mà
// server báo sai. Ở đây tương thích quan trọng hơn, và SHA-1 trong HMAC vẫn an toàn (các đợt tấn
// công va chạm SHA-1 không phá được HMAC-SHA1).

const DIGITS = 6
const PERIOD_SECONDS = 30
const SECRET_BYTES = 20 // 160 bit — độ dài khuyến nghị của RFC 4226 cho HMAC-SHA1

// Bảng Base32 chuẩn RFC 4648 — định dạng mọi app xác thực đọc được.
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/** Sinh secret TOTP mới, trả về chuỗi Base32 để nhét vào mã QR / gõ tay. */
export function generateTotpSecret(): string {
  return base32Encode(crypto.getRandomValues(new Uint8Array(SECRET_BYTES)))
}

/**
 * Chuỗi `otpauth://` để dựng mã QR.
 *
 * `issuer` xuất hiện cả ở tham số lẫn tiền tố của label — đúng khuyến nghị của Google
 * Authenticator, giúp app hiện "DHCB (email)" thay vì chỉ mỗi email khi người dùng có nhiều tài
 * khoản. Mọi thành phần đều encode URI vì email có thể chứa ký tự cần thoát.
 */
export function buildOtpAuthUri(secret: string, accountLabel: string, issuer = 'DHCB'): string {
  const label = encodeURIComponent(`${issuer}:${accountLabel}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

/** Bước thời gian hiện tại (số chu kỳ 30 giây kể từ epoch). */
export function currentTimeStep(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / 1000 / PERIOD_SECONDS)
}

/** Sinh mã 6 chữ số cho một bước thời gian cụ thể. */
export async function generateTotpCode(secret: string, timeStep: number): Promise<string> {
  const keyBytes = base32Decode(secret)

  // Bộ đếm 8 byte big-endian. Dùng DataView + BigInt để không mất chính xác — số bước hiện tại
  // vừa với 32 bit, nhưng viết đúng chuẩn ngay từ đầu thì không có bug chờ tới năm 2106.
  const counter = new Uint8Array(8)
  new DataView(counter.buffer).setBigUint64(0, BigInt(timeStep), false)

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', key, counter as BufferSource))

  // "Dynamic truncation" (RFC 4226 §5.3): 4 bit thấp của byte cuối chỉ ra vị trí bắt đầu lấy
  // 4 byte; bit cao nhất bị che để kết quả luôn dương.
  const offset = hmac[hmac.length - 1]! & 0x0f
  const binary =
    ((hmac[offset]! & 0x7f) << 24) |
    (hmac[offset + 1]! << 16) |
    (hmac[offset + 2]! << 8) |
    hmac[offset + 3]!

  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0')
}

export interface TotpVerifyResult {
  /** Mã có hợp lệ không. */
  valid: boolean
  /** Bước thời gian đã khớp — nơi gọi PHẢI lưu lại để chặn dùng lại chính mã đó. */
  timeStep: number | null
}

/**
 * Kiểm mã người dùng nhập.
 *
 * Chấp nhận lệch ±1 bước (±30 giây) vì đồng hồ điện thoại thường lệch đôi chút và người dùng cần
 * vài giây để gõ. Rộng hơn nữa sẽ kéo dài cửa sổ tấn công mà không giúp ích thêm.
 *
 * `lastUsedStep` = bước thời gian của lần xác thực THÀNH CÔNG gần nhất. Truyền vào để CHẶN DÙNG
 * LẠI: không có nó, kẻ nhìn trộm màn hình/lịch sử có thể dùng lại đúng mã đó trong 30 giây còn
 * lại của chu kỳ.
 */
export async function verifyTotpCode(
  secret: string,
  code: string,
  options: { nowMs?: number; lastUsedStep?: number | null } = {},
): Promise<TotpVerifyResult> {
  const normalized = code.replace(/\s/g, '')
  if (!/^\d{6}$/.test(normalized)) return { valid: false, timeStep: null }

  const now = currentTimeStep(options.nowMs ?? Date.now())
  for (const step of [now, now - 1, now + 1]) {
    // Mã cũ hơn hoặc bằng lần dùng thành công gần nhất ⇒ từ chối, kể cả khi tính ra đúng.
    if (options.lastUsedStep != null && step <= options.lastUsedStep) continue
    const expected = await generateTotpCode(secret, step)
    if (timingSafeEqual(expected, normalized)) return { valid: true, timeStep: step }
  }
  return { valid: false, timeStep: null }
}

/**
 * So sánh chuỗi trong thời gian hằng định.
 *
 * `a === b` thoát ngay ở ký tự khác đầu tiên, để lộ qua thời gian phản hồi rằng đoán được bao
 * nhiêu ký tự đầu. Với không gian chỉ 10^6 mã, rò rỉ đó là thật chứ không phải lo hão.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ── Base32 (RFC 4648, không đệm '=') ────────────────────────────────────────
export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(input: string): Uint8Array {
  // Bỏ khoảng trắng và dấu '=' — người dùng gõ tay hay chép kèm. Chữ thường cũng chấp nhận.
  const clean = input.replace(/[\s=]/g, '').toUpperCase()
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch)
    if (idx === -1) throw new Error(`Secret TOTP không hợp lệ: gặp ký tự "${ch}"`)
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(out)
}
