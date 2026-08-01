// Bộ test ca biên cho engine chấm — đúng danh sách bắt buộc ở đặc tả §9
// (docs/research/dac-ta-engine-cham-dung-chung.md). Chấm sai làm mất niềm tin người học ngay
// lập tức nên phần này soi kỹ hơn mức trung bình của repo.

import { describe, expect, it } from 'vitest'
import { checkBalance, parseEquation, parseFormula } from './chemistry'
import { evaluateNumeric, expressionsEqual } from './expression'
import { DEFAULT_TOLERANCE_BY_SUBJECT, gradeAnswer } from './index'
import { normalizeAnswerText } from './number'
import { splitValueUnit } from './units'
import type { NumericSpec } from './types'

describe('chuẩn hoá số — bẫy cách viết tiếng Việt', () => {
  it('hiểu dấu phẩy thập phân kiểu Việt Nam', () => {
    expect(evaluateNumeric('0,5')).toBe(0.5)
    expect(evaluateNumeric('0.5')).toBe(0.5)
    expect(evaluateNumeric('1/2')).toBe(0.5)
    expect(evaluateNumeric('½')).toBe(0.5)
  })

  it('gỡ nhập nhằng 1.000 theo quy tắc đã chốt', () => {
    expect(evaluateNumeric('1.000')).toBe(1000) // 3 chữ số theo sau → phân nhóm nghìn
    expect(evaluateNumeric('1,000')).toBe(1000)
    expect(evaluateNumeric('1.5')).toBe(1.5) // 1 chữ số → dấu thập phân
    expect(evaluateNumeric('1.0000')).toBe(1.0) // 4 chữ số → dấu thập phân
    expect(evaluateNumeric('1.000.000')).toBe(1000000)
    expect(evaluateNumeric('1 000 000')).toBe(1000000)
  })

  it('có cả dấu chấm và dấu phẩy thì dấu sau cùng là dấu thập phân', () => {
    expect(evaluateNumeric('1.234,5')).toBe(1234.5)
    expect(evaluateNumeric('1,234.5')).toBe(1234.5)
  })

  it('chấp nhận dấu trừ Unicode và dấu = thừa ở đầu', () => {
    expect(evaluateNumeric('−5')).toBe(-5)
    expect(evaluateNumeric('= 5')).toBe(5)
    expect(evaluateNumeric('  5  ')).toBe(5)
  })

  it('hiểu luỹ thừa, ký hiệu khoa học và căn bậc hai', () => {
    expect(evaluateNumeric('2^3')).toBe(8)
    expect(evaluateNumeric('2**3')).toBe(8)
    expect(evaluateNumeric('1,5e3')).toBe(1500)
    expect(evaluateNumeric('1,5.10^3')).toBe(1500)
    expect(evaluateNumeric('√4')).toBe(2)
    expect(evaluateNumeric('sqrt(9)')).toBe(3)
    expect(normalizeAnswerText('x²')).toBe('x^2')
  })

  it('KHÔNG coi dấu hai chấm là phép chia (tỉ lệ 3:1 ở môn Sinh)', () => {
    expect(normalizeAnswerText('3:1')).toBe('3:1')
  })
})

describe('đơn vị và thứ nguyên', () => {
  const force: NumericSpec = { kind: 'numeric', value: 10, unit: 'N' }

  it('tách được phần đơn vị mà không cắt nhầm biến số', () => {
    expect(splitValueUnit('10 N')).toEqual({ value: '10', unit: 'N' })
    expect(splitValueUnit('72 km/h')).toEqual({ value: '72', unit: 'km/h' })
    expect(splitValueUnit('2x')).toEqual({ value: '2x', unit: null })
  })

  it('quy đổi đơn vị: 1 km = 1000 m = 100000 cm', () => {
    const spec: NumericSpec = { kind: 'numeric', value: 1000, unit: 'm' }
    expect(gradeAnswer('1 km', spec).correct).toBe(true)
    expect(gradeAnswer('1000 m', spec).correct).toBe(true)
    expect(gradeAnswer('100000 cm', spec).correct).toBe(true)
  })

  it('số đúng nhưng đơn vị sai → WRONG_UNIT (học sinh tính đúng, ghi nhầm)', () => {
    expect(gradeAnswer('10 kg', force).reason).toBe('WRONG_UNIT')
  })

  it('sai cả đại lượng lẫn con số → WRONG_DIMENSION', () => {
    const spec: NumericSpec = { kind: 'numeric', value: 50, unit: 'N' }
    expect(gradeAnswer('10 kg', spec).reason).toBe('WRONG_DIMENSION')
  })

  it('thiếu đơn vị khi đề bắt buộc → MISSING_UNIT', () => {
    expect(gradeAnswer('10', force).reason).toBe('MISSING_UNIT')
    expect(gradeAnswer('10', { ...force, unitRequired: false }).correct).toBe(true)
  })

  it('nhiệt độ quy đổi CÓ ĐỘ LỆCH GỐC: 25 °C = 298,15 K', () => {
    const spec: NumericSpec = { kind: 'numeric', value: 298.15, unit: 'K' }
    expect(gradeAnswer('25 °C', spec).correct).toBe(true)
    expect(gradeAnswer('298,15 K', spec).correct).toBe(true)
  })

  it('đề Toán không có đơn vị thì bỏ qua đơn vị thừa', () => {
    expect(gradeAnswer('5', { kind: 'numeric', value: 5 }).correct).toBe(true)
  })
})

