// api/_lib/voiceAccess.ts — Gói nào được dùng giọng nào (server = nguồn sự thật, không tin
// client). PHẢI khớp tay với src/lib/voiceTiers.ts (dự án không share code giữa api/ và
// src/ — 2 tsconfig riêng).
import {
  VOICE_IDS,
  DEFAULT_VOICE,
  DEFAULT_SEED_VOICE_IDS,
  STUDIO_VOICE_IDS,
  type VoiceId,
  type StudioVoiceId,
} from './googleTts.js'
import { ELEVEN_VOICE_IDS, type ElevenVoiceId } from '../../packages/core-ai/elevenLabsTts.js'
import { GEMINI_VOICE_IDS, type GeminiVoiceId } from '../../packages/core-ai/geminiTts.js'
import type { Plan } from '../../packages/core-billing/plan.js'
import { effectivePlan } from '../../packages/core-billing/promo.js'

// Gộp 4 nguồn giọng: Chirp3-HD (Google) + giọng đặc biệt ElevenLabs + giọng Studio
// (Google Cloud TTS cao cấp, chỉ tiếng Anh) + giọng Gemini (CHỈ dùng cho đọc truyện, xem
// packages/core-ai/geminiTts.ts).
export type AnyVoiceId = VoiceId | ElevenVoiceId | StudioVoiceId | GeminiVoiceId

// Free: 4 giọng (2 nữ Kore/Aoede + 2 nam Puck/Charon) — đều nằm trong DEFAULT_SEED_VOICE_IDS
// nên đã seed sẵn, phát ngay, KHÔNG phát sinh chi phí tạo audio động.
// Pro: đúng 8 giọng đã seed sẵn (DEFAULT_SEED_VOICE_IDS).
// VIP: 14 giọng Chirp3-HD + giọng ElevenLabs + 2 giọng Studio.
//
// Quyết định 2026-07-27: giọng Studio chuyển từ Pro/VIP sang CHỈ VIP. Lý do chi phí: Studio
// giá $24/1 triệu ký tự và KHÔNG có hạn mức miễn phí hàng tháng, trong khi Chirp3-HD chỉ $2
// và có 1 triệu ký tự miễn phí — đắt gấp 12 lần. Giữ Studio cho riêng VIP vừa chặn rủi ro chi
// phí ở gói rẻ, vừa tạo lý do thật để nâng cấp lên VIP.
// Giọng Gemini (đọc truyện) mở cho Pro + VIP — cùng bậc với các giọng Chirp3-HD "cao cấp"
// (Leda/Orus...) mà STORY_KIND_VOICE vẫn dùng cho các thể loại đó từ trước, giữ nhất quán:
// gói Free đọc truyện vẫn được (server tự hạ về DEFAULT_VOICE nếu voice ngoài quyền, xem
// clampVoiceToPlan bên dưới), chỉ không có giọng đọc truyền cảm riêng theo thể loại.
const VOICE_TIERS: Record<Plan, AnyVoiceId[]> = {
  free: ['Kore', 'Aoede', 'Puck', 'Charon'],
  pro: [...DEFAULT_SEED_VOICE_IDS, ...GEMINI_VOICE_IDS],
  vip: [...VOICE_IDS, ...ELEVEN_VOICE_IDS, ...STUDIO_VOICE_IDS, ...GEMINI_VOICE_IDS],
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
