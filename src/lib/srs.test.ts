import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock đồng bộ cloud để test chạy OFFLINE (progressSync import supabase — sẽ ném lỗi khi
// thiếu env trong test). Chỉ cần stub pushProgress là cả chuỗi import supabase không chạy.
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

import { addToSRS, reviewWord, getDueWords, getDueSession, getSRSStats, getNextReview } from './srs'
import { isDifficult } from './vocab'
import type { DictEntry } from '../types'

const W = (word: string): DictEntry => ({ word }) as DictEntry
const MS_DAY = 86_400_000

describe('SRS — SM-2', () => {
  beforeEach(() => localStorage.clear())

  it('addToSRS tạo thẻ mặc định (interval 1, ease 2.5, reps 0)', () => {
    addToSRS('u1', 'apple')
    const stats = getSRSStats('u1')
    expect(stats.total).toBe(1)
    expect(stats.due).toBe(1) // due = now → đến hạn ngay
  })

  it('addToSRS(uid, word, 7) — test-out: due đẩy xa 7 ngày, không phải ngay hôm nay', () => {
    addToSRS('u1', 'apple', 7)
    const due = getNextReview('u1', 'apple')!.getTime()
    expect(Math.round((due - Date.now()) / MS_DAY)).toBe(7)
    expect(getDueWords('u1', [W('apple')])).toEqual([]) // chưa đến hạn ôn hôm nay
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

  it("reviewWord('good') tăng interval theo SM-2: 1 → 4 → ×ease", () => {
    vi.useFakeTimers()
    addToSRS('u1', 'apple')
    reviewWord('u1', 'apple', 'good') // reps0 → interval 1
    reviewWord('u1', 'apple', 'good') // reps1 → interval 4
    const after2 = getNextReview('u1', 'apple')!.getTime()
    // interval 4 ngày kể từ now
    expect(Math.round((after2 - Date.now()) / 86_400_000)).toBe(4)
    vi.useRealTimers()
  })

  it('getDueWords chỉ trả từ đến hạn', () => {
    addToSRS('u1', 'apple') // due = now → đến hạn
    reviewWord('u1', 'banana', 'good') // tạo thẻ banana, due tương lai
    const due = getDueWords('u1', [W('apple'), W('banana')]).map((e) => e.word)
    expect(due).toContain('apple')
    expect(due).not.toContain('banana')
  })

  it('getNextReview trả null cho từ chưa vào SRS', () => {
    expect(getNextReview('u1', 'unknown')).toBeNull()
  })

  it('reviewWord("again") ≥3 lần → tự động vào "Từ khó" (leech)', () => {
    addToSRS('u1', 'apple')
    reviewWord('u1', 'apple', 'again')
    reviewWord('u1', 'apple', 'again')
    expect(isDifficult('u1', 'apple')).toBe(false) // mới 2 lần — chưa tới ngưỡng
    reviewWord('u1', 'apple', 'again')
    expect(isDifficult('u1', 'apple')).toBe(true) // lần 3 — tự động đánh dấu khó
  })

  it('getDueSession giới hạn số thẻ theo cap, ưu tiên quá hạn lâu nhất trước', () => {
    vi.useFakeTimers()
    addToSRS('u1', 'apple') // due = now
    vi.advanceTimersByTime(MS_DAY)
    addToSRS('u1', 'banana') // due = now (1 ngày sau apple) → apple quá hạn LÂU hơn
    vi.advanceTimersByTime(MS_DAY)
    addToSRS('u1', 'cherry')

    const session = getDueSession('u1', [W('apple'), W('banana'), W('cherry')], 2)
    expect(session.totalDue).toBe(3)
    expect(session.cards.map((e) => e.word)).toEqual(['apple', 'banana']) // 2 quá hạn lâu nhất
    vi.useRealTimers()
  })

  it('getDueSession chỉ trả thẻ đến hạn, không kể thẻ chưa vào SRS/chưa tới hạn', () => {
    addToSRS('u1', 'apple')
    reviewWord('u1', 'banana', 'good') // due tương lai
    const session = getDueSession('u1', [W('apple'), W('banana'), W('cherry')], 30)
    expect(session.cards.map((e) => e.word)).toEqual(['apple'])
    expect(session.totalDue).toBe(1)
  })
})
