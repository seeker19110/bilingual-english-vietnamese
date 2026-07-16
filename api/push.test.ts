// Test sendReminders (api/push.ts) — tập trung nhánh MỚI: chọn nội dung thông báo
// theo việc user có đang tham gia thử thách challenge gần đây hay không (mục "Nhắc hằng
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
  challengeRows?: { user_id: string }[]
  challengeError?: { message: string } | null
  // Nội dung nhắc theo ngữ cảnh (② M3): dữ liệu 14 ngày gần nhất + srs/weekly_goal.
  recentUsageRows?: { user_id: string; day: string; [k: string]: unknown }[]
  progressRows?: {
    user_id: string
    srs?: Record<string, { due?: number }>
    weekly_goal?: { goal?: number }
  }[]
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
            // Nhánh "đã học hôm nay" — .eq('day', today).in('user_id', ids).
            eq: () => ({
              in: async () => ({ data: opts.usageRows ?? [] }),
            }),
            // Nhánh "14 ngày gần nhất" (② M3) — .in('user_id', ids).gte(day).lt(day).
            in: () => ({
              gte: () => ({
                lt: async () => ({ data: opts.recentUsageRows ?? [], error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'learning_progress') {
        return {
          select: () => ({
            in: async () => ({ data: opts.progressRows ?? [] }),
          }),
        }
      }
      if (table === 'challenge_entries') {
        return {
          select: () => ({
            in: () => ({
              gte: async () => ({
                data: opts.challengeRows ?? [],
                error: opts.challengeError ?? null,
              }),
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

describe('sendReminders — chọn nội dung theo hoạt động challenge gần đây', () => {
  it('chưa học hôm nay + có challenge_entries trong 8 ngày gần đây → nhận payload challenge (url /challenge)', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('u1')],
        usageRows: [],
        challengeRows: [{ user_id: 'u1' }],
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 1, skipped: 0, expired: 0 })
    const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
    expect(payload.url).toBe('/challenge')
    expect(payload.title).toMatch(/challenge/i)
  })

  it('chưa học hôm nay + KHÔNG có challenge_entries gần đây → nhận payload chung (url /)', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('u2')],
        usageRows: [],
        challengeRows: [],
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 1, skipped: 0, expired: 0 })
    const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
    expect(payload.url).toBe('/')
  })

  it('đã học hôm nay (kể cả chỉ challenge — tính vào stt_count/chat_count) → bỏ qua, KHÔNG gửi', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('u3')],
        usageRows: [{ user_id: 'u3', stt_count: 1, chat_count: 1 }],
        challengeRows: [{ user_id: 'u3' }], // dù có challenge_entries gần đây, đã học rồi thì không nhắc
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 0, skipped: 1, expired: 0 })
    expect(mockedSend).not.toHaveBeenCalled()
  })

  it('bảng challenge_entries lỗi (migration 0010 chưa chạy) → fail-open về payload chung, không ném', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        subs: [sub('u4')],
        usageRows: [],
        challengeError: { message: 'relation "challenge_entries" does not exist' },
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
        subs: [sub('challenge-user'), sub('generic-user')],
        usageRows: [],
        challengeRows: [{ user_id: 'challenge-user' }],
      }) as never,
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 2, skipped: 0, expired: 0 })
    const payloads = mockedSend.mock.calls.map((c) => JSON.parse(c[1] as string).url)
    expect(payloads.sort()).toEqual(['/', '/challenge'])
  })
})

describe('sendReminders — nội dung theo ngữ cảnh (② M3: streak/SRS/mục tiêu tuần)', () => {
  it('có streak liên tục 6 ngày trước (14 ngày gần nhất) → nhắc "mất chuỗi", ưu tiên hơn challenge', () => {
    return (async () => {
      mockedGet.mockReturnValue(
        makeSupabase({
          subs: [sub('u5')],
          usageRows: [],
          challengeRows: [{ user_id: 'u5' }], // có challenge nhưng streak phải thắng
          // 6 ngày liên tục kết thúc HÔM QUA (2026-07-15) — "hôm nay" giả lập là 2026-07-16.
          recentUsageRows: Array.from({ length: 6 }, (_, i) => ({
            user_id: 'u5',
            day: `2026-07-${String(10 + i).padStart(2, '0')}`,
            chat_count: 1,
          })),
        }) as never,
      )
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-07-16T06:00:00Z')) // ~13h VN, "hôm nay" = 2026-07-16
      const result = await sendReminders(13)
      vi.useRealTimers()
      expect(result.sent).toBe(1)
      const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
      expect(payload.title).toContain('mất chuỗi')
      expect(payload.body).toContain('6')
    })()
  })

  it('không streak, có SRS đến hạn → nhắc ôn SRS', () => {
    return (async () => {
      mockedGet.mockReturnValue(
        makeSupabase({
          subs: [sub('u6')],
          usageRows: [],
          challengeRows: [],
          progressRows: [
            {
              user_id: 'u6',
              srs: {
                apple: { due: 1 },
                banana: { due: 1 },
                cherry: { due: Date.now() + 999_999_999 },
              },
            },
          ],
        }) as never,
      )
      const result = await sendReminders(13)
      expect(result.sent).toBe(1)
      const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
      expect(payload.title).toContain('ôn')
      expect(payload.body).toContain('2') // chỉ 2/3 thẻ đã đến hạn (due <= now)
    })()
  })

  it('không streak, không SRS, gần đạt mục tiêu tuần (còn 1 ngày) → nhắc mục tiêu tuần', () => {
    return (async () => {
      mockedGet.mockReturnValue(
        makeSupabase({
          subs: [sub('u7')],
          usageRows: [],
          challengeRows: [],
          progressRows: [{ user_id: 'u7', weekly_goal: { goal: 3 } }],
          recentUsageRows: [
            { user_id: 'u7', day: '2026-07-13', chat_count: 1 },
            { user_id: 'u7', day: '2026-07-14', chat_count: 1 },
          ],
        }) as never,
      )
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-07-16T06:00:00Z'))
      const result = await sendReminders(13)
      vi.useRealTimers()
      expect(result.sent).toBe(1)
      const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
      expect(payload.title).toContain('mục tiêu tuần')
    })()
  })

  it('lỗi truy vấn daily_usage mở rộng → fail-open, vẫn gửi được (rơi về challenge/chung)', () => {
    return (async () => {
      const supa = makeSupabase({ subs: [sub('u8')], usageRows: [], challengeRows: [] })
      mockedGet.mockReturnValue(supa as never)
      const result = await sendReminders(13)
      expect(result.sent).toBe(1)
      const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
      expect(payload.url).toBe('/')
    })()
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
