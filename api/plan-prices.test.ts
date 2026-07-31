import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('./_lib/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  logSecurityEvent: () => {},
}))

import handler from './plan-prices'
import { getPgPool } from '../packages/core-db/pgPool'
import { invalidatePricesCache } from './_lib/prices'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  invalidatePricesCache()
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
})

describe('/api/plan-prices', () => {
  it('không cần đăng nhập, trả giá mặc định đúng bảng giá đã chốt', async () => {
    const resp = await handler(new Request('http://localhost/api/plan-prices'))
    expect(resp.status).toBe(200)
    const data = (await resp.json()) as {
      pro: {
        '10day': { effectiveVnd: number }
        month: { effectiveVnd: number }
        year: { effectiveVnd: number }
      }
      vip: {
        '10day': { effectiveVnd: number }
        month: { effectiveVnd: number }
        year: { effectiveVnd: number }
      }
    }
    expect(data.pro['10day'].effectiveVnd).toBe(20_000)
    expect(data.pro.month.effectiveVnd).toBe(40_000)
    expect(data.pro.year.effectiveVnd).toBe(360_000)
    expect(data.vip['10day'].effectiveVnd).toBe(30_000)
    expect(data.vip.month.effectiveVnd).toBe(75_000)
    expect(data.vip.year.effectiveVnd).toBe(500_000)
  })
})
