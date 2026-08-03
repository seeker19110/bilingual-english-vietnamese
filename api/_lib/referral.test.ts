// Test mời bạn — tập trung vào CHỐNG GIAN LẬN, vì thưởng ở đây là tiền API thật:
//  1. Không tự mời chính mình.
//  2. Mã không tồn tại → từ chối.
//  3. 1 người chỉ được ghi nhận lời mời 1 lần (không đổi được người mời).
//  4. CHƯA xác thực email → KHÔNG thưởng (hàng rào chính chống email giả).
//  5. Đã thưởng rồi → không thưởng lần 2 (chống race + gọi lặp).
//  6. Thiết bị đã được thưởng lượt khác → không thưởng, nhưng KHÔNG khoá tài khoản.
//  7. Vượt trần 10 lượt → người MỜI hết được thưởng, người ĐƯỢC MỜI vẫn được.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('../../packages/core-auth/security', () => ({ logSecurityEvent: () => {} }))
const granted: { calls: { userId: string; days: number }[] } = { calls: [] }
vi.mock('./planGrant', () => ({
  grantPlanDays: async (userId: string, _plan: string, days: number) => {
    granted.calls.push({ userId, days })
    return { plan: 'pro', planExpiresAt: new Date() }
  },
}))

import {
  claimReferral,
  rewardReferralIfEligible,
  ensureReferralCode,
  getReferralStats,
  MAX_REWARDED_REFERRALS,
  REFERRAL_REWARD_DAYS,
} from './referral'
import { getPgPool } from '../../packages/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue({ rows: [], rowCount: 0 })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  granted.calls = []
})

describe('claimReferral', () => {
  it('mã không tồn tại → từ chối', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    expect(await claimReferral('u2', 'ABC123')).toEqual({ ok: false, reason: 'code_not_found' })
  })

  it('tự mời chính mình → từ chối', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'u1' }] })
    expect(await claimReferral('u1', 'ABC123')).toEqual({ ok: false, reason: 'self_invite' })
  })

  it('đã có người mời trước đó → KHÔNG ghi đè (không đổi được người mời)', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'u1' }] })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
    expect(await claimReferral('u2', 'ABC123')).toEqual({ ok: false, reason: 'already_referred' })
  })

  it('hợp lệ → ghi nhận lời mời, chuẩn hoá mã về chữ HOA', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'u1' }] })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
    expect(await claimReferral('u2', ' abc123 ')).toEqual({ ok: true })
    expect(query.mock.calls[0]?.[1]).toEqual(['ABC123'])
  })

  it('lưu kèm dấu vân tay thiết bị khi có', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'u1' }] })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
    await claimReferral('u2', 'ABC123', 'a'.repeat(64))
    expect((query.mock.calls[1]?.[1] as unknown[])[2]).toBe('a'.repeat(64))
  })
})

describe('rewardReferralIfEligible', () => {
  it('CHƯA xác thực email → không thưởng ai cả', async () => {
    query.mockResolvedValueOnce({ rows: [{ email_verified: null }] })
    await rewardReferralIfEligible('u2')
    expect(granted.calls).toEqual([])
  })

  it('không có lời mời nào → không thưởng', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ email_verified: new Date() }] })
      .mockResolvedValueOnce({ rows: [] })
    await rewardReferralIfEligible('u2')
    expect(granted.calls).toEqual([])
  })

  it('đủ điều kiện → thưởng CẢ HAI bên', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ email_verified: new Date() }] })
      .mockResolvedValueOnce({ rows: [{ referrer_id: 'u1', device_hash: null }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] })
    await rewardReferralIfEligible('u2')
    expect(granted.calls.map((c) => c.userId).sort()).toEqual(['u1', 'u2'])
  })

  it('thiết bị đã được thưởng lượt khác → KHÔNG thưởng (nhưng không khoá tài khoản)', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ email_verified: new Date() }] })
      .mockResolvedValueOnce({ rows: [{ referrer_id: 'u1', device_hash: 'd1' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] }) // thiết bị d1 đã có lượt thưởng
    await rewardReferralIfEligible('u2')
    expect(granted.calls).toEqual([])
  })

  it('vượt trần: người ĐƯỢC MỜI vẫn được thưởng, người MỜI thì không', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ email_verified: new Date() }] })
      .mockResolvedValueOnce({ rows: [{ referrer_id: 'u1', device_hash: null }] })
      .mockResolvedValueOnce({ rows: [{ count: String(MAX_REWARDED_REFERRALS + 5) }] })
    await rewardReferralIfEligible('u2')
    expect(granted.calls.map((c) => c.userId)).toEqual(['u2'])
  })

  it('lỗi DB không được ném ra ngoài (không làm hỏng việc lưu bài học)', async () => {
    query.mockRejectedValueOnce(new Error('db down'))
    await expect(rewardReferralIfEligible('u2')).resolves.toBeUndefined()
  })
})

