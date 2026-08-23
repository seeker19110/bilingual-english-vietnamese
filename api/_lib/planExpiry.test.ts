import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPgPool } from '@dhcb/core-db/pgPool'
import { downgradeExpiredPlans } from './planExpiry'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const mockedGetPool = vi.mocked(getPgPool)

function mockPool(rowCount: number) {
  return { query: vi.fn(async () => ({ rowCount, rows: [] })) } as unknown as ReturnType<
    typeof getPgPool
  >
}

describe('downgradeExpiredPlans', () => {
  beforeEach(() => mockedGetPool.mockReset())

  it('trả về số user đã hạ cấp', async () => {
    mockedGetPool.mockReturnValue(mockPool(3))
    expect(await downgradeExpiredPlans()).toEqual({ downgraded: 3 })
  })

  it('không ai hết hạn → 0', async () => {
    mockedGetPool.mockReturnValue(mockPool(0))
    expect(await downgradeExpiredPlans()).toEqual({ downgraded: 0 })
  })

  it('câu lệnh SQL chỉ nhắm đúng pro/vip đã hết hạn, đưa về free', async () => {
    const pool = mockPool(1)
    mockedGetPool.mockReturnValue(pool)
    await downgradeExpiredPlans()
    const sql = vi.mocked(pool.query).mock.calls[0]?.[0] as string
    expect(sql).toMatch(/plan in \('plus', 'pro', 'vip'\)/)
    expect(sql).toMatch(/plan_expires_at < now\(\)/)
    expect(sql).toMatch(/set plan = 'free', plan_expires_at = null/)
  })
})
