import { describe, it, expect } from 'vitest'
import { EvidenceSchema, EVIDENCE_SCHEMA_VERSION } from './evidence.js'

const validEvidence = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  skillId: '123e4567-e89b-12d3-a456-426614174002',
  source: 'srs_review',
  correct: true,
  observedAt: '2026-08-15T00:00:00Z',
  schemaVersion: EVIDENCE_SCHEMA_VERSION,
}

describe('EvidenceSchema', () => {
  it('payload hợp lệ (không rawScore/sessionId — cả 2 optional) → parse thành công', () => {
    expect(EvidenceSchema.parse(validEvidence)).toEqual(validEvidence)
  })

  it('có rawScore trong [0,1] → parse thành công', () => {
    const withScore = { ...validEvidence, rawScore: 0.85 }
    expect(EvidenceSchema.parse(withScore)).toEqual(withScore)
  })

  it('rawScore ngoài [0,1] → từ chối', () => {
    expect(() => EvidenceSchema.parse({ ...validEvidence, rawScore: 1.5 })).toThrow()
  })

  it('source ngoài danh sách cho phép → từ chối', () => {
    expect(() => EvidenceSchema.parse({ ...validEvidence, source: 'homework' })).toThrow()
  })

  it('correct không phải boolean → từ chối', () => {
    expect(() => EvidenceSchema.parse({ ...validEvidence, correct: 'yes' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => EvidenceSchema.parse({ ...validEvidence, note: 'ghi chú' })).toThrow()
  })
})