describe('dung sai', () => {
  it('hấp thụ chênh lệch g = 10 và g = 9,8 với dung sai mặc định môn Lý', () => {
    // Ca thật: cùng bài, học sinh lấy g = 10 ra 100 N, đáp án chuẩn lấy g = 9,8 ra 98 N.
    // Chênh 2,04% — đây chính là ca khiến ngưỡng 2% ban đầu bị bác bỏ, phải nâng lên 3%.
    const spec: NumericSpec = {
      kind: 'numeric',
      value: 98,
      unit: 'N',
      tolerance: DEFAULT_TOLERANCE_BY_SUBJECT.physics,
    }
    const loose = gradeAnswer('100 N', spec)
    expect(loose.correct).toBe(true)
    expect(loose.reason).toBe('CORRECT_LOOSE')
  })

  it('ngưỡng 2% cũ KHÔNG đủ cho ca g = 10 vs 9,8 — canh gác chống đặt lại nhầm', () => {
    const tooTight: NumericSpec = {
      kind: 'numeric',
      value: 98,
      unit: 'N',
      tolerance: { mode: 'relative', pct: 2 },
    }
    expect(gradeAnswer('100 N', tooTight).correct).toBe(false)
  })

  it('lệch 5% thì phải sai', () => {
    const spec: NumericSpec = {
      kind: 'numeric',
      value: 100,
      unit: 'N',
      tolerance: DEFAULT_TOLERANCE_BY_SUBJECT.physics,
    }
    expect(gradeAnswer('105 N', spec).correct).toBe(false)
  })

  it('đúng chính xác thì là CORRECT, không phải CORRECT_LOOSE', () => {
    const spec: NumericSpec = { kind: 'numeric', value: 98, unit: 'N' }
    expect(gradeAnswer('98 N', spec).reason).toBe('CORRECT')
  })

  it('đúng trị tuyệt đối nhưng sai dấu → SIGN_ERROR', () => {
    expect(gradeAnswer('-5', { kind: 'numeric', value: 5 }).reason).toBe('SIGN_ERROR')
  })

  it('bỏ trống → EMPTY, không phải PARSE_ERROR', () => {
    expect(gradeAnswer('   ', { kind: 'numeric', value: 5 }).reason).toBe('EMPTY')
  })

  it('không đọc được → PARSE_ERROR', () => {
    expect(gradeAnswer('abc @@@', { kind: 'numeric', value: 5 }).reason).toBe('PARSE_ERROR')
  })
})

describe('biểu thức đại số — so khớp bằng thăm dò số', () => {
  it('nhận các cách viết tương đương', () => {
    expect(expressionsEqual('2(x+1)', '2x+2')).toBe(true)
    expect(expressionsEqual('2*x + 2', '2x+2')).toBe(true)
    expect(expressionsEqual('x^2-1', '(x-1)(x+1)')).toBe(true)
  })

  it('phân biệt được biểu thức khác nhau', () => {
    expect(expressionsEqual('x+1', 'x-1')).toBe(false)
    expect(expressionsEqual('x^2', 'x^3')).toBe(false)
    expect(expressionsEqual('x+y', 'x')).toBe(false) // khác tập biến
  })

  it('không chấm oan biểu thức có mẫu số triệt tiêu tại điểm thăm dò', () => {
    expect(expressionsEqual('(x^2-1)/(x-1)', 'x+1')).toBe(true)
  })

  it('TẤT ĐỊNH — gọi nhiều lần cho cùng kết quả', () => {
    for (let i = 0; i < 5; i++) {
      expect(expressionsEqual('2(x+1)', '2x+2')).toBe(true)
      expect(expressionsEqual('x+1', 'x-1')).toBe(false)
    }
  })

  it('chấm qua gradeAnswer', () => {
    const spec = { kind: 'expression', expr: '2*x + 2' } as const
    expect(gradeAnswer('2(x+1)', spec).correct).toBe(true)
    expect(gradeAnswer('2x - 2', spec).correct).toBe(false)
  })
})

