import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAppSettings } from './settings'
import { isFullAccessPromoActive, effectivePlan } from './promo'

vi.mock('./settings', () => ({ getAppSettings: vi.fn() }))
const mockedGetAppSettings = vi.mocked(getAppSettings)

function settingsWith(promoUntil: string | null) {
  return {
    limits: {
      free: { chat: 5, writing: 5, speaking: 5, stt: 5, pronounce: 5 },
      pro: { chat: 100, writing: 100, speaking: 100, stt: 100, pronounce: 100 },
      vip: {
        chat: 1_000_000,
        writing: 1_000_000,
        speaking: 1_000_000,
        stt: 1_000_000,
        pronounce: 1_000_000,
      },
    },
    promoUntil,
    aiCircuitBreaker: false,
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
  it('khuyến mãi đang bật → mọi gói (kể cả free) trả về vip', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith('2099-01-01T00:00:00Z'))
    expect(await effectivePlan('free', new Date('2026-06-01'))).toBe('vip')
    expect(await effectivePlan('pro', new Date('2026-06-01'))).toBe('vip')
  })

  it('khuyến mãi tắt → giữ nguyên gói thật', async () => {
    mockedGetAppSettings.mockResolvedValue(settingsWith(null))
    expect(await effectivePlan('free', new Date('2026-06-01'))).toBe('free')
    expect(await effectivePlan('pro', new Date('2026-06-01'))).toBe('pro')
    expect(await effectivePlan('vip', new Date('2026-06-01'))).toBe('vip')
  })
})
