// Test redisChat ở chế độ FALLBACK (chưa có REDIS_URL — đúng tình trạng VPS hiện tại, xem
// PROGRESS.md) — publish/subscribe qua EventEmitter nội bộ, presence qua Map có TTL thủ công.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const originalRedisUrl = process.env.REDIS_URL

beforeEach(() => {
  delete process.env.REDIS_URL
  vi.resetModules()
})

afterEach(() => {
  if (originalRedisUrl !== undefined) process.env.REDIS_URL = originalRedisUrl
})

describe('redisChat (fallback — không có REDIS_URL)', () => {
  it('publish/subscribe: subscriber nhận đúng payload đã publish', async () => {
    const { publish, subscribeChannel } = await import('./redisChat.js')
    const received: unknown[] = []
    const unsubscribe = subscribeChannel('chat:user:u1', (payload) => received.push(payload))

    await publish('chat:user:u1', { type: 'ping' })
    expect(received).toEqual([{ type: 'ping' }])

    unsubscribe()
    await publish('chat:user:u1', { type: 'pong' })
    expect(received).toEqual([{ type: 'ping' }]) // đã huỷ đăng ký, không nhận thêm
  })

  it('publish vào channel khác không lọt sang subscriber channel này', async () => {
    const { publish, subscribeChannel } = await import('./redisChat.js')
    const received: unknown[] = []
    subscribeChannel('chat:user:u1', (payload) => received.push(payload))

    await publish('chat:user:u2', { type: 'ping' })
    expect(received).toEqual([])
  })

  it('presence: setPresence → isOnline true, clearPresence → isOnline false', async () => {
    const { setPresence, clearPresence, isOnline } = await import('./redisChat.js')
    expect(await isOnline('u1')).toBe(false)
    await setPresence('u1')
    expect(await isOnline('u1')).toBe(true)
    await clearPresence('u1')
    expect(await isOnline('u1')).toBe(false)
  })
})
