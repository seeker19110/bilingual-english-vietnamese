// Công thức hoá học và cân bằng phương trình hoá học.
// Đặc tả §7: docs/research/dac-ta-engine-cham-dung-chung.md
//
// Điểm quan trọng: cân bằng PTHH chấm được TUYỆT ĐỐI CHÍNH XÁC bằng thuật toán thuần, không
// cần AI. Không so với một bộ hệ số cố định — bội số của bộ hệ số đúng cũng bảo toàn nguyên tố;
// thay vào đó kiểm bảo toàn nguyên tố + điện tích, rồi kiểm bộ hệ số đã tối giản chưa.

import { gcd } from './number.js'

/** Số nguyên tử theo từng nguyên tố, kèm điện tích của tiểu phân. */
export type Composition = {
  atoms: Record<string, number>
  charge: number
}

/** Chỉ số dưới Unicode (H₂O) → chữ số ASCII. */
const SUBSCRIPTS: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
}

/** Chỉ số trên Unicode (SO₄²⁻) → ASCII, dùng cho phần điện tích. */
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
  '⁺': '+',
  '⁻': '-',
}

/**
 * Đưa công thức về ASCII.
 *
 * Quan trọng: phải xử lý CHỈ SỐ TRÊN trước và gắn dấu `^`, nếu không `SO₄²⁻` sẽ phẳng thành
 * `SO42-` — không còn phân biệt được "SO4 mang điện 2−" với "SO42 mang điện 1−" (từng cho ra
 * điện tích −42 khi chưa tách). Chỉ số trên luôn là phần điện tích, chỉ số dưới là số nguyên tử.
 */
function toAscii(formula: string): string {
  const withCharge = formula.replace(/[⁰¹²³⁴-⁹⁺⁻]+/g, (run) => {
    const mapped = [...run].map((ch) => SUPERSCRIPTS[ch] ?? '').join('')
    return `^${mapped}`
  })
  return [...withCharge]
    .map((ch) => SUBSCRIPTS[ch] ?? ch)
    .join('')
    .replace(/\s+/g, '')
}

function addAtoms(target: Record<string, number>, source: Record<string, number>, times: number) {
  for (const [element, count] of Object.entries(source)) {
    target[element] = (target[element] ?? 0) + count * times
  }
}

/**
 * Tách phần điện tích ở cuối công thức: `SO4^2-`, `SO42-`, `Na+`, `Fe^3+`.
 * Trả về công thức đã bỏ phần điện tích + giá trị điện tích.
 */
function extractCharge(input: string): { body: string; charge: number } {
  const match = input.match(/\^?(\d*)([+-])$/)
  if (!match || match.index === undefined) return { body: input, charge: 0 }
  const digits = match[1] ?? ''
  const magnitude = digits === '' ? 1 : Number(digits)
  const sign = match[2] === '+' ? 1 : -1
  return { body: input.slice(0, match.index), charge: magnitude * sign }
}

/**
 * Phân tích công thức hoá học thành vector nguyên tố.
 * Hỗ trợ: ngoặc lồng nhau `Fe2(SO4)3`, chỉ số Unicode `Fe₂(SO₄)₃`, ngậm nước `CuSO4·5H2O`,
 * ion mang điện `SO4^2-`.
 * Trả null nếu không đọc được.
 */
export function parseFormula(formula: string): Composition | null {
  const ascii = toAscii(formula)
  if (ascii === '') return null

  // Ngậm nước: các phần nối bằng dấu chấm giữa được cộng dồn (CuSO4·5H2O).
  const hydrateParts = ascii.split(/[·.*]/).filter((p) => p !== '')
  if (hydrateParts.length > 1) {
    const total: Record<string, number> = {}
    let charge = 0
    for (const part of hydrateParts) {
      const parsed = parseSingleFormula(part)
      if (parsed === null) return null
      addAtoms(total, parsed.atoms, 1)
      charge += parsed.charge
    }
    return { atoms: total, charge }
  }

  return parseSingleFormula(ascii)
}

