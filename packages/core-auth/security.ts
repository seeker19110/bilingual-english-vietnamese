// api/_lib/security.ts — Middleware bảo mật dùng chung cho tất cả API endpoints
// Import file này ở đầu mỗi handler để có CORS, rate limit, auth validation, v.v.

import { Redis } from 'ioredis'
import { validateSessionToken } from './authService.js'
import { readSessionCookie } from './sessionCookie.js'

// ── CORS ──────────────────────────────────────────────────────────────────────
// Đọc danh sách domain cho phép từ biến môi trường ALLOWED_ORIGINS (phân cách bằng dấu phẩy).
// Ví dụ: ALLOWED_ORIGINS=https://myapp.vercel.app,https://myapp.com
// Nếu không có biến này (môi trường dev), cho phép tất cả ('*').
const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.donghanhcungban.org',
  'https://donghanhcungban.org',
  'https://en-vi.donghanhcungban.org',
  'https://www.donghanhcungban.com',
  'https://donghanhcungban.com',
  'https://en-vi.donghanhcungban.com',
]

export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
  const origin = req.headers.get('Origin') ?? ''

  let allowOrigin = '*'
  let allowCredentials = false
  // FAIL-SAFE (audit 2026-08-24, F9): ở production mà QUÊN đặt ALLOWED_ORIGINS thì trước đây
  // CORS lặng lẽ về '*' — không lỗi, không cảnh báo, chỉ âm thầm mở rộng hơn ý muốn. Bearer
  // token qua header nên chưa khai thác được ngay, nhưng "mặc định an toàn" phải là đóng chứ
  // không phải mở. Dev (không đặt NODE_ENV=production) vẫn giữ '*' cho tiện.
  const list = allowedOrigins
    ? Array.from(
        new Set([
          ...allowedOrigins
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          ...DEFAULT_ALLOWED_ORIGINS,
        ]),
      )
    : process.env.NODE_ENV === 'production'
      ? DEFAULT_ALLOWED_ORIGINS
      : null
  if (list) {
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
  // Cần cho cookie phiên (Bước 3 SSO, sessionCookie.ts) khi app con ở subdomain khác gọi
  // API bằng `fetch(..., { credentials: 'include' })` — Bearer (cơ chế chính) không cần.
  if (allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }
  return headers
}

// ── Security Headers ──────────────────────────────────────────────────────────
// Permissions-Policy: tắt sẵn mọi tính năng trình duyệt app KHÔNG dùng, và giới hạn hai
// tính năng app CÓ dùng về chính origin này:
//   - microphone: ghi âm luyện nói/STT (apps/dhcb/src/lib/audioRecorder.ts, sttServer.ts)
//   - camera: quay video challenge (apps/dhcb/src/lib/challengeRecorder.ts, nhánh video)
// Thiếu header này thì một iframe/script nhúng bên thứ ba vẫn xin được các quyền đó dưới
// danh nghĩa trang mình (audit 2026-08-25, F4).
//
// ĐÚNG MỘT giá trị dùng chung cho cả response API lẫn trang HTML: `wrapEdge` đính header
// sau khi copy response của handler, nên nếu để hai giá trị khác nhau thì giá trị này luôn
// thắng — hai bản chỉ gây hiểu nhầm chứ không siết thêm được gì.
// HSTS: ghim HTTPS 2 năm. Khai báo riêng vì trang HTML/static cũng cần đúng giá trị này
// (applyCommonSecurityHeaders trong apps/server/src/routes.ts) — audit 2026-08-25, F4.
export const HSTS_VALUE = 'max-age=63072000; includeSubDomains; preload'

export const PERMISSIONS_POLICY =
  'accelerometer=(), autoplay=(self), camera=(self), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(self), payment=(), usb=()'

