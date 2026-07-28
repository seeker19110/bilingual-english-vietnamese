// Test nhiệm vụ "Chia sẻ công khai" — trọng tâm: KHÔNG cấp được 2 lần trong cùng cửa sổ hồi
// (7 ngày), đây là chỗ đụng tiền thật (grantPlanDays).
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./pgPool', () => ({ getPgPool: vi.fn() }))
const granted: { calls: { userId: string; plan: string; days: number }[] } = { calls: [] }
vi.mock('./planGrant', () => ({
  grantPlanDays: async (userId: string, plan: string, days: number) => {
    granted.calls.push({ userId, plan, days })
    return { plan, planExpiresAt: new Date() }
  },
}))

import {
  claimShareQuest,
  SHARE_QUEST_KEY,
  SHARE_QUEST_REWARD_DAYS,
  SHARE_QUEST_COOLDOWN_DAYS,
} from './quests'
import { getPgPool } from './pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  granted.calls = []
})

describe('claimShareQuest', () => {
  it('đủ điều kiện (hàm SQL trả true) → cấp đúng số ngày Pro', async () => {
    query.mockResolvedValueOnce({ rows: [{ claim_quest_if_ready: true }] })
    const r = await claimShareQuest('u1')
    expect(r).toEqual({ ok: true, rewardDays: SHARE_QUEST_REWARD_DAYS })
    expect(granted.calls).toEqual([{ userId: 'u1', plan: 'pro', days: SHARE_QUEST_REWARD_DAYS }])
  })

  it('truyền đúng quest key + số ngày hồi vào hàm SQL', async () => {
    query.mockResolvedValueOnce({ rows: [{ claim_quest_if_ready: true }] })
    await claimShareQuest('u1')
    expect(query.mock.calls[0]?.[1]).toEqual(['u1', SHARE_QUEST_KEY, SHARE_QUEST_COOLDOWN_DAYS])
  })

  it('chưa đủ điều kiện (hàm SQL trả false) → KHÔNG cấp, trả thông điệp', async () => {
    query.mockResolvedValueOnce({ rows: [{ claim_quest_if_ready: false }] })
    const r = await claimShareQuest('u1')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/7 ngày/)
    expect(granted.calls).toEqual([])
  })

  it('lỗi DB → trả ok:false, KHÔNG ném lỗi ra ngoài', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    query.mockRejectedValueOnce(new Error('db down'))
    const r = await claimShareQuest('u1')
    expect(r.ok).toBe(false)
    expect(granted.calls).toEqual([])
    spy.mockRestore()
  })
})
