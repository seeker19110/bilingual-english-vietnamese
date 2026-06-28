import { describe, it, expect } from 'vitest'
import { scorePronunciation, pronounceFeedback, scoreWords } from './pronounceScore'

// Module thuần (không gọi mạng/localStorage) → test trực tiếp. Bảo vệ logic chấm phát âm.

describe('scorePronunciation', () => {
  it('khớp hệt → 100', () => {
    expect(scorePronunciation('hello', 'hello')).toBe(100)
  })

  it('chuẩn hoá hoa/thường + dấu câu', () => {
    expect(scorePronunciation('Hello!', 'hello')).toBe(100)
    expect(scorePronunciation('How are you?', 'how are you')).toBe(100)
  })

  it('chuỗi rỗng → 0', () => {
    expect(scorePronunciation('', 'hello')).toBe(0)
    expect(scorePronunciation('hello', '')).toBe(0)
  })

  it('lệch nhiều → điểm thấp, luôn trong [0,100]', () => {
    const s = scorePronunciation('elephant', 'xyz')
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThan(50)
  })
})

describe('pronounceFeedback', () => {
  it('ngưỡng điểm trả đúng nhãn (chiều A — tiếng Việt)', () => {
    expect(pronounceFeedback(90, true).label).toBe('Tuyệt vời!')
    expect(pronounceFeedback(70, true).label).toBe('Khá tốt')
    expect(pronounceFeedback(50, true).label).toContain('Tạm được')
    expect(pronounceFeedback(10, true).label).toContain('Chưa rõ')
  })

  it('chiều B trả nhãn tiếng Anh', () => {
    expect(pronounceFeedback(90, false).label).toBe('Excellent!')
    expect(pronounceFeedback(10, false).label).toContain('Unclear')
  })
})

describe('scoreWords', () => {
  it('mọi từ đúng → ok=true, đủ số phần tử', () => {
    const r = scoreWords('the cat sat', 'the cat sat')
    expect(r).toHaveLength(3)
    expect(r.every(w => w.ok)).toBe(true)
  })

  it('thiếu từ cuối → từ đó ok=false', () => {
    const r = scoreWords('the cat sat', 'the cat')
    expect(r[2].ok).toBe(false)
  })
})
