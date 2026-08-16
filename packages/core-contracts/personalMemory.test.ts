import { describe, it, expect } from 'vitest'
import { MemoryRecordSchema, PERSONAL_MEMORY_SCHEMA_VERSION } from './personalMemory.js'

const validRecord = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  namespace: 'preference',
  content: 'Thích học vào buổi tối sau 20h',
  provenance: 'chat:msg-42',
  sensitivity: 'personal',
  status: 'accepted',
  createdAt: '2026-08-16T00:00:00Z',
  schemaVersion: PERSONAL_MEMORY_SCHEMA_VERSION,
}

describe('MemoryRecordSchema', () => {
  it('payload hợp lệ tối thiểu → parse thành công', () => {
    expect(MemoryRecordSchema.parse(validRecord)).toEqual(validRecord)
  })

  it('status=merged kèm mergedFromId → parse thành công', () => {
    const merged = {
      ...validRecord,
      status: 'merged',
      mergedFromId: '123e4567-e89b-12d3-a456-426614174002',
    }
    expect(MemoryRecordSchema.parse(merged)).toEqual(merged)
  })

  it('có retainUntil → parse thành công', () => {
    const withRetention = { ...validRecord, retainUntil: '2027-08-16T00:00:00Z' }
    expect(MemoryRecordSchema.parse(withRetention)).toEqual(withRetention)
  })

  it('namespace ngoài 5 giá trị hợp lệ → từ chối', () => {
    expect(() => MemoryRecordSchema.parse({ ...validRecord, namespace: 'working' })).toThrow()
  })

  it('status ngoài 3 giá trị hợp lệ → từ chối', () => {
    expect(() => MemoryRecordSchema.parse({ ...validRecord, status: 'rejected' })).toThrow()
  })

  it('content rỗng → từ chối', () => {
    expect(() => MemoryRecordSchema.parse({ ...validRecord, content: '' })).toThrow()
  })

  it('field lạ (vd learnerId của v1 Memory) → từ chối', () => {
    expect(() =>
      MemoryRecordSchema.parse({
        ...validRecord,
        learnerId: '123e4567-e89b-12d3-a456-426614174003',
      }),
    ).toThrow()
  })
})
