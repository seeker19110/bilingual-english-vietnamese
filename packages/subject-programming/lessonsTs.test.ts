// CỔNG NỘI DUNG cho bài TYPESCRIPT (PR-L16) — song sinh với lessonsPython/lessonsJs, nhưng
// đi qua ĐÚNG hai chặng mà học viên gặp: kiểm kiểu bằng tsPrelude.kiemTraTypeScript() rồi
// chạy JavaScript sinh ra trong node:vm bằng đúng jsPrelude của bài JavaScript.
//
// Vì sao cổng này QUAN TRỌNG HƠN các cổng khác một bậc: nội dung làn TS cố tình có bài mà
// code mẫu PHẢI làm trình biên dịch báo lỗi (dạy "type cứu bạn thế nào"). Soạn tay rất dễ
// ghi nhầm mã lỗi TS — cổng chạy tsc thật nên mã lỗi trong test-case là mã lỗi có thật.
//
// Ở đây KHÔNG có rủi ro "hai bản khác nhau" như mạch Python: server và cổng này gọi cùng một
// hàm, cùng một gói typescript của repo.
import { describe, expect, it } from 'vitest'
import vm from 'node:vm'
import ts from 'typescript'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { wrapJavaScript, formatConsoleArgs } from './jsPrelude.js'
import { kiemTraTypeScript, dinhDangKetQuaTs, TIEU_DE_LOI } from './tsPrelude.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingTestCase } from './lessonTypes.js'

const TS_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'typescript')
const RUN_TIMEOUT_MS = 5_000

interface RunOutcome {
  output: string
  error?: string
}

// Một lượt tsc tốn ~2,5 giây, mà chấm một bài là chạy lại cùng đoạn code với nhiều bộ dữ
// liệu. Kết quả kiểm kiểu chỉ phụ thuộc CODE nên nhớ lại theo code — đúng cách tsRunner.ts
// làm ở client (nếu không, mỗi ca test là một lượt biên dịch và cổng này tự hết giờ).
const boNho = new Map<string, ReturnType<typeof kiemTraTypeScript>>()

function bienDich(code: string) {
  const san = boNho.get(code)
  if (san) return san
  const ketQua = kiemTraTypeScript(code, ts)
  boNho.set(code, ketQua)
  return ketQua
}

/** Chạy một bài TS y như học viên: kiểm kiểu trước, còn lỗi thì DỪNG, sạch thì chạy JS. */
function runTs(code: string, stdinLines: string[]): RunOutcome {
  const { loi, js } = bienDich(code)
  if (loi.length > 0) return { output: [TIEU_DE_LOI, ...loi].join('\n') }

  const lines: string[] = []
  const collect = (...args: unknown[]) => {
    lines.push(formatConsoleArgs(args))
  }
  const context = vm.createContext({ console: { log: collect, error: collect } })
  try {
    vm.runInContext(wrapJavaScript(js, stdinLines), context, { timeout: RUN_TIMEOUT_MS })
    return { output: dinhDangKetQuaTs([], lines.join('\n')) }
  } catch (err) {
    return { output: dinhDangKetQuaTs([], lines.join('\n')), error: (err as Error).message }
  }
}

function gradeAll(code: string, cases: ProgrammingTestCase[]) {
  return cases.map((c) => {
    const r = runTs(code, c.stdinLines)
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

describe('nội dung TypeScript môn Lập trình đi qua tsc THẬT', () => {
  it('code sạch kiểu thì chạy và in ra được (chống test rỗng vô nghĩa)', () => {
    const r = runTs('const ten: string = "Lan"\nconsole.log("Chao " + ten)', [])
    expect(r.output).toContain('Chao Lan')
  })

  it('gán sai kiểu thì tsc BẮT ĐƯỢC và chương trình KHÔNG chạy', () => {
    const r = runTs('const tuoi: number = "muoi"\nconsole.log("da chay")', [])
    expect(r.output).toContain('TS2322')
    expect(r.output).not.toContain('da chay')
  })

  it('bật strict thật: tham số không ghi kiểu bị bắt là implicit any', () => {
    const r = runTs('function chao(ten) {\n  return "Chao " + ten\n}\nconsole.log(chao("A"))', [])
    expect(r.output).toContain('TS7006')
  })

  it('thông báo lỗi có SỐ DÒNG để học viên tìm được chỗ sai', () => {
    const r = runTs('const a: number = 1\nconst b: number = "hai"', [])
    expect(r.output).toContain('Dong 2:')
  })

  it.each(TS_LESSONS)('$id — code mẫu đạt HẾT test-case', (lesson) => {
    const results = gradeAll(lesson.make.sampleSolution, lesson.make.testCases)
    expect(allTestsPassed(results), `Bài ${lesson.id}: ${describeFailures(results)}`).toBe(true)
  })

  it.each(TS_LESSONS)('$id — ví dụ mẫu chạy không lỗi', (lesson) => {
    const r = runTs(lesson.workedExample.code, lesson.workedExample.stdinLines)
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length, `Bài ${lesson.id}: ví dụ mẫu không in gì`).toBeGreaterThan(0)
  })

  it.each(TS_LESSONS)('$id — đáp án Predict khớp output thật', (lesson) => {
    const r = runTs(lesson.predict.code, [])
    const answer = lesson.predict.choices[lesson.predict.answerIndex]!
    expect(
      r.output.includes(answer),
      `Bài ${lesson.id}: đáp án "${answer}" KHÔNG có trong output thật "${r.output}"`,
    ).toBe(true)
    const saiMaKhop = lesson.predict.choices.filter(
      (c, i) => i !== lesson.predict.answerIndex && r.output.includes(c),
    )
    expect(saiMaKhop, `Bài ${lesson.id}: lựa chọn sai lại khớp output`).toEqual([])
  })
})
