// Test lib onboarding (U-3): cache localStorage, đọc từ GET /api/profile (mock fetch), map
// phút/ngày → tốc độ học.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCachedOnboarding, cacheOnboarding, fetchOnboarding, minutesToSpeed } from './onboarding'

// Giả lập GET /api/profile trả về body cho trước (hoặc lỗi HTTP nếu ok=false).
function mockProfileResponse(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => body }) as unknown as Response),
  )
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
    mockProfileResponse({
      userLevel: 'intermediate',
      goal: 'ielts',
      dailyMinutes: 30,
      onboarded: true,
    })
    const d = await fetchOnboarding('u1')
    expect(d).toEqual({ level: 'intermediate', goal: 'ielts', dailyMinutes: 30 })
    expect(getCachedOnboarding('u1')).toEqual(d) // lần sau đọc cache, khỏi gọi DB
  })

  it('chưa onboarded → null (không cache)', async () => {
    mockProfileResponse({
      userLevel: 'beginner',
      goal: 'daily',
      dailyMinutes: 10,
      onboarded: false,
    })
    expect(await fetchOnboarding('u1')).toBeNull()
    expect(getCachedOnboarding('u1')).toBeNull()
  })

  it('lỗi HTTP hoặc userLevel lạ → null', async () => {
    mockProfileResponse(null, false)
    expect(await fetchOnboarding('u1')).toBeNull()
    mockProfileResponse({ userLevel: 'weird', onboarded: true })
    expect(await fetchOnboarding('u1')).toBeNull()
  })
})