describe('phân số', () => {
  it('chấp nhận cả phân số lẫn số thập phân', () => {
    const spec = { kind: 'fraction', num: 1, den: 2 } as const
    expect(gradeAnswer('1/2', spec).correct).toBe(true)
    expect(gradeAnswer('0,5', spec).correct).toBe(true)
  })

  it('chưa tối giản → NOT_SIMPLIFIED', () => {
    const spec = { kind: 'fraction', num: 1, den: 2, requireSimplified: true } as const
    const result = gradeAnswer('4/8', spec)
    expect(result.reason).toBe('NOT_SIMPLIFIED')
    expect(result.correct).toBe(false)
  })

  it('không bắt buộc tối giản thì vẫn tính đúng nhưng có nhắc', () => {
    const spec = { kind: 'fraction', num: 1, den: 2 } as const
    const result = gradeAnswer('4/8', spec)
    expect(result.correct).toBe(true)
    expect(result.reason).toBe('NOT_SIMPLIFIED')
  })
})

describe('hoá học — phân tích công thức', () => {
  it('đọc được ngoặc lồng nhau và chỉ số Unicode', () => {
    expect(parseFormula('Fe2(SO4)3')?.atoms).toEqual({ Fe: 2, S: 3, O: 12 })
    expect(parseFormula('Fe₂(SO₄)₃')?.atoms).toEqual({ Fe: 2, S: 3, O: 12 })
  })

  it('đọc được muối ngậm nước', () => {
    expect(parseFormula('CuSO4·5H2O')?.atoms).toEqual({ Cu: 1, S: 1, O: 9, H: 10 })
  })

  it('đọc được điện tích của ion', () => {
    expect(parseFormula('SO4^2-')?.charge).toBe(-2)
    expect(parseFormula('Na+')?.charge).toBe(1)
    expect(parseFormula('SO₄²⁻')?.charge).toBe(-2)
  })

  it('chấm công thức qua gradeAnswer', () => {
    const spec = { kind: 'chemFormula', formula: 'H2SO4' } as const
    expect(gradeAnswer('H₂SO₄', spec).correct).toBe(true)
    expect(gradeAnswer('H2SO3', spec).correct).toBe(false)
  })
})

describe('hoá học — cân bằng phương trình', () => {
  const spec = {
    kind: 'chemEquation',
    reactants: ['H2', 'O2'],
    products: ['H2O'],
  } as const

  it('phương trình cân bằng đúng → CORRECT', () => {
    expect(gradeAnswer('2H2 + O2 -> 2H2O', spec).reason).toBe('CORRECT')
    expect(gradeAnswer('2H2 + O2 → 2H2O', spec).reason).toBe('CORRECT')
  })

  it('hệ số gấp đôi bộ tối giản → NOT_SIMPLIFIED', () => {
    expect(gradeAnswer('4H2 + 2O2 -> 4H2O', spec).reason).toBe('NOT_SIMPLIFIED')
  })

  it('lệch nguyên tố → UNBALANCED_ATOMS, có nêu ĐÚNG TÊN nguyên tố lệch', () => {
    const result = gradeAnswer('H2 + O2 -> H2O', spec)
    expect(result.reason).toBe('UNBALANCED_ATOMS')
    expect(result.offendingElements).toEqual(['O'])
  })

  it('học sinh đổi luôn chất → WRONG_SUBSTANCES, không phải lỗi cân bằng', () => {
    expect(gradeAnswer('2H2 + O2 -> 2H2O2', spec).reason).toBe('WRONG_SUBSTANCES')
  })

  it('kiểm bảo toàn điện tích với phản ứng ion', () => {
    const ionic = parseEquation('Ag+ + Cl- -> AgCl')
    expect(ionic).not.toBeNull()
    expect(checkBalance(ionic!).status).toBe('ok')

    const bad = parseEquation('Ag+ + Cl- -> AgCl+')
    expect(checkBalance(bad!).status).toBe('unbalanced_charge')
  })

  it('cân bằng phương trình phức tạp hơn', () => {
    const combustion = parseEquation('CH4 + 2O2 -> CO2 + 2H2O')
    expect(checkBalance(combustion!).status).toBe('ok')
  })
})

describe('trắc nghiệm', () => {
  it('chấm đúng khi chọn đủ và đúng đáp án', () => {
    const spec = { kind: 'choice', correctIds: ['a', 'c'] } as const
    expect(gradeAnswer('a, c', spec).correct).toBe(true)
    expect(gradeAnswer('c a', spec).correct).toBe(true)
    expect(gradeAnswer('a', spec).correct).toBe(false)
    expect(gradeAnswer('a b c', spec).correct).toBe(false)
  })
})

describe('bất biến chung của engine', () => {
  it('gradeAnswer là hàm thuần — gọi lại cho kết quả y hệt', () => {
    const spec: NumericSpec = { kind: 'numeric', value: 1000, unit: 'm' }
    const first = gradeAnswer('1 km', spec)
    const second = gradeAnswer('1 km', spec)
    expect(first).toEqual(second)
  })
})
