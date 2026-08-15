// packages/core-config/env.ts — Đọc & kiểm (validate) biến môi trường ở MỘT chỗ, có kiểu.
//
// Vấn đề đang giải (Phase 01 mục 1, `docs/phases/01-foundation-os.md`): toàn repo có ~71 lượt đọc
// `process.env.*` rải trên 24 file, mỗi nơi tự ép kiểu và tự đặt giá trị mặc định. Hệ quả thật đã
// gặp: cùng một biến số nhưng hai nơi hiểu khác nhau, và không có chỗ nào trả lời được câu
// "server này đang thiếu cấu hình gì".
//
// ─── NGUYÊN TẮC THIẾT KẾ: KHÔNG ĐƯỢC ĐỔI HÀNH VI ĐANG CHẠY ───────────────────────────────────
// Sản phẩm đang phục vụ người dùng thật (có thanh toán). Vì vậy module này CỐ Ý:
//
//  1. KHÔNG ném lỗi lúc khởi động khi thiếu biến. Mọi trường đều `optional`. Việc quyết định
//     "thiếu cái này thì chết" vẫn thuộc về từng nơi dùng, y như hiện nay (vd `/api/agent` trả 500
//     khi thiếu cả ba key AI; `getPgPool()` ném lỗi khi thiếu DATABASE_URL). Nếu ở đây bật
//     `.min(1)` cho một biến mà VPS chưa đặt, cả server sẽ không khởi động nổi — đổi một cấu hình
//     thiếu sót âm thầm thành một sự cố toàn hệ thống.
//  2. Giá trị mặc định SAO CHÉP ĐÚNG mặc định đang có trong mã cũ (xem chú thích từng dòng), để
//     việc chuyển sang dùng module này là thay đổi thuần tuý cơ học.
//  3. Biến không khai báo ở đây vẫn đọc được qua `process.env` như thường — module này bổ sung
//     một lối đi có kiểu, KHÔNG chặn lối cũ. Chuyển dần từng chỗ, không phải một lượt.

import { z } from 'zod'
import { isSecretEnvKey } from './secrets.js'

// Số nguyên dương, sai/thiếu thì rơi về mặc định. Tái tạo đúng công thức đang dùng ở pgPool.ts:
//   const n = Number(process.env.X); Number.isFinite(n) && n > 0 ? n : mặc_định
// Lưu ý ca biên khớp y hệt: chuỗi rỗng → Number('') = 0 → không dương → mặc định; chữ → NaN →
// mặc định; số âm/0 → mặc định.
function positiveIntWithDefault(fallback: number) {
  return z.coerce.number().int().positive().catch(fallback)
}

export const EnvSchema = z.object({
  // ── Cơ sở dữ liệu ────────────────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().optional(),
  // Read-replica, KHÔNG bắt buộc — thiếu thì pool đọc dùng chung pool ghi (xem pgPool.ts).
  DATABASE_URL_READ: z.string().optional(),
  PG_POOL_MAX: positiveIntWithDefault(10), // mặc định cũ trong pgPool.ts
  PG_POOL_READ_MAX: positiveIntWithDefault(10), // mặc định cũ trong pgPool.ts

  // ── Nhà cung cấp AI (chat) ───────────────────────────────────────────────────────────────
  // Cả ba đều optional: `/api/agent` tự chọn theo key nào có, chỉ báo lỗi khi KHÔNG có cái nào.
  GROQ_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // ── Giọng nói ────────────────────────────────────────────────────────────────────────────
  GOOGLE_TTS_API_KEY: z.string().optional(),
  GOOGLE_TTS_API_KEYS: z.string().optional(), // danh sách ngăn bằng dấu phẩy (xoay vòng quota)
  ELEVENLABS_API_KEY: z.string().optional(),
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().optional(),

  // ── Lưu trữ tệp ──────────────────────────────────────────────────────────────────────────
  STORAGE_DRIVER: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().optional(),

  // ── Hạ tầng chạy ─────────────────────────────────────────────────────────────────────────
  NODE_ENV: z.string().optional(),
  PORT: positiveIntWithDefault(3001), // cổng PM2 đang dùng cho app này
  // Thiếu REDIS_URL khi chạy nhiều tiến trình PM2 ⇒ rate limit lỏng gấp N lần
  // (xem warnIfClusterWithoutRedis trong packages/core-auth/security.ts).
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).catch('debug'), // mặc định cũ trong logger.ts
  SENTRY_DSN: z.string().optional(),
})

export type AppEnv = z.infer<typeof EnvSchema>

/**
 * Kiểm và ép kiểu một object env BẤT KỲ. Hàm thuần — không đọc `process.env`, không cache.
 *
 * Không bao giờ ném lỗi: mọi trường hoặc `optional` hoặc có `.catch()` mặc định. Xem khối
 * "NGUYÊN TẮC THIẾT KẾ" đầu file để biết vì sao đây là lựa chọn có chủ đích chứ không phải
 * validate hời hợt.
 */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return EnvSchema.parse(source)
}

let cached: AppEnv | null = null

/**
 * Bản đã kiểm của `process.env`, tính một lần rồi dùng lại.
 *
 * CHỈ gọi ở nơi chạy THƯA (dựng connection pool, khởi tạo provider). KHÔNG gọi trong đường nóng
 * như từng dòng log hay từng request — parse ~25 trường bằng Zod mỗi lần là lãng phí vô ích.
 */
export function getEnv(): AppEnv {
  if (!cached) cached = parseEnv()
  return cached
}

/** Xoá cache của `getEnv()`. Gọi sau khi đổi `process.env` (chủ yếu trong test). */
export function resetEnvCache(): void {
  cached = null
}

/**
 * Liệt kê tình trạng cấu hình để CHẨN ĐOÁN: biến nào đã đặt, biến nào chưa.
 *
 * Với biến bí mật chỉ trả `'set'`/`'missing'`, TUYỆT ĐỐI không trả giá trị — hàm này sinh ra để
 * in ra log/endpoint chẩn đoán, mà đó đúng là chỗ secret hay rò rỉ nhất.
 */
export function describeEnv(source: NodeJS.ProcessEnv = process.env): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of Object.keys(EnvSchema.shape)) {
    const raw = source[key]
    if (raw === undefined || raw === '') {
      out[key] = 'missing'
    } else {
      out[key] = isSecretEnvKey(key) ? 'set' : raw
    }
  }
  return out
}
