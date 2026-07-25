// api/_lib/security.ts — Middleware bảo mật dùng chung cho tất cả API endpoints
// Import file này ở đầu mỗi handler để có CORS, rate limit, auth validation, v.v.

import { Redis } from 'ioredis'
import { validateSessionToken } from './authService'

// ── CORS ──────────────────────────────────────────────────────────────────────
// Đọc danh sách domain cho phép từ biến môi trường ALLOWED_ORIGINS (phân cách bằng dấu phẩy).
// Ví dụ: ALLOWED_ORIGINS=https://myapp.vercel.app,https://myapp.com
// Nếu không có biến này (môi trường dev), cho phép tất cả ('*').
export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
  const origin = req.headers.get('Origin') ?? ''

  let allowOrigin = '*'
  let allowCredentials = false
  if (allowedOrigins) {
    const list = allowedOrigins
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (origin && list.includes(origin)) {
      // Origin nằm trong whitelist → phản chiếu đúng origin + cho phép credentials
      allowOrigin = origin
      allowCredentials = true
    } else {
      // Không khớp → trả origin đầu danh sách (browser sẽ chặn origin lạ)
      allowOrigin = list[0] ?? '*'
    }
  }

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  }
  // CHỈ gắn Allow-Credentials khi phản chiếu đúng 1 origin cụ thể trong whitelist.
  // KHÔNG bao giờ kèm '*' — tổ hợp '*' + credentials bị browser từ chối và quá rộng.
  // (App xác thực bằng header Authorization: Bearer, không dùng cookie nên không bắt buộc.)
  if (allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }
  return headers
}

// ── Security Headers ──────────────────────────────────────────────────────────
// Các header bảo mật chuẩn — luôn đính kèm vào mọi response từ server.
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  // X-XSS-Protection đã deprecated — trình duyệt hiện đại không cần, bỏ đi tránh warning
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // no-store: không cache response API (có chứa khoá giải mã và dữ liệu nhạy cảm)
  'Cache-Control': 'no-store',
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// HAI cơ chế, tự chọn theo biến môi trường REDIS_URL:
//   1) CÓ REDIS_URL → đếm trên Redis (dùng chung cho MỌI tiến trình/máy). Bắt buộc khi
//      chạy PM2 cluster nhiều instance: nếu mỗi instance đếm riêng thì 1 IP có thể vượt
//      giới hạn gấp N lần (N = số instance).
//   2) KHÔNG có REDIS_URL, hoặc Redis lỗi → quay về Map in-memory bên dưới (mỗi instance
//      một bộ đếm riêng). Đây là FAIL-OPEN có chủ ý — giống triết lý ở usage.ts: thà rate
//      limit lỏng hơn một chút còn hơn làm hỏng request của người dùng thật.
//
// LƯU Ý khi có Cloudflare trước VPS (xem docs/cloudflare-setup.md): IP lấy từ
// header X-Forwarded-For (clientIp ở mỗi handler api/*.ts) CHỈ đáng tin nếu Nginx
// đã cấu hình module real_ip để chỉ chấp nhận header này từ đúng dải IP Cloudflare
// (nginx/cloudflare-realip.conf, sinh bởi scripts/update-cloudflare-ips.sh). Thiếu
// bước đó, ai gọi thẳng vào IP VPS có thể tự chèn X-Forwarded-For giả để né rate
// limit này hoàn toàn.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Cửa sổ đếm: 60 giây (giữ nguyên ý nghĩa `maxPerMin` — số request tối đa mỗi phút).
const WINDOW_MS = 60_000

