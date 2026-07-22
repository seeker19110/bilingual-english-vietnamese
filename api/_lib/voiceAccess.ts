// api/_lib/voiceAccess.ts — Gói nào được dùng giọng nào (server = nguồn sự thật, không tin
// client). PHẢI khớp tay với src/lib/voiceTiers.ts (dự án không share code giữa api/ và
// src/ — 2 tsconfig riêng).
import { VOICE_IDS, DEFAULT_VOICE, DEFAULT_SEED_VOICE_IDS, type VoiceId } from './googleTts'
import { ELEVEN_VOICE_IDS, type ElevenVoiceId } from './elevenLabsTts'
import type { Plan } from './plan'
import { effectivePlan } from './promo'

// Gộp 2 nguồn giọng: Chirp3-HD (Google) + giọng đặc biệt ElevenLabs.
export type AnyVoiceId = VoiceId | ElevenVoiceId

// Gói Pro trùng đúng 8 giọng đã seed sẵn (nhanh, DEFAULT_SEED_VOICE_IDS) — VIP mở thêm 6
// giọng Google còn lại + giọng ElevenLabs riêng (tạo động lúc chọn, chi phí cao hơn).
const VOICE_TIERS: Record<Plan, AnyVoiceId[]> = {
  free: ['Kore', 'Puck'],
  pro: DEFAULT_SEED_VOICE_IDS,
  vip: [...VOICE_IDS, ...ELEVEN_VOICE_IDS],
}

async function getAllowedVoices(plan: Plan, now: Date): Promise<AnyVoiceId[]> {
  return VOICE_TIERS[await effectivePlan(plan, now)]
}

// Trả về đúng voice nếu user được phép dùng; nếu không (bị hạ gói / hết khuyến mãi / cố tình
// gửi voice ngoài quyền) → âm thầm hạ về DEFAULT_VOICE thay vì lỗi cứng, giữ trải nghiệm mượt
// (giống cách app fail-open ở usage.ts) — UI phía client đã tự ẩn lựa chọn ngoài quyền rồi,
// nên nhánh này chỉ chặn trường hợp cố tình gọi thẳng API.
export async function clampVoiceToPlan(
  voice: AnyVoiceId,
  plan: Plan,
  now: Date = new Date(),
): Promise<AnyVoiceId> {
  const allowed = await getAllowedVoices(plan, now)
  return allowed.includes(voice) ? voice : DEFAULT_VOICE
}
