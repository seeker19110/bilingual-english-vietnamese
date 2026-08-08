// src/lib/voiceTiers.ts — Danh sách giọng Chirp3-HD + gói nào được dùng giọng nào.
// PHẢI khớp tay với api/_lib/googleTts.ts (VOICE_IDS) — dự án không share code giữa
// api/ và src/ (2 tsconfig riêng), nên đổi 1 bên phải đổi bên kia.
import type { Plan } from '../types'
import { effectivePlan } from './promo'

export type VoiceId =
  | 'Kore'
  | 'Aoede'
  | 'Leda'
  | 'Zephyr'
  | 'Autonoe'
  | 'Callirrhoe'
  | 'Vindemiatrix'
  | 'Puck'
  | 'Charon'
  | 'Fenrir'
  | 'Orus'
  | 'Algieba'
  | 'Iapetus'
  | 'Umbriel'
  // Giọng ElevenLabs riêng, chỉ VIP — khác hẳn 14 giọng Chirp3-HD (Google) ở trên,
  // xem api/_lib/elevenLabsTts.ts.
  | 'Rachel'
  // Giọng "Studio" cao cấp (Pro/VIP) — vẫn là Google Cloud TTS như Chirp3-HD, nhưng
  // CHỈ có cho tiếng Anh (en-US) — Google không có Studio cho tiếng Việt. Xem
  // STUDIO_VOICE_IDS bên dưới + STUDIO_TO_CHIRP_FALLBACK trong lib/tts.ts (đổi về
  // giọng Chirp3-HD cùng giới tính nếu lỡ dùng cho câu tiếng Việt) + api/_lib/googleTts.ts.
  | 'Studio-O'
  | 'Studio-Q'
  // Giọng Gemini (native audio) — CHỈ dùng cho trang đọc truyện (StoryReader.tsx qua
  // getStoryVoice()), mỗi thể loại truyện 1 giọng cố định kèm phong cách đọc riêng. Khác
  // hẳn engine Chirp3-HD dù trùng tên nhân vật thần thoại — xem packages/core-ai/geminiTts.ts.
  | 'Gemini-Leda'
  | 'Gemini-Charon'
  | 'Gemini-Aoede'
  | 'Gemini-Orus'
  | 'Gemini-Puck'
  | 'Gemini-Kore'

export interface VoiceOption {
  id: VoiceId
  gender: 'female' | 'male'
}

// Thứ tự cố định: 7 giọng nữ trước, 7 giọng nam sau.
export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'Kore', gender: 'female' },
  { id: 'Aoede', gender: 'female' },
  { id: 'Leda', gender: 'female' },
  { id: 'Zephyr', gender: 'female' },
  { id: 'Autonoe', gender: 'female' },
  { id: 'Callirrhoe', gender: 'female' },
  { id: 'Vindemiatrix', gender: 'female' },
  { id: 'Puck', gender: 'male' },
  { id: 'Charon', gender: 'male' },
  { id: 'Fenrir', gender: 'male' },
  { id: 'Orus', gender: 'male' },
  { id: 'Algieba', gender: 'male' },
  { id: 'Iapetus', gender: 'male' },
  { id: 'Umbriel', gender: 'male' },
  // Giọng ElevenLabs riêng — chỉ mở cho VIP (xem VOICE_TIERS bên dưới), không nằm trong
  // DEFAULT_SEED_VOICE_IDS nên luôn tạo động ở lần phát đầu tiên (chậm hơn 1 chút).
  { id: 'Rachel', gender: 'female' },
  // Giọng Studio cao cấp (Pro/VIP) — CHỈ tiếng Anh, xem ghi chú ở VoiceId union phía trên.
  // Không nằm trong DEFAULT_SEED_VOICE_IDS → tạo động ở lần phát đầu tiên (chậm hơn 1 chút).
  { id: 'Studio-O', gender: 'female' },
  { id: 'Studio-Q', gender: 'male' },
]

