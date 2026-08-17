// packages/core-contracts/chat.test.ts — Unit tests cho chat Zod schemas.

import { describe, it, expect } from 'vitest'
import {
  WsClientEventSchema,
  WsSendMessageSchema,
  WsTypingSchema,
  WsReadSchema,
  CreateRoomBodySchema,
  GetMessagesQuerySchema,
  SearchUsersQuerySchema,
  ChatMessageSchema,
} from './chat.js'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_ISO = '2026-08-18T00:00:00.000Z'

describe('WsSendMessageSchema', () => {
  it('validate event message hợp lệ', () => {
    const result = WsSendMessageSchema.safeParse({
      type: 'message',
      roomId: VALID_UUID,
      content: 'Hello world',
    })
    expect(result.success).toBe(true)
  })

  it('trim content', () => {
    const result = WsSendMessageSchema.safeParse({
      type: 'message',
      roomId: VALID_UUID,
      content: '  Hello world  ',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.content).toBe('Hello world')
  })

  it('reject content rỗng', () => {
    const result = WsSendMessageSchema.safeParse({
      type: 'message',
      roomId: VALID_UUID,
      content: '',
    })
    expect(result.success).toBe(false)
  })

  it('reject content quá dài (> 4000 chars)', () => {
    const result = WsSendMessageSchema.safeParse({
      type: 'message',
      roomId: VALID_UUID,
      content: 'a'.repeat(4001),
    })
    expect(result.success).toBe(false)
  })

  it('reject roomId không phải UUID', () => {
    const result = WsSendMessageSchema.safeParse({
      type: 'message',
      roomId: 'not-a-uuid',
      content: 'Hello',
    })
    expect(result.success).toBe(false)
  })
})

describe('WsTypingSchema', () => {
  it('validate event typing hợp lệ', () => {
    const result = WsTypingSchema.safeParse({ type: 'typing', roomId: VALID_UUID })
    expect(result.success).toBe(true)
  })

  it('reject thiếu roomId', () => {
    const result = WsTypingSchema.safeParse({ type: 'typing' })
    expect(result.success).toBe(false)
  })
})

describe('WsReadSchema', () => {
  it('validate event read hợp lệ', () => {
    const result = WsReadSchema.safeParse({
      type: 'read',
      roomId: VALID_UUID,
      messageId: VALID_UUID,
    })
    expect(result.success).toBe(true)
  })
})

describe('WsClientEventSchema (discriminatedUnion)', () => {
  it('route đúng sang message schema', () => {
    const result = WsClientEventSchema.safeParse({
      type: 'message',
      roomId: VALID_UUID,
      content: 'hi',
    })
    expect(result.success).toBe(true)
  })

  it('route đúng sang typing schema', () => {
    const result = WsClientEventSchema.safeParse({ type: 'typing', roomId: VALID_UUID })
    expect(result.success).toBe(true)
  })

  it('route đúng sang ping schema', () => {
    const result = WsClientEventSchema.safeParse({ type: 'ping' })
    expect(result.success).toBe(true)
  })

  it('reject type không hợp lệ', () => {
    const result = WsClientEventSchema.safeParse({ type: 'unknown' })
    expect(result.success).toBe(false)
  })
})

describe('CreateRoomBodySchema', () => {
  it('validate targetUserId hợp lệ', () => {
    const result = CreateRoomBodySchema.safeParse({ targetUserId: VALID_UUID })
    expect(result.success).toBe(true)
  })

  it('reject targetUserId không phải UUID', () => {
    const result = CreateRoomBodySchema.safeParse({ targetUserId: 'abc' })
    expect(result.success).toBe(false)
  })

  it('reject thiếu targetUserId', () => {
    const result = CreateRoomBodySchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('GetMessagesQuerySchema', () => {
  it('validate query hợp lệ', () => {
    const result = GetMessagesQuerySchema.safeParse({
      roomId: VALID_UUID,
      limit: '20',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(20)
  })

  it('dùng limit mặc định 30', () => {
    const result = GetMessagesQuerySchema.safeParse({ roomId: VALID_UUID })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(30)
  })

  it('reject limit > 50', () => {
    const result = GetMessagesQuerySchema.safeParse({ roomId: VALID_UUID, limit: '51' })
    expect(result.success).toBe(false)
  })

  it('validate cursor ISO datetime', () => {
    const result = GetMessagesQuerySchema.safeParse({
      roomId: VALID_UUID,
      cursor: VALID_ISO,
    })
    expect(result.success).toBe(true)
  })

  it('reject cursor không phải ISO datetime', () => {
    const result = GetMessagesQuerySchema.safeParse({
      roomId: VALID_UUID,
      cursor: 'not-a-date',
    })
    expect(result.success).toBe(false)
  })
})

describe('SearchUsersQuerySchema', () => {
  it('validate query hợp lệ', () => {
    const result = SearchUsersQuerySchema.safeParse({ q: 'nguyen' })
    expect(result.success).toBe(true)
  })

  it('reject query rỗng', () => {
    const result = SearchUsersQuerySchema.safeParse({ q: '' })
    expect(result.success).toBe(false)
  })

  it('reject query quá dài', () => {
    const result = SearchUsersQuerySchema.safeParse({ q: 'a'.repeat(51) })
    expect(result.success).toBe(false)
  })

  it('trim whitespace', () => {
    const result = SearchUsersQuerySchema.safeParse({ q: '  nguyen  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.q).toBe('nguyen')
  })
})

describe('ChatMessageSchema', () => {
  it('validate message hợp lệ', () => {
    const result = ChatMessageSchema.safeParse({
      id: VALID_UUID,
      roomId: VALID_UUID,
      senderId: VALID_UUID,
      senderName: 'Nguyễn Văn A',
      senderNickname: 'nva',
      content: 'Hello',
      isFiltered: false,
      createdAt: VALID_ISO,
      editedAt: null,
    })
    expect(result.success).toBe(true)
  })

  it('cho phép senderId null (user bị xóa)', () => {
    const result = ChatMessageSchema.safeParse({
      id: VALID_UUID,
      roomId: VALID_UUID,
      senderId: null,
      senderName: 'Deleted User',
      senderNickname: null,
      content: 'Hello',
      isFiltered: false,
      createdAt: VALID_ISO,
    })
    expect(result.success).toBe(true)
  })
})
