import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true

vi.mock('../packages/core-auth/security.js', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))
vi.mock('../packages/core-db/pgPool.js', () => ({ getPgPool: () => ({}) }))

const getOrCreatePerson = vi.fn()
vi.mock('../packages/core-personal/personService.js', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))

const svc = vi.hoisted(() => ({
  createVenture: vi.fn(),
  listVentures: vi.fn(),
  updateVentureStage: vi.fn(),
  createProblem: vi.fn(),
  listProblems: vi.fn(),
  createHypothesis: vi.fn(),
  updateHypothesisStatus: vi.fn(),
  listHypotheses: vi.fn(),
  recordEvidence: vi.fn(),
  listEvidence: vi.fn(),
}))

vi.mock('../packages/core-startup/startupService.js', () => ({ ...svc }))

import handler from './startup.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/startup${query}`, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  getOrCreatePerson.mockResolvedValue({ id: PERSON_ID })
})

describe('api/startup', () => {
  it('handles OPTIONS', async () => {
    const res = await handler(new Request('http://localhost/api/startup', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('429 on rate limit exceeded', async () => {
    rateLimitOk = false
    const res = await handler(req('GET'))
    expect(res.status).toBe(429)
  })

  it('401 khi chưa đăng nhập', async () => {
    authState.user = null
    expect((await handler(req('GET'))).status).toBe(401)
  })

  it('GET ?kind=ventures', async () => {
    svc.listVentures.mockResolvedValueOnce([{ id: ID_1, name: 'LearnAI' }])
    const res = await handler(req('GET', '?kind=ventures'))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.ventures.length).toBe(1)
  })

  it('GET problems, hypotheses, evidence, and invalid kind', async () => {
    svc.listProblems.mockResolvedValueOnce([{ id: ID_1 }])
    const resP = await handler(req('GET', `?kind=problems&ventureId=${ID_1}`))
    expect(resP.status).toBe(200)

    svc.listHypotheses.mockResolvedValueOnce([{ id: ID_1 }])
    const resH = await handler(req('GET', `?kind=hypotheses&ventureId=${ID_1}&status=unverified`))
    expect(resH.status).toBe(200)

    svc.listEvidence.mockResolvedValueOnce([{ id: ID_1 }])
    const resE = await handler(req('GET', `?kind=evidence&ventureId=${ID_1}`))
    expect(resE.status).toBe(200)

    const resInvalid = await handler(req('GET', '?kind=unknown'))
    expect(resInvalid.status).toBe(400)
  })

  it('POST venture, problem, hypothesis', async () => {
    svc.createVenture.mockResolvedValueOnce({ id: ID_1, name: 'LearnAI', stage: 'ideation' })
    const res = await handler(req('POST', '', { kind: 'venture', name: 'LearnAI' }))
    expect(res.status).toBe(201)

    svc.createProblem.mockResolvedValueOnce({ id: ID_1 })
    const resP = await handler(
      req('POST', '', {
        kind: 'problem',
        ventureId: ID_1,
        statement: 'Problem 1',
        customerSegment: 'Devs',
        severity: 'critical',
      }),
    )
    expect(resP.status).toBe(201)

    svc.createHypothesis.mockResolvedValueOnce({ id: ID_1 })
    const resH = await handler(
      req('POST', '', {
        kind: 'hypothesis',
        ventureId: ID_1,
        statement: 'Hypothesis 1',
        hypothesisType: 'solution',
      }),
    )
    expect(resH.status).toBe(201)
  })

  it('POST evidence requires provenance', async () => {
    svc.recordEvidence.mockResolvedValueOnce({ id: ID_1 })
    const res = await handler(
      req('POST', '', {
        kind: 'evidence',
        ventureId: ID_1,
        title: 'Interview Round 1',
        evidenceType: 'interview',
        provenance: '10 Zoom interviews recorded',
        findings: '8/10 users willing to pay',
        supportsHypothesis: true,
      }),
    )
    expect(res.status).toBe(201)

    const resInvalid = await handler(req('POST', '', { kind: 'unknown' }))
    expect(resInvalid.status).toBe(400)
  })

  it('PATCH venture_stage and hypothesis_status', async () => {
    svc.updateVentureStage.mockResolvedValueOnce({ id: ID_1, stage: 'validation' })
    const res = await handler(
      req('PATCH', '', { kind: 'venture_stage', id: ID_1, stage: 'validation' }),
    )
    expect(res.status).toBe(200)

    svc.updateHypothesisStatus.mockResolvedValueOnce({ id: ID_1, status: 'supported' })
    const resH = await handler(
      req('PATCH', '', { kind: 'hypothesis_status', id: ID_1, status: 'supported' }),
    )
    expect(resH.status).toBe(200)

    const resInvalid = await handler(req('PATCH', '', { kind: 'unknown' }))
    expect(resInvalid.status).toBe(400)
  })

  it('405 method not allowed', async () => {
    expect((await handler(req('DELETE'))).status).toBe(405)
  })
})
