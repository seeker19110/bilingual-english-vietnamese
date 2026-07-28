// api/quests.ts — Nhận thưởng nhiệm vụ (quest). Hiện chỉ có 1 nhiệm vụ: "Chia sẻ công khai"
// (xem api/_lib/quests.ts để biết cảnh báo về giới hạn xác minh + cách mở thêm nhiệm vụ mới).
//
// POST /api/quests  body { action: 'claim-share' }   (cần Authorization: Bearer)

import { z } from 'zod'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { claimShareQuest } from './_lib/quests.js'

const BodySchema = z.object({ action: z.literal('claim-share') })

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  // Giới hạn chặt — đây là chỗ CẤP THƯỞNG THẬT (ngày Pro), không phải chỗ đọc dữ liệu thường.
  if (!(await checkRateLimit(clientIp, 10, 'quests'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/quests' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const parsedBody = await readJsonBody(req)
  if (!parsedBody.ok)
    return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
  const result = validateBody(BodySchema, parsedBody.raw)
  if (!result.ok)
    return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)

  const claim = await claimShareQuest(auth.userId)
  if (!claim.ok) return jsonResponse({ error: claim.message }, 400, allHeaders)
  return jsonResponse({ ok: true, rewardDays: claim.rewardDays }, 200, allHeaders)
}

export const config = { runtime: 'edge' }
