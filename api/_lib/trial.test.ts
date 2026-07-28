// Test quà dùng thử Pro 14 ngày — trọng tâm: KHÔNG cấp được 2 lần (đây là chỗ đụng tiền API
// thật). Điều kiện "chỉ cấp khi đã xác thực" được test ở api/auth.test.ts (nơi quyết định KHI
// NÀO gọi hàm này) — file này chỉ test bản thân cơ chế cấp/chống cấp trùng.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./pgPool', () => ({ getPgPool: vi.fn() }))
const granted: { calls: { userId: string; plan: string; days: number }[] } = { calls: [] }
vi.mock('./planGrant', () => ({
  grantPlanDays: async (userId: string, plan: string, days: number) => {
    granted.calls.push({ userId, plan, days })
    return { plan, planExpiresAt: new Date() }
  },
}))

import { grantSignupTrial, SIGNUP_TRIAL_DAYS } from './trial'
import { getPgPool } from './pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  granted.calls = []
})

describe('grantSignupTrial', () => {
  it('lần đầu → cấp đúng 14 ngày gói pro', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [] })
    expect(await grantSignupTrial('u1')).toBe(true)
    expect(granted.calls).toEqual([{ userId: 'u1', plan: 'pro', days: SIGNUP_TRIAL_DAYS }])
  })

  it('đã nhận trước đó (rowCount = 0) → KHÔNG cấp lần 2', async () => {
    query.mockResolvedValueOnce({ rowCount: 0, rows: [] })
    expect(await grantSignupTrial('u1')).toBe(false)
    expect(granted.calls).toEqual([])
  })

  it('lỗi DB → trả false, KHÔNG ném lỗi ra ngoài (không phá luồng xác thực/đăng nhập)', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    query.mockRejectedValueOnce(new Error('db down'))
    expect(await grantSignupTrial('u1')).toBe(false)
    expect(granted.calls).toEqual([])
    spy.mockRestore()
  })

  it('dùng cột signup_trial_granted_at để giành quyền nhận 1 lần', async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [] })
    await grantSignupTrial('u1')
    const sql = query.mock.calls[0]?.[0] as string
    expect(sql).toContain('signup_trial_granted_at')
  })
})
