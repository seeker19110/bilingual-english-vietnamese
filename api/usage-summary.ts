// api/usage-summary.ts — Cho CLIENT (user đã đăng nhập, không cần admin) đọc "còn bao nhiêu
// lượt AI" để hiển thị UI đúng — riêng gói Free giờ dùng kho lượt CHUNG theo cửa sổ TRƯỢT 7
// ngày liền kề (xem postgres/migrations/0017_free_rolling_credit.sql + api/_lib/usage.ts),
// không còn tính theo NGÀY/theo TỪNG MODE như Pro/VIP, nên client không tự suy ra được từ dữ
// liệu local nữa — phải hỏi server.
//
// GET /api/usage-summary  (cần đăng nhập — cookie)

import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import {
  lookupPlan,
  FREE_WEEKLY_CAP,
  FREE_ROLLING_WINDOW_DAYS,
} from '../packages/core-billing/usage.js'
import { vnDateStr } from '../packages/core-db/date.js'

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
    const today = vnDateStr()
    // Cửa sổ trượt: tổng bonus_earned trừ credits_spent trong FREE_ROLLING_WINDOW_DAYS ngày
    // gần nhất (kể cả hôm nay) — PHẢI cùng công thức với consume_rolling_credit (migration
    // 0017), chỉ khác là KHÔNG khoá dòng (chỉ đọc để hiển thị, không tiêu lượt ở đây).
    const { rows } = await pool.query<{ available: string | null }>(
      `select coalesce(sum(bonus_earned), 0) - coalesce(sum(credits_spent), 0) as available
       from public.free_daily_credit
       where user_id = $1 and day > $2::date - $3::int and day <= $2::date`,
      [auth.userId, today, FREE_ROLLING_WINDOW_DAYS],
    )
    const rawAvailable = Number(rows[0]?.available ?? 0)
    // Kẹp về [0, cap] — sum có thể âm nhất thời trong ca hiếm (đọc giữa lúc ghi), và không
    // bao giờ vượt cap thật (không có cơ chế dồn bù) nhưng kẹp cho chắc, tránh hiện số âm/quá lớn.
    const freeWeeklyCredit = Math.max(0, Math.min(rawAvailable, FREE_WEEKLY_CAP))

    return jsonResponse({ plan, freeWeeklyCredit, freeWeeklyCap: FREE_WEEKLY_CAP }, 200, allHeaders)
  } catch (err) {
    console.warn('[usage-summary] lỗi đọc kho lượt → fail-open (coi như 0):', err)
    return jsonResponse(
      { plan: 'free', freeWeeklyCredit: 0, freeWeeklyCap: FREE_WEEKLY_CAP },
      200,
      allHeaders,
    )
  }
}
