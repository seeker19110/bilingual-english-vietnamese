// api/debate-arena.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './debate-arena.js'
import * as security from '../packages/core-auth/security.js'

describe('Debate Arena API Handler (/api/debate-arena)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/debate-arena', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns sample topics on GET with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/debate-arena', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.topics.length).toBeGreaterThan(0)
  })

  it('creates debate session and submits user turn on POST', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    // 1. Create session
    const createReq = new Request('http://localhost/api/debate-arena?action=create_session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          topicId: 'ai-ethics',
          motion: 'AI systems must undergo mandatory ethical auditing.',
          category: 'technology',
          userStance: 'support',
          difficulty: 'advanced_c1',
          maxRounds: 4,
        },
      }),
    })

    const createRes = await handler(createReq)
    expect(createRes.status).toBe(200)
    const sessionData = await createRes.json()
    expect(sessionData.success).toBe(true)
    const sessionId = sessionData.session.id

    // 2. Submit turn
    const turnReq = new Request('http://localhost/api/debate-arena?action=submit_turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        content:
          'It is paramount to mandate audits because unaligned systems pose existential risks. Therefore, accountability is indispensable.',
      }),
    })

    const turnRes = await handler(turnReq)
    expect(turnRes.status).toBe(200)
    const turnData = await turnRes.json()
    expect(turnData.success).toBe(true)
    expect(turnData.userTurn).toBeDefined()
    expect(turnData.aiTurn).toBeDefined()
    expect(turnData.session.turns.length).toBeGreaterThanOrEqual(2)
  })
})
