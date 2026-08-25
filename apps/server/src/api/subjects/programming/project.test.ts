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

import handler from './project.js'

function req(method: string, body?: unknown) {
  return new Request('http://localhost/api/programming/project', {
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
  query.mockResolvedValue({ rows: [], rowCount: 0 })
})

describe('/api/programming/project', () => {
  it('chưa đăng nhập → 401; method lạ → 405', async () => {
    authState.user = null
    expect((await handler(req('GET'))).status).toBe(401)
    authState.user = { userId: 'user-1' }
    expect((await handler(req('PUT'))).status).toBe(405)
  })

  it('GET trả cây file + snapshot (thời gian mili-giây)', async () => {
    const at = new Date(1_756_000_000_000)
    query
      .mockResolvedValueOnce({
        rows: [{ path: 'cua_hang.py', content: 'print(1)', updated_at: at }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 'id-1', milestone: 'p1', created_at: at }] })
    const body = (await (await handler(req('GET'))).json()) as {
      files: { path: string; updatedAt: number }[]
      snapshots: { milestone: string }[]
    }
    expect(body.files[0]).toMatchObject({ path: 'cua_hang.py', updatedAt: at.getTime() })
    expect(body.snapshots[0]?.milestone).toBe('p1')
  })

  it('save: tên file lồng đường dẫn / bắt đầu bằng chấm → 400 (chặn path traversal)', async () => {
    for (const path of ['../etc', 'a/b.py', '.env', 'A.PY']) {
      const res = await handler(req('POST', { action: 'save', path, content: 'x' }))
      expect(res.status, `path "${path}" phải bị chặn`).toBe(400)
    }
    expect(query).not.toHaveBeenCalled()
  })

  it('save hợp lệ → kiểm quota rồi upsert', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ n: '1', total: '100' }] }) // quota
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // upsert
    const res = await handler(
      req('POST', { action: 'save', path: 'cua_hang.py', content: 'print(1)' }),
    )
    expect(res.status).toBe(200)
    expect(String(query.mock.calls[1]?.[0])).toContain('on conflict (user_id, path)')
  })

  it('save vượt quota tổng ~2MB → 413, KHÔNG ghi', async () => {
    query.mockResolvedValueOnce({ rows: [{ n: '3', total: String(2 * 1024 * 1024) }] })
    const res = await handler(req('POST', { action: 'save', path: 'cua_hang.py', content: 'x' }))
    expect(res.status).toBe(413)
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('snapshot: workspace trống → 400; có file → insert jsonb cây file', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    expect((await handler(req('POST', { action: 'snapshot', milestone: 'p1' }))).status).toBe(400)

    vi.clearAllMocks()
    query
      .mockResolvedValueOnce({
        rows: [{ path: 'cua_hang.py', content: 'print(1)', updated_at: new Date() }],
      })
      .mockResolvedValueOnce({ rows: [] })
    const res = await handler(req('POST', { action: 'snapshot', milestone: 'p1' }))
    expect(res.status).toBe(200)
    expect(query.mock.calls[1]?.[1]?.[2]).toBe(JSON.stringify({ 'cua_hang.py': 'print(1)' }))
  })

  it('snapshot milestone lạ → 400', async () => {
    expect((await handler(req('POST', { action: 'snapshot', milestone: 'p9' }))).status).toBe(400)
  })
})
