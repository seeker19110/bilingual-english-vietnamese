// api/gemini-live.test.ts — Tests cho REST handler gemini-live
import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from './gemini-live.js'
import { _resetGeminiLiveServiceStateForTests } from '../packages/core-ai/geminiLiveService.js'

// Mock validateAuth
vi.mock('../packages/core-auth/security.js', () => ({
  validateAuth: vi.fn(async (req: Request) => {
    const authHeader = req.headers.get('Authorization')
    if (authHeader && authHeader.includes('valid-token')) {
      return { userId: 'user-live-123', email: 'live@example.com' }
    }
    return null
  }),
}))

describe('api/gemini-live', () => {
  beforeEach(() => {
    _resetGeminiLiveServiceStateForTests()
  })

  it('should return 401 if unauthenticated', async () => {
    const req = new Request('http://localhost/api/gemini-live', {
      method: 'GET',
    })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('should create a session via POST and get state via GET', async () => {
    // 1. Create session
    const createReq = new Request('http://localhost/api/gemini-live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        voiceName: 'Aoede',
      }),
    })
    const createRes = await handler(createReq)
    expect(createRes.status).toBe(201)
    const createData = await createRes.json()
    expect(createData.success).toBe(true)
    const sessionId = createData.sessionId

    // 2. Get session
    const getReq = new Request(`http://localhost/api/gemini-live?sessionId=${sessionId}`, {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-token' },
    })
    const getRes = await handler(getReq)
    expect(getRes.status).toBe(200)
    const getData = await getRes.json()
    expect(getData.sessionId).toBe(sessionId)

    // 3. Delete session
    const delReq = new Request(`http://localhost/api/gemini-live?sessionId=${sessionId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid-token' },
    })
    const delRes = await handler(delReq)
    expect(delRes.status).toBe(200)
  })
})
