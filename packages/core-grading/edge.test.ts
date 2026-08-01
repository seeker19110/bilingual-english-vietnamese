// Test ca biên/nhánh phòng thủ của engine chấm.
// Tách riêng khỏi grading.test.ts (vốn bám danh sách nghiệm thu ở đặc tả §9) để file kia đọc
// vẫn khớp 1-1 với đặc tả, còn file này lo phần "đường xấu": đầu vào hỏng, đơn vị lạ, tràn nhánh.

import { describe, expect, it } from 'vitest'
import { checkBalance, parseEquation, parseFormula } from './chemistry'
import { evaluateNumeric, expressionsEqual, parseExpression } from './expression'
import { gradeAnswer } from './index'
import { gcd, normalizeAnswerText, simplifyFraction } from './number'
import { defaultToleranceFor, roundToSigFigs, withinTolerance } from './tolerance'
import { dimOf, splitValueUnit, toSI } from './units'

describe('dung sai — đủ 4 chế độ', () => {
  it('exact chỉ chấp nhận đúng tuyệt đối', () => {
    expect(withinTolerance(5, 5, { mode: 'exact' })).toBe(true)
    expect(withinTolerance(5.001, 5, { mode: 'exact' })).toBe(false)
  })

  it('absolute so theo sai lệch tuyệt đối', () => {
    expect(withinTolerance(5.05, 5, { mode: 'absolute', eps: 0.1 })).toBe(true)
    expect(withinTolerance(5.2, 5, { mode: 'absolute', eps: 0.1 })).toBe(false)
  })

  it('relative với đáp án bằng 0 thì lùi về so tuyệt đối (tránh chia cho 0)', () => {
    expect(withinTolerance(0, 0, { mode: 'relative', pct: 5 })).toBe(true)
    expect(withinTolerance(0.5, 0, { mode: 'relative', pct: 5 })).toBe(false)
  })

  it('sigfig so theo số chữ số có nghĩa', () => {
    expect(withinTolerance(3.14159, 3.14162, { mode: 'sigfig', digits: 4 })).toBe(true)
    expect(withinTolerance(3.15, 3.14, { mode: 'sigfig', digits: 3 })).toBe(false)
  })

  it('roundToSigFigs xử lý được số 0 và số không hữu hạn', () => {
    expect(roundToSigFigs(0, 3)).toBe(0)
    expect(roundToSigFigs(Number.NaN, 3)).toBeNaN()
    expect(roundToSigFigs(1234, 2)).toBe(1200)
    expect(roundToSigFigs(0.0012345, 3)).toBeCloseTo(0.00123, 8)
  })

  it('giá trị không hữu hạn thì luôn coi là không đạt', () => {
    expect(withinTolerance(Number.NaN, 5, { mode: 'exact' })).toBe(false)
    expect(withinTolerance(Number.POSITIVE_INFINITY, 5, { mode: 'relative', pct: 5 })).toBe(false)
  })

  it('dung sai mặc định: số nguyên đòi đúng tuyệt đối, số lẻ cho lệch nhẹ', () => {
    expect(defaultToleranceFor(10)).toEqual({ mode: 'exact' })
    expect(defaultToleranceFor(10.5)).toEqual({ mode: 'relative', pct: 0.1 })
  })
})

describe('tiện ích số', () => {
  it('rút gọn phân số, mẫu luôn dương', () => {
    expect(simplifyFraction(4, 8)).toEqual([1, 2])
    expect(simplifyFraction(3, -6)).toEqual([-1, 2])
    expect(simplifyFraction(5, 0)).toEqual([5, 0]) // mẫu 0 → trả nguyên, không chia
  })

  it('ước chung lớn nhất', () => {
    expect(gcd(12, 18)).toBe(6)
    expect(gcd(7, 0)).toBe(7)
    expect(gcd(-12, 18)).toBe(6)
  })

  it('chuẩn hoá giữ nguyên chuỗi không có dấu phân cách', () => {
    expect(normalizeAnswerText('42')).toBe('42')
    expect(normalizeAnswerText('x + y')).toBe('x + y')
  })
})

describe('đơn vị — nhánh không tìm thấy', () => {
  it('đơn vị lạ trả null thay vì đoán bừa', () => {
    expect(dimOf('xyz')).toBeNull()
    expect(toSI(5, 'xyz')).toBeNull()
  })

  it('không có đơn vị ở cuối thì trả nguyên chuỗi', () => {
    expect(splitValueUnit('123')).toEqual({ value: '123', unit: null })
    expect(splitValueUnit('am')).toEqual({ value: 'am', unit: null })
  })

  it('học sinh ghi đơn vị không có trong bảng → PARSE_ERROR, không chấm bừa', () => {
    const spec = { kind: 'numeric', value: 10, unit: 'N' } as const
    expect(gradeAnswer('10 foo', spec).reason).toBe('PARSE_ERROR')
  })
})

