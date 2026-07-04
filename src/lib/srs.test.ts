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
} from './srs'
import type { DictEntry } from '../types'

const W = (word: string): DictEntry => ({ word }) as DictEntry

describe('SRS — SM-2', () => {
  beforeEach(() => localStorage.clear())

  it('addToSRS tạo thẻ mặc định (interval 1, ease 2.5, reps 0)', () => {
    addToSRS('u1', 'apple')
    const stats = getSRSStats('u1')
    expect(stats.total).toBe(1)
    expect(stats.due).toBe(1) // due = now → đến hạn ngay
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

  it('getDueWords với limit: cap số thẻ + ưu tiên thẻ quá hạn lâu nhất trước', () => {
    vi.useFakeTimers()
    const base = new Date('2026-01-10T00:00:00Z')
    vi.setSystemTime(base)
    addToSRS('u1', 'apple') // due = base (quá hạn lâu nhất)
    vi.setSystemTime(new Date(base.getTime() + 1000))
    addToSRS('u1', 'banana') // due sau apple 1s
    vi.setSystemTime(new Date(base.getTime() + 2000))
    addToSRS('u1', 'cherry') // due sau cùng
    vi.setSystemTime(new Date(base.getTime() + 3000)) // cả 3 đều đến hạn lúc này

    const words = [W('cherry'), W('banana'), W('apple')]
    const capped = getDueWords('u1', words, 2)
    expect(capped.map((e) => e.word)).toEqual(['apple', 'banana']) // quá hạn lâu nhất trước
    expect(getDueWords('u1', words).length).toBe(3) // không limit → trả hết
    vi.useRealTimers()
  })

  it('getLeechWords: từ bị "Quên" ≥3 lần tự vào diện leech', () => {
    addToSRS('u1', 'apple')
    reviewWord('u1', 'apple', 'again')
    reviewWord('u1', 'apple', 'again')
    expect(getLeechWords('u1', [W('apple')])).toHaveLength(0) // mới 2 lần, chưa phải leech
    reviewWord('u1', 'apple', 'again')
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
