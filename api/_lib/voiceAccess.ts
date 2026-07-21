// api/_lib/voiceAccess.ts — Gói nào được dùng giọng Chirp3-HD nào (server = nguồn sự thật,
// không tin client). PHẢI khớp tay với src/lib/voiceTiers.ts (dự án không share code
// giữa api/ và src/ — 2 tsconfig riêng).
import { VOICE_IDS, DEFAULT_VOICE, type VoiceId } from './googleTts'
import type { Plan } from './plan'

const VOICE_TIERS: Record<Plan, VoiceId[]> = {
  free: ['Kore', 'Puck'],
  pro: ['Kore', 'Aoede', 'Leda', 'Zephyr', 'Puck', 'Charon', 'Fenrir', 'Orus'],
  vip: VOICE_IDS,
}

// Khuyến mãi: mọi user (kể cả Free) được dùng ĐỦ 14 giọng tới hết ngày 31/12/2026 (giờ VN).
// Sau mốc này, quyền lợi giọng quay về đúng theo gói ở VOICE_TIERS.
export const FREE_PROMO_UNTIL = '2027-01-01T00:00:00+07:00'

function isVoicePromoActive(now: Date): boolean {
  return now.getTime() < new Date(FREE_PROMO_UNTIL).getTime()
}

function getAllowedVoices(plan: Plan, now: Date): VoiceId[] {
  if (isVoicePromoActive(now)) return VOICE_IDS
  return VOICE_TIERS[plan]
}

// Trả về đúng voice nếu user được phép dùng; nếu không (bị hạ gói / hết khuyến mãi / cố tình
// gửi voice ngoài quyền) → âm thầm hạ về DEFAULT_VOICE thay vì lỗi cứng, giữ trải nghiệm mượt
// (giống cách app fail-open ở usage.ts) — UI phía client đã tự ẩn lựa chọn ngoài quyền rồi,
// nên nhánh này chỉ chặn trường hợp cố tình gọi thẳng API.
export function clampVoiceToPlan(voice: VoiceId, plan: Plan, now: Date = new Date()): VoiceId {
  const allowed = getAllowedVoices(plan, now)
  return allowed.includes(voice) ? voice : DEFAULT_VOICE
}
