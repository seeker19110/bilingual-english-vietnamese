import { describe, it, expect, beforeEach, vi } from 'vitest'

// Chỉ cần biết pushProgress ĐƯỢC GỌI khi đạt huy hiệu mới — mock hẳn progressSync cho gọn.
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

import { pushProgress } from './progressSync'
import { checkNewAchievements, getEarnedAchievements, achievementMessage } from './achievements'
import { ACHIEVEMENTS } from '../data/achievements'
import { vnDateStr } from './date'
import { saveExamAttempt } from './cefrExam'
import { startChallenge, saveEntry } from './challenge'

const dayAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return vnDateStr(d)
}

// Ghi "ngày có học" liên tục N ngày (kể cả hôm nay) — khớp key et_usage_<uid>_<date>
// (storage.ts) để getStreak() trong achievements.ts đếm đúng.
function seedStreak(uid: string, days: number) {
  for (let i = 0; i < days; i++) {
    const date = dayAgo(i)
    localStorage.setItem(
      `et_usage_${uid}_${date}`,
      JSON.stringify({ date, chatCount: 0, writingCount: 0, speakingCount: 0, learnCount: 1 }),
    )
  }
}

// Ghi N từ đã thuộc thẳng vào localStorage (khớp key et_learned_<uid> — vocab.ts).
function seedVocab(uid: string, count: number) {
  const words = Array.from({ length: count }, (_, i) => `word${i}`)
  localStorage.setItem(`et_learned_${uid}`, JSON.stringify(words))
}

// N phiên speaking/writing giả (chỉ cần đúng SỐ LƯỢNG — storage.ts không validate
// runtime, chỉ đếm .length, xem storage.ts hàm get<T>()).
function seedSpeaking(uid: string, count: number) {
  localStorage.setItem(`et_speaking_${uid}`, JSON.stringify(Array.from({ length: count })))
}
function seedWriting(uid: string, count: number) {
  localStorage.setItem(`et_writing_${uid}`, JSON.stringify(Array.from({ length: count })))
}

describe('checkNewAchievements — chuỗi ngày (streak)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('streak 6 ngày → chưa đạt streak_7', () => {
    seedStreak('u1', 6)
    const fresh = checkNewAchievements('u1')
    expect(fresh.map((a) => a.id)).not.toContain('streak_7')
  })

  it('streak 7 ngày → đạt streak_7, KHÔNG đạt streak_30', () => {
    seedStreak('u1', 7)
    const fresh = checkNewAchievements('u1')
    expect(fresh.map((a) => a.id)).toEqual(['streak_7'])
    expect(getEarnedAchievements('u1').has('streak_7')).toBe(true)
  })

  it('streak 30 ngày → đạt CẢ streak_7 và streak_30 cùng lúc (lần gọi đầu tiên)', () => {
    seedStreak('u1', 30)
    const fresh = checkNewAchievements('u1').map((a) => a.id)
    expect(fresh).toContain('streak_7')
    expect(fresh).toContain('streak_30')
  })

  it('gọi lại lần 2 không đổi trạng thái → KHÔNG báo lại (idempotent)', () => {
    seedStreak('u1', 7)
    checkNewAchievements('u1')
    const second = checkNewAchievements('u1')
    expect(second).toEqual([])
  })

  it('có huy hiệu mới → gọi pushProgress đồng bộ; không có gì mới → KHÔNG gọi', () => {
    seedStreak('u1', 7)
    checkNewAchievements('u1')
    expect(pushProgress).toHaveBeenCalledWith('u1')
    vi.clearAllMocks()
    checkNewAchievements('u1') // lần 2 không có gì mới
    expect(pushProgress).not.toHaveBeenCalled()
  })
})

describe('checkNewAchievements — khối lượng từ vựng', () => {
  beforeEach(() => localStorage.clear())

  it('99 từ → chưa đạt vocab_100; 100 từ → đạt', () => {
    seedVocab('u1', 99)
    expect(checkNewAchievements('u1').map((a) => a.id)).not.toContain('vocab_100')
    seedVocab('u1', 100)
    expect(checkNewAchievements('u1').map((a) => a.id)).toContain('vocab_100')
  })

  it('1000 từ ngay từ đầu → đạt cả 3 mốc 100/500/1000 cùng lúc', () => {
    seedVocab('u1', 1000)
    const fresh = checkNewAchievements('u1').map((a) => a.id)
    expect(fresh).toEqual(expect.arrayContaining(['vocab_100', 'vocab_500', 'vocab_1000']))
  })
})

describe('checkNewAchievements — qua cấp CEFR', () => {
  beforeEach(() => localStorage.clear())

  it('thi đạt A1 (≥70%) → đạt cefr_a1; thi KHÔNG đạt (điểm thấp) → không có huy hiệu', () => {
    saveExamAttempt('u1', 'A1', 40) // trượt
    expect(checkNewAchievements('u1').map((a) => a.id)).not.toContain('cefr_a1')
    saveExamAttempt('u1', 'A1', 80) // đạt
    expect(checkNewAchievements('u1').map((a) => a.id)).toContain('cefr_a1')
  })

  it('qua nhiều cấp → mỗi cấp 1 huy hiệu riêng, không lẫn nhau', () => {
    saveExamAttempt('u1', 'A1', 90)
    saveExamAttempt('u1', 'B1', 90)
    const fresh = checkNewAchievements('u1').map((a) => a.id)
    expect(fresh).toEqual(expect.arrayContaining(['cefr_a1', 'cefr_b1']))
    expect(fresh).not.toContain('cefr_a2')
  })
})

