// Test quà dùng thử Pro 5 ngày — trọng tâm: KHÔNG cấp được 2 lần (đây là chỗ đụng tiền API thật).

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./pgPool', () => ({ getPgPool: vi.fn() }))
const granted: { calls: { userId: string; plan: string; days: number }[] } = { calls: [] }
vi.mock('./planGrant', () => ({
  grantPlanDays: async (userId: string, plan: string, days: number) => {
    granted.calls.push({ userId, plan, days })
    return { plan, planExpiresAt: new Date() }
  },
}))

import { grantEmailVerifyTrial, EMAIL_VERIFY_TRIAL_DAYS } from './trial'
import { getPgPool } from './pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  granted.calls = []
})

describe('grantEmailVerifyTrial', () => {
  it('lần đầu → cấp đúng 5 ngày gói pro', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [] })
    expect(await grantEmailVerifyTrial('u1')).toBe(true)
    expect(granted.calls).toEqual([{ userId: 'u1', plan: 'pro', days: EMAIL_VERIFY_TRIAL_DAYS }])
  })

  it('đã nhận trước đó (rowCount = 0) → KHÔNG cấp lần 2', async () => {
    query.mockResolvedValueOnce({ rowCount: 0, rows: [] })
    expect(await grantEmailVerifyTrial('u1')).toBe(false)
    expect(granted.calls).toEqual([])
  })

  it('lỗi DB → trả false, KHÔNG ném lỗi ra ngoài (không phá luồng xác thực email)', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    query.mockRejectedValueOnce(new Error('db down'))
    expect(await grantEmailVerifyTrial('u1')).toBe(false)
    expect(granted.calls).toEqual([])
    spy.mockRestore()
  })
})
