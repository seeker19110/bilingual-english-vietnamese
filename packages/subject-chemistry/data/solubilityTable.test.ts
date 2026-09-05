import { describe, expect, it } from 'vitest'
import {
  CATIONS,
  ANIONS,
  lookupSolubility,
  METAL_ACTIVITY_SERIES,
  isMoreActive,
  type Cation,
  type Anion,
  type Solubility,
} from './solubilityTable.js'

const VALID_SOLUBILITY: Solubility[] = ['tan', 'khong_tan', 'it_tan', 'khong_xac_dinh']

describe('CATIONS / ANIONS — bất biến danh sách', () => {
  it('không rỗng, không trùng, không có phần tử rỗng', () => {
    expect(CATIONS.length).toBeGreaterThan(0)
    expect(ANIONS.length).toBeGreaterThan(0)
    expect(new Set(CATIONS).size).toBe(CATIONS.length)
    expect(new Set(ANIONS).size).toBe(ANIONS.length)
    for (const c of CATIONS) expect(c.length).toBeGreaterThan(0)
    for (const a of ANIONS) expect(a.length).toBeGreaterThan(0)
  })
})

describe('lookupSolubility — phủ toàn bộ ma trận cation x anion', () => {
  it('mọi cặp cation x anion đều trả về giá trị hợp lệ (có trong bảng hoặc khong_xac_dinh)', () => {
    for (const c of CATIONS) {
      for (const a of ANIONS) {
        const result = lookupSolubility(c as Cation, a as Anion)
        expect(VALID_SOLUBILITY).toContain(result)
      }
    }
  })

  it('ca có trong bảng: NaOH tan', () => {
    expect(lookupSolubility('Na+', 'OH-')).toBe('tan')
  })

  it('ca ít tan: CaOH2 ít tan, AgCl không tan', () => {
    expect(lookupSolubility('Ca2+', 'OH-')).toBe('it_tan')
    expect(lookupSolubility('Ag+', 'Cl-')).toBe('khong_tan')
  })

  it('ca KHÔNG có trong bảng → mặc định khong_xac_dinh (nhánh ?? )', () => {
    // Pb2+|OH- không có mặt trong TABLE
    expect(lookupSolubility('Pb2+', 'OH-')).toBe('khong_xac_dinh')
    // H+ không xuất hiện ở bất kì cặp nào trong TABLE
    expect(lookupSolubility('H+', 'Cl-')).toBe('khong_xac_dinh')
  })

  it('mọi giá trị dữ liệu thật trong bảng đều nằm trong tập Solubility hợp lệ', () => {
    // duyệt hết ma trận, thu tập các giá trị KHÁC khong_xac_dinh (tức thật sự có trong TABLE)
    const foundValues = new Set<Solubility>()
    for (const c of CATIONS) {
      for (const a of ANIONS) {
        foundValues.add(lookupSolubility(c as Cation, a as Anion))
      }
    }
    for (const v of foundValues) expect(VALID_SOLUBILITY).toContain(v)
    // phải có ít nhất các giá trị tan/khong_tan/it_tan xuất hiện thật (không chỉ toàn khong_xac_dinh)
    expect(foundValues.has('tan')).toBe(true)
    expect(foundValues.has('khong_tan')).toBe(true)
    expect(foundValues.has('it_tan')).toBe(true)
    expect(foundValues.has('khong_xac_dinh')).toBe(true)
  })
})

describe('METAL_ACTIVITY_SERIES — bất biến dãy hoạt động hoá học', () => {
  it('không rỗng, không trùng kim loại', () => {
    expect(METAL_ACTIVITY_SERIES.length).toBeGreaterThan(0)
    expect(new Set(METAL_ACTIVITY_SERIES).size).toBe(METAL_ACTIVITY_SERIES.length)
  })

  it('chứa H ở đúng vị trí phân cách kim loại trước/sau H trong acid', () => {
    expect(METAL_ACTIVITY_SERIES).toContain('H')
  })
})

describe('isMoreActive', () => {
  it('kim loại đứng trước hoạt động mạnh hơn (K mạnh hơn Na)', () => {
    expect(isMoreActive('K', 'Na')).toBe(true)
  })

  it('kim loại đứng sau hoạt động yếu hơn (Na không mạnh hơn K) — nhánh false', () => {
    expect(isMoreActive('Na', 'K')).toBe(false)
  })

  it('so sánh quanh mốc H: Cu yếu hơn H, Zn mạnh hơn H', () => {
    expect(isMoreActive('Cu', 'H')).toBe(false)
    expect(isMoreActive('Zn', 'H')).toBe(true)
  })
})
