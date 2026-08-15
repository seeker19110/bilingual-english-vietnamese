// packages/core-config/secrets.ts — Nhận diện biến môi trường BÍ MẬT và che (redact) giá trị của
// chúng trước khi ghi ra log.
//
// Vì sao cần: `CLAUDE.md` mục 4.6 ("không bí mật trong code") và Phase 01 mục 7 ("secrets never
// enter logs") lâu nay chỉ là QUY ƯỚC — không có gì chặn tự động. Chỉ cần một lần lỡ tay
// `log.debug(\`gọi API với key=\${apiKey}\`)` hoặc một thông báo lỗi của thư viện ngoài có kèm
// connection string là secret nằm vĩnh viễn trong log PM2 trên VPS (và trong Sentry). Module này
// biến quy ước đó thành hàng rào chạy thật: `redactSecrets()` quét chuỗi log, thấy giá trị nào
// TRÙNG với một biến môi trường bí mật thì thay bằng `***`.
//
// Cách tiếp cận là "khớp theo GIÁ TRỊ", không phải "khớp theo mẫu chuỗi giống secret" (kiểu regex
// đoán `sk-...`): ta biết chính xác secret của mình là gì, nên không có dương tính giả với văn bản
// bình thường, cũng không bỏ sót secret có định dạng lạ.

export const REDACTED = '***'

// Giá trị ngắn hơn ngưỡng này KHÔNG che. Lý do: các biến bí mật đôi khi mang giá trị tầm thường
// (`SKIP_AUTH=true`, cổng, cờ bật/tắt) — che chúng sẽ đục thủng những dòng log không liên quan
// (mọi chữ "true" trong log biến thành `***`), làm log vô dụng mà chẳng bảo vệ được gì.
const MIN_SECRET_LENGTH = 8

// Tên biến chứa một trong các mảnh này ⇒ coi là bí mật.
// PASS phủ cả PASSWORD/PASSPHRASE lẫn `SMTP_PASS`/`SMTP_FALLBACK_PASS` (mailer.ts đọc động bằng
// `process.env[\`${prefix}PASS\`]` nên tên đầy đủ không xuất hiện ở đâu trong mã nguồn).
const SECRET_KEY_PATTERNS = [/KEY/, /SECRET/, /PASS/, /TOKEN/, /DSN/, /CREDENTIAL/]

// Biến bí mật mà TÊN không lộ ra điều đó — chuỗi kết nối có nhúng sẵn mật khẩu.
// Cố ý KHÔNG bắt mọi biến kết thúc bằng `_URL`: `R2_PUBLIC_BASE_URL` là địa chỉ công khai, che nó
// đi chỉ làm log khó đọc khi chẩn đoán cache TTS.
const SECRET_KEY_EXACT = new Set(['DATABASE_URL', 'DATABASE_URL_READ', 'REDIS_URL'])

/**
 * Tên biến môi trường này có phải bí mật không?
 *
 * Biến tiền tố `VITE_` LUÔN được coi là công khai: Vite nhúng thẳng chúng vào file JS gửi cho
 * trình duyệt, nên chúng vốn đã lộ theo thiết kế (vd `VITE_SENTRY_DSN`). Che chúng trong log chỉ
 * tạo cảm giác an toàn giả và làm khó việc chẩn đoán.
 */
export function isSecretEnvKey(key: string): boolean {
  if (key.startsWith('VITE_')) return false
  if (SECRET_KEY_EXACT.has(key)) return true
  return SECRET_KEY_PATTERNS.some((re) => re.test(key))
}

let cachedValues: string[] | null = null
let cachedSource: NodeJS.ProcessEnv | null = null

/**
 * Danh sách GIÁ TRỊ bí mật hiện có trong môi trường, sắp xếp DÀI TRƯỚC.
 *
 * Sắp dài trước để khi hai secret lồng nhau (một cái là tiền tố của cái kia) thì cái dài bị thay
 * trước — thay cái ngắn trước sẽ cắt vụn cái dài và để lộ phần đuôi.
 *
 * Có cache vì `redactSecrets()` chạy trên MỌI dòng log; quét lại toàn bộ `process.env` mỗi lần là
 * lãng phí. Env thực tế cố định từ lúc khởi động nên cache an toàn — nhưng test có đổi env giữa
 * chừng thì phải gọi `resetSecretCache()`.
 */
export function collectSecretValues(source: NodeJS.ProcessEnv = process.env): string[] {
  if (cachedValues && cachedSource === source) return cachedValues

  const found = new Set<string>()
  for (const [key, value] of Object.entries(source)) {
    if (!value || !isSecretEnvKey(key)) continue
    // Tách thêm theo dấu phẩy cho biến dạng DANH SÁCH (vd `GOOGLE_TTS_API_KEYS` chứa nhiều key
    // ngăn bằng dấu phẩy): log thường chỉ in ra MỘT key trong danh sách, nên nếu chỉ so với cả
    // chuỗi gộp thì không bao giờ khớp.
    for (const part of value.includes(',') ? [value, ...value.split(',')] : [value]) {
      const trimmed = part.trim()
      if (trimmed.length >= MIN_SECRET_LENGTH) found.add(trimmed)
    }
  }

  const list = [...found].sort((a, b) => b.length - a.length)
  cachedValues = list
  cachedSource = source
  return list
}

/** Xoá cache của `collectSecretValues()`. Gọi sau khi đổi biến môi trường (chủ yếu trong test). */
export function resetSecretCache(): void {
  cachedValues = null
  cachedSource = null
}

/**
 * Thay mọi giá trị bí mật xuất hiện trong `text` bằng `***`.
 *
 * Dùng `split().join()` thay cho `replace()` với regex: giá trị secret có thể chứa ký tự đặc biệt
 * của regex (`+`, `.`, `$`... rất hay gặp trong khoá base64) — ghép thẳng vào regex sẽ khớp sai
 * hoặc ném lỗi cú pháp.
 */
export function redactSecrets(text: string, source: NodeJS.ProcessEnv = process.env): string {
  let out = text
  for (const secret of collectSecretValues(source)) {
    if (out.includes(secret)) out = out.split(secret).join(REDACTED)
  }
  return out
}
