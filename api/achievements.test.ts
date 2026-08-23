// Test /api/achievements — chặn method/đăng nhập/id không hợp lệ, gọi đúng hàm theo action.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const statusMock = vi.fn()
const claimMock = vi.fn()
vi.mock('./_lib/achievementRewards.js', () => ({
  getAchievementsStatus: (userId: string) => statusMock(userId),
  claimAchievementReward: (userId: string, id: string) => claimMock(userId, id),
  ACHIEVEMENT_IDS: ['streak_7', 'vocab_100'],
}))

import handler from './achievements'

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  statusMock.mockReset()
  claimMock.mockReset()
})

function postRequest(body: unknown): Request {
  return new Request('http://localhost/api/achievements', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/achievements', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(new Request('http://localhost/api/achievements'))
    expect(res.status).toBe(401)
  })

  it('đã đăng nhập → 200, trả danh sách huy hiệu', async () => {
    statusMock.mockResolvedValue([{ id: 'streak_7', earned: true, claimed: false }])
    const res = await handler(new Request('http://localhost/api/achievements'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ items: [{ id: 'streak_7', earned: true, claimed: false }] })
    expect(statusMock).toHaveBeenCalledWith('user-1')
  })
})

describe('POST /api/achievements', () => {
  it('method khác GET/POST → 405', async () => {
    const res = await handler(
      new Request('http://localhost/api/achievements', { method: 'DELETE' }),
    )
    expect(res.status).toBe(405)
  })

  it('achievementId không hợp lệ → 400, không gọi claim', async () => {
    const res = await handler(postRequest({ achievementId: 'unknown_id' }))
    expect(res.status).toBe(400)
    expect(claimMock).not.toHaveBeenCalled()
  })

  it('claim thành công → 200, trả rewardDays/rewardPlan', async () => {
    claimMock.mockResolvedValue({ ok: true, rewardDays: 3, rewardPlan: 'vip' })
    const res = await handler(postRequest({ achievementId: 'streak_7' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, rewardDays: 3, rewardPlan: 'vip' })
    expect(claimMock).toHaveBeenCalledWith('user-1', 'streak_7')
  })

  it('claim thất bại (chưa đạt/đã nhận) → 400, kèm thông điệp', async () => {
    claimMock.mockResolvedValue({ ok: false, message: 'Bạn chưa đạt được huy hiệu này.' })
    const res = await handler(postRequest({ achievementId: 'streak_7' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Bạn chưa đạt được huy hiệu này.' })
  })
})
