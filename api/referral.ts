// api/referral.ts — Mời bạn (referral). Thưởng bằng NGÀY GÓI PRO, không phải tiền.
//
// GET  /api/referral                       → { code, rewardedCount, pendingCount, maxRewarded, rewardDays }
// POST /api/referral  body { code }        → ghi nhận "tôi được mời bởi mã này" (gọi sau khi đăng ký)
//
// Cả 2 đều CẦN đăng nhập. Việc trao thưởng KHÔNG nằm ở đây — chỉ xảy ra khi người được mời
// hoàn thành phiên học thật (api/history.ts gọi rewardReferralIfEligible), để tạo tài khoản ảo
// hàng loạt không ăn được thưởng ngay. Xem api/_lib/referral.ts.

import { z } from 'zod'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { claimReferral, getReferralStats } from './_lib/referral.js'

const ClaimSchema = z.object({
  // Mã 6 ký tự chữ+số (xem CODE_ALPHABET trong _lib/referral.ts) — chấp nhận cả chữ thường,
  // phía dưới tự chuẩn hoá hoa/thường.
  code: z
    .string()
    .trim()
    .min(4)
    .max(12)
    .regex(/^[a-zA-Z0-9]+$/, 'Mã mời chỉ gồm chữ và số'),
  // Dấu vân tay thiết bị (SHA-256 hex) — chống cày thưởng trên cùng máy. Tuỳ chọn: trình duyệt
  // không hỗ trợ crypto.subtle sẽ gửi thiếu, server vẫn ghi nhận lời mời bình thường.
  deviceHash: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{64}$/, 'Mã thiết bị không hợp lệ')
    .optional(),
})

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'referral'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/referral' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  if (req.method === 'GET') {
    const stats = await getReferralStats(auth.userId)
    return jsonResponse(stats, 200, allHeaders)
  }

  if (req.method === 'POST') {
    const parsedBody = await readJsonBody(req)
    if (!parsedBody.ok)
      return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)

    const parsed = validateBody(ClaimSchema, parsedBody.raw)
    if (!parsed.ok)
      return jsonResponse({ error: parsed.error.message }, parsed.error.status, allHeaders)

    const result = await claimReferral(
      auth.userId,
      parsed.data.code,
      parsed.data.deviceHash ?? null,
    )
    if (!result.ok) {
      // Không lộ chi tiết "mã này của ai" — chỉ báo lý do đủ để người dùng hiểu.
      const messages: Record<typeof result.reason, string> = {
        code_not_found: 'Mã mời không tồn tại',
        self_invite: 'Không thể tự mời chính mình',
        already_referred: 'Tài khoản này đã được ghi nhận lời mời trước đó',
      }
      return jsonResponse({ error: messages[result.reason] }, 400, allHeaders)
    }

    return jsonResponse({ ok: true }, 200, allHeaders)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
}

export const config = { runtime: 'edge' }
