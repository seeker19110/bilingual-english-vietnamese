// api/payment-history.ts — Lịch sử đơn thanh toán của chính user đang đăng nhập (Profile.tsx).
//
// GET /api/payment-history  (cần đăng nhập; tự lọc user_id khớp token)

import { getPgPool } from '../core-db/pgPool.js'
import {
  validateAuth,
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from '../core-auth/security.js'
import { jsonResponse, getClientIp } from '../../api/_lib/http.js'

const HISTORY_LIMIT = 50

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 20, 'payment-history'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/payment-history' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const pool = getPgPool()
  const { rows } = await pool.query<{
    plan: string
    cycle: string
    amount_vnd: number
    status: string
    created_at: Date
    paid_at: Date | null
  }>(
    `select plan, cycle, amount_vnd, status, created_at, paid_at from public.payments
     where user_id = $1 order by created_at desc limit $2`,
    [auth.userId, HISTORY_LIMIT],
  )

  return jsonResponse(
    {
      payments: rows.map((r) => ({
        plan: r.plan,
        cycle: r.cycle,
        amountVnd: r.amount_vnd,
        status: r.status,
        createdAt: new Date(r.created_at).toISOString(),
        paidAt: r.paid_at ? new Date(r.paid_at).toISOString() : null,
      })),
    },
    200,
    allHeaders,
  )
}

export const config = { runtime: 'edge' }
