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

import handler from './socratic-diagnostics.js'

const PERSON = '11111111-1111-4111-8111-111111111111'

function req(method: string, body?: unknown) {
  return new Request('http://localhost/api/socratic-diagnostics', {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

describe('api/socratic-diagnostics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = { userId: 'user-1' }
    rateLimitOk = true
    getOrCreatePerson.mockResolvedValue({ id: PERSON })
  })

  it('handles GET list of misconceptions', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.misconceptions.length).toBeGreaterThan(0)
  })

  it('handles POST start session and submit reflection', async () => {
    const startRes = await handler(
      req('POST', {
        action: 'start',
        misconceptionId: 'present_perfect_past_confusion',
      }),
    )
    expect(startRes.status).toBe(201)
    const startData = await startRes.json()
    const sessionId = startData.session.id

    const reflectRes = await handler(
      req('POST', {
        action: 'reflect',
        sessionId,
        answer: 'Khoảng thời gian đã kết thúc trong quá khứ.',
      }),
    )
    expect(reflectRes.status).toBe(200)
    const reflectData = await reflectRes.json()
    expect(reflectData.feedback).toBeDefined()
  })

  it('returns 401 when unauthorized', async () => {
    authState.user = null
    const res = await handler(req('GET'))
    expect(res.status).toBe(401)
  })
})
