// CỔNG NỘI DUNG cho bài KOTLIN — hạ tầng PR-M7, nội dung đổ vào từ PR-M8.
//
// Dựng trước khi có bài, đúng bài học §0.1 của hiến chương: 6/8 ngôn ngữ trong đặc tả gốc chỉ
// tồn tại dưới dạng MỘT DÒNG CHỮ vì không có cổng nào chấm chúng. Cổng có sẵn thì bài đầu tiên
// của PR-M8 bị chấm ngay từ commit đầu.
//
// Lưu ý cổng §3.4: conformance.test.ts CHẶN việc soạn nội dung Kotlin khi bộ ca đối chiếu chưa
// được chạy trên trình biên dịch thật — nên file này còn rỗng là ĐÚNG tiến độ.
import { describe, expect, it } from 'vitest'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { chayKotlin } from './kotlinSim/chayKotlin.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingLesson } from './lessonTypes.js'

const KOTLIN_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'kotlin')

/** Thứ bộ chạy KHÔNG có — cấm xuất hiện trong code học viên bấm Chạy (luật tự khai §3.3). */
const NGOAI_TAP_CON =
  /\b(import\s+android|import\s+kotlinx|import\s+java\.|suspend\s+fun|runBlocking|GlobalScope|Thread\s*\(|Flow<|by\s+lazy)\b/

describe('nội dung KOTLIN môn Lập trình chạy THẬT', () => {
  it('cổng đã sẵn sàng: mọi bài language=kotlin đều bị chấm ở đây', () => {
    expect(PROGRAMMING_LESSONS.every((l) => typeof l.language === 'string')).toBe(true)
  })

  it.each(KOTLIN_LESSONS)('$id — code mẫu đạt HẾT test-case', (lesson: ProgrammingLesson) => {
    const kq = lesson.make.testCases.map((c) => {
      const r = chayKotlin(lesson.make.sampleSolution, c.stdinLines)
      return gradeTestCase(c, r.output, r.error)
    })
    const hong = kq
      .filter((r) => !r.passed)
      .map((r) => `[${r.label}] ${r.error ?? r.actual ?? '(ẩn)'}`)
      .join(' | ')
    expect(allTestsPassed(kq), `Bài ${lesson.id}: ${hong}`).toBe(true)
  })

  it.each(KOTLIN_LESSONS)('$id — ví dụ mẫu chạy không lỗi', (lesson: ProgrammingLesson) => {
    const r = chayKotlin(lesson.workedExample.code)
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length).toBeGreaterThan(0)
  })

  it.each(KOTLIN_LESSONS)(
    '$id — KHÔNG dạy thứ nằm ngoài tập con như thể chạy được',
    (lesson: ProgrammingLesson) => {
      for (const code of [
        lesson.workedExample.code,
        lesson.make.sampleSolution,
        lesson.predict.code,
      ]) {
        expect(
          NGOAI_TAP_CON.test(code),
          `Bài ${lesson.id} dùng thứ bộ chạy không có (coroutine/android/java.*…) trong code chạy`,
        ).toBe(false)
      }
    },
  )
})
