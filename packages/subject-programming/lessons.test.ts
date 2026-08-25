// Gác chất lượng nội dung bài học: mọi bài phải qua LessonSchema + khớp chéo curriculum.
import { describe, expect, it } from 'vitest'
import { PROGRAMMING_LESSONS, getLesson, getLessonsByUnit } from './lessons.js'
import { LessonSchema } from './lessonTypes.js'
import { PROGRAMMING_LEVELS } from './curriculum.js'

const ALL_UNIT_IDS = new Set(PROGRAMMING_LEVELS.flatMap((l) => l.units.map((u) => u.id)))

describe('programming lessons', () => {
  it('mọi bài đúng khuôn LessonSchema (Zod)', () => {
    for (const lesson of PROGRAMMING_LESSONS) {
      const r = LessonSchema.safeParse(lesson)
      expect(r.success, `Bài ${lesson.id} sai khuôn: ${r.success ? '' : r.error.message}`).toBe(
        true,
      )
    }
  })

  it('id duy nhất và unitId tồn tại thật trong curriculum', () => {
    const seen = new Set<string>()
    for (const lesson of PROGRAMMING_LESSONS) {
      expect(seen.has(lesson.id)).toBe(false)
      seen.add(lesson.id)
      expect(ALL_UNIT_IDS.has(lesson.unitId), `unit ${lesson.unitId} không tồn tại`).toBe(true)
    }
  })

  it('mỗi bài Make có ít nhất 1 ca HIỆN (học viên phải thấy được mình sai gì)', () => {
    for (const lesson of PROGRAMMING_LESSONS) {
      expect(lesson.make.testCases.some((t) => !t.hidden)).toBe(true)
    }
  })

  it('bài mẫu P1-U4 tính tiền đúng số học (khớp đề với test-case, không tin tay soạn)', () => {
    const tien = (kwh: number) =>
      kwh <= 50
        ? kwh * 1893
        : kwh <= 100
          ? 50 * 1893 + (kwh - 50) * 1956
          : 50 * 1893 + 50 * 1956 + (kwh - 100) * 2271
    const lesson = getLesson('p1-u4-l1')!
    const expectFor = (stdin: string) =>
      lesson.make.testCases.find((t) => t.stdinLines[0] === stdin)!.expected
    for (const kwh of [30, 60, 50, 150, 0]) {
      expect(expectFor(String(kwh))).toBe(`Tien dien: ${tien(kwh)} dong`)
    }
  })

  it('tra cứu theo unit và theo id', () => {
    expect(getLessonsByUnit('p1-u4').map((l) => l.id)).toContain('p1-u4-l1')
    expect(getLessonsByUnit('p1-u1')).toEqual([])
    expect(getLesson('p9-u9-l9')).toBeUndefined()
  })
})
