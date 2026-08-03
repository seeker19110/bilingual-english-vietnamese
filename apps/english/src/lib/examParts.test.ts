import { describe, it, expect } from 'vitest'
import { PART_META } from './examParts'

describe('examParts — nhãn/icon cho từng phần bài trắc nghiệm', () => {
  it('có đủ 4 phần: vocab/grammar/listening/reading', () => {
    expect(Object.keys(PART_META).sort()).toEqual(
      ['grammar', 'listening', 'reading', 'vocab'].sort(),
    )
  })

  it('mỗi phần có nhãn vi/en khác rỗng và có icon', () => {
    for (const part of Object.values(PART_META)) {
      expect(part.vi.length).toBeGreaterThan(0)
      expect(part.en.length).toBeGreaterThan(0)
      expect(part.icon).toBeTruthy()
    }
  })

  it('nhãn tiếng Việt đúng nội dung mong đợi', () => {
    expect(PART_META.vocab.vi).toBe('Từ vựng')
    expect(PART_META.grammar.vi).toBe('Ngữ pháp')
    expect(PART_META.listening.vi).toBe('Nghe')
    expect(PART_META.reading.vi).toBe('Đọc hiểu')
  })
})
