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

import handler from './pathArtifact.js'

function req(method: string, opts: { body?: unknown; search?: string } = {}) {
  const url = `http://localhost/api/programming/path-artifact${opts.search ?? ''}`
  return new Request(url, {
    method,
    ...(opts.body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(opts.body) }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  query.mockResolvedValue({ rows: [], rowCount: 0 })
})

describe('/api/programming/path-artifact', () => {
  it('chưa đăng nhập → 401; quá rate limit → 429', async () => {
    authState.user = null
    expect((await handler(req('GET', { search: '?pathId=principal-ai' }))).status).toBe(401)
    authState.user = { userId: 'user-1' }
    rateLimitOk = false
    expect((await handler(req('GET', { search: '?pathId=principal-ai' }))).status).toBe(429)
  })

  it('GET thiếu pathId → 400', async () => {
    expect((await handler(req('GET'))).status).toBe(400)
  })

  it('GET người mới → mảng rỗng, chỉ đọc dữ liệu của user trong token', async () => {
    authState.user = { userId: 'user-B' }
    const res = await handler(req('GET', { search: '?pathId=principal-ai' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ artifacts: [] })
    expect(query.mock.calls[0]?.[1]).toEqual(['user-B', 'principal-ai'])
  })

  it('POST url không phải http(s) → 400, KHÔNG ghi DB', async () => {
    const res = await handler(
      req('POST', {
        body: {
          pathId: 'principal-ai',
          phaseId: 'principal-ai-p1',
          url: 'javascript:alert(1)',
          note: '',
        },
      }),
    )
    expect(res.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('POST phaseId không thuộc lộ trình → 400', async () => {
    const res = await handler(
      req('POST', {
        body: {
          pathId: 'principal-ai',
          phaseId: 'principal-ai-p9',
          url: 'https://example.com',
          note: '',
        },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('POST hợp lệ → 200, ghi theo user_id của TOKEN chứ không theo body', async () => {
    authState.user = { userId: 'user-B' }
    const res = await handler(
      req('POST', {
        body: {
          pathId: 'principal-ai',
          phaseId: 'principal-ai-p1',
          url: 'https://github.com/x/y',
          note: 'bài tập',
        },
      }),
    )
    expect(res.status).toBe(200)
    expect(query.mock.calls[0]?.[1]).toEqual([
      'user-B',
      'principal-ai',
      'principal-ai-p1',
      'https://github.com/x/y',
      'bài tập',
    ])
  })

  it('DELETE thiếu/sai id → 400', async () => {
    expect((await handler(req('DELETE'))).status).toBe(400)
    expect((await handler(req('DELETE', { search: '?id=khong-phai-uuid' }))).status).toBe(400)
  })

  it('DELETE id hợp lệ nhưng không thuộc mình (rowCount 0) → 404', async () => {
    query.mockResolvedValue({ rows: [], rowCount: 0 })
    const res = await handler(req('DELETE', { search: '?id=11111111-1111-4111-8111-111111111111' }))
    expect(res.status).toBe(404)
  })

  it('DELETE xoá đúng của mình → 200, kèm user_id của TOKEN', async () => {
    authState.user = { userId: 'user-B' }
    query.mockResolvedValue({ rows: [], rowCount: 1 })
    const res = await handler(req('DELETE', { search: '?id=11111111-1111-4111-8111-111111111111' }))
    expect(res.status).toBe(200)
    expect(query.mock.calls[0]?.[1]).toEqual(['11111111-1111-4111-8111-111111111111', 'user-B'])
  })

  it('method lạ → 405', async () => {
    expect((await handler(req('PATCH'))).status).toBe(405)
  })
})
