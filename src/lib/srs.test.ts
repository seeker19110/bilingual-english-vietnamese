import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock đồng bộ cloud để test chạy OFFLINE (progressSync import supabase — sẽ ném lỗi khi
// thiếu env trong test). Chỉ cần stub pushProgress là cả chuỗi import supabase không chạy.
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

import {
  addToSRS,
  addToSRSKnown,
  reviewWord,
  getDueWords,
  getSRSStats,
  getNextReview,
  getLeechWords,
  NEW_CARD_DELAY_MS,
  addGrammarToSRS,
  reviewGrammar,
  getDueGrammarLessonIds,
} from './srs'
import type { DictEntry } from '../types'

const W = (word: string): DictEntry => ({ word }) as DictEntry

describe('SRS — FSRS', () => {
  beforeEach(() => localStorage.clear())

  it('addToSRS tạo thẻ mặc định — KHÔNG đến hạn ngay, đến hạn sau 4h (E4)', () => {
    vi.useFakeTimers()
    addToSRS('u1', 'apple')
    const stats = getSRSStats('u1')
    expect(stats.total).toBe(1)
    expect(stats.due).toBe(0) // vừa học xong KHÔNG "nợ" ôn ngay
    vi.advanceTimersByTime(NEW_CARD_DELAY_MS + 1000)
    expect(getSRSStats('u1').due).toBe(1) // sau 4h mới đến hạn (ôn cùng ngày buổi tối)
    vi.useRealTimers()
  })

  it('addToSRS idempotent — không ghi đè thẻ đã có tiến độ', () => {
    addToSRS('u1', 'apple')
    reviewWord('u1', 'apple', 'good') // reps=1, due đẩy về tương lai
    const due1 = getNextReview('u1', 'apple')?.getTime()
    addToSRS('u1', 'apple') // gọi lại — phải KHÔNG reset
    const due2 = getNextReview('u1', 'apple')?.getTime()
    expect(due2).toBe(due1)
  })

  it("reviewWord('again') → ôn lại NGAY trong phiên (due ≤ now, thẻ vẫn đến hạn)", () => {
    addToSRS('u1', 'apple')
    reviewWord('u1', 'apple', 'good') // đẩy due ra tương lai trước
    reviewWord('u1', 'apple', 'again') // Quên → kéo due về bây giờ
    const due = getNextReview('u1', 'apple')!.getTime()
    expect(due).toBeLessThanOrEqual(Date.now())
    // và thẻ phải xuất hiện lại trong danh sách cần ôn ngay
    expect(getDueWords('u1', [W('apple')]).map((e) => e.word)).toContain('apple')
  })

  it("reviewWord('good') liên tiếp, ôn ĐÚNG lúc đến hạn mỗi lần → khoảng cách ôn DÀI hơn lần trước (FSRS tính theo thời gian trôi qua thật, không chỉ đếm số lần)", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    addToSRS('u1', 'apple') // due = +4h
    vi.advanceTimersByTime(NEW_CARD_DELAY_MS + 1000) // ôn đúng lúc đến hạn lần 1
    const firstReviewAt = Date.now()
    reviewWord('u1', 'apple', 'good')
    const due1 = getNextReview('u1', 'apple')!.getTime()
    const firstIntervalMs = due1 - firstReviewAt
    expect(firstIntervalMs).toBeGreaterThan(0) // đẩy ra tương lai

    vi.setSystemTime(new Date(due1)) // chờ đúng tới hạn rồi mới ôn tiếp (không cram)
    reviewWord('u1', 'apple', 'good')
    const due2 = getNextReview('u1', 'apple')!.getTime()
    const secondIntervalMs = due2 - due1
    // Ôn đều đặn, đúng hạn, liên tục 'good' → FSRS nới khoảng cách RỘNG hơn lần trước
    // (xác nhận đúng hành vi thư viện ts-fsrs thật qua node, không suy đoán công thức).
    expect(secondIntervalMs).toBeGreaterThan(firstIntervalMs)
    vi.useRealTimers()
  })

  it('getDueWords chỉ trả từ đến hạn', () => {
    vi.useFakeTimers()
    addToSRS('u1', 'apple') // due = +4h
    reviewWord('u1', 'banana', 'good') // tạo thẻ banana, due +1 ngày
    vi.advanceTimersByTime(NEW_CARD_DELAY_MS + 1000) // qua mốc 4h — apple đến hạn, banana chưa
    const due = getDueWords('u1', [W('apple'), W('banana')]).map((e) => e.word)
    expect(due).toContain('apple')
    expect(due).not.toContain('banana')
    vi.useRealTimers()
  })

  it('getNextReview trả null cho từ chưa vào SRS', () => {
    expect(getNextReview('u1', 'unknown')).toBeNull()
  })

  it('getDueWords với limit: cap số thẻ + ưu tiên thẻ quá hạn lâu nhất trước', () => {
    vi.useFakeTimers()
    const base = new Date('2026-01-10T00:00:00Z')
    vi.setSystemTime(base)
    addToSRS('u1', 'apple') // due = base + 4h (quá hạn lâu nhất)
    vi.setSystemTime(new Date(base.getTime() + 1000))
    addToSRS('u1', 'banana') // due sau apple 1s
    vi.setSystemTime(new Date(base.getTime() + 2000))
    addToSRS('u1', 'cherry') // due sau cùng
    // Qua mốc +4h của cả 3 thẻ → cả 3 đều đến hạn lúc này
    vi.setSystemTime(new Date(base.getTime() + NEW_CARD_DELAY_MS + 3000))

    const words = [W('cherry'), W('banana'), W('apple')]
    const capped = getDueWords('u1', words, 2)
    expect(capped.map((e) => e.word)).toEqual(['apple', 'banana']) // quá hạn lâu nhất trước
    expect(getDueWords('u1', words).length).toBe(3) // không limit → trả hết
    vi.useRealTimers()
  })

  it('getLeechWords: từ bị "Quên" ≥3 lần SAU KHI đã học được tự vào diện leech (ngữ nghĩa FSRS: lapses chỉ tính khi trượt lại một thẻ đã từng qua được, không tính lần trượt đầu tiên lúc thẻ còn hoàn toàn mới)', () => {
    addToSRS('u1', 'apple')
    reviewWord('u1', 'apple', 'good') // học được lần đầu → thẻ chuyển sang trạng thái "đã ôn qua"
    reviewWord('u1', 'apple', 'again') // trượt lần 1 (tính — đã từng qua được)
    reviewWord('u1', 'apple', 'again') // trượt lần 2
    expect(getLeechWords('u1', [W('apple')])).toHaveLength(0) // mới 2 lần, chưa phải leech
    reviewWord('u1', 'apple', 'again') // trượt lần 3
    expect(getLeechWords('u1', [W('apple')]).map((e) => e.word)).toContain('apple')
  })

  it('addToSRSKnown (test-out): due XA hơn addToSRS thường, KHÔNG đến hạn ngay hôm nay', () => {
    addToSRSKnown('u1', 'apple', 7)
    expect(getDueWords('u1', [W('apple')])).toHaveLength(0) // chưa đến hạn
    const next = getNextReview('u1', 'apple')!.getTime()
    expect(Math.round((next - Date.now()) / 86_400_000)).toBe(7)
  })

  it('addToSRSKnown idempotent — không ghi đè thẻ đã có tiến độ', () => {
    addToSRSKnown('u1', 'apple', 7)
    reviewWord('u1', 'apple', 'good')
    const due1 = getNextReview('u1', 'apple')?.getTime()
    addToSRSKnown('u1', 'apple', 7)
    expect(getNextReview('u1', 'apple')?.getTime()).toBe(due1)
  })
})

