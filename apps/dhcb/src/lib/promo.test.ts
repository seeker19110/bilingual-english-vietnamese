import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAppSettings } from './appSettings'
import { isFullAccessPromoActive, effectivePlan } from './promo'
import { getAllowedVoices } from './voiceTiers'

vi.mock('./appSettings.js', () => ({ getAppSettings: vi.fn() }))
const mockedGetAppSettings = vi.mocked(getAppSettings)

// Cấu hình tối thiểu cho test — chỉ promoUntil ảnh hưởng tới các hàm ở đây.
function settingsWith(promoUntil: string | null) {
  return {
    limits: {} as ReturnType<typeof getAppSettings>['limits'],
    promoUntil,
    leaderboardEnabled: false,
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

const NOW = new Date('2026-06-01T00:00:00Z')

beforeEach(() => {
  mockedGetAppSettings.mockReset()
})

describe('isFullAccessPromoActive', () => {
  it('promoUntil = null → tắt khuyến mãi', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith(null))
    expect(isFullAccessPromoActive(NOW)).toBe(false)
  })

  it('now TRƯỚC promoUntil → đang khuyến mãi', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith('2026-12-31T23:59:59+07:00'))
    expect(isFullAccessPromoActive(NOW)).toBe(true)
  })

  it('now SAU promoUntil → hết khuyến mãi', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith('2026-01-01T00:00:00Z'))
    expect(isFullAccessPromoActive(NOW)).toBe(false)
  })
})

// Các ca dưới đây PHẢI khớp từng dòng với api/_lib/promo.test.ts — client lệch server thì UI
// mở khoá giọng/hạn mức mà server âm thầm chặn (lỗi đã gặp 2026-07-28).
describe('effectivePlan (phải khớp api/_lib/promo.ts)', () => {
  it('khuyến mãi đang bật → free được nâng lên pro (KHÔNG phải vip)', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith('2099-01-01T00:00:00Z'))
    expect(effectivePlan('free', NOW)).toBe('pro')
  })

  it('khuyến mãi đang bật → pro được nâng lên vip', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith('2099-01-01T00:00:00Z'))
    expect(effectivePlan('pro', NOW)).toBe('vip')
  })

  it('khuyến mãi đang bật → vip giữ nguyên vip', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith('2099-01-01T00:00:00Z'))
    expect(effectivePlan('vip', NOW)).toBe('vip')
  })

  it('khuyến mãi tắt → giữ nguyên gói thật', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith(null))
    expect(effectivePlan('free', NOW)).toBe('free')
    expect(effectivePlan('pro', NOW)).toBe('pro')
    expect(effectivePlan('vip', NOW)).toBe('vip')
  })
})

describe('getAllowedVoices trong lúc khuyến mãi', () => {
  it('free KHÔNG được mở giọng chỉ-VIP (Rachel/Studio) — server sẽ hạ về giọng mặc định', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith('2099-01-01T00:00:00Z'))
    const allowed = getAllowedVoices('free', NOW)
    expect(allowed).not.toContain('Rachel')
    expect(allowed).not.toContain('Studio-O')
    expect(allowed).not.toContain('Studio-Q')
    expect(allowed).toContain('Zephyr') // vẫn được nâng lên đủ 8 giọng của gói Pro
  })

  it('pro được mở toàn bộ giọng VIP', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith('2099-01-01T00:00:00Z'))
    expect(getAllowedVoices('pro', NOW)).toContain('Studio-O')
  })

  it('hết khuyến mãi → free chỉ còn 4 giọng', () => {
    mockedGetAppSettings.mockReturnValue(settingsWith(null))
    expect(getAllowedVoices('free', NOW)).toEqual(['Kore', 'Aoede', 'Puck', 'Charon'])
  })
})
