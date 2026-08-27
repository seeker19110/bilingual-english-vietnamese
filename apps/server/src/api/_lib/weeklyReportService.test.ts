// Test weeklyReportService — phần TRUY VẤN + CHỐNG GỬI TRÙNG của báo cáo tuần.
// Mock `getPgPool` và `sendMailWithQuota` để chạy không cần Postgres/SMTP.

import { describe, it, expect, vi, beforeEach } from 'vitest'

const query = vi.fn()
const sendMail = vi.fn()

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({ query }) }))
vi.mock('@dhcb/core-http/mailQuota', () => ({ sendMailWithQuota: sendMail }))

const {
  sendWeeklyReports,
  claimDueLinks,
  collectWeeklyData,
  computeStreakEndingAt,
  latestCefrLevel,
} = await import('./weeklyReportService.js')

const LEARNER = '11111111-1111-4111-8111-111111111111'
const LINK = '44444444-4444-4444-8444-444444444444'
// Chủ nhật 24/8/2026 19h VN → tuần bắt đầu thứ 2 24/8? (24/8/2026 là thứ hai)
const SUNDAY = new Date('2026-08-30T12:00:00.000Z') // 19h VN chủ nhật 30/8
const WEEK_START = '2026-08-24'

function dueLinkRow() {
  return {
    id: LINK,
    learner_id: LEARNER,
    watcher_email: 'me@example.com',
    learner_name: 'Na',
  }
}

/** Định tuyến câu SQL → rows. Mặc định: 1 liên kết tới hạn, có dữ liệu học. */
function routeSql(over: Partial<Record<string, unknown[]>> = {}) {
  query.mockImplementation(async (sql: string) => {
    const t = sql.trim().toLowerCase()
    if (t.startsWith('update public.companion_links l')) {
      return { rows: over.claim ?? [dueLinkRow()] }
    }
    if (t.startsWith('update public.companion_links set last_report_at = null')) {
      return { rows: over.release ?? [] }
    }
    if (t.includes('from public.daily_usage')) {
      return {
        rows: over.usage ?? [
          { day: '2026-08-24', learn_count: 10, total: 10 },
          { day: '2026-08-25', learn_count: 12, total: 12 },
        ],
      }
    }
    if (t.includes('from public.learning_progress')) {
      return {
        rows: over.progress ?? [
          { weekly_goal: { goal: 5 }, cefr_unlocked: ['A1', 'A2'], learned: ['a', 'b'] },
        ],
      }
    }
    return { rows: [] }
  })
}

beforeEach(() => {
  query.mockReset()
  sendMail.mockReset()
  sendMail.mockResolvedValue({ status: 'sent', channel: 'primary', switchedToFallback: false })
})

describe('claimDueLinks', () => {
  it('giành việc NGAY TRONG câu UPDATE và chỉ lấy watcher đã xác minh email', async () => {
    routeSql()
    await claimDueLinks(WEEK_START)
    const sql = String(query.mock.calls[0]![0]).toLowerCase()
    expect(sql).toContain('set last_report_at = now()')
    expect(sql).toContain('email_verified is not null')
    expect(sql).toContain('last_report_at < $1::date')
    expect(sql).toContain('returning')
  })
})

