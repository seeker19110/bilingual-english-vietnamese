import { describe, it, expect, vi, beforeEach } from 'vitest'
import { effectivePlan } from './promo'
import { clampVoiceToPlan } from './voiceAccess'

vi.mock('./promo', () => ({ effectivePlan: vi.fn() }))
const mockedEffectivePlan = vi.mocked(effectivePlan)

beforeEach(() => {
  mockedEffectivePlan.mockReset()
})

describe('clampVoiceToPlan', () => {
  it('free chỉ được Kore/Puck — voice khác bị hạ về DEFAULT_VOICE (Kore)', async () => {
    mockedEffectivePlan.mockResolvedValue('free')
    expect(await clampVoiceToPlan('Aoede', 'free')).toBe('Kore')
    expect(await clampVoiceToPlan('Kore', 'free')).toBe('Kore')
    expect(await clampVoiceToPlan('Puck', 'free')).toBe('Puck')
  })

  it('pro được 8 giọng cụ thể — giọng nằm ngoài (vd Umbriel) vẫn bị hạ về mặc định', async () => {
    mockedEffectivePlan.mockResolvedValue('pro')
    expect(await clampVoiceToPlan('Zephyr', 'pro')).toBe('Zephyr')
    expect(await clampVoiceToPlan('Umbriel', 'pro')).toBe('Kore')
  })

  it('vip được dùng đủ 14 giọng — không giọng nào bị hạ', async () => {
    mockedEffectivePlan.mockResolvedValue('vip')
    expect(await clampVoiceToPlan('Umbriel', 'vip')).toBe('Umbriel')
    expect(await clampVoiceToPlan('Iapetus', 'vip')).toBe('Iapetus')
  })

  it('khuyến mãi đang bật (effectivePlan trả vip dù plan gốc là free) → được dùng đủ 14 giọng', async () => {
    mockedEffectivePlan.mockResolvedValue('vip')
    expect(await clampVoiceToPlan('Umbriel', 'free')).toBe('Umbriel')
  })

  it('giọng ElevenLabs (Rachel) chỉ VIP mới dùng được — free/pro bị hạ về DEFAULT_VOICE', async () => {
    mockedEffectivePlan.mockResolvedValue('free')
    expect(await clampVoiceToPlan('Rachel', 'free')).toBe('Kore')
    mockedEffectivePlan.mockResolvedValue('pro')
    expect(await clampVoiceToPlan('Rachel', 'pro')).toBe('Kore')
  })

  it('vip được dùng giọng ElevenLabs (Rachel), không bị hạ', async () => {
    mockedEffectivePlan.mockResolvedValue('vip')
    expect(await clampVoiceToPlan('Rachel', 'vip')).toBe('Rachel')
  })
})
