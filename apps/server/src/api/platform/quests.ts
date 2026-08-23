// api/quests.ts — Nhiệm vụ (quest): xem trạng thái + nhận thưởng. 4 nhiệm vụ hiện có, xem
// api/_lib/quests.ts để biết chi tiết từng nhiệm vụ + cảnh báo về mức độ xác minh được.
//
// GET  /api/quests                                            (cần đăng nhập — cookie)
// POST /api/quests  body { action: 'claim-share' }
// POST /api/quests  body { action: 'claim-streak' }
// POST /api/quests  body { action: 'claim-cefr-exam', level }

import { z } from 'zod'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'
import {
  claimShareQuest,
  claimStreakQuest,
  claimCefrExamQuest,
  getQuestsStatus,
  CEFR_EXAM_LEVELS,
} from '../_lib/quests.js'

const BodySchema = z.union([
  z.object({ action: z.literal('claim-share') }),
  z.object({ action: z.literal('claim-streak') }),
  z.object({ action: z.literal('claim-cefr-exam'), level: z.enum(CEFR_EXAM_LEVELS) }),
])

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  // Giới hạn chặt — đây là chỗ CẤP THƯỞNG THẬT (ngày Pro), không phải chỗ đọc dữ liệu thường.
  if (!(await checkRateLimit(clientIp, 20, 'quests'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/quests' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  if (req.method === 'GET') {
    const status = await getQuestsStatus(auth.userId)
    return jsonResponse(status, 200, allHeaders)
  }

  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const parsedBody = await readJsonBody(req)
  if (!parsedBody.ok)
    return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
  const result = validateBody(BodySchema, parsedBody.raw)
  if (!result.ok)
    return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)

  const claim =
    result.data.action === 'claim-share'
      ? await claimShareQuest(auth.userId)
      : result.data.action === 'claim-streak'
        ? await claimStreakQuest(auth.userId)
        : await claimCefrExamQuest(auth.userId, result.data.level)

  if (!claim.ok) return jsonResponse({ error: claim.message }, 400, allHeaders)
  return jsonResponse({ ok: true, rewardDays: claim.rewardDays }, 200, allHeaders)
}

export const config = { runtime: 'edge' }
