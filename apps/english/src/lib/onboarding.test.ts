// Test lib onboarding (U-3): cache localStorage, đọc từ GET /api/profile (mock fetch), map
// phút/ngày → tốc độ học.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCachedOnboarding,
  cacheOnboarding,
  fetchOnboarding,
  minutesToSpeed,
  pushAgeGroup,
} from './onboarding'

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
    cacheOnboarding('u1', {
      level: 'advanced',
      goal: 'work',
      dailyMinutes: 20,
      ageGroup: 'thanh_nien',
    })
    expect(getCachedOnboarding('u1')).toEqual({
      level: 'advanced',
      goal: 'work',
      dailyMinutes: 20,
      ageGroup: 'thanh_nien',
    })
    expect(getCachedOnboarding('u2')).toBeNull() // uid khác không thấy cache của u1
  })

  it('dữ liệu hỏng / level lạ → null (không crash)', () => {
    localStorage.setItem('et_onboarding_u1', 'not-json{{')
    expect(getCachedOnboarding('u1')).toBeNull()
    localStorage.setItem('et_onboarding_u1', JSON.stringify({ level: 'hacker' }))
    expect(getCachedOnboarding('u1')).toBeNull()
  })

  it('thiếu goal/dailyMinutes/ageGroup → điền mặc định (goal daily, 10 phút, người lớn)', () => {
    localStorage.setItem('et_onboarding_u1', JSON.stringify({ level: 'beginner' }))
    expect(getCachedOnboarding('u1')).toEqual({
      level: 'beginner',
      goal: 'daily',
      dailyMinutes: 10,
      ageGroup: 'nguoi_lon',
    })
  })

  it('ageGroup lạ → về mặc định người lớn (không tin dữ liệu localStorage bị sửa tay)', () => {
    localStorage.setItem(
      'et_onboarding_u1',
      JSON.stringify({ level: 'beginner', ageGroup: 'hacker' }),
    )
    expect(getCachedOnboarding('u1')?.ageGroup).toBe('nguoi_lon')
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
    expect(d).toEqual({
      level: 'intermediate',
      goal: 'ielts',
      dailyMinutes: 30,
      ageGroup: 'nguoi_lon',
    })
    expect(getCachedOnboarding('u1')).toEqual(d) // lần sau đọc cache, khỏi gọi DB
  })

  it('server trả ageGroup hợp lệ → giữ đúng giá trị đó (không phải luôn về mặc định)', async () => {
    mockProfileResponse({
      userLevel: 'beginner',
      goal: 'daily',
      dailyMinutes: 10,
      ageGroup: 'nhi_dong',
      onboarded: true,
    })
    const d = await fetchOnboarding('u1')
    expect(d?.ageGroup).toBe('nhi_dong')
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

  it('fetch ném lỗi mạng → bắt lỗi, trả null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    expect(await fetchOnboarding('u1')).toBeNull()
  })
})

describe('pushAgeGroup', () => {
  it('có cache sẵn → cập nhật cache local ngay + POST lên server thành công', async () => {
    cacheOnboarding('u1', {
      level: 'beginner',
      goal: 'daily',
      dailyMinutes: 10,
      ageGroup: 'nguoi_lon',
    })
    mockProfileResponse({})
    await pushAgeGroup('u1', 'thieu_nien')
    expect(getCachedOnboarding('u1')?.ageGroup).toBe('thieu_nien')
    expect(fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'POST' }))
  })

  it('chưa có cache → không cập nhật cache local, vẫn gọi server', async () => {
    mockProfileResponse({})
    await pushAgeGroup('u2', 'nguoi_lon')
    expect(getCachedOnboarding('u2')).toBeNull()
    expect(fetch).toHaveBeenCalled()
  })

  it('server trả lỗi HTTP → chỉ warn, không throw', async () => {
    mockProfileResponse({}, false)
    await expect(pushAgeGroup('u1', 'nguoi_lon')).resolves.toBeUndefined()
  })

  it('fetch ném lỗi mạng → bắt lỗi, không throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    await expect(pushAgeGroup('u1', 'nguoi_lon')).resolves.toBeUndefined()
  })
})
