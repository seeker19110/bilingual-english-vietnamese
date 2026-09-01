// lessons.test.ts — Kiểm tra toàn bộ bài học Sinh học (chạy qua Zod schema validation).
import { describe, it, expect } from 'vitest'
import { BIOLOGY_LESSONS, getBiologyLesson, listBiologyLessonsByGrade } from './lessons.js'
import { BiologyLessonSchema, BIOLOGY_GRADES } from './lessonTypes.js'

describe('BIOLOGY_LESSONS registry', () => {
  it('có bài học từ tất cả 3 lớp', () => {
    for (const grade of BIOLOGY_GRADES) {
      const count = BIOLOGY_LESSONS.filter((l) => l.grade === grade).length
      expect(count, `Lớp ${grade} phải có ít nhất 1 bài`).toBeGreaterThan(0)
    }
  })

  it('tổng số bài học đủ số lượng tối thiểu', () => {
    // Sinh 10: 26 bài, Sinh 11: 26 bài, Sinh 12: 30 bài => ≥ 80
    expect(BIOLOGY_LESSONS.length).toBeGreaterThanOrEqual(80)
  })

  it('mọi id bài học là duy nhất', () => {
    const ids = BIOLOGY_LESSONS.map((l) => l.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })

  it('mọi bài học đều pass Zod schema', () => {
    for (const lesson of BIOLOGY_LESSONS) {
      const result = BiologyLessonSchema.safeParse(lesson)
      if (!result.success) {
        console.error(`Lỗi bài ${lesson.id}:`, JSON.stringify(result.error.issues, null, 2))
      }
      expect(result.success, `Bài ${lesson.id} không hợp lệ`).toBe(true)
    }
  })

  it('id khớp đúng pattern sinh<lớp>-c<chương>-b<số bài>', () => {
    for (const lesson of BIOLOGY_LESSONS) {
      const expected = `sinh${lesson.grade}-c${lesson.chapterNumber}-b${lesson.lessonNumber}`
      expect(lesson.id, `Bài "${lesson.title}" có id sai`).toBe(expected)
    }
  })

  it('getBiologyLesson trả về đúng bài khi tìm theo id', () => {
    const sample = BIOLOGY_LESSONS[0]!
    const found = getBiologyLesson(sample.id)
    expect(found).toBeDefined()
    expect(found?.title).toBe(sample.title)
  })

  it('listBiologyLessonsByGrade trả về đúng bài theo lớp và sắp xếp đúng thứ tự', () => {
    for (const grade of BIOLOGY_GRADES) {
      const lessons = listBiologyLessonsByGrade(grade)
      expect(lessons.every((l) => l.grade === grade)).toBe(true)
      // Kiểm tra sắp xếp: chapterNumber tăng dần, trong cùng chapter lessonNumber tăng dần
      for (let i = 1; i < lessons.length; i++) {
        const prev = lessons[i - 1]!
        const curr = lessons[i]!
        const ok =
          curr.chapterNumber > prev.chapterNumber ||
          (curr.chapterNumber === prev.chapterNumber && curr.lessonNumber > prev.lessonNumber)
        expect(ok, `Thứ tự sắp xếp sai tại lớp ${grade}: ${prev.id} → ${curr.id}`).toBe(true)
      }
    }
  })

  it('mỗi bài có ít nhất 2 checkQuestions và 2 srsCards', () => {
    for (const lesson of BIOLOGY_LESSONS) {
      expect(
        lesson.checkQuestions.length,
        `${lesson.id}: thiếu checkQuestions`,
      ).toBeGreaterThanOrEqual(2)
      expect(lesson.srsCards.length, `${lesson.id}: thiếu srsCards`).toBeGreaterThanOrEqual(2)
    }
  })
})