// Các header bảo mật chuẩn — luôn đính kèm vào mọi response từ server.
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  // SAMEORIGIN chứ không phải DENY: CSP của dự án khai `frame-ancestors 'self'` (nguồn chuẩn,
  // hiện đại, trình duyệt ưu tiên hơn X-Frame-Options). Để DENY ở đây là TỰ MÂU THUẪN với
  // chính CSP mình gửi kèm. Thống nhất một giá trị, khớp CSP (audit 2026-08-25, F4).
  'X-Frame-Options': 'SAMEORIGIN',
  // X-XSS-Protection đã deprecated — trình duyệt hiện đại không cần, bỏ đi tránh warning
  'Strict-Transport-Security': HSTS_VALUE,
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': PERMISSIONS_POLICY,
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
// `true` = đang ở trạng thái suy giảm (đã báo). Dùng để log ĐÚNG MỘT lần MỖI LẦN CHUYỂN
// TRẠNG THÁI, không phải một lần rồi câm vĩnh viễn — xem chú thích ở noteRedisDegraded().
let redisDegraded = false
let lastRedisError = ''

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
    redisClient.on('error', (err: Error) => noteRedisDegraded(err))
    redisClient.on('ready', () => noteRedisRecovered())
  } catch (err) {
    noteRedisDegraded(err)
    redisClient = null
  }
  return redisClient
}

// Ghi nhận Redis hỏng. Log MỘT lần mỗi LẦN CHUYỂN TRẠNG THÁI (đang tốt → hỏng), không spam
// mỗi request.
//
// [2026-08-23] Trước đây cờ này latch `true` VĨNH VIỄN sau lần hỏng đầu: Redis chết lại lần sau
// thì log câm, mà Redis sống lại cũng không ai biết — nhìn log không phân biệt nổi "trục trặc
// thoáng qua lúc khởi động" với "Redis chết cả ngày". Nay có cả chiều phục hồi.
function noteRedisDegraded(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err)
  lastRedisError = message
  if (redisDegraded) return
  redisDegraded = true
  console.warn(
    `[Security] Redis lỗi (${message}) — rate limit tạm dùng Map in-memory mỗi instance.`,
  )
}

function noteRedisRecovered(): void {
  if (!redisDegraded) return
  redisDegraded = false
  lastRedisError = ''
  console.warn('[Security] Redis đã hoạt động trở lại — rate limit dùng chung toàn cluster.')
}

/** Trạng thái Redis cho health check (xem apps/server/src/api/platform/healthDeep.ts). */
export function getRedisRuntimeStatus(): {
  configured: boolean
  state: string
  degraded: boolean
  lastError: string
} {
  const configured = Boolean(process.env.REDIS_URL)
  const client = configured ? getRedis() : null
  return {
    configured,
    state: client?.status ?? 'disabled',
    degraded: redisDegraded,
    lastError: lastRedisError,
  }
}

