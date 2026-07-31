// api/payment-status.ts — UI poll endpoint này để biết đơn đã trả tiền chưa. SePay KHÔNG
// redirect người dùng về sau khi chuyển khoản (khác PayOS) nên đây là nguồn sự thật duy nhất
// cho màn hình chờ QR (xem docs/research/dac-ta-thanh-toan-2026-07-25.md).
//
// GET /api/payment-status?code=...  (cần đăng nhập; chỉ trả đơn CỦA CHÍNH user đó)

import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  validateAuth,
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from './_lib/security.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'payment-status'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/payment-status' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const code = new URL(req.url).searchParams.get('code')
  if (!code) return jsonResponse({ error: 'Thiếu tham số code' }, 400, allHeaders)

  const pool = getPgPool()
  // Kiểm user_id khớp token — KHÔNG chỉ lọc theo payment_code, nếu không ai đăng nhập cũng dò
  // được trạng thái đơn của người khác (đúng nguyên tắc kỹ thuật #2, CLAUDE.md mục 4).
  const { rows } = await pool.query<{
    status: string
    plan: string
    cycle: string
    amount_vnd: number
    expires_at: Date
  }>(
    `select status, plan, cycle, amount_vnd, expires_at from public.payments
     where payment_code = $1 and user_id = $2`,
    [code, auth.userId],
  )
  const row = rows[0]
  if (!row) return jsonResponse({ error: 'Không tìm thấy đơn' }, 404, allHeaders)

  return jsonResponse(
    {
      status: row.status,
      plan: row.plan,
      cycle: row.cycle,
      amountVnd: row.amount_vnd,
      expiresAt: new Date(row.expires_at).toISOString(),
    },
    200,
    allHeaders,
  )
}

export const config = { runtime: 'edge' }
