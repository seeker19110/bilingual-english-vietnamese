// packages/core-contracts/chat.ts — Contract Zod cho Real-time User-to-User Chat (DM 1-1, giai
// đoạn 1). KHÔNG dùng versionedObject() như các contract V2 khác (goal.ts, lifeGoal.ts…) vì đây
// là sự kiện truyền tải qua WebSocket/REST, không phải bản ghi domain cần version hoá lâu dài.

import { z } from 'zod'

export const UuidSchema = z.string().uuid()

export const ChatMessageSchema = z.object({
  id: UuidSchema,
  roomId: UuidSchema,
  senderId: UuidSchema.nullable(),
  senderName: z.string(),
  content: z.string(), // đã qua moderation — text hiển thị (content_clean nếu có lọc)
  createdAt: z.string(),
})
export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const RoomSummarySchema = z.object({
  roomId: UuidSchema,
  peer: z.object({ id: UuidSchema, name: z.string() }),
  lastMessage: ChatMessageSchema.nullable(),
  unreadCount: z.number().int().min(0),
})
export type RoomSummary = z.infer<typeof RoomSummarySchema>

// ── REST ──────────────────────────────────────────────────────────────────────────────────
export const CreateRoomBodySchema = z.object({ targetUserId: UuidSchema })
export type CreateRoomBody = z.infer<typeof CreateRoomBodySchema>

export const GetMessagesQuerySchema = z.object({
  roomId: UuidSchema,
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
})
export type GetMessagesQuery = z.infer<typeof GetMessagesQuerySchema>

// ── WebSocket: client → server ───────────────────────────────────────────────────────────
export const WsSendMessageSchema = z.object({
  type: z.literal('message'),
  roomId: UuidSchema,
  content: z.string().min(1).max(4000),
})
export const WsTypingSchema = z.object({ type: z.literal('typing'), roomId: UuidSchema })
export const WsReadSchema = z.object({
  type: z.literal('read'),
  roomId: UuidSchema,
  messageId: UuidSchema,
})
export const WsPingSchema = z.object({ type: z.literal('ping') })

export const WsClientEventSchema = z.discriminatedUnion('type', [
  WsSendMessageSchema,
  WsTypingSchema,
  WsReadSchema,
  WsPingSchema,
])
export type WsClientEvent = z.infer<typeof WsClientEventSchema>

// ── WebSocket: server → client ───────────────────────────────────────────────────────────
export type WsServerEvent =
  | { type: 'message'; message: ChatMessage }
  | { type: 'typing'; roomId: string; userId: string; senderName: string }
  | { type: 'read'; roomId: string; userId: string; messageId: string }
  | { type: 'presence'; userId: string; online: boolean }
  | { type: 'error'; code: string; message: string }
  | { type: 'pong' }
