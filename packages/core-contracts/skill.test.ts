import { describe, it, expect } from 'vitest'
import { SkillSchema, SKILL_SCHEMA_VERSION } from './skill.js'

const validSkill = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  code: 'grammar.present_perfect',
  label: 'Present Perfect',
  category: 'grammar',
  cefrLevel: 'B1',
  schemaVersion: SKILL_SCHEMA_VERSION,
}

describe('SkillSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(SkillSchema.parse(validSkill)).toEqual(validSkill)
  })

  it('code sai định dạng (thiếu dấu chấm phân cách) → từ chối', () => {
    expect(() => SkillSchema.parse({ ...validSkill, code: 'presentperfect' })).toThrow()
  })

  it('code chứa hoa/khoảng trắng → từ chối', () => {
    expect(() => SkillSchema.parse({ ...validSkill, code: 'Grammar.Present Perfect' })).toThrow()
  })

  it('category ngoài 6 giá trị cho phép → từ chối', () => {
    expect(() => SkillSchema.parse({ ...validSkill, category: 'reading' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => SkillSchema.parse({ ...validSkill, difficulty: 3 })).toThrow()
  })
})
