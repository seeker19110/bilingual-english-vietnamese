// courses/courses.test.ts — Cổng chấm cho tầng KHOÁ NGẮN (PR 2/4 khoá Git).
//
// Hai việc canh: (1) mọi id bài mà khoá tham chiếu tới đều tồn tại thật trong `lessons.ts`
// — sai thì CI đỏ ngay, không phải trang trắng lúc học viên bấm vào; (2) khoá Git KHÔNG được
// đụng vào hai bài đã có của P3 — id không đổi, không bị xoá, không bị nhân bản nội dung.
import { describe, expect, it } from 'vitest'
import { SHORT_COURSES, getShortCourse } from './registry.js'
import { GIT_COURSE } from './git.js'
import { getLesson, getLessonsByUnit } from '../lessons.js'

describe('tầng khoá ngắn', () => {
  it('mọi lessonIds của mọi khoá đều tra ra bài thật (getLesson)', () => {
    for (const course of SHORT_COURSES) {
      for (const chapter of course.chapters) {
        expect(
          chapter.lessonIds.length,
          `${course.id}/${chapter.id} không có bài nào`,
        ).toBeGreaterThan(0)
        for (const lessonId of chapter.lessonIds) {
          expect(
            getLesson(lessonId),
            `${course.id}/${chapter.id} trỏ tới bài "${lessonId}" không tồn tại`,
          ).toBeDefined()
        }
      }
    }
  })

  it('id khoá và id chương không trùng nhau trong toàn bộ registry', () => {
    const courseIds = SHORT_COURSES.map((c) => c.id)
    expect(new Set(courseIds).size).toBe(courseIds.length)
    for (const course of SHORT_COURSES) {
      const chapterIds = course.chapters.map((ch) => ch.id)
      expect(new Set(chapterIds).size).toBe(chapterIds.length)
    }
  })

  it('getShortCourse tra đúng khoá theo id, id lạ trả về undefined', () => {
    expect(getShortCourse('git')).toBe(GIT_COURSE)
    expect(getShortCourse('khong-ton-tai')).toBeUndefined()
  })

  it('không có bài trước — vào thẳng khoá Git học được ngay (prerequisites rỗng)', () => {
    expect(GIT_COURSE.prerequisites).toEqual([])
  })
})

describe('KHÔNG HỒI QUY: khoá Git dùng lại bài cũ, không xoá không chép', () => {
  it('chương C1 tham chiếu ĐÚNG hai bài Git đã có của P3, đúng thứ tự', () => {
    const c1 = GIT_COURSE.chapters.find((ch) => ch.id === 'git-c1')
    expect(c1?.lessonIds).toEqual(['p3-u10-l1', 'p3-u10-l2'])
  })

  it('unit p3-u10 vẫn có đúng 2 bài, id không đổi — chứng minh bài cũ chưa bị đụng tới', () => {
    const baiCuaP3U10 = getLessonsByUnit('p3-u10')
    expect(baiCuaP3U10.map((l) => l.id)).toEqual(['p3-u10-l1', 'p3-u10-l2'])
  })

  it('nội dung bài trỏ tới từ khoá Git là CÙNG MỘT ĐỐI TƯỢNG với bài trong xương sống P3 — một nguồn sự thật, không phải bản chép', () => {
    const tuKhoa = getLesson('p3-u10-l1')
    const tuP3 = getLessonsByUnit('p3-u10').find((l) => l.id === 'p3-u10-l1')
    expect(tuKhoa).toBe(tuP3)
  })
})
