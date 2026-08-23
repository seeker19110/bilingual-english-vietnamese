import { describe, it, expect } from 'vitest'
import { POS_LIST, POS_LABEL, POS_COLOR, LEVEL_COLOR } from './pos'

describe('pos — dữ liệu loại từ (POS_LIST)', () => {
  it('có ít nhất các loại từ cơ bản n/v/adj/adv', () => {
    const codes = POS_LIST.map((p) => p.code)
    expect(codes).toEqual(expect.arrayContaining(['n', 'v', 'adj', 'adv']))
  })

  it('mã loại từ (code) không trùng nhau', () => {
    const codes = POS_LIST.map((p) => p.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('mỗi mục có đủ nhãn vi/en, màu, định nghĩa và ít nhất 1 ví dụ', () => {
    for (const p of POS_LIST) {
      expect(p.label.length).toBeGreaterThan(0)
      expect(p.labelEn.length).toBeGreaterThan(0)
      expect(p.color.length).toBeGreaterThan(0)
      expect(p.definition.length).toBeGreaterThan(0)
      expect(p.examples.length).toBeGreaterThan(0)
      for (const ex of p.examples) {
        expect(ex.en.length).toBeGreaterThan(0)
        expect(ex.vi.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('pos — POS_LABEL/POS_COLOR sinh từ POS_LIST', () => {
  it('POS_LABEL ánh xạ đúng nhãn cho từng mã', () => {
    expect(POS_LABEL.n).toBe('Danh từ')
    expect(POS_LABEL.v).toBe('Động từ')
  })

  it('POS_COLOR ánh xạ đúng màu cho từng mã', () => {
    expect(POS_COLOR.n).toBe(POS_LIST.find((p) => p.code === 'n')?.color)
  })

  it('mã không tồn tại → undefined (không sập app)', () => {
    expect(POS_LABEL['khong-ton-tai']).toBeUndefined()
    expect(POS_COLOR['khong-ton-tai']).toBeUndefined()
  })
})

describe('pos — LEVEL_COLOR theo cấp CEFR', () => {
  it('có đủ 6 cấp A1-C2', () => {
    expect(Object.keys(LEVEL_COLOR).sort()).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].sort())
  })

  it('mỗi cấp có class màu không rỗng', () => {
    for (const cls of Object.values(LEVEL_COLOR)) {
      expect(cls.length).toBeGreaterThan(0)
    }
  })
})
