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

  // Bậc đã MỞ = mọi unit của bậc đều có bài (học viên đi trọn bậc, không gặp lỗ hổng
  // "Sắp mở" ở giữa đường). P1 mở ở PR-L4, P2 ở PR-L6, P3 ở PR-L11, P4 ở PR-L17, P5 ở PR-L18.
  it.each(['p1', 'p2', 'p3', 'p4', 'p5'])('MỌI unit của bậc %s đều đã có bài học', (levelId) => {
    const units = PROGRAMMING_LEVELS.find((l) => l.id === levelId)!.units
    const thieu = units.filter((u) => getLessonsByUnit(u.id).length === 0).map((u) => u.id)
    expect(thieu, `Unit ${levelId} chưa có bài học: ${thieu.join(', ')}`).toEqual([])
  })

  it('tra cứu theo unit và theo id', () => {
    expect(getLessonsByUnit('p1-u4').map((l) => l.id)).toContain('p1-u4-l1')
    expect(getLessonsByUnit('p2-u4').map((l) => l.id)).toContain('p2-u4-l1')
    expect(getLessonsByUnit('p3-u2').map((l) => l.id)).toContain('p3-u2-l1')
    expect(getLessonsByUnit('p4-u1').map((l) => l.id)).toContain('p4-u1-l1')
    expect(getLessonsByUnit('p5-u1').map((l) => l.id)).toContain('p5-u1-l1')
    // Unit CHƯA soạn nội dung → rỗng (UI hiện "Sắp mở"). P5 đóng trọn ở PR-L18, nên mốc
    // nhánh rỗng nay là P6 — bậc chuyên sâu, soạn sau khi P1–P5 chạy thật.
    expect(getLessonsByUnit('p6-u1')).toEqual([])
    expect(getLesson('p9-u9-l9')).toBeUndefined()
  })
})
