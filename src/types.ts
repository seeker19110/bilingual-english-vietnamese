export type Plan = 'free' | 'pro'
export type Level = 'beginner' | 'intermediate' | 'advanced'
// A = Người Việt học tiếng Anh | B = Người nước ngoài học tiếng Việt (qua tiếng Anh)
export type Direction = 'A' | 'B'

// Cấp CEFR áp cho TỪNG TỪ vựng (khác CefrLevel['id'] trong src/data/cefr.ts chỉ có A1-B2
// cho lộ trình) — từ điển mở rộng có cả từ nâng cao nên cần thêm C1/C2.
export type CefrWordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

// Cấu trúc 1 mục từ điển — khớp với dữ liệu trong public/data/dictionary/chunk-*.json
export interface DictEntry {
  word: string // từ tiếng Anh
  pos: string // loại từ viết tắt: n, v, adj, adv, prep, conj, pron, interj, art, num
  vi: string // nghĩa tiếng Việt
  ex_en: string // câu ví dụ tiếng Anh
  ex_vi: string // câu ví dụ dịch tiếng Việt
  ipa_en?: string // phiên âm quốc tế tiếng Anh
  ipa_vi?: string // phiên âm quốc tế tiếng Việt
  // Cấp CEFR ƯỚC LƯỢNG bằng AI (scripts/tag-cefr-levels.ts) — không phải mọi từ đều có,
  // và giá trị là ước lượng (chưa qua kiểm tra tay), không phải nguồn CEFR chính thức.
  level?: CefrWordLevel
}

export interface User {
  id: string
  email: string
  name: string
  plan: Plan
  onboarded: boolean
  createdAt: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  // Chỉ có ở tin nhắn assistant trong chế độ nói/chat có JSON
  speechEn?: string
  feedbackVi?: string
  correctedEn?: string
  timestamp: number
}

export interface ChatSession {
  id: string
  userId: string
  situation: string
  level: Level
  messages: Message[]
  createdAt: number
}

export interface WritingSubmission {
  id: string
  userId: string
  essayPrompt: string
  essay: string
  feedback: string | null
  submittedAt: number
}

export interface SpeakingSession {
  id: string
  userId: string
  situation: string
  level: Level
  messages: Message[]
  createdAt: number
}

// Đếm lượt dùng trong ngày (reset mỗi ngày)
export interface DailyUsage {
  date: string // YYYY-MM-DD
  chatCount: number
  writingCount: number
  speakingCount: number
  sttCount: number // số lần nhận diện giọng nói (STT) — đếm riêng vì tốn API riêng
  // Số từ vựng đã học trong ngày (tab Lộ trình / Hôm nay). KHÔNG tốn API, không tính
  // vào giới hạn gói — chỉ để ghi nhận "có học hôm nay" cho chuỗi ngày liên tiếp (streak).
  learnCount?: number
}

// Giới hạn theo gói
export const LIMITS: Record<
  Plan,
  { chat: number; writing: number; speaking: number; stt: number }
> = {
  free: { chat: 15, writing: 3, speaking: 5, stt: 10 },
  pro: { chat: 999, writing: 30, speaking: 60, stt: 100 },
}

// Chiều A: nhãn tiếng Việt | Chiều B: nhãn tiếng Anh
export const SITUATIONS: { value: string; labelA: string; labelB: string }[] = [
  { value: 'job_interview', labelA: 'Phỏng vấn xin việc', labelB: 'Job Interview' },
  { value: 'restaurant', labelA: 'Gọi món tại nhà hàng', labelB: 'Ordering at a Restaurant' },
  { value: 'hotel_travel', labelA: 'Du lịch / khách sạn', labelB: 'Travel / Hotel' },
  { value: 'office_meeting', labelA: 'Họp / thuyết trình', labelB: 'Meeting / Presentation' },
  { value: 'shopping', labelA: 'Mua sắm', labelB: 'Shopping' },
  { value: 'small_talk', labelA: 'Tán gẫu / xã giao', labelB: 'Small Talk' },
  // Bối cảnh sát đời sống Việt Nam — dễ liên hệ, tăng động lực luyện tập
  { value: 'market_vn', labelA: 'Đi chợ / mặc cả', labelB: 'At a Vietnamese Market' },
  { value: 'ride_hailing', labelA: 'Đặt Grab / taxi', labelB: 'Booking a Grab / Taxi' },
  {
    value: 'directions',
    labelA: 'Chỉ đường cho khách Tây',
    labelB: 'Giving Directions to a Tourist',
  },
  { value: 'street_food', labelA: 'Quán ăn vỉa hè / cà phê', labelB: 'Street Food & Coffee' },
  { value: 'free', labelA: 'Tự do — chủ đề bất kỳ', labelB: 'Free Topic' },
]

export const LEVELS: {
  value: Level
  labelA: string
  labelB: string
  descA: string
  descB: string
}[] = [
  {
    value: 'beginner',
    labelA: 'Cơ bản',
    labelB: 'Beginner',
    descA: 'A1–A2, câu đơn giản',
    descB: 'A1–A2, simple sentences',
  },
  {
    value: 'intermediate',
    labelA: 'Trung cấp',
    labelB: 'Intermediate',
    descA: 'B1–B2, giao tiếp thường ngày',
    descB: 'B1–B2, everyday conversation',
  },
  {
    value: 'advanced',
    labelA: 'Nâng cao',
    labelB: 'Advanced',
    descA: 'C1+, diễn đạt phức tạp',
    descB: 'C1+, complex expression',
  },
]
