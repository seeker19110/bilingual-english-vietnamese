// CỔNG NỘI DUNG cho bài HERMES (PR 3/4 khoá Hermes) — chạy chuỗi lệnh THẬT trên bộ mô phỏng
// (hermesSim.ts) rồi chấm bằng đúng grading.ts học viên gặp, khuôn lessonsGit.test.ts.
//
// Mạch này KHÔNG có khe hở "xanh ở CI, rớt ở người học": engine thuần TypeScript, cổng CI và
// trình duyệt gọi chung một hàm chayLenhHermes().
//
// Ngoài chấm nội dung, cổng canh thêm: bài học KHÔNG được dạy lệnh ngoài bộ lệnh đóng của
// hermesSim như thể chạy được (docker/curl… chỉ được xuất hiện ở lý thuyết/homework).
import { describe, expect, it } from 'vitest'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { chayLenhHermes } from './hermesSim.js'
import { gradeTestCase } from './grading.js'
import type { ProgrammingLesson, ProgrammingTestCase } from './lessonTypes.js'

const HERMES_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'hermes')

/** Lệnh nằm NGOÀI bộ lệnh đóng của hermesSim — cấm xuất hiện trong code CHẠY của bài
 *  (workedExample/predict/parsons/starterCode/sampleSolution/testCases). */
const LENH_NGOAI_DOI = /^\s*(docker|curl|git|npm|pip|bash|sh|telegram)\b/m

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
    const r = chayLenhHermes(code, c.stdinLines)
    return gradeTestCase(c, r.output, r.error)
  })
}

describe('bài học Hermes — cổng nội dung', () => {
  it('có đúng 7 bài chương C1, id không trùng', () => {
    expect(HERMES_LESSONS.length).toBe(7)
    expect(new Set(HERMES_LESSONS.map((l) => l.id)).size).toBe(7)
  })

  for (const lesson of HERMES_LESSONS) {
    describe(`${lesson.id} — ${lesson.title}`, () => {
      it('ví dụ mẫu chạy sạch trên hermesSim (không lỗi)', () => {
        const r = chayLenhHermes(lesson.workedExample.code)
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
        const a = chayLenhHermes(lesson.make.sampleSolution)
        const b = chayLenhHermes(lesson.make.sampleSolution)
        expect(a.output).toBe(b.output)
      })
    })
  }
})
