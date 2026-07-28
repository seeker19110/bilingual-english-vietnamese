import { describe, it, expect } from 'vitest'
import { textToVisemeTimeline, visemeAtTime } from './viseme'

describe('textToVisemeTimeline', () => {
  it('trả về mảng rỗng khi câu rỗng', () => {
    expect(textToVisemeTimeline('', 3000)).toEqual([])
    expect(textToVisemeTimeline('   ', 3000)).toEqual([])
  })

  it('trả về mảng rỗng khi thời lượng audio <= 0 (ca biên)', () => {
    expect(textToVisemeTimeline('Hello world', 0)).toEqual([])
    expect(textToVisemeTimeline('Hello world', -100)).toEqual([])
  })

  it('khung hình cuối cùng không vượt quá tổng thời lượng audio', () => {
    const durationMs = 2000
    const frames = textToVisemeTimeline('Hello how are you', durationMs)
    expect(frames.length).toBeGreaterThan(0)
    const lastFrame = frames[frames.length - 1]!
    expect(lastFrame.endMs).toBeCloseTo(durationMs, 0)
  })

  it('các khung hình nối tiếp nhau, không chồng lấn/có lỗ hổng', () => {
    const frames = textToVisemeTimeline('one two three', 1500)
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i]!.startMs).toBeCloseTo(frames[i - 1]!.endMs, 5)
    }
  })

  it('câu 1 từ vẫn tạo được ít nhất 1 khung hình (không có khoảng nghỉ giữa từ)', () => {
    const frames = textToVisemeTimeline('hi', 500)
    expect(frames.length).toBeGreaterThan(0)
    expect(frames.every((f) => f.viseme !== 'REST')).toBe(true)
  })
})

describe('visemeAtTime', () => {
  const frames = textToVisemeTimeline('hello there', 2000)

  it('trả về REST khi mảng khung hình rỗng', () => {
    expect(visemeAtTime([], 100)).toBe('REST')
  })

  it('trả về REST khi thời điểm nằm ngoài mọi khung hình (ca biên: âm/quá lớn)', () => {
    expect(visemeAtTime(frames, -50)).toBe('REST')
    expect(visemeAtTime(frames, 999_999)).toBe('REST')
  })

  it('trả về đúng viseme của khung hình chứa thời điểm đó', () => {
    const target = frames[0]!
    const midpoint = (target.startMs + target.endMs) / 2
    expect(visemeAtTime(frames, midpoint)).toBe(target.viseme)
  })
})
