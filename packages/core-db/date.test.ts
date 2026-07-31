import { describe, it, expect } from 'vitest'
import { vnDateStr, addDays, weekStartOf } from './date'

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

describe('addDays — dịch chuỗi ngày (PHẢI khớp src/lib/date.ts)', () => {
  it('lùi/tiến đúng số ngày, kể cả qua ranh giới tháng/năm', () => {
    expect(addDays('2026-07-16', -1)).toBe('2026-07-15')
    expect(addDays('2026-07-16', 1)).toBe('2026-07-17')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2026-07-16', 0)).toBe('2026-07-16')
  })
})

describe('weekStartOf — Thứ 2 của tuần (PHẢI khớp src/lib/date.ts)', () => {
  it('giữa tuần (Thứ 5, 2026-07-16) → Thứ 2 cùng tuần (2026-07-13)', () => {
    expect(weekStartOf('2026-07-16')).toBe('2026-07-13')
  })

  it('đúng Thứ 2 → chính nó', () => {
    expect(weekStartOf(weekStartOf('2026-07-16'))).toBe(weekStartOf('2026-07-16'))
  })

  it('Chủ nhật → vẫn thuộc tuần bắt đầu Thứ 2 trước đó (khác ngày, không đổi tuần)', () => {
    const mon = weekStartOf('2026-07-16')
    const sun = addDays(mon, 6)
    expect(weekStartOf(sun)).toBe(mon)
  })
})
