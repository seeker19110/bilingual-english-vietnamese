import { describe, it, expect } from 'vitest'
import { MasterySchema, MASTERY_SCHEMA_VERSION } from './mastery.js'

const validMastery = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  skillId: '123e4567-e89b-12d3-a456-426614174002',
  level: 0.7,
  confidence: 0.9,
  lastReviewedAt: '2026-08-14T00:00:00Z',
  updatedAt: '2026-08-14T00:00:00Z',
  schemaVersion: MASTERY_SCHEMA_VERSION,
}

describe('MasterySchema', () => {
  it('payload hợp lệ (không dueAt — optional) → parse thành công', () => {
    expect(MasterySchema.parse(validMastery)).toEqual(validMastery)
  })

  it('level = 0 hoặc 1 (biên hợp lệ) → parse thành công', () => {
    expect(MasterySchema.parse({ ...validMastery, level: 0 }).level).toBe(0)
    expect(MasterySchema.parse({ ...validMastery, level: 1 }).level).toBe(1)
  })

  it('level ngoài [0,1] → từ chối', () => {
    expect(() => MasterySchema.parse({ ...validMastery, level: 1.1 })).toThrow()
    expect(() => MasterySchema.parse({ ...validMastery, level: -0.1 })).toThrow()
  })

  it('confidence ngoài [0,1] → từ chối', () => {
    expect(() => MasterySchema.parse({ ...validMastery, confidence: 2 })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => MasterySchema.parse({ ...validMastery, streak: 5 })).toThrow()
  })
})
