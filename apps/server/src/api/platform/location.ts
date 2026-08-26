// api/platform/location.ts — REST cho tính năng "Đi chung" (chia sẻ vị trí thời gian thực).
//
// GET    /api/location                       → { sessions: [...] }  (chuyến còn hiệu lực của tôi)
// GET    /api/location?sessionId=ID          → { state }            (toàn cảnh 1 chuyến)
// POST   /api/location            { name, durationMinutes }        → tạo chuyến
// POST   /api/location?action=join    { inviteCode }               → vào chuyến bằng mã mời
// POST   /api/location?action=position{ sessionId, position }      → gửi vị trí (fallback của WS)
// PATCH  /api/location?action=sharing { sessionId, sharingEnabled, precisionMode }
// PATCH  /api/location                { sessionId, meetPoint|alertRadiusM|extendMinutes|end }
// DELETE /api/location?sessionId=ID          → rời chuyến (xoá luôn vị trí của mình)

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
  CreateSessionBodySchema,
  JoinSessionBodySchema,
  PostPositionBodySchema,
  UpdateSessionBodySchema,
  UpdateSharingBodySchema,
} from '@dhcb/core-contracts/location'
import {
  createSession,
  joinByInviteCode,
  leaveSession,
  listMySessions,
  getSessionState,
  recordPosition,
  updateSession,
  updateSharing,
} from '@dhcb/core-location/locationService'
import { broadcastToSession } from '@dhcb/core-location/wsLocation'

// Nhịp gửi vị trí là 1 lần / ~10s / người, có thể mở nhiều chuyến → trần rộng hơn /api/friends.
const RATE_LIMIT_PER_MINUTE = 120

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, RATE_LIMIT_PER_MINUTE, 'location'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/location' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    const sessionId = url.searchParams.get('sessionId')
    if (sessionId) {
      const state = await getSessionState(sessionId, auth.userId)
      if (!state) return jsonResponse({ error: 'Không có quyền xem chuyến này' }, 403, allHeaders)
      return jsonResponse({ state }, 200, allHeaders)
    }
    return jsonResponse({ sessions: await listMySessions(auth.userId) }, 200, allHeaders)
  }

  if (req.method === 'POST' || req.method === 'PATCH') {
    const parsedBody = await readJsonBody(req)
    if (!parsedBody.ok)
      return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)

    if (req.method === 'POST' && action === 'join') {
      const result = validateBody(JoinSessionBodySchema, parsedBody.raw)
      if (!result.ok)
        return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
      const joined = await joinByInviteCode(auth.userId, result.data.inviteCode)
      if (!joined.ok) {
        const message =
          joined.reason === 'expired' ? 'Chuyến đã kết thúc hoặc hết hạn' : 'Mã mời không tồn tại'
        return jsonResponse({ error: message, reason: joined.reason }, 400, allHeaders)
      }
      const state = await getSessionState(joined.sessionId, auth.userId)
      await broadcastToSession(joined.sessionId, { type: 'state', state: state! })
      return jsonResponse({ ok: true, state }, 200, allHeaders)
    }

    if (req.method === 'POST' && action === 'position') {
      const result = validateBody(PostPositionBodySchema, parsedBody.raw)
      if (!result.ok)
        return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
      const member = await recordPosition(result.data.sessionId, auth.userId, result.data.position)
      // Không có quyền HOẶC đang tắt chia sẻ → trả ok:false, KHÔNG phân biệt hai ca để không
      // giúp người ngoài dò xem sessionId nào có thật.
      if (!member) return jsonResponse({ ok: false }, 200, allHeaders)
      await broadcastToSession(result.data.sessionId, {
        type: 'position',
        sessionId: result.data.sessionId,
        member,
      })
      return jsonResponse({ ok: true }, 200, allHeaders)
    }

    if (req.method === 'POST') {
      const result = validateBody(CreateSessionBodySchema, parsedBody.raw)
      if (!result.ok)
        return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
      const created = await createSession(
        auth.userId,
        result.data.name,
        result.data.durationMinutes,
      )
      if (!created.ok) {
        return jsonResponse(
          {
            error: 'Bạn đang mở quá nhiều chuyến — kết thúc bớt rồi tạo mới',
            reason: created.reason,
          },
          400,
          allHeaders,
        )
      }
      const state = await getSessionState(created.sessionId, auth.userId)
      return jsonResponse({ ok: true, state }, 200, allHeaders)
    }

    // PATCH
    if (action === 'sharing') {
      const result = validateBody(UpdateSharingBodySchema, parsedBody.raw)
      if (!result.ok)
        return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
      const ok = await updateSharing(result.data.sessionId, auth.userId, {
        sharingEnabled: result.data.sharingEnabled,
        precisionMode: result.data.precisionMode,
      })
      if (!ok) return jsonResponse({ error: 'Không có quyền' }, 403, allHeaders)
      const state = await getSessionState(result.data.sessionId, auth.userId)
      await broadcastToSession(result.data.sessionId, { type: 'state', state: state! })
      return jsonResponse({ ok: true, state }, 200, allHeaders)
    }

    const result = validateBody(UpdateSessionBodySchema, parsedBody.raw)
    if (!result.ok)
      return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
    const ok = await updateSession(result.data.sessionId, auth.userId, {
      meetPoint: result.data.meetPoint,
      alertRadiusM: result.data.alertRadiusM,
      extendMinutes: result.data.extendMinutes,
      end: result.data.end,
    })
    if (!ok) return jsonResponse({ error: 'Chỉ chủ chuyến mới sửa được' }, 403, allHeaders)
    if (result.data.end) {
      await broadcastToSession(result.data.sessionId, {
        type: 'session_ended',
        sessionId: result.data.sessionId,
      })
      return jsonResponse({ ok: true }, 200, allHeaders)
    }
    const state = await getSessionState(result.data.sessionId, auth.userId)
    await broadcastToSession(result.data.sessionId, { type: 'state', state: state! })
    return jsonResponse({ ok: true, state }, 200, allHeaders)
  }

  if (req.method === 'DELETE') {
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) return jsonResponse({ error: 'Thiếu sessionId' }, 400, allHeaders)
    const parsed = z.string().uuid().safeParse(sessionId)
    if (!parsed.success) return jsonResponse({ error: 'sessionId không hợp lệ' }, 400, allHeaders)
    await leaveSession(sessionId, auth.userId)
    await broadcastToSession(sessionId, { type: 'member_left', sessionId, userId: auth.userId })
    return jsonResponse({ ok: true }, 200, allHeaders)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
}

export const config = { runtime: 'edge' }
