// src/lib/voiceCatalog.ts
// Danh mục các giọng đọc cho tính năng phát âm từ điển — dùng CHUNG cho cả:
//   - Frontend (src/components/PronounceButton.tsx): hiện danh sách lựa chọn giọng.
//   - Backend (api/_lib/googleTts.ts): kiểm tra giọng hợp lệ + map sang tên giọng thật của Google.
// File này KHÔNG chứa thông tin nhạy cảm (không có API key) nên import ở cả 2 phía đều an toàn.
//
// Có 2 nhóm giọng:
//   - Miễn phí (FREE_VOICE_IDS): nữ/nam cơ bản (giọng Journey), ai cũng dùng được.
//   - Cao cấp (PREMIUM_VOICE_IDS): 6 giọng Chirp 3: HD của Google — tự nhiên hơn, nhiều lựa
//     chọn hơn, nhưng đắt hơn (~$30/1 triệu ký tự so với giọng free). Hiện đang KHOÁ
//     (xem PREMIUM_VOICES_ENABLED) vì app chưa có hệ thống gói Pro/thanh toán — chỉ mới
//     chuẩn bị sẵn UI + backend, CHƯA cho dùng thật. Khi làm xong gói Pro, đổi cờ này
//     (hoặc thay bằng kiểm tra "user.plan === 'pro'") để mở cho người dùng đã trả tiền.

export type FreeVoiceId = 'female' | 'male'
export type PremiumVoiceId = 'kore' | 'aoede' | 'leda' | 'puck' | 'charon' | 'fenrir'
export type VoiceId = FreeVoiceId | PremiumVoiceId

export const FREE_VOICE_IDS: FreeVoiceId[] = ['female', 'male']
export const PREMIUM_VOICE_IDS: PremiumVoiceId[] = ['kore', 'aoede', 'leda', 'puck', 'charon', 'fenrir']
export const VOICE_IDS: VoiceId[] = [...FREE_VOICE_IDS, ...PREMIUM_VOICE_IDS]

export const DEFAULT_VOICE: VoiceId = 'female'

// Cờ khoá/mở giọng cao cấp cho NGƯỜI DÙNG CUỐI (qua api/pronunciation.ts).
// false = giọng cao cấp hiện trong UI nhưng bị khoá ("Cần gói Pro"), gọi API cũng bị chặn (403).
// TODO: khi có hệ thống gói Pro thật, thay giá trị cố định này bằng kiểm tra theo user.
export const PREMIUM_VOICES_ENABLED = false

// Tên hiển thị tiếng Việt cho từng giọng — KHÔNG lộ tên giọng thật của Google ra UI/URL.
export const VOICE_LABELS: Record<VoiceId, string> = {
  female: 'Nữ',
  male: 'Nam',
  kore: 'Kore (Nữ)',
  aoede: 'Aoede (Nữ)',
  leda: 'Leda (Nữ)',
  puck: 'Puck (Nam)',
  charon: 'Charon (Nam)',
  fenrir: 'Fenrir (Nam)',
}

export function isValidVoice(value: string): value is VoiceId {
  return (VOICE_IDS as string[]).includes(value)
}

export function isPremiumVoice(voice: VoiceId): voice is PremiumVoiceId {
  return (PREMIUM_VOICE_IDS as string[]).includes(voice)
}
