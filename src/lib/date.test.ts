import { describe, it, expect } from 'vitest'
import { vnDateStr, vnDayOfWeek } from './date'

describe('vnDateStr — ngày theo giờ Việt Nam (UTC+7)', () => {
  it('giờ tối UTC cùng ngày với giờ VN → không đổi ngày', () => {
    // 20:00 UTC ngày 3 = 03:00 sáng ngày 4 giờ VN
    expect(vnDateStr(new Date('2026-07-03T20:00:00.000Z'))).toBe('2026-07-04')
  })

  it('0h-7h sáng giờ VN (tối hôm trước giờ UTC) vẫn tính đúng là ngày mới', () => {
    // 02:00 UTC ngày 4 = 09:00 sáng ngày 4 giờ VN → vẫn ngày 4
    expect(vnDateStr(new Date('2026-07-04T02:00:00.000Z'))).toBe('2026-07-04')
    // 16:59 UTC ngày 3 = 23:59 tối ngày 3 giờ VN → vẫn ngày 3
    expect(vnDateStr(new Date('2026-07-03T16:59:00.000Z'))).toBe('2026-07-03')
    // 17:00 UTC ngày 3 = 00:00 (nửa đêm) ngày 4 giờ VN → sang ngày 4
    expect(vnDateStr(new Date('2026-07-03T17:00:00.000Z'))).toBe('2026-07-04')
  })

  it('mặc định dùng thời điểm hiện tại khi không truyền tham số', () => {
    expect(vnDateStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('vnDayOfWeek — thứ trong tuần theo giờ Việt Nam (khớp với vnDateStr)', () => {
  it('20:00 UTC ngày 3 (= 03:00 sáng ngày 4 giờ VN, Thứ Bảy) → trả thứ của NGÀY 4, không phải ngày 3', () => {
    // Thời điểm này ở UTC vẫn là Thứ Sáu (ngày 3), nhưng theo giờ VN đã sang Thứ Bảy (ngày 4).
    const d = new Date('2026-07-03T20:00:00.000Z')
    expect(vnDateStr(d)).toBe('2026-07-04')
    expect(vnDayOfWeek(d)).toBe(6) // 6 = Thứ Bảy — khớp với ngày VN, không lệch như getDay()/getUTCDay() gốc
  })

  it('mặc định dùng thời điểm hiện tại khi không truyền tham số', () => {
    expect(vnDayOfWeek()).toBeGreaterThanOrEqual(0)
    expect(vnDayOfWeek()).toBeLessThanOrEqual(6)
  })
})
