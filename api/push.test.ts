// Test sendReminders (api/push.ts) — tập trung nhánh MỚI: chọn nội dung thông báo
// theo việc user có đang tham gia thử thách vlog gần đây hay không (mục "Nhắc hằng
// ngày" — docs/research/thu-thach-vlog-30-ngay.md). Mock DB + web-push để chạy OFFLINE.
//
// push.ts đọc VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY ở TOP-LEVEL module (side effect lúc
// import) nên phải stub env TRƯỚC khi import — dùng import() động trong beforeAll,
// không import tĩnh `sendReminders` ở đầu file (ES import tĩnh bị hoisted lên trước
// mọi statement khác, sẽ chạy trước khi kịp stub env).

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'

vi.mock('web-push', () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: vi.fn(async () => undefined) },
}))
vi.mock('./_lib/supabaseAdmin', () => ({ getSupabaseAdmin: vi.fn() }))

import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import webpush from 'web-push'

const mockedGet = vi.mocked(getSupabaseAdmin)
const mockedSend = vi.mocked(webpush.sendNotification)

let sendReminders: typeof import('./push').sendReminders

beforeAll(async () => {
  vi.stubEnv('VAPID_PUBLIC_KEY', 'pub-test')
  vi.stubEnv('VAPID_PRIVATE_KEY', 'priv-test')
  const mod = await import('./push')
  sendReminders = mod.sendReminders
})

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
  mockedGet.mockReset()
  mockedSend.mockClear()
})

type Row = { user_id: string; endpoint: string; p256dh: string; auth_key: string }

function makeSupabase(opts: {
  subs: Row[]
  usageRows?: Record<string, unknown>[]
  vlogRows?: { user_id: string }[]
  vlogError?: { message: string } | null
}) {
  return {
    from: (table: string) => {
      if (table === 'push_subscriptions') {
        return {
          select: () => ({
            or: async () => ({ data: opts.subs }),
            eq: async () => ({ data: opts.subs }),
          }),
          delete: () => ({ in: vi.fn(async () => ({ error: null })) }),
        }
      }
      if (table === 'daily_usage') {
        return {
          select: () => ({
            eq: () => ({
              in: async () => ({ data: opts.usageRows ?? [] }),
            }),
          }),
        }
      }
      if (table === 'vlog_entries') {
        return {
          select: () => ({
            in: () => ({
              gte: async () => ({ data: opts.vlogRows ?? [], error: opts.vlogError ?? null }),
            }),
          }),
        }
      }
      throw new Error(`bảng không mong đợi trong test: ${table}`)
    },
  }
}

const sub = (id: string): Row => ({
  user_id: id,
  endpoint: `https://push.example/${id}`,
  p256dh: 'p256dh',
  auth_key: 'auth',
})

describe('sendReminders — chọn nội dung theo hoạt động vlog gần đây', () => {
  it('chưa học hôm nay + có vlog_entries trong 8 ngày gần đây → nhận payload vlog (url /vlog)', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('u1')],
        usageRows: [],
        vlogRows: [{ user_id: 'u1' }],
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 1, skipped: 0, expired: 0 })
    const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
    expect(payload.url).toBe('/vlog')
    expect(payload.title).toMatch(/vlog/i)
  })

  it('chưa học hôm nay + KHÔNG có vlog_entries gần đây → nhận payload chung (url /)', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('u2')],
        usageRows: [],
        vlogRows: [],
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 1, skipped: 0, expired: 0 })
    const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
    expect(payload.url).toBe('/')
  })

  it('đã học hôm nay (kể cả chỉ vlog — tính vào stt_count/chat_count) → bỏ qua, KHÔNG gửi', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('u3')],
        usageRows: [{ user_id: 'u3', stt_count: 1, chat_count: 1 }],
        vlogRows: [{ user_id: 'u3' }], // dù có vlog_entries gần đây, đã học rồi thì không nhắc
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 0, skipped: 1, expired: 0 })
    expect(mockedSend).not.toHaveBeenCalled()
  })

  it('bảng vlog_entries lỗi (migration 0010 chưa chạy) → fail-open về payload chung, không ném', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('u4')],
        usageRows: [],
        vlogError: { message: 'relation "vlog_entries" does not exist' },
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 1, skipped: 0, expired: 0 })
    const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
    expect(payload.url).toBe('/')
  })

  it('nhiều user cùng lượt gửi — mỗi người nhận đúng payload theo trạng thái riêng', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('vlog-user'), sub('generic-user')],
        usageRows: [],
        vlogRows: [{ user_id: 'vlog-user' }],
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 2, skipped: 0, expired: 0 })
    const payloads = mockedSend.mock.calls.map((c) => JSON.parse(c[1] as string).url)
    expect(payloads.sort()).toEqual(['/', '/vlog'])
  })
})

describe('sendReminders — thiếu VAPID key', () => {
  it('không có VAPID_PUBLIC_KEY/PRIVATE_KEY → trả rỗng ngay, không gọi DB', async () => {
    vi.resetModules()
    vi.stubEnv('VAPID_PUBLIC_KEY', '')
    vi.stubEnv('VAPID_PRIVATE_KEY', '')
    const mod = await import('./push')
    const result = await mod.sendReminders(13)
    expect(result).toEqual({ sent: 0, skipped: 0, expired: 0 })
    expect(mockedGet).not.toHaveBeenCalled()
    // Khôi phục cho các test khác trong tiến trình (module cache đã bị reset).
    vi.stubEnv('VAPID_PUBLIC_KEY', 'pub-test')
    vi.stubEnv('VAPID_PRIVATE_KEY', 'priv-test')
  })
})
