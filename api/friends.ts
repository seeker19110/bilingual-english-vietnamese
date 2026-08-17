// api/friends.ts — Kết bạn qua mã/URL/QR cá nhân.
//
// GET    /api/friends                    → { code, friends: [{id,name}] }  (mã của mình + ds bạn)
// GET    /api/friends?lookup=CODE        → { user: {id,name} } | { user: null } (xem trước khi kết bạn)
// POST   /api/friends  { code }          → kết bạn bằng mã người khác (idempotent)
// DELETE /api/friends?userId=ID          → huỷ kết bạn

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
import {
  ensureFriendCode,
  findUserByFriendCode,
  addFriendByCode,
  listFriends,
  removeFriend,
} from './_lib/friends.js'

const AddFriendBodySchema = z.object({
  code: z.string().trim().min(4).max(32),
})

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'friends'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/friends' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const url = new URL(req.url)

  if (req.method === 'GET') {
    const lookup = url.searchParams.get('lookup')
    if (lookup) {
      const user = await findUserByFriendCode(lookup)
      return jsonResponse({ user }, 200, allHeaders)
    }
    const [code, friends] = await Promise.all([
      ensureFriendCode(auth.userId),
      listFriends(auth.userId),
    ])
    return jsonResponse({ code, friends }, 200, allHeaders)
  }

  if (req.method === 'POST') {
    const parsedBody = await readJsonBody(req)
    if (!parsedBody.ok)
      return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
    const result = validateBody(AddFriendBodySchema, parsedBody.raw)
    if (!result.ok)
      return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)

    const added = await addFriendByCode(auth.userId, result.data.code)
    if (!added.ok) {
      const message =
        added.reason === 'self_add'
          ? 'Không thể tự kết bạn với chính mình'
          : 'Mã kết bạn không tồn tại'
      return jsonResponse({ error: message, reason: added.reason }, 400, allHeaders)
    }
    return jsonResponse(
      { ok: true, alreadyFriends: added.alreadyFriends, friend: added.friend },
      200,
      allHeaders,
    )
  }

  if (req.method === 'DELETE') {
    const otherUserId = url.searchParams.get('userId')
    if (!otherUserId) return jsonResponse({ error: 'Thiếu userId' }, 400, allHeaders)
    await removeFriend(auth.userId, otherUserId)
    return jsonResponse({ ok: true }, 200, allHeaders)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
}

export const config = { runtime: 'edge' }
