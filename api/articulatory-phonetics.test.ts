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

import handler from './articulatory-phonetics.js'

const PERSON = '11111111-1111-4111-8111-111111111111'

function req(method: string, body?: unknown, searchParams?: string) {
  const url = searchParams
    ? `http://localhost/api/articulatory-phonetics?${searchParams}`
    : 'http://localhost/api/articulatory-phonetics'
  return new Request(url, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

describe('api/articulatory-phonetics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = { userId: 'user-1' }
    rateLimitOk = true
    getOrCreatePerson.mockResolvedValue({ id: PERSON })
  })

  it('handles GET guides list and specific phoneme guide', async () => {
    const listRes = await handler(req('GET'))
    expect(listRes.status).toBe(200)
    const listData = await listRes.json()
    expect(listData.guides.length).toBeGreaterThan(0)

    const singleRes = await handler(req('GET', undefined, 'phoneme=TH_VOICELESS'))
    expect(singleRes.status).toBe(200)
    const singleData = await singleRes.json()
    expect(singleData.guide.ipaSymbol).toBe('/θ/')
  })

  it('handles POST phonetics and pitch analysis report', async () => {
    const res = await handler(
      req('POST', {
        targetWord: 'think',
        targetPhoneme: 'TH_VOICELESS',
        scoreEstimate: 91,
      }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.report).toBeDefined()
    expect(data.report.overallPhoneticScore).toBe(91)
    expect(data.report.pitchContour).toBeDefined()
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

  it('returns 400 on invalid POST body', async () => {
    const badReq = new Request('http://localhost/api/articulatory-phonetics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'bad-json{',
    })
    const res = await handler(badReq)
    expect(res.status).toBe(400)
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
