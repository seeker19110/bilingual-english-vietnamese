import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  logSecurityEvent: () => {},
}))

const query = vi.fn()

async function importHandler() {
  vi.resetModules()
  const { getPgPool } = await import('../packages/core-db/pgPool')
  vi.mocked(getPgPool).mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  const mod = await import('./hub-stats')
  return mod.default
}

beforeEach(() => {
  query.mockReset()
})

describe('/api/hub-stats', () => {
  it('không cần đăng nhập, trả tổng số user + tổng lượt học tiếng Anh', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ count: '1234' }] }) // public.users
      .mockResolvedValueOnce({ rows: [{ count: '5678' }] }) // english.*_sessions cộng dồn
    const handler = await importHandler()
    const resp = await handler(new Request('http://localhost/api/hub-stats'))
    expect(resp.status).toBe(200)
    const data = (await resp.json()) as { totalUsers: number; totalEnglishSessions: number }
    expect(data.totalUsers).toBe(1234)
    expect(data.totalEnglishSessions).toBe(5678)
    expect(query).toHaveBeenCalledTimes(2)
  })

  it('method khác GET → 405, không đụng DB', async () => {
    const handler = await importHandler()
    const resp = await handler(new Request('http://localhost/api/hub-stats', { method: 'POST' }))
    expect(resp.status).toBe(405)
    expect(query).not.toHaveBeenCalled()
  })

  it('kết quả có cache trong process — gọi 2 lần liên tiếp chỉ query DB 1 lần', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ count: '10' }] })
      .mockResolvedValueOnce({ rows: [{ count: '20' }] })
    const handler = await importHandler()
    const resp1 = await handler(new Request('http://localhost/api/hub-stats'))
    const resp2 = await handler(new Request('http://localhost/api/hub-stats'))
    expect(resp1.status).toBe(200)
    expect(resp2.status).toBe(200)
    expect(query).toHaveBeenCalledTimes(2) // không phải 4 — lần 2 dùng cache
  })
})
