// packages/core-chat/chatPush.test.ts — Unit tests cho chức năng gửi Web Push tin nhắn offline

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notifyOfflinePeers } from './chatPush.js'
import * as redisChatModule from './redisChat.js'
import * as pgPoolModule from '../core-db/pgPool.js'
import webpush from 'web-push'

describe('chatPush: notifyOfflinePeers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('bỏ qua nếu không có peers hoặc peer rỗng', async () => {
    const result = await notifyOfflinePeers([], 'sender-1', 'room-1', 'hello')
    expect(result).toEqual({ sent: 0, skipped: 0 })
  })

  it('bỏ qua nếu peer đang online', async () => {
    vi.spyOn(redisChatModule, 'isOnline').mockResolvedValue(true)

    const result = await notifyOfflinePeers(['peer-1'], 'sender-1', 'room-1', 'hello')
    expect(result).toEqual({ sent: 0, skipped: 1 })
  })

  it('gửi push notification cho peer offline có đăng ký push_subscriptions', async () => {
    vi.spyOn(redisChatModule, 'isOnline').mockResolvedValue(false)

    const queryMock = vi.fn().mockImplementation((query: string) => {
      if (query.includes('profiles')) {
        return Promise.resolve({ rows: [{ name: 'Nguyen Van A' }] })
      }
      if (query.includes('push_subscriptions')) {
        return Promise.resolve({
          rows: [
            {
              endpoint: 'https://fcm.googleapis.com/fcm/send/test',
              p256dh: 'p256dh-key',
              auth_key: 'auth-key',
            },
          ],
        })
      }
      return Promise.resolve({ rows: [] })
    })

    vi.spyOn(pgPoolModule, 'getPgPool').mockReturnValue({
      query: queryMock,
    } as unknown as ReturnType<typeof pgPoolModule.getPgPool>)

    const sendPushMock = vi.spyOn(webpush, 'sendNotification').mockResolvedValue({} as never)

    const result = await notifyOfflinePeers(['peer-1'], 'sender-1', 'room-1', 'Xin chào bạn!')

    expect(result.sent).toBe(1)
    expect(sendPushMock).toHaveBeenCalledTimes(1)
    expect(sendPushMock).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'https://fcm.googleapis.com/fcm/send/test' }),
      expect.stringContaining('Xin chào bạn!'),
    )
  })

  it('tự động dọn dẹp subscription hết hạn (410 Gone)', async () => {
    vi.spyOn(redisChatModule, 'isOnline').mockResolvedValue(false)

    const queryMock = vi.fn().mockImplementation((query: string) => {
      if (query.includes('profiles')) {
        return Promise.resolve({ rows: [{ name: 'Nguyen Van A' }] })
      }
      if (query.includes('push_subscriptions')) {
        return Promise.resolve({
          rows: [
            {
              endpoint: 'https://fcm.googleapis.com/fcm/send/expired',
              p256dh: 'key',
              auth_key: 'auth',
            },
          ],
        })
      }
      return Promise.resolve({ rows: [] })
    })

    vi.spyOn(pgPoolModule, 'getPgPool').mockReturnValue({
      query: queryMock,
    } as unknown as ReturnType<typeof pgPoolModule.getPgPool>)

    const error410 = Object.assign(new Error('Subscription expired'), { statusCode: 410 })
    vi.spyOn(webpush, 'sendNotification').mockRejectedValue(error410)

    const result = await notifyOfflinePeers(['peer-1'], 'sender-1', 'room-1', 'Alo?')

    expect(result.sent).toBe(0)
    // Phải gọi delete from push_subscriptions
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('delete from public.push_subscriptions'),
      [['https://fcm.googleapis.com/fcm/send/expired']],
    )
  })
})
