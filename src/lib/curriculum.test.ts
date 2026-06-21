import { describe, it, expect, beforeEach } from 'vitest'
import {
  DAILY_GOAL,
  wordKey,
  getLearningPath,
  getTodayBatch,
  getPathProgress,
  getDailyLearned,
  bumpDailyLearned,
} from './curriculum'

describe('wordKey', () => {
  it('chuẩn hoá: bỏ khoảng trắng + viết thường', () => {
    expect(wordKey('  Hello ')).toBe('hello')
    expect(wordKey('I')).toBe(wordKey('i'))
  })
})

describe('getLearningPath', () => {
  it('không có từ trùng key (đã khử trùng)', () => {
    const path = getLearningPath()
    const keys = path.map(e => wordKey(e.word))
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
    expect(batch.some(e => wordKey(e.word) === wordKey(path[0].word))).toBe(false)
    expect(batch.length).toBe(5)
  })

  it('tôn trọng tham số size', () => {
    expect(getTodayBatch(new Set(), 3).length).toBe(3)
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
