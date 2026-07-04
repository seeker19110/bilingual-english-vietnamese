import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'

// curriculum.ts import getDailyGoal→getLearnedWords (vocab.ts)→pushProgress (progressSync.ts)
// →supabase — stub để test chạy OFFLINE, giống stats.test.ts/srs.test.ts.
vi.mock('./supabase', () => ({ supabase: {} }))
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

import {
  DAILY_GOAL,
  DAILY_GOAL_OPTIONS,
  getDailyGoal,
  setDailyGoal,
  getDailyMax,
  wordKey,
  getCircles,
  getLearningPath,
  getTodayBatch,
  getTodayBatchFrom,
  getLevelWords,
  getBeyondCefrWords,
  getPathProgress,
  getDailyLearned,
  bumpDailyLearned,
  getCefrLevelOfCircle,
  loadCurriculum,
} from './curriculum'
import { loadCefr } from '../data/cefrLoader'

// Dictionary giờ nạp ĐỘNG → phải await loadCurriculum() trước khi test các hàm dùng nó
beforeAll(async () => {
  await loadCurriculum()
})

describe('wordKey', () => {
  it('chuẩn hoá: bỏ khoảng trắng + viết thường', () => {
    expect(wordKey('  Hello ')).toBe('hello')
    expect(wordKey('I')).toBe(wordKey('i'))
  })
})

describe('getCircles — thứ tự theo lộ trình CEFR', () => {
  it('các vòng nền tảng xếp đúng thứ tự xuất hiện trong A1→B2', async () => {
    const levels = await loadCefr()
    // Thứ tự kỳ vọng: duyệt cấp → unit → vocabCircleIds, khử trùng giữ lần đầu.
    const expected: string[] = []
    const seen = new Set<string>()
    for (const lv of levels) {
      for (const u of lv.units) {
        for (const id of u.vocabCircleIds) {
          if (!seen.has(id)) {
            seen.add(id)
            expected.push(id)
          }
        }
      }
    }
    const ids = getCircles()
      .map((c) => c.id)
      .slice(0, expected.length)
    expect(ids).toEqual(expected)
  })

  it('vòng mở rộng (extra-*) nằm SAU toàn bộ vòng nền tảng', () => {
    const ids = getCircles().map((c) => c.id)
    const firstExtra = ids.findIndex((id) => id.startsWith('extra-'))
    expect(firstExtra).toBeGreaterThan(0)
    // Không còn vòng nền tảng nào sau vòng extra đầu tiên
    expect(ids.slice(firstExtra).every((id) => id.startsWith('extra-'))).toBe(true)
  })

  // V3, docs/research/cai-tien-lo-trinh-hoc.md: phần "Mở rộng" sắp theo TẦN SUẤT tăng dần
  // (scripts/tag-word-frequency.ts gắn field `freq`), không còn giữ alphabet.
  it('từ trong phần Mở rộng sắp theo freq TĂNG DẦN, từ chưa có freq dồn hết về cuối', () => {
    const extraWords = getCircles()
      .filter((c) => c.id.startsWith('extra-'))
      .flatMap((c) => c.words)
    const withFreq = extraWords.filter((w) => w.freq != null)
    // Có ít nhất vài từ đã gắn freq thật (chạy tag:freq trước khi test) để phép so sánh có ý nghĩa.
    expect(withFreq.length).toBeGreaterThan(0)
    for (let i = 1; i < withFreq.length; i++) {
      expect(withFreq[i]!.freq!).toBeGreaterThanOrEqual(withFreq[i - 1]!.freq!)
    }
    // Sau từ KHÔNG có freq đầu tiên, mọi từ còn lại cũng phải không có freq (dồn về cuối).
    const firstNoFreqIdx = extraWords.findIndex((w) => w.freq == null)
    if (firstNoFreqIdx !== -1) {
      expect(extraWords.slice(firstNoFreqIdx).every((w) => w.freq == null)).toBe(true)
    }
  })

  it('getCefrLevelOfCircle: vòng A1 đầu tiên là A1, extra không có cấp', () => {
    expect(getCefrLevelOfCircle('greetings')).toBe('A1')
    expect(getCefrLevelOfCircle('extra-1')).toBeNull()
  })
})