/** PING Redis thật để health check biết nó SỐNG hay CHẾT, không đoán theo biến môi trường. */
export async function pingRedis(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const client = getRedis()
  if (!client) return { ok: false, error: 'REDIS_URL chưa cấu hình' }
  const startedAt = Date.now()
  try {
    await client.ping()
    noteRedisRecovered()
    return { ok: true, latencyMs: Date.now() - startedAt }
  } catch (err) {
    noteRedisDegraded(err)
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// Cảnh báo LÚC KHỞI ĐỘNG (gọi 1 lần từ server.ts) nếu chạy dưới PM2 mà CHƯA đặt
// REDIS_URL — khác với noteRedisDegraded() ở trên (chỉ bắn khi Redis THỰC SỰ lỗi
// kết nối). Thiếu cấu hình REDIS_URL thì getRedis() âm thầm dùng Map in-memory, KHÔNG
// đi qua nhánh lỗi nên không có cảnh báo nào — lỗ hổng im lặng: chạy cluster nhiều
// instance mà quên Redis, rate limit lỏng gấp N lần (N = số instance) mà log không hề
// báo cho tới khi bị lạm dụng thật. `NODE_APP_INSTANCE` do PM2 tự gắn cho MỌI tiến
// trình nó quản lý (kể cả fork mode 1 instance) nên đây là tín hiệu đáng tin để biết
// "đang chạy dưới PM2", không cần biết chính xác số instance.
export function warnIfClusterWithoutRedis(): void {
  const underPm2 = process.env.NODE_APP_INSTANCE !== undefined
  if (underPm2 && !process.env.REDIS_URL) {
    console.warn(
      '[Security] ⚠️  Chạy dưới PM2 nhưng CHƯA đặt REDIS_URL trong .env — nếu ' +
        "ecosystem.config.cjs đang bật cluster mode nhiều instance ('instances' > 1), " +
        'rate limit (bao gồm giới hạn gọi AI trả phí) sẽ lỏng gấp N lần vì mỗi tiến ' +
        'trình đếm riêng bằng Map in-memory. Xem docs/deploy-vps-ubuntu.md mục REDIS_URL.',
    )
  }
}

/**
 * Kiểm Redis NGAY LÚC KHỞI ĐỘNG và in kết quả rõ ràng vào log.
 *
 * VÌ SAO CẦN (sự cố thật 2026-08-23): `REDIS_URL` trên VPS thiếu mật khẩu trong khi Redis bật
 * `requirepass`. Client không bao giờ đạt trạng thái `ready`, nên rate limit chạy Map in-memory
 * LIÊN TỤC — cluster 3 instance nghĩa là hạn mức chống lạm dụng lỏng gấp 3. Lỗi này nằm im
 * nhiều ngày vì log chỉ có vài dòng rải rác, nhìn như trục trặc thoáng qua.
 *
 * Có hàm này thì ngay dòng log khởi động đã nói thẳng Redis sống hay chết, kèm lý do — không
 * phải suy đoán từ log rải rác hay chờ tới lúc bị lạm dụng mới biết.
 *
 * KHÔNG chặn khởi động: gọi kiểu "bắn rồi quên", app vẫn phục vụ bình thường dù Redis hỏng.
 *
 * `pingFn` cho phép test tiêm hàm giả (mặc định dùng pingRedis thật). Cần tiêm vì lời gọi nằm
 * NỘI BỘ trong module này — mock ở tầng module không chặn được lời gọi nội bộ.
 */
export async function reportRedisStatusAtStartup(
  pingFn: () => Promise<{ ok: boolean; latencyMs?: number; error?: string }> = pingRedis,
): Promise<void> {
  if (!process.env.REDIS_URL) return // đã có warnIfClusterWithoutRedis() lo trường hợp này

  const ping = await pingFn()
  if (ping.ok) {
    console.log(`   Redis    : ✅ dùng chung toàn cluster (${ping.latencyMs}ms)`)
    return
  }
  console.warn(
    `   Redis    : ❌ KHÔNG dùng được (${ping.error}) — rate limit đang đếm RIÊNG mỗi ` +
      'instance, hạn mức lỏng gấp N lần. Kiểm REDIS_URL trong .env: Redis có mật khẩu thì ' +
      'URL phải dạng redis://:MẬT_KHẨU@127.0.0.1:6379 (chú ý dấu hai chấm sau //).',
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
  // CHỈ dùng khi kết nối đã sẵn sàng. `enableOfflineQueue: false` nghĩa là gọi lệnh lúc client
  // còn 'connecting'/'reconnecting' sẽ ném ngay "Stream isn't writeable…" — đúng lỗi thấy trong
  // log production sau mỗi lần PM2 restart. Rơi về Map trong cửa sổ kết nối là đúng và im lặng;
  // báo động chỉ dành cho lỗi thật.
  if (redis && redis.status === 'ready') {
    try {
      // Script Lua chạy nguyên khối trên Redis → INCR và PEXPIRE không bị chen giữa
      // (tránh race: hai request cùng lúc đều thấy key mới và cùng đặt hạn dùng).
      const count = (await redis.eval(RATE_LIMIT_LUA, 1, key, String(WINDOW_MS))) as number
      noteRedisRecovered()
      return count <= maxPerMin
    } catch (err) {
      // Redis hỏng → KHÔNG làm vỡ request, chỉ cảnh báo rồi dùng Map in-memory.
      noteRedisDegraded(err)
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
// [Cập nhật Bước 6, docs/adr/0002-quan-ly-nguoi-dung.md] Đọc session token TỪ COOKIE
// `session_token` (packages/core-auth/sessionCookie.ts) — Bearer đã bị bỏ hoàn toàn (trước đó
// dual-accept ở Bước 3). Client vẫn gửi kèm `Authorization: Bearer` (chưa dọn — xem
// authService.ts đầu file) nhưng server KHÔNG còn đọc header đó nữa, cố tình bỏ qua.
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

  const token = readSessionCookie(req) || ''
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
