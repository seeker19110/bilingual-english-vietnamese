// api/debate-arena.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './debate-arena.js'
import * as security from '@dhcb/core-auth/security'

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

  it('handles OPTIONS request with 204', async () => {
    const res = await handler(
      new Request('http://localhost/api/debate-arena', { method: 'OPTIONS' }),
    )
    expect(res.status).toBe(204)
  })

  it('handles GET specific sessionId (found and not found)', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    // Not found
    const notFoundRes = await handler(
      new Request('http://localhost/api/debate-arena?sessionId=non-existent', { method: 'GET' }),
    )
    expect(notFoundRes.status).toBe(404)

    // Create session first
    const createReq = new Request('http://localhost/api/debate-arena?action=create_session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          topicId: 'ubi',
          motion: 'UBI is essential',
          category: 'economics',
          userStance: 'support',
          difficulty: 'advanced_c1',
          maxRounds: 1,
        },
      }),
    })
    const createRes = await handler(createReq)
    const { session } = await createRes.json()

    // Found
    const foundRes = await handler(
      new Request(`http://localhost/api/debate-arena?sessionId=${session.id}`, { method: 'GET' }),
    )
    expect(foundRes.status).toBe(200)
  })

  it('validates invalid actions and missing parameters in POST', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    // Missing config
    const badConfigRes = await handler(
      new Request('http://localhost/api/debate-arena?action=create_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )
    expect(badConfigRes.status).toBe(400)

    // Missing content in submit_turn
    const badTurnRes = await handler(
      new Request('http://localhost/api/debate-arena?action=submit_turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 's1' }),
      }),
    )
    expect(badTurnRes.status).toBe(400)

    // Submit turn with fallback session creation
    const fallbackRes = await handler(
      new Request('http://localhost/api/debate-arena?action=submit_turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'fallback-session-123', content: 'Arguments' }),
      }),
    )
    expect(fallbackRes.status).toBe(200)

    // Evaluate match not found vs found
    const notFoundEval = await handler(
      new Request('http://localhost/api/debate-arena?action=evaluate_match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'nonexistent' }),
      }),
    )
    expect(notFoundEval.status).toBe(404)

    const foundEval = await handler(
      new Request('http://localhost/api/debate-arena?action=evaluate_match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'fallback-session-123' }),
      }),
    )
    expect(foundEval.status).toBe(200)

    // Invalid action
    const invalidActionRes = await handler(
      new Request('http://localhost/api/debate-arena?action=unknown_action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )
    expect(invalidActionRes.status).toBe(400)

    // Invalid method
    const methodNotAllowed = await handler(
      new Request('http://localhost/api/debate-arena', { method: 'DELETE' }),
    )
    expect(methodNotAllowed.status).toBe(405)
  })
})
