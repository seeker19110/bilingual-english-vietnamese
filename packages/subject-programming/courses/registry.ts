// courses/registry.ts — Sổ đăng ký các KHOÁ NGẮN của môn Lập trình (PR 2/4 khoá Git).
//
// Thêm khoá mới: soạn file `courses/<id>.ts` theo khuôn `git.ts`, rồi thêm 1 dòng import +
// 1 phần tử vào mảng dưới đây.
import type { ShortCourse, ShortCourseId } from './types.js'
import { GIT_COURSE } from './git.js'
import { HERMES_COURSE } from './hermes.js'
import { VIBE_COURSE } from './vibe.js'
import { OPENCLAW_COURSE } from './openclaw.js'
import { ML_COURSE } from './ml.js'

export const SHORT_COURSES: ShortCourse[] = [
  GIT_COURSE,
  HERMES_COURSE,
  VIBE_COURSE,
  OPENCLAW_COURSE,
  ML_COURSE,
]

const courseMap = new Map(SHORT_COURSES.map((c) => [c.id, c]))

export function getShortCourse(id: string): ShortCourse | undefined {
  return courseMap.get(id as ShortCourseId)
}
