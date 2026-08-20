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

import handler from './wearables-sync.js'

const PERSON = '11111111-1111-4111-8111-111111111111'

function req(method: string, body?: unknown) {
  return new Request('http://localhost/api/wearables-sync', {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

describe('api/wearables-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = { userId: 'user-1' }
    rateLimitOk = true
    getOrCreatePerson.mockResolvedValue({ id: PERSON })
  })

  it('handles GET current bio stream and circadian window', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.bio).toBeDefined()
    expect(data.window).toBeDefined()
  })

  it('handles POST sync bio data and re-evaluate circadian window', async () => {
    const res = await handler(
      req('POST', {
        source: 'oura_ring',
        hrvMs: 78,
        restingHeartRateBpm: 50,
        sleepQualityScore: 94,
        deepSleepMinutes: 120,
      }),
    )
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.bio.source).toBe('oura_ring')
    expect(data.window.currentCognitiveBand).toBe('peak_analytical')
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

  it('returns 400 when POST body is invalid JSON', async () => {
    const badReq = new Request('http://localhost/api/wearables-sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'invalid-json{',
    })
    const res = await handler(badReq)
    expect(res.status).toBe(400)
  })

  it('handles POST with default source when source is not provided', async () => {
    const res = await handler(
      req('POST', {
        hrvMs: 65,
      }),
    )
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.bio.source).toBe('apple_health')
  })

  it('returns 405 for unsupported method like PUT', async () => {
    const res = await handler(req('PUT'))
    expect(res.status).toBe(405)
  })

  it('handles unexpected internal error with 500', async () => {
    getOrCreatePerson.mockRejectedValueOnce(new Error('DB crash'))
    const res = await handler(req('GET'))
    expect(res.status).toBe(500)
  })
})
