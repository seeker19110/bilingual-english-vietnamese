export type Plan = 'free' | 'pro' | 'vip'
export type Level = 'beginner' | 'intermediate' | 'advanced'
// A = Người Việt học tiếng Anh | B = Người nước ngoài học tiếng Việt (qua tiếng Anh)
export type Direction = 'A' | 'B'

// Cấp CEFR áp cho TỪNG TỪ vựng (khác CefrLevel['id'] trong src/data/cefr.ts chỉ có A1-B2
// cho lộ trình) — từ điển mở rộng có cả từ nâng cao nên cần thêm C1/C2.
export type CefrWordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

// Các DẠNG BIẾN THỂ của một từ (word forms) — sinh bằng scripts/gen-word-forms.ts.
// Hiển thị NGAY TRONG phần nghĩa của từ gốc (trang Từ điển + thẻ học từ) để người
// học nắm luôn cách chia. Chỉ điền field khi dạng đó THỰC SỰ tồn tại và khác từ gốc;
// bỏ trống nếu không áp dụng (danh từ không đếm được → không có plural; động từ khiếm
// khuyết → không chia). Xem docs/research/bo-sung-dang-bien-the-tu-dien.md.
export interface WordForms {
  // Danh từ
  plural?: string // số nhiều: 'books', 'children' — bỏ trống nếu không đếm được
  uncountable?: boolean // true → UI ghi "(không đếm được)", KHÔNG hiện plural
  // Động từ
  v3s?: string // ngôi 3 số ít (V-s): goes, watches
  ving?: string // dạng V-ing: going, running
  past?: string // quá khứ (V2): went, played
  pastPart?: string // quá khứ phân từ (V3): gone — CHỈ lưu khi khác past
  // Tính từ / trạng từ
  comparative?: string // so sánh hơn: bigger — CHỈ lưu khi có dạng -er thật
  superlative?: string // so sánh nhất: biggest
  irregular?: boolean // true → dạng bất quy tắc (UI đánh dấu nổi bật để học thuộc)
}

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
  // Hạng tần suất trong tiếng Anh (số càng nhỏ = càng thông dụng) — điền bằng
  // scripts/assign-word-freq.ts từ 1 wordlist tần suất thật (NGSL/SUBTLEX...).
  // Chưa mọi từ đều có; getCircles() (lib/curriculum.ts) dùng để sắp phần "Mở
  // rộng" theo tần suất thay vì alphabet, từ thiếu freq xếp cuối.
  freq?: number
  // Các dạng biến thể của từ (số nhiều, các thì, so sánh…) — chỉ có ở từ GỐC.
  forms?: WordForms
  // CHỈ có ở entry là một dạng biến thể (went → base: 'go') — trỏ về từ gốc để UI
  // hiện link "Xem từ gốc" và để search gộp về từ gốc.
  base?: string
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
  // Từ mục tiêu (đề xuất B): batch từ vừa học được bơm vào prompt để AI dẫn dắt
  // học viên DÙNG chúng. Optional — phiên thường không có. Chỉ lưu local (không
  // đổi schema Supabase; đồng bộ phiên chat bỏ qua field lạ an toàn).
  targetWords?: string[]
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
  // Từ mục tiêu (đề xuất B): batch từ vừa học được bơm vào prompt để AI dẫn dắt
  // học viên DÙNG chúng. Optional — phiên thường không có. Chỉ lưu local (không
  // đổi schema Supabase; đồng bộ phiên chat bỏ qua field lạ an toàn).
  targetWords?: string[]
}

// Kết quả chấm điểm cuối phiên Chat/Speaking (nút "Kết thúc & chấm điểm").
// Không lưu lên Supabase (chỉ hiện tạm trong phiên) nên không cần đổi schema DB.
// pronunciation chỉ có ở Speaking (có audio); Chat không có.
export interface EvaluationResult {
  scores: {
    fluency: number
    lexical: number
    grammar: number
    pronunciation?: number
    overall: number
  }
  errors: { original: string; corrected: string; explanation: string }[]
  strengths: string[]
  suggestions: string[]
  encouragement: string
}

// Đếm lượt dùng trong ngày (reset mỗi ngày)
export interface DailyUsage {
  date: string // YYYY-MM-DD
  chatCount: number
  writingCount: number
  speakingCount: number
  sttCount: number // số lần nhận diện giọng nói (STT) — đếm riêng vì tốn API riêng
  // Số lần chấm phát âm chi tiết qua Azure (① Giai đoạn 2) — đếm riêng, tốn API riêng.
  pronounceCount?: number
  // Số từ vựng đã học trong ngày (tab Lộ trình / Hôm nay). KHÔNG tốn API, không tính
  // vào giới hạn gói — chỉ để ghi nhận "có học hôm nay" cho chuỗi ngày liên tiếp (streak).
  learnCount?: number
}

// Giới hạn theo gói (quyết định người dùng chốt 2026-07-21): Free 5 lượt/tính năng/ngày,
// Pro 100 lượt/tính năng/ngày, VIP không giới hạn (dùng số rất lớn thay Infinity).
// Áp dụng THẬT từ 2027 — hiện đang trong khuyến mãi ra mắt (xem src/lib/promo.ts), mọi
// user hiện được effectivePlan() nâng thành 'vip' khi tính hạn mức hiển thị.
// PHẢI khớp với api/_lib/usage.ts (LIMITS) để client/server đồng nhất.
const UNLIMITED = 1_000_000
export const LIMITS: Record<
  Plan,
  { chat: number; writing: number; speaking: number; stt: number; pronounce: number }
> = {
  free: { chat: 5, writing: 5, speaking: 5, stt: 5, pronounce: 5 },
  pro: { chat: 100, writing: 100, speaking: 100, stt: 100, pronounce: 100 },
  vip: {
    chat: UNLIMITED,
    writing: UNLIMITED,
    speaking: UNLIMITED,
    stt: UNLIMITED,
    pronounce: UNLIMITED,
  },
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
