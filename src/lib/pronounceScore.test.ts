import { describe, it, expect } from 'vitest'
import { scorePronunciation, pronounceFeedback, scoreWords } from './pronounceScore'

describe('scorePronunciation', () => {
  it('trả 100 khi đọc đúng y hệt (không phân biệt hoa/thường, dấu câu)', () => {
    expect(scorePronunciation('Hello world', 'hello world')).toBe(100)
    expect(scorePronunciation('Hello, world!', 'hello world')).toBe(100)
  })

  it('trả 0 khi target hoặc spoken rỗng', () => {
    expect(scorePronunciation('', 'hello')).toBe(0)
    expect(scorePronunciation('hello', '')).toBe(0)
    expect(scorePronunciation('', '')).toBe(0)
  })

  it('điểm thấp hơn khi đọc sai nhiều', () => {
    const close = scorePronunciation('hello', 'hallo')
    const far = scorePronunciation('hello', 'goodbye')
    expect(close).toBeGreaterThan(far)
  })

  it('luôn nằm trong khoảng 0–100', () => {
    expect(scorePronunciation('a', 'zzzzzzzzzz')).toBeGreaterThanOrEqual(0)
    expect(scorePronunciation('a', 'zzzzzzzzzz')).toBeLessThanOrEqual(100)
  })

  it('gộp khoảng trắng thừa khi so sánh', () => {
    expect(scorePronunciation('hello   world', 'hello world')).toBe(100)
  })
})

describe('pronounceFeedback', () => {
  it('phân loại đúng theo ngưỡng điểm (chiều A - tiếng Việt)', () => {
    expect(pronounceFeedback(90, true).label).toBe('Tuyệt vời!')
    expect(pronounceFeedback(85, true).label).toBe('Tuyệt vời!')
    expect(pronounceFeedback(70, true).label).toBe('Khá tốt')
    expect(pronounceFeedback(50, true).label).toBe('Tạm được, thử lại nhé')
    expect(pronounceFeedback(10, true).label).toBe('Chưa rõ, thử lại')
  })

  it('phân loại đúng theo ngưỡng điểm (chiều B - tiếng Anh)', () => {
    expect(pronounceFeedback(90, false).label).toBe('Excellent!')
    expect(pronounceFeedback(10, false).label).toBe('Unclear, try again')
  })
})

describe('scoreWords', () => {
  it('đánh dấu đúng khi từng từ khớp', () => {
    const result = scoreWords('I like apples', 'I like apples')
    expect(result.every(r => r.ok)).toBe(true)
    expect(result.map(r => r.word)).toEqual(['i', 'like', 'apples'])
  })

  it('đánh dấu sai khi thiếu từ ở cuối', () => {
    const result = scoreWords('I like red apples', 'I like apples')
    expect(result.some(r => !r.ok)).toBe(true)
  })

  it('trả mảng rỗng khi target rỗng', () => {
    expect(scoreWords('', 'anything')).toEqual([])
  })
})
