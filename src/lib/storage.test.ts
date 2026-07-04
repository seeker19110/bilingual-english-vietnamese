import { describe, it, expect, beforeEach, vi } from 'vitest'

// storage.ts kéo theo cloud→supabase (sẽ ném lỗi khi thiếu env) — daysSinceLastStudy
// chỉ đọc localStorage nên chỉ cần stub supabase là đủ chạy offline.
vi.mock('./supabase', () => ({ supabase: {} }))

import { daysSinceLastStudy } from './storage'
import { vnDateStr } from './date'

const usageKey = (uid: string, date: string) => `et_usage_${uid}_${date}`
const dayAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return vnDateStr(d)
}
const activity = (date: string, learnCount = 1) => ({
  date,
  chatCount: 0,
  writingCount: 0,
  speakingCount: 0,
  sttCount: 0,
  learnCount,
})

describe('daysSinceLastStudy — phát hiện "quay lại sau khi nghỉ"', () => {
  beforeEach(() => localStorage.clear())

  it('có học hôm nay → 0', () => {
    localStorage.setItem(usageKey('u1', dayAgo(0)), JSON.stringify(activity(dayAgo(0))))
    expect(daysSinceLastStudy('u1')).toBe(0)
  })

  it('lần cuối học là 3 ngày trước → trả về 3', () => {
    localStorage.setItem(usageKey('u1', dayAgo(3)), JSON.stringify(activity(dayAgo(3))))
    expect(daysSinceLastStudy('u1')).toBe(3)
  })

  it('chưa từng có hoạt động → null', () => {
    expect(daysSinceLastStudy('u1')).toBeNull()
  })
})
