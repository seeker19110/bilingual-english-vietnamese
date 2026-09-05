import { describe, expect, it } from 'vitest'
import {
  PERIODIC_TABLE,
  getElementBySymbol,
  getElementByZ,
  comparePeriodicTrend,
  type PeriodicElement,
} from './periodicTable.js'

describe('PERIODIC_TABLE — bất biến dữ liệu', () => {
  it('có đúng 36 nguyên tố, Z chạy liên tục 1..36 không trùng', () => {
    expect(PERIODIC_TABLE).toHaveLength(36)
    const zs = PERIODIC_TABLE.map((e) => e.z)
    expect(new Set(zs).size).toBe(36) // không trùng Z
    const sorted = [...zs].sort((a, b) => a - b)
    expect(sorted).toEqual(Array.from({ length: 36 }, (_, i) => i + 1)) // liên tục 1..36
  })

  it('kí hiệu nguyên tố duy nhất, không rỗng', () => {
    const symbols = PERIODIC_TABLE.map((e) => e.symbol)
    expect(new Set(symbols).size).toBe(symbols.length)
    for (const s of symbols) expect(s.length).toBeGreaterThan(0)
  })

  it('nguyên tử khối > 0 và không giảm khi Z tăng (thứ tự khai báo theo Z)', () => {
    // Lấy phần tử ra biến cục bộ trước khi dùng: dự án bật `noUncheckedIndexedAccess`
    // nên truy cập theo chỉ số luôn có thể là undefined dưới con mắt của TypeScript.
    PERIODIC_TABLE.forEach((element, i) => {
      expect(element.atomicMass).toBeGreaterThan(0)
      const truoc = PERIODIC_TABLE[i - 1]
      if (truoc) {
        // K(Z19)=39 < Ar(Z18)=40 là ngoại lệ khoa học thật (đã biết), các cặp khác tăng dần
        expect(element.atomicMass).toBeGreaterThanOrEqual(truoc.atomicMass - 1)
      }
    })
  })

  it('chu kì hợp lệ (1-4) và nhóm là chuỗi không rỗng', () => {
    for (const e of PERIODIC_TABLE) {
      expect(e.period).toBeGreaterThanOrEqual(1)
      expect(e.period).toBeLessThanOrEqual(4)
      expect(e.group.length).toBeGreaterThan(0)
      expect(e.commonValences.length).toBeGreaterThan(0)
    }
  })
})

describe('getElementBySymbol', () => {
  it('tìm thấy nguyên tố hợp lệ', () => {
    const h = getElementBySymbol('H')
    expect(h).toBeDefined()
    expect(h?.z).toBe(1)
  })

  it('trả undefined khi không tìm thấy (nhánh không tồn tại)', () => {
    expect(getElementBySymbol('Xx')).toBeUndefined()
  })
})

describe('getElementByZ', () => {
  it('tìm thấy nguyên tố hợp lệ', () => {
    const kr = getElementByZ(36)
    expect(kr).toBeDefined()
    expect(kr?.symbol).toBe('Kr')
  })

  it('trả undefined khi Z không tồn tại (nhánh không tìm thấy)', () => {
    expect(getElementByZ(999)).toBeUndefined()
  })
})

describe('comparePeriodicTrend', () => {
  const H = getElementByZ(1) as PeriodicElement // z1 period1
  const He = getElementByZ(2) as PeriodicElement // z2 period1, cùng chu kì với H
  const Li = getElementByZ(3) as PeriodicElement // z3 period2

  it('cùng nguyên tố (z bằng nhau) trả 0', () => {
    expect(comparePeriodicTrend(H, H, 'atomicRadius')).toBe(0)
    expect(comparePeriodicTrend(H, H, 'electronegativity')).toBe(0)
  })

  it('atomicRadius — cùng chu kì, Z tăng → bán kính giảm', () => {
    // H (z1) so với He (z2): a.z < b.z → 1 (a lớn hơn b)
    expect(comparePeriodicTrend(H, He, 'atomicRadius')).toBe(1)
    // He so với H: a.z > b.z → -1
    expect(comparePeriodicTrend(He, H, 'atomicRadius')).toBe(-1)
  })

  it('atomicRadius — khác chu kì, chu kì tăng → bán kính tăng', () => {
    // H (period1) so với Li (period2): a.period < b.period → -1
    expect(comparePeriodicTrend(H, Li, 'atomicRadius')).toBe(-1)
    // Li so với H: a.period > b.period → 1
    expect(comparePeriodicTrend(Li, H, 'atomicRadius')).toBe(1)
  })

  it('electronegativity — cùng chu kì, ngược lại atomicRadius', () => {
    expect(comparePeriodicTrend(H, He, 'electronegativity')).toBe(-1)
    expect(comparePeriodicTrend(He, H, 'electronegativity')).toBe(1)
  })

  it('electronegativity — khác chu kì, ngược lại atomicRadius', () => {
    expect(comparePeriodicTrend(H, Li, 'electronegativity')).toBe(1)
    expect(comparePeriodicTrend(Li, H, 'electronegativity')).toBe(-1)
  })
})
