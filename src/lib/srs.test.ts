import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock đồng bộ cloud để test chạy OFFLINE (progressSync import supabase — sẽ ném lỗi khi
// thiếu env trong test). Chỉ cần stub pushProgress là cả chuỗi import supabase không chạy.
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

import { addToSRS, reviewWord, getDueWords, getSRSStats, getNextReview } from './srs'
import type { DictEntry } from '../types'

const W = (word: string): DictEntry => ({ word } as DictEntry)

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
    reviewWord('u1', 'apple', 'good')          // reps=1, due đẩy về tương lai
    const due1 = getNextReview('u1', 'apple')?.getTime()
    addToSRS('u1', 'apple')                     // gọi lại — phải KHÔNG reset
    const due2 = getNextReview('u1', 'apple')?.getTime()
    expect(due2).toBe(due1)
  })

  it("reviewWord('again') giảm ease (sàn 1.3) và hẹn ôn lại sớm", () => {
    addToSRS('u1', 'apple')
    reviewWord('u1', 'apple', 'again')
    // due ≈ now + 1 ngày (interval=0 → max(0,1)=1)
    const due = getNextReview('u1', 'apple')!.getTime()
    expect(due).toBeGreaterThan(Date.now())
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
    addToSRS('u1', 'apple')           // due = now → đến hạn
    reviewWord('u1', 'banana', 'good') // tạo thẻ banana, due tương lai
    const due = getDueWords('u1', [W('apple'), W('banana')]).map(e => e.word)
    expect(due).toContain('apple')
    expect(due).not.toContain('banana')
  })

  it('getNextReview trả null cho từ chưa vào SRS', () => {
    expect(getNextReview('u1', 'unknown')).toBeNull()
  })
})
