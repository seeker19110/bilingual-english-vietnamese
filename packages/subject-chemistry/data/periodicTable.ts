// data/periodicTable.ts — Bảng tuần hoàn dạng dữ liệu, dùng cho engine chấm + hiển thị.
// Đây là SỰ THẬT KHOA HỌC công khai (Z, kí hiệu, tên, nguyên tử khối, nhóm, chu kì) — không
// vướng bản quyền SGK nào (xem ranh giới bản quyền ở
// docs/research/kho-kien-thuc-toan-gdpt2018.md §0.2, áp dụng chung cho mọi môn khoa học).
//
// Phạm vi: 36 nguyên tố đầu (Z=1..36, hết chu kì 4) — đủ cho toàn bộ chương trình THCS+THPT
// GDPT 2018 (KHTN 6-9 + Hoá học 10-12). Nguyên tử khối lấy giá trị làm tròn phổ biến trong SGK.

export type ElementGroup =
  | 'alkali_metal' // nhóm IA (trừ H)
  | 'alkaline_earth_metal' // nhóm IIA
  | 'transition_metal'
  | 'metalloid'
  | 'other_metal'
  | 'halogen' // nhóm VIIA
  | 'noble_gas' // nhóm VIIIA
  | 'nonmetal'
  | 'hydrogen'

export interface PeriodicElement {
  /** Số hiệu nguyên tử = số proton (§ kho-kien-thuc-hoa-gdpt2018.md lớp 7). */
  z: number
  symbol: string
  nameVi: string
  /** Nguyên tử khối trung bình, làm tròn — đơn vị amu. */
  atomicMass: number
  period: number
  /** Nhóm dạng số La Mã cổ điển (IA..VIIIA) — khớp cách SGK "Kết nối tri thức" trình bày. */
  group: string
  category: ElementGroup
  /** Hoá trị phổ biến nhất dùng để lập CTHH ở THCS — mảng vì có nguyên tố đa hoá trị. */
  commonValences: number[]
}

