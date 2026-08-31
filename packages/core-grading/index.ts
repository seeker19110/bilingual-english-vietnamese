// Engine chấm dùng chung cho Toán · Lý · Hoá.
// Đặc tả đầy đủ: docs/research/dac-ta-engine-cham-dung-chung.md
//
// NGUYÊN TẮC BẤT DI BẤT DỊCH: không có AI trong luồng chấm. Hàm thuần, tất định, chạy được
// offline. AI chỉ dùng để GIẢI THÍCH sau khi đã biết đúng/sai — không bao giờ để PHÁN đúng/sai.
//
// Dùng ở CẢ hai phía: client chấm ngay cho phản hồi tức thì, server chấm LẠI bằng chính hàm này
// trước khi ghi điểm/tiến độ (không tin client — CLAUDE.md §4.2). Cùng một code nên không lệch.

import {
  checkBalance,
  parseEquation,
  parseFormula,
  sameComposition,
  substanceSet,
} from './chemistry.js'
import { evaluateNumeric, expressionsEqual } from './expression.js'
import { gcd, normalizeAnswerText, simplifyFraction } from './number.js'
import { defaultToleranceFor, isEssentiallyEqual, withinTolerance } from './tolerance.js'
import type {
  AnswerSpec,
  ChemEquationSpec,
  ChemFormulaSpec,
  ChoiceSpec,
  ExpressionSpec,
  FractionSpec,
  GradeResult,
  NumericSpec,
} from './types.js'
import { dimOf, sameDim, splitValueUnit, toSI } from './units.js'

export * from './types.js'
export { normalizeAnswerText, simplifyFraction } from './number.js'
export { expressionsEqual, evaluateNumeric } from './expression.js'
export { parseFormula, parseEquation, checkBalance } from './chemistry.js'
export { withinTolerance, DEFAULT_TOLERANCE_BY_SUBJECT } from './tolerance.js'
export { UNITS, splitValueUnit, toSI } from './units.js'

const fail = (reason: GradeResult['reason'], normalized?: string): GradeResult => ({
  correct: false,
  reason,
  normalized,
})

/** Chấm một câu trả lời. Hàm thuần, tất định, KHÔNG gọi AI/mạng/CSDL. */
export function gradeAnswer(raw: string, spec: AnswerSpec): GradeResult {
  if (raw.trim() === '') return fail('EMPTY')

  switch (spec.kind) {
    case 'numeric':
      return gradeNumeric(raw, spec)
    case 'fraction':
      return gradeFraction(raw, spec)
    case 'expression':
      return gradeExpression(raw, spec)
    case 'choice':
      return gradeChoice(raw, spec)
    case 'chemFormula':
      return gradeChemFormula(raw, spec)
    case 'chemEquation':
      return gradeChemEquation(raw, spec)
  }
}

// ── Số (có/không đơn vị) ────────────────────────────────────────────────────

function gradeNumeric(raw: string, spec: NumericSpec): GradeResult {
  const { value: valueText, unit } = splitValueUnit(raw)
  const parsed = evaluateNumeric(valueText)
  if (parsed === null) return fail('PARSE_ERROR')

  const expectedDim = spec.unit === undefined ? null : dimOf(spec.unit)

  // Đề không yêu cầu đơn vị (đa số bài Toán): bỏ qua đơn vị thừa nếu học sinh có ghi,
  // chỉ so con số — thà rộng lượng còn hơn chấm oan người làm đúng.
  if (expectedDim === null) {
    return compareNumbers(parsed, spec.value, spec, `${parsed}`)
  }

  if (unit === null) {
    if (spec.unitRequired !== false) return fail('MISSING_UNIT', `${parsed}`)
    return compareNumbers(parsed, spec.value, spec, `${parsed}`)
  }

  const studentDim = dimOf(unit)
  if (studentDim === null) return fail('PARSE_ERROR', `${parsed} ${unit}`)

  const normalized = `${parsed} ${unit}`

  if (!sameDim(studentDim, expectedDim)) {
    // Phân biệt hai lỗi khác hẳn nhau về mặt sư phạm:
    //  - con số trùng đáp án → học sinh TÍNH ĐÚNG, chỉ ghi nhầm đơn vị (WRONG_UNIT)
    //  - con số cũng khác → hiểu sai bản chất đại lượng (WRONG_DIMENSION)
    const expectedInStudentUnit = spec.value
    if (isEssentiallyEqual(parsed, expectedInStudentUnit)) return fail('WRONG_UNIT', normalized)
    return fail('WRONG_DIMENSION', normalized)
  }

  const inSI = toSI(parsed, unit)
  if (inSI === null) return fail('PARSE_ERROR', normalized)
  return compareNumbers(inSI, spec.value, spec, normalized)
}

