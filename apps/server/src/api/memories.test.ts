import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = {
  user: { userId: 'user-1' },
}
let rateLimitOk = true
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))

const getOrCreatePerson = vi.fn()
vi.mock('@dhcb/core-personal/personService', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))

const service = vi.hoisted(() => ({
  evaluateMemoryCandidate: vi.fn(),
  ingestMemory: vi.fn(),
  listMemoryRecords: vi.fn(),
  expireMemoryRecord: vi.fn(),
  deleteMemoryRecord: vi.fn(),
}))

vi.mock('@dhcb/core-personal/memoryService', () =>
  Object.fromEntries(Object.entries(service).map(([k, fn]) => [k, (...a: unknown[]) => fn(...a)])),
)

import handler from './memories.js'

const PERSON = '11111111-1111-4111-8111-111111111111'
const RECORD_ID = '22222222-2222-4222-8222-222222222222'

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/memories${query}`, {
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
  service.listMemoryRecords.mockResolvedValue([])
  service.evaluateMemoryCandidate.mockResolvedValue({ outcome: 'ACCEPT', reason: 'ok' })
  service.ingestMemory.mockResolvedValue({
    record: { id: RECORD_ID, content: 'test', status: 'accepted' },
    evaluation: { outcome: 'ACCEPT', reason: 'ok' },
  })
  service.expireMemoryRecord.mockResolvedValue({ id: RECORD_ID, status: 'expired' })
  service.deleteMemoryRecord.mockResolvedValue(undefined)
})

describe('auth, rate limit and validation for /api/memories', () => {
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

describe('GET /api/memories', () => {
  it('lists memory records for person with optional namespace', async () => {
    service.listMemoryRecords.mockResolvedValueOnce([{ id: RECORD_ID, content: 'Test memory' }])
    const res = await handler(req('GET', '?namespace=semantic&includeExpired=true'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.records.length).toBe(1)
    expect(service.listMemoryRecords).toHaveBeenCalledWith(expect.anything(), PERSON, {
      namespace: 'semantic',
      includeExpired: true,
    })
  })

  it('returns 400 on invalid namespace query parameter', async () => {
    const res = await handler(req('GET', '?namespace=invalid_ns'))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/memories', () => {
  it('evaluates candidate when action = evaluate', async () => {
    const res = await handler(
      req('POST', '', {
        action: 'evaluate',
        candidate: {
          namespace: 'preference',
          content: 'Prefers audio exercises',
          provenance: 'user_declared:settings',
          sensitivity: 'personal',
        },
      }),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.evaluation.outcome).toBe('ACCEPT')
    expect(service.evaluateMemoryCandidate).toHaveBeenCalled()
  })

  it('ingests candidate when action = ingest', async () => {
    const res = await handler(
      req('POST', '', {
        action: 'ingest',
        candidate: {
          namespace: 'semantic',
          content: 'Targeting IELTS 7.5',
          provenance: 'user_declared:goal',
          sensitivity: 'personal',
        },
      }),
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.record.id).toBe(RECORD_ID)
    expect(service.ingestMemory).toHaveBeenCalled()
  })

  it('rejects invalid body format with 400', async () => {
    const res = await handler(req('POST', '', { action: 'unknown_action' }))
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/memories and DELETE /api/memories', () => {
  it('expires record on PATCH with expectedVersion', async () => {
    const res = await handler(
      req('PATCH', '', {
        id: RECORD_ID,
        action: 'expire',
        expectedVersion: 1,
      }),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.record.status).toBe('expired')
    expect(service.expireMemoryRecord).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      RECORD_ID,
      1,
      'user:user-1',
    )
  })

  it('deletes record on DELETE', async () => {
    const res = await handler(req('DELETE', '', { id: RECORD_ID }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(service.deleteMemoryRecord).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      RECORD_ID,
      'user:user-1',
    )
  })
})
