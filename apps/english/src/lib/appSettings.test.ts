import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

import { getAppSettings, getLimits, isLeaderboardEnabled, refreshAppSettings } from './appSettings'
import { LIMITS as DEFAULT_LIMITS } from '../types'

const CACHE_KEY = 'app_settings_cache'

describe('appSettings — cache localStorage + refresh từ server', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('chưa có cache → dùng DEFAULT_LIMITS, promoUntil null, leaderboard tắt', () => {
    expect(getAppSettings().promoUntil).toBeNull()
    expect(isLeaderboardEnabled()).toBe(false)
    expect(getLimits()).toEqual(DEFAULT_LIMITS)
  })

  it('refreshAppSettings: fetch OK → cập nhật current + ghi localStorage', async () => {
    const newSettings = {
      limits: DEFAULT_LIMITS,
      promoUntil: '2026-12-31T00:00:00.000Z',
      leaderboardEnabled: true,
      updatedAt: '2026-08-01T00:00:00.000Z',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => newSettings,
      }),
    )
    await refreshAppSettings()
    expect(getAppSettings().promoUntil).toBe('2026-12-31T00:00:00.000Z')
    expect(isLeaderboardEnabled()).toBe(true)
    expect(JSON.parse(localStorage.getItem(CACHE_KEY)!)).toEqual(newSettings)
  })

  it('refreshAppSettings: server trả 304 → giữ nguyên cache, không parse json', async () => {
    const jsonSpy = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 304, ok: false, json: jsonSpy }))
    const before = getAppSettings()
    await refreshAppSettings()
    expect(jsonSpy).not.toHaveBeenCalled()
    expect(getAppSettings()).toEqual(before)
  })

  it('refreshAppSettings: server lỗi (not ok, không phải 304) → bỏ qua êm', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 500, ok: false, json: async () => ({}) }),
    )
    const before = getAppSettings()
    await refreshAppSettings()
    expect(getAppSettings()).toEqual(before)
  })

  it('refreshAppSettings: fetch ném lỗi mạng → bắt lỗi, không crash', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    await expect(refreshAppSettings()).resolves.toBeUndefined()
  })
})

// loadFromLocalStorage() chỉ chạy 1 LẦN lúc import module (khởi tạo biến `current`),
// nên phải reset module + import lại để phủ các nhánh đọc cache lúc khởi động.
describe('appSettings — khởi tạo `current` từ cache localStorage lúc load module', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('cache hợp lệ (có limits + updatedAt) → dùng luôn, bù mặc định promoUntil/leaderboard', async () => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ limits: DEFAULT_LIMITS, updatedAt: '2026-01-01T00:00:00.000Z' }),
    )
    const mod = await import('./appSettings')
    expect(mod.getAppSettings().updatedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(mod.getAppSettings().promoUntil).toBeNull()
    expect(mod.isLeaderboardEnabled()).toBe(false)
  })

  it('cache thiếu limits → coi như không có cache, dùng DEFAULT_SETTINGS', async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ updatedAt: '2026-01-01T00:00:00.000Z' }))
    const mod = await import('./appSettings')
    expect(mod.getLimits()).toEqual(DEFAULT_LIMITS)
  })

  it('cache là JSON hỏng → bắt lỗi, dùng DEFAULT_SETTINGS', async () => {
    localStorage.setItem(CACHE_KEY, '{bad json')
    const mod = await import('./appSettings')
    expect(mod.getLimits()).toEqual(DEFAULT_LIMITS)
  })
})