// Giọng riêng ElevenLabs (khác nhóm Chirp3-HD/Google phía trên) — dùng để UI có thể gắn
// nhãn/badge riêng nếu cần (hiện tại chỉ 1 giọng thử nghiệm).
export const ELEVEN_VOICE_IDS: VoiceId[] = ['Rachel']

// Giọng Studio (Google Cloud TTS cao cấp, CHỈ tiếng Anh) — dùng để UI gắn badge riêng +
// lib/tts.ts biết đường fallback về Chirp3-HD khi phát nội dung tiếng Việt.
export const STUDIO_VOICE_IDS: VoiceId[] = ['Studio-O', 'Studio-Q']

// Giọng Gemini — KHÔNG nằm trong VOICE_OPTIONS/VOICE_IDS (không phải lựa chọn tự do trong
// VoicePicker), chỉ StoryReader.tsx gán trực tiếp theo thể loại truyện (xem lib/stories.ts).
export const GEMINI_VOICE_IDS: VoiceId[] = [
  'Gemini-Leda',
  'Gemini-Charon',
  'Gemini-Aoede',
  'Gemini-Orus',
  'Gemini-Puck',
  'Gemini-Kore',
]

export const VOICE_IDS: VoiceId[] = VOICE_OPTIONS.map((v) => v.id)
export const DEFAULT_VOICE: VoiceId = 'Kore'
export const DEFAULT_MALE_VOICE: VoiceId = 'Puck'

export function isValidVoiceId(value: string): value is VoiceId {
  return (VOICE_IDS as string[]).includes(value)
}

// 4 giọng nữ + 4 giọng nam PHỔ BIẾN NHẤT, phong cách khác nhau — seed sẵn TRƯỚC (script
// seed-all.ts/seed-pronunciations.ts, PHẢI khớp tay với DEFAULT_SEED_VOICE_IDS trong
// api/_lib/googleTts.ts) nên phát ngay lập tức; hiện TRƯỚC cho người dùng chọn/xoay vòng
// (VoicePicker.tsx, WordVoiceCycleButton.tsx). 6 giọng còn lại vẫn dùng được bình thường,
// chỉ tự tạo audio (chậm hơn 1 chút) ở lần phát đầu khi người dùng CHỦ ĐỘNG chọn.
export const DEFAULT_SEED_VOICE_IDS: VoiceId[] = [
  'Kore',
  'Aoede',
  'Leda',
  'Zephyr',
  'Puck',
  'Charon',
  'Fenrir',
  'Orus',
]

// Gói nào được dùng giọng nào NGOÀI thời gian khuyến mãi.
// PHẢI KHỚP TAY với VOICE_TIERS trong api/_lib/voiceAccess.ts (server là nguồn sự thật —
// lệch nhau thì UI cho chọn giọng mà server âm thầm hạ về DEFAULT_VOICE).
//
// Free: 4 giọng (2 nữ Kore/Aoede + 2 nam Puck/Charon), đều đã seed sẵn nên phát ngay.
// Pro: đúng 8 giọng đã seed sẵn.
// VIP: tất cả (14 Chirp3-HD + ElevenLabs + 2 Studio) — VOICE_IDS liệt kê đủ.
//
// Quyết định 2026-07-27: giọng Studio chuyển từ Pro/VIP sang CHỈ VIP (chi phí Studio
// $24/1 triệu ký tự và không có hạn mức miễn phí, đắt gấp 12 lần Chirp3-HD $2).
const VOICE_TIERS: Record<Plan, VoiceId[]> = {
  free: ['Kore', 'Aoede', 'Puck', 'Charon'],
  pro: [...DEFAULT_SEED_VOICE_IDS],
  vip: VOICE_IDS,
}

// Đang trong giai đoạn khuyến mãi ra mắt hay không — xem src/lib/promo.ts.
export { isFullAccessPromoActive as isVoicePromoActive } from './promo'

// Danh sách giọng user THỰC SỰ được chọn ngay bây giờ (đã áp khuyến mãi nếu còn hiệu lực).
export function getAllowedVoices(plan: Plan, now: Date = new Date()): VoiceId[] {
  return VOICE_TIERS[effectivePlan(plan, now)]
}

