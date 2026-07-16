import { describe, it, expect, beforeEach } from 'vitest'
import { isSoundEnabled, setSoundEnabled, sound } from './sound'

beforeEach(() => {
  localStorage.clear()
})

describe('isSoundEnabled / setSoundEnabled', () => {
  it('mặc định BẬT khi chưa từng lưu tùy chọn', () => {
    expect(isSoundEnabled()).toBe(true)
  })

  it('tắt rồi đọc lại → false', () => {
    setSoundEnabled(false)
    expect(isSoundEnabled()).toBe(false)
  })

  it('bật lại sau khi đã tắt → true', () => {
    setSoundEnabled(false)
    setSoundEnabled(true)
    expect(isSoundEnabled()).toBe(true)
  })
})

// jsdom (môi trường test) không cài AudioContext thật — đúng nhánh "trình duyệt không hỗ trợ"
// mà sound.ts đã tính tới (giống Safari cũ/trình duyệt lạ). Test ở đây xác nhận gọi các hàm
// KHÔNG BAO GIỜ ném lỗi dù bật hay tắt, dù có/không AudioContext — không test được tiếng phát
// ra thật (cần trình duyệt thật).
describe('sound.correct / sound.wrong / sound.milestone — không bao giờ ném lỗi', () => {
  it('gọi khi ĐANG BẬT (không có AudioContext ở jsdom) → không throw', () => {
    setSoundEnabled(true)
    expect(() => sound.correct()).not.toThrow()
    expect(() => sound.wrong()).not.toThrow()
    expect(() => sound.milestone()).not.toThrow()
  })

  it('gọi khi ĐANG TẮT → không throw (và không cần tới AudioContext)', () => {
    setSoundEnabled(false)
    expect(() => sound.correct()).not.toThrow()
    expect(() => sound.wrong()).not.toThrow()
    expect(() => sound.milestone()).not.toThrow()
  })
})
