import { describe, it, expect } from 'vitest'
import { LessonSchema, LESSON_SCHEMA_VERSION } from './lesson.js'

const validLesson = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  code: 'b1-unit3-grammar-present-perfect',
  title: 'Present Perfect',
  cefrLevel: 'B1',
  kind: 'grammar',
  order: 3,
  schemaVersion: LESSON_SCHEMA_VERSION,
}

describe('LessonSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(LessonSchema.parse(validLesson)).toEqual(validLesson)
  })

  it('code có chữ hoa → từ chối (khớp bài học SRS 2026-08-12: lessonId phải chữ thường)', () => {
    expect(() => LessonSchema.parse({ ...validLesson, code: 'B1-Unit3' })).toThrow()
  })

  it('kind ngoài vocabulary/grammar/dialogue → từ chối', () => {
    expect(() => LessonSchema.parse({ ...validLesson, kind: 'listening' })).toThrow()
  })

  it('order âm → từ chối', () => {
    expect(() => LessonSchema.parse({ ...validLesson, order: -1 })).toThrow()
  })

  it('order = 0 (bài đầu tiên, biên hợp lệ) → parse thành công', () => {
    expect(LessonSchema.parse({ ...validLesson, order: 0 }).order).toBe(0)
  })

  it('field lạ → từ chối', () => {
    expect(() => LessonSchema.parse({ ...validLesson, estimatedMinutes: 10 })).toThrow()
  })
})
