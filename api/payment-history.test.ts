import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./_lib/pgPool', () => ({ getPgPool: vi.fn() }))
const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('./_lib/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

import handler from './payment-history'
import { getPgPool } from './_lib/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

function makeRequest(): Request {
  return new Request('http://localhost/api/payment-history', {
    headers: { Authorization: 'Bearer x' },
  })
}

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  authState.user = { userId: 'user-1' }
})

describe('/api/payment-history', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const resp = await handler(makeRequest())
    expect(resp.status).toBe(401)
  })

  it('lọc theo user_id của token', async () => {
    const resp = await handler(makeRequest())
    expect(resp.status).toBe(200)
    const [, params] = query.mock.calls[0] as [string, unknown[]]
    expect(params[0]).toBe('user-1')
  })

  it('trả danh sách đã map camelCase', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          plan: 'pro',
          cycle: 'month',
          amount_vnd: 40_000,
          status: 'paid',
          created_at: new Date('2026-07-27T10:00:00Z'),
          paid_at: new Date('2026-07-27T10:05:00Z'),
        },
      ],
    })
    const resp = await handler(makeRequest())
    const data = (await resp.json()) as { payments: unknown[] }
    expect(data.payments).toEqual([
      {
        plan: 'pro',
        cycle: 'month',
        amountVnd: 40_000,
        status: 'paid',
        createdAt: '2026-07-27T10:00:00.000Z',
        paidAt: '2026-07-27T10:05:00.000Z',
      },
    ])
  })
})
