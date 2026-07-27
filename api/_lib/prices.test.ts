import { describe, it, expect } from 'vitest'
import { effectivePrice, type PriceEntry } from './prices'

describe('effectivePrice', () => {
  const NOW = new Date('2026-07-27T10:00:00+07:00')

  it('không khuyến mãi → giá niêm yết', () => {
    const entry: PriceEntry = { priceVnd: 40_000, salePriceVnd: null, saleUntil: null }
    expect(effectivePrice(entry, NOW)).toBe(40_000)
  })

  it('đang trong hạn khuyến mãi → giá khuyến mãi', () => {
    const entry: PriceEntry = {
      priceVnd: 40_000,
      salePriceVnd: 25_000,
      saleUntil: '2026-08-01T00:00:00+07:00',
    }
    expect(effectivePrice(entry, NOW)).toBe(25_000)
  })

  it('đã hết hạn khuyến mãi → quay lại giá niêm yết', () => {
    const entry: PriceEntry = {
      priceVnd: 40_000,
      salePriceVnd: 25_000,
      saleUntil: '2026-07-01T00:00:00+07:00',
    }
    expect(effectivePrice(entry, NOW)).toBe(40_000)
  })

  it('có sale_until nhưng thiếu sale_price_vnd → coi như không khuyến mãi', () => {
    const entry: PriceEntry = {
      priceVnd: 40_000,
      salePriceVnd: null,
      saleUntil: '2026-08-01T00:00:00+07:00',
    }
    expect(effectivePrice(entry, NOW)).toBe(40_000)
  })
})
