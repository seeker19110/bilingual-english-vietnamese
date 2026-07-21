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

// Gói nào được dùng giọng nào NGOÀI thời gian khuyến mãi (xem FREE_PROMO_UNTIL bên dưới).
// Gói Pro trùng đúng 8 giọng đã seed sẵn (nhanh) — VIP mở thêm 6 giọng còn lại (tạo động).
const VOICE_TIERS: Record<Plan, VoiceId[]> = {
  free: ['Kore', 'Puck'],
  pro: DEFAULT_SEED_VOICE_IDS,
  vip: VOICE_IDS,
}

// Đang trong giai đoạn khuyến mãi ra mắt hay không — xem src/lib/promo.ts.
export { isFullAccessPromoActive as isVoicePromoActive } from './promo'

// Danh sách giọng user THỰC SỰ được chọn ngay bây giờ (đã áp khuyến mãi nếu còn hiệu lực).
export function getAllowedVoices(plan: Plan, now: Date = new Date()): VoiceId[] {
  return VOICE_TIERS[effectivePlan(plan, now)]
}
