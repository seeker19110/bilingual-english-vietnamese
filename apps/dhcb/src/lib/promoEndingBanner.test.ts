import { describe, it, expect } from 'vitest'
import { shouldShowPromoEndingBanner, formatDateVN, WARNING_WINDOW_DAYS } from './promoEndingBanner'

// Mốc "bây giờ" cố định để test không phụ thuộc ngày chạy thật: 12:00 UTC = 19:00
// giờ VN (2026-01-01), tránh rơi đúng ranh giới nửa đêm VN gây nhiễu ca biên.
const NOW = new Date('2026-01-01T12:00:00Z')

function isoDaysFromNow(days: number): string {
  return new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
}

describe('shouldShowPromoEndingBanner', () => {
  it('promoUntil = null → không hiện', () => {
    expect(shouldShowPromoEndingBanner(null, NOW, null)).toBe(false)
  })

  it('promoUntil đã QUA (hết hạn) → không hiện', () => {
    expect(shouldShowPromoEndingBanner(isoDaysFromNow(-1), NOW, null)).toBe(false)
  })

  it(`còn đúng ${WARNING_WINDOW_DAYS} ngày → hiện`, () => {
    expect(shouldShowPromoEndingBanner(isoDaysFromNow(WARNING_WINDOW_DAYS), NOW, null)).toBe(true)
  })

  it(`còn ${WARNING_WINDOW_DAYS + 1} ngày → không hiện (ngoài cửa sổ cảnh báo)`, () => {
    expect(shouldShowPromoEndingBanner(isoDaysFromNow(WARNING_WINDOW_DAYS + 1), NOW, null)).toBe(
      false,
    )
  })

  it('user đã đóng HÔM NAY (giờ VN) → không hiện lại', () => {
    // NOW = 2026-01-01T12:00:00Z = 2026-01-01T19:00:00+07:00 → ngày VN là 2026-01-01
    expect(shouldShowPromoEndingBanner(isoDaysFromNow(10), NOW, '2026-01-01')).toBe(false)
  })

  it('user đã đóng HÔM QUA, hôm nay vẫn còn ≤30 ngày → hiện lại', () => {
    expect(shouldShowPromoEndingBanner(isoDaysFromNow(10), NOW, '2025-12-31')).toBe(true)
  })
})

describe('formatDateVN', () => {
  it('định dạng dd/mm/yyyy theo giờ Việt Nam', () => {
    // 2026-01-01T12:00:00Z = 19:00 giờ VN cùng ngày 2026-01-01
    expect(formatDateVN('2026-01-01T12:00:00Z')).toBe('01/01/2026')
  })

  it('lệch ngày UTC vs VN vẫn ra đúng ngày VN (gần nửa đêm)', () => {
    // 2026-01-01T20:00:00Z = 2026-01-02T03:00:00+07:00 → ngày VN đã sang 02/01
    expect(formatDateVN('2026-01-01T20:00:00Z')).toBe('02/01/2026')
  })
})
