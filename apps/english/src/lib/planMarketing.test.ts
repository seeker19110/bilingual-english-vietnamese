import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('planMarketing — nội dung mô tả gói (badge/tagline/bullets)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('chưa có cache và chưa tải được → getPlanMarketing trả về null (dùng nội dung mặc định cứng)', async () => {
    const { getPlanMarketing } = await import('./planMarketing')
    expect(getPlanMarketing()).toBeNull()
  })

  it('có cache localStorage hợp lệ → hydrate ngay, getPlanMarketing trả dữ liệu thật', async () => {
    const data = {
      plans: {
        free: { plan: 'free', badge: '', taglineVi: '', taglineEn: '', bullets: [] },
        pro: {
          plan: 'pro',
          badge: 'Pro',
          taglineVi: 'Nâng cao',
          taglineEn: 'Advanced',
          bullets: [],
        },
        vip: { plan: 'vip', badge: 'VIP', taglineVi: '', taglineEn: '', bullets: [] },
      },
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    localStorage.setItem('plan_marketing_cache', JSON.stringify(data))
    const { getPlanMarketing } = await import('./planMarketing')
    expect(getPlanMarketing()).toEqual(data)
  })

  it('cache JSON hỏng → không sập, coi như chưa có dữ liệu (null)', async () => {
    localStorage.setItem('plan_marketing_cache', '{broken')
    const { getPlanMarketing } = await import('./planMarketing')
    expect(getPlanMarketing()).toBeNull()
  })

  it('cache thiếu field plans/updatedAt → coi như không hợp lệ', async () => {
    localStorage.setItem('plan_marketing_cache', JSON.stringify({ plans: null }))
    const { getPlanMarketing } = await import('./planMarketing')
    expect(getPlanMarketing()).toBeNull()
  })

  it('refreshPlanMarketing thành công → cập nhật current + cache, getPlanMarketing khác null', async () => {
    const { refreshPlanMarketing, getPlanMarketing } = await import('./planMarketing')
    const data = {
      plans: {
        free: { plan: 'free', badge: '', taglineVi: '', taglineEn: '', bullets: [] },
        pro: { plan: 'pro', badge: '', taglineVi: '', taglineEn: '', bullets: [] },
        vip: { plan: 'vip', badge: '', taglineVi: '', taglineEn: '', bullets: [] },
      },
      updatedAt: '2026-03-03T00:00:00.000Z',
    }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => data,
    } as Response)
    await refreshPlanMarketing()
    expect(getPlanMarketing()).toEqual(data)
    expect(JSON.parse(localStorage.getItem('plan_marketing_cache')!)).toEqual(data)
  })

  it('refreshPlanMarketing nhận 304 → giữ nguyên dữ liệu cũ', async () => {
    const { refreshPlanMarketing, getPlanMarketing } = await import('./planMarketing')
    const before = getPlanMarketing()
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 304 } as Response)
    await refreshPlanMarketing()
    expect(getPlanMarketing()).toEqual(before)
  })

  it('refreshPlanMarketing HTTP lỗi → không throw, giữ dữ liệu cũ', async () => {
    const { refreshPlanMarketing, getPlanMarketing } = await import('./planMarketing')
    const before = getPlanMarketing()
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response)
    await expect(refreshPlanMarketing()).resolves.toBeUndefined()
    expect(getPlanMarketing()).toEqual(before)
  })

  it('refreshPlanMarketing mất mạng → không throw, giữ dữ liệu cũ', async () => {
    const { refreshPlanMarketing, getPlanMarketing } = await import('./planMarketing')
    const before = getPlanMarketing()
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    await expect(refreshPlanMarketing()).resolves.toBeUndefined()
    expect(getPlanMarketing()).toEqual(before)
  })
})
