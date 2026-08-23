import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(() => ({ Authorization: 'Bearer test-token' })),
}))
vi.mock('./deviceId.js', () => ({
  getDeviceHash: vi.fn(async () => 'device-hash-abc'),
}))

import { getDeviceHash } from './deviceId'
import {
  fetchReferralStats,
  claimPendingReferral,
  buildReferralLink,
  PENDING_REF_CODE_KEY,
} from './referral'

const mockedGetDeviceHash = vi.mocked(getDeviceHash)

beforeEach(() => {
  localStorage.clear()
  mockedGetDeviceHash.mockResolvedValue('device-hash-abc')
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchReferralStats', () => {
  const STATS = { code: 'ABC', rewardedCount: 1, pendingCount: 2, maxRewarded: 5, rewardDays: 3 }

  it('thành công → gọi đúng URL, trả dữ liệu parse', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe('/api/referral')
      return new Response(JSON.stringify(STATS), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const r = await fetchReferralStats()
    expect(r).toEqual(STATS)
  })

  it('HTTP lỗi → trả null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 404 })),
    )
    const r = await fetchReferralStats()
    expect(r).toBeNull()
  })

  it('fetch reject → trả null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    const r = await fetchReferralStats()
    expect(r).toBeNull()
  })
})

describe('claimPendingReferral', () => {
  it('không có mã đang chờ → không gọi fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await claimPendingReferral()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('có mã đang chờ → gửi đúng body kèm deviceHash, rồi xoá khỏi localStorage', async () => {
    localStorage.setItem(PENDING_REF_CODE_KEY, 'MYCODE')
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('/api/referral')
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body as string)).toEqual({
        code: 'MYCODE',
        deviceHash: 'device-hash-abc',
      })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    await claimPendingReferral()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(PENDING_REF_CODE_KEY)).toBeNull()
  })

  it('không lấy được deviceHash (null) → vẫn gửi, không kèm deviceHash', async () => {
    localStorage.setItem(PENDING_REF_CODE_KEY, 'MYCODE')
    mockedGetDeviceHash.mockResolvedValue(null)
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(JSON.parse(init.body as string)).toEqual({ code: 'MYCODE' })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    await claimPendingReferral()
    expect(localStorage.getItem(PENDING_REF_CODE_KEY)).toBeNull()
  })

  it('fetch reject (mất mạng) → nuốt lỗi, vẫn xoá mã đang chờ, không ném lỗi', async () => {
    localStorage.setItem(PENDING_REF_CODE_KEY, 'MYCODE')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    await expect(claimPendingReferral()).resolves.toBeUndefined()
    expect(localStorage.getItem(PENDING_REF_CODE_KEY)).toBeNull()
  })
})

describe('buildReferralLink', () => {
  it('dựng link mời đầy đủ với mã đã encode', () => {
    const link = buildReferralLink('ABC 123')
    expect(link).toContain('/welcome?ref=')
    expect(link).toContain(encodeURIComponent('ABC 123'))
  })
})
