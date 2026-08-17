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

  it('POST venture', async () => {
    svc.createVenture.mockResolvedValueOnce({ id: ID_1, name: 'LearnAI', stage: 'ideation' })
    const res = await handler(req('POST', '', { kind: 'venture', name: 'LearnAI' }))
    expect(res.status).toBe(201)
    expect(svc.createVenture).toHaveBeenCalledWith({}, PERSON_ID, {
      kind: 'venture',
      name: 'LearnAI',
    })
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
  })

  it('PATCH venture_stage', async () => {
    svc.updateVentureStage.mockResolvedValueOnce({ id: ID_1, stage: 'validation' })
    const res = await handler(
      req('PATCH', '', { kind: 'venture_stage', id: ID_1, stage: 'validation' }),
    )
    expect(res.status).toBe(200)
  })

  it('405 method not allowed', async () => {
    expect((await handler(req('DELETE'))).status).toBe(405)
  })
})
