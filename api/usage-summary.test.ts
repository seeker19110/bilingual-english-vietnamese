// Test /api/usage-summary — trả số lượt AI còn lại cho client. Gói Free đọc kho lượt trượt
// 7 ngày từ DB; Pro/VIP trả thẳng plan, không tra DB. Kiểm cả nhánh lỗi DB fail-open về 0.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const lookupPlanMock = vi.fn()
vi.mock('../packages/core-billing/usage.js', () => ({
  lookupPlan: (userId: string) => lookupPlanMock(userId),
  FREE_WEEKLY_CAP: 70,
  FREE_ROLLING_WINDOW_DAYS: 7,
}))

vi.mock('../packages/core-db/pgPool.js', () => ({ getPgPool: vi.fn() }))

import handler from './usage-summary'
import { getPgPool } from '../packages/core-db/pgPool.js'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  lookupPlanMock.mockReset()
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
})

describe('GET /api/usage-summary', () => {
  it('OPTIONS → 204', async () => {
    const res = await handler(
      new Request('http://localhost/api/usage-summary', { method: 'OPTIONS' }),
    )
    expect(res.status).toBe(204)
  })

  it('method khác GET → 405', async () => {
    const res = await handler(new Request('http://localhost/api/usage-summary', { method: 'POST' }))
    expect(res.status).toBe(405)
  })

  it('vượt rate limit → 429', async () => {
    rateLimitOk = false
    const res = await handler(new Request('http://localhost/api/usage-summary'))
    expect(res.status).toBe(429)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(new Request('http://localhost/api/usage-summary'))
    expect(res.status).toBe(401)
  })

  it('gói Pro → trả thẳng plan, không tra DB', async () => {
    lookupPlanMock.mockResolvedValue('pro')
    const res = await handler(new Request('http://localhost/api/usage-summary'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ plan: 'pro', freeWeeklyCredit: null, freeWeeklyCap: 70 })
    expect(query).not.toHaveBeenCalled()
  })

  it('gói Free → đọc kho lượt trượt từ DB, kẹp trong [0, cap]', async () => {
    lookupPlanMock.mockResolvedValue('free')
    query.mockResolvedValue({ rows: [{ available: '35' }] })
    const res = await handler(new Request('http://localhost/api/usage-summary'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ plan: 'free', freeWeeklyCredit: 35, freeWeeklyCap: 70 })
    expect(query.mock.calls[0]?.[1]).toEqual(['user-1', expect.any(String), 7])
  })

  it('lỗi DB → fail-open trả 0, vẫn 200', async () => {
    lookupPlanMock.mockResolvedValue('free')
    query.mockRejectedValue(new Error('db down'))
    const res = await handler(new Request('http://localhost/api/usage-summary'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ plan: 'free', freeWeeklyCredit: 0, freeWeeklyCap: 70 })
  })
})