function compareNumbers(
  actual: number,
  expected: number,
  spec: NumericSpec,
  normalized: string,
): GradeResult {
  if (isEssentiallyEqual(actual, expected)) {
    return { correct: true, reason: 'CORRECT', normalized }
  }

  const tolerance = spec.tolerance ?? defaultToleranceFor(expected)
  if (withinTolerance(actual, expected, tolerance)) {
    return { correct: true, reason: 'CORRECT_LOOSE', normalized }
  }

  // Sai dấu là lỗi rất phổ biến và đáng được nhắc riêng thay vì chỉ báo "sai".
  if (expected !== 0 && isEssentiallyEqual(actual, -expected)) {
    return fail('SIGN_ERROR', normalized)
  }

  return fail('WRONG_VALUE', normalized)
}

// ── Phân số ─────────────────────────────────────────────────────────────────

function gradeFraction(raw: string, spec: FractionSpec): GradeResult {
  const text = normalizeAnswerText(raw)
  const expectedValue = spec.num / spec.den

  const match = text.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/)
  if (match) {
    const num = Number(match[1])
    const den = Number(match[2])
    if (den === 0) return fail('PARSE_ERROR', text)
    if (!isEssentiallyEqual(num / den, expectedValue)) return fail('WRONG_VALUE', text)

    const [sNum, sDen] = simplifyFraction(num, den)
    const isSimplified = gcd(num, den) === 1 || (sNum === num && sDen === den)
    if (!isSimplified) {
      return spec.requireSimplified
        ? fail('NOT_SIMPLIFIED', text)
        : { correct: true, reason: 'NOT_SIMPLIFIED', normalized: `${sNum}/${sDen}` }
    }
    return { correct: true, reason: 'CORRECT', normalized: `${sNum}/${sDen}` }
  }

  // Học sinh trả bằng số thập phân thay vì phân số — vẫn đúng về giá trị.
  const value = evaluateNumeric(text)
  if (value === null) return fail('PARSE_ERROR', text)
  if (isEssentiallyEqual(value, expectedValue)) {
    return { correct: true, reason: 'CORRECT', normalized: `${value}` }
  }
  return fail('WRONG_VALUE', `${value}`)
}

// ── Biểu thức đại số ────────────────────────────────────────────────────────

function gradeExpression(raw: string, spec: ExpressionSpec): GradeResult {
  const normalized = normalizeAnswerText(raw)
  if (expressionsEqual(raw, spec.expr)) {
    return { correct: true, reason: 'CORRECT', normalized }
  }
  // Không đọc được thì báo PARSE_ERROR, khác hẳn "đọc được nhưng sai".
  if (evaluateNumeric(raw) === null && normalized.length === 0) return fail('PARSE_ERROR')
  return fail('WRONG_VALUE', normalized)
}

// ── Trắc nghiệm ─────────────────────────────────────────────────────────────

function gradeChoice(raw: string, spec: ChoiceSpec): GradeResult {
  const picked = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .sort()
  const expected = [...spec.correctIds].sort()
  const normalized = picked.join(',')

  if (picked.length !== expected.length) return fail('WRONG_VALUE', normalized)
  const same = picked.every((id, i) => id === expected[i])
  return same ? { correct: true, reason: 'CORRECT', normalized } : fail('WRONG_VALUE', normalized)
}

// ── Hoá học ─────────────────────────────────────────────────────────────────

function gradeChemFormula(raw: string, spec: ChemFormulaSpec): GradeResult {
  const student = parseFormula(raw)
  const expected = parseFormula(spec.formula)
  if (student === null) return fail('PARSE_ERROR')
  if (expected === null) return fail('PARSE_ERROR')
  return sameComposition(student, expected)
    ? { correct: true, reason: 'CORRECT', normalized: raw.trim() }
    : fail('WRONG_VALUE', raw.trim())
}

function gradeChemEquation(raw: string, spec: ChemEquationSpec): GradeResult {
  const equation = parseEquation(raw)
  if (equation === null) return fail('PARSE_ERROR')

  // Học sinh chỉ được điền HỆ SỐ — đổi luôn chất là bài khác, không phải cân bằng sai.
  const expectedLeft = substanceSet(spec.reactants.map((f) => ({ coefficient: 1, formula: f })))
  const expectedRight = substanceSet(spec.products.map((f) => ({ coefficient: 1, formula: f })))
  const gotLeft = substanceSet(equation.left)
  const gotRight = substanceSet(equation.right)

  const sameList = (a: string[], b: string[]) =>
    a.length === b.length && a.every((v, i) => v === b[i])
  if (!sameList(gotLeft, expectedLeft) || !sameList(gotRight, expectedRight)) {
    return fail('WRONG_SUBSTANCES', raw.trim())
  }

  const result = checkBalance(equation, spec.requireSimplified !== false)
  switch (result.status) {
    case 'ok':
      return { correct: true, reason: 'CORRECT', normalized: raw.trim() }
    case 'parse_error':
      return fail('PARSE_ERROR', raw.trim())
    case 'unbalanced_atoms':
      return { ...fail('UNBALANCED_ATOMS', raw.trim()), offendingElements: result.elements }
    case 'unbalanced_charge':
      return fail('UNBALANCED_CHARGE', raw.trim())
    case 'not_simplified':
      return fail('NOT_SIMPLIFIED', raw.trim())
  }
}
