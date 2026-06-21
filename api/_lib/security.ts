// api/_lib/security.ts — Middleware bảo mật dùng chung cho tất cả API endpoints
// Import file này ở đầu mỗi handler để có CORS, rate limit, auth validation, v.v.

import { getSupabaseAdmin } from './supabaseAdmin'

// ── CORS ──────────────────────────────────────────────────────────────────────
// Đọc danh sách domain cho phép từ biến môi trường ALLOWED_ORIGINS (phân cách bằng dấu phẩy).
// Ví dụ: ALLOWED_ORIGINS=https://myapp.vercel.app,https://myapp.com
// Nếu không có biến này (môi trường dev), cho phép tất cả ('*').
export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
  const origin = req.headers.get('Origin') ?? ''

  let allowOrigin = '*'
  if (allowedOrigins) {
    const list = allowedOrigins.split(',').map(s => s.trim())
    allowOrigin = list.includes(origin) ? origin : list[0]
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  }
}

// ── Security Headers ──────────────────────────────────────────────────────────
// Các header bảo mật chuẩn — luôn đính kèm vào mọi response từ server.
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Dùng in-memory Map — đơn giản, phù hợp với Edge Runtime (mỗi instance riêng).
// Với traffic thật nên dùng Redis (Upstash) để rate limit toàn cụm.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Trả về true nếu được phép, false nếu vượt quá giới hạn
export function checkRateLimit(ip: string, maxPerMin = 60): boolean {
  const now = Date.now()
  const key = ip
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    // Bắt đầu cửa sổ mới (1 phút)
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= maxPerMin) {
    return false // Đã vượt giới hạn
  }

  entry.count++
  return true
}

// ── Auth Validation ───────────────────────────────────────────────────────────
// Đọc JWT từ header Authorization: Bearer <token>
// Xác thực với Supabase — trả về userId nếu hợp lệ, null nếu không.
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
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return null
    return { userId: data.user.id }
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
