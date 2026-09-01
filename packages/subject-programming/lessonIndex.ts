// lessonIndex — hình dạng CHỈ MỤC NHẸ của bài học + hàm dựng nó từ registry.
//
// Chỉ mục chỉ mang những trường mà màn LIỆT KÊ cần (trang bậc, trang khoá, chặng lộ trình, ôn
// thẻ, "học tiếp bài nào"). Nội dung bài (lý thuyết, ví dụ, Parsons, test-case…) KHÔNG nằm ở
// đây — nó chỉ được nạp lười theo unit khi mở đúng bài (xem lessonsLoader.ts).
//
// Tách riêng để scripts/gen-lesson-index.ts và lessonsLazy.test.ts dùng CÙNG MỘT hàm dựng —
// file sinh ra lệch với hàm này là test đỏ ngay.
import type { ProgrammingLesson } from './lessonTypes.js'

export interface LessonSummary {
  id: string
  unitId: string
  title: string
  language: ProgrammingLesson['language']
  /** Số thẻ SRS của bài — đủ để đếm/đưa thẻ vào vòng ôn mà không cần nội dung thẻ. */
  srsCardCount: number
}

export function summarizeLesson(lesson: ProgrammingLesson): LessonSummary {
  return {
    id: lesson.id,
    unitId: lesson.unitId,
    title: lesson.title,
    language: lesson.language,
    srsCardCount: lesson.srsCards?.length ?? 0,
  }
}

export function buildLessonIndex(lessons: readonly ProgrammingLesson[]): LessonSummary[] {
  return lessons.map(summarizeLesson)
}