export const PERIODIC_TABLE: readonly PeriodicElement[] = [
  {
    z: 1,
    symbol: 'H',
    nameVi: 'Hydrogen',
    atomicMass: 1,
    period: 1,
    group: 'IA',
    category: 'hydrogen',
    commonValences: [1],
  },
  {
    z: 2,
    symbol: 'He',
    nameVi: 'Helium',
    atomicMass: 4,
    period: 1,
    group: 'VIIIA',
    category: 'noble_gas',
    commonValences: [0],
  },
  {
    z: 3,
    symbol: 'Li',
    nameVi: 'Lithium',
    atomicMass: 7,
    period: 2,
    group: 'IA',
    category: 'alkali_metal',
    commonValences: [1],
  },
  {
    z: 4,
    symbol: 'Be',
    nameVi: 'Beryllium',
    atomicMass: 9,
    period: 2,
    group: 'IIA',
    category: 'alkaline_earth_metal',
    commonValences: [2],
  },
  {
    z: 5,
    symbol: 'B',
    nameVi: 'Boron',
    atomicMass: 11,
    period: 2,
    group: 'IIIA',
    category: 'metalloid',
    commonValences: [3],
  },
  {
    z: 6,
    symbol: 'C',
    nameVi: 'Carbon',
    atomicMass: 12,
    period: 2,
    group: 'IVA',
    category: 'nonmetal',
    commonValences: [4, 2],
  },
  {
    z: 7,
    symbol: 'N',
    nameVi: 'Nitrogen',
    atomicMass: 14,
    period: 2,
    group: 'VA',
    category: 'nonmetal',
    commonValences: [3, 2, 4, 5],
  },
  {
    z: 8,
    symbol: 'O',
    nameVi: 'Oxygen',
    atomicMass: 16,
    period: 2,
    group: 'VIA',
    category: 'nonmetal',
    commonValences: [2],
  },
  {
    z: 9,
    symbol: 'F',
    nameVi: 'Fluorine',
    atomicMass: 19,
    period: 2,
    group: 'VIIA',
    category: 'halogen',
    commonValences: [1],
  },
  {
    z: 10,
    symbol: 'Ne',
    nameVi: 'Neon',
    atomicMass: 20,
    period: 2,
    group: 'VIIIA',
    category: 'noble_gas',
    commonValences: [0],
  },
  {
    z: 11,
    symbol: 'Na',
    nameVi: 'Sodium',
    atomicMass: 23,
    period: 3,
    group: 'IA',
    category: 'alkali_metal',
    commonValences: [1],
  },
  {
    z: 12,
    symbol: 'Mg',
    nameVi: 'Magnesium',
    atomicMass: 24,
    period: 3,
    group: 'IIA',
    category: 'alkaline_earth_metal',
    commonValences: [2],
  },
  {
    z: 13,
    symbol: 'Al',
    nameVi: 'Aluminium',
    atomicMass: 27,
    period: 3,
    group: 'IIIA',
    category: 'other_metal',
    commonValences: [3],
  },
  {
    z: 14,
    symbol: 'Si',
    nameVi: 'Silicon',
    atomicMass: 28,
    period: 3,
    group: 'IVA',
    category: 'metalloid',
    commonValences: [4],
  },
  {
    z: 15,
    symbol: 'P',
    nameVi: 'Phosphorus',
    atomicMass: 31,
    period: 3,
    group: 'VA',
    category: 'nonmetal',
    commonValences: [3, 5],
  },
  {
    z: 16,
    symbol: 'S',
    nameVi: 'Sulfur',
    atomicMass: 32,
    period: 3,
    group: 'VIA',
    category: 'nonmetal',
    commonValences: [2, 4, 6],
  },
  {
    z: 17,
    symbol: 'Cl',
    nameVi: 'Chlorine',
    atomicMass: 35.5,
    period: 3,
    group: 'VIIA',
    category: 'halogen',
    commonValences: [1, 3, 5, 7],
  },
  {
    z: 18,
    symbol: 'Ar',
    nameVi: 'Argon',
    atomicMass: 40,
    period: 3,
    group: 'VIIIA',
    category: 'noble_gas',
    commonValences: [0],
  },
  {
    z: 19,
    symbol: 'K',
    nameVi: 'Potassium',
    atomicMass: 39,
    period: 4,
    group: 'IA',
    category: 'alkali_metal',
    commonValences: [1],
  },
  {
    z: 20,
    symbol: 'Ca',
    nameVi: 'Calcium',
    atomicMass: 40,
    period: 4,
    group: 'IIA',
    category: 'alkaline_earth_metal',
    commonValences: [2],
  },
  {
    z: 21,
    symbol: 'Sc',
    nameVi: 'Scandium',
    atomicMass: 45,
    period: 4,
    group: 'IIIB',
    category: 'transition_metal',
    commonValences: [3],
  },
  {
    z: 22,
    symbol: 'Ti',
    nameVi: 'Titanium',
    atomicMass: 48,
    period: 4,
    group: 'IVB',
    category: 'transition_metal',
    commonValences: [4],
  },
  {
    z: 23,
    symbol: 'V',
    nameVi: 'Vanadium',
    atomicMass: 51,
    period: 4,
    group: 'VB',
    category: 'transition_metal',
    commonValences: [5],
  },
  {
    z: 24,
    symbol: 'Cr',
    nameVi: 'Chromium',
    atomicMass: 52,
    period: 4,
    group: 'VIB',
    category: 'transition_metal',
    commonValences: [2, 3, 6],
  },
  {
    z: 25,
    symbol: 'Mn',
    nameVi: 'Manganese',
    atomicMass: 55,
    period: 4,
    group: 'VIIB',
    category: 'transition_metal',
    commonValences: [2, 4, 7],
  },
  {
    z: 26,
    symbol: 'Fe',
    nameVi: 'Iron',
    atomicMass: 56,
    period: 4,
    group: 'VIIIB',
    category: 'transition_metal',
    commonValences: [2, 3],
  },
  {
    z: 27,
    symbol: 'Co',
    nameVi: 'Cobalt',
    atomicMass: 59,
    period: 4,
    group: 'VIIIB',
    category: 'transition_metal',
    commonValences: [2, 3],
  },
  {
    z: 28,
    symbol: 'Ni',
    nameVi: 'Nickel',
    atomicMass: 59,
    period: 4,
    group: 'VIIIB',
    category: 'transition_metal',
    commonValences: [2, 3],
  },
  {
    z: 29,
    symbol: 'Cu',
    nameVi: 'Copper',
    atomicMass: 64,
    period: 4,
    group: 'IB',
    category: 'transition_metal',
    commonValences: [1, 2],
  },
  {
    z: 30,
    symbol: 'Zn',
    nameVi: 'Zinc',
    atomicMass: 65,
    period: 4,
    group: 'IIB',
    category: 'transition_metal',
    commonValences: [2],
  },
  {
    z: 31,
    symbol: 'Ga',
    nameVi: 'Gallium',
    atomicMass: 70,
    period: 4,
    group: 'IIIA',
    category: 'other_metal',
    commonValences: [3],
  },
  {
    z: 32,
    symbol: 'Ge',
    nameVi: 'Germanium',
    atomicMass: 73,
    period: 4,
    group: 'IVA',
    category: 'metalloid',
    commonValences: [4],
  },
  {
    z: 33,
    symbol: 'As',
    nameVi: 'Arsenic',
    atomicMass: 75,
    period: 4,
    group: 'VA',
    category: 'metalloid',
    commonValences: [3, 5],
  },
  {
    z: 34,
    symbol: 'Se',
    nameVi: 'Selenium',
    atomicMass: 79,
    period: 4,
    group: 'VIA',
    category: 'nonmetal',
    commonValences: [2, 4, 6],
  },
  {
    z: 35,
    symbol: 'Br',
    nameVi: 'Bromine',
    atomicMass: 80,
    period: 4,
    group: 'VIIA',
    category: 'halogen',
    commonValences: [1, 3, 5, 7],
  },
  {
    z: 36,
    symbol: 'Kr',
    nameVi: 'Krypton',
    atomicMass: 84,
    period: 4,
    group: 'VIIIA',
    category: 'noble_gas',
    commonValences: [0],
  },
] as const

