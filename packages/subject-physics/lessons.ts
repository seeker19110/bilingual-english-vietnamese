// lessons.ts — Registry BÀI HỌC môn Vật lí (gộp từ các file theo chương) + hàm tra cứu.
import type { PhysicsLesson } from './lessonTypes.js'
import { LY10_C1_LESSONS } from './lessons/ly10c1.js'
import { LY10_C2_LESSONS } from './lessons/ly10c2.js'
import { LY10_C3_LESSONS } from './lessons/ly10c3.js'
import { LY10_C4_LESSONS } from './lessons/ly10c4.js'
import { LY10_C5_LESSONS } from './lessons/ly10c5.js'
import { LY10_C6_LESSONS } from './lessons/ly10c6.js'
import { LY10_C7_LESSONS } from './lessons/ly10c7.js'

export const PHYSICS_LESSONS: PhysicsLesson[] = [
  ...LY10_C1_LESSONS,
  ...LY10_C2_LESSONS,
  ...LY10_C3_LESSONS,
  ...LY10_C4_LESSONS,
  ...LY10_C5_LESSONS,
  ...LY10_C6_LESSONS,
  ...LY10_C7_LESSONS,
]

const lessonMap = new Map<string, PhysicsLesson>(PHYSICS_LESSONS.map((l) => [l.id, l]))

export function getPhysicsLesson(id: string): PhysicsLesson | undefined {
  return lessonMap.get(id)
}

export function listPhysicsLessonsByGrade(grade: '10' | '11' | '12'): PhysicsLesson[] {
  return PHYSICS_LESSONS.filter((l) => l.grade === grade).sort((a, b) =>
    a.chapterNumber !== b.chapterNumber
      ? a.chapterNumber - b.chapterNumber
      : a.lessonNumber - b.lessonNumber,
  )
}
