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

import handler from './workplace-insights.js'

const PERSON = '11111111-1111-4111-8111-111111111111'

function req(method: string, body?: unknown, searchParams?: string) {
  const url = searchParams
    ? `http://localhost/api/workplace-insights?${searchParams}`
    : 'http://localhost/api/workplace-insights'
  return new Request(url, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

describe('api/workplace-insights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = { userId: 'user-1' }
    rateLimitOk = true
    getOrCreatePerson.mockResolvedValue({ id: PERSON })
  })

  it('handles GET list of mistakes and SRS cards', async () => {
    const listRes = await handler(req('GET'))
    expect(listRes.status).toBe(200)
    const listData = await listRes.json()
    expect(listData.mistakes).toBeDefined()

    const cardsRes = await handler(req('GET', undefined, 'kind=srs_cards'))
    expect(cardsRes.status).toBe(200)
    const cardsData = await cardsRes.json()
    expect(cardsData.cards).toBeDefined()
  })

  it('handles POST harvest mistakes and convert to SRS', async () => {
    const harvestRes = await handler(
      req('POST', {
        action: 'harvest',
        rawText: 'Please explain me why this query is slow, and let us discuss about it.',
        sourceType: 'slack_chat',
      }),
    )
    expect(harvestRes.status).toBe(201)
    const harvestData = await harvestRes.json()
    expect(harvestData.harvested.length).toBeGreaterThanOrEqual(2)

    const mistakeId = harvestData.harvested[0].id
    const convertRes = await handler(
      req('POST', {
        action: 'convert_to_srs',
        mistakeId,
      }),
    )
    expect(convertRes.status).toBe(201)
    const convertData = await convertRes.json()
    expect(convertData.card.mistakeId).toBe(mistakeId)
  })

  it('returns 401 when unauthorized', async () => {
    authState.user = null
    const res = await handler(req('GET'))
    expect(res.status).toBe(401)
  })

  it('handles OPTIONS (204) and rate limiting (429)', async () => {
    const resOpt = await handler(req('OPTIONS'))
    expect(resOpt.status).toBe(204)

    rateLimitOk = false
    const resRate = await handler(req('GET'))
    expect(resRate.status).toBe(429)
  })

  it('handles bad json, validation errors and method not allowed', async () => {
    // Bad JSON
    const resBadJson = await handler(
      new Request('http://localhost/api/workplace-insights', {
        method: 'POST',
        body: 'invalid-json',
      }),
    )
    expect(resBadJson.status).toBe(400)

    // Missing rawText in harvest
    const resHarvBad = await handler(req('POST', { action: 'harvest' }))
    expect(resHarvBad.status).toBe(400)

    // Harvest with default sourceType
    const resHarvDefault = await handler(
      req('POST', { action: 'harvest', rawText: 'Let us discuss about this issue.' }),
    )
    expect(resHarvDefault.status).toBe(201)

    // Missing mistakeId in convert_to_srs
    const resConvBad = await handler(req('POST', { action: 'convert_to_srs' }))
    expect(resConvBad.status).toBe(400)

    // Invalid action
    const resActionBad = await handler(req('POST', { action: 'unknown' }))
    expect(resActionBad.status).toBe(400)

    // Method not allowed
    const resDel = await handler(req('DELETE'))
    expect(resDel.status).toBe(405)
  })
})
