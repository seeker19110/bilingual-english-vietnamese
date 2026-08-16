import { describe, it, expect } from 'vitest'
import { PersonSchema, PERSON_SCHEMA_VERSION } from './person.js'

const validPerson = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: '123e4567-e89b-12d3-a456-426614174001',
  displayName: 'Nguyễn Văn A',
  createdAt: '2026-08-16T00:00:00Z',
  updatedAt: '2026-08-16T00:00:00Z',
  schemaVersion: PERSON_SCHEMA_VERSION,
}

describe('PersonSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(PersonSchema.parse(validPerson)).toEqual(validPerson)
  })

  it('displayName rỗng → từ chối', () => {
    expect(() => PersonSchema.parse({ ...validPerson, displayName: '' })).toThrow()
  })

  it('id không phải UUID → từ chối', () => {
    expect(() => PersonSchema.parse({ ...validPerson, id: 'not-a-uuid' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => PersonSchema.parse({ ...validPerson, email: 'a@b.com' })).toThrow()
  })
})
