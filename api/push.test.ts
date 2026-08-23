// Test sendReminders (api/push.ts) — tập trung nhánh MỚI: chọn nội dung thông báo
// theo việc user có đang tham gia thử thách challenge gần đây hay không (mục "Nhắc hằng
// ngày" — docs/research/thu-thach-vlog-30-ngay.md). Mock Postgres pool + web-push để chạy OFFLINE.
//
// push.ts đọc VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY ở TOP-LEVEL module (side effect lúc
// import) nên phải stub env TRƯỚC khi import — dùng import() động trong beforeAll,
// không import tĩnh `sendReminders` ở đầu file (ES import tĩnh bị hoisted lên trước
// mọi statement khác, sẽ chạy trước khi kịp stub env).

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'

vi.mock('web-push', () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: vi.fn(async () => undefined) },
}))
vi.mock('../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))

import { getPgPool } from '../packages/core-db/pgPool'
import webpush from 'web-push'

const mockedGetPool = vi.mocked(getPgPool)
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
  mockedGetPool.mockReset()
  mockedSend.mockClear()
})

type Row = { user_id: string; endpoint: string; p256dh: string; auth_key: string }

function mockPool(opts: {
  subs: Row[]
  usageRows?: Record<string, unknown>[]
  challengeRows?: { user_id: string }[]
  challengeError?: Error | null
  recentUsageRows?: { user_id: string; day: string; [k: string]: unknown }[]
  recentUsageError?: Error | null
  progressRows?: {
    user_id: string
    srs?: Record<string, { due?: number }>
    weekly_goal?: { goal?: number }
  }[]
}) {
  const query = vi.fn(async (sql: string) => {
    if (sql.includes('from public.push_subscriptions')) {
      return { rows: opts.subs }
    }
    if (sql.includes('from public.daily_usage') && sql.includes('day = $1 and user_id')) {
      return { rows: opts.usageRows ?? [] }
    }
    if (sql.includes('from english.challenge_entries')) {
      if (opts.challengeError) throw opts.challengeError
      return { rows: opts.challengeRows ?? [] }
    }
    if (sql.includes('from public.daily_usage') && sql.includes('day >= $2 and day < $3')) {
      if (opts.recentUsageError) throw opts.recentUsageError
      return { rows: opts.recentUsageRows ?? [] }
    }
    if (sql.includes('from english.learning_progress')) {
      return { rows: opts.progressRows ?? [] }
    }
    throw new Error(`câu SQL không mong đợi trong test: ${sql}`)
  })
  return { query } as unknown as ReturnType<typeof getPgPool>
}

const sub = (id: string): Row => ({
  user_id: id,
  endpoint: `https://push.example/${id}`,
  p256dh: 'p256dh',
  auth_key: 'auth',
})