describe('getLearningPath', () => {
  it('không có từ trùng key (đã khử trùng)', () => {
    const path = getLearningPath()
    const keys = path.map((e) => wordKey(e.word))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('có dữ liệu và cache trả về cùng tham chiếu', () => {
    const a = getLearningPath()
    expect(a.length).toBeGreaterThan(0)
    expect(getLearningPath()).toBe(a)
  })
})

describe('getTodayBatch', () => {
  it('trả tối đa DAILY_GOAL từ khi chưa thuộc gì', () => {
    const batch = getTodayBatch(new Set())
    expect(batch.length).toBe(DAILY_GOAL)
  })

  it('bỏ qua các từ đã thuộc', () => {
    const path = getLearningPath()
    const learned = new Set([wordKey(path[0].word)])
    const batch = getTodayBatch(learned, 5)
    expect(batch.some((e) => wordKey(e.word) === wordKey(path[0].word))).toBe(false)
    expect(batch.length).toBe(5)
  })

  it('tôn trọng tham số size', () => {
    expect(getTodayBatch(new Set(), 3).length).toBe(3)
  })
})

describe('getLevelWords / getBeyondCefrWords — từ vựng theo cấp', () => {
  it('mỗi từ chỉ thuộc đúng 1 cấp (không trùng key giữa A1 và A2)', () => {
    const a1 = new Set(getLevelWords('A1').map((w) => wordKey(w.word)))
    const a2 = getLevelWords('A2').map((w) => wordKey(w.word))
    expect(a1.size).toBeGreaterThan(0)
    expect(a2.length).toBeGreaterThan(0)
    expect(a2.filter((k) => a1.has(k))).toEqual([])
  })

  it('tổng từ của 4 cấp + phần ngoài CEFR = đúng lộ trình phẳng', () => {
    const total =
      getLevelWords('A1').length +
      getLevelWords('A2').length +
      getLevelWords('B1').length +
      getLevelWords('B2').length +
      getBeyondCefrWords().length
    expect(total).toBe(getLearningPath().length)
  })

  it('phần ngoài CEFR không chứa từ của cấp A1', () => {
    const a1 = new Set(getLevelWords('A1').map((w) => wordKey(w.word)))
    expect(getBeyondCefrWords().some((w) => a1.has(wordKey(w.word)))).toBe(false)
  })
})

describe('getTodayBatchFrom — batch theo pool tùy chọn (từ vựng 1 cấp)', () => {
  it('chỉ lấy từ trong pool, bỏ từ đã thuộc, tôn trọng size', () => {
    const pool = getLevelWords('A1')
    const learned = new Set([wordKey(pool[0].word)])
    const batch = getTodayBatchFrom(pool, learned, 5)
    expect(batch.length).toBe(5)
    expect(batch.some((e) => wordKey(e.word) === wordKey(pool[0].word))).toBe(false)
    const poolKeys = new Set(pool.map((w) => wordKey(w.word)))
    expect(batch.every((e) => poolKeys.has(wordKey(e.word)))).toBe(true)
  })

  it('pool rỗng → batch rỗng (đã thuộc hết từ của cấp)', () => {
    expect(getTodayBatchFrom([], new Set())).toEqual([])
  })
})

describe('getPathProgress', () => {
  it('0 khi chưa thuộc gì, đầy đủ total', () => {
    const { done, total } = getPathProgress(new Set())
    expect(done).toBe(0)
    expect(total).toBe(getLearningPath().length)
  })

  it('đếm đúng số từ đã thuộc', () => {
    const path = getLearningPath()
    const learned = new Set([wordKey(path[0].word), wordKey(path[1].word)])
    expect(getPathProgress(learned).done).toBe(2)
  })
})

describe('bộ đếm học trong ngày', () => {
  beforeEach(() => localStorage.clear())

  it('khởi đầu bằng 0 rồi tăng dần', () => {
    expect(getDailyLearned('u1')).toBe(0)
    expect(bumpDailyLearned('u1')).toBe(1)
    expect(bumpDailyLearned('u1')).toBe(2)
    expect(getDailyLearned('u1')).toBe(2)
  })

  it('đếm tách biệt theo user', () => {
    bumpDailyLearned('u1')
    expect(getDailyLearned('u2')).toBe(0)
  })
})

describe('tốc độ học (getDailyGoal/setDailyGoal) — V7', () => {
  beforeEach(() => localStorage.clear())

  it('người dùng MỚI (chưa học từ nào) mặc định 10', () => {
    expect(getDailyGoal('new-user')).toBe(10)
  })

  it('người dùng ĐÃ có tiến độ (learned > 0) grandfather giữ 20', () => {
    localStorage.setItem('et_learned_old-user', JSON.stringify(['apple']))
    expect(getDailyGoal('old-user')).toBe(20)
  })

  it('mặc định được CHỐT 1 LẦN — không đổi dù learned words đổi sau đó', () => {
    expect(getDailyGoal('u3')).toBe(10) // chưa học gì → mặc định 10, đã lưu lại
    localStorage.setItem('et_learned_u3', JSON.stringify(['apple', 'banana']))
    expect(getDailyGoal('u3')).toBe(10) // vẫn 10, không tự đổi thành 20
  })

  it('setDailyGoal ghi đè lựa chọn, đọc lại đúng giá trị mới', () => {
    setDailyGoal('u4', 20)
    expect(getDailyGoal('u4')).toBe(20)
    setDailyGoal('u4', 5)
    expect(getDailyGoal('u4')).toBe(5)
  })

  it('DAILY_GOAL_OPTIONS đúng 3 mức 5/10/20', () => {
    expect(DAILY_GOAL_OPTIONS).toEqual([5, 10, 20])
  })

  it('getDailyMax = tốc độ × 5', () => {
    setDailyGoal('u5', 5)
    expect(getDailyMax('u5')).toBe(25)
    setDailyGoal('u5', 20)
    expect(getDailyMax('u5')).toBe(100)
  })
})
