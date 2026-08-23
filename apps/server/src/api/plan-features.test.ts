import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@dhcb/core-billing/planFeatures', () => ({ getPlanFeatureMatrix: vi.fn() }))
vi.mock('@dhcb/core-auth/security', () => ({
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
  const mod = await import('./plan-features.js')
  return mod.default
}

describe('/api/plan-features', () => {
  it('không cần đăng nhập, trả ma trận tính năng + ETag', async () => {
    const { getPlanFeatureMatrix } = await import('@dhcb/core-billing/planFeatures')
    vi.mocked(getPlanFeatureMatrix).mockResolvedValue({
      updatedAt: '2026-08-01T00:00:00Z',
      features: [],
      flags: {},
    } as unknown as Awaited<ReturnType<typeof getPlanFeatureMatrix>>)
    const handler = await importHandler()
    const resp = await handler(new Request('http://localhost/api/plan-features'))
    expect(resp.status).toBe(200)
    expect(resp.headers.get('ETag')).toBe('"2026-08-01T00:00:00Z"')
  })

  it('OPTIONS preflight → 204, không đụng DB', async () => {
    const { getPlanFeatureMatrix } = await import('@dhcb/core-billing/planFeatures')
    const handler = await importHandler()
    const resp = await handler(
      new Request('http://localhost/api/plan-features', { method: 'OPTIONS' }),
    )
    expect(resp.status).toBe(204)
    expect(getPlanFeatureMatrix).not.toHaveBeenCalled()
  })

  it('method khác GET/OPTIONS → 405', async () => {
    const handler = await importHandler()
    const resp = await handler(
      new Request('http://localhost/api/plan-features', { method: 'POST' }),
    )
    expect(resp.status).toBe(405)
  })

  it('If-None-Match khớp ETag hiện tại → 304 rỗng', async () => {
    const { getPlanFeatureMatrix } = await import('@dhcb/core-billing/planFeatures')
    vi.mocked(getPlanFeatureMatrix).mockResolvedValue({
      updatedAt: '2026-08-01T00:00:00Z',
      features: [],
      flags: {},
    } as unknown as Awaited<ReturnType<typeof getPlanFeatureMatrix>>)
    const handler = await importHandler()
    const resp = await handler(
      new Request('http://localhost/api/plan-features', {
        headers: { 'if-none-match': '"2026-08-01T00:00:00Z"' },
      }),
    )
    expect(resp.status).toBe(304)
  })
})
