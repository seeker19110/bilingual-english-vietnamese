// api/checkout.ts — Tạo đơn thanh toán Pro/VIP qua SePay. KHÔNG gọi API ngoài nào: SePay không
// phải cổng trung gian nên không có bước "tạo link thanh toán" — ta tự sinh mã, tự dựng URL QR,
// người dùng chuyển khoản, SePay bắn webhook (api/payment-webhook.ts) khi tiền về.
//
// POST /api/checkout  body { plan: 'pro'|'vip', cycle: '10day'|'month'|'year' }
// Trả { paymentCode, amountVnd, qrUrl, bankAccount, bankName, expiresAt, plan, cycle }

import { z } from 'zod'
import { getPgPool } from './_lib/pgPool.js'
import {
  validateAuth,
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from './_lib/security.js'
import {
  getPlanPrices,
  effectivePrice,
  type PayablePlan,
  type PayableCycle,
} from './_lib/prices.js'
import { generatePaymentCode, buildSepayQrUrl } from './_lib/sepay.js'
import { readJsonBody, validateBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

const CheckoutSchema = z.object({
  plan: z.enum(['pro', 'vip']),
  cycle: z.enum(['10day', 'month', 'year']),
})

// Đơn hết hạn sau 30 phút — đủ thời gian mở app ngân hàng chuyển khoản, không giữ mã QR "treo"
// vô thời hạn (mỗi mã chiếm 1 dòng payments + là bề mặt để dò thử số tiền/mã).
const CHECKOUT_EXPIRES_MS = 30 * 60_000
const MAX_CODE_RETRIES = 5

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 10, 'checkout'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/checkout' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const bodyResult = await readJsonBody(req)
  if (!bodyResult.ok) {
    return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, allHeaders)
  }
  const parsed = validateBody(CheckoutSchema, bodyResult.raw)
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error.message }, parsed.error.status, allHeaders)
  }
  const { plan, cycle } = parsed.data as { plan: PayablePlan; cycle: PayableCycle }

  const bankAccount = process.env.SEPAY_BANK_ACCOUNT
  const bankCode = process.env.SEPAY_BANK_CODE
  if (!bankAccount || !bankCode) {
    // Chưa cấu hình VPS — lỗi hạ tầng, không phải lỗi người dùng. Không để throw ra 500 rỗng.
    console.error('[checkout] Thiếu SEPAY_BANK_ACCOUNT/SEPAY_BANK_CODE trong .env')
    return jsonResponse({ error: 'Thanh toán đang tạm gián đoạn, thử lại sau' }, 503, allHeaders)
  }

  const prices = await getPlanPrices()
  const amountVnd = effectivePrice(prices[plan][cycle])
  const pool = getPgPool()
  const expiresAt = new Date(Date.now() + CHECKOUT_EXPIRES_MS)

  // Mã trùng gần như không thể xảy ra (32^8 khả năng) nhưng UNIQUE index vẫn có thể chặn —
  // thử lại vài lần thay vì trả lỗi cho người dùng vì 1 lần va chạm cực hiếm.
  for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt++) {
    const paymentCode = generatePaymentCode()
    try {
      await pool.query(
        `insert into public.payments (user_id, plan, cycle, amount_vnd, payment_code, expires_at)
         values ($1, $2, $3, $4, $5, $6)`,
        [auth.userId, plan, cycle, amountVnd, paymentCode, expiresAt],
      )
      return jsonResponse(
        {
          paymentCode,
          amountVnd,
          qrUrl: buildSepayQrUrl({ bankAccount, bankCode, amountVnd, paymentCode }),
          bankAccount,
          bankName: bankCode,
          expiresAt: expiresAt.toISOString(),
          plan,
          cycle,
        },
        200,
        allHeaders,
      )
    } catch (err) {
      if ((err as { code?: string }).code === '23505') continue // trùng mã — thử mã khác
      throw err
    }
  }
  console.error('[checkout] Không sinh được mã thanh toán duy nhất sau', MAX_CODE_RETRIES, 'lần')
  return jsonResponse({ error: 'Không tạo được đơn, thử lại' }, 500, allHeaders)
}

export const config = { runtime: 'edge' }
