// api/payment-webhook.ts — SePay gọi endpoint này khi có tiền vào tài khoản ngân hàng. KHÔNG
// có Bearer token của app (SePay không đăng nhập) — xác thực bằng header
// `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>` (xem api/_lib/sepay.ts verifySepayApiKey).
//
// Đọc kỹ trước khi sửa: docs/research/dac-ta-thanh-toan-2026-07-25.md mục "API cần thêm" +
// "Ca lệch" + "Bảo mật". SePay retry tới 7 lần trong 5 giờ cho CÙNG một giao dịch nếu response
// không phải {"success":true} — mọi nhánh xử lý xong đều PHẢI trả success:true, kể cả khi
// không khớp được đơn nào (khớp thất bại là lỗi phía người dùng/dữ liệu, không phải lỗi ta cần
// SePay lặp lại).

import { z } from 'zod'
import { getPgPool } from './_lib/pgPool.js'
import { logSecurityEvent } from './_lib/security.js'
import { extractPaymentCode, verifySepayApiKey } from './_lib/sepay.js'
import { grantPlanDays } from './_lib/planGrant.js'
import { CYCLE_DAYS, type PayableCycle } from './_lib/prices.js'
import { readJsonBody, validateBody } from './_lib/validation.js'
import { jsonResponse } from './_lib/http.js'

const WebhookSchema = z.object({
  id: z.union([z.string(), z.number()]),
  transferType: z.string().optional(),
  transferAmount: z.number(),
  code: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
})

function ok(headers: Record<string, string>) {
  return jsonResponse({ success: true }, 200, headers)
}

export default async function handler(req: Request): Promise<Response> {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, headers)

  const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY
  if (!expectedKey || !verifySepayApiKey(req.headers.get('authorization'), expectedKey)) {
    logSecurityEvent('SEPAY_WEBHOOK_UNAUTHORIZED', 'sepay', {})
    return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  }

  const bodyResult = await readJsonBody(req)
  if (!bodyResult.ok) return ok(headers) // body hỏng không phải ca ta xử lý được — không lặp lại
  const parsed = validateBody(WebhookSchema, bodyResult.raw)
  if (!parsed.ok) {
    logSecurityEvent('SEPAY_WEBHOOK_BAD_PAYLOAD', 'sepay', { raw: bodyResult.raw })
    return ok(headers)
  }
  const { id, transferType, transferAmount, code, content } = parsed.data
  const txnId = String(id)

  // Tiền RA khỏi tài khoản không liên quan tới thanh toán gói.
  if (transferType && transferType !== 'in') return ok(headers)

  const paymentCode = extractPaymentCode(code) ?? extractPaymentCode(content)
  if (!paymentCode) {
    logSecurityEvent('SEPAY_WEBHOOK_UNMATCHED', 'sepay', { txnId, transferAmount })
    return ok(headers)
  }

  const pool = getPgPool()
  const { rows } = await pool.query<{
    id: string
    user_id: string
    plan: 'pro' | 'vip'
    cycle: PayableCycle
    amount_vnd: number
    status: string
    years: number
  }>(
    'select id, user_id, plan, cycle, amount_vnd, status, years from public.payments where payment_code = $1',
    [paymentCode],
  )
  const payment = rows[0]
  if (!payment) {
    logSecurityEvent('SEPAY_WEBHOOK_UNMATCHED', 'sepay', { txnId, paymentCode, transferAmount })
    return ok(headers)
  }
  if (payment.status === 'paid') return ok(headers) // đã xử lý — idempotent, không log lỗi

  if (transferAmount < payment.amount_vnd) {
    // Chuyển thiếu: KHÔNG cấp gói, giữ 'pending' để admin đối chiếu tay + người dùng có thể
    // chuyển bù. Không đánh dấu provider_txn_id — nếu người dùng chuyển đúng tiếp theo, đơn
    // này vẫn khớp được (xem mục "Ca lệch" trong đặc tả).
    logSecurityEvent('SEPAY_PAYMENT_INSUFFICIENT', 'sepay', {
      paymentId: payment.id,
      txnId,
      expected: payment.amount_vnd,
      got: transferAmount,
    })
    return ok(headers)
  }

  try {
    // WHERE status='pending' là chốt CHỐNG TRÙNG chính: 2 webhook song song cho cùng đơn chỉ
    // đúng 1 cái thấy rowCount=1 (Postgres tự khoá dòng khi UPDATE). UNIQUE trên
    // provider_txn_id là lớp chống trùng THỨ HAI cho ca hiếm hơn: cùng txnId khớp nhầm 2 đơn.
    const { rowCount, rows: updated } = await pool.query<{
      user_id: string
      plan: 'pro' | 'vip'
      cycle: PayableCycle
      years: number
    }>(
      `update public.payments set status = 'paid', paid_at = now(), provider_txn_id = $2
       where id = $1 and status = 'pending'
       returning user_id, plan, cycle, years`,
      [payment.id, txnId],
    )
    const won = updated[0]
    if (!rowCount || !won) return ok(headers) // race: request khác vừa xử lý xong

    // years > 1 CHỈ có ý nghĩa với cycle='year' (mua nhiều năm liền — xem api/checkout.ts).
    const grantDays = CYCLE_DAYS[won.cycle] * (won.cycle === 'year' ? Math.max(1, won.years) : 1)
    await grantPlanDays(won.user_id, won.plan, grantDays)
    logSecurityEvent('SEPAY_PAYMENT_PAID', 'sepay', {
      paymentId: payment.id,
      userId: won.user_id,
      plan: won.plan,
      cycle: won.cycle,
      txnId,
    })
  } catch (err) {
    if ((err as { code?: string }).code === '23505') return ok(headers) // txnId trùng — đã xử lý
    throw err
  }

  return ok(headers)
}

export const config = { runtime: 'edge' }