// Chọn NGẪU NHIÊN 1 giọng thuộc đúng giới tính, chỉ trong số giọng gói hiện tại được dùng
// (server sẽ clamp về giọng hợp lệ nếu client lỡ gửi giọng ngoài quyền — xem
// api/_lib/voiceAccess.ts — nhưng random ngay trong danh sách allowed để UI hiển thị đúng
// giọng thực sự phát ra). Dùng cho màn hội thoại 2 nhân vật (DialogueView/LessonView) để mỗi
// lần mở nghe được giọng khác nhau, giúp người dùng thử nhiều giọng rồi chọn giọng ưng ý làm
// mặc định (setVoicePref) thay vì luôn cố định 1 giọng như trước.
export function pickRandomVoice(
  gender: 'female' | 'male',
  plan: Plan,
  now: Date = new Date(),
): VoiceId {
  const allowed = new Set(getAllowedVoices(plan, now))
  const candidates = VOICE_OPTIONS.filter((v) => v.gender === gender && allowed.has(v.id))
  const pool = candidates.length > 0 ? candidates : VOICE_OPTIONS.filter((v) => v.gender === gender)
  return pool[Math.floor(Math.random() * pool.length)]!.id
}

// ── Cache "giọng gói hiện tại cho phép" ─────────────────────────────────────
// lib/tts.ts (chế độ giọng ngẫu nhiên toàn cục) không biết `plan` thật của user — chỉ
// AuthProvider mới biết sau khi đăng nhập. Nên AuthProvider ghi cache này mỗi khi có user,
// còn tts.ts chỉ ĐỌC để random trong đúng phạm vi gói, tránh random ra giọng rồi bị server
// clamp âm thầm về DEFAULT_VOICE (clampVoiceToPlan, api/_lib/voiceAccess.ts).
const ALLOWED_CACHE_KEY = 'voice_allowed_cache'
// Gói Free — an toàn trước khi có cache. PHẢI khớp VOICE_TIERS.free ở trên.
const SAFE_DEFAULT_ALLOWED: VoiceId[] = ['Kore', 'Aoede', 'Puck', 'Charon']

export function cacheAllowedVoices(plan: Plan, now: Date = new Date()): void {
  localStorage.setItem(ALLOWED_CACHE_KEY, JSON.stringify(getAllowedVoices(plan, now)))
}

export function getCachedAllowedVoices(): VoiceId[] {
  try {
    const raw = localStorage.getItem(ALLOWED_CACHE_KEY)
    if (!raw) return SAFE_DEFAULT_ALLOWED
    const arr: unknown = JSON.parse(raw)
    return Array.isArray(arr) && arr.every((v) => isValidVoiceId(String(v)))
      ? (arr as VoiceId[])
      : SAFE_DEFAULT_ALLOWED
  } catch {
    return SAFE_DEFAULT_ALLOWED
  }
}

