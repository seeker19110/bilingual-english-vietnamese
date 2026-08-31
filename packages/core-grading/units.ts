// Hệ đơn vị: mỗi đơn vị = (hệ số quy đổi về SI, vector thứ nguyên, độ lệch gốc nếu có).
// Đặc tả §4: docs/research/dac-ta-engine-cham-dung-chung.md
//
// Vì sao dùng VECTOR THỨ NGUYÊN chứ không chỉ so chuỗi đơn vị: nhờ nó engine phân biệt được
// "sai số" với "sai bản chất đại lượng" — học sinh trả khối lượng cho câu hỏi về lực bị bắt
// đúng lỗi (WRONG_DIMENSION), thay vì chỉ báo "sai" chung chung.

/** Vector 7 chiều theo đơn vị SI cơ sở: [kg, m, s, A, K, mol, cd]. */
export type Dim = readonly [number, number, number, number, number, number, number]

export type UnitDef = {
  /** Nhân với hệ số này để ra giá trị theo SI. */
  factor: number
  dim: Dim
  /** Độ lệch gốc, CỘNG sau khi nhân hệ số. Chỉ nhiệt độ có (°C → K cộng 273,15). */
  offset?: number
}

const D = (kg = 0, m = 0, s = 0, a = 0, k = 0, mol = 0, cd = 0): Dim => [kg, m, s, a, k, mol, cd]

export const DIMENSIONLESS: Dim = D()

/**
 * Bảng đơn vị tối thiểu theo đặc tả §4.2. Có cả tên tiếng Việt (giờ, phút, ngày, tấn)
 * vì học sinh Việt hay gõ tiếng Việt hơn ký hiệu quốc tế.
 */
export const UNITS: Record<string, UnitDef> = {
  // ── Độ dài ──
  mm: { factor: 1e-3, dim: D(0, 1) },
  cm: { factor: 1e-2, dim: D(0, 1) },
  dm: { factor: 1e-1, dim: D(0, 1) },
  m: { factor: 1, dim: D(0, 1) },
  km: { factor: 1e3, dim: D(0, 1) },

  // ── Khối lượng ──
  mg: { factor: 1e-6, dim: D(1) },
  g: { factor: 1e-3, dim: D(1) },
  kg: { factor: 1, dim: D(1) },
  tấn: { factor: 1e3, dim: D(1) },
  t: { factor: 1e3, dim: D(1) },

  // ── Thời gian ──
  s: { factor: 1, dim: D(0, 0, 1) },
  giây: { factor: 1, dim: D(0, 0, 1) },
  min: { factor: 60, dim: D(0, 0, 1) },
  phút: { factor: 60, dim: D(0, 0, 1) },
  h: { factor: 3600, dim: D(0, 0, 1) },
  giờ: { factor: 3600, dim: D(0, 0, 1) },
  ngày: { factor: 86400, dim: D(0, 0, 1) },

  // ── Diện tích ──
  'cm²': { factor: 1e-4, dim: D(0, 2) },
  'm²': { factor: 1, dim: D(0, 2) },
  'km²': { factor: 1e6, dim: D(0, 2) },
  ha: { factor: 1e4, dim: D(0, 2) },

  // ── Thể tích ──
  mL: { factor: 1e-6, dim: D(0, 3) },
  ml: { factor: 1e-6, dim: D(0, 3) },
  'cm³': { factor: 1e-6, dim: D(0, 3) },
  L: { factor: 1e-3, dim: D(0, 3) },
  l: { factor: 1e-3, dim: D(0, 3) },
  'm³': { factor: 1, dim: D(0, 3) },

  // ── Tốc độ ──
  'm/s': { factor: 1, dim: D(0, 1, -1) },
  'km/h': { factor: 1 / 3.6, dim: D(0, 1, -1) },

  // ── Gia tốc ──
  'm/s²': { factor: 1, dim: D(0, 1, -2) },
  'm/s^2': { factor: 1, dim: D(0, 1, -2) },
  'm/s2': { factor: 1, dim: D(0, 1, -2) },

  // ── Độ cứng ──
  'N/m': { factor: 1, dim: D(1, 0, -2) },

  // ── Động lượng ──
  'kg.m/s': { factor: 1, dim: D(1, 1, -1) },
  'kg*m/s': { factor: 1, dim: D(1, 1, -1) },
  'kg m/s': { factor: 1, dim: D(1, 1, -1) },
  'N.s': { factor: 1, dim: D(1, 1, -1) },
  'N*s': { factor: 1, dim: D(1, 1, -1) },
  Ns: { factor: 1, dim: D(1, 1, -1) },

  // ── Khối lượng riêng ──
  'kg/m³': { factor: 1, dim: D(1, -3) },
  'kg/m3': { factor: 1, dim: D(1, -3) },
  'g/cm³': { factor: 1000, dim: D(1, -3) },
  'g/cm3': { factor: 1000, dim: D(1, -3) },

  // ── Tần số ──
  Hz: { factor: 1, dim: D(0, 0, -1) },
  'rad/s': { factor: 1, dim: D(0, 0, -1) },

  // ── Lực ──
  N: { factor: 1, dim: D(1, 1, -2) },
  kN: { factor: 1e3, dim: D(1, 1, -2) },

  // ── Áp suất ──
  Pa: { factor: 1, dim: D(1, -1, -2) },
  kPa: { factor: 1e3, dim: D(1, -1, -2) },
  bar: { factor: 1e5, dim: D(1, -1, -2) },
  atm: { factor: 101325, dim: D(1, -1, -2) },

  // ── Năng lượng ──
  J: { factor: 1, dim: D(1, 2, -2) },
  kJ: { factor: 1e3, dim: D(1, 2, -2) },
  cal: { factor: 4.184, dim: D(1, 2, -2) },
  kcal: { factor: 4184, dim: D(1, 2, -2) },
  kWh: { factor: 3.6e6, dim: D(1, 2, -2) },

  // ── Công suất ──
  W: { factor: 1, dim: D(1, 2, -3) },
  kW: { factor: 1e3, dim: D(1, 2, -3) },
  MW: { factor: 1e6, dim: D(1, 2, -3) },

  // ── Điện ──
  A: { factor: 1, dim: D(0, 0, 0, 1) },
  mA: { factor: 1e-3, dim: D(0, 0, 0, 1) },
  V: { factor: 1, dim: D(1, 2, -3, -1) },
  mV: { factor: 1e-3, dim: D(1, 2, -3, -1) },
  Ω: { factor: 1, dim: D(1, 2, -3, -2) },
  kΩ: { factor: 1e3, dim: D(1, 2, -3, -2) },
  ohm: { factor: 1, dim: D(1, 2, -3, -2) },
  C: { factor: 1, dim: D(0, 0, 1, 1) },
  F: { factor: 1, dim: D(-1, -2, 4, 2) },
  Wb: { factor: 1, dim: D(1, 2, -2, -1) },
  T: { factor: 1, dim: D(1, 0, -2, -1) },

  // ── Nhiệt độ ── ⚠️ quy đổi CÓ ĐỘ LỆCH GỐC, không phải nhân hệ số. Chỗ rất dễ sai.
  K: { factor: 1, dim: D(0, 0, 0, 0, 1) },
  '°C': { factor: 1, dim: D(0, 0, 0, 0, 1), offset: 273.15 },
  '°K': { factor: 1, dim: D(0, 0, 0, 0, 1) },

  // ── Hoá học ──
  mol: { factor: 1, dim: D(0, 0, 0, 0, 0, 1) },
  mmol: { factor: 1e-3, dim: D(0, 0, 0, 0, 0, 1) },
  'g/mol': { factor: 1e-3, dim: D(1, 0, 0, 0, 0, -1) },
  M: { factor: 1e3, dim: D(0, -3, 0, 0, 0, 1) }, // mol/L = 1000 mol/m³
  'mol/L': { factor: 1e3, dim: D(0, -3, 0, 0, 0, 1) },
  '%': { factor: 0.01, dim: DIMENSIONLESS },

  // ── Cường độ sáng ──
  cd: { factor: 1, dim: D(0, 0, 0, 0, 0, 0, 1) },
}

