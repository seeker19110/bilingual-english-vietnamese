import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = {
  user: { userId: 'user-1' },
}
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

const service = vi.hoisted(() => ({
  createDecision: vi.fn(),
  decideDecision: vi.fn(),
  recordOutcome: vi.fn(),
  reviewDecision: vi.fn(),
  supersedeDecision: vi.fn(),
  getDecision: vi.fn(),
  listDecisions: vi.fn(),
}))

vi.mock('../packages/core-personal/decisionLedgerService.js', () =>
  Object.fromEntries(Object.entries(service).map(([k, fn]) => [k, (...a: unknown[]) => fn(...a)])),
)

import handler from './decision-ledger.js'

const PERSON = '11111111-1111-4111-8111-111111111111'
const DECISION_ID = '22222222-2222-4222-8222-222222222222'

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/decision-ledger${query}`, {
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
  getOrCreatePerson.mockResolvedValue({ id: PERSON })
  service.listDecisions.mockResolvedValue([])
  service.getDecision.mockResolvedValue({ id: DECISION_ID, status: 'open' })
  service.createDecision.mockResolvedValue({ id: DECISION_ID, status: 'open' })
  service.decideDecision.mockResolvedValue({ id: DECISION_ID, status: 'decided' })
  service.recordOutcome.mockResolvedValue({ id: DECISION_ID, status: 'decided' })
  service.reviewDecision.mockResolvedValue({ id: DECISION_ID, status: 'reviewed' })
  service.supersedeDecision.mockResolvedValue({ id: DECISION_ID, status: 'superseded' })
})

describe('auth, rate limit and validation for /api/decision-ledger', () => {
  it('OPTIONS -> 204', async () => {
    const res = await handler(req('OPTIONS'))
    expect(res.status).toBe(204)
  })

  it('rate limit exceeded -> 429', async () => {
    rateLimitOk = false
    const res = await handler(req('GET'))
    expect(res.status).toBe(429)
  })

  it('unauthenticated -> 401', async () => {
    authState.user = null
    const res = await handler(req('GET'))
    expect(res.status).toBe(401)
  })
})

describe('GET /api/decision-ledger', () => {
  it('gets single decision by id', async () => {
    const res = await handler(req('GET', `?id=${DECISION_ID}`))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.decision.id).toBe(DECISION_ID)
    expect(service.getDecision).toHaveBeenCalledWith(expect.anything(), PERSON, DECISION_ID)
  })

  it('lists decisions with status & domain filters', async () => {
    const res = await handler(req('GET', '?status=open&domain=learning'))
    expect(res.status).toBe(200)
    expect(service.listDecisions).toHaveBeenCalledWith(expect.anything(), PERSON, {
      status: 'open',
      domain: 'learning',
      limit: undefined,
    })
  })
})

describe('POST /api/decision-ledger', () => {
  it('creates decision record', async () => {
    const res = await handler(
      req('POST', '', {
        problem: 'Nên chọn lộ trình nào?',
        options: [{ id: 'opt_1', summary: 'Lộ trình A' }],
      }),
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.decision.id).toBe(DECISION_ID)
    expect(service.createDecision).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        personId: PERSON,
        problem: 'Nên chọn lộ trình nào?',
      }),
    )
  })
})

describe('PATCH /api/decision-ledger', () => {
  it('decides a decision on PATCH action=decide', async () => {
    const res = await handler(
      req('PATCH', '', {
        id: DECISION_ID,
        action: 'decide',
        selectedOptionId: 'opt_1',
        expectedVersion: 1,
      }),
    )

    expect(res.status).toBe(200)
    expect(service.decideDecision).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      DECISION_ID,
      expect.objectContaining({
        selectedOptionId: 'opt_1',
        expectedVersion: 1,
      }),
    )
  })

  it('records outcome on PATCH action=record_outcome', async () => {
    const res = await handler(
      req('PATCH', '', {
        id: DECISION_ID,
        action: 'record_outcome',
        observation: {
          description: 'Đạt kết quả tốt',
          observedAt: '2026-08-17T00:00:00Z',
          matchedExpectation: true,
        },
        expectedVersion: 2,
      }),
    )

    expect(res.status).toBe(200)
    expect(service.recordOutcome).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      DECISION_ID,
      expect.objectContaining({
        expectedVersion: 2,
      }),
    )
  })

  it('reviews and supersedes decisions on PATCH', async () => {
    const resReview = await handler(
      req('PATCH', '', {
        id: DECISION_ID,
        action: 'review',
        resolutionSummary: 'Decision completed successfully',
        expectedVersion: 3,
      }),
    )
    expect(resReview.status).toBe(200)
    expect(service.reviewDecision).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      DECISION_ID,
      expect.objectContaining({
        resolutionSummary: 'Decision completed successfully',
        expectedVersion: 3,
      }),
    )

    const NEW_DECISION_ID = '33333333-3333-4333-8333-333333333333'
    const resSupersede = await handler(
      req('PATCH', '', {
        id: DECISION_ID,
        action: 'supersede',
        newDecisionId: NEW_DECISION_ID,
        expectedVersion: 4,
      }),
    )
    expect(resSupersede.status).toBe(200)
    expect(service.supersedeDecision).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      DECISION_ID,
      NEW_DECISION_ID,
      4,
      'user:user-1',
    )
  })

  it('handles invalid POST/PATCH payload and DELETE method', async () => {
    const resPostInvalid = await handler(req('POST', '', { options: [] }))
    expect(resPostInvalid.status).toBe(400)

    const resPatchInvalid = await handler(req('PATCH', '', { id: DECISION_ID, action: 'invalid' }))
    expect(resPatchInvalid.status).toBe(400)

    const resDelete = await handler(req('DELETE'))
    expect(resDelete.status).toBe(405)
  })
})
