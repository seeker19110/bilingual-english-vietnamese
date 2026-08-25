import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true

vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const query = vi.hoisted(() => vi.fn())
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({ query }) }))

import handler from './progress.js'

function req(method: string, body?: unknown) {
  return new Request('http://localhost/api/programming/progress', {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  query.mockResolvedValue({ rows: [] })
})

describe('/api/programming/progress', () => {
  it('chưa đăng nhập → 401; quá rate limit → 429', async () => {
    authState.user = null
    expect((await handler(req('GET'))).status).toBe(401)
    authState.user = { userId: 'user-1' }
    rateLimitOk = false
    expect((await handler(req('GET'))).status).toBe(429)
  })

  it('GET người mới (chưa có dòng nào) → mặc định p1/T1, lessons rỗng', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      state: { currentLevel: string; projectTrack: string }
      lessons: unknown[]
    }
    expect(body.state).toEqual({ currentLevel: 'p1', projectTrack: 'T1' })
    expect(body.lessons).toEqual([])
  })

  it('GET trả tiến độ có sẵn (completed_at → mili-giây epoch)', async () => {
    const at = new Date(1_756_000_000_000)
    query
      .mockResolvedValueOnce({ rows: [{ current_level: 'p2', project_track: 'T1' }] })
      .mockResolvedValueOnce({
        rows: [{ lesson_id: 'p1-u4-l1', status: 'completed', completed_at: at }],
      })
    const body = (await (await handler(req('GET'))).json()) as {
      state: { currentLevel: string }
      lessons: { lessonId: string; status: string; completedAt: number | null }[]
    }
    expect(body.state.currentLevel).toBe('p2')
    expect(body.lessons).toEqual([
      { lessonId: 'p1-u4-l1', status: 'completed', completedAt: at.getTime() },
    ])
  })

  it('POST bài không tồn tại trong giáo trình → 400, KHÔNG ghi DB', async () => {
    const res = await handler(req('POST', { lessonId: 'p1-u9-l9', status: 'completed' }))
    expect(res.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('POST hợp lệ → tạo learner_state (idempotent) + upsert tiến độ', async () => {
    const res = await handler(req('POST', { lessonId: 'p1-u4-l1', status: 'completed' }))
    expect(res.status).toBe(200)
    expect(query).toHaveBeenCalledTimes(2)
    expect(String(query.mock.calls[0]?.[0])).toContain('learner_state')
    const upsert = String(query.mock.calls[1]?.[0])
    // Bất biến chống kéo lùi: đã completed thì giữ completed.
    expect(upsert).toContain("then 'completed' else excluded.status end")
    expect(query.mock.calls[1]?.[1]).toEqual(['user-1', 'p1-u4-l1', 'completed'])
  })

  it('POST body sai khuôn (status lạ) → 400; method lạ → 405', async () => {
    expect((await handler(req('POST', { lessonId: 'p1-u4-l1', status: 'done' }))).status).toBe(400)
    expect((await handler(req('DELETE'))).status).toBe(405)
  })
})
