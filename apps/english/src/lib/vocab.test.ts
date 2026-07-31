import { describe, it, expect, beforeEach, vi } from 'vitest'

// vocab.ts import progressSync → supabase (ném lỗi khi thiếu env). Stub để chạy offline.
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

import {
  markLearned,
  unmarkLearned,
  isLearned,
  getLearnedWords,
  getRecentlyLearnedWords,
} from './vocab'

describe('vocab — từ đã thuộc (chuẩn hoá chữ thường, BUG-6)', () => {
  beforeEach(() => localStorage.clear())

  it('markLearned + isLearned không phân biệt hoa/thường', () => {
    markLearned('u1', 'Apple')
    expect(isLearned('u1', 'apple')).toBe(true)
    expect(isLearned('u1', 'APPLE')).toBe(true)
    expect(getLearnedWords('u1').has('apple')).toBe(true)
  })

  it('tự "migrate" dữ liệu cũ lưu nguyên dạng hoa/thường', () => {
    // Giả lập bản ghi cũ (chưa chuẩn hoá) còn trong localStorage
    localStorage.setItem('et_learned_u1', JSON.stringify(['Banana', 'CHERRY']))
    const set = getLearnedWords('u1')
    expect(set.has('banana')).toBe(true)
    expect(set.has('cherry')).toBe(true)
    expect(isLearned('u1', 'Banana')).toBe(true)
  })

  it('unmarkLearned bỏ đúng từ bất kể hoa/thường', () => {
    markLearned('u1', 'Dog')
    unmarkLearned('u1', 'DOG')
    expect(isLearned('u1', 'dog')).toBe(false)
    expect(getLearnedWords('u1').size).toBe(0)
  })
})

describe('getRecentlyLearnedWords — gợi ý "Luyện nói với từ vừa học" (② M4)', () => {
  beforeEach(() => localStorage.clear())

  it('trả về N từ MỚI NHẤT trước (thứ tự chèn đảo ngược)', () => {
    markLearned('u1', 'one')
    markLearned('u1', 'two')
    markLearned('u1', 'three')
    expect(getRecentlyLearnedWords('u1', 2)).toEqual(['three', 'two'])
  })

  it('n lớn hơn số từ đã học → trả về hết, không lỗi', () => {
    markLearned('u1', 'apple')
    expect(getRecentlyLearnedWords('u1', 10)).toEqual(['apple'])
  })

  it('chưa học từ nào → mảng rỗng', () => {
    expect(getRecentlyLearnedWords('u1', 5)).toEqual([])
  })

  it('dữ liệu localStorage hỏng → mảng rỗng, không throw', () => {
    localStorage.setItem('et_learned_u1', '{"broken":')
    expect(getRecentlyLearnedWords('u1', 5)).toEqual([])
  })
})
