import { describe, it, expect } from 'vitest'
import { activePromoPercent, type PricePromo } from './pricePromo'

describe('activePromoPercent', () => {
  const NOW = new Date('2026-07-27T10:00:00+07:00')

  it('percent = 0 → null (không có khuyến mãi)', () => {
    const promo: PricePromo = {
      percent: 0,
      startsAt: '2026-07-01T00:00:00+07:00',
      endsAt: '2026-08-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(promo, NOW)).toBeNull()
  })

  it('thiếu startsAt hoặc endsAt → null dù percent > 0', () => {
    const missingStarts: PricePromo = {
      percent: 20,
      startsAt: null,
      endsAt: '2026-08-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    const missingEnds: PricePromo = {
      percent: 20,
      startsAt: '2026-07-01T00:00:00+07:00',
      endsAt: null,
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(missingStarts, NOW)).toBeNull()
    expect(activePromoPercent(missingEnds, NOW)).toBeNull()
  })

  it('now nằm TRONG khoảng [starts, ends] → trả về percent', () => {
    const promo: PricePromo = {
      percent: 15,
      startsAt: '2026-07-01T00:00:00+07:00',
      endsAt: '2026-08-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(promo, NOW)).toBe(15)
  })

  it('now TRƯỚC starts_at → null (ca biên: chưa tới ngày bắt đầu)', () => {
    const promo: PricePromo = {
      percent: 15,
      startsAt: '2026-08-01T00:00:00+07:00',
      endsAt: '2026-09-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(promo, NOW)).toBeNull()
  })

  it('now SAU ends_at → null (ca biên: đã hết hạn)', () => {
    const promo: PricePromo = {
      percent: 15,
      startsAt: '2026-06-01T00:00:00+07:00',
      endsAt: '2026-07-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(promo, NOW)).toBeNull()
  })
})
