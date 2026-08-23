import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWeeklyCredit } from './weeklyCredit'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(() => ({ Authorization: 'Bearer fake-token' })),
}))

describe('fetchWeeklyCredit — lượt còn lại của gói Free từ server', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('server trả thành công → parse đúng dữ liệu JSON', async () => {
    const data = { plan: 'free' as const, freeWeeklyCredit: 3, freeWeeklyCap: 10 }
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => data } as Response)
    await expect(fetchWeeklyCredit()).resolves.toEqual(data)
    expect(fetch).toHaveBeenCalledWith(
      '/api/usage-summary',
      expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } }),
    )
  })

  it('gói Pro/VIP → freeWeeklyCredit null vẫn parse đúng', async () => {
    const data = { plan: 'pro' as const, freeWeeklyCredit: null, freeWeeklyCap: 10 }
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => data } as Response)
    await expect(fetchWeeklyCredit()).resolves.toEqual(data)
  })

  it('server trả HTTP lỗi → trả về null (an toàn, coi như hết lượt)', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response)
    await expect(fetchWeeklyCredit()).resolves.toBeNull()
  })

  it('mất mạng (fetch reject) → trả về null, không throw', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    await expect(fetchWeeklyCredit()).resolves.toBeNull()
  })
})
