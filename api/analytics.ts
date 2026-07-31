// api/analytics.ts — Analytics tự viết (KHÔNG dùng script bên thứ 3 như Google Analytics —
// tránh vấn đề cookie/GDPR/CSP, khớp triết lý "không tin client" của dự án). Đo hiệu quả
// các kênh marketing (landing page, chia sẻ, mời bạn...) sắp triển khai.
//
// POST /api/analytics  body { event, refCode?, utmSource?, path? } → ghi 1 dòng vào
// bảng analytics_events (migration 0006). Auth TUỲ CHỌN — phải ghi được cả khi khách
// CHƯA đăng nhập (vd xem landing page trước khi đăng ký); validateAuth() tự trả null
// nếu không có/token không hợp lệ, không hề chặn request trong trường hợp đó.
//
// KHÔNG có GET công khai trả dữ liệu tổng hợp — tránh lộ thông tin, để dành cho trang
// admin ở hạng mục sau.

import { z } from 'zod'
import { getPgPool } from '../packages/core-db/pgPool.js'
import { getCorsHeaders, SECURITY_HEADERS, checkRateLimit, validateAuth } from './_lib/security.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

// Whitelist cố định — KHÔNG nhận chuỗi tự do để tránh spam bảng dữ liệu rác.
const EVENT_TYPES = [
  'landing_view',
  'cta_click',
  'signup',
  'first_session_done',
  'share_click',
  'day2_return',
] as const

const AnalyticsSchema = z.object({
  event: z.enum(EVENT_TYPES),
  refCode: z.string().max(100).optional(),
  utmSource: z.string().max(100).optional(),
  path: z.string().max(100).optional(),
})

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  // Rate limit theo IP — ngưỡng vừa phải vì endpoint này gọi thường xuyên từ UI (mỗi lượt
  // xem landing/click), không cần chặt như /api/auth.
  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 120, 'analytics'))) {
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const parsedBody = await readJsonBody(req)
  if (!parsedBody.ok)
    return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
  const result = validateBody(AnalyticsSchema, parsedBody.raw)
  if (!result.ok)
    return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
  const e = result.data

  // Auth KHÔNG bắt buộc — thử lấy userId, không có/không hợp lệ thì ghi user_id = null,
  // KHÔNG trả 401 (khách chưa đăng nhập vẫn phải track được, vd xem landing page).
  const auth = await validateAuth(req)

  const pool = getPgPool()
  await pool.query(
    `insert into public.analytics_events (event, user_id, ref_code, utm_source, path)
     values ($1, $2, $3, $4, $5)`,
    [e.event, auth?.userId ?? null, e.refCode ?? null, e.utmSource ?? null, e.path ?? null],
  )

  return jsonResponse({ ok: true }, 200, allHeaders)
}
