// Đợt 2 coverage 2026-09-05: file này CHỈ nhắm vào các NHÁNH `?? '' / ?? null` và
// `if (... === undefined) return null` của chemistry.ts còn chưa được test nào đi qua
// (xem uncovered-all.md). Test hiện có ở edge.test.ts/grading.test.ts đã phủ đường "vui" —
// file này bổ sung đường "một phía thiếu nguyên tố" của sameComposition/checkBalance, ca
// ngậm nước hỏng giữa chừng, ngoặc đóng dư, và equation có ký tự xuống dòng lọt vào giữa tên
// chất khiến regex tách hệ số/công thức không khớp được (`match === null`).

import { describe, expect, it } from 'vitest'
import {
  checkBalance,
  parseEquation,
  parseFormula,
  sameComposition,
  type Composition,
} from './chemistry.js'

describe('parseFormula — phần ngậm nước có mảnh hỏng', () => {
  it('một phần sau dấu chấm giữa chỉ toàn chữ số (không còn ký hiệu nguyên tố) → null', () => {
    // 'H2O.5': mảnh 'H2O' đọc được, nhưng mảnh '5' bị hệ số nuốt hết, không còn thân công thức
    // → parseSingleFormula('5') trả null → vòng lặp ngậm nước phải trả null theo, không được
    // âm thầm bỏ qua mảnh hỏng.
    expect(parseFormula('H2O.5')).toBeNull()
  })
})

describe('parseFormula — ngoặc đóng dư không có ngoặc mở tương ứng', () => {
  it('ngoặc đóng dư ngay sau ký hiệu nguyên tố → null (không phải lỗi ngoặc mở)', () => {
    // Khác với '(H2O' (ngoặc MỞ dư, đã có test ở edge.test.ts) — ca này đóng ngoặc khi ngăn
    // xếp chỉ còn đúng 1 phần tử gốc, pop xong thì không còn "cha" để cộng dồn vào.
    expect(parseFormula('H2)')).toBeNull()
    expect(parseFormula('Na2CO3)')).toBeNull()
  })
})

describe('sameComposition — một phía thiếu hẳn nguyên tố mà phía kia có', () => {
  it('a có nguyên tố mà b không có → khác nhau (không được coi thiếu = 0 mặc định là bằng)', () => {
    const h2o: Composition = { atoms: { H: 2, O: 1 }, charge: 0 }
    const h2: Composition = { atoms: { H: 2 }, charge: 0 }
    expect(sameComposition(h2o, h2)).toBe(false)
  })

  it('b có nguyên tố mà a không có → khác nhau (chiều ngược lại)', () => {
    const h2: Composition = { atoms: { H: 2 }, charge: 0 }
    const h2o: Composition = { atoms: { H: 2, O: 1 }, charge: 0 }
    expect(sameComposition(h2, h2o)).toBe(false)
  })
})

describe('checkBalance — unbalanced_atoms khi một vế thiếu hẳn nguyên tố', () => {
  it('vế trái thiếu Oxi hoàn toàn so với vế phải → chỉ ra đúng nguyên tố lệch', () => {
    const eq = parseEquation('H2 -> H2O')
    expect(eq).not.toBeNull()
    const result = checkBalance(eq!, false)
    expect(result.status).toBe('unbalanced_atoms')
    expect(result.status === 'unbalanced_atoms' && result.elements).toEqual(['O'])
  })

  it('vế phải thiếu Oxi hoàn toàn so với vế trái → chỉ ra đúng nguyên tố lệch', () => {
    const eq = parseEquation('H2O -> H2')
    expect(eq).not.toBeNull()
    const result = checkBalance(eq!, false)
    expect(result.status).toBe('unbalanced_atoms')
    expect(result.status === 'unbalanced_atoms' && result.elements).toEqual(['O'])
  })
})

describe('parseEquation — ký tự xuống dòng lọt vào giữa một chất', () => {
  it('công thức chứa \\n ở giữa khiến regex tách hệ số/thân công thức không khớp được → null', () => {
    // '(.+)$' không khớp qua dấu xuống dòng, nên 'H2\nO' không khớp được với regex tách hệ số —
    // match === null, phải trả null cho cả vế thay vì âm thầm rớt phần đứng sau '\n'.
    expect(parseEquation('H2\nO + O2 -> H2O2')).toBeNull()
  })
})