describe('sendReminders — chọn nội dung theo hoạt động challenge gần đây', () => {
  it('chưa học hôm nay + có challenge_entries trong 8 ngày gần đây → nhận payload challenge (url /challenge)', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({ subs: [sub('u1')], usageRows: [], challengeRows: [{ user_id: 'u1' }] }),
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 1, skipped: 0, expired: 0 })
    const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
    expect(payload.url).toBe('/challenge')
    expect(payload.title).toMatch(/challenge/i)
  })

  it('chưa học hôm nay + KHÔNG có challenge_entries gần đây → nhận payload chung (url /)', async () => {
    mockedGetPool.mockReturnValue(mockPool({ subs: [sub('u2')], usageRows: [], challengeRows: [] }))
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 1, skipped: 0, expired: 0 })
    const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
    expect(payload.url).toBe('/')
  })

  it('đã học hôm nay (kể cả chỉ challenge — tính vào stt_count/chat_count) → bỏ qua, KHÔNG gửi', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        subs: [sub('u3')],
        usageRows: [{ user_id: 'u3', stt_count: 1, chat_count: 1 }],
        challengeRows: [{ user_id: 'u3' }],
      }),
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 0, skipped: 1, expired: 0 })
    expect(mockedSend).not.toHaveBeenCalled()
  })

  it('bảng challenge_entries lỗi (migration 0010 chưa chạy) → fail-open về payload chung, không ném', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        subs: [sub('u4')],
        usageRows: [],
        challengeError: new Error('relation "challenge_entries" does not exist'),
      }),
    )
    const result = await sendReminders(13)
    expect(result).toEqual({ sent: 1, skipped: 0, expired: 0 })
    const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
    expect(payload.url).toBe('/')
  })

  it('nhiều user cùng lượt gửi — mỗi người nhận đúng payload theo trạng thái riêng', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        subs: [sub('challenge-user'), sub('generic-user')],
        usageRows: [],
        challengeRows: [{ user_id: 'challenge-user' }],
      }),
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
      mockedGetPool.mockReturnValue(
        mockPool({
          subs: [sub('u5')],
          usageRows: [],
          challengeRows: [{ user_id: 'u5' }], // có challenge nhưng streak phải thắng
          // 6 ngày liên tục kết thúc HÔM QUA (2026-07-15) — "hôm nay" giả lập là 2026-07-16.
          recentUsageRows: Array.from({ length: 6 }, (_, i) => ({
            user_id: 'u5',
            day: `2026-07-${String(10 + i).padStart(2, '0')}`,
            chat_count: 1,
          })),
        }),
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
      mockedGetPool.mockReturnValue(
        mockPool({
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
        }),
      )
      const result = await sendReminders(13)
      expect(result.sent).toBe(1)
      const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
      expect(payload.title).toContain('ôn')
      expect(payload.body).toContain('2') // chỉ 2/3 thẻ đã đến hạn (due <= now)
    })()
  })

  it('thẻ grammar:* đến hạn KHÔNG được tính vào "N từ cần ôn" (dùng chung kho FSRS với từ vựng, xem srs.ts)', () => {
    return (async () => {
      mockedGetPool.mockReturnValue(
        mockPool({
          subs: [sub('u-grammar')],
          usageRows: [],
          challengeRows: [],
          progressRows: [
            {
              user_id: 'u-grammar',
              srs: {
                apple: { due: 1 },
                'grammar:a1-be': { due: 1 },
                'grammar:a1-articles': { due: 1 },
              },
            },
          ],
        }),
      )
      const result = await sendReminders(13)
      expect(result.sent).toBe(1)
      const payload = JSON.parse(mockedSend.mock.calls[0]?.[1] as string)
      expect(payload.body).toContain('1') // chỉ đếm 'apple' — 2 thẻ grammar: bị loại
    })()
  })

  it('không streak, không SRS, gần đạt mục tiêu tuần (còn 1 ngày) → nhắc mục tiêu tuần', () => {
    return (async () => {
      mockedGetPool.mockReturnValue(
        mockPool({
          subs: [sub('u7')],
          usageRows: [],
          challengeRows: [],
          progressRows: [{ user_id: 'u7', weekly_goal: { goal: 3 } }],
          recentUsageRows: [
            { user_id: 'u7', day: '2026-07-13', chat_count: 1 },
            { user_id: 'u7', day: '2026-07-14', chat_count: 1 },
          ],
        }),
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
      mockedGetPool.mockReturnValue(
        mockPool({
          subs: [sub('u8')],
          usageRows: [],
          challengeRows: [],
          recentUsageError: new Error('timeout'),
        }),
      )
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
    expect(mockedGetPool).not.toHaveBeenCalled()
    // Khôi phục cho các test khác trong tiến trình (module cache đã bị reset).
    vi.stubEnv('VAPID_PUBLIC_KEY', 'pub-test')
    vi.stubEnv('VAPID_PRIVATE_KEY', 'priv-test')
  })
})

describe('api/push default handler', () => {
  let handler: typeof import('./push').default

  beforeAll(async () => {
    vi.resetModules()
    vi.stubEnv('VAPID_PUBLIC_KEY', 'pub-test')
    vi.stubEnv('VAPID_PRIVATE_KEY', 'priv-test')
    vi.stubEnv('CRON_SECRET', 'test-cron-secret')
    const mod = await import('./push')
    handler = mod.default
  })

  it('OPTIONS trả 204', async () => {
    const req = new Request('https://example.com/api/push', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('action vapid-key trả 200 và publicKey', async () => {
    const req = new Request('https://example.com/api/push', {
      method: 'POST',
      body: JSON.stringify({ action: 'vapid-key' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { publicKey: string }
    expect(json.publicKey).toBe('pub-test')
  })

  it('body json lỗi trả 400', async () => {
    const req = new Request('https://example.com/api/push', {
      method: 'POST',
      body: 'invalid-json',
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('action không hợp lệ trả 400', async () => {
    const req = new Request('https://example.com/api/push', {
      method: 'POST',
      body: JSON.stringify({ action: 'unknown-action' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('action subscribe/unsubscribe khi chưa auth trả 401', async () => {
    const req = new Request('https://example.com/api/push', {
      method: 'POST',
      body: JSON.stringify({ action: 'subscribe' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('action send-daily sai secret trả 403, đúng secret trả 200', async () => {
    const reqForbidden = new Request('https://example.com/api/push', {
      method: 'POST',
      body: JSON.stringify({ action: 'send-daily', secret: 'wrong' }),
    })
    const resForbidden = await handler(reqForbidden)
    expect(resForbidden.status).toBe(403)

    mockedGetPool.mockReturnValue(mockPool({ subs: [] }))
    const reqOk = new Request('https://example.com/api/push', {
      method: 'POST',
      body: JSON.stringify({ action: 'send-daily', secret: 'test-cron-secret', hour: 14 }),
    })
    const resOk = await handler(reqOk)
    expect(resOk.status).toBe(200)
  })

  it('action clear-all sai secret trả 403, đúng secret trả 200', async () => {
    const reqForbidden = new Request('https://example.com/api/push', {
      method: 'POST',
      body: JSON.stringify({ action: 'clear-all', secret: 'wrong' }),
    })
    const resForbidden = await handler(reqForbidden)
    expect(resForbidden.status).toBe(403)

    mockedGetPool.mockReturnValue({
      query: vi.fn(async () => ({ rowCount: 5 })),
    } as unknown as ReturnType<typeof getPgPool>)

    const reqOk = new Request('https://example.com/api/push', {
      method: 'POST',
      body: JSON.stringify({ action: 'clear-all', secret: 'test-cron-secret' }),
    })
    const resOk = await handler(reqOk)
    expect(resOk.status).toBe(200)
    const json = (await resOk.json()) as { ok: boolean; deleted: number }
    expect(json.deleted).toBe(5)
  })
})
