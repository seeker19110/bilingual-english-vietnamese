// Test /api/quests — chặn method/đăng nhập/input, và gọi đúng claimShareQuest.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('./_lib/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const claimMock = vi.fn()
vi.mock('./_lib/quests', () => ({ claimShareQuest: (userId: string) => claimMock(userId) }))

import handler from './quests'

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  claimMock.mockReset()
})

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/quests', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/quests', () => {
  it('method khác POST → 405', async () => {
    const res = await handler(new Request('http://localhost/api/quests', { method: 'GET' }))
    expect(res.status).toBe(405)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(makeRequest({ action: 'claim-share' }))
    expect(res.status).toBe(401)
  })

  it('action không hợp lệ → 400, không gọi claimShareQuest', async () => {
    const res = await handler(makeRequest({ action: 'unknown' }))
    expect(res.status).toBe(400)
    expect(claimMock).not.toHaveBeenCalled()
  })

  it('đủ điều kiện → 200, trả rewardDays', async () => {
    claimMock.mockResolvedValue({ ok: true, rewardDays: 1 })
    const res = await handler(makeRequest({ action: 'claim-share' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, rewardDays: 1 })
    expect(claimMock).toHaveBeenCalledWith('user-1')
  })

  it('chưa đủ điều kiện (đã nhận trong cửa sổ hồi) → 400 kèm thông điệp', async () => {
    claimMock.mockResolvedValue({ ok: false, message: 'Đã nhận rồi' })
    const res = await handler(makeRequest({ action: 'claim-share' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Đã nhận rồi' })
  })
})
