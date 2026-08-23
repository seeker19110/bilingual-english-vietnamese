// Test /api/chat — chặn method/đăng nhập/input, route đúng theo query (roomId có/không), và map
// lỗi nghiệp vụ (not_friends/self_chat/not_member) sang response đúng mã trạng thái.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const createOrGetDmRoomMock = vi.fn()
const getMessagesMock = vi.fn()
const getRoomsMock = vi.fn()
const deleteMessageMock = vi.fn()
vi.mock('@dhcb/core-chat/chatService', () => ({
  createOrGetDmRoom: (...a: unknown[]) => createOrGetDmRoomMock(...a),
  getMessages: (...a: unknown[]) => getMessagesMock(...a),
  getRooms: (...a: unknown[]) => getRoomsMock(...a),
  deleteMessage: (...a: unknown[]) => deleteMessageMock(...a),
}))

import handler from './chat'

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  createOrGetDmRoomMock.mockReset()
  getMessagesMock.mockReset()
  getRoomsMock.mockReset()
  deleteMessageMock.mockReset()
})

describe('GET /api/chat', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(new Request('http://localhost/api/chat'))
    expect(res.status).toBe(401)
  })

  it('không có roomId → trả danh sách phòng', async () => {
    getRoomsMock.mockResolvedValue([{ roomId: 'r1' }])
    const res = await handler(new Request('http://localhost/api/chat'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ rooms: [{ roomId: 'r1' }] })
    expect(getRoomsMock).toHaveBeenCalledWith('user-1')
  })

  it('roomId không phải uuid hợp lệ → 400', async () => {
    const res = await handler(new Request('http://localhost/api/chat?roomId=abc'))
    expect(res.status).toBe(400)
    expect(getMessagesMock).not.toHaveBeenCalled()
  })

  it('có roomId hợp lệ → trả lịch sử tin nhắn', async () => {
    getMessagesMock.mockResolvedValue({ ok: true, messages: [{ id: 'm1' }] })
    const roomId = '11111111-1111-4111-8111-111111111111'
    const res = await handler(new Request(`http://localhost/api/chat?roomId=${roomId}`))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ messages: [{ id: 'm1' }] })
  })

  it('không phải thành viên phòng → 403', async () => {
    getMessagesMock.mockResolvedValue({ ok: false, reason: 'not_member' })
    const roomId = '11111111-1111-4111-8111-111111111111'
    const res = await handler(new Request(`http://localhost/api/chat?roomId=${roomId}`))
    expect(res.status).toBe(403)
  })
})

describe('POST /api/chat', () => {
  const TARGET_ID = '22222222-2222-4222-8222-222222222222'
  function makeRequest(body: unknown): Request {
    return new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(makeRequest({ targetUserId: TARGET_ID }))
    expect(res.status).toBe(401)
  })

  it('thiếu targetUserId → 400', async () => {
    const res = await handler(makeRequest({}))
    expect(res.status).toBe(400)
    expect(createOrGetDmRoomMock).not.toHaveBeenCalled()
  })

  it('không phải bạn bè → 400 kèm reason', async () => {
    createOrGetDmRoomMock.mockResolvedValue({ ok: false, reason: 'not_friends' })
    const res = await handler(makeRequest({ targetUserId: TARGET_ID }))
    expect(res.status).toBe(400)
    expect((await res.json()).reason).toBe('not_friends')
  })

  it('tự chat với chính mình → 400 kèm reason', async () => {
    createOrGetDmRoomMock.mockResolvedValue({ ok: false, reason: 'self_chat' })
    const res = await handler(makeRequest({ targetUserId: TARGET_ID }))
    expect(res.status).toBe(400)
    expect((await res.json()).reason).toBe('self_chat')
  })

  it('hợp lệ → 200 kèm roomId', async () => {
    createOrGetDmRoomMock.mockResolvedValue({ ok: true, roomId: 'room-1' })
    const res = await handler(makeRequest({ targetUserId: TARGET_ID }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ roomId: 'room-1' })
  })
})

describe('DELETE /api/chat', () => {
  it('thiếu messageId → 400', async () => {
    const res = await handler(new Request('http://localhost/api/chat', { method: 'DELETE' }))
    expect(res.status).toBe(400)
  })

  it('xoá thành công → 200', async () => {
    deleteMessageMock.mockResolvedValue(true)
    const res = await handler(
      new Request('http://localhost/api/chat?messageId=m1', { method: 'DELETE' }),
    )
    expect(res.status).toBe(200)
  })

  it('không xoá được → 404', async () => {
    deleteMessageMock.mockResolvedValue(false)
    const res = await handler(
      new Request('http://localhost/api/chat?messageId=m1', { method: 'DELETE' }),
    )
    expect(res.status).toBe(404)
  })
})

describe('method khác GET/POST/DELETE/OPTIONS → 405', () => {
  it('PUT → 405', async () => {
    const res = await handler(new Request('http://localhost/api/chat', { method: 'PUT' }))
    expect(res.status).toBe(405)
  })
})
