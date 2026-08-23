// apps/dhcb/src/lib/startupApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listVentures,
  createVenture,
  updateVentureStage,
  listProblems,
  createProblem,
  listHypotheses,
  createHypothesis,
  updateHypothesisStatus,
  listEvidence,
  recordEvidence,
} from './startupApi'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn().mockResolvedValue({ Authorization: 'Bearer mock-token' }),
}))

describe('startupApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('listVentures and createVenture work properly', async () => {
    const mock = [{ id: 'v-1', name: 'AI Tutor' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mock,
    } as unknown as Response)

    const list = await listVentures()
    expect(list).toEqual(mock)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'v-2', name: 'SaaS App' }),
    } as unknown as Response)

    const created = await createVenture({ name: 'SaaS App' })
    expect(created.name).toBe('SaaS App')
  })

  it('updateVentureStage sends PATCH with venture_stage', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'v-1', stage: 'validation' }),
    } as unknown as Response)

    const updated = await updateVentureStage('v-1', 'validation')
    expect(updated.stage).toBe('validation')
  })

  it('problem and hypothesis operations work', async () => {
    const mockProblems = [{ id: 'p-1', statement: 'Slow workflow' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockProblems,
    } as unknown as Response)

    const problems = await listProblems('v-1')
    expect(problems).toEqual(mockProblems)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'p-2', statement: 'High cost' }),
    } as unknown as Response)

    const prob = await createProblem({
      ventureId: 'v-1',
      statement: 'High cost',
      customerSegment: 'SMBs',
      severity: 'critical',
    })
    expect(prob.statement).toBe('High cost')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'h-1', statement: 'Will pay $50/mo' }],
    } as unknown as Response)

    const hypotheses = await listHypotheses('v-1')
    expect(hypotheses[0]?.statement).toBe('Will pay $50/mo')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'h-2', statement: 'Pricing test' }),
    } as unknown as Response)

    const createdHyp = await createHypothesis({
      ventureId: 'v-1',
      statement: 'Pricing test',
      hypothesisType: 'business_model',
    })
    expect(createdHyp.statement).toBe('Pricing test')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'h-1', status: 'supported' }),
    } as unknown as Response)

    const hyp = await updateHypothesisStatus('h-1', 'supported')
    expect(hyp.status).toBe('supported')
  })

  it('evidence operations work', async () => {
    const mockEvidence = [{ id: 'e-1', title: '5 customer interviews' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvidence,
    } as unknown as Response)

    const evList = await listEvidence('v-1', 'h-1')
    expect(evList).toEqual(mockEvidence)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'e-2', title: 'Survey results' }),
    } as unknown as Response)

    const ev = await recordEvidence({
      ventureId: 'v-1',
      title: 'Survey results',
      evidenceType: 'survey',
      provenance: 'Google Forms',
      findings: '80% interested',
      supportsHypothesis: true,
    })
    expect(ev.title).toBe('Survey results')
  })
})
