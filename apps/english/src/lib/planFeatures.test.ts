import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('planFeatures — ma trận tính năng theo gói', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('chưa có cache localStorage → dùng mặc định (flags rỗng)', async () => {
    const { getPlanFeatureMatrix, isFeatureEnabled } = await import('./planFeatures')
    expect(getPlanFeatureMatrix().flags).toEqual({})
    // fail-open: chưa có dữ liệu → coi như bật
    expect(isFeatureEnabled('free', 'chat')).toBe(true)
  })

  it('có cache localStorage hợp lệ → hydrate ngay lúc import', async () => {
    localStorage.setItem(
      'plan_features_cache',
      JSON.stringify({
        catalog: [{ key: 'chat', label: 'Chat', description: null, sortOrder: 0 }],
        flags: { chat: { free: false, pro: true, vip: true } },
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    )
    const { getPlanFeatureMatrix, isFeatureEnabled } = await import('./planFeatures')
    expect(getPlanFeatureMatrix().updatedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(isFeatureEnabled('free', 'chat')).toBe(false)
    expect(isFeatureEnabled('pro', 'chat')).toBe(true)
  })

  it('cache localStorage hỏng (JSON lỗi) → không sập, dùng mặc định', async () => {
    localStorage.setItem('plan_features_cache', '{broken json')
    const { getPlanFeatureMatrix } = await import('./planFeatures')
    expect(getPlanFeatureMatrix().flags).toEqual({})
  })

  it('cache thiếu field flags/updatedAt → coi như không hợp lệ, dùng mặc định', async () => {
    localStorage.setItem('plan_features_cache', JSON.stringify({ catalog: [] }))
    const { getPlanFeatureMatrix } = await import('./planFeatures')
    expect(getPlanFeatureMatrix().flags).toEqual({})
  })

  it('refreshPlanFeatures thành công → cập nhật current + lưu cache mới', async () => {
    const { refreshPlanFeatures, getPlanFeatureMatrix } = await import('./planFeatures')
    const newData = {
      catalog: [],
      flags: { speaking: { free: true, pro: true, vip: true } },
      updatedAt: '2026-02-02T00:00:00.000Z',
    }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => newData,
    } as Response)
    await refreshPlanFeatures()
    expect(getPlanFeatureMatrix()).toEqual(newData)
    expect(JSON.parse(localStorage.getItem('plan_features_cache')!)).toEqual(newData)
  })

  it('refreshPlanFeatures nhận 304 Not Modified → giữ nguyên dữ liệu cũ', async () => {
    const { refreshPlanFeatures, getPlanFeatureMatrix } = await import('./planFeatures')
    const before = getPlanFeatureMatrix()
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 304 } as Response)
    await refreshPlanFeatures()
    expect(getPlanFeatureMatrix()).toEqual(before)
  })

  it('refreshPlanFeatures HTTP lỗi → giữ nguyên dữ liệu cũ, không throw', async () => {
    const { refreshPlanFeatures, getPlanFeatureMatrix } = await import('./planFeatures')
    const before = getPlanFeatureMatrix()
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response)
    await expect(refreshPlanFeatures()).resolves.toBeUndefined()
    expect(getPlanFeatureMatrix()).toEqual(before)
  })

  it('refreshPlanFeatures mất mạng (fetch reject) → không throw, giữ dữ liệu cũ', async () => {
    const { refreshPlanFeatures, getPlanFeatureMatrix } = await import('./planFeatures')
    const before = getPlanFeatureMatrix()
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    await expect(refreshPlanFeatures()).resolves.toBeUndefined()
    expect(getPlanFeatureMatrix()).toEqual(before)
  })
})
