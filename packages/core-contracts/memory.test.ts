import { describe, it, expect } from 'vitest'
import { MemorySchema, MEMORY_SCHEMA_VERSION } from './memory.js'

const validMemory = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  kind: 'preference',
  content: 'Học viên thích ví dụ liên quan tới bóng đá',
  createdAt: '2026-08-15T00:00:00Z',
  schemaVersion: MEMORY_SCHEMA_VERSION,
}

describe('MemorySchema', () => {
  it('bộ nhớ dài hạn (không expiresAt) → parse thành công', () => {
    expect(MemorySchema.parse(validMemory)).toEqual(validMemory)
  })

  it("bộ nhớ 'working' có expiresAt → parse thành công", () => {
    const working = { ...validMemory, kind: 'working', expiresAt: '2026-08-15T01:00:00Z' }
    expect(MemorySchema.parse(working)).toEqual(working)
  })

  it('kind ngoài 6 giá trị của MASTER_SPEC.md → từ chối', () => {
    expect(() => MemorySchema.parse({ ...validMemory, kind: 'longterm' })).toThrow()
  })

  it('content rỗng → từ chối', () => {
    expect(() => MemorySchema.parse({ ...validMemory, content: '' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => MemorySchema.parse({ ...validMemory, importance: 5 })).toThrow()
  })
})
