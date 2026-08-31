// data/solubilityTable.ts — Bảng tính tan rút gọn (các gốc/ion phổ biến trong SGK THCS+THPT).
// Dữ liệu khoa học công khai (§0.2 kho-kien-thuc-toan-gdpt2018.md — không vướng bản quyền SGK).
// Nguồn: bảng tính tan chuẩn hoá học phổ thông (tan/không tan/ít tan/không xác định).

export type Solubility = 'tan' | 'khong_tan' | 'it_tan' | 'khong_xac_dinh'

/** Cation phổ biến ở THCS+THPT theo thứ tự cột trong bảng tính tan chuẩn. */
export const CATIONS = [
  'H+',
  'Na+',
  'K+',
  'NH4+',
  'Ag+', // nhóm hoá trị I
  'Ba2+',
  'Ca2+',
  'Mg2+',
  'Zn2+',
  'Pb2+',
  'Cu2+',
  'Fe2+', // nhóm hoá trị II
  'Al3+',
  'Fe3+', // nhóm hoá trị III
] as const

/** Anion (gốc acid) phổ biến. */
export const ANIONS = [
  'OH-',
  'Cl-',
  'NO3-',
  'SO4^2-',
  'CO3^2-',
  'PO4^3-',
  'S^2-',
  'SO3^2-',
] as const

export type Cation = (typeof CATIONS)[number]
export type Anion = (typeof ANIONS)[number]

/** key = `${cation}|${anion}`. Chỉ liệt kê các cặp HAY GẶP trong bài tập phổ thông — không
 *  đầy đủ tuyệt đối, mở rộng khi cần (test canh gác cặp mới thêm không phá cặp cũ). */
const TABLE: Record<string, Solubility> = {
  'Na+|OH-': 'tan',
  'K+|OH-': 'tan',
  'Ba2+|OH-': 'tan',
  'Ca2+|OH-': 'it_tan',
  'Mg2+|OH-': 'khong_tan',
  'Zn2+|OH-': 'khong_tan',
  'Cu2+|OH-': 'khong_tan',
  'Fe2+|OH-': 'khong_tan',
  'Fe3+|OH-': 'khong_tan',
  'Al3+|OH-': 'khong_tan',
  'Ag+|OH-': 'khong_tan',

  'Na+|Cl-': 'tan',
  'K+|Cl-': 'tan',
  'NH4+|Cl-': 'tan',
  'Ba2+|Cl-': 'tan',
  'Ca2+|Cl-': 'tan',
  'Mg2+|Cl-': 'tan',
  'Zn2+|Cl-': 'tan',
  'Pb2+|Cl-': 'it_tan',
  'Cu2+|Cl-': 'tan',
  'Fe2+|Cl-': 'tan',
  'Fe3+|Cl-': 'tan',
  'Al3+|Cl-': 'tan',
  'Ag+|Cl-': 'khong_tan',

  'Na+|NO3-': 'tan',
  'K+|NO3-': 'tan',
  'NH4+|NO3-': 'tan',
  'Ba2+|NO3-': 'tan',
  'Ca2+|NO3-': 'tan',
  'Mg2+|NO3-': 'tan',
  'Zn2+|NO3-': 'tan',
  'Pb2+|NO3-': 'tan',
  'Cu2+|NO3-': 'tan',
  'Fe2+|NO3-': 'tan',
  'Fe3+|NO3-': 'tan',
  'Al3+|NO3-': 'tan',
  'Ag+|NO3-': 'tan',

  'Na+|SO4^2-': 'tan',
  'K+|SO4^2-': 'tan',
  'NH4+|SO4^2-': 'tan',
  'Ba2+|SO4^2-': 'khong_tan',
  'Ca2+|SO4^2-': 'it_tan',
  'Mg2+|SO4^2-': 'tan',
  'Zn2+|SO4^2-': 'tan',
  'Pb2+|SO4^2-': 'khong_tan',
  'Cu2+|SO4^2-': 'tan',
  'Fe2+|SO4^2-': 'tan',
  'Fe3+|SO4^2-': 'tan',
  'Al3+|SO4^2-': 'tan',
  'Ag+|SO4^2-': 'it_tan',

  'Na+|CO3^2-': 'tan',
  'K+|CO3^2-': 'tan',
  'NH4+|CO3^2-': 'tan',
  'Ba2+|CO3^2-': 'khong_tan',
  'Ca2+|CO3^2-': 'khong_tan',
  'Mg2+|CO3^2-': 'khong_tan',
  'Zn2+|CO3^2-': 'khong_tan',
  'Pb2+|CO3^2-': 'khong_tan',
  'Cu2+|CO3^2-': 'khong_tan',
  'Fe2+|CO3^2-': 'khong_tan',
  'Ag+|CO3^2-': 'khong_tan',

  'Na+|PO4^3-': 'tan',
  'K+|PO4^3-': 'tan',
  'NH4+|PO4^3-': 'tan',
  'Ba2+|PO4^3-': 'khong_tan',
  'Ca2+|PO4^3-': 'khong_tan',
  'Mg2+|PO4^3-': 'khong_tan',
  'Ag+|PO4^3-': 'khong_tan',

  'Na+|S^2-': 'tan',
  'K+|S^2-': 'tan',
  'NH4+|S^2-': 'tan',
  'Ba2+|S^2-': 'tan',
  'Ca2+|S^2-': 'it_tan',
  'Zn2+|S^2-': 'khong_tan',
  'Pb2+|S^2-': 'khong_tan',
  'Cu2+|S^2-': 'khong_tan',
  'Fe2+|S^2-': 'khong_tan',
  'Ag+|S^2-': 'khong_tan',
}

export function lookupSolubility(cation: Cation, anion: Anion): Solubility {
  return TABLE[`${cation}|${anion}`] ?? 'khong_xac_dinh'
}

/**
 * Dãy hoạt động hoá học của kim loại (§ kho-kien-thuc-hoa-gdpt2018.md lớp 9) —
 * thứ tự GIẢM DẦN mức độ hoạt động. Dùng để chấm câu hỏi so sánh khả năng phản ứng,
 * dự đoán kim loại nào đẩy được kim loại nào khỏi muối.
 */
export const METAL_ACTIVITY_SERIES = [
  'K',
  'Na',
  'Ca',
  'Mg',
  'Al',
  'Zn',
  'Fe',
  'Ni',
  'Sn',
  'Pb',
  'H',
  'Cu',
  'Ag',
  'Au',
] as const

export type MetalInSeries = (typeof METAL_ACTIVITY_SERIES)[number]

/** true nếu `a` hoạt động mạnh hơn `b` (đứng trước trong dãy) — vd đẩy được b khỏi dung dịch muối. */
export function isMoreActive(a: MetalInSeries, b: MetalInSeries): boolean {
  return METAL_ACTIVITY_SERIES.indexOf(a) < METAL_ACTIVITY_SERIES.indexOf(b)
}
