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

import handler from './echo-shadowing.js'

const PERSON = '11111111-1111-4111-8111-111111111111'

function req(method: string, body?: unknown, searchParams?: string) {
  const url = searchParams
    ? `http://localhost/api/echo-shadowing?${searchParams}`
    : 'http://localhost/api/echo-shadowing'
  return new Request(url, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

describe('api/echo-shadowing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = { userId: 'user-1' }
    rateLimitOk = true
    getOrCreatePerson.mockResolvedValue({ id: PERSON })
  })

  it('handles GET list of passages and single passage', async () => {
    const listRes = await handler(req('GET'))
    expect(listRes.status).toBe(200)
    const listData = await listRes.json()
    expect(listData.passages.length).toBeGreaterThan(0)

    const singleRes = await handler(req('GET', undefined, 'passageId=jobs_stanford_commencement'))
    expect(singleRes.status).toBe(200)
    const singleData = await singleRes.json()
    expect(singleData.passage.title).toContain('Steve Jobs')
  })

  it('handles POST evaluate shadowing session', async () => {
    const res = await handler(
      req('POST', {
        passageId: 'jobs_stanford_commencement',
        measuredLatencyMs: 400,
        phonemeAccuracy: 93,
      }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.session).toBeDefined()
    expect(data.session.rhythmSyncScore).toBeGreaterThanOrEqual(80)
  })

  it('returns 401 when unauthorized', async () => {
    authState.user = null
    const res = await handler(req('GET'))
    expect(res.status).toBe(401)
  })

  it('handles OPTIONS request with 204', async () => {
    const res = await handler(req('OPTIONS'))
    expect(res.status).toBe(204)
  })

  it('returns 429 when rate limit exceeded', async () => {
    rateLimitOk = false
    const res = await handler(req('GET'))
    expect(res.status).toBe(429)
  })

  it('returns 404 when passageId not found in GET', async () => {
    const res = await handler(req('GET', undefined, 'passageId=nonexistent'))
    expect(res.status).toBe(404)
  })

  it('returns 400 on invalid POST body or missing passageId', async () => {
    const badJsonReq = new Request('http://localhost/api/echo-shadowing', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'bad-json{',
    })
    const res1 = await handler(badJsonReq)
    expect(res1.status).toBe(400)

    const res2 = await handler(req('POST', {}))
    expect(res2.status).toBe(400)
  })

  it('returns 405 for unsupported method like PUT', async () => {
    const res = await handler(req('PUT'))
    expect(res.status).toBe(405)
  })

  it('handles unexpected internal error with 500', async () => {
    getOrCreatePerson.mockRejectedValueOnce(new Error('DB failure'))
    const res = await handler(req('GET'))
    expect(res.status).toBe(500)
  })
})