// Script Lua: tăng bộ đếm, và CHỈ khi vừa tạo key mới (count == 1) mới đặt hạn dùng.
// Nhờ vậy cửa sổ 60s tính từ request đầu tiên, không bị "gia hạn" mỗi lần gọi.
const RATE_LIMIT_LUA = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return count
`

// Client Redis dùng chung, khởi tạo lười (chỉ tạo ở lần gọi đầu có REDIS_URL).
// `null` = đã kiểm tra và không dùng Redis; `undefined` = chưa kiểm tra lần nào.
let redisClient: Redis | null | undefined
let warnedRedisFallback = false

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient

  const url = process.env.REDIS_URL
  if (!url) {
    redisClient = null // Không cấu hình Redis → dùng Map in-memory
    return null
  }

  try {
    redisClient = new Redis(url, {
      // Không thử lại vô hạn: request phải trả lời nhanh, hỏng thì rơi về Map.
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2000,
    })
    // Bắt sự kiện 'error' để lỗi kết nối nền không làm process crash (unhandled error).
    redisClient.on('error', (err: Error) => warnRedisFallbackOnce(err))
  } catch (err) {
    warnRedisFallbackOnce(err)
    redisClient = null
  }
  return redisClient
}

// Chỉ log cảnh báo MỘT lần — tránh spam log mỗi request khi Redis chết.
function warnRedisFallbackOnce(err: unknown): void {
  if (warnedRedisFallback) return
  warnedRedisFallback = true
  const message = err instanceof Error ? err.message : String(err)
  console.warn(
    `[Security] Redis lỗi (${message}) — rate limit tạm dùng Map in-memory mỗi instance.`,
  )
}

// Trả về true nếu được phép, false nếu vượt quá giới hạn.
// `bucket` cho phép một IP có NHIỀU bộ đếm riêng biệt — ví dụ tách "tổng số request"
// (kể cả cache HIT, rất rẻ) với "số lần tạo audio mới" (cache MISS, tốn tiền Google TTS).
// Nhờ vậy người dùng phát cả bài học / tra nhiều từ đã cache vẫn mượt, mà chi phí API
// vẫn được giới hạn chặt ở đường tạo mới. Xem cách dùng trong api/tts.ts & api/pronunciation.ts.
export async function checkRateLimit(
  ip: string,
  maxPerMin = 60,
  bucket = 'default',
): Promise<boolean> {
  const key = `${bucket}:${ip}`

  const redis = getRedis()
  if (redis) {
    try {
      // Script Lua chạy nguyên khối trên Redis → INCR và PEXPIRE không bị chen giữa
      // (tránh race: hai request cùng lúc đều thấy key mới và cùng đặt hạn dùng).
      const count = (await redis.eval(RATE_LIMIT_LUA, 1, key, String(WINDOW_MS))) as number
      return count <= maxPerMin
    } catch (err) {
      // Redis hỏng → KHÔNG làm vỡ request, chỉ cảnh báo 1 lần rồi dùng Map in-memory.
      warnRedisFallbackOnce(err)
    }
  }

  return checkRateLimitInMemory(key, maxPerMin)
}

// Phương án dự phòng: bộ đếm cửa sổ 60s trong bộ nhớ tiến trình (cơ chế cũ, giữ nguyên).
function checkRateLimitInMemory(key: string, maxPerMin: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    // Bắt đầu cửa sổ mới (1 phút)
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= maxPerMin) {
    return false // Đã vượt giới hạn
  }

  entry.count++
  return true
}

// ── Auth Validation ───────────────────────────────────────────────────────────
// Đọc session token từ header Authorization: Bearer <token>
// Tra bảng `sessions` trên Postgres tự host (Giai đoạn B — thay Supabase Auth) — trả về
// userId nếu hợp lệ + chưa hết hạn, null nếu không. Xem api/_lib/authService.ts.
//
// SKIP_AUTH=true chỉ dùng khi dev local (phòng khi client chưa gửi token).
// TUYỆT ĐỐI KHÔNG bật SKIP_AUTH trên production!
export async function validateAuth(req: Request): Promise<{ userId: string } | null> {
  // Bypass tạm thời cho môi trường dev — phải tắt trên production.
  // Kiểm tra CẢ NODE_ENV (dùng trên VPS/server.ts) và VERCEL_ENV (dùng trên Vercel):
  // chỉ cần 1 trong 2 báo "production" là khoá bypass lại ngay, không phụ thuộc đang
  // chạy trên nền tảng nào. Trên VPS, server.ts mặc định NODE_ENV='production' khi
  // không set gì — nếu chỉ kiểm tra VERCEL_ENV (luôn undefined trên VPS) thì bypass
  // sẽ vô tình LUÔN bật nếu quên xoá SKIP_AUTH=true trong .env production.
  if (
    process.env.SKIP_AUTH === 'true' &&
    process.env.NODE_ENV !== 'production' &&
    process.env.VERCEL_ENV !== 'production'
  ) {
    console.warn('[Security] SKIP_AUTH=true — CHỈ dùng trong dev, tắt trước khi deploy production!')
    return { userId: 'dev-skip-auth' }
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7).trim()
  if (!token) return null

  try {
    return await validateSessionToken(token)
  } catch {
    return null
  }
}

// ── Content-Type Validation ───────────────────────────────────────────────────
// Kiểm tra request có gửi đúng Content-Type: application/json không.
export function validateContentType(req: Request): boolean {
  const ct = req.headers.get('Content-Type') ?? ''
  return ct.includes('application/json')
}

// ── Security Event Logging ────────────────────────────────────────────────────
// Ghi log sự kiện bảo mật (rate limit bị vượt, auth thất bại, v.v.)
// Trong production nên gửi về dịch vụ log chuyên dụng (Datadog, Sentry...).
export function logSecurityEvent(
  type: string,
  clientIp: string,
  details: Record<string, unknown>,
): void {
  console.warn(`[Security][${type}] ip=${clientIp}`, JSON.stringify(details))
}
