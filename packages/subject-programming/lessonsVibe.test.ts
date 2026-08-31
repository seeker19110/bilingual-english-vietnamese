// CỔNG NỘI DUNG cho bài VIBE CODE — chạy chuỗi lệnh THẬT trên bộ mô phỏng (vibeSim.ts) rồi
// chấm bằng đúng grading.ts học viên gặp, khuôn lessonsHermes.test.ts.
//
// Mạch này KHÔNG có khe hở "xanh ở CI, rớt ở người học": engine thuần TypeScript, cổng CI và
// trình duyệt gọi chung một hàm chayLenhVibe().
//
// Ngoài chấm nội dung, cổng canh thêm: bài học KHÔNG được dạy lệnh ngoài bộ lệnh đóng của
// vibeSim như thể chạy được (công cụ thật/git/npm… chỉ được xuất hiện ở lý thuyết/homework).
import { describe, expect, it } from 'vitest'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { chayLenhVibe } from './vibeSim.js'
import { gradeTestCase } from './grading.js'
import type { ProgrammingLesson, ProgrammingTestCase } from './lessonTypes.js'

const VIBE_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'vibe')

/** Lệnh nằm NGOÀI bộ lệnh đóng của vibeSim — cấm xuất hiện trong code CHẠY của bài
 *  (workedExample/predict/parsons/starterCode/sampleSolution/testCases). */
const LENH_NGOAI_DOI = /^\s*(docker|curl|git|npm|pip|bash|sh|cursor|claude|npx|yarn)\b/m

function maChayCua(lesson: ProgrammingLesson): string[] {
  return [
    lesson.workedExample.code,
    lesson.predict.code,
    lesson.parsons.lines.join('\n'),
    lesson.make.starterCode,
    lesson.make.sampleSolution,
    ...lesson.make.testCases.flatMap((c) => c.stdinLines),
  ]
}

function gradeAll(code: string, cases: ProgrammingTestCase[]) {
  return cases.map((c) => {
    const r = chayLenhVibe(code, c.stdinLines)
    return gradeTestCase(c, r.output, r.error)
  })
}

describe('bài học Vibe Code — cổng nội dung', () => {
  it('có đúng 20 bài (4 chương), id không trùng', () => {
    expect(VIBE_LESSONS.length).toBe(20)
    expect(new Set(VIBE_LESSONS.map((l) => l.id)).size).toBe(20)
  })

  for (const lesson of VIBE_LESSONS) {
    describe(`${lesson.id} — ${lesson.title}`, () => {
      it('ví dụ mẫu chạy sạch trên vibeSim (không lỗi)', () => {
        const r = chayLenhVibe(lesson.workedExample.code)
        expect(r.error, `workedExample lỗi: ${r.error}`).toBeUndefined()
      })

      it('sampleSolution đạt 100% test-case', () => {
        const results = gradeAll(lesson.make.sampleSolution, lesson.make.testCases)
        const rot = results.filter((r) => !r.passed)
        expect(
          rot.length,
          rot.map((r) => `[${r.label}] ${r.error ?? r.actual ?? ''}`).join(' | '),
        ).toBe(0)
      })

      it('starterCode (phần không phải comment) KHÔNG tự đạt bài — đề không tự giải', () => {
        const results = gradeAll(lesson.make.starterCode, lesson.make.testCases)
        expect(results.every((r) => r.passed)).toBe(false)
      })

      it('không dạy lệnh ngoài bộ lệnh đóng của mô phỏng trong code chạy', () => {
        for (const code of maChayCua(lesson)) {
          expect(LENH_NGOAI_DOI.test(code), `lệnh ngoài đời trong: ${code.slice(0, 60)}`).toBe(
            false,
          )
        }
      })

      it('TẤT ĐỊNH: sampleSolution chạy hai lần cho output y hệt', () => {
        const a = chayLenhVibe(lesson.make.sampleSolution)
        const b = chayLenhVibe(lesson.make.sampleSolution)
        expect(a.output).toBe(b.output)
      })
    })
  }
})
