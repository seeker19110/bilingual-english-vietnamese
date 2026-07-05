// Test lib onboarding (U-3): cache localStorage, đọc từ Supabase (mock), map
// phút/ngày → tốc độ học.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './supabase'
import { getCachedOnboarding, cacheOnboarding, fetchOnboarding, minutesToSpeed } from './onboarding'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

// Giả lập chuỗi supabase.from('profiles').select(...).eq(...).maybeSingle()
function mockProfileRow(row: unknown, error: unknown = null) {
  vi.mocked(supabase.from).mockReturnValue({
    select: () => ({
      eq: () => ({ maybeSingle: async () => ({ data: row, error }) }),
    }),
  } as never)
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('minutesToSpeed', () => {
  it('map đúng 4 mức phút của onboarding (5/10/20/30)', () => {
    expect(minutesToSpeed(5)).toBe(5)
    expect(minutesToSpeed(10)).toBe(10)
    expect(minutesToSpeed(20)).toBe(20)
    expect(minutesToSpeed(30)).toBe(20) // 30 phút cũng về tốc độ tối đa 20
  })

  it('giá trị lạ vẫn về 1 trong 3 tốc độ hợp lệ (ca biên)', () => {
    expect(minutesToSpeed(0)).toBe(5)
    expect(minutesToSpeed(-1)).toBe(5)
    expect(minutesToSpeed(7)).toBe(10)
    expect(minutesToSpeed(999)).toBe(20)
  })
})

describe('cache localStorage', () => {
  it('ghi rồi đọc lại đúng dữ liệu, tách theo uid', () => {
    cacheOnboarding('u1', { level: 'advanced', goal: 'work', dailyMinutes: 20 })
    expect(getCachedOnboarding('u1')).toEqual({
      level: 'advanced',
      goal: 'work',
      dailyMinutes: 20,
    })
    expect(getCachedOnboarding('u2')).toBeNull() // uid khác không thấy cache của u1
  })

  it('dữ liệu hỏng / level lạ → null (không crash)', () => {
    localStorage.setItem('et_onboarding_u1', 'not-json{{')
    expect(getCachedOnboarding('u1')).toBeNull()
    localStorage.setItem('et_onboarding_u1', JSON.stringify({ level: 'hacker' }))
    expect(getCachedOnboarding('u1')).toBeNull()
  })

  it('thiếu goal/dailyMinutes → điền mặc định (goal daily, 10 phút)', () => {
    localStorage.setItem('et_onboarding_u1', JSON.stringify({ level: 'beginner' }))
    expect(getCachedOnboarding('u1')).toEqual({
      level: 'beginner',
      goal: 'daily',
      dailyMinutes: 10,
    })
  })
})

describe('fetchOnboarding', () => {
  it('hàng hợp lệ → trả dữ liệu VÀ tự ghi cache', async () => {
    mockProfileRow({
      user_level: 'intermediate',
      goal: 'ielts',
      daily_minutes: 30,
      onboarded: true,
    })
    const d = await fetchOnboarding('u1')
    expect(d).toEqual({ level: 'intermediate', goal: 'ielts', dailyMinutes: 30 })
    expect(getCachedOnboarding('u1')).toEqual(d) // lần sau đọc cache, khỏi gọi DB
  })

  it('chưa onboarded → null (không cache)', async () => {
    mockProfileRow({ user_level: 'beginner', goal: 'daily', daily_minutes: 10, onboarded: false })
    expect(await fetchOnboarding('u1')).toBeNull()
    expect(getCachedOnboarding('u1')).toBeNull()
  })

  it('lỗi DB hoặc user_level lạ → null', async () => {
    mockProfileRow(null, { message: 'network' })
    expect(await fetchOnboarding('u1')).toBeNull()
    mockProfileRow({ user_level: 'weird', onboarded: true })
    expect(await fetchOnboarding('u1')).toBeNull()
  })
})
