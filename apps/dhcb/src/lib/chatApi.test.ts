import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchRooms, fetchMessages, createOrGetDmRoom, deleteChatMessage } from './chatApi'

describe('chatApi', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('fetchRooms returns list of rooms from /api/chat', async () => {
    const mockRooms = [
      {
        roomId: '11111111-1111-1111-1111-111111111111',
        peer: { id: '22222222-2222-2222-2222-222222222222', name: 'Alice' },
        lastMessage: null,
        unreadCount: 0,
      },
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rooms: mockRooms }),
    })

    const rooms = await fetchRooms()
    expect(rooms).toEqual(mockRooms)
    expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object))
  })

  it('fetchRooms returns empty array on failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const rooms = await fetchRooms()
    expect(rooms).toEqual([])
  })

  it('fetchMessages builds query params and returns messages', async () => {
    const mockMessages = [
      {
        id: 'msg-1',
        roomId: '11111111-1111-1111-1111-111111111111',
        senderId: '22222222-2222-2222-2222-222222222222',
        senderName: 'Alice',
        content: 'Xin chào!',
        createdAt: '2026-08-18T07:00:00.000Z',
      },
    ]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: mockMessages }),
    })

    const msgs = await fetchMessages('11111111-1111-1111-1111-111111111111', 'cursor-1', 20)
    expect(msgs).toEqual(mockMessages)
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat?roomId=11111111-1111-1111-1111-111111111111&limit=20&cursor=cursor-1',
      expect.any(Object),
    )
  })

  it('createOrGetDmRoom returns ok with roomId when successful', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ roomId: 'room-123' }),
    })

    const res = await createOrGetDmRoom('target-user-id')
    expect(res).toEqual({ ok: true, roomId: 'room-123' })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ targetUserId: 'target-user-id' }),
      }),
    )
  })

  it('createOrGetDmRoom returns error when rejected by backend', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Chỉ chat được với bạn bè', reason: 'not_friends' }),
    })

    const res = await createOrGetDmRoom('stranger-id')
    expect(res).toEqual({ ok: false, error: 'Chỉ chat được với bạn bè', reason: 'not_friends' })
  })

  it('deleteChatMessage calls DELETE /api/chat?messageId=...', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })

    const ok = await deleteChatMessage('msg-to-delete')
    expect(ok).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat?messageId=msg-to-delete',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
