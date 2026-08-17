import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  createVenture,
  listVentures,
  updateVentureStage,
  createProblem,
  listProblems,
  createHypothesis,
  updateHypothesisStatus,
  listHypotheses,
  recordEvidence,
  listEvidence,
} from './startupService.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const VENTURE_ID = '22222222-2222-4222-8222-222222222222'
const PROBLEM_ID = '33333333-3333-4333-8333-333333333333'
const HYPOTHESIS_ID = '44444444-4444-4444-8444-444444444444'
const EVIDENCE_ID = '55555555-5555-4555-8555-555555555555'

const mockQuery = vi.fn()
const pool = { query: mockQuery } as unknown as Pool

vi.mock('../core-db/transaction.js', () => ({
  withTransaction: async (_pool: unknown, cb: (client: { query: typeof mockQuery }) => unknown) =>
    cb({ query: mockQuery }),
}))

beforeEach(() => vi.clearAllMocks())

describe('StartupService', () => {
  it('creates and lists ventures', async () => {
    const ventureRow = {
      id: VENTURE_ID,
      person_id: PERSON_ID,
      name: 'LearnAI',
      description: null,
      stage: 'ideation',
      version: 1,
      created_at: new Date('2026-08-17T00:00:00Z'),
      updated_at: new Date('2026-08-17T00:00:00Z'),
    }
    mockQuery.mockResolvedValueOnce({ rows: [ventureRow] })
    const v = await createVenture(pool, PERSON_ID, { name: 'LearnAI' })
    expect(v.name).toBe('LearnAI')
    expect(v.stage).toBe('ideation')

    mockQuery.mockResolvedValueOnce({ rows: [ventureRow] })
    const list = await listVentures(pool, PERSON_ID)
    expect(list.length).toBe(1)
  })

  it('updates venture stage', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: VENTURE_ID }] })
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: VENTURE_ID,
          person_id: PERSON_ID,
          name: 'LearnAI',
          description: null,
          stage: 'validation',
          version: 2,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    const v = await updateVentureStage(pool, PERSON_ID, VENTURE_ID, 'validation')
    expect(v.stage).toBe('validation')
  })

  it('creates and lists problems', async () => {
    const problemRow = {
      id: PROBLEM_ID,
      venture_id: VENTURE_ID,
      person_id: PERSON_ID,
      statement: 'No personalized feedback',
      customer_segment: 'Students',
      severity: 'critical',
      evidence_count: 0,
      version: 1,
      created_at: new Date('2026-08-17T00:00:00Z'),
      updated_at: new Date('2026-08-17T00:00:00Z'),
    }
    mockQuery.mockResolvedValueOnce({ rows: [problemRow] })
    const p = await createProblem(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      statement: 'No personalized feedback',
      customerSegment: 'Students',
      severity: 'critical',
    })
    expect(p.severity).toBe('critical')

    mockQuery.mockResolvedValueOnce({ rows: [problemRow] })
    const list = await listProblems(pool, PERSON_ID, VENTURE_ID)
    expect(list.length).toBe(1)
  })

  it('creates and updates hypothesis', async () => {
    const hypRow = {
      id: HYPOTHESIS_ID,
      venture_id: VENTURE_ID,
      person_id: PERSON_ID,
      statement: 'Users pay $10/month',
      hypothesis_type: 'business_model',
      status: 'unverified',
      version: 1,
      created_at: new Date('2026-08-17T00:00:00Z'),
      updated_at: new Date('2026-08-17T00:00:00Z'),
    }
    mockQuery.mockResolvedValueOnce({ rows: [hypRow] })
    const h = await createHypothesis(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      statement: 'Users pay $10/month',
      hypothesisType: 'business_model',
    })
    expect(h.status).toBe('unverified')

    mockQuery.mockResolvedValueOnce({ rows: [{ id: HYPOTHESIS_ID }] })
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...hypRow, status: 'supported', version: 2 }],
    })
    const updated = await updateHypothesisStatus(pool, PERSON_ID, HYPOTHESIS_ID, 'supported')
    expect(updated.status).toBe('supported')

    mockQuery.mockResolvedValueOnce({ rows: [hypRow] })
    const list = await listHypotheses(pool, PERSON_ID, VENTURE_ID)
    expect(list.length).toBe(1)
  })

  it('records evidence with provenance (Gate invariant)', async () => {
    const evidenceRow = {
      id: EVIDENCE_ID,
      venture_id: VENTURE_ID,
      hypothesis_id: HYPOTHESIS_ID,
      person_id: PERSON_ID,
      title: 'User Interview Round 1',
      evidence_type: 'interview',
      provenance: '10 Zoom interviews recorded',
      findings: '8/10 users would pay',
      supports_hypothesis: true,
      collected_at: new Date('2026-08-17T00:00:00Z'),
      created_at: new Date('2026-08-17T00:00:00Z'),
    }
    mockQuery.mockResolvedValueOnce({ rows: [evidenceRow] })
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const ev = await recordEvidence(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      hypothesisId: HYPOTHESIS_ID,
      title: 'User Interview Round 1',
      evidenceType: 'interview',
      provenance: '10 Zoom interviews recorded',
      findings: '8/10 users would pay',
      supportsHypothesis: true,
    })
    expect(ev.provenance).toBe('10 Zoom interviews recorded')
    expect(ev.supportsHypothesis).toBe(true)

    mockQuery.mockResolvedValueOnce({ rows: [evidenceRow] })
    const list = await listEvidence(pool, PERSON_ID, VENTURE_ID)
    expect(list.length).toBe(1)
  })

  it('handles not found errors and filter options', async () => {
    // Venture not found on update
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(updateVentureStage(pool, PERSON_ID, VENTURE_ID, 'scale')).rejects.toThrow(
      'Không tìm thấy Venture',
    )

    // Hypothesis not found on update
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(updateHypothesisStatus(pool, PERSON_ID, HYPOTHESIS_ID, 'refuted')).rejects.toThrow(
      'Không tìm thấy Hypothesis',
    )

    // List hypotheses
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const filteredHyp = await listHypotheses(pool, PERSON_ID, VENTURE_ID)
    expect(filteredHyp.length).toBe(0)

    // List evidence
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const filteredEv = await listEvidence(pool, PERSON_ID, VENTURE_ID)
    expect(filteredEv.length).toBe(0)

    // Venture with description
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: VENTURE_ID,
          person_id: PERSON_ID,
          name: 'Venture With Desc',
          description: 'A great idea',
          stage: 'ideation',
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    const vWithDesc = await createVenture(pool, PERSON_ID, {
      name: 'Venture With Desc',
      description: 'A great idea',
    })
    expect(vWithDesc.description).toBe('A great idea')

    // Standalone evidence without hypothesisId
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EVIDENCE_ID,
          venture_id: VENTURE_ID,
          hypothesis_id: null,
          person_id: PERSON_ID,
          title: 'General Market Report',
          evidence_type: 'analytics',
          provenance: 'Statista report 2026',
          findings: 'Market growing at 15% CAGR',
          supports_hypothesis: true,
          collected_at: new Date('2026-08-15T00:00:00Z'),
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    const standaloneEv = await recordEvidence(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      title: 'General Market Report',
      evidenceType: 'analytics',
      provenance: 'Statista report 2026',
      findings: 'Market growing at 15% CAGR',
      supportsHypothesis: true,
      collectedAt: '2026-08-15T00:00:00Z',
    })
    expect(standaloneEv.hypothesisId).toBeUndefined()
    expect(standaloneEv.collectedAt).toBe('2026-08-15T00:00:00.000Z')
  })
})