function parseSingleFormula(input: string): Composition | null {
  const { body, charge } = extractCharge(input)

  // Hệ số dạng phân tử đứng trước (5H2O trong phần ngậm nước).
  const leading = body.match(/^(\d+)/)
  const leadingDigits = leading?.[1] ?? ''
  const multiplier = leadingDigits === '' ? 1 : Number(leadingDigits)
  const rest = body.slice(leadingDigits.length)
  if (rest === '') return null

  const atoms = parseGroup(rest)
  if (atoms === null) return null

  const scaled: Record<string, number> = {}
  addAtoms(scaled, atoms, multiplier)
  return { atoms: scaled, charge }
}

/** Phân tích thân công thức (không còn hệ số/điện tích) bằng ngăn xếp cho ngoặc lồng nhau. */
function parseGroup(input: string): Record<string, number> | null {
  const stack: Record<string, number>[] = [{}]
  let i = 0

  while (i < input.length) {
    const ch = input.charAt(i)

    if (ch === '(' || ch === '[') {
      stack.push({})
      i++
      continue
    }

    if (ch === ')' || ch === ']') {
      const group = stack.pop()
      const parent = stack[stack.length - 1]
      if (group === undefined || parent === undefined) return null
      i++
      const digits = input.slice(i).match(/^\d+/)?.[0] ?? ''
      const count = digits === '' ? 1 : Number(digits)
      i += digits.length
      addAtoms(parent, group, count)
      continue
    }

    // Ký hiệu nguyên tố: một chữ hoa + tối đa hai chữ thường.
    const symbolMatch = input.slice(i).match(/^([A-Z][a-z]{0,2})(\d*)/)
    const element = symbolMatch?.[1] ?? ''
    const top = stack[stack.length - 1]
    if (element === '' || top === undefined || symbolMatch === null) return null
    const digits = symbolMatch[2] ?? ''
    const count = digits === '' ? 1 : Number(digits)
    addAtoms(top, { [element]: 1 }, count)
    i += symbolMatch[0].length
  }

  if (stack.length !== 1) return null // còn ngoặc chưa đóng
  return stack[0] ?? null
}

/** Hai công thức có cùng thành phần nguyên tố và điện tích không. */
export function sameComposition(a: Composition, b: Composition): boolean {
  if (a.charge !== b.charge) return false
  const elements = new Set([...Object.keys(a.atoms), ...Object.keys(b.atoms)])
  for (const element of elements) {
    if ((a.atoms[element] ?? 0) !== (b.atoms[element] ?? 0)) return false
  }
  return true
}

export type EquationTerm = { coefficient: number; formula: string }
export type ParsedEquation = { left: EquationTerm[]; right: EquationTerm[] }

/**
 * Phân tích phương trình hoá học học sinh nhập, vd `2H2 + O2 -> 2H2O`.
 * Chấp nhận nhiều kiểu mũi tên: `->`, `=>`, `→`, `⟶`, `=`.
 */
export function parseEquation(input: string): ParsedEquation | null {
  const sides = input.split(/->|=>|→|⟶|↔|⇌|=/)
  if (sides.length !== 2) return null

  const left = parseSide(sides[0] ?? '')
  const right = parseSide(sides[1] ?? '')
  if (left === null || right === null || left.length === 0 || right.length === 0) return null
  return { left, right }
}

/**
 * Tách một vế thành các chất, phân biệt dấu `+` NGĂN CÁCH CHẤT với dấu `+` là ĐIỆN TÍCH của ion.
 *
 * Mẹo: cắt thô theo `+` rồi soi các mảnh rỗng. `'Ag+ + Cl-'.split('+')` cho
 * `['Ag', ' ', ' Cl-']` — mảnh giữa chỉ có khoảng trắng, đó chính là dấu hiệu dấu `+` liền trước
 * là điện tích chứ không phải dấu ngăn cách. Trả dấu đó về cho chất đứng trước.
 */
