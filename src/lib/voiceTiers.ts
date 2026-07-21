// src/lib/voiceTiers.ts — Danh sách giọng Chirp3-HD + gói nào được dùng giọng nào.
// PHẢI khớp tay với api/_lib/googleTts.ts (VOICE_IDS) — dự án không share code giữa
// api/ và src/ (2 tsconfig riêng), nên đổi 1 bên phải đổi bên kia.
import type { Plan } from '../types'

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

// Gói nào được dùng giọng nào NGOÀI thời gian khuyến mãi (xem FREE_PROMO_UNTIL bên dưới).
const VOICE_TIERS: Record<Plan, VoiceId[]> = {
  free: ['Kore', 'Puck'],
  pro: ['Kore', 'Aoede', 'Leda', 'Zephyr', 'Puck', 'Charon', 'Fenrir', 'Orus'],
  vip: VOICE_IDS,
}

// Khuyến mãi: mọi user (kể cả Free) được dùng ĐỦ 14 giọng tới hết ngày 31/12/2026 (giờ VN).
// Sau mốc này, quyền lợi giọng quay về đúng theo gói ở VOICE_TIERS.
export const FREE_PROMO_UNTIL = '2027-01-01T00:00:00+07:00'

export function isVoicePromoActive(now: Date = new Date()): boolean {
  return now.getTime() < new Date(FREE_PROMO_UNTIL).getTime()
}

// Danh sách giọng user THỰC SỰ được chọn ngay bây giờ (đã áp khuyến mãi nếu còn hiệu lực).
export function getAllowedVoices(plan: Plan, now: Date = new Date()): VoiceId[] {
  if (isVoicePromoActive(now)) return VOICE_IDS
  return VOICE_TIERS[plan]
}
