/**
 * Kiểu dùng chung của lộ trình CEFR — TÁCH RIÊNG để cắt chu trình import.
 *
 * Trước đây các kiểu này khai báo trong `cefr.ts`, mà `cefr.ts` lại import DỮ LIỆU C1/C2 từ
 * `cefrAdvanced.ts`, còn `cefrAdvanced.ts` phải import ngược KIỂU từ `cefr.ts` →
 * `cefr.ts → cefrAdvanced.ts → cefr.ts`. File chỉ-chứa-kiểu này không import module nào trong
 * `data/` nên không thể nằm trong chu trình; `cefr.ts` xuất lại toàn bộ để nơi đang import từ
 * './cefr' giữ nguyên.
 */

// Một ví dụ minh họa (Anh ↔ Việt) — dùng chung cho ngữ pháp.
export interface Example {
  en: string
  vi: string
}

// Một lỗi thường gặp: câu SAI → câu ĐÚNG + giải thích ngắn (tiếng Việt).
export interface CommonMistake {
  wrong: string
  right: string
  noteVi: string
}

// Một câu hỏi trắc nghiệm nhỏ để tự kiểm tra ngay sau khi học.
export interface QuizItem {
  // Câu hỏi/câu có chỗ trống. Dùng "___" để đánh dấu chỗ cần điền.
  q: string
  // Các lựa chọn (2–4 đáp án).
  options: string[]
  // Vị trí (index) của đáp án đúng trong mảng options.
  answer: number
  // Giải thích ngắn vì sao đúng (tiếng Việt) — hiện sau khi chọn.
  explainVi?: string
}

// Một bài ngữ pháp nhỏ.
export interface GrammarLesson {
  id: string
  titleVi: string
  titleEn: string
  // Công thức ngắn gọn, vd: "S + am/is/are + (tính từ / danh từ)"
  structure: string
  // Giải thích cho người mới, bằng tiếng Việt (có thể nhiều dòng — xuống dòng bằng \n).
  explainVi: string
  examples: Example[]
  // ── Các trường LÀM GIÀU nội dung (tất cả tùy chọn — bài cũ không có vẫn chạy) ──
  // Mẹo/lưu ý ngắn giúp nhớ hoặc dùng đúng (tiếng Việt, có thể nhiều dòng).
  tipVi?: string
  // Lỗi người Việt hay mắc với điểm ngữ pháp này.
  mistakes?: CommonMistake[]
  // Bài tập nhỏ tự kiểm tra ngay.
  quiz?: QuizItem[]
}

// Một unit (bài học) — gom vài điểm ngữ pháp + vài chủ đề từ vựng liên quan.
export interface CefrUnit {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  grammar: GrammarLesson[]
  // id của các vòng từ vựng trong FOUNDATION (src/data/curriculum.ts)
  vocabCircleIds: string[]
}

// Một cấp độ CEFR.
export interface CefrLevel {
  id: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  titleVi: string
  titleEn: string
  subtitleVi: string // vd: "Người mới bắt đầu"
  goalVi: string // mục tiêu tổng quát của cả cấp
  // Màu nhấn (Tailwind) cho UI — dùng để phân biệt các cấp.
  accent: 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'cyan'
  // Mục tiêu "Tôi có thể…" theo CEFR (tiếng Việt).
  canDo: string[]
  units: CefrUnit[]
}
