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
  proposeAction: vi.fn(),
  confirmAction: vi.fn(),
  rejectAction: vi.fn(),
  listProposedActions: vi.fn(),
}))

vi.mock('../packages/core-personal/proposedActionService.js', () =>
  Object.fromEntries(Object.entries(service).map(([k, fn]) => [k, (...a: unknown[]) => fn(...a)])),
)

import handler from './proposed-actions.js'

const PERSON = '11111111-1111-4111-8111-111111111111'
const ACTION_ID = '22222222-2222-4222-8222-222222222222'

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/proposed-actions${query}`, {
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
  service.listProposedActions.mockResolvedValue([])
  service.proposeAction.mockResolvedValue({
    action: { id: ACTION_ID, status: 'pending' },
    autoExecuted: false,
  })
  service.confirmAction.mockResolvedValue({ id: ACTION_ID, status: 'committed' })
  service.rejectAction.mockResolvedValue({ id: ACTION_ID, status: 'rejected' })
})

describe('auth, rate limit and validation for /api/proposed-actions', () => {
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

describe('GET /api/proposed-actions', () => {
  it('lists registered tools when kind=tools', async () => {
    const res = await handler(req('GET', '?kind=tools'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.tools)).toBe(true)
    expect(json.tools.length).toBeGreaterThan(0)
  })

  it('lists proposed actions with status filter and handles invalid status', async () => {
    service.listProposedActions.mockResolvedValueOnce([{ id: ACTION_ID }])
    const res = await handler(req('GET', '?status=pending'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.actions.length).toBe(1)
    expect(service.listProposedActions).toHaveBeenCalledWith(expect.anything(), PERSON, {
      status: 'pending',
    })

    const resInvalid = await handler(req('GET', '?status=invalid_status'))
    expect(resInvalid.status).toBe(400)
  })
})

describe('POST /api/proposed-actions', () => {
  it('submits a valid proposed action', async () => {
    const res = await handler(
      req('POST', '', {
        capabilityId: 'learning.update_goal',
        action: 'update_goal',
        targetDomain: 'learning',
        payload: { goal: 'IELTS 7.5' },
        riskLevel: 'low',
      }),
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.action.id).toBe(ACTION_ID)
    expect(service.proposeAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        personId: PERSON,
        capabilityId: 'learning.update_goal',
        action: 'update_goal',
        targetDomain: 'learning',
        riskLevel: 'low',
      }),
    )
  })

  it('rejects invalid capabilityId format with 400', async () => {
    const res = await handler(
      req('POST', '', {
        capabilityId: 'invalid-id-without-dot',
        action: 'act',
        targetDomain: 'learning',
        payload: {},
        riskLevel: 'low',
      }),
    )
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/proposed-actions', () => {
  it('confirms action on PATCH action=confirm', async () => {
    const res = await handler(
      req('PATCH', '', {
        id: ACTION_ID,
        action: 'confirm',
        expectedVersion: 1,
      }),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.action.status).toBe('committed')
    expect(service.confirmAction).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      ACTION_ID,
      1,
      'user:user-1',
    )
  })

  it('rejects action on PATCH action=reject', async () => {
    const res = await handler(
      req('PATCH', '', {
        id: ACTION_ID,
        action: 'reject',
        expectedVersion: 1,
        reason: 'Not needed',
      }),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.action.status).toBe('rejected')
    expect(service.rejectAction).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      ACTION_ID,
      1,
      'user:user-1',
      'Not needed',
    )
  })

  it('handles invalid PATCH payload and DELETE method', async () => {
    const resInvalid = await handler(req('PATCH', '', { id: ACTION_ID, action: 'unknown' }))
    expect(resInvalid.status).toBe(400)

    const resDelete = await handler(req('DELETE'))
    expect(resDelete.status).toBe(405)
  })
})
