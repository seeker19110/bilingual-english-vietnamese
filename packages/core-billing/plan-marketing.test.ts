import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../api/_lib/planMarketing', () => ({ getPlanMarketing: vi.fn() }))
vi.mock('../core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  logSecurityEvent: () => {},
}))

beforeEach(() => {
  vi.clearAllMocks()
})

async function importHandler() {
  vi.resetModules()
  const mod = await import('./plan-marketing')
  return mod.default
}

describe('/api/plan-marketing', () => {
  it('không cần đăng nhập, trả nội dung mô tả gói + ETag', async () => {
    const { getPlanMarketing } = await import('../../api/_lib/planMarketing')
    vi.mocked(getPlanMarketing).mockResolvedValue({
      updatedAt: '2026-08-01T00:00:00Z',
      plans: {},
    } as unknown as Awaited<ReturnType<typeof getPlanMarketing>>)
    const handler = await importHandler()
    const resp = await handler(new Request('http://localhost/api/plan-marketing'))
    expect(resp.status).toBe(200)
    expect(resp.headers.get('ETag')).toBe('"2026-08-01T00:00:00Z"')
  })

  it('OPTIONS preflight → 204, không đụng DB', async () => {
    const { getPlanMarketing } = await import('../../api/_lib/planMarketing')
    const handler = await importHandler()
    const resp = await handler(
      new Request('http://localhost/api/plan-marketing', { method: 'OPTIONS' }),
    )
    expect(resp.status).toBe(204)
    expect(getPlanMarketing).not.toHaveBeenCalled()
  })

  it('method khác GET/OPTIONS → 405', async () => {
    const handler = await importHandler()
    const resp = await handler(
      new Request('http://localhost/api/plan-marketing', { method: 'POST' }),
    )
    expect(resp.status).toBe(405)
  })

  it('If-None-Match khớp ETag hiện tại → 304 rỗng', async () => {
    const { getPlanMarketing } = await import('../../api/_lib/planMarketing')
    vi.mocked(getPlanMarketing).mockResolvedValue({
      updatedAt: '2026-08-01T00:00:00Z',
      plans: {},
    } as unknown as Awaited<ReturnType<typeof getPlanMarketing>>)
    const handler = await importHandler()
    const resp = await handler(
      new Request('http://localhost/api/plan-marketing', {
        headers: { 'if-none-match': '"2026-08-01T00:00:00Z"' },
      }),
    )
    expect(resp.status).toBe(304)
  })
})
