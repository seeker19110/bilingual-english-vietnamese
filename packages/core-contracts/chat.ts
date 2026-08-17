// packages/core-contracts/chat.ts — Zod schemas cho tính năng chat user-to-user.
// Dùng chung giữa server (wsHandler, chatService, api/chat) và client (useChat hook).

import { z } from 'zod'
import { UuidSchema, IsoDateTimeSchema } from './shared.js'

// ── Shared primitives ────────────────────────────────────────────────────────

export const ModerationSeveritySchema = z.enum(['none', 'low', 'medium', 'high'])
export type ModerationSeverity = z.infer<typeof ModerationSeveritySchema>

export const ModerationActionSchema = z.enum(['filtered', 'blocked', 'warned', 'suspended'])
export type ModerationAction = z.infer<typeof ModerationActionSchema>

// ── Chat Message ─────────────────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  id: UuidSchema,
  roomId: UuidSchema,
  senderId: UuidSchema.nullable(),
  senderName: z.string(),
  senderNickname: z.string().nullable(),
  // content: text hiển thị cho người nhận (đã filter nếu cần)
  content: z.string().min(1).max(4000),
  isFiltered: z.boolean(),
  createdAt: IsoDateTimeSchema,
  editedAt: IsoDateTimeSchema.nullable().optional(),
})
export type ChatMessage = z.infer<typeof ChatMessageSchema>

// ── Room Summary (danh sách phòng chat) ─────────────────────────────────────

export const RoomMemberSchema = z.object({
  userId: UuidSchema,
  name: z.string(),
  nickname: z.string().nullable(),
})
export type RoomMember = z.infer<typeof RoomMemberSchema>

export const RoomSummarySchema = z.object({
  id: UuidSchema,
  isGroup: z.boolean(),
  name: z.string().nullable(),
  members: z.array(RoomMemberSchema),
  lastMessage: ChatMessageSchema.nullable(),
  unreadCount: z.number().int().nonnegative(),
  lastReadAt: IsoDateTimeSchema,
})
export type RoomSummary = z.infer<typeof RoomSummarySchema>

// ── WebSocket events: Client → Server ────────────────────────────────────────

export const WsSendMessageSchema = z.object({
  type: z.literal('message'),
  roomId: UuidSchema,
  content: z.string().min(1).max(4000).trim(),
})
export type WsSendMessage = z.infer<typeof WsSendMessageSchema>

export const WsTypingSchema = z.object({
  type: z.literal('typing'),
  roomId: UuidSchema,
})
export type WsTyping = z.infer<typeof WsTypingSchema>

export const WsReadSchema = z.object({
  type: z.literal('read'),
  roomId: UuidSchema,
  messageId: UuidSchema,
})
export type WsRead = z.infer<typeof WsReadSchema>

export const WsPingSchema = z.object({
  type: z.literal('ping'),
})
export type WsPing = z.infer<typeof WsPingSchema>

export const WsClientEventSchema = z.discriminatedUnion('type', [
  WsSendMessageSchema,
  WsTypingSchema,
  WsReadSchema,
  WsPingSchema,
])
export type WsClientEvent = z.infer<typeof WsClientEventSchema>

// ── WebSocket events: Server → Client ────────────────────────────────────────

export const WsMessageEventSchema = z.object({
  type: z.literal('message'),
  message: ChatMessageSchema,
})
export type WsMessageEvent = z.infer<typeof WsMessageEventSchema>

export const WsTypingEventSchema = z.object({
  type: z.literal('typing'),
  roomId: UuidSchema,
  userId: UuidSchema,
  senderName: z.string(),
})
export type WsTypingEvent = z.infer<typeof WsTypingEventSchema>

export const WsPresenceSchema = z.object({
  type: z.literal('presence'),
  userId: UuidSchema,
  online: z.boolean(),
})
export type WsPresence = z.infer<typeof WsPresenceSchema>

export const WsErrorSchema = z.object({
  type: z.literal('error'),
  code: z.string(),
  message: z.string(),
})
export type WsError = z.infer<typeof WsErrorSchema>

export const WsPongSchema = z.object({
  type: z.literal('pong'),
})
export type WsPong = z.infer<typeof WsPongSchema>

export const WsReadAckSchema = z.object({
  type: z.literal('read_ack'),
  roomId: UuidSchema,
  messageId: UuidSchema,
})
export type WsReadAck = z.infer<typeof WsReadAckSchema>

export const WsServerEventSchema = z.discriminatedUnion('type', [
  WsMessageEventSchema,
  WsTypingEventSchema,
  WsPresenceSchema,
  WsErrorSchema,
  WsPongSchema,
  WsReadAckSchema,
])
export type WsServerEvent = z.infer<typeof WsServerEventSchema>

// ── REST API schemas ──────────────────────────────────────────────────────────

export const CreateRoomBodySchema = z.object({
  targetUserId: UuidSchema,
})
export type CreateRoomBody = z.infer<typeof CreateRoomBodySchema>

export const GetMessagesQuerySchema = z.object({
  roomId: UuidSchema,
  // cursor = createdAt của tin nhắn cũ nhất đã tải (ISO datetime), để load thêm về quá khứ
  cursor: IsoDateTimeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
})
export type GetMessagesQuery = z.infer<typeof GetMessagesQuerySchema>

export const SearchUsersQuerySchema = z.object({
  q: z.string().min(1).max(50).trim(),
})
export type SearchUsersQuery = z.infer<typeof SearchUsersQuerySchema>

export const UserSearchResultSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  nickname: z.string().nullable(),
  plan: z.string(),
})
export type UserSearchResult = z.infer<typeof UserSearchResultSchema>
