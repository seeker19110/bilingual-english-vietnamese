// CỔNG NỘI DUNG cho bài JAVASCRIPT (PR-L7b1) — song sinh với lessonsPython.test.ts, cùng
// nguyên tắc: chạy code THẬT rồi chấm bằng ĐÚNG engine chấm mà học viên gặp (grading.ts).
//   1. mọi `make.sampleSolution`  → phải đạt HẾT test-case của bài
//   2. mọi `workedExample.code`   → phải chạy không lỗi và có in ra
//   3. mọi `predict.code` + đáp án → output thật phải khớp lựa chọn đúng, và KHÔNG lựa chọn
//      sai nào cùng khớp (chống soạn nhầm hai đáp án cùng đúng)
//
// Khác cổng Python một điểm QUAN TRỌNG: ở đây không có rủi ro "hai bản khác nhau". Cổng
// Python chạy python3 của hệ điều hành còn học viên chạy Pyodide; bài JavaScript thì cả hai
// nơi cùng là JavaScript và cùng dùng wrapJavaScript()/formatConsoleArgs() của jsPrelude.ts.
//
// Cách ly: node:vm với context RỖNG — code bài học không thấy require, process, fs, fetch.
import { describe, expect, it } from 'vitest'
import vm from 'node:vm'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { wrapJavaScript, formatConsoleArgs } from './jsPrelude.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingTestCase } from './lessonTypes.js'

const JS_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'javascript')

const RUN_TIMEOUT_MS = 5_000

interface RunOutcome {
  output: string
  error?: string
}

function runJs(code: string, stdinLines: string[]): RunOutcome {
  const lines: string[] = []
  const collect = (...args: unknown[]) => {
    lines.push(formatConsoleArgs(args))
  }
  // Context rỗng + chỉ cấp console: không require, không process, không mạng, không đĩa.
  const context = vm.createContext({ console: { log: collect, error: collect } })
  try {
    vm.runInContext(wrapJavaScript(code, stdinLines), context, { timeout: RUN_TIMEOUT_MS })
    return { output: lines.join('\n') }
  } catch (err) {
    return { output: lines.join('\n'), error: (err as Error).message }
  }
}

function gradeAll(code: string, cases: ProgrammingTestCase[]) {
  return cases.map((c) => {
    const r = runJs(code, c.stdinLines)
    return gradeTestCase(c, r.output, r.error)
  })
}

function describeFailures(results: ReturnType<typeof gradeAll>): string {
  return results
    .filter((r) => !r.passed)
    .map(
      (r) => `[${r.label}] ${r.error ? `LỖI: ${r.error}` : `output thật: ${r.actual ?? '(ẩn)'}`}`,
    )
    .join(' | ')
}

describe('nội dung JavaScript môn Lập trình chạy THẬT trong node:vm', () => {
  it('chạy được và gom đúng output (chống test rỗng vô nghĩa)', () => {
    expect(runJs('console.log("ok", 1 + 1)', []).output).toBe('ok 2')
  })

  it('input() đọc tuần tự và echo giống bản Python', () => {
    const r = runJs('const x = input("Nhap: ");\nconsole.log("Ban go: " + x);', ['5'])
    expect(r.output).toBe('Nhap: 5\nBan go: 5')
  })

  it('hết dòng nhập thì báo lỗi rõ ràng, không im lặng trả undefined', () => {
    const r = runJs('input("a");\ninput("b");', ['chi co mot dong'])
    expect(r.error).toContain('het dong')
  })

  it('code bài học KHÔNG với tới được require/process/fetch', () => {
    for (const ten of ['require', 'process', 'fetch']) {
      expect(runJs(`console.log(typeof ${ten})`, []).output).toBe('undefined')
    }
  })

  // Bậc P3 mới có bài JavaScript đầu tiên; khi chưa có bài nào thì các khối dưới đây rỗng —
  // test trên đã đủ chứng minh cổng còn sống.
  it.each(JS_LESSONS)('$id — code mẫu đạt HẾT test-case', (lesson) => {
    const results = gradeAll(lesson.make.sampleSolution, lesson.make.testCases)
    expect(allTestsPassed(results), `Bài ${lesson.id}: ${describeFailures(results)}`).toBe(true)
  })

  it.each(JS_LESSONS)('$id — ví dụ mẫu chạy không lỗi', (lesson) => {
    const r = runJs(lesson.workedExample.code, lesson.workedExample.stdinLines)
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length, `Bài ${lesson.id}: ví dụ mẫu không in gì`).toBeGreaterThan(0)
  })

  it.each(JS_LESSONS)('$id — đáp án Predict khớp output thật', (lesson) => {
    const r = runJs(lesson.predict.code, [])
    expect(r.error, `Bài ${lesson.id} code Predict lỗi: ${r.error}`).toBeUndefined()
    const answer = lesson.predict.choices[lesson.predict.answerIndex]!
    // Đáp án của bài Predict JS là câu tiếng Việt mô tả nhiều dòng ("105 rồi 15") nên so
    // theo TỪNG MẢNH số/chuỗi trong đáp án, không so nguyên câu.
    const manh = answer.split(/\s+rồi\s+/)
    const dong = r.output.split('\n')
    expect(
      manh.every((m, i) => dong[i]?.includes(m)),
      `Bài ${lesson.id}: đáp án "${answer}" KHÔNG khớp output thật "${r.output}"`,
    ).toBe(true)
    const saiMaKhop = lesson.predict.choices.filter(
      (c, i) =>
        i !== lesson.predict.answerIndex &&
        c.split(/\s+rồi\s+/).every((m, j) => dong[j]?.includes(m)),
    )
    expect(saiMaKhop, `Bài ${lesson.id}: lựa chọn sai lại khớp output`).toEqual([])
  })
})
