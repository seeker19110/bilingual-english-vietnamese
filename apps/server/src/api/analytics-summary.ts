// api/analytics-summary.ts — Cho ADMIN xem tổng hợp sự kiện analytics đã ghi qua /api/analytics.
// Tách riêng khỏi api/analytics.ts (chỉ nhận POST công khai, không auth bắt buộc) vì đây là
// đường ĐỌC cần quyền admin — gộp chung 1 file dễ lẫn giữa "ai cũng ghi được" và "chỉ admin xem
// được".
//
// GET /api/analytics-summary?days=14  (cần đăng nhập — cookie, user phải nằm trong ADMIN_EMAILS)
// Trả về: tổng số theo event trong N ngày gần nhất + số liệu theo ngày cho biểu đồ đơn giản.

import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  validateAuth,
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { getUserById } from '@dhcb/core-auth/authService'
import { isAdminEmail } from '@dhcb/core-auth/adminAuth'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

const DEFAULT_DAYS = 14
const MAX_DAYS = 90

interface DailyRow {
  day: string
  event: string
  count: number
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 20, 'analytics-summary'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/analytics-summary' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const user = await getUserById(auth.userId)
  if (!isAdminEmail(user?.email)) {
    logSecurityEvent('ADMIN_ACCESS_DENIED', clientIp, { path: '/api/analytics-summary' })
    return jsonResponse({ error: 'Chỉ admin mới truy cập được' }, 403, allHeaders)
  }

  const url = new URL(req.url)
  const rawDays = Number(url.searchParams.get('days'))
  const days =
    Number.isFinite(rawDays) && rawDays > 0 ? Math.min(Math.floor(rawDays), MAX_DAYS) : DEFAULT_DAYS

  const pool = getPgPool()
  // Group theo (ngày giờ VN, event) — dùng timezone Asia/Ho_Chi_Minh ngay trong SQL để khớp
  // đúng ranh giới ngày hiển thị cho admin (giờ VN), không phải UTC.
  const { rows } = await pool.query<DailyRow>(
    `select
       to_char(created_at at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') as day,
       event,
       count(*)::int as count
     from public.analytics_events
     where created_at >= now() - ($1 || ' days')::interval
     group by 1, 2
     order by 1 asc`,
    [days],
  )

  const totalsByEvent: Record<string, number> = {}
  for (const row of rows) {
    totalsByEvent[row.event] = (totalsByEvent[row.event] ?? 0) + row.count
  }

  return jsonResponse({ days, daily: rows, totalsByEvent }, 200, allHeaders)
}

export const config = { runtime: 'edge' }
