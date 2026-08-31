// lessons.test.ts — Gác chất lượng nội dung bài học Hoá: mọi bài phải qua ChemLessonSchema,
// mọi câu hỏi checkQuestions phải CHẤM ĐÚNG THẬT bằng packages/core-grading khi trả lời đúng
// đáp án đã khai (bảo đảm dữ liệu bài học không tự mâu thuẫn với chính engine chấm sẽ dùng nó).
import { describe, expect, it } from 'vitest'
import { gradeAnswer } from '@dhcb/core-grading'
import { CHEM_LESSONS, getChemLesson, listChemLessonsByGrade } from './lessons.js'
import { ChemLessonSchema } from './lessonTypes.js'

describe('chemistry lessons', () => {
  it('mọi bài đúng khuôn ChemLessonSchema (Zod)', () => {
    for (const lesson of CHEM_LESSONS) {
      const r = ChemLessonSchema.safeParse(lesson)
      expect(r.success, `Bài ${lesson.id} sai khuôn: ${r.success ? '' : r.error.message}`).toBe(
        true,
      )
    }
  })

  it('id duy nhất trong toàn bộ registry', () => {
    const seen = new Set<string>()
    for (const lesson of CHEM_LESSONS) {
      expect(seen.has(lesson.id), `id trùng lặp: ${lesson.id}`).toBe(false)
      seen.add(lesson.id)
    }
  })

  it('mọi bài đánh dấu reviewStatus (không âm thầm coi là đã duyệt)', () => {
    for (const lesson of CHEM_LESSONS) {
      expect(['draft', 'reviewed']).toContain(lesson.reviewStatus)
    }
  })

  it('mọi checkQuestion tự chấm ĐÚNG với chính đáp án đã khai — dùng engine chấm thật, không AI', () => {
    for (const lesson of CHEM_LESSONS) {
      for (const q of lesson.checkQuestions) {
        let studentInput: string
        switch (q.answer.kind) {
          case 'numeric':
            studentInput = q.answer.unit
              ? `${q.answer.value} ${q.answer.unit}`
              : `${q.answer.value}`
            break
          case 'choice':
            studentInput = q.answer.correctIds.join(',')
            break
          case 'chemFormula':
            studentInput = q.answer.formula
            break
          case 'chemEquation':
            // Cân bằng PTHH cần hệ số đúng theo thuật toán riêng — chưa có câu dạng này ở
            // đợt Chương 1, bỏ qua an toàn thay vì đoán hệ số.
            continue
        }
        const result = gradeAnswer(studentInput, q.answer)
        expect(
          result.correct,
          `Bài ${lesson.id}, câu "${q.prompt}" — đáp án đã khai KHÔNG tự chấm đúng (lý do: ${result.reason})`,
        ).toBe(true)
      }
    }
  })

  it('getChemLesson tra được đúng bài theo id', () => {
    const lesson = getChemLesson('hoa10-c1-b1')
    expect(lesson?.title).toBe('Nhập môn Hoá học')
  })

  it('listChemLessonsByGrade trả đúng thứ tự chương/bài', () => {
    const lessons10 = listChemLessonsByGrade('10')
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
