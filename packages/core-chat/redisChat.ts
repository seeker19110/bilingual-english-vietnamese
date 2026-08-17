// packages/core-chat/redisChat.ts — Redis pub/sub wrapper cho chat fan-out.
//
// Tách biệt với Redis rate-limit trong core-auth/security.ts:
//   - rate-limit: dùng INCR + PEXPIRE (single client)
//   - chat: dùng pub/sub (cần 2 client: publisher + subscriber)
//     vì Redis sub client không thể chạy lệnh khác sau SUBSCRIBE
//
// Graceful fallback: nếu REDIS_URL không set hoặc Redis lỗi → trả null,
// caller tự broadcast nội bộ (single-instance mode).
//
// Presence: Redis SETEX chat:presence:{userId} 60 "1"
// Pub/sub channel: chat:room:{roomId}

import { Redis } from 'ioredis'

const PRESENCE_TTL_SECONDS = 60
const PRESENCE_KEY = (userId: string) => `chat:presence:${userId}`
const ROOM_CHANNEL = (roomId: string) => `chat:room:${roomId}`

// Hai client riêng: publisher và subscriber (Redis yêu cầu)
let pubClient: Redis | null | undefined
let subClient: Redis | null | undefined
let warned = false

function makeRedis(url: string): Redis {
  return new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 2000,
    lazyConnect: true,
  })
}

function warnOnce(err: unknown): void {
  if (warned) return
  warned = true
  const msg = err instanceof Error ? err.message : String(err)
  console.warn(`[redisChat] Redis lỗi (${msg}) — chat hoạt động single-instance mode.`)
}

function getPubClient(): Redis | null {
  if (pubClient !== undefined) return pubClient

  const url = process.env.REDIS_URL
  if (!url) {
    pubClient = null
    return null
  }

  try {
    pubClient = makeRedis(url)
    pubClient.on('error', warnOnce)
    return pubClient
  } catch (err) {
    warnOnce(err)
    pubClient = null
    return null
  }
}

function getSubClient(): Redis | null {
  if (subClient !== undefined) return subClient

  const url = process.env.REDIS_URL
  if (!url) {
    subClient = null
    return null
  }

  try {
    subClient = makeRedis(url)
    subClient.on('error', warnOnce)
    return subClient
  } catch (err) {
    warnOnce(err)
    subClient = null
    return null
  }
}

// ── Pub/Sub ──────────────────────────────────────────────────────────────────

/**
 * Publish một event tới tất cả instances đang subscribe room này.
 * @returns true nếu publish thành công, false nếu Redis không có hoặc lỗi
 */
export async function publishToRoom(roomId: string, payload: unknown): Promise<boolean> {
  const pub = getPubClient()
  if (!pub) return false

  try {
    await pub.publish(ROOM_CHANNEL(roomId), JSON.stringify(payload))
    return true
  } catch (err) {
    warnOnce(err)
    return false
  }
}

type MessageHandler = (payload: unknown) => void

const activeSubscriptions = new Map<string, MessageHandler[]>()

/**
 * Subscribe vào channel của một room để nhận event từ các instances khác.
 * Nhiều handler có thể subscribe cùng channel.
 */
export function subscribeToRoom(roomId: string, handler: MessageHandler): () => void {
  const sub = getSubClient()
  if (!sub) return () => {} // no-op nếu không có Redis

  const channel = ROOM_CHANNEL(roomId)
  const handlers = activeSubscriptions.get(channel) ?? []
  handlers.push(handler)
  activeSubscriptions.set(channel, handlers)

  // Subscribe nếu chưa có
  if (handlers.length === 1) {
    sub.subscribe(channel).catch(warnOnce)

    // Đăng ký message handler một lần dùng chung
    if (!sub.listenerCount('message')) {
      sub.on('message', (ch: string, msg: string) => {
        try {
          const payload = JSON.parse(msg) as unknown
          const chHandlers = activeSubscriptions.get(ch)
          if (chHandlers) {
            for (const h of chHandlers) h(payload)
          }
        } catch {
          // Ignore malformed messages
        }
      })
    }
  }

  // Trả về unsubscribe function
  return () => {
    const current = activeSubscriptions.get(channel)
    if (!current) return
    const updated = current.filter((h) => h !== handler)
    if (updated.length === 0) {
      activeSubscriptions.delete(channel)
      sub.unsubscribe(channel).catch(() => {})
    } else {
      activeSubscriptions.set(channel, updated)
    }
  }
}

// ── Presence ─────────────────────────────────────────────────────────────────

/**
 * Đánh dấu user đang online (TTL 60s — phải refresh bằng heartbeat mỗi 30s).
 */
export async function setPresenceOnline(userId: string): Promise<void> {
  const pub = getPubClient()
  if (!pub) return
  try {
    await pub.setex(PRESENCE_KEY(userId), PRESENCE_TTL_SECONDS, '1')
  } catch {
    // Ignore — presence là best-effort
  }
}

/**
 * Xóa presence khi user ngắt kết nối.
 */
export async function setPresenceOffline(userId: string): Promise<void> {
  const pub = getPubClient()
  if (!pub) return
  try {
    await pub.del(PRESENCE_KEY(userId))
  } catch {
    // Ignore
  }
}

/**
 * Kiểm tra danh sách userIds xem ai đang online.
 * @returns Set<string> chứa userId của những người đang online
 */
export async function getOnlineUsers(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set()

  const pub = getPubClient()
  if (!pub) return new Set()

  try {
    const keys = userIds.map(PRESENCE_KEY)
    const results = await pub.mget(...keys)
    const online = new Set<string>()
    results.forEach((val, idx) => {
      if (val !== null) online.add(userIds[idx]!)
    })
    return online
  } catch {
    return new Set()
  }
}

/**
 * Refresh TTL để user tiếp tục "online" (gọi khi nhận ping).
 */
export async function refreshPresence(userId: string): Promise<void> {
  const pub = getPubClient()
  if (!pub) return
  try {
    await pub.expire(PRESENCE_KEY(userId), PRESENCE_TTL_SECONDS)
  } catch {
    // Ignore
  }
}
