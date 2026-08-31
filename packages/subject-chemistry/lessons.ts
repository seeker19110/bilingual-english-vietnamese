// lessons.ts — Registry BÀI HỌC môn Hoá học (gộp từ các file theo chương) + hàm tra cứu.
// Khuôn theo packages/subject-programming/lessons.ts — mỗi chương một file để soạn song song.
import type { ChemLesson } from './lessonTypes.js'
import { HOA10_C1_LESSONS } from './lessons/hoa10c1.js'
import { HOA10_C2_LESSONS } from './lessons/hoa10c2.js'
import { HOA10_C3_LESSONS } from './lessons/hoa10c3.js'
import { HOA10_C4_LESSONS } from './lessons/hoa10c4.js'
import { HOA10_C5_LESSONS } from './lessons/hoa10c5.js'
import { HOA10_C6_LESSONS } from './lessons/hoa10c6.js'
import { HOA10_C7_LESSONS } from './lessons/hoa10c7.js'

export const CHEM_LESSONS: ChemLesson[] = [
  ...HOA10_C1_LESSONS,
  ...HOA10_C2_LESSONS,
  ...HOA10_C3_LESSONS,
  ...HOA10_C4_LESSONS,
  ...HOA10_C5_LESSONS,
  ...HOA10_C6_LESSONS,
  ...HOA10_C7_LESSONS,
]

const lessonMap = new Map<string, ChemLesson>(CHEM_LESSONS.map((l) => [l.id, l]))

export function getChemLesson(id: string): ChemLesson | undefined {
  return lessonMap.get(id)
}

export function listChemLessonsByGrade(grade: '10' | '11' | '12'): ChemLesson[] {
  return CHEM_LESSONS.filter((l) => l.grade === grade).sort((a, b) =>
    a.chapterNumber !== b.chapterNumber
      ? a.chapterNumber - b.chapterNumber
      : a.lessonNumber - b.lessonNumber,
  )
}

export function listChemLessonsByChapter(
  grade: '10' | '11' | '12',
  chapterNumber: number,
): ChemLesson[] {
  return listChemLessonsByGrade(grade).filter((l) => l.chapterNumber === chapterNumber)
}
