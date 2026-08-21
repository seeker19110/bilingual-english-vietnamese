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

  it('handles OPTIONS preflight', async () => {
    const req = new Request('http://localhost/api/realtime-multimodal', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('rejects unsupported method', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })
    const req = new Request('http://localhost/api/realtime-multimodal', { method: 'PATCH' })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })

  it('rejects GET without sessionId', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })
    const req = new Request('http://localhost/api/realtime-multimodal', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('404s GET for unknown sessionId', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })
    const req = new Request('http://localhost/api/realtime-multimodal?sessionId=does-not-exist', {
      method: 'GET',
    })
    const res = await handler(req)
    expect(res.status).toBe(404)
  })

  it('rejects DELETE without sessionId', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })
    const req = new Request('http://localhost/api/realtime-multimodal', { method: 'DELETE' })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('deletes an existing session via DELETE', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
    })
    const createReq = new Request('http://localhost/api/realtime-multimodal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const createRes = await handler(createReq)
    const { sessionId } = await createRes.json()

    const delReq = new Request(`http://localhost/api/realtime-multimodal?sessionId=${sessionId}`, {
      method: 'DELETE',
    })
    const delRes = await handler(delReq)
    expect(delRes.status).toBe(200)
    const delData = await delRes.json()
    expect(delData.success).toBe(true)
  })

  it('rejects invalid POST configuration payload', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })
    const req = new Request('http://localhost/api/realtime-multimodal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 12345 }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })
})
