import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import {
  DAILY_GOAL,
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
