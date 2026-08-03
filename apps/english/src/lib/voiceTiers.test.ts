import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  isValidVoiceId,
  getAllowedVoices,
  pickRandomVoice,
  cacheAllowedVoices,
  getCachedAllowedVoices,
  pickRandomAllowedVoice,
  VOICE_IDS,
  DEFAULT_SEED_VOICE_IDS,
} from './voiceTiers'

describe('isValidVoiceId', () => {
  it('nhận đúng ID hợp lệ, từ chối ID lạ', () => {
    expect(isValidVoiceId('Kore')).toBe(true)
    expect(isValidVoiceId('khong-ton-tai')).toBe(false)
  })
})

describe('getAllowedVoices — theo gói (không khuyến mãi)', () => {
  const noPromo = new Date('2020-01-01')

  it('free: 4 giọng', () => {
    expect(getAllowedVoices('free', noPromo)).toEqual(['Kore', 'Aoede', 'Puck', 'Charon'])
  })

  it('pro: 8 giọng seed sẵn', () => {
    expect(getAllowedVoices('pro', noPromo)).toEqual(DEFAULT_SEED_VOICE_IDS)
  })

  it('vip: tất cả giọng', () => {
    expect(getAllowedVoices('vip', noPromo)).toEqual(VOICE_IDS)
  })
})

describe('pickRandomVoice', () => {
  const noPromo = new Date('2020-01-01')

  it('luôn chọn đúng giới tính trong phạm vi gói được phép', () => {
    for (let i = 0; i < 20; i++) {
      const v = pickRandomVoice('female', 'free', noPromo)
      expect(['Kore', 'Aoede']).toContain(v)
    }
  })

  it('gói vip → có thể ra bất kỳ giọng nam nào trong VOICE_IDS', () => {
    const v = pickRandomVoice('male', 'vip', noPromo)
    expect(VOICE_IDS).toContain(v)
  })
})

describe('cache "giọng gói hiện tại cho phép" (localStorage)', () => {
  beforeEach(() => localStorage.clear())

  it('chưa cache → trả về mặc định an toàn (free)', () => {
    expect(getCachedAllowedVoices()).toEqual(['Kore', 'Aoede', 'Puck', 'Charon'])
  })

  it('cacheAllowedVoices rồi đọc lại đúng danh sách của gói', () => {
    cacheAllowedVoices('pro', new Date('2020-01-01'))
    expect(getCachedAllowedVoices()).toEqual(DEFAULT_SEED_VOICE_IDS)
  })

  it('dữ liệu cache không phải mảng hợp lệ → về mặc định an toàn', () => {
    localStorage.setItem('voice_allowed_cache', JSON.stringify({ not: 'array' }))
    expect(getCachedAllowedVoices()).toEqual(['Kore', 'Aoede', 'Puck', 'Charon'])
  })

  it('dữ liệu cache chứa ID lạ (bị sửa tay) → về mặc định an toàn', () => {
    localStorage.setItem('voice_allowed_cache', JSON.stringify(['hacker-voice']))
    expect(getCachedAllowedVoices()).toEqual(['Kore', 'Aoede', 'Puck', 'Charon'])
  })

  it('cache là JSON hỏng → bắt lỗi, về mặc định an toàn', () => {
    localStorage.setItem('voice_allowed_cache', '{bad json')
    expect(getCachedAllowedVoices()).toEqual(['Kore', 'Aoede', 'Puck', 'Charon'])
  })
})

describe('pickRandomAllowedVoice — trộn nam/nữ, loại ElevenLabs (Rachel)', () => {
  beforeEach(() => localStorage.clear())

  it('không có cache → bốc trong pool mặc định (không có Rachel)', () => {
    for (let i = 0; i < 20; i++) {
      const v = pickRandomAllowedVoice()
      expect(v).not.toBe('Rachel')
    }
  })

  it('cache có Rachel → vẫn bị loại khỏi kết quả', () => {
    localStorage.setItem('voice_allowed_cache', JSON.stringify(['Rachel', 'Kore']))
    for (let i = 0; i < 10; i++) {
      expect(pickRandomAllowedVoice()).toBe('Kore')
    }
  })

  it('cache chỉ có Rachel (sau khi lọc rỗng) → rơi về pool mặc định loại trừ Eleven', () => {
    localStorage.setItem('voice_allowed_cache', JSON.stringify(['Rachel']))
    const v = pickRandomAllowedVoice()
    expect(v).not.toBe('Rachel')
    expect(VOICE_IDS).toContain(v)
  })
})

// Giữ Math.random ổn định không cần thiết ở trên vì đã kiểm tra theo tập hợp — nhưng
// đảm bảo mock cũng hoạt động đúng khi cần test xác định.
describe('pickRandomVoice — xác định với Math.random mock', () => {
  it('Math.random = 0 → luôn chọn phần tử đầu trong candidates', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const v = pickRandomVoice('female', 'free', new Date('2020-01-01'))
    expect(v).toBe('Kore')
    spy.mockRestore()
  })
})
