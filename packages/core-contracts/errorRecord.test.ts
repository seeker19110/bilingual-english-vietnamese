import { describe, it, expect } from 'vitest'
import { ErrorRecordSchema, ERROR_RECORD_SCHEMA_VERSION } from './errorRecord.js'

const validError = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  category: 'grammar',
  original: 'I have go to school yesterday',
  corrected: 'I went to school yesterday',
  explanation: 'Quá khứ đơn dùng "went", không phải "have go"',
  occurredAt: '2026-08-15T00:00:00Z',
  schemaVersion: ERROR_RECORD_SCHEMA_VERSION,
}

describe('ErrorRecordSchema', () => {
  it('payload hợp lệ (không skillId — optional) → parse thành công', () => {
    expect(ErrorRecordSchema.parse(validError)).toEqual(validError)
  })

  it('có skillId → parse thành công', () => {
    const withSkill = { ...validError, skillId: '123e4567-e89b-12d3-a456-426614174002' }
    expect(ErrorRecordSchema.parse(withSkill)).toEqual(withSkill)
  })

  it('category ngoài danh sách cho phép → từ chối', () => {
    expect(() => ErrorRecordSchema.parse({ ...validError, category: 'punctuation' })).toThrow()
  })

  it('original rỗng → từ chối', () => {
    expect(() => ErrorRecordSchema.parse({ ...validError, original: '' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => ErrorRecordSchema.parse({ ...validError, severity: 'high' })).toThrow()
  })
})