describe('SRS ngữ pháp (đề xuất E) — dùng chung kho FSRS, khoá tiền tố grammar:', () => {
  beforeEach(() => localStorage.clear())

  it('addGrammarToSRS: KHÔNG đến hạn ngay, đến hạn sau 4h giống thẻ từ vựng', () => {
    vi.useFakeTimers()
    addGrammarToSRS('u1', 'a1-be')
    expect(getDueGrammarLessonIds('u1', ['a1-be'])).toEqual([])
    vi.advanceTimersByTime(NEW_CARD_DELAY_MS + 1000)
    expect(getDueGrammarLessonIds('u1', ['a1-be'])).toEqual(['a1-be'])
    vi.useRealTimers()
  })

  it('reviewGrammar("again") → đến hạn ôn lại ngay', () => {
    addGrammarToSRS('u1', 'a1-be')
    reviewGrammar('u1', 'a1-be', 'good') // đẩy due ra tương lai trước
    reviewGrammar('u1', 'a1-be', 'again')
    expect(getDueGrammarLessonIds('u1', ['a1-be'])).toEqual(['a1-be'])
  })

  it('reviewGrammar("good") → đẩy due ra tương lai, không còn đến hạn hôm nay', () => {
    vi.useFakeTimers()
    addGrammarToSRS('u1', 'a1-be')
    vi.advanceTimersByTime(NEW_CARD_DELAY_MS + 1000)
    expect(getDueGrammarLessonIds('u1', ['a1-be'])).toEqual(['a1-be'])
    reviewGrammar('u1', 'a1-be', 'good')
    expect(getDueGrammarLessonIds('u1', ['a1-be'])).toEqual([])
    vi.useRealTimers()
  })

  it('getDueGrammarLessonIds chỉ trả bài đến hạn, không đụng namespace với từ vựng', () => {
    vi.useFakeTimers()
    addToSRS('u1', 'a1-be') // TỪ VỰNG trùng tên với 1 lessonId — không được lẫn lộn
    addGrammarToSRS('u1', 'a1-be')
    vi.advanceTimersByTime(NEW_CARD_DELAY_MS + 1000)
    expect(getDueGrammarLessonIds('u1', ['a1-be'])).toEqual(['a1-be'])
    expect(getDueWords('u1', [{ word: 'a1-be' } as DictEntry]).map((e) => e.word)).toEqual([
      'a1-be',
    ])
    // Đánh giá riêng ngữ pháp không ảnh hưởng thẻ từ vựng cùng tên và ngược lại.
    reviewGrammar('u1', 'a1-be', 'good')
    expect(getDueGrammarLessonIds('u1', ['a1-be'])).toEqual([])
    expect(getDueWords('u1', [{ word: 'a1-be' } as DictEntry]).map((e) => e.word)).toEqual([
      'a1-be',
    ])
    vi.useRealTimers()
  })

  it('getDueGrammarLessonIds với limit: ưu tiên bài quá hạn lâu nhất trước', () => {
    vi.useFakeTimers()
    const base = new Date('2026-01-10T00:00:00Z')
    vi.setSystemTime(base)
    addGrammarToSRS('u1', 'lesson-a')
    vi.setSystemTime(new Date(base.getTime() + 1000))
    addGrammarToSRS('u1', 'lesson-b')
    vi.setSystemTime(new Date(base.getTime() + NEW_CARD_DELAY_MS + 2000))
    const capped = getDueGrammarLessonIds('u1', ['lesson-b', 'lesson-a'], 1)
    expect(capped).toEqual(['lesson-a'])
    vi.useRealTimers()
  })
})
