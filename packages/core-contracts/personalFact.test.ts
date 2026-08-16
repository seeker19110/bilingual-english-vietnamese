import { describe, it, expect } from 'vitest'
import { PersonalFactSchema, PERSONAL_FACT_SCHEMA_VERSION } from './personalFact.js'

const validFact = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  namespace: 'preferences',
  key: 'preferred_study_time',
  value: 'evening',
  origin: 'user_declared',
  confidence: 1,
  source: { type: 'onboarding_form' },
  sensitivity: 'personal',
  createdAt: '2026-08-16T00:00:00Z',
  updatedAt: '2026-08-16T00:00:00Z',
  schemaVersion: PERSONAL_FACT_SCHEMA_VERSION,
}

describe('PersonalFactSchema', () => {
  it('payload hợp lệ tối thiểu → parse thành công', () => {
    expect(PersonalFactSchema.parse(validFact)).toEqual(validFact)
  })

  it('có đủ field optional (source.id/occurredAt, lastConfirmedAt, expiresAt, supersedes) → parse thành công', () => {
    const full = {
      ...validFact,
      source: { type: 'chat', id: 'msg-1', occurredAt: '2026-08-15T00:00:00Z' },
      lastConfirmedAt: '2026-08-16T00:00:00Z',
      expiresAt: '2027-08-16T00:00:00Z',
      supersedes: '123e4567-e89b-12d3-a456-426614174002',
    }
    expect(PersonalFactSchema.parse(full)).toEqual(full)
  })

  it('origin ngoài 4 giá trị hợp lệ → từ chối', () => {
    expect(() => PersonalFactSchema.parse({ ...validFact, origin: 'guessed' })).toThrow()
  })

  it('sensitivity ngoài 4 giá trị hợp lệ → từ chối', () => {
    expect(() => PersonalFactSchema.parse({ ...validFact, sensitivity: 'top-secret' })).toThrow()
  })

  it('confidence ngoài [0,1] → từ chối', () => {
    expect(() => PersonalFactSchema.parse({ ...validFact, confidence: 1.5 })).toThrow()
  })

  it('field lạ ở top-level → từ chối', () => {
    expect(() => PersonalFactSchema.parse({ ...validFact, extra: true })).toThrow()
  })

  it('field lạ trong source → từ chối (source cũng .strict())', () => {
    expect(() =>
      PersonalFactSchema.parse({ ...validFact, source: { type: 'chat', bogus: 1 } }),
    ).toThrow()
  })
})
