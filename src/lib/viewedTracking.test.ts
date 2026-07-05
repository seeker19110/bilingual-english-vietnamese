import { describe, it, expect, beforeEach } from 'vitest'
import { getViewedIds, markViewed } from './viewedTracking'

describe('viewedTracking — theo dõi "đã xem" (Lessons/CommonPhrases)', () => {
  beforeEach(() => localStorage.clear())

  it('mặc định chưa xem gì', () => {
    expect(getViewedIds('lessons', 'u1').size).toBe(0)
  })

  it('markViewed ghi nhớ, đọc lại đúng id đã xem', () => {
    markViewed('lessons', 'u1', '5')
    expect(getViewedIds('lessons', 'u1').has('5')).toBe(true)
  })

  it('đánh dấu 2 lần cùng id vẫn chỉ có 1 phần tử (idempotent)', () => {
    markViewed('lessons', 'u1', '5')
    markViewed('lessons', 'u1', '5')
    expect(getViewedIds('lessons', 'u1').size).toBe(1)
  })

  it('tách riêng theo namespace — "lessons" và "phrases" không lẫn nhau', () => {
    markViewed('lessons', 'u1', '5')
    markViewed('phrases', 'u1', "I'm")
    expect(getViewedIds('lessons', 'u1').has("I'm")).toBe(false)
    expect(getViewedIds('phrases', 'u1').has('5')).toBe(false)
  })

  it('tách riêng theo uid — user A không thấy đã xem của user B', () => {
    markViewed('lessons', 'u1', '5')
    expect(getViewedIds('lessons', 'u2').has('5')).toBe(false)
  })

  it('dữ liệu localStorage hỏng → Set rỗng, không lỗi', () => {
    localStorage.setItem('et_viewed_lessons_u1', 'not-json{{')
    expect(getViewedIds('lessons', 'u1').size).toBe(0)
  })
})
