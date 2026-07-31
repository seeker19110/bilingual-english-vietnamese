import { describe, it, expect } from 'vitest'
import {
  shouldShowPlanExpiryBanner,
  daysUntilPlanExpires,
  WARNING_WINDOW_DAYS,
} from './planExpiryBanner'

// Mốc "bây giờ" cố định: 12:00 UTC = 19:00 giờ VN (2026-01-01).
const NOW = new Date('2026-01-01T12:00:00Z')

function isoDaysFromNow(days: number): string {
  return new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
}

describe('shouldShowPlanExpiryBanner', () => {
  it('gói Free → không bao giờ hiện, kể cả planExpiresAt còn giá trị cũ sót lại', () => {
    expect(shouldShowPlanExpiryBanner('free', isoDaysFromNow(2), NOW, null)).toBe(false)
  })

  it('planExpiresAt = null (gói vĩnh viễn) → không hiện', () => {
    expect(shouldShowPlanExpiryBanner('pro', null, NOW, null)).toBe(false)
  })

  it('đã hết hạn → không hiện (server sẽ tự hạ về Free)', () => {
    expect(shouldShowPlanExpiryBanner('pro', isoDaysFromNow(-1), NOW, null)).toBe(false)
  })

  it(`còn đúng ${WARNING_WINDOW_DAYS} ngày → hiện`, () => {
    expect(shouldShowPlanExpiryBanner('pro', isoDaysFromNow(WARNING_WINDOW_DAYS), NOW, null)).toBe(
      true,
    )
  })

  it(`còn ${WARNING_WINDOW_DAYS + 1} ngày → không hiện (ngoài cửa sổ cảnh báo)`, () => {
    expect(
      shouldShowPlanExpiryBanner('pro', isoDaysFromNow(WARNING_WINDOW_DAYS + 1), NOW, null),
    ).toBe(false)
  })

  it('gói VIP cũng hiện được (không riêng Pro)', () => {
    expect(shouldShowPlanExpiryBanner('vip', isoDaysFromNow(1), NOW, null)).toBe(true)
  })

  it('user đã đóng HÔM NAY (giờ VN) → không hiện lại', () => {
    expect(shouldShowPlanExpiryBanner('pro', isoDaysFromNow(2), NOW, '2026-01-01')).toBe(false)
  })

  it('user đã đóng HÔM QUA, hôm nay vẫn còn trong cửa sổ → hiện lại', () => {
    expect(shouldShowPlanExpiryBanner('pro', isoDaysFromNow(2), NOW, '2025-12-31')).toBe(true)
  })
})

describe('daysUntilPlanExpires', () => {
  it('còn vài giờ của ngày cuối vẫn làm tròn LÊN thành 1 ngày, không tụt về 0', () => {
    const in3Hours = new Date(NOW.getTime() + 3 * 60 * 60 * 1000).toISOString()
    expect(daysUntilPlanExpires(in3Hours, NOW)).toBe(1)
  })
})
