export type Plan = 'free' | 'pro'
export type Level = 'beginner' | 'intermediate' | 'advanced'
// A = Người Việt học tiếng Anh | B = Người nước ngoài học tiếng Việt (qua tiếng Anh)
export type Direction = 'A' | 'B'

// Cấu trúc 1 mục từ điển — khớp với dữ liệu trong src/data/dictionary.json
export interface DictEntry {
  word: string     // từ tiếng Anh
  pos: string      // loại từ viết tắt: n, v, adj, adv, prep, conj, pron, interj, art, num
  vi: string       // nghĩa tiếng Việt
  ex_en: string    // câu ví dụ tiếng Anh
  ex_vi: string    // câu ví dụ dịch tiếng Việt
  ipa_en?: string  // phiên âm quốc tế tiếng Anh
  ipa_vi?: string  // phiên âm quốc tế tiếng Việt
}

export interface User {
  id: string
  email: string
  name: string
  plan: Plan
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
  date: string       // YYYY-MM-DD
  chatCount: number
  writingCount: number
  speakingCount: number
}

// Giới hạn theo gói
export const LIMITS: Record<Plan, { chat: number; writing: number; speaking: number }> = {
  free: { chat: 15, writing: 3, speaking: 5 },
  pro:  { chat: 999, writing: 30, speaking: 60 },
}

export const SITUATIONS = [
  { value: 'job_interview',    label: 'Phỏng vấn xin việc' },
  { value: 'restaurant',       label: 'Gọi món tại nhà hàng' },
  { value: 'hotel_travel',     label: 'Du lịch / khách sạn' },
  { value: 'office_meeting',   label: 'Họp / thuyết trình' },
  { value: 'shopping',         label: 'Mua sắm' },
  { value: 'small_talk',       label: 'Tán gẫu / xã giao' },
  { value: 'free',             label: 'Tự do — chủ đề bất kỳ' },
] as const

export const LEVELS: { value: Level; label: string; desc: string }[] = [
  { value: 'beginner',     label: 'Cơ bản',   desc: 'A1–A2, câu đơn giản' },
  { value: 'intermediate', label: 'Trung cấp', desc: 'B1–B2, giao tiếp thường ngày' },
  { value: 'advanced',     label: 'Nâng cao',  desc: 'C1+, diễn đạt phức tạp' },
]
