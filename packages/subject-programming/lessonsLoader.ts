// lessonsLoader — tra cứu bài học cho GIAO DIỆN mà không kéo toàn bộ nội dung môn.
//
// Hai tầng:
//   · ĐỒNG BỘ, rẻ: `getLessonSummary` / `getUnitSummaries` đọc từ chỉ mục nhẹ `LESSON_INDEX`
//     (id · unitId · title · language · số thẻ SRS). Mọi màn liệt kê chỉ cần tới đây.
//   · BẤT ĐỒNG BỘ, nạp lười: `loadLesson` / `loadUnitLessons` gọi `import()` của ĐÚNG unit
//     chứa bài, có cache — mở bài nào tải unit đó, không tải cả môn.
//
// Server và test giữ nguyên bản đồng bộ đầy đủ ở `lessons.ts` (nguồn sự thật). File này KHÔNG
// import `lessons.ts` — đó chính là điều làm bundle của app nhẹ đi; ESLint không canh được
// nên ghi rõ ở đây: thêm import đó vào là kéo lại 3 MB vào mọi trang môn Lập trình.
import type { ProgrammingLesson } from './lessonTypes.js'
import { LESSON_INDEX, UNIT_LOADERS, type LessonSummary } from './lessonsLazy.js'

export type { LessonSummary } from './lessonIndex.js'
export { LESSON_INDEX } from './lessonsLazy.js'

const summaryById = new Map(LESSON_INDEX.map((s) => [s.id, s]))

/** Tóm tắt một bài (không có nội dung). */
export function getLessonSummary(lessonId: string): LessonSummary | undefined {
  return summaryById.get(lessonId)
}

/** Tóm tắt các bài của một unit, theo thứ tự registry (unit chưa soạn → mảng rỗng). */
export function getUnitSummaries(unitId: string): LessonSummary[] {
  return LESSON_INDEX.filter((s) => s.unitId === unitId)
}

// Cache promise (không phải kết quả) để hai lời gọi cùng lúc không tải unit hai lần; nạp lỗi
// (mất mạng giữa chừng) thì xoá khỏi cache để lần sau thử lại được.
const unitCache = new Map<string, Promise<ProgrammingLesson[]>>()

/** Nạp ĐỦ nội dung các bài của một unit. Unit không tồn tại → mảng rỗng (không ném). */
export function loadUnitLessons(unitId: string): Promise<ProgrammingLesson[]> {
  const loader = UNIT_LOADERS[unitId]
  if (!loader) return Promise.resolve([])
  let pending = unitCache.get(unitId)
  if (!pending) {
    pending = loader().catch((err: unknown) => {
      unitCache.delete(unitId)
      throw err
    })
    unitCache.set(unitId, pending)
  }
  return pending
}

/** Nạp ĐỦ nội dung một bài (qua unit chứa nó). Bài không có trong chỉ mục → undefined. */
export async function loadLesson(lessonId: string): Promise<ProgrammingLesson | undefined> {
  const summary = summaryById.get(lessonId)
  if (!summary) return undefined
  const lessons = await loadUnitLessons(summary.unitId)
  return lessons.find((l) => l.id === lessonId)
}

/** Nạp nội dung nhiều bài một lượt, gom theo unit để mỗi unit chỉ tải một lần. */
export async function loadLessons(
  lessonIds: readonly string[],
): Promise<Map<string, ProgrammingLesson>> {
  const unitIds = new Set(
    lessonIds.map((id) => summaryById.get(id)?.unitId).filter((u): u is string => u !== undefined),
  )
  const wanted = new Set(lessonIds)
  const result = new Map<string, ProgrammingLesson>()
  const units = await Promise.all([...unitIds].map((u) => loadUnitLessons(u)))
  for (const lesson of units.flat()) if (wanted.has(lesson.id)) result.set(lesson.id, lesson)
  return result
}

/** Chỉ dùng trong test: xoá cache để đo lại hành vi nạp. */
export function _resetLessonCacheForTests(): void {
  unitCache.clear()
}
