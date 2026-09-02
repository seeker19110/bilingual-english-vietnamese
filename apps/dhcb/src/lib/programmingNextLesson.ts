// programmingNextLesson — "học tiếp bài nào?" cho môn Lập trình (PR-UX4).
//
// Tách khỏi giao diện vì đây là logic dễ sai và đáng có test riêng: thứ tự bài phải theo đúng
// trình tự giáo trình (bậc → unit → bài), không theo thứ tự server trả tiến độ về.
//
// Luật chọn, theo thứ tự ưu tiên:
//  1. Bài đang học dở (`in_progress`) đứng SỚM NHẤT trong giáo trình — quay lại đúng chỗ bỏ đi.
//  2. Không có bài dở → bài CHƯA HOÀN THÀNH đầu tiên.
//  3. Hoàn thành hết → null (giao diện chuyển sang lời chúc mừng, không đẩy đi đâu nữa).
import { PROGRAMMING_LEVELS } from '@dhcb/subject-programming/curriculum'
import { getUnitSummaries, type LessonSummary } from '@dhcb/subject-programming/lessonsLoader'
import type { ProgrammingLessonProgress } from './programmingProgress'

export interface NextLesson {
  /** Tóm tắt (id · tiêu đề · ngôn ngữ) — đủ cho nút "học tiếp", không kéo nội dung bài. */
  lesson: LessonSummary
  levelId: string
  levelName: string
  /** Đang học dở (khác với bài chưa từng mở) — giao diện đổi chữ nút cho đúng. */
  resuming: boolean
}

/** Toàn bộ bài đã soạn, THEO ĐÚNG thứ tự giáo trình. */
export function lessonsInOrder(): {
  lesson: LessonSummary
  levelId: string
  levelName: string
}[] {
  return PROGRAMMING_LEVELS.flatMap((level) =>
    level.units.flatMap((unit) =>
      getUnitSummaries(unit.id).map((lesson) => ({
        lesson,
        levelId: level.id,
        levelName: level.name,
      })),
    ),
  )
}

/** Số bài đã hoàn thành / tổng số bài đã soạn. */
export function countCompleted(progress: ProgrammingLessonProgress[]): {
  done: number
  total: number
} {
  const doneIds = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId))
  const all = lessonsInOrder()
  return { done: all.filter((x) => doneIds.has(x.lesson.id)).length, total: all.length }
}

/** Số bài đã hoàn thành của MỘT bậc — dùng cho vòng tiến độ ở cột mốc. */
export function countCompletedByLevel(
  progress: ProgrammingLessonProgress[],
  levelId: string,
): { done: number; total: number } {
  const doneIds = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId))
  const ofLevel = lessonsInOrder().filter((x) => x.levelId === levelId)
  return { done: ofLevel.filter((x) => doneIds.has(x.lesson.id)).length, total: ofLevel.length }
}

/** Bài nên học tiếp — xem luật chọn ở đầu file. `null` = đã xong hết môn. */
export function pickNextLesson(progress: ProgrammingLessonProgress[]): NextLesson | null {
  const all = lessonsInOrder()
  const byId = new Map(progress.map((p) => [p.lessonId, p]))

  const dangDo = all.find((x) => byId.get(x.lesson.id)?.status === 'in_progress')
  if (dangDo) return { ...dangDo, resuming: true }

  const chuaXong = all.find((x) => byId.get(x.lesson.id)?.status !== 'completed')
  return chuaXong ? { ...chuaXong, resuming: false } : null
}
