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

import handler from './scenario-holodeck.js'

const PERSON = '11111111-1111-4111-8111-111111111111'

function req(method: string, body?: unknown, searchParams?: string) {
  const url = searchParams
    ? `http://localhost/api/scenario-holodeck?${searchParams}`
    : 'http://localhost/api/scenario-holodeck'
  return new Request(url, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

describe('api/scenario-holodeck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = { userId: 'user-1' }
    rateLimitOk = true
    getOrCreatePerson.mockResolvedValue({ id: PERSON })
  })

  it('handles GET list of scenarios', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.scenarios).toBeDefined()
    expect(data.scenarios.length).toBeGreaterThan(0)
  })

  it('handles POST start, turn and finalize', async () => {
    // 1. Start session
    const startRes = await handler(
      req('POST', { action: 'start', scenarioId: 'bigtech_panel_interview' }),
    )
    expect(startRes.status).toBe(201)
    const startData = await startRes.json()
    const sessionId = startData.session.sessionId

    // 2. Process turn
    const turnRes = await handler(
      req('POST', {
        action: 'turn',
        sessionId,
        utterance: 'We migrated the database with zero downtime using dual writes.',
      }),
    )
    expect(turnRes.status).toBe(200)
    const turnData = await turnRes.json()
    expect(turnData.personaReplyTurn).toBeDefined()

    // 3. Finalize session
    const finalRes = await handler(req('POST', { action: 'finalize', sessionId }))
    expect(finalRes.status).toBe(200)
    const finalData = await finalRes.json()
    expect(finalData.session.status).toBe('completed')
    expect(finalData.session.finalRubric).toBeDefined()
  })

  it('returns 401 when unauthorized', async () => {
    authState.user = null
    const res = await handler(req('GET'))
    expect(res.status).toBe(401)
  })
})
