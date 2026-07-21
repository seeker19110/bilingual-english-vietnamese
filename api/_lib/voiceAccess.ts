// api/_lib/voiceAccess.ts — Gói nào được dùng giọng Chirp3-HD nào (server = nguồn sự thật,
// không tin client). PHẢI khớp tay với src/lib/voiceTiers.ts (dự án không share code
// giữa api/ và src/ — 2 tsconfig riêng).
import { VOICE_IDS, DEFAULT_VOICE, type VoiceId } from './googleTts'
import type { Plan } from './plan'
import { effectivePlan } from './promo'

const VOICE_TIERS: Record<Plan, VoiceId[]> = {
  free: ['Kore', 'Puck'],
  pro: ['Kore', 'Aoede', 'Leda', 'Zephyr', 'Puck', 'Charon', 'Fenrir', 'Orus'],
  vip: VOICE_IDS,
}

function getAllowedVoices(plan: Plan, now: Date): VoiceId[] {
  return VOICE_TIERS[effectivePlan(plan, now)]
}

// Trả về đúng voice nếu user được phép dùng; nếu không (bị hạ gói / hết khuyến mãi / cố tình
// gửi voice ngoài quyền) → âm thầm hạ về DEFAULT_VOICE thay vì lỗi cứng, giữ trải nghiệm mượt
// (giống cách app fail-open ở usage.ts) — UI phía client đã tự ẩn lựa chọn ngoài quyền rồi,
// nên nhánh này chỉ chặn trường hợp cố tình gọi thẳng API.
export function clampVoiceToPlan(voice: VoiceId, plan: Plan, now: Date = new Date()): VoiceId {
  const allowed = getAllowedVoices(plan, now)
  return allowed.includes(voice) ? voice : DEFAULT_VOICE
}
