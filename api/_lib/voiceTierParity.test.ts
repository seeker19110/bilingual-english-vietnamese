// Gác tự động cho quy ước "PHẢI khớp tay" giữa 2 bảng phân quyền giọng:
//   - apps/english/src/lib/voiceTiers.ts  (client — quyết định UI cho chọn giọng nào)
//   - api/_lib/voiceAccess.ts             (server — nguồn sự thật, tự hạ giọng ngoài quyền)
// Lệch nhau thì UI cho chọn giọng mà server âm thầm hạ về giọng khác (lỗi thật đã gặp).
// Dự án không share code giữa api/ và src/ (2 tsconfig riêng) nên chỉ có test mới bắt được.
import { describe, it, expect } from 'vitest'
import { VOICE_TIERS as CLIENT_TIERS } from '../../apps/english/src/lib/voiceTiers'
import { VOICE_TIERS as SERVER_TIERS } from '@dhcb/core-ai/voiceAccess'
import { GEMINI_VOICE_IDS } from '@dhcb/core-ai/geminiTts'
import {
  ELEVEN_VOICE_IDS as SERVER_ELEVEN_IDS,
  isValidElevenVoice,
} from '@dhcb/core-ai/elevenLabsTts'
import { ELEVEN_VOICE_IDS as CLIENT_ELEVEN_IDS } from '../../apps/english/src/lib/voiceTiers'
import type { Plan } from '@dhcb/core-billing/plan'

const PLANS: Plan[] = ['free', 'pro', 'vip']

const geminiIds = new Set<string>(GEMINI_VOICE_IDS)

describe('bảng phân quyền giọng client ↔ server', () => {
  it.each(PLANS)('gói %s có cùng danh sách giọng', (plan) => {
    expect([...SERVER_TIERS[plan]].sort()).toEqual([...CLIENT_TIERS[plan]].sort())
  })

  // Giọng Gemini (đọc truyện) không hiện trong VoicePicker — mọi nơi chọn giọng lọc theo
  // VOICE_OPTIONS. Chúng có mặt trong bảng tier chỉ để client biết gói nào được giữ giọng
  // Gemini, gói nào phải hạ (getStoryVoice) — cùng quy tắc với server.
  it('giọng Gemini mở cho pro + vip, không mở cho free (cả 2 phía)', () => {
    for (const tiers of [CLIENT_TIERS, SERVER_TIERS]) {
      expect(tiers.free.some((v) => geminiIds.has(v))).toBe(false)
      expect(tiers.pro.filter((v) => geminiIds.has(v))).toHaveLength(geminiIds.size)
      expect(tiers.vip.filter((v) => geminiIds.has(v))).toHaveLength(geminiIds.size)
    }
  })

  // Audit 2026-08-12: scripts/seed-all.ts (--verify --clean-orphans) BẢO VỆ dòng tts_cache có
  // giọng ElevenLabs khỏi bị xoá nhầm, và nó nhận diện bằng isValidElevenVoice() của server.
  // Nếu client thêm một giọng ElevenLabs mới mà server không biết, giọng đó vừa không được
  // bảo vệ (cache bị xoá, phải trả tiền sinh lại) vừa lệch phân quyền. Danh sách 2 phía phải khớp.
  it('danh sách giọng ElevenLabs khớp giữa client và server', () => {
    expect([...CLIENT_ELEVEN_IDS].sort()).toEqual([...SERVER_ELEVEN_IDS].sort())
    for (const v of CLIENT_ELEVEN_IDS) expect(isValidElevenVoice(v)).toBe(true)
  })

  it('bảng server có đủ 3 gói và không gói nào rỗng', () => {
    for (const plan of PLANS) expect(SERVER_TIERS[plan].length).toBeGreaterThan(0)
  })
})
