// Chuẩn hoá chuỗi câu trả lời của học sinh về dạng ASCII mà bộ phân tích biểu thức hiểu được.
//
// Đây là chỗ dễ sai nhất và ảnh hưởng 100% người dùng Việt Nam: học sinh viết `0,5` (dấu phẩy
// thập phân) chứ không phải `0.5`, và viết `1.000` với nghĩa "một nghìn".
// Đặc tả §3: docs/research/dac-ta-engine-cham-dung-chung.md

/** Ký tự phân số Unicode → biểu thức tương đương (bọc ngoặc để không vỡ thứ tự phép tính). */
const UNICODE_FRACTIONS: Record<string, string> = {
  '½': '(1/2)',
  '⅓': '(1/3)',
  '⅔': '(2/3)',
  '¼': '(1/4)',
  '¾': '(3/4)',
  '⅕': '(1/5)',
  '⅖': '(2/5)',
  '⅗': '(3/5)',
  '⅘': '(4/5)',
  '⅙': '(1/6)',
  '⅚': '(5/6)',
  '⅛': '(1/8)',
  '⅜': '(3/8)',
  '⅝': '(5/8)',
  '⅞': '(7/8)',
}

/** Chỉ số trên Unicode → luỹ thừa ASCII. Học sinh hay gõ `x²` thay vì `x^2`. */
const SUPERSCRIPTS: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
}

/**
 * Chuẩn hoá một CỤM SỐ (chỉ gồm chữ số, dấu chấm, dấu phẩy) về số ASCII dùng dấu `.` thập phân.
 *
 * Quy tắc gỡ nhập nhằng `1.000` (chốt ở đặc tả §3, cố tình ưu tiên cách hiểu Việt Nam):
 *  1. Có CẢ `,` và `.` → dấu xuất hiện SAU CÙNG là dấu thập phân, dấu kia là phân nhóm nghìn.
 *  2. Chỉ một loại dấu, xuất hiện ĐÚNG MỘT LẦN, theo sau ĐÚNG 3 chữ số → phân nhóm nghìn.
 *  3. Còn lại → dấu thập phân.
 */
function normalizeNumberLiteral(literal: string): string {
  const hasComma = literal.includes(',')
  const hasDot = literal.includes('.')

  if (hasComma && hasDot) {
    // Quy tắc 1
    const decimalMark = literal.lastIndexOf(',') > literal.lastIndexOf('.') ? ',' : '.'
    const groupMark = decimalMark === ',' ? '.' : ','
    return literal.split(groupMark).join('').replace(decimalMark, '.')
  }

  const mark = hasComma ? ',' : hasDot ? '.' : ''
  if (mark === '') return literal

  const parts = literal.split(mark)
  if (parts.length > 2) {
    // Nhiều dấu cùng loại (1.000.000) → chắc chắn là phân nhóm nghìn.
    return parts.join('')
  }

  // Quy tắc 2: đúng 3 chữ số theo sau và có chữ số phía trước → phân nhóm nghìn.
  const before = parts[0] ?? ''
  const after = parts[1] ?? ''
  if (after.length === 3 && before.length > 0) return parts.join('')

  // Quy tắc 3
  return parts.join('.')
}

/**
 * Chuẩn hoá toàn bộ chuỗi trả lời: ký tự Unicode → ASCII, dấu thập phân kiểu Việt → kiểu máy.
 * KHÔNG tính toán gì — chỉ đổi cách viết. Việc tính do expression.ts đảm nhiệm.
 */
export function normalizeAnswerText(raw: string): string {
  let s = raw.trim()

  // Học sinh hay gõ thừa dấu `=` ở đầu ("= 5") — bỏ đi cho dễ tính.
  s = s.replace(/^=+\s*/, '')

  // Dấu trừ Unicode (do copy-paste từ web/Word) → dấu trừ ASCII.
  s = s.replace(/[−–—]/g, '-')

  // Phân số Unicode → biểu thức.
  for (const [glyph, expr] of Object.entries(UNICODE_FRACTIONS)) {
    s = s.split(glyph).join(expr)
  }

  // Chỉ số trên: gom cụm liền nhau thành một luỹ thừa (x²³ → x^23, hiếm nhưng không được vỡ).
  s = s.replace(/[⁰¹²³⁴-⁹]+/g, (run) => {
    const digits = [...run].map((ch) => SUPERSCRIPTS[ch] ?? '').join('')
    return `^${digits}`
  })

  // Dấu nhân/chia và ký hiệu toán khác.
  // Lưu ý: KHÔNG coi `:` là dấu chia — học sinh dùng `:` để viết tỉ lệ (3:1, 9:3:3:1 ở môn Sinh),
  // đổi thành phép chia sẽ tính sai hoàn toàn.
  s = s.replace(/[×⋅·∙]/g, '*').replace(/÷/g, '/')
  s = s.replace(/\*\*/g, '^')
  s = s.replace(/π/g, 'pi')
  // Thêm khoảng trắng sau `sqrt` để `√2` không dính thành tên biến `sqrt2`.
  // Bộ phân tích cho phép gọi hàm không ngoặc (`sqrt 2` = `sqrt(2)`), đúng thói quen viết tay.
  s = s.replace(/√/g, 'sqrt ')
  s = s.replace(/,\s*$/, '') // dấu phẩy thừa ở cuối

  // Khoảng trắng dùng làm dấu phân nhóm nghìn ("1 000 000") → bỏ.
  // Lặp vì thay một lượt không bắt được chuỗi nhóm liên tiếp.
  let previous: string
  do {
    previous = s
    s = s.replace(/(\d)[  ](\d{3})(?!\d)/g, '$1$2')
  } while (s !== previous)

  // Ký hiệu khoa học kiểu Việt: trong `1,5.10^3` dấu `.` là dấu NHÂN, không phải dấu thập phân.
  // PHẢI đổi trước bước chuẩn hoá cụm số bên dưới: nếu để sau, `1,5.10` bị gom thành MỘT cụm số
  // và dấu phẩy bị hiểu nhầm là phân nhóm nghìn → ra 15000 thay vì 1500.
  s = s.replace(/(\d)\s*\.\s*(?=10\^)/g, '$1*')

  // Chuẩn hoá từng cụm số. Bắt cụm gồm chữ số + dấu chấm/phẩy xen giữa.
  s = s.replace(/\d[\d.,]*\d|\d/g, (literal) => normalizeNumberLiteral(literal))

  return s.trim()
}

/**
 * Rút gọn phân số về dạng tối giản. Trả về [tử, mẫu] với mẫu luôn dương.
 * Dùng cho FractionSpec và kiểm tối giản hệ số phương trình hoá học.
 */
export function simplifyFraction(num: number, den: number): [number, number] {
  if (den === 0) return [num, 0]
  const sign = den < 0 ? -1 : 1
  const g = gcd(Math.abs(num), Math.abs(den)) || 1
  return [(sign * num) / g, (sign * den) / g]
}

/** Ước chung lớn nhất (Euclid). Dùng cho rút gọn phân số + kiểm hệ số PTHH tối giản. */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  while (y !== 0) {
    const t = y
    y = x % y
    x = t
  }
  return x
}
