import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './realtime-multimodal.js'
import * as security from '../packages/core-auth/security.js'

describe('api/realtime-multimodal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthenticated requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)

    const req = new Request('http://localhost/api/realtime-multimodal', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('creates a new realtime multimodal session on POST with 201', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/realtime-multimodal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini_2_live',
        voiceMode: 'conversational_tutor',
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.sessionId).toBeDefined()
    expect(data.websocketEndpoint).toContain(data.sessionId)
  })

  it('retrieves active session on GET with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    // Create
    const createReq = new Request('http://localhost/api/realtime-multimodal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const createRes = await handler(createReq)
    const { sessionId } = await createRes.json()

    // Get
    const getReq = new Request(`http://localhost/api/realtime-multimodal?sessionId=${sessionId}`, {
      method: 'GET',
    })
    const getRes = await handler(getReq)
    expect(getRes.status).toBe(200)
    const getData = await getRes.json()
    expect(getData.sessionId).toBe(sessionId)
  })
})
