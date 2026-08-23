import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAppSettings } from '@dhcb/core-db/settings'
import { isFullAccessPromoActive, effectivePlan } from './promo.js'

vi.mock('@dhcb/core-db/settings', () => ({ getAppSettings: vi.fn() }))
const mockedGetAppSettings = vi.mocked(getAppSettings)

function settingsWith(promoUntil: string | null) {
  return {
    limits: { pro: 100, vip: 1_000_000 },
    promoUntil,
    aiCircuitBreaker: false,
    leaderboardEnabled: false,
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

beforeEach(() => {
  mockedGetAppSettings.mockReset()
})

describe('isFullAccessPromoActive', () => {
  it('promoUntil = null → tắt khuyến mãi', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith(null))
    expect(await isFullAccessPromoActive(new Date('2026-06-01'))).toBe(false)
  })

  it('now TRƯỚC promoUntil → đang khuyến mãi', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith('2026-12-31T23:59:59+07:00'))
    expect(await isFullAccessPromoActive(new Date('2026-06-01T00:00:00Z'))).toBe(true)
  })

  it('now SAU promoUntil → hết khuyến mãi', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith('2026-01-01T00:00:00Z'))
    expect(await isFullAccessPromoActive(new Date('2026-06-01T00:00:00Z'))).toBe(false)
  })
})

describe('effectivePlan', () => {
  it('khuyến mãi đang bật → free được nâng lên hạn mức pro (KHÔNG phải vip/không giới hạn)', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith('2099-01-01T00:00:00Z'))
    expect(await effectivePlan('free', new Date('2026-06-01'))).toBe('pro')
  })

  it('khuyến mãi đang bật → pro được nâng lên vip (không giới hạn)', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith('2099-01-01T00:00:00Z'))
    expect(await effectivePlan('pro', new Date('2026-06-01'))).toBe('vip')
  })

  it('khuyến mãi đang bật → vip giữ nguyên vip', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith('2099-01-01T00:00:00Z'))
    expect(await effectivePlan('vip', new Date('2026-06-01'))).toBe('vip')
  })

  it('khuyến mãi tắt → giữ nguyên gói thật', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith(null))
    expect(await effectivePlan('free', new Date('2026-06-01'))).toBe('free')
    expect(await effectivePlan('pro', new Date('2026-06-01'))).toBe('pro')
    expect(await effectivePlan('vip', new Date('2026-06-01'))).toBe('vip')
  })
})