describe('sendWeeklyReports — chống gửi trùng', () => {
  it('gọi lại lần hai trong cùng tuần thì không ai nhận thêm thư', async () => {
    let claims = 0
    query.mockImplementation(async (sql: string) => {
      const t = sql.trim().toLowerCase()
      if (t.startsWith('update public.companion_links l')) {
        claims++
        return { rows: claims === 1 ? [dueLinkRow()] : [] } // lần 2: đã bị giành, 0 dòng
      }
      if (t.includes('from public.daily_usage')) {
        return { rows: [{ day: '2026-08-24', learn_count: 10, total: 10 }] }
      }
      if (t.includes('from public.learning_progress')) {
        return { rows: [{ weekly_goal: null, cefr_unlocked: [], learned: ['a'] }] }
      }
      return { rows: [] }
    })

    expect(await sendWeeklyReports(SUNDAY)).toEqual({ sent: 1, skipped: 0 })
    expect(await sendWeeklyReports(SUNDAY)).toEqual({ sent: 0, skipped: 0 })
    expect(sendMail).toHaveBeenCalledTimes(1)
  })

  it('thư không gửi được → TRẢ liên kết về chưa gửi để tuần sau thử lại', async () => {
    routeSql()
    sendMail.mockResolvedValue({
      status: 'quota_exceeded',
      channel: null,
      switchedToFallback: false,
    })

    expect(await sendWeeklyReports(SUNDAY)).toEqual({ sent: 0, skipped: 1 })
    const released = query.mock.calls.filter((c) =>
      String(c[0]).toLowerCase().includes('set last_report_at = null'),
    )
    expect(released).toHaveLength(1)
  })

  it('người học chưa có lịch sử học nào → KHÔNG gửi thư rỗng', async () => {
    routeSql({ usage: [], progress: [{ weekly_goal: null, cefr_unlocked: [], learned: [] }] })

    expect(await sendWeeklyReports(SUNDAY)).toEqual({ sent: 0, skipped: 1 })
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('không có liên kết tới hạn → không truy vấn gì thêm', async () => {
    routeSql({ claim: [] })
    expect(await sendWeeklyReports(SUNDAY)).toEqual({ sent: 0, skipped: 0 })
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('hai người theo dõi → hai thư riêng, không thư nào nhắc tới người kia', async () => {
    routeSql({
      claim: [dueLinkRow(), { ...dueLinkRow(), id: 'link-2', watcher_email: 'bo@example.com' }],
    })
    await sendWeeklyReports(SUNDAY)
    expect(sendMail).toHaveBeenCalledTimes(2)
    const bodies = sendMail.mock.calls.map((c) => JSON.stringify(c[0]))
    expect(bodies[0]).not.toContain('bo@example.com')
    expect(bodies[1]).not.toContain('me@example.com')
  })

  it('tuần vắng vẫn gửi (người thân cần biết), nhưng nội dung không trách móc', async () => {
    routeSql({
      usage: [],
      progress: [{ weekly_goal: { goal: 5 }, cefr_unlocked: ['A1'], learned: ['a', 'b'] }],
    })
    const res = await sendWeeklyReports(SUNDAY)
    expect(res).toEqual({ sent: 1, skipped: 0 })
    const text = String(sendMail.mock.calls[0]![0].text).toLowerCase()
    expect(text).not.toContain('bỏ học')
    expect(text).toContain('bận')
  })
})

describe('collectWeeklyData', () => {
  it('chỉ đọc daily_usage + learning_progress — không chạm nguồn dữ liệu riêng tư nào khác', async () => {
    routeSql()
    await collectWeeklyData(LEARNER, 'Na', WEEK_START)
    const tables = query.mock.calls.map((c) => String(c[0]).toLowerCase())
    for (const t of tables) {
      expect(t).not.toContain('companion_messages')
      expect(t).not.toContain('memories')
      expect(t).not.toContain('neuro')
      expect(t).not.toContain('mistake')
      expect(t).not.toContain('location')
      expect(t).not.toContain('payments')
    }
  })

  it('mục tiêu tuần vô lý (>7) bị kẹp về 7, không có mục tiêu thì mặc định 5', async () => {
    routeSql({ progress: [{ weekly_goal: { goal: 99 }, cefr_unlocked: [], learned: ['a'] }] })
    expect((await collectWeeklyData(LEARNER, 'Na', WEEK_START))?.weeklyGoalDays).toBe(7)

    routeSql({ progress: [{ weekly_goal: null, cefr_unlocked: [], learned: ['a'] }] })
    expect((await collectWeeklyData(LEARNER, 'Na', WEEK_START))?.weeklyGoalDays).toBe(5)
  })

  it('ngày có bản ghi nhưng total = 0 KHÔNG tính là ngày đã học', async () => {
    routeSql({
      usage: [
        { day: '2026-08-24', learn_count: 0, total: 0 },
        { day: '2026-08-25', learn_count: 5, total: 5 },
      ],
    })
    expect((await collectWeeklyData(LEARNER, 'Na', WEEK_START))?.daysStudied).toBe(1)
  })
})

describe('computeStreakEndingAt', () => {
  it('đếm lùi liên tiếp từ ngày cuối tuần', () => {
    const days = new Set(['2026-08-28', '2026-08-29', '2026-08-30'])
    expect(computeStreakEndingAt(days, '2026-08-30')).toBe(3)
  })

  it('đứt ở giữa thì chỉ tính đoạn cuối', () => {
    const days = new Set(['2026-08-24', '2026-08-29', '2026-08-30'])
    expect(computeStreakEndingAt(days, '2026-08-30')).toBe(2)
  })

  it('ngày cuối không học → 0, không âm', () => {
    expect(computeStreakEndingAt(new Set(['2026-08-24']), '2026-08-30')).toBe(0)
    expect(computeStreakEndingAt(new Set(), '2026-08-30')).toBe(0)
  })
})

describe('latestCefrLevel', () => {
  it('lấy cấp CAO NHẤT, bỏ qua giá trị rác', () => {
    expect(latestCefrLevel(['A1', 'B2', 'A2'])).toBe('B2')
    expect(latestCefrLevel(['linh tinh'])).toBeUndefined()
    expect(latestCefrLevel([])).toBeUndefined()
  })
})