const bySymbol = new Map<string, PeriodicElement>(PERIODIC_TABLE.map((e) => [e.symbol, e]))
const byZ = new Map<number, PeriodicElement>(PERIODIC_TABLE.map((e) => [e.z, e]))

export function getElementBySymbol(symbol: string): PeriodicElement | undefined {
  return bySymbol.get(symbol)
}

export function getElementByZ(z: number): PeriodicElement | undefined {
  return byZ.get(z)
}

/** Bán kính nguyên tử, độ âm điện: định tính THPT — TĂNG dần theo chu kì phải → trái,
 *  TĂNG dần theo nhóm trên → dưới (bán kính); độ âm điện ngược lại. Dùng để chấm câu hỏi
 *  so sánh (không dùng số liệu tuyệt đối vì SGK không yêu cầu thuộc số). */
export function comparePeriodicTrend(
  a: PeriodicElement,
  b: PeriodicElement,
  trend: 'atomicRadius' | 'electronegativity',
): -1 | 0 | 1 {
  if (a.z === b.z) return 0
  const samePeriod = a.period === b.period
  if (trend === 'atomicRadius') {
    if (samePeriod) return a.z < b.z ? 1 : -1 // cùng chu kì, Z tăng → bán kính giảm
    return a.period < b.period ? -1 : 1 // chu kì tăng → bán kính tăng
  }
  // electronegativity: ngược lại atomicRadius
  if (samePeriod) return a.z < b.z ? -1 : 1
  return a.period < b.period ? 1 : -1
}
