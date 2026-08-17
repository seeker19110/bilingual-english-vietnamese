import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '../packages/core-errors/appError.js'

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
  createAutomationGrant: vi.fn(),
  pauseAutomationGrant: vi.fn(),
  resumeAutomationGrant: vi.fn(),
  revokeAutomationGrant: vi.fn(),
  listAutomationGrants: vi.fn(),
  getAutomationGrant: vi.fn(),
  executeAutomatedAction: vi.fn(),
  listActionReceipts: vi.fn(),
  getActionReceipt: vi.fn(),
}))

vi.mock('../packages/core-personal/automationService.js', () =>
  Object.fromEntries(Object.entries(service).map(([k, fn]) => [k, (...a: unknown[]) => fn(...a)])),
)

import handler from './automation.js'

const PERSON = '11111111-1111-4111-8111-111111111111'
const GRANT_ID = '22222222-2222-4222-8222-222222222222'
const RECEIPT_ID = '33333333-3333-4333-8333-333333333333'
const FUTURE_ISO = new Date('2026-09-17T00:00:00Z').toISOString()

function req(method: string, query = '', body?: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost/api/automation${query}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  getOrCreatePerson.mockResolvedValue({ id: PERSON })
  service.listAutomationGrants.mockResolvedValue([])
  service.createAutomationGrant.mockResolvedValue({
    id: GRANT_ID,
    name: 'Daily Vocab',
    status: 'active',
  })
  service.pauseAutomationGrant.mockResolvedValue({ id: GRANT_ID, status: 'paused' })
  service.resumeAutomationGrant.mockResolvedValue({ id: GRANT_ID, status: 'active' })
  service.revokeAutomationGrant.mockResolvedValue({ id: GRANT_ID, status: 'revoked' })
  service.executeAutomatedAction.mockResolvedValue({
    receipt: { id: RECEIPT_ID, status: 'success' },
    deduplicated: false,
  })
  service.listActionReceipts.mockResolvedValue([])
  service.getAutomationGrant.mockResolvedValue({ id: GRANT_ID })
  service.getActionReceipt.mockResolvedValue({ id: RECEIPT_ID })
})

describe('auth, rate limit and validation for /api/automation', () => {
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

describe('GET /api/automation', () => {
  it('lists grants without query or with status filter', async () => {
    service.listAutomationGrants.mockResolvedValueOnce([{ id: GRANT_ID }])
    const res = await handler(req('GET', '?status=active'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.grants.length).toBe(1)
    expect(service.listAutomationGrants).toHaveBeenCalledWith(expect.anything(), PERSON, {
      status: 'active',
    })

    const resAll = await handler(req('GET'))
    expect(resAll.status).toBe(200)
  })

  it('rejects invalid status filter with 400', async () => {
    const res = await handler(req('GET', '?status=invalid_status'))
    expect(res.status).toBe(400)
  })

  it('lists action receipts when kind=receipts', async () => {
    service.listActionReceipts.mockResolvedValueOnce([{ id: RECEIPT_ID }])
    const res = await handler(req('GET', `?kind=receipts&grantId=${GRANT_ID}`))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.receipts.length).toBe(1)
    expect(service.listActionReceipts).toHaveBeenCalledWith(expect.anything(), PERSON, {
      grantId: GRANT_ID,
    })

    const resAllReceipts = await handler(req('GET', '?kind=receipts'))
    expect(resAllReceipts.status).toBe(200)
  })

  it('gets grant by grantId', async () => {
    const res = await handler(req('GET', `?grantId=${GRANT_ID}`))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.grant.id).toBe(GRANT_ID)
  })

  it('gets receipt by receiptId', async () => {
    const res = await handler(req('GET', `?receiptId=${RECEIPT_ID}`))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.receipt.id).toBe(RECEIPT_ID)
  })
})

describe('POST /api/automation', () => {
  it('creates an automation grant with all options', async () => {
    const res = await handler(
      req('POST', '', {
        kind: 'create_grant',
        name: 'Daily Vocab Reminder',
        description: 'Every morning vocab push',
        capabilityId: 'learning.update_goal',
        action: 'update_goal',
        targetDomain: 'learning',
        trigger: { type: 'schedule', cronOrInterval: '0 8 * * *' },
        budget: { maxRunsPerHour: 5 },
        compensation: { toolId: 'learning.update_goal' },
        reviewAt: FUTURE_ISO,
        expiresAt: FUTURE_ISO,
      }),
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.grant.id).toBe(GRANT_ID)
  })

  it('triggers automated action with maxRetries', async () => {
    const res = await handler(
      req('POST', '', {
        kind: 'trigger',
        grantId: GRANT_ID,
        idempotencyKey: 'idem-123',
        triggerSource: 'schedule:cron',
        inputPayload: { goal: 'IELTS 8.0' },
        maxRetries: 3,
      }),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.receipt.id).toBe(RECEIPT_ID)
  })

  it('rejects invalid JSON body with 400', async () => {
    const res = await handler(req('POST', '', '{invalid json'))
    expect(res.status).toBe(400)
  })

  it('rejects invalid schema with 400', async () => {
    const res = await handler(req('POST', '', { kind: 'invalid_kind' }))
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/automation', () => {
  it('pauses grant', async () => {
    const res = await handler(
      req('PATCH', '', {
        id: GRANT_ID,
        action: 'pause',
        expectedVersion: 1,
      }),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.grant.status).toBe('paused')
  })

  it('resumes grant', async () => {
    const res = await handler(
      req('PATCH', '', {
        id: GRANT_ID,
        action: 'resume',
        expectedVersion: 2,
      }),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.grant.status).toBe('active')
  })

  it('revokes grant', async () => {
    const res = await handler(
      req('PATCH', '', {
        id: GRANT_ID,
        action: 'revoke',
        expectedVersion: 3,
      }),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.grant.status).toBe('revoked')
  })

  it('rejects invalid PATCH body or schema', async () => {
    const res1 = await handler(req('PATCH', '', '{invalid json'))
    expect(res1.status).toBe(400)

    const res2 = await handler(req('PATCH', '', { id: GRANT_ID, action: 'unknown' }))
    expect(res2.status).toBe(400)
  })

  it('handles AppError from service gracefully', async () => {
    service.getAutomationGrant.mockRejectedValueOnce(new NotFoundError('Not found grant'))
    const res = await handler(req('GET', `?grantId=${GRANT_ID}`))
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.message).toBe('Not found grant')
  })

  it('returns 405 for unsupported HTTP methods', async () => {
    const res = await handler(req('DELETE'))
    expect(res.status).toBe(405)
  })
})
