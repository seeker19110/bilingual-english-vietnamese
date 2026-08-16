import { describe, it, expect } from 'vitest'
import { ContextPackageSchema, CONTEXT_PACKAGE_SCHEMA_VERSION } from './contextPackage.js'

const validItem = {
  sourceType: 'user_declared_fact',
  sourceId: '123e4567-e89b-12d3-a456-426614174002',
  content: 'Người dùng thích học vào buổi tối',
  provenance: 'personal_fact:preferences.preferred_study_time',
  sensitivity: 'personal',
  tokenEstimate: 12,
}

const validPackage = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  requestId: 'req-a1b2c3d4',
  items: [validItem],
  tokenBudget: 4000,
  tokenUsed: 12,
  createdAt: '2026-08-16T00:00:00Z',
  schemaVersion: CONTEXT_PACKAGE_SCHEMA_VERSION,
}

describe('ContextPackageSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(ContextPackageSchema.parse(validPackage)).toEqual(validPackage)
  })

  it('items rỗng (context trống hợp lệ) → parse thành công', () => {
    const empty = { ...validPackage, items: [], tokenUsed: 0 }
    expect(ContextPackageSchema.parse(empty)).toEqual(empty)
  })

  it('tokenUsed > tokenBudget → từ chối', () => {
    expect(() => ContextPackageSchema.parse({ ...validPackage, tokenUsed: 5000 })).toThrow()
  })

  it('sourceType ngoài 6 giá trị hợp lệ → từ chối', () => {
    const badItem = { ...validItem, sourceType: 'random_guess' }
    expect(() => ContextPackageSchema.parse({ ...validPackage, items: [badItem] })).toThrow()
  })

  it('item thiếu provenance → từ chối', () => {
    const noProvenance: Record<string, unknown> = { ...validItem }
    delete noProvenance.provenance
    expect(() => ContextPackageSchema.parse({ ...validPackage, items: [noProvenance] })).toThrow()
  })
})