function splitTerms(side: string): string[] {
  const pieces = side.split('+')
  const terms: string[] = []
  let buffer = pieces[0] ?? ''

  for (let i = 1; i < pieces.length; i++) {
    const piece = pieces[i] ?? ''
    if (piece.trim() === '') {
      // Điện tích viết DÍNH liền chất (`Ag+`), còn dấu ngăn cách thì có khoảng trắng phía trước.
      // Nhờ vậy `H2 + -> H2O` (dấu `+` treo lơ lửng) bị bắt là sai thay vì hiểu thành ion `H2+`.
      if (/\s$/.test(buffer)) {
        terms.push('')
        buffer = ''
        continue
      }
      buffer += '+'
      continue
    }
    terms.push(buffer)
    buffer = piece
  }
  terms.push(buffer)
  return terms
}

function parseSide(side: string): EquationTerm[] | null {
  const terms: EquationTerm[] = []
  for (const raw of splitTerms(side)) {
    const term = raw.trim()
    if (term === '') return null
    const match = term.match(/^(\d*)\s*(.+)$/)
    const formula = match?.[2]?.trim() ?? ''
    if (match === null || formula === '') return null
    const digits = match[1] ?? ''
    const coefficient = digits === '' ? 1 : Number(digits)
    if (!Number.isInteger(coefficient) || coefficient <= 0) return null
    terms.push({ coefficient, formula })
  }
  return terms
}

export type BalanceResult =
  | { status: 'ok' }
  | { status: 'parse_error' }
  | { status: 'unbalanced_atoms'; elements: string[] }
  | { status: 'unbalanced_charge' }
  | { status: 'not_simplified' }

/**
 * Kiểm một phương trình đã cân bằng đúng chưa — hoàn toàn bằng thuật toán, không dùng AI.
 *
 * Các bước (đặc tả §7.2):
 *  1. Mỗi chất → vector nguyên tố, nhân hệ số, cộng theo vế.
 *  2. Đúng ⟺ vector hai vế bằng nhau ở MỌI nguyên tố; lệch thì nêu ĐÍCH DANH nguyên tố lệch
 *     (phản hồi rất có ích cho học sinh mà không tốn lượt AI nào).
 *  3. Phản ứng ion: kiểm thêm bảo toàn điện tích.
 *  4. Kiểm tối giản: ƯCLN các hệ số phải bằng 1.
 */
export function checkBalance(equation: ParsedEquation, requireSimplified = true): BalanceResult {
  const totals = (
    terms: EquationTerm[],
  ): { atoms: Record<string, number>; charge: number } | null => {
    const atoms: Record<string, number> = {}
    let charge = 0
    for (const term of terms) {
      const parsed = parseFormula(term.formula)
      if (parsed === null) return null
      addAtoms(atoms, parsed.atoms, term.coefficient)
      charge += parsed.charge * term.coefficient
    }
    return { atoms, charge }
  }

  const left = totals(equation.left)
  const right = totals(equation.right)
  if (left === null || right === null) return { status: 'parse_error' }

  const elements = new Set([...Object.keys(left.atoms), ...Object.keys(right.atoms)])
  const offending = [...elements]
    .filter((el) => (left.atoms[el] ?? 0) !== (right.atoms[el] ?? 0))
    .sort()
  if (offending.length > 0) return { status: 'unbalanced_atoms', elements: offending }

  if (left.charge !== right.charge) return { status: 'unbalanced_charge' }

  if (requireSimplified) {
    const coefficients = [...equation.left, ...equation.right].map((t) => t.coefficient)
    const common = coefficients.reduce((acc, c) => gcd(acc, c), 0)
    if (common > 1) return { status: 'not_simplified' }
  }

  return { status: 'ok' }
}

/** Tập chất (bỏ hệ số) của một vế — dùng để xác minh học sinh không tự đổi chất. */
export function substanceSet(terms: EquationTerm[]): string[] {
  return terms.map((t) => toAscii(t.formula)).sort()
}
