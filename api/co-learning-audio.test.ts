// api/co-learning-audio.test.ts — Tests cho REST handler co-learning-audio
import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from './co-learning-audio.js'
import { _resetAudioCoLearningStateForTests } from '@dhcb/core-ai/audioCoLearningService'

// Mock validateAuth
vi.mock('@dhcb/core-auth/security', () => ({
  validateAuth: vi.fn(async (req: Request) => {
    const authHeader = req.headers.get('Authorization')
    if (authHeader && authHeader.includes('valid-token')) {
      return { userId: 'user-test-123', email: 'test@example.com' }
    }
    return null
  }),
  getCorsHeaders: vi.fn().mockReturnValue({}),
}))

describe('api/co-learning-audio', () => {
  beforeEach(() => {
    _resetAudioCoLearningStateForTests()
  })

  it('should return 401 if unauthenticated', async () => {
    const req = new Request('http://localhost/api/co-learning-audio', {
      method: 'GET',
    })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('should return empty list of rooms initially', async () => {
    const req = new Request('http://localhost/api/co-learning-audio', {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-token' },
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.rooms).toHaveLength(0)
  })

  it('should create a room via POST create_room', async () => {
    const req = new Request('http://localhost/api/co-learning-audio?action=create_room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        topic: 'Luyện đề thi THPT Quốc Gia môn Hóa',
        subject: 'chemistry',
        displayName: 'Học viên A',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.room.topic).toBe('Luyện đề thi THPT Quốc Gia môn Hóa')
    expect(data.room.members).toHaveLength(1)
  })

  it('should reject create_room with missing fields', async () => {
    const req = new Request('http://localhost/api/co-learning-audio?action=create_room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        topic: '',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('should join and leave room via API', async () => {
    // 1. Create room
    const createReq = new Request('http://localhost/api/co-learning-audio?action=create_room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        topic: 'English Speaking Practice',
        subject: 'english',
      }),
    })
    const createRes = await handler(createReq)
    const createData = await createRes.json()
    const roomId = createData.room.id

    // 2. Get room
    const getReq = new Request(`http://localhost/api/co-learning-audio?roomId=${roomId}`, {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-token' },
    })
    const getRes = await handler(getReq)
    expect(getRes.status).toBe(200)

    // 3. Request hint
    const hintReq = new Request('http://localhost/api/co-learning-audio?action=request_hint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        roomId,
        hintText: 'Gợi ý từ vựng chuyên ngành',
      }),
    })
    const hintRes = await handler(hintReq)
    expect(hintRes.status).toBe(200)

    // 4. Leave room
    const leaveReq = new Request('http://localhost/api/co-learning-audio?action=leave_room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({ roomId }),
    })
    const leaveRes = await handler(leaveReq)
    expect(leaveRes.status).toBe(200)
  })
})
