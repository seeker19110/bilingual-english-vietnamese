// api/chat.ts — REST endpoints cho user-to-user chat.
// WebSocket cho real-time messaging — xem packages/core-chat/wsHandler.ts
//
// Endpoints:
//   GET  /api/chat/rooms              — danh sách rooms của user
//   POST /api/chat/rooms              — tạo/lấy DM room với user khác
//   GET  /api/chat/messages?roomId=&cursor=&limit= — lịch sử messages
//   GET  /api/chat/users/search?q=    — tìm user theo nickname/tên
//   DELETE /api/chat/messages/:id     — xóa message của mình

import {
  validateAuth,
  checkRateLimit,
  getCorsHeaders,
  SECURITY_HEADERS,
} from '../packages/core-auth/security.js'
// checkRateLimit signature: (ip: string, maxPerMin?: number, bucket?: string) => Promise<boolean>
import {
  createOrGetDmRoom,
  getMessages,
  getRooms,
  searchUsers,
  deleteMessage,
} from '../packages/core-chat/chatService.js'
import {
  CreateRoomBodySchema,
  GetMessagesQuerySchema,
  SearchUsersQuerySchema,
} from '../packages/core-contracts/chat.js'

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
  })
}

function err(message: string, status: number, code?: string): Response {
  return json({ error: message, ...(code ? { code } : {}) }, status)
}

export default async function chatHandler(req: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const pathname = url.pathname

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const auth = await validateAuth(req)
  if (!auth) return err('Chưa đăng nhập', 401)

  const { userId } = auth

  // Rate limit: 60 requests/min per user (key = clientIp, bucket = chat:api:{userId})
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await checkRateLimit(clientIp, 60, `chat:api:${userId}`)
  if (!allowed) return err('Quá nhiều yêu cầu, vui lòng thử lại sau.', 429)

  try {
    // ── GET /api/chat/rooms ─────────────────────────────────────────────────────
    if (pathname === '/api/chat/rooms' && req.method === 'GET') {
      const rooms = await getRooms(userId)
      return json({ rooms })
    }

    // ── POST /api/chat/rooms ────────────────────────────────────────────────────
    if (pathname === '/api/chat/rooms' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const parsed = CreateRoomBodySchema.safeParse(body)
      if (!parsed.success) {
        return err('Dữ liệu không hợp lệ: ' + parsed.error.message, 400)
      }

      if (parsed.data.targetUserId === userId) {
        return err('Không thể tạo phòng chat với chính mình.', 400)
      }

      const roomId = await createOrGetDmRoom(userId, parsed.data.targetUserId)
      return json({ roomId })
    }

    // ── GET /api/chat/messages ──────────────────────────────────────────────────
    if (pathname === '/api/chat/messages' && req.method === 'GET') {
      const queryObj = Object.fromEntries(url.searchParams.entries())
      const parsed = GetMessagesQuerySchema.safeParse(queryObj)
      if (!parsed.success) {
        return err('Tham số không hợp lệ: ' + parsed.error.message, 400)
      }

      const messages = await getMessages(
        parsed.data.roomId,
        userId,
        parsed.data.cursor,
        parsed.data.limit,
      )
      return json({ messages })
    }

    // ── GET /api/chat/users/search ──────────────────────────────────────────────
    if (pathname === '/api/chat/users/search' && req.method === 'GET') {
      const queryObj = Object.fromEntries(url.searchParams.entries())
      const parsed = SearchUsersQuerySchema.safeParse(queryObj)
      if (!parsed.success) {
        return err('Tham số không hợp lệ: ' + parsed.error.message, 400)
      }

      const users = await searchUsers(parsed.data.q, userId)
      return json({ users })
    }

    // ── DELETE /api/chat/messages/:id ──────────────────────────────────────────
    const deleteMatch = pathname.match(/^\/api\/chat\/messages\/([0-9a-f-]{36})$/)
    if (deleteMatch && req.method === 'DELETE') {
      const messageId = deleteMatch[1]!
      const deleted = await deleteMessage(messageId, userId)
      if (!deleted) return err('Không tìm thấy tin nhắn hoặc bạn không có quyền xóa.', 404)
      return json({ success: true })
    }

    return err('Không tìm thấy endpoint', 404)
  } catch (e) {
    console.error('[chat] Lỗi API:', e)
    return err('Lỗi server nội bộ', 500)
  }
}
