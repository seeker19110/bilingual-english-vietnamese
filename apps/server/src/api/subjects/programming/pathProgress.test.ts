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

import handler from './pathProgress.js'

function req(method: string, body?: unknown, search?: string) {
  const url = `http://localhost/api/programming/path-progress${search ?? ''}`
  return new Request(url, {
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

describe('/api/programming/path-progress', () => {
  it('chưa đăng nhập → 401; quá rate limit → 429', async () => {
    authState.user = null
    expect((await handler(req('GET', undefined, '?pathId=principal-ai'))).status).toBe(401)
    authState.user = { userId: 'user-1' }
    rateLimitOk = false
    expect((await handler(req('GET', undefined, '?pathId=principal-ai'))).status).toBe(429)
  })

  it('GET thiếu pathId → 400', async () => {
    expect((await handler(req('GET'))).status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('GET người mới → mảng rỗng, chỉ đọc dữ liệu của user trong token', async () => {
    authState.user = { userId: 'user-B' }
    const res = await handler(req('GET', undefined, '?pathId=principal-ai'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ stages: [] })
    expect(String(query.mock.calls[0]?.[0])).toContain('user_id = $1 and path_id = $2')
    expect(query.mock.calls[0]?.[1]).toEqual(['user-B', 'principal-ai'])
  })

  it('POST thiếu stages hoặc body sai khuôn → 400, KHÔNG ghi DB', async () => {
    expect((await handler(req('POST', { pathId: 'principal-ai' }))).status).toBe(400)
    expect((await handler(req('POST', { pathId: 'principal-ai', stages: [] }))).status).toBe(400)
    expect(
      (
        await handler(
          req('POST', {
            pathId: 'principal-ai',
            stages: [{ stageId: 'ai-s1', status: 'huyen-thoai' }],
          }),
        )
      ).status,
    ).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('POST chặng không thuộc lộ trình → 400', async () => {
    const res = await handler(
      req('POST', { pathId: 'principal-ai', stages: [{ stageId: 'web-s1', status: 'skipped' }] }),
    )
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      error: 'Chặng "web-s1" không thuộc lộ trình "principal-ai"',
    })
  })

  it('POST hợp lệ → 200, ghi theo user_id của TOKEN chứ không theo body', async () => {
    authState.user = { userId: 'user-B' }
    const res = await handler(
      req('POST', {
        pathId: 'principal-ai',
        stages: [
          { stageId: 'ai-s1', status: 'skipped' },
          { stageId: 'ai-s2', status: 'in_progress' },
        ],
      }),
    )
    expect(res.status).toBe(200)
    expect(query).toHaveBeenCalledTimes(2)
    expect(query.mock.calls[0]?.[1]).toEqual(['user-B', 'principal-ai', 'ai-s1', 'skipped'])
    expect(query.mock.calls[1]?.[1]).toEqual(['user-B', 'principal-ai', 'ai-s2', 'in_progress'])
  })

  it('method lạ → 405', async () => {
    expect((await handler(req('DELETE'))).status).toBe(405)
  })
})
