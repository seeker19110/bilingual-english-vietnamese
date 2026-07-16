import { describe, it, expect, beforeEach, vi } from 'vitest'

// comeback.ts → storage.ts → cloud.ts → supabase (ném lỗi khi thiếu env). Stub để
// chạy offline — giống storage.test.ts (daysSinceLastActivity chỉ đọc localStorage).
vi.mock('./supabase', () => ({ supabase: {} }))

import {
  shouldShowComeback,
  dismissComebackToday,
  comebackDaysAway,
  COMEBACK_THRESHOLD_DAYS,
} from './comeback'
import { vnDateStr } from './date'

const usageKey = (uid: string, date: string) => `et_usage_${uid}_${date}`
const dayAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return vnDateStr(d)
}
const setActivity = (uid: string, daysAgo: number) => {
  const date = dayAgo(daysAgo)
  localStorage.setItem(
    usageKey(uid, date),
    JSON.stringify({ date, chatCount: 0, writingCount: 0, speakingCount: 0, learnCount: 1 }),
  )
}

describe('shouldShowComeback', () => {
  beforeEach(() => localStorage.clear())

  it('vắng đúng ngưỡng (3 ngày) → hiện', () => {
    setActivity('u1', COMEBACK_THRESHOLD_DAYS)
    expect(shouldShowComeback('u1')).toBe(true)
  })

  it('vắng ít hơn ngưỡng (2 ngày) → chưa hiện', () => {
    setActivity('u1', COMEBACK_THRESHOLD_DAYS - 1)
    expect(shouldShowComeback('u1')).toBe(false)
  })

  it('đã học hôm nay → không hiện (không phải "đi vắng")', () => {
    setActivity('u1', 0)
    expect(shouldShowComeback('u1')).toBe(false)
  })

  it('chưa từng học (người dùng mới) → không hiện', () => {
    expect(shouldShowComeback('u1')).toBe(false)
  })

  it('uid rỗng → không hiện, không throw', () => {
    expect(shouldShowComeback('')).toBe(false)
  })

  it('đã tắt banner HÔM NAY → không hiện lại dù còn đủ điều kiện', () => {
    setActivity('u1', 5)
    expect(shouldShowComeback('u1')).toBe(true)
    dismissComebackToday('u1')
    expect(shouldShowComeback('u1')).toBe(false)
  })

  it('tắt của NGÀY HÔM QUA không chặn hiện lại hôm nay', () => {
    setActivity('u1', 5)
    localStorage.setItem('et_comeback_dismissed_u1', dayAgo(1))
    expect(shouldShowComeback('u1')).toBe(true)
  })

  it('mỗi người dùng tắt riêng — không ảnh hưởng lẫn nhau', () => {
    setActivity('u1', 5)
    setActivity('u2', 5)
    dismissComebackToday('u1')
    expect(shouldShowComeback('u1')).toBe(false)
    expect(shouldShowComeback('u2')).toBe(true)
  })
})

describe('comebackDaysAway', () => {
  beforeEach(() => localStorage.clear())

  it('trả đúng số ngày đã vắng', () => {
    setActivity('u1', 7)
    expect(comebackDaysAway('u1')).toBe(7)
  })

  it('chưa từng học → 0 (không âm, không lỗi hiển thị)', () => {
    expect(comebackDaysAway('u1')).toBe(0)
  })
})
