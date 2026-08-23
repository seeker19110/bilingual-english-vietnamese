import { describe, it, expect, vi, beforeEach } from 'vitest'
import { effectivePlan } from '@dhcb/core-billing/promo'
import { clampVoiceToPlan } from './voiceAccess.js'

vi.mock('@dhcb/core-billing/promo', () => ({ effectivePlan: vi.fn() }))
const mockedEffectivePlan = vi.mocked(effectivePlan)

beforeEach(() => {
  mockedEffectivePlan.mockReset()
})

describe('clampVoiceToPlan', () => {
  it('free được đúng 4 giọng (2 nữ Kore/Aoede + 2 nam Puck/Charon)', async () => {
    mockedEffectivePlan.mockResolvedValue('free')
    expect(await clampVoiceToPlan('Kore', 'free')).toBe('Kore')
    expect(await clampVoiceToPlan('Aoede', 'free')).toBe('Aoede')
    expect(await clampVoiceToPlan('Puck', 'free')).toBe('Puck')
    expect(await clampVoiceToPlan('Charon', 'free')).toBe('Charon')
  })

  // 2026-08-10: hạ giọng GIỮ NGUYÊN GIỚI TÍNH (nữ→Kore, nam→Puck). Trước đây mọi trường hợp
  // đều về Kore nên user đang nghe giọng nam mà hết hạn gói bị đổi phắt sang giọng nữ.
  it('free: giọng ngoài 4 giọng đó bị hạ về giọng mặc định CÙNG GIỚI TÍNH', async () => {
    mockedEffectivePlan.mockResolvedValue('free')
    expect(await clampVoiceToPlan('Zephyr', 'free')).toBe('Kore') // nữ → nữ
    expect(await clampVoiceToPlan('Umbriel', 'free')).toBe('Puck') // nam → nam
  })

  it('pro được 8 giọng cụ thể — giọng nằm ngoài (vd Umbriel) vẫn bị hạ về mặc định', async () => {
    mockedEffectivePlan.mockResolvedValue('pro')
    expect(await clampVoiceToPlan('Zephyr', 'pro')).toBe('Zephyr')
    expect(await clampVoiceToPlan('Umbriel', 'pro')).toBe('Puck')
  })

  // Giọng Gemini (đọc truyện) chưa mở khoá → ưu tiên giọng Chirp3-HD CÙNG TÊN trước khi rơi
  // về mặc định, để giữ đúng "chất giọng" nhân vật của thể loại truyện.
  it('giọng Gemini ngoài quyền → hạ về giọng Chirp3-HD cùng tên nếu được phép', async () => {
    mockedEffectivePlan.mockResolvedValue('pro')
    // Pro có Gemini → giữ nguyên
    expect(await clampVoiceToPlan('Gemini-Leda', 'pro')).toBe('Gemini-Leda')
    mockedEffectivePlan.mockResolvedValue('free')
    // Free không có Gemini lẫn Leda → giọng mặc định cùng giới tính (nữ)
    expect(await clampVoiceToPlan('Gemini-Leda', 'free')).toBe('Kore')
    // Free không có Gemini lẫn Orus (nam) → Puck
    expect(await clampVoiceToPlan('Gemini-Orus', 'free')).toBe('Puck')
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

  // Quyết định 2026-07-27: Studio đắt gấp 12 lần Chirp3-HD ($24 vs $2 mỗi triệu ký tự, và
  // KHÔNG có hạn mức miễn phí) → rút khỏi Pro, chỉ còn VIP.
  it('giọng Studio CHỈ VIP — free và pro bị hạ về mặc định cùng giới tính', async () => {
    mockedEffectivePlan.mockResolvedValue('free')
    expect(await clampVoiceToPlan('Studio-O', 'free')).toBe('Kore')
    mockedEffectivePlan.mockResolvedValue('pro')
    expect(await clampVoiceToPlan('Studio-O', 'pro')).toBe('Kore')
    expect(await clampVoiceToPlan('Studio-Q', 'pro')).toBe('Puck') // Studio-Q là giọng NAM
  })

  it('vip dùng được giọng Studio, không bị hạ', async () => {
    mockedEffectivePlan.mockResolvedValue('vip')
    expect(await clampVoiceToPlan('Studio-O', 'vip')).toBe('Studio-O')
    expect(await clampVoiceToPlan('Studio-Q', 'vip')).toBe('Studio-Q')
  })
})