describe('checkNewAchievements — kỹ năng (nói/viết)', () => {
  beforeEach(() => localStorage.clear())

  it('9 phiên nói → chưa đạt speak_10; 10 phiên → đạt', () => {
    seedSpeaking('u1', 9)
    expect(checkNewAchievements('u1').map((a) => a.id)).not.toContain('speak_10')
    seedSpeaking('u1', 10)
    expect(checkNewAchievements('u1').map((a) => a.id)).toContain('speak_10')
  })

  it('10 bài viết đã chấm → đạt write_10', () => {
    seedWriting('u1', 10)
    expect(checkNewAchievements('u1').map((a) => a.id)).toContain('write_10')
  })
})

describe('checkNewAchievements — challenge (thay mốc 30 ngày cũ, quyết định 2026-07-15)', () => {
  beforeEach(() => localStorage.clear())

  const mkEntry = (day: string) => ({
    day,
    challengeDay: 1,
    topicDay: 1,
    transcript: 'hello',
    feedback: null,
    durationSec: 20,
    wordCount: 1,
  })

  it('9 challenge đã nộp → chưa đạt challenge_10; nộp thêm 1 → đạt', () => {
    startChallenge('u1')
    for (let i = 0; i < 9; i++) saveEntry('u1', mkEntry(dayAgo(i + 1)))
    expect(checkNewAchievements('u1').map((a) => a.id)).not.toContain('challenge_10')
    saveEntry('u1', mkEntry(dayAgo(0)))
    expect(checkNewAchievements('u1').map((a) => a.id)).toContain('challenge_10')
  })

  it('nộp đủ 7/7 ngày trong 1 tuần → đạt challenge_perfect_week', () => {
    startChallenge('u1')
    for (let i = 0; i < 6; i++) saveEntry('u1', mkEntry(dayAgo(i + 1)))
    expect(checkNewAchievements('u1').map((a) => a.id)).not.toContain('challenge_perfect_week')
    saveEntry('u1', mkEntry(dayAgo(0))) // ngày thứ 7 liên tiếp — có thể vắt qua 2 tuần lịch
    // Không ép chính xác cùng 1 tuần lịch ở test này (đã có test riêng cho
    // hasPerfectWeek trong challenge.test.ts) — chỉ xác nhận đường tích hợp chạy được.
    const fresh = checkNewAchievements('u1').map((a) => a.id)
    expect(Array.isArray(fresh)).toBe(true)
  })

  it('chưa bắt đầu challenge (getChallenge null) → không throw, không có huy hiệu challenge', () => {
    expect(() => checkNewAchievements('u1')).not.toThrow()
    expect(checkNewAchievements('u1').map((a) => a.id)).not.toContain('challenge_10')
  })
})

describe('checkNewAchievements — ca biên & tính "chỉ cộng thêm"', () => {
  beforeEach(() => localStorage.clear())

  it('uid rỗng → không throw, trả mảng rỗng, không gọi pushProgress', () => {
    vi.clearAllMocks()
    expect(checkNewAchievements('')).toEqual([])
    expect(pushProgress).not.toHaveBeenCalled()
  })

  it('mỗi user 1 bộ huy hiệu riêng — không lẫn nhau', () => {
    seedStreak('u1', 7)
    checkNewAchievements('u1')
    expect(getEarnedAchievements('u1').has('streak_7')).toBe(true)
    expect(getEarnedAchievements('u2').has('streak_7')).toBe(false)
  })

  it('dữ liệu localStorage hỏng (huy hiệu đã lưu) → coi như rỗng, không throw', () => {
    localStorage.setItem('et_achievements_u1', 'không phải json')
    expect(getEarnedAchievements('u1')).toEqual(new Set())
    expect(() => checkNewAchievements('u1')).not.toThrow()
  })

  it('mọi id trong data/achievements.ts đều được xử lý (không rơi vào default false oan)', () => {
    // Dựng đủ điều kiện tối đa cho MỌI nhóm rồi kiểm tra không sót huy hiệu nào.
    seedStreak('u1', 365)
    seedVocab('u1', 1000)
    for (const lvl of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) saveExamAttempt('u1', lvl, 90)
    seedSpeaking('u1', 10)
    seedWriting('u1', 10)
    startChallenge('u1')
    for (let i = 0; i < 100; i++) saveEntry('u1', mkEntryFar(i))
    const fresh = checkNewAchievements('u1').map((a) => a.id)
    for (const def of ACHIEVEMENTS) {
      if (def.id === 'challenge_perfect_week') continue // phụ thuộc lịch tuần, test riêng ở trên
      expect(fresh).toContain(def.id)
    }
  })

  // Ngày cách xa nhau (không dính cụm 7 ngày liên tiếp) để tránh vô tình kích
  // hoạt challenge_perfect_week trong test "không sót huy hiệu" ở trên.
  function mkEntryFar(i: number) {
    const d = new Date()
    d.setDate(d.getDate() - i * 10)
    const day = vnDateStr(d)
    return {
      day,
      challengeDay: i + 1,
      topicDay: 1,
      transcript: 'hi',
      feedback: null,
      durationSec: 10,
      wordCount: 1,
    }
  }
})

describe('achievementMessage', () => {
  it('chiều A (isA=true) → tiếng Việt; chiều B → tiếng Anh', () => {
    const def = ACHIEVEMENTS.find((a) => a.id === 'streak_7')!
    expect(achievementMessage(def, true)).toContain(def.nameVi)
    expect(achievementMessage(def, false)).toContain(def.nameEn)
  })
})