describe('biểu thức — đầu vào hỏng', () => {
  it('ký tự lạ hoặc cú pháp sai thì không phân tích được', () => {
    expect(parseExpression('2 @ 3')).toBeNull()
    expect(parseExpression('(2 + 3')).toBeNull()
    expect(parseExpression('2 +')).toBeNull()
    expect(parseExpression('')).toBeNull()
    expect(evaluateNumeric('2 @ 3')).toBeNull()
  })

  it('còn biến tự do thì không tính ra số được', () => {
    expect(evaluateNumeric('2x')).toBeNull()
  })

  it('so khớp với biểu thức không đọc được luôn cho false', () => {
    expect(expressionsEqual('2x', '((')).toBe(false)
    expect(expressionsEqual('((', '2x')).toBe(false)
  })

  it('hiểu dấu cộng đơn nguyên, hằng số pi và luỹ thừa kết hợp phải', () => {
    expect(evaluateNumeric('+5')).toBe(5)
    expect(evaluateNumeric('pi')).toBeCloseTo(Math.PI, 10)
    expect(evaluateNumeric('2^3^2')).toBe(512) // 2^(3^2), không phải (2^3)^2
    expect(evaluateNumeric('-2^2')).toBe(-4)
  })

  it('hiểu các hàm cơ bản và phép nhân ngầm với ngoặc', () => {
    expect(evaluateNumeric('abs(-3)')).toBe(3)
    expect(evaluateNumeric('ln(1)')).toBe(0)
    expect(evaluateNumeric('log(100)')).toBe(2)
    expect(evaluateNumeric('exp(0)')).toBe(1)
    expect(evaluateNumeric('(2)(3)')).toBe(6)
  })

  it('chia cho 0 coi như không xác định, không ra vô cực', () => {
    expect(evaluateNumeric('1/0')).toBeNull()
  })

  it('biểu thức không xác định ở MỌI điểm thăm dò thì không kết luận bằng nhau', () => {
    // sqrt của số âm với mọi mẫu âm, chia 0 với mọi mẫu — không đủ mẫu hợp lệ.
    expect(expressionsEqual('x/0', 'x/0')).toBe(false)
  })

  it('chấm biểu thức khi học sinh bỏ trống hoặc gõ bậy', () => {
    const spec = { kind: 'expression', expr: 'x+1' } as const
    expect(gradeAnswer('  ', spec).reason).toBe('EMPTY')
    expect(gradeAnswer('@@@', spec).correct).toBe(false)
  })
})

describe('phân số — nhánh còn lại', () => {
  it('mẫu bằng 0 → PARSE_ERROR', () => {
    expect(gradeAnswer('1/0', { kind: 'fraction', num: 1, den: 2 }).reason).toBe('PARSE_ERROR')
  })

  it('số thập phân sai giá trị → WRONG_VALUE', () => {
    expect(gradeAnswer('0,7', { kind: 'fraction', num: 1, den: 2 }).reason).toBe('WRONG_VALUE')
  })

  it('phân số sai giá trị → WRONG_VALUE', () => {
    expect(gradeAnswer('1/3', { kind: 'fraction', num: 1, den: 2 }).reason).toBe('WRONG_VALUE')
  })

  it('không đọc được → PARSE_ERROR', () => {
    expect(gradeAnswer('@@@', { kind: 'fraction', num: 1, den: 2 }).reason).toBe('PARSE_ERROR')
  })
})

describe('hoá học — đầu vào hỏng', () => {
  it('công thức không đọc được trả null', () => {
    expect(parseFormula('')).toBeNull()
    expect(parseFormula('(H2O')).toBeNull()
    expect(parseFormula('2')).toBeNull()
    expect(parseFormula('h2o')).toBeNull() // ký hiệu nguyên tố phải viết hoa chữ đầu
  })

  it('phương trình thiếu vế hoặc thiếu mũi tên trả null', () => {
    expect(parseEquation('H2 + O2')).toBeNull()
    expect(parseEquation('H2 -> ')).toBeNull()
    expect(parseEquation('-> H2O')).toBeNull()
    expect(parseEquation('H2 + -> H2O')).toBeNull()
  })

  it('hệ số 0 hoặc âm không hợp lệ', () => {
    expect(parseEquation('0H2 + O2 -> H2O')).toBeNull()
  })

  it('chất trong phương trình không đọc được → parse_error', () => {
    const eq = parseEquation('Xx( + O2 -> H2O')
    expect(eq === null || checkBalance(eq).status === 'parse_error').toBe(true)
  })

  it('cho phép bỏ qua yêu cầu tối giản khi đề không đòi', () => {
    const eq = parseEquation('4H2 + 2O2 -> 4H2O')
    expect(checkBalance(eq!, false).status).toBe('ok')
    expect(checkBalance(eq!, true).status).toBe('not_simplified')
  })

  it('gradeAnswer trả PARSE_ERROR khi phương trình không đọc được', () => {
    const spec = { kind: 'chemEquation', reactants: ['H2', 'O2'], products: ['H2O'] } as const
    expect(gradeAnswer('không phải phương trình', spec).reason).toBe('PARSE_ERROR')
  })

  it('gradeAnswer chấm công thức hỏng → PARSE_ERROR', () => {
    expect(gradeAnswer('(((', { kind: 'chemFormula', formula: 'H2O' }).reason).toBe('PARSE_ERROR')
  })

  it('so thành phần phân biệt cả điện tích', () => {
    const neutral = parseFormula('Na')
    const ion = parseFormula('Na+')
    expect(neutral).not.toBeNull()
    expect(ion).not.toBeNull()
    expect(gradeAnswer('Na+', { kind: 'chemFormula', formula: 'Na' }).correct).toBe(false)
  })

  it('đọc được ngoặc vuông và ký hiệu nguyên tố hai chữ cái', () => {
    expect(parseFormula('[Cu(NH3)4]SO4')?.atoms).toEqual({ Cu: 1, N: 4, H: 12, S: 1, O: 4 })
  })
})
