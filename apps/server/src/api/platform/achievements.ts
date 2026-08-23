// api/achievements.ts — Xem trạng thái + nhận thưởng HUY HIỆU & MỐC (migration 0026). Khác
// api/quests.ts (nhiệm vụ LẶP LẠI theo cooldown) — mỗi huy hiệu ở đây chỉ nhận thưởng ĐÚNG 1
// LẦN/tài khoản. Xem api/_lib/achievementRewards.ts để biết cách xác minh "đã đạt" (server tự
// tính lại, không tin danh sách client gửi lên).
//
// GET  /api/achievements                                      (cần đăng nhập — cookie)
// POST /api/achievements  body { achievementId }

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
  getAchievementsStatus,
  claimAchievementReward,
  ACHIEVEMENT_IDS,
} from '../_lib/achievementRewards.js'

const BodySchema = z.object({ achievementId: z.enum(ACHIEVEMENT_IDS) })

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  // Giới hạn chặt — đây cũng là chỗ CẤP THƯỞNG THẬT (ngày Pro/VIP), giống api/quests.ts.
  if (!(await checkRateLimit(clientIp, 20, 'achievements'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/achievements' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  if (req.method === 'GET') {
    const items = await getAchievementsStatus(auth.userId)
    return jsonResponse({ items }, 200, allHeaders)
  }

  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const parsedBody = await readJsonBody(req)
  if (!parsedBody.ok)
    return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
  const result = validateBody(BodySchema, parsedBody.raw)
  if (!result.ok)
    return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)

  const claim = await claimAchievementReward(auth.userId, result.data.achievementId)
  if (!claim.ok) return jsonResponse({ error: claim.message }, 400, allHeaders)
  logSecurityEvent('ACHIEVEMENT_REWARD_CLAIMED', clientIp, {
    userId: auth.userId,
    achievementId: result.data.achievementId,
  })
  return jsonResponse(
    { ok: true, rewardDays: claim.rewardDays, rewardPlan: claim.rewardPlan },
    200,
    allHeaders,
  )
}

export const config = { runtime: 'edge' }
