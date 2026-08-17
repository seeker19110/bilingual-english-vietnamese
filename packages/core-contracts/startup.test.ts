import { describe, expect, it } from 'vitest'
import {
  VentureSchema,
  ProblemSchema,
  HypothesisSchema,
  ValidatedEvidenceSchema,
  STARTUP_SCHEMA_VERSION,
} from './startup.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'
const ID_2 = '33333333-3333-4333-8333-333333333333'

describe('Startup Domain Contracts', () => {
  it('validates Venture', () => {
    const venture = {
      id: ID_1,
      personId: PERSON_ID,
      name: 'LearnAI Tutor',
      description: 'AI-powered Vietnamese-English tutor',
      stage: 'validation',
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: STARTUP_SCHEMA_VERSION,
    }
    const parsed = VentureSchema.parse(venture)
    expect(parsed.stage).toBe('validation')
  })

  it('validates Problem', () => {
    const problem = {
      id: ID_1,
      ventureId: ID_2,
      personId: PERSON_ID,
      statement: 'Students lack personalized feedback on speaking',
      customerSegment: 'Vietnamese university students aged 18-24',
      severity: 'critical',
      evidenceCount: 12,
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: STARTUP_SCHEMA_VERSION,
    }
    const parsed = ProblemSchema.parse(problem)
    expect(parsed.severity).toBe('critical')
    expect(parsed.evidenceCount).toBe(12)
  })

  it('validates Hypothesis', () => {
    const hypothesis = {
      id: ID_1,
      ventureId: ID_2,
      personId: PERSON_ID,
      statement: 'Students will pay $10/month for AI speaking coach',
      hypothesisType: 'business_model',
      status: 'unverified',
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: STARTUP_SCHEMA_VERSION,
    }
    const parsed = HypothesisSchema.parse(hypothesis)
    expect(parsed.status).toBe('unverified')
  })

  it('validates ValidatedEvidence with required provenance (Gate: no AI claims without evidence)', () => {
    const evidence = {
      id: ID_1,
      ventureId: ID_2,
      hypothesisId: ID_1,
      personId: PERSON_ID,
      title: 'User Interview Round 1',
      evidenceType: 'interview',
      provenance: '10 user interviews conducted via Zoom, recorded and transcribed',
      findings: '8/10 users said they would pay $10/month; 2 said max $7/month',
      supportsHypothesis: true,
      collectedAt: '2026-08-17T00:00:00Z',
      createdAt: '2026-08-17T00:00:00Z',
      schemaVersion: STARTUP_SCHEMA_VERSION,
    }
    const parsed = ValidatedEvidenceSchema.parse(evidence)
    expect(parsed.provenance).toContain('interviews')
    expect(parsed.supportsHypothesis).toBe(true)
  })

  it('rejects Evidence without provenance', () => {
    const evidence = {
      id: ID_1,
      ventureId: ID_2,
      personId: PERSON_ID,
      title: 'Guess',
      evidenceType: 'interview',
      provenance: '',
      findings: 'Users like it',
      supportsHypothesis: true,
      collectedAt: '2026-08-17T00:00:00Z',
      createdAt: '2026-08-17T00:00:00Z',
      schemaVersion: STARTUP_SCHEMA_VERSION,
    }
    expect(() => ValidatedEvidenceSchema.parse(evidence)).toThrow()
  })
})
