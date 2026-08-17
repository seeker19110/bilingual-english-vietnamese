// packages/core-chat/redisChat.ts — Pub/sub cho chat, TÁCH BIỆT với Redis dùng cho rate-limit
// (packages/core-auth/rateLimitStore.ts) vì pub/sub cần 1 connection RIÊNG ở chế độ subscribe
// (ioredis: connection đã subscribe() không dùng lại được cho lệnh thường).
//
// FALLBACK khi CHƯA có REDIS_URL trên VPS (tình trạng hiện tại — xem PROGRESS.md): dùng
// EventEmitter nội bộ, publish/subscribe chỉ hoạt động TRONG CÙNG 1 tiến trình PM2. Đủ dùng khi
// chạy 1 instance (VPS 1 vCPU hiện tại — xem CLAUDE.md mục 13). Khi cài Redis thật + set
// REDIS_URL, code TỰ ĐỘNG chuyển sang fan-out qua nhiều instance mà không cần đổi gì thêm.

import { EventEmitter } from 'node:events'
import { Redis } from 'ioredis'

const localBus = new EventEmitter()
localBus.setMaxListeners(0)

let pubClient: Redis | null | undefined
let subClient: Redis | null | undefined

function hasRedis(): boolean {
  return !!process.env.REDIS_URL
}

function getPubClient(): Redis | null {
  if (!hasRedis()) return null
  if (pubClient === undefined) {
    pubClient = new Redis(process.env.REDIS_URL!, { lazyConnect: false })
    pubClient.on('error', (err) => console.error('[redisChat] pub lỗi:', err.message))
  }
  return pubClient
}

function getSubClient(): Redis | null {
  if (!hasRedis()) return null
  if (subClient === undefined) {
    subClient = new Redis(process.env.REDIS_URL!, { lazyConnect: false })
    subClient.on('error', (err) => console.error('[redisChat] sub lỗi:', err.message))
  }
  return subClient
}

export async function publish(channel: string, payload: unknown): Promise<void> {
  const message = JSON.stringify(payload)
  const pub = getPubClient()
  if (pub) {
    await pub.publish(channel, message)
    return
  }
  localBus.emit(channel, message)
}

/** Đăng ký nhận sự kiện trên `channel`. Trả về hàm huỷ đăng ký. */
export function subscribeChannel(channel: string, handler: (payload: unknown) => void): () => void {
  const sub = getSubClient()
  if (sub) {
    const listener = (ch: string, message: string) => {
      if (ch !== channel) return
      try {
        handler(JSON.parse(message))
      } catch (err) {
        console.error('[redisChat] parse message lỗi:', err)
      }
    }
    sub.subscribe(channel).catch((err) => console.error('[redisChat] subscribe lỗi:', err))
    sub.on('message', listener)
    return () => {
      sub.off('message', listener)
      sub.unsubscribe(channel).catch(() => {})
    }
  }

  const listener = (message: string) => {
    try {
      handler(JSON.parse(message))
    } catch (err) {
      console.error('[redisChat] parse message lỗi (fallback):', err)
    }
  }
  localBus.on(channel, listener)
  return () => localBus.off(channel, listener)
}

const PRESENCE_TTL_SECONDS = 60
const localPresence = new Map<string, number>() // userId → hết hạn lúc (epoch ms), fallback

export async function setPresence(userId: string): Promise<void> {
  const pub = getPubClient()
  if (pub) {
    await pub.set(`chat:presence:${userId}`, '1', 'EX', PRESENCE_TTL_SECONDS)
    return
  }
  localPresence.set(userId, Date.now() + PRESENCE_TTL_SECONDS * 1000)
}

export async function clearPresence(userId: string): Promise<void> {
  const pub = getPubClient()
  if (pub) {
    await pub.del(`chat:presence:${userId}`)
    return
  }
  localPresence.delete(userId)
}

export async function isOnline(userId: string): Promise<boolean> {
  const pub = getPubClient()
  if (pub) {
    return (await pub.exists(`chat:presence:${userId}`)) === 1
  }
  const expiresAt = localPresence.get(userId)
  return !!expiresAt && expiresAt > Date.now()
}
