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
const connect = vi.hoisted(() => vi.fn())
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({ query, connect }) }))

import handler from './specialization.js'

function req(method: string, body?: unknown) {
  return new Request('http://localhost/api/programming/specialization', {
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
  connect.mockResolvedValue({ query, release: vi.fn() })
})

describe('/api/programming/specialization', () => {
  it('chưa đăng nhập → 401; quá rate limit → 429', async () => {
    authState.user = null
    expect((await handler(req('GET'))).status).toBe(401)
    authState.user = { userId: 'user-1' }
    rateLimitOk = false
    expect((await handler(req('GET'))).status).toBe(429)
  })

  it('GET người mới → chưa theo hướng nào, danh sách rỗng', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      primarySpecId: null,
      crossSpecIds: [],
      enrollments: [],
      stages: [],
    })
  })

  it('GET chỉ đọc dữ liệu của người dùng trong token', async () => {
    authState.user = { userId: 'user-B' }
    await handler(req('GET'))
    for (const call of query.mock.calls) {
      expect(String(call[0])).toContain('user_id = $1')
      expect((call[1] as unknown[])[0]).toBe('user-B')
    }
  })

  it('POST enroll hướng lạ → 400, KHÔNG ghi DB', async () => {
    const res = await handler(req('POST', { action: 'enroll', specId: 'blockchain' }))
    expect(res.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('POST enroll hướng thật → 200 và ghi theo user_id của token, không theo body', async () => {
    authState.user = { userId: 'user-B' }
    const res = await handler(req('POST', { action: 'enroll', specId: 'web', userId: 'user-A' }))
    // `.strict()` chặn trường thừa: client không đính kèm được user_id giả.
    expect(res.status).toBe(400)
    expect(query).not.toHaveBeenCalled()

    const ok = await handler(req('POST', { action: 'enroll', specId: 'web' }))
    expect(ok.status).toBe(200)
    const insert = query.mock.calls.find((c) => String(c[0]).includes('insert into'))
    expect(insert?.[1]).toEqual(['user-B', 'web', 'primary'])
  })

  it('POST stage chặng lạ → 400; chặng thật → 200', async () => {
    expect(
      (await handler(req('POST', { action: 'stage', stageId: 'web-s9', status: 'completed' })))
        .status,
    ).toBe(400)
    expect(query).not.toHaveBeenCalled()
    const ok = await handler(
      req('POST', { action: 'stage', stageId: 'web-s1', status: 'completed' }),
    )
    expect(ok.status).toBe(200)
    expect(query.mock.calls[0]?.[1]).toEqual(['user-1', 'web', 'web-s1', 'completed'])
  })

  it('POST body sai khuôn (action lạ) → 400; method lạ → 405', async () => {
    expect((await handler(req('POST', { action: 'xoa-het' }))).status).toBe(400)
    expect((await handler(req('DELETE'))).status).toBe(405)
  })
})
