import { describe, it, expect } from 'vitest'
import {
  effectivePrice,
  effectiveTotalPrice,
  multiYearDiscountPercent,
  type PriceEntry,
} from './prices'

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

  it('có promoPercent > 0 → giảm % trên giá niêm yết, làm tròn về nghìn', () => {
    const entry: PriceEntry = { priceVnd: 40_000, salePriceVnd: null, saleUntil: null }
    // 40_000 * 0.9 = 36_000 (đã tròn nghìn sẵn)
    expect(effectivePrice(entry, NOW, 10)).toBe(36_000)
  })

  it('promoPercent làm giá lẻ → làm tròn về đơn vị 1.000đ', () => {
    const entry: PriceEntry = { priceVnd: 20_000, salePriceVnd: null, saleUntil: null }
    // 20_000 * 0.85 = 17_000 chẵn, thử % lẻ hơn: 15% trên 20_000 = 17_000 (chẵn) → đổi sang 33%
    // 20_000 * 0.67 = 13_400 → tròn về 13_000
    expect(effectivePrice(entry, NOW, 33)).toBe(13_000)
  })

  it('promoPercent ưu tiên hơn sale_price_vnd riêng dòng (2 cơ chế không cộng dồn)', () => {
    const entry: PriceEntry = {
      priceVnd: 40_000,
      salePriceVnd: 25_000,
      saleUntil: '2026-08-01T00:00:00+07:00',
    }
    expect(effectivePrice(entry, NOW, 20)).toBe(32_000) // 40_000 * 0.8, KHÔNG phải 25_000
  })

  it('promoPercent = 0 hoặc null → bỏ qua, dùng logic sale_price_vnd/priceVnd cũ', () => {
    const entry: PriceEntry = { priceVnd: 40_000, salePriceVnd: null, saleUntil: null }
    expect(effectivePrice(entry, NOW, 0)).toBe(40_000)
    expect(effectivePrice(entry, NOW, null)).toBe(40_000)
  })
})

describe('multiYearDiscountPercent', () => {
  it('1 năm (mua lẻ) → 0%', () => {
    expect(multiYearDiscountPercent(1)).toBe(0)
  })

  it('năm 2 → 20%, năm 3 → 30%, +10%/năm', () => {
    expect(multiYearDiscountPercent(2)).toBe(20)
    expect(multiYearDiscountPercent(3)).toBe(30)
    expect(multiYearDiscountPercent(4)).toBe(40)
  })

  it('chạm trần 80% từ năm 8 trở lên', () => {
    expect(multiYearDiscountPercent(8)).toBe(80)
    expect(multiYearDiscountPercent(9)).toBe(80)
    expect(multiYearDiscountPercent(100)).toBe(80)
  })

  it('ca biên: 0 hoặc số âm → 0% (không giảm)', () => {
    expect(multiYearDiscountPercent(0)).toBe(0)
    expect(multiYearDiscountPercent(-1)).toBe(0)
  })
})

describe('effectiveTotalPrice', () => {
  const NOW = new Date('2026-07-27T10:00:00+07:00')
  const YEAR: PriceEntry = { priceVnd: 360_000, salePriceVnd: null, saleUntil: null }

  it('1 năm, không khuyến mãi → đúng bằng effectivePrice thường', () => {
    expect(effectiveTotalPrice(YEAR, 1, NOW, null)).toBe(360_000)
  })

  it('3 năm, không khuyến mãi toàn cục → giảm 30% trên TỔNG 3 năm', () => {
    // 360_000 * 3 = 1_080_000; giảm 30% = 756_000
    expect(effectiveTotalPrice(YEAR, 3, NOW, null)).toBe(756_000)
  })

  it('3 năm (giảm 30%) nhưng khuyến mãi toàn cục cao hơn (50%) → lấy mức CAO HƠN, không cộng dồn', () => {
    // 1_080_000 * 0.5 = 540_000 (KHÔNG phải 1_080_000 * 0.2 nếu cộng dồn kiểu khác)
    expect(effectiveTotalPrice(YEAR, 3, NOW, 50)).toBe(540_000)
  })

  it('3 năm nhưng khuyến mãi toàn cục thấp hơn (10%) → vẫn lấy 30% (nhiều năm cao hơn)', () => {
    expect(effectiveTotalPrice(YEAR, 3, NOW, 10)).toBe(756_000)
  })

  it('nhiều năm (>1) bỏ qua sale_price_vnd riêng dòng (chỉ định nghĩa cho 1 năm)', () => {
    const entryWithSale: PriceEntry = {
      priceVnd: 360_000,
      salePriceVnd: 250_000,
      saleUntil: '2026-08-01T00:00:00+07:00',
    }
    // Không phải 250_000 * 3 — sale_price_vnd không áp cho tổng nhiều năm.
    expect(effectiveTotalPrice(entryWithSale, 2, NOW, null)).toBe(576_000) // 720_000 * 0.8
  })

  it('1 năm vẫn tôn trọng sale_price_vnd riêng dòng như effectivePrice', () => {
    const entryWithSale: PriceEntry = {
      priceVnd: 360_000,
      salePriceVnd: 250_000,
      saleUntil: '2026-08-01T00:00:00+07:00',
    }
    expect(effectiveTotalPrice(entryWithSale, 1, NOW, null)).toBe(250_000)
  })
})