/** Ký hiệu đơn vị, sắp giảm dần theo độ dài — để tách hậu tố khớp cụm DÀI NHẤT trước
 *  ('km/h' phải thắng 'h', 'cm³' phải thắng 'cm'). */
const UNIT_SYMBOLS_BY_LENGTH = Object.keys(UNITS).sort((a, b) => b.length - a.length)

export function dimOf(unit: string): Dim | null {
  return UNITS[unit]?.dim ?? null
}

export function sameDim(a: Dim, b: Dim): boolean {
  return a.every((v, i) => v === b[i])
}

/** Quy đổi một giá trị kèm đơn vị về giá trị theo SI. Trả null nếu không biết đơn vị. */
export function toSI(value: number, unit: string): number | null {
  const def = UNITS[unit]
  if (!def) return null
  return value * def.factor + (def.offset ?? 0)
}

/**
 * Tách chuỗi trả lời thành phần giá trị và phần đơn vị.
 *
 * Cách làm: thử khớp hậu tố với BẢNG ĐƠN VỊ ĐÃ BIẾT (dài nhất trước), thay vì đoán bằng
 * regex "chữ cái ở cuối là đơn vị". Đoán bằng regex sẽ cắt nhầm biến số trong biểu thức đại số
 * (`2x` → giá trị `2`, đơn vị `x`), còn khớp bảng thì không bao giờ nhầm.
 */
export function splitValueUnit(raw: string): { value: string; unit: string | null } {
  const trimmed = raw.trim()
  for (const symbol of UNIT_SYMBOLS_BY_LENGTH) {
    if (!trimmed.endsWith(symbol)) continue
    const head = trimmed.slice(0, trimmed.length - symbol.length).trim()
    // Phần còn lại phải kết thúc bằng chữ số hoặc dấu đóng ngoặc — nếu không, đây là chữ cái
    // dính vào tên biến chứ không phải đơn vị thật (vd 'am' không phải '<số> m').
    if (head.length > 0 && /[\d)]$/.test(head)) {
      return { value: head, unit: symbol }
    }
  }
  return { value: trimmed, unit: null }
}
