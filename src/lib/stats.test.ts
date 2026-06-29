import { describe, it, expect, beforeEach, vi } from 'vitest'

// stats.ts kéo theo storage→cloud→supabase và ai→supabase (sẽ ném lỗi khi thiếu env).
// getActivity7Days chỉ đọc localStorage nên chỉ cần stub supabase là đủ chạy offline.
vi.mock('./supabase', () => ({ supabase: {} }))

import { getActivity7Days, getWeekTotal } from './stats'

const today = () => new Date().toISOString().slice(0, 10)
const usageKey = (uid: string, date: string) => `et_usage_${uid}_${date}`

describe('stats — hoạt động theo ngày', () => {
  beforeEach(() => localStorage.clear())

  it('mảng 7 ngày, ngày cuối là hôm nay', () => {
    const days = getActivity7Days('u1')
    expect(days).toHaveLength(7)
    expect(days[6].date).toBe(today())
  })

  // BUG-5: ngày CHỈ học từ vựng (learnCount > 0) phải tính là "có hoạt động" để
  // khớp với getStreak() — nếu không, biểu đồ Dashboard hiện trống dù streak vẫn cộng.
  it('ngày chỉ học từ vựng vẫn được tính là có hoạt động', () => {
    localStorage.setItem(
      usageKey('u1', today()),
      JSON.stringify({
        date: today(),
        chatCount: 0,
        writingCount: 0,
        speakingCount: 0,
        sttCount: 0,
        learnCount: 3,
      }),
    )
    const days = getActivity7Days('u1')
    expect(days[6].count).toBe(3)
    expect(days[6].active).toBe(true)
    expect(getWeekTotal('u1')).toBe(3)
  })

  it('ngày không có hoạt động → count 0, active false', () => {
    const days = getActivity7Days('u1')
    expect(days[6].count).toBe(0)
    expect(days[6].active).toBe(false)
  })
})
