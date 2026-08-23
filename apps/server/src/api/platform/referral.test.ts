// Test /api/referral — GET đọc thống kê mời bạn, POST ghi nhận "được mời bởi mã này".
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const claimReferralMock = vi.fn()
const getReferralStatsMock = vi.fn()
vi.mock('../_lib/referral.js', () => ({
  claimReferral: (userId: string, code: string, deviceHash: string | null) =>
    claimReferralMock(userId, code, deviceHash),
  getReferralStats: (userId: string) => getReferralStatsMock(userId),
}))

import handler from './referral.js'

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  claimReferralMock.mockReset()
  getReferralStatsMock.mockReset()
})

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/referral', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/referral', () => {
  it('OPTIONS → 204', async () => {
    const res = await handler(new Request('http://localhost/api/referral', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('vượt rate limit → 429', async () => {
    rateLimitOk = false
    const res = await handler(new Request('http://localhost/api/referral'))
    expect(res.status).toBe(429)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(new Request('http://localhost/api/referral'))
    expect(res.status).toBe(401)
  })

  it('thành công → 200, trả thống kê', async () => {
    getReferralStatsMock.mockResolvedValue({
      code: 'ABC123',
      rewardedCount: 1,
      pendingCount: 0,
      maxRewarded: 10,
      rewardDays: 3,
    })
    const res = await handler(new Request('http://localhost/api/referral'))
    expect(res.status).toBe(200)
    expect(getReferralStatsMock).toHaveBeenCalledWith('user-1')
    expect(await res.json()).toEqual({
      code: 'ABC123',
      rewardedCount: 1,
      pendingCount: 0,
      maxRewarded: 10,
      rewardDays: 3,
    })
  })
})

describe('POST /api/referral', () => {
  it('method khác GET/POST → 405', async () => {
    const res = await handler(new Request('http://localhost/api/referral', { method: 'DELETE' }))
    expect(res.status).toBe(405)
  })

  it('code sai định dạng → 400', async () => {
    const res = await handler(makeRequest({ code: '!!' }))
    expect(res.status).toBe(400)
    expect(claimReferralMock).not.toHaveBeenCalled()
  })

  it('thành công → 200, gọi claimReferral với đúng tham số', async () => {
    claimReferralMock.mockResolvedValue({ ok: true })
    const res = await handler(makeRequest({ code: 'abc123' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(claimReferralMock).toHaveBeenCalledWith('user-1', 'abc123', null)
  })

  it('mã không tồn tại → 400 kèm thông điệp', async () => {
    claimReferralMock.mockResolvedValue({ ok: false, reason: 'code_not_found' })
    const res = await handler(makeRequest({ code: 'ZZZZZZ' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Mã mời không tồn tại' })
  })

  it('tự mời chính mình → 400 kèm thông điệp', async () => {
    claimReferralMock.mockResolvedValue({ ok: false, reason: 'self_invite' })
    const res = await handler(makeRequest({ code: 'ABC123' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Không thể tự mời chính mình' })
  })

  it('đã được ghi nhận lời mời trước đó → 400 kèm thông điệp', async () => {
    claimReferralMock.mockResolvedValue({ ok: false, reason: 'already_referred' })
    const res = await handler(makeRequest({ code: 'ABC123' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      error: 'Tài khoản này đã được ghi nhận lời mời trước đó',
    })
  })
})
