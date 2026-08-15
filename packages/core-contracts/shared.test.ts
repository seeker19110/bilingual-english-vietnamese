import { describe, it, expect } from 'vitest'
import { DirectionSchema, CefrLevelSchema, IsoDateTimeSchema, UuidSchema } from './shared.js'

describe('DirectionSchema', () => {
  it("chấp nhận 'A' và 'B'", () => {
    expect(DirectionSchema.parse('A')).toBe('A')
    expect(DirectionSchema.parse('B')).toBe('B')
  })

  it('từ chối giá trị khác', () => {
    expect(() => DirectionSchema.parse('C')).toThrow()
  })
})

describe('CefrLevelSchema', () => {
  it('chấp nhận đủ 6 cấp A1–C2', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      expect(CefrLevelSchema.parse(level)).toBe(level)
    }
  })

  it('từ chối cấp không tồn tại', () => {
    expect(() => CefrLevelSchema.parse('D1')).toThrow()
  })
})

describe('IsoDateTimeSchema', () => {
  it('chấp nhận ISO datetime hợp lệ', () => {
    expect(IsoDateTimeSchema.parse('2026-08-15T03:00:00Z')).toBe('2026-08-15T03:00:00Z')
  })

  it('từ chối chuỗi ngày không đúng định dạng ISO', () => {
    expect(() => IsoDateTimeSchema.parse('15/08/2026')).toThrow()
  })
})

describe('UuidSchema', () => {
  it('chấp nhận UUID hợp lệ', () => {
    expect(UuidSchema.parse('123e4567-e89b-12d3-a456-426614174000')).toBe(
      '123e4567-e89b-12d3-a456-426614174000',
    )
  })

  it('từ chối chuỗi không phải UUID', () => {
    expect(() => UuidSchema.parse('not-a-uuid')).toThrow()
  })
})
