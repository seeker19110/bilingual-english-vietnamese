// packages/core-chat/wsHandler.ts — WebSocket server handler cho real-time chat.
//
// Gắn vào http.Server từ server.ts qua attachWebSocketHandler(httpServer).
//
// Xác thực: đọc cookie session_token từ HTTP upgrade request headers.
//
// Fan-out:
//   - Nếu REDIS_URL set: publish qua Redis pub/sub → broadcast tới mọi instances
//   - Nếu không: broadcast trực tiếp trong cùng process (single-instance mode)
//
// Heartbeat: client gửi { type: 'ping' } mỗi 30s, server reply { type: 'pong' }
//            và refresh presence TTL. Sau 90s không nhận ping → đóng kết nối.

import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'node:http'
import type { Server as HttpServer } from 'node:http'
import { SESSION_COOKIE_NAME } from '../core-auth/sessionCookie.js'
import { validateSessionToken } from '../core-auth/authService.js'
import { sendMessage as dbSendMessage, markRead } from './chatService.js'
import {
  publishToRoom,
  subscribeToRoom,
  setPresenceOnline,
  setPresenceOffline,
  refreshPresence,
} from './redisChat.js'
import { WsClientEventSchema } from '../core-contracts/chat.js'
import type { WsServerEvent } from '../core-contracts/chat.js'
import { getPgReadPool } from '../core-db/pgPool.js'

// ── In-process connection registry ───────────────────────────────────────────
// Map: userId → Set<WebSocket>
// Dùng để broadcast trực tiếp trong cùng process khi không có Redis
const userConnections = new Map<string, Set<WebSocket>>()

// Map: ws → userId (để cleanup khi disconnect)
const connectionUser = new WeakMap<WebSocket, string>()

// Map: ws → rooms (để unsubscribe Redis khi disconnect)
const connectionRooms = new WeakMap<WebSocket, Set<string>>()

// Map: ws → cleanup functions (Redis unsubscribe)
const connectionCleanups = new WeakMap<WebSocket, (() => void)[]>()

// ── Heartbeat timeout: 90 giây ────────────────────────────────────────────────
const HEARTBEAT_TIMEOUT_MS = 90_000

// ── Send helper ───────────────────────────────────────────────────────────────

function sendToWs(ws: WebSocket, event: WsServerEvent): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event))
  }
}

function sendError(ws: WebSocket, code: string, message: string): void {
  sendToWs(ws, { type: 'error', code, message })
}

// ── Broadcast helpers ─────────────────────────────────────────────────────────

/** Broadcast event tới mọi user trong danh sách userIds (trong process này). */
function broadcastToUsers(userIds: string[], event: WsServerEvent): void {
  for (const uid of userIds) {
    const wss = userConnections.get(uid)
    if (wss) {
      for (const ws of wss) sendToWs(ws, event)
    }
  }
}