// Bốc NGẪU NHIÊN 1 giọng trong số giọng gói hiện tại cho phép, TRỘN CẢ NAM LẪN NỮ (khác
// pickRandomVoice() ở trên — hàm đó random NHƯNG giữ cố định 1 giới tính). Dùng cho nút loa
// Từ điển/flashcard (PronounceButton, WordVoiceCycleButton) khi bật chế độ "mỗi lần bấm 1
// giọng khác" (quyết định 2026-07-29).
//
// LOẠI giọng ElevenLabs khỏi bể random: 2 nút này gọi /api/pronunciation (tra 1 từ), endpoint
// đó KHÔNG hỗ trợ ElevenLabs (chỉ dành cho câu/đoạn ở /api/tts — xem api/pronunciation.ts).
// Nếu random ra Rachel, request sẽ bị server trả 400 rồi âm thầm fallback Web Speech (giọng
// trình duyệt chất lượng thấp hơn) — bug thật đã gặp với user gói VIP.
// LOẠI giọng Studio khi đọc nội dung KHÔNG phải tiếng Anh: Google không có giọng Studio cho
// vi-VN, server sẽ hạ Studio-O→Kore / Studio-Q→Puck (api/pronunciation.ts). Nếu vẫn để Studio
// trong bể random ở chiều B thì Kore/Puck bị trúng gấp đôi (lệch xác suất, cảm giác "không
// random") và mất thêm 1 lượt gọi API vô ích.
//
// TRÁNH LẶP giọng vừa phát (`exclude`): random đều có thể bốc lại đúng giọng cũ — gói Free chỉ
// 4 giọng nên 25% lần bấm nghe y hệt, khiến người dùng tưởng random không chạy. Chỉ loại khi
// bể còn ≥ 2 giọng (không thì không còn gì để bốc).
const ALLOWED_VOICE_POOL_EXCLUDING_ELEVEN = VOICE_IDS.filter((v) => !ELEVEN_VOICE_IDS.includes(v))
export function pickRandomAllowedVoice(
  options: {
    lang?: 'en-US' | 'vi-VN'
    exclude?: VoiceId
  } = {},
): VoiceId {
  const { lang = 'en-US', exclude } = options
  const eleven = new Set(ELEVEN_VOICE_IDS)
  const studio = new Set(STUDIO_VOICE_IDS)
  const usable = (v: VoiceId) => !eleven.has(v) && (lang === 'en-US' || !studio.has(v))
  const allowed = getCachedAllowedVoices().filter(usable)
  const basePool = allowed.length > 0 ? allowed : ALLOWED_VOICE_POOL_EXCLUDING_ELEVEN.filter(usable)
  const withoutCurrent = basePool.filter((v) => v !== exclude)
  const pool = withoutCurrent.length > 0 ? withoutCurrent : basePool
  return pool[Math.floor(Math.random() * pool.length)]!
}

// Danh sách giọng cần NẠP TRƯỚC cho chế độ offline: TẤT CẢ giọng gói hiện tại được phép
// dùng (Free 4 · Pro 8 · VIP 17), lọc theo ngôn ngữ sẽ đọc. Khác pickRandomAllowedVoice():
// hàm đó bốc 1 giọng cho nút loa (/api/pronunciation, không hỗ trợ ElevenLabs), còn preload
// đi qua /api/tts nên GIỮ luôn ElevenLabs. Studio chỉ có tiếng Anh nên loại khi lang khác.
// Lý do phải nạp mọi giọng: khoá cache audio gồm cả voice — chế độ "giọng ngẫu nhiên" bốc
// giọng mới mỗi phiên/tab, nên chỉ nạp 1 giọng thì lần offline sau gần như chắc chắn trượt
// cache và không nghe được gì (đúng lỗi "tải trước không hoạt động").
export function getPreloadVoices(lang: 'en-US' | 'vi-VN' = 'en-US'): VoiceId[] {
  const studio = new Set(STUDIO_VOICE_IDS)
  const allowed = getCachedAllowedVoices().filter((v) => lang === 'en-US' || !studio.has(v))
  return allowed.length > 0 ? allowed : SAFE_DEFAULT_ALLOWED
}

// Server (/api/pronunciation) có thể HẠ giọng ĐOÁN (guessedVoice) xuống giọng khác nếu ngoài
// quyền gói hiện tại (clampVoiceToPlan, api/_lib/voiceAccess.ts) — trả kèm `voice` THẬT SỰ đã
// dùng trong response. PronounceButton/WordVoiceCycleButton PHẢI cache audio theo giọng THẬT
// này, không phải giọng đoán — nếu không, lần random trúng lại đúng giọng đoán cũ sẽ đọc nhầm
// cache và phát audio của giọng đã bị hạ trước đó dưới nhãn giọng đoán, khiến người dùng luôn
// nghe 1 giọng cố định dù bốc ngẫu nhiên (bug thật đã gặp, xem PROGRESS.md).
export function resolveActualVoice(
  guessedVoice: VoiceId,
  serverVoice: string | undefined,
): VoiceId {
  return serverVoice && isValidVoiceId(serverVoice) ? serverVoice : guessedVoice
}
