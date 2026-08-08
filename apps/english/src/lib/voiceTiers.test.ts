import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  isValidVoiceId,
  getAllowedVoices,
  pickRandomVoice,
  cacheAllowedVoices,
  getCachedAllowedVoices,
  pickRandomAllowedVoice,
  resolveActualVoice,
  VOICE_IDS,
  DEFAULT_SEED_VOICE_IDS,
  STUDIO_VOICE_IDS,
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

describe('pickRandomAllowedVoice — loại giọng Studio khi đọc tiếng Việt', () => {
  beforeEach(() => localStorage.clear())

  it("lang='vi-VN' (gói VIP có Studio) → không bao giờ bốc Studio-O/Studio-Q", () => {
    cacheAllowedVoices('vip', new Date('2020-01-01'))
    for (let i = 0; i < 100; i++) {
      const v = pickRandomAllowedVoice({ lang: 'vi-VN' })
      expect(STUDIO_VOICE_IDS).not.toContain(v)
    }
  })

  it("lang='en-US' vẫn cho phép Studio (giọng cao cấp chỉ có ở tiếng Anh)", () => {
    cacheAllowedVoices('vip', new Date('2020-01-01'))
    const picked = new Set<string>()
    for (let i = 0; i < 400; i++) picked.add(pickRandomAllowedVoice({ lang: 'en-US' }))
    expect(STUDIO_VOICE_IDS.some((v) => picked.has(v))).toBe(true)
  })

  it("cache chỉ có Studio + lang='vi-VN' → rơi về pool mặc định, vẫn không có Studio", () => {
    localStorage.setItem('voice_allowed_cache', JSON.stringify(STUDIO_VOICE_IDS))
    for (let i = 0; i < 20; i++) {
      const v = pickRandomAllowedVoice({ lang: 'vi-VN' })
      expect(STUDIO_VOICE_IDS).not.toContain(v)
      expect(VOICE_IDS).toContain(v)
    }
  })

  it('không truyền options → giữ hành vi cũ (mặc định en-US, không có Rachel)', () => {
    cacheAllowedVoices('vip', new Date('2020-01-01'))
    for (let i = 0; i < 20; i++) expect(pickRandomAllowedVoice()).not.toBe('Rachel')
  })
})

describe('pickRandomAllowedVoice — không lặp lại giọng vừa phát (exclude)', () => {
  beforeEach(() => localStorage.clear())

  it('gói Free (4 giọng) → không bao giờ bốc lại giọng đang loại trừ', () => {
    cacheAllowedVoices('free', new Date('2020-01-01'))
    for (let i = 0; i < 100; i++) {
      expect(pickRandomAllowedVoice({ exclude: 'Kore' })).not.toBe('Kore')
    }
  })

  it('bể chỉ còn ĐÚNG 1 giọng → vẫn trả về giọng đó (không được rỗng/undefined)', () => {
    localStorage.setItem('voice_allowed_cache', JSON.stringify(['Kore']))
    expect(pickRandomAllowedVoice({ exclude: 'Kore' })).toBe('Kore')
  })

  it('loại trừ giọng KHÔNG nằm trong bể → không ảnh hưởng kết quả', () => {
    localStorage.setItem('voice_allowed_cache', JSON.stringify(['Kore', 'Puck']))
    for (let i = 0; i < 20; i++) {
      expect(['Kore', 'Puck']).toContain(pickRandomAllowedVoice({ exclude: 'Umbriel' }))
    }
  })

  it('vừa loại Studio (vi-VN) vừa loại giọng cũ → cả 2 điều kiện đều đúng', () => {
    cacheAllowedVoices('vip', new Date('2020-01-01'))
    for (let i = 0; i < 100; i++) {
      const v = pickRandomAllowedVoice({ lang: 'vi-VN', exclude: 'Kore' })
      expect(v).not.toBe('Kore')
      expect(STUDIO_VOICE_IDS).not.toContain(v)
      expect(v).not.toBe('Rachel')
    }
  })
})

describe('resolveActualVoice — chọn giọng để CACHE audio theo (bug đã gặp: cache theo giọng đoán)', () => {
  it('server không hạ giọng (voice thật khớp giọng đoán) → trả đúng giọng đoán', () => {
    expect(resolveActualVoice('Puck', 'Puck')).toBe('Puck')
  })

  it('server HẠ giọng đoán xuống giọng khác (ngoài quyền gói) → PHẢI trả giọng server thật, không phải giọng đoán', () => {
    // Đây chính là ca lỗi thật: client đoán 'Charon' (VIP) nhưng gói hiện tại chỉ Free nên
    // server hạ về 'Kore'. Nếu hàm trả về 'Charon' (giọng đoán) thì audio Kore sẽ bị cache
    // nhầm dưới nhãn Charon — lần random trúng lại Charon sẽ phát nhầm audio Kore đã lưu.
    expect(resolveActualVoice('Charon', 'Kore')).toBe('Kore')
  })

  it('server không trả voice (undefined, vd lỗi mạng) → dùng tạm giọng đoán', () => {
    expect(resolveActualVoice('Aoede', undefined)).toBe('Aoede')
  })

  it('server trả voice rỗng → dùng tạm giọng đoán', () => {
    expect(resolveActualVoice('Aoede', '')).toBe('Aoede')
  })

  it('server trả voice không hợp lệ (lỗi/hỏng dữ liệu) → dùng tạm giọng đoán, không tin dữ liệu bẩn', () => {
    expect(resolveActualVoice('Aoede', 'khong-ton-tai')).toBe('Aoede')
  })

  it('mọi VoiceId hợp lệ đều được server trả về nguyên vẹn (không rơi về giọng đoán)', () => {
    for (const id of VOICE_IDS) {
      expect(resolveActualVoice('Kore', id)).toBe(id)
    }
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
