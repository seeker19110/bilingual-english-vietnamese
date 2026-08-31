// lessons.test.ts — Gác chất lượng nội dung bài học Vật lí.
import { describe, expect, it } from 'vitest'
import { gradeAnswer, UNITS } from '@dhcb/core-grading'
import { PHYSICS_LESSONS, getPhysicsLesson, listPhysicsLessonsByGrade } from './lessons.js'
import { PhysicsLessonSchema } from './lessonTypes.js'

describe('physics lessons', () => {
  it('mọi bài đúng khuôn PhysicsLessonSchema (Zod)', () => {
    for (const lesson of PHYSICS_LESSONS) {
      const r = PhysicsLessonSchema.safeParse(lesson)
      expect(r.success, `Bài ${lesson.id} sai khuôn: ${r.success ? '' : r.error.message}`).toBe(
        true,
      )
    }
  })

  it('id duy nhất trong toàn bộ registry', () => {
    const seen = new Set<string>()
    for (const lesson of PHYSICS_LESSONS) {
      expect(seen.has(lesson.id), `id trùng lặp: ${lesson.id}`).toBe(false)
      seen.add(lesson.id)
    }
  })

  it('mọi bài đánh dấu reviewStatus (không âm thầm coi là đã duyệt)', () => {
    for (const lesson of PHYSICS_LESSONS) {
      expect(['draft', 'reviewed']).toContain(lesson.reviewStatus)
    }
  })

  it('mọi checkQuestion tự chấm ĐÚNG với chính đáp án đã khai — dùng engine chấm thật, không AI', () => {
    for (const lesson of PHYSICS_LESSONS) {
      for (const q of lesson.checkQuestions) {
        let studentInput: string
        switch (q.answer.kind) {
          case 'numeric': {
            const unitDef = q.answer.unit ? UNITS[q.answer.unit] : undefined
            const factor = unitDef ? unitDef.factor : 1
            const offset = unitDef ? (unitDef.offset ?? 0) : 0
            const displayValue = (q.answer.value - offset) / factor
            studentInput = q.answer.unit ? `${displayValue} ${q.answer.unit}` : `${displayValue}`
            break
          }
          case 'choice':
            studentInput = q.answer.correctIds.join(',')
            break
          case 'fraction':
            studentInput = `${q.answer.num}/${q.answer.den}`
            break
          case 'expression':
            studentInput = q.answer.expr
            break
        }
        const result = gradeAnswer(studentInput, q.answer)
        expect(
          result.correct,
          `Bài ${lesson.id}, câu "${q.prompt}" — đáp án đã khai KHÔNG tự chấm đúng (lý do: ${result.reason})`,
        ).toBe(true)
      }
    }
  })

  it('getPhysicsLesson tra được đúng bài theo id', () => {
    const lesson = getPhysicsLesson('ly10-c1-b1')
    expect(lesson?.title).toBe('Làm quen với Vật lí')
  })

  it('listPhysicsLessonsByGrade trả đúng thứ tự chương/bài', () => {
    const lessons10 = listPhysicsLessonsByGrade('10')
    expect(lessons10.length).toBeGreaterThan(0)
    for (let i = 1; i < lessons10.length; i++) {
      const prev = lessons10[i - 1]!
      const cur = lessons10[i]!
      const prevKey = prev.chapterNumber * 1000 + prev.lessonNumber
      const curKey = cur.chapterNumber * 1000 + cur.lessonNumber
      expect(curKey).toBeGreaterThanOrEqual(prevKey)
    }
  })
})