/** Lấy danh sách members của room để broadcast. */
async function getRoomMemberIds(roomId: string): Promise<string[]> {
  const pool = getPgReadPool()
  const { rows } = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM chat.room_members WHERE room_id = $1`,
    [roomId],
  )
  return rows.map((r) => r.user_id)
}

// ── Rate limiting đơn giản (in-memory per-ws) ─────────────────────────────────
const wsMessageCount = new WeakMap<WebSocket, { count: number; resetAt: number }>()
const MSG_RATE_LIMIT = 10 // max messages
const MSG_RATE_WINDOW_MS = 10_000 // per 10 seconds

function isRateLimited(ws: WebSocket): boolean {
  const now = Date.now()
  const state = wsMessageCount.get(ws)

  if (!state || now > state.resetAt) {
    wsMessageCount.set(ws, { count: 1, resetAt: now + MSG_RATE_WINDOW_MS })
    return false
  }

  state.count++
  if (state.count > MSG_RATE_LIMIT) return true
  return false
}

// ── Parse cookie từ raw header string ────────────────────────────────────────

function parseCookieHeader(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  for (const pair of cookieHeader.split(';')) {
    const eq = pair.indexOf('=')
    if (eq === -1) continue
    const name = pair.slice(0, eq).trim()
    if (name === SESSION_COOKIE_NAME) {
      return decodeURIComponent(pair.slice(eq + 1).trim())
    }
  }
  return null
}

// ── Handle message từ client ─────────────────────────────────────────────────

async function handleClientMessage(
  ws: WebSocket,
  userId: string,
  rawData: Buffer | ArrayBuffer | Buffer[],
): Promise<void> {
  // Rate limit check
  if (isRateLimited(ws)) {
    sendError(ws, 'RATE_LIMITED', 'Gửi tin nhắn quá nhanh, hãy thử lại sau.')
    return
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawData.toString())
  } catch {
    sendError(ws, 'INVALID_JSON', 'Định dạng JSON không hợp lệ.')
    return
  }

  const result = WsClientEventSchema.safeParse(parsed)
  if (!result.success) {
    sendError(ws, 'INVALID_EVENT', 'Event không hợp lệ.')
    return
  }

  const event = result.data

  switch (event.type) {
    case 'ping': {
      // Refresh presence TTL
      void refreshPresence(userId)
      sendToWs(ws, { type: 'pong' })
      break
    }

    case 'message': {
      try {
        const { message, blocked, moderationMatches } = await dbSendMessage(
          event.roomId,
          userId,
          event.content,
        )

        if (blocked) {
          sendError(
            ws,
            'MODERATION_BLOCKED',
            `Tin nhắn vi phạm quy tắc cộng đồng và bị chặn. Từ vi phạm: ${moderationMatches.join(', ')}`,
          )
          return
        }

        if (!message) return

        // Broadcast tới members trong room
        const memberIds = await getRoomMemberIds(event.roomId)
        const wsEvent: WsServerEvent = { type: 'message', message }

        // Thử publish qua Redis (fan-out multi-instance)
        const published = await publishToRoom(event.roomId, wsEvent)
        if (!published) {
          // Redis không có → broadcast trực tiếp trong process
          broadcastToUsers(memberIds, wsEvent)
        }
        // Nếu Redis publish OK, Redis subscriber sẽ broadcast tới các instance

        // Đăng ký subscribe room này nếu chưa (cho fan-out từ Redis)
        ensureRoomSubscription(ws, event.roomId, memberIds)
      } catch (err) {
        const code = err instanceof Error ? err.message : 'SEND_FAILED'
        if (code === 'ROOM_NOT_MEMBER') {
          sendError(ws, 'ROOM_NOT_MEMBER', 'Bạn không phải thành viên của phòng này.')
        } else if (code === 'USER_SUSPENDED') {
          sendError(ws, 'USER_SUSPENDED', 'Tài khoản của bạn đang bị tạm khóa chat.')
        } else {
          console.error('[wsHandler] Lỗi gửi message:', err)
          sendError(ws, 'SEND_FAILED', 'Không thể gửi tin nhắn.')
        }
      }
      break
    }

    case 'typing': {
      try {
        const memberIds = await getRoomMemberIds(event.roomId)
        // Lấy tên sender
        const pool = getPgReadPool()
        const senderRes = await pool.query<{ name: string }>(
          `SELECT name FROM public.profiles WHERE id = $1`,
          [userId],
        )
        const senderName = senderRes.rows[0]?.name ?? 'User'

        const typingEvent: WsServerEvent = {
          type: 'typing',
          roomId: event.roomId,
          userId,
          senderName,
        }

        // Chỉ gửi tới các member KHÁC (không gửi lại cho người gõ)
        const others = memberIds.filter((id) => id !== userId)
        const published = await publishToRoom(event.roomId, typingEvent)
        if (!published) {
          broadcastToUsers(others, typingEvent)
        }
      } catch {
        // Typing indicator không quan trọng, bỏ qua lỗi
      }
      break
    }

    case 'read': {
      try {
        await markRead(event.roomId, userId, event.messageId)
        sendToWs(ws, { type: 'read_ack', roomId: event.roomId, messageId: event.messageId })
      } catch {
        // Ignore
      }
      break
    }
  }
}

// ── Đăng ký Redis subscription cho room ──────────────────────────────────────

function ensureRoomSubscription(ws: WebSocket, roomId: string, memberIds: string[]): void {
  const rooms = connectionRooms.get(ws)
  if (!rooms) return
  if (rooms.has(roomId)) return // đã subscribe rồi

  rooms.add(roomId)

  const unsubscribe = subscribeToRoom(roomId, (payload) => {
    // Chỉ relay payload từ Redis tới users kết nối trong process này
    broadcastToUsers(memberIds, payload as WsServerEvent)
  })

  const cleanups = connectionCleanups.get(ws)
  if (cleanups) cleanups.push(unsubscribe)
}

// ── Connection handler ────────────────────────────────────────────────────────

async function handleConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
  // 1. Auth qua cookie
  const rawCookie = req.headers['cookie']
  const token = parseCookieHeader(rawCookie)
  if (!token) {
    ws.close(4001, 'Unauthorized')
    return
  }

  const auth = await validateSessionToken(token)
  if (!auth) {
    ws.close(4001, 'Unauthorized')
    return
  }

  const { userId } = auth

  // 2. Đăng ký connection
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set())
  }
  userConnections.get(userId)!.add(ws)
  connectionUser.set(ws, userId)
  connectionRooms.set(ws, new Set())
  connectionCleanups.set(ws, [])

  // 3. Set presence online
  void setPresenceOnline(userId)

  // 4. Setup heartbeat timeout
  let heartbeatTimer = setTimeout(() => {
    ws.terminate()
  }, HEARTBEAT_TIMEOUT_MS)

  // 5. Message handler
  ws.on('message', (data) => {
    // Reset heartbeat timer on any message
    clearTimeout(heartbeatTimer)
    heartbeatTimer = setTimeout(() => ws.terminate(), HEARTBEAT_TIMEOUT_MS)

    void handleClientMessage(ws, userId, data as Buffer)
  })

  // 6. Disconnect handler
  ws.on('close', () => {
    clearTimeout(heartbeatTimer)

    // Cleanup connections registry
    const wss = userConnections.get(userId)
    if (wss) {
      wss.delete(ws)
      if (wss.size === 0) {
        userConnections.delete(userId)
        // Chỉ set offline khi KHÔNG còn connection nào từ user này
        void setPresenceOffline(userId)
      }
    }

    // Cleanup Redis subscriptions
    const cleanups = connectionCleanups.get(ws)
    if (cleanups) {
      for (const cleanup of cleanups) cleanup()
    }
  })

  ws.on('error', (err) => {
    console.error(`[wsHandler] WS error user ${userId}:`, err.message)
  })
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Gắn WebSocket handler vào http.Server đã có.
 * Gọi từ server.ts sau khi tạo HTTP server.
 */
export function attachWebSocketHandler(httpServer: HttpServer): void {
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws/chat',
  })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    void handleConnection(ws, req)
  })

  wss.on('error', (err) => {
    console.error('[wsHandler] WebSocket server error:', err)
  })

  console.log('   WebSocket chat : bật tại /ws/chat')
}

/** Exported for testing purposes */
export { userConnections }