describe('claimReferral — hàng rào DB (check_violation)', () => {
  it('DB ném lỗi check_violation (23514) → coi như tự mời chính mình', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'u1' }] })
      .mockRejectedValueOnce(Object.assign(new Error('check violation'), { code: '23514' }))
    expect(await claimReferral('u2', 'ABC123')).toEqual({ ok: false, reason: 'self_invite' })
  })

  it('DB ném lỗi khác (không phải 23514) → ném ra ngoài', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'u1' }] }).mockRejectedValueOnce(new Error('lỗi lạ'))
    await expect(claimReferral('u2', 'ABC123')).rejects.toThrow('lỗi lạ')
  })
})

describe('ensureReferralCode', () => {
  it('user đã có mã → trả về luôn, không sinh mới', async () => {
    query.mockResolvedValueOnce({ rows: [{ referral_code: 'ABCDEF' }] })
    expect(await ensureReferralCode('u1')).toBe('ABCDEF')
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('chưa có mã → sinh mới và ghi thành công', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ referral_code: null }] })
      .mockResolvedValueOnce({ rows: [{ referral_code: 'XYZ123' }] })
    const code = await ensureReferralCode('u1')
    expect(code).toBe('XYZ123')
  })

  it('mã đầu trùng (unique_violation) → thử mã khác rồi thành công', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ referral_code: null }] })
      .mockRejectedValueOnce(Object.assign(new Error('trùng'), { code: '23505' }))
      .mockResolvedValueOnce({ rows: [{ referral_code: 'RETRY1' }] })
    const code = await ensureReferralCode('u1')
    expect(code).toBe('RETRY1')
  })

  it('insert không trả dòng (request song song vừa ghi) → đọc lại thấy mã đã có', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ referral_code: null }] })
      .mockResolvedValueOnce({ rows: [] }) // insert không update được dòng nào
      .mockResolvedValueOnce({ rows: [{ referral_code: 'RACE01' }] }) // đọc lại
    const code = await ensureReferralCode('u1')
    expect(code).toBe('RACE01')
  })

  it('lỗi khác unique_violation khi insert → ném ra ngoài', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ referral_code: null }] })
      .mockRejectedValueOnce(new Error('lỗi lạ'))
    await expect(ensureReferralCode('u1')).rejects.toThrow('lỗi lạ')
  })

  it('trùng mã liên tục vượt quá số lần thử tối đa → ném lỗi', async () => {
    query.mockResolvedValueOnce({ rows: [{ referral_code: null }] })
    // Mọi lần insert đều đụng unique_violation.
    query.mockRejectedValue(Object.assign(new Error('trùng'), { code: '23505' }))
    await expect(ensureReferralCode('u1')).rejects.toThrow(
      'Không sinh được mã mời sau nhiều lần thử',
    )
  })
})

describe('getReferralStats', () => {
  it('trả về đủ thống kê: mã, số đã thưởng, số đang chờ, trần, số ngày thưởng', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ referral_code: 'ABCDEF' }] }) // ensureReferralCode
      .mockResolvedValueOnce({ rows: [{ rewarded: '3', pending: '2' }] })
    const stats = await getReferralStats('u1')
    expect(stats).toEqual({
      code: 'ABCDEF',
      rewardedCount: 3,
      pendingCount: 2,
      maxRewarded: MAX_REWARDED_REFERRALS,
      rewardDays: REFERRAL_REWARD_DAYS,
    })
  })
})
