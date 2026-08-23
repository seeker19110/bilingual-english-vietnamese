// api/chat.ts — REST cho chat 1-1 (lịch sử/room list). Real-time (gửi/nhận tin nhắn, typing,
// presence) đi qua WebSocket — xem packages/core-chat/wsHandler.ts, mount ở server.ts.
// Theo đúng khuôn 1-endpoint-nhiều-method của các API khác trong repo (vd api/friends.ts) thay
// vì nhiều path con — server.ts hiện không có wildcard route.
//
// GET    /api/chat                                → danh sách phòng (bạn chat + tin nhắn cuối)
// GET    /api/chat?roomId=&cursor=&limit=          → lịch sử tin nhắn 1 phòng (phân trang cursor)
// POST   /api/chat  { targetUserId }               → tạo/lấy phòng DM (CHỈ với bạn bè)
// DELETE /api/chat?messageId=                       → xoá tin nhắn của mình (soft delete)

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
  createOrGetDmRoom,
  getMessages,
  getRooms,
  deleteMessage,
} from '@dhcb/core-chat/chatService'
import { CreateRoomBodySchema, GetMessagesQuerySchema } from '@dhcb/core-contracts/chat'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'chat'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/chat' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const url = new URL(req.url)

  if (req.method === 'GET') {
    const roomId = url.searchParams.get('roomId')
    if (!roomId) {
      const rooms = await getRooms(auth.userId)
      return jsonResponse({ rooms }, 200, allHeaders)
    }

    const parsed = GetMessagesQuerySchema.safeParse({
      roomId,
      cursor: url.searchParams.get('cursor') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })
    if (!parsed.success) return jsonResponse({ error: 'Query không hợp lệ' }, 400, allHeaders)

    const result = await getMessages(
      parsed.data.roomId,
      auth.userId,
      parsed.data.limit,
      parsed.data.cursor,
    )
    if (!result.ok)
      return jsonResponse({ error: 'Bạn không phải thành viên phòng này' }, 403, allHeaders)
    return jsonResponse({ messages: result.messages }, 200, allHeaders)
  }

  if (req.method === 'POST') {
    const parsedBody = await readJsonBody(req)
    if (!parsedBody.ok)
      return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
    const result = validateBody(CreateRoomBodySchema, parsedBody.raw)
    if (!result.ok)
      return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)

    const room = await createOrGetDmRoom(auth.userId, result.data.targetUserId)
    if (!room.ok) {
      const message =
        room.reason === 'self_chat'
          ? 'Không thể tự nhắn tin cho chính mình'
          : 'Chỉ chat được với bạn bè'
      return jsonResponse({ error: message, reason: room.reason }, 400, allHeaders)
    }
    return jsonResponse({ roomId: room.roomId }, 200, allHeaders)
  }

  if (req.method === 'DELETE') {
    const messageId = url.searchParams.get('messageId')
    if (!messageId) return jsonResponse({ error: 'Thiếu messageId' }, 400, allHeaders)
    const deleted = await deleteMessage(messageId, auth.userId)
    if (!deleted)
      return jsonResponse(
        { error: 'Không xoá được (không tồn tại/không phải của bạn)' },
        404,
        allHeaders,
      )
    return jsonResponse({ ok: true }, 200, allHeaders)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
}

export const config = { runtime: 'edge' }
