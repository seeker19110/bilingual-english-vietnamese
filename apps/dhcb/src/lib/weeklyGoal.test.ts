import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Chỉ cần biết pushProgress ĐƯỢC GỌI khi đổi mục tiêu — mock hẳn progressSync cho gọn.
vi.mock('./progressSync.js', () => ({ pushProgress: vi.fn() }))

import { pushProgress } from './progressSync'
import {
  weekStartStr,
  getWeeklyGoal,
  setWeeklyGoal,
  getWeekDays,
  getWeeklyProgress,
  shouldCelebrateWeeklyGoal,
  markWeeklyGoalCelebrated,
  DEFAULT_WEEKLY_GOAL,
} from './weeklyGoal'

const usageKey = (uid: string, date: string) => `et_usage_${uid}_${date}`
// Ghi "ngày có học" thẳng theo chuỗi ngày (giờ VN) — khớp key của storage.ts/stats.ts.
const setActivityOn = (uid: string, date: string) => {
  localStorage.setItem(
    usageKey(uid, date),
    JSON.stringify({ date, chatCount: 0, writingCount: 0, speakingCount: 0, learnCount: 1 }),
  )
}

describe('weekStartStr — Thứ 2 của tuần theo giờ Việt Nam', () => {
  it('giữa tuần (Thứ 4 15/07/2026) → Thứ 2 13/07', () => {
    expect(weekStartStr(new Date('2026-07-15T12:00:00+07:00'))).toBe('2026-07-13')
  })

  it('đúng Thứ 2 (kể cả rạng sáng) → chính nó', () => {
    expect(weekStartStr(new Date('2026-07-13T00:30:00+07:00'))).toBe('2026-07-13')
  })

  it('Chủ nhật cuối tuần → vẫn thuộc tuần bắt đầu Thứ 2 trước đó', () => {
    expect(weekStartStr(new Date('2026-07-19T23:00:00+07:00'))).toBe('2026-07-13')
  })

  it('ranh giới múi giờ: UTC còn Chủ nhật nhưng VN đã sang Thứ 2 → tính theo VN', () => {
    // 2026-07-12T18:00Z = 2026-07-13 01:00 giờ VN (Thứ 2) → tuần MỚI bắt đầu
    expect(weekStartStr(new Date('2026-07-12T18:00:00Z'))).toBe('2026-07-13')
  })
})

describe('getWeeklyGoal / setWeeklyGoal', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('chưa từng chọn → mặc định 5 ngày/tuần', () => {
    expect(getWeeklyGoal('u1')).toBe(DEFAULT_WEEKLY_GOAL)
  })

  it('lưu rồi đọc lại đúng; mỗi user một giá trị riêng', () => {
    setWeeklyGoal('u1', 3)
    setWeeklyGoal('u2', 7)
    expect(getWeeklyGoal('u1')).toBe(3)
    expect(getWeeklyGoal('u2')).toBe(7)
  })

  it('đổi mục tiêu → đồng bộ Supabase (gọi pushProgress)', () => {
    setWeeklyGoal('u1', 7)
    expect(pushProgress).toHaveBeenCalledWith('u1')
  })

  it('dữ liệu hỏng/không hợp lệ trong localStorage → rơi về mặc định, không ném lỗi', () => {
    localStorage.setItem('et_weekly_goal_u1', 'không phải json')
    expect(getWeeklyGoal('u1')).toBe(DEFAULT_WEEKLY_GOAL)
    localStorage.setItem('et_weekly_goal_u1', JSON.stringify({ goal: 99, updatedAt: 'x' }))
    expect(getWeeklyGoal('u1')).toBe(DEFAULT_WEEKLY_GOAL)
  })
})

describe('getWeeklyProgress — đếm ngày học trong tuần (Thứ 2 → hôm nay)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Cố định "bây giờ" = Thứ 4 15/07/2026 trưa giờ VN → tuần này bắt đầu 13/07.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T12:00:00+07:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('tuần chỉ tính T2→hôm nay: học T2 + T4, còn Chủ nhật TUẦN TRƯỚC không tính', () => {
    setActivityOn('u1', '2026-07-12') // Chủ nhật tuần trước — phải bị loại
    setActivityOn('u1', '2026-07-13') // Thứ 2
    setActivityOn('u1', '2026-07-15') // Thứ 4 (hôm nay)
    const p = getWeeklyProgress('u1')
    expect(p.weekStart).toBe('2026-07-13')
    expect(p.daysDone).toBe(2)
    expect(getWeekDays('u1')).toHaveLength(3) // T2, T3, T4 — chỉ ngày đã trôi qua
  })

  it('mục tiêu 3 + học đủ 3 ngày → achieved; mặc định 5 → chưa', () => {
    setActivityOn('u1', '2026-07-13')
    setActivityOn('u1', '2026-07-14')
    setActivityOn('u1', '2026-07-15')
    expect(getWeeklyProgress('u1').achieved).toBe(false) // goal mặc định 5
    setWeeklyGoal('u1', 3)
    expect(getWeeklyProgress('u1').achieved).toBe(true)
  })
})

describe('Ăn mừng mục tiêu tuần — 1 lần/tuần', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T12:00:00+07:00')) // Thứ 4, tuần 13/07
  })
  afterEach(() => vi.useRealTimers())

  it('chưa đạt mục tiêu → không ăn mừng', () => {
    setWeeklyGoal('u1', 3)
    setActivityOn('u1', '2026-07-15')
    expect(shouldCelebrateWeeklyGoal('u1')).toBe(false)
  })

  it('đạt mục tiêu → ăn mừng; đánh dấu rồi → không lặp trong cùng tuần', () => {
    setWeeklyGoal('u1', 3)
    setActivityOn('u1', '2026-07-13')
    setActivityOn('u1', '2026-07-14')
    setActivityOn('u1', '2026-07-15')
    expect(shouldCelebrateWeeklyGoal('u1')).toBe(true)
    markWeeklyGoalCelebrated('u1')
    expect(shouldCelebrateWeeklyGoal('u1')).toBe(false) // idempotent trong tuần
  })

  it('đánh dấu của TUẦN TRƯỚC không chặn ăn mừng tuần này', () => {
    setWeeklyGoal('u1', 3)
    setActivityOn('u1', '2026-07-13')
    setActivityOn('u1', '2026-07-14')
    setActivityOn('u1', '2026-07-15')
    localStorage.setItem('et_weekly_goal_celebrated_u1', '2026-07-06') // tuần trước
    expect(shouldCelebrateWeeklyGoal('u1')).toBe(true)
  })
})
