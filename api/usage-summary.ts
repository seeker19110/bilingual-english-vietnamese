// api/usage-summary.ts — Cho CLIENT (user đã đăng nhập, không cần admin) đọc "còn bao nhiêu
// lượt AI" để hiển thị UI đúng — riêng gói Free giờ dùng kho lượt TUẦN chung (xem
// postgres/migrations/0012_free_weekly_ai_credit.sql + api/_lib/usage.ts), không còn tính
// theo NGÀY/theo TỪNG MODE như Pro/VIP, nên client không tự suy ra được từ dữ liệu local nữa
// — phải hỏi server.
//
// GET /api/usage-summary  (cần Authorization: Bearer)

import { getPgPool } from './_lib/pgPool.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { lookupPlan, FREE_WEEKLY_CAP } from './_lib/usage.js'
import { vnDateStr, weekStartOf } from './_lib/date.js'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'usage-summary'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/usage-summary' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  try {
    const plan = await lookupPlan(auth.userId)

    if (plan !== 'free') {
      // Pro/VIP: UI vẫn hiển thị theo daily_usage + limits như trước (đã đúng, không đổi).
      return jsonResponse(
        { plan, freeWeeklyCredit: null, freeWeeklyCap: FREE_WEEKLY_CAP },
        200,
        allHeaders,
      )
    }

    const pool = getPgPool()
    const weekStart = weekStartOf(vnDateStr())
    // node-pg parse cột kiểu `date` (OID 1082) thành đối tượng Date (UTC nửa đêm) mặc định.
    const { rows } = await pool.query<{ credit: number; week_start: Date }>(
      'select credit, week_start from public.weekly_ai_credit where user_id = $1',
      [auth.userId],
    )
    const row = rows[0]
    // Chưa có dòng nào, hoặc dòng đang lưu thuộc tuần TRƯỚC (chưa được cộng thưởng
    // ngày nào trong tuần hiện tại) → kho hiện tại = 0, KHÔNG phải giá trị cũ còn sót.
    const weekStartStr = row ? row.week_start.toISOString().slice(0, 10) : null
    const freeWeeklyCredit = row && weekStartStr === weekStart ? row.credit : 0

    return jsonResponse({ plan, freeWeeklyCredit, freeWeeklyCap: FREE_WEEKLY_CAP }, 200, allHeaders)
  } catch (err) {
    console.warn('[usage-summary] lỗi đọc kho lượt tuần → fail-open (coi như 0):', err)
    return jsonResponse(
      { plan: 'free', freeWeeklyCredit: 0, freeWeeklyCap: FREE_WEEKLY_CAP },
      200,
      allHeaders,
    )
  }
}
