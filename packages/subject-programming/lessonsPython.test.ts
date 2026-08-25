// CỔNG NỘI DUNG MẠNH NHẤT của môn Lập trình: chạy code THẬT bằng python3 rồi chấm bằng
// ĐÚNG engine mà học viên gặp (grading.ts), cho:
//   1. mọi `make.sampleSolution` của bài học   → phải đạt HẾT test-case của bài
//   2. mọi `workedExample.code`                 → phải chạy không lỗi (ví dụ mẫu không được vỡ)
//   3. mọi `predict.code` + đáp án              → output thật phải khớp lựa chọn đúng
//   4. mọi `referenceCode` của bước dự án trục  → phải đạt HẾT milestone check của bước
//
// Vì sao cần: soạn nội dung bằng tay rất dễ sai số học/định dạng chuỗi (đã xảy ra thật ở
// PR-L3: 150 kWh ghi nhầm 305.850 thay vì 306.000). Test số học đối chiếu chỉ bắt được lỗi
// TÍNH; cổng này bắt cả lỗi CODE (thụt lề, tên biến, thiếu dòng in, sai định dạng f-string).
//
// Môi trường: cần python3 trên PATH (runner ubuntu của GitHub Actions luôn có; container dev
// cũng có). KHÔNG có python3 → test tự bỏ qua kèm cảnh báo, KHÔNG làm đỏ CI oan.
import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { P1_PROJECT_STEPS } from './projectSteps.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingTestCase } from './lessonTypes.js'

const hasPython = spawnSync('python3', ['--version']).status === 0
const WORK_DIR = mkdtempSync(join(tmpdir(), 'dhcb-lesson-'))

// Prelude PHẢI khớp hành vi input() của sandbox trình duyệt (apps/dhcb/src/workers/
// pyodideWorker.ts): đọc tuần tự các dòng đã điền sẵn và ECHO "prompt + giá trị" ra stdout.
// Lệch prelude = test xanh nhưng học viên vẫn rớt → giữ hai nơi này khớp nhau.
function wrap(code: string, stdinLines: string[]): string {
  return `import builtins, json
_lines = json.loads(${JSON.stringify(JSON.stringify(stdinLines))})
_it = iter(_lines)
def _input(prompt=""):
    try:
        value = next(_it)
    except StopIteration:
        raise EOFError("het du lieu nhap")
    print(f"{prompt}{value}")
    return value
builtins.input = _input

${code}
`
}

interface RunOutcome {
  output: string
  error?: string
}

function runPython3(code: string, stdinLines: string[]): RunOutcome {
  try {
    const output = execFileSync('python3', ['-c', wrap(code, stdinLines)], {
      encoding: 'utf8',
      timeout: 15_000,
      // Chạy trong thư mục TẠM: bài học P2-U6 ghi file CSV thật, không được để nó rơi
      // vào cây mã nguồn của repo khi chạy test.
      cwd: WORK_DIR,
      // Không cho code mẫu đọc stdin thật (mọi input phải đi qua prelude).
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { output }
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string }
    return { output: e.stdout ?? '', error: (e.stderr || e.message || 'lỗi chạy python3').trim() }
  }
}

function gradeAll(code: string, cases: ProgrammingTestCase[]) {
  return cases.map((c) => {
    const r = runPython3(code, c.stdinLines)
    return gradeTestCase(c, r.output, r.error)
  })
}

// Mô tả lỗi gọn cho người soạn nội dung biết sai ở ca nào.
function describeFailures(results: ReturnType<typeof gradeAll>): string {
  return results
    .filter((r) => !r.passed)
    .map(
      (r) => `[${r.label}] ${r.error ? `LỖI: ${r.error}` : `output thật: ${r.actual ?? '(ẩn)'}`}`,
    )
    .join(' | ')
}

describe.skipIf(!hasPython)('nội dung môn Lập trình chạy THẬT bằng python3', () => {
  it('có python3 và chạy được (chống test rỗng vô nghĩa)', () => {
    expect(runPython3('print("ok")', []).output.trim()).toBe('ok')
  })

  it.each(PROGRAMMING_LESSONS)('$id — code mẫu đạt HẾT test-case', (lesson) => {
    const results = gradeAll(lesson.make.sampleSolution, lesson.make.testCases)
    expect(allTestsPassed(results), `Bài ${lesson.id}: ${describeFailures(results)}`).toBe(true)
  })

  it.each(PROGRAMMING_LESSONS)('$id — ví dụ mẫu chạy không lỗi', (lesson) => {
    const r = runPython3(lesson.workedExample.code, lesson.workedExample.stdinLines)
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length, `Bài ${lesson.id}: ví dụ mẫu không in gì`).toBeGreaterThan(0)
  })

  it.each(PROGRAMMING_LESSONS)('$id — đáp án Predict khớp output thật', (lesson) => {
    const r = runPython3(lesson.predict.code, [])
    expect(r.error, `Bài ${lesson.id} code Predict lỗi: ${r.error}`).toBeUndefined()
    const answer = lesson.predict.choices[lesson.predict.answerIndex]!
    // Lựa chọn đúng phải xuất hiện trong output thật; các lựa chọn SAI thì không được
    // trùng khớp (tránh soạn nhầm 2 đáp án cùng đúng).
    expect(
      r.output.includes(answer),
      `Bài ${lesson.id}: đáp án "${answer}" KHÔNG có trong output thật "${r.output.trim()}"`,
    ).toBe(true)
    const wrongMatches = lesson.predict.choices.filter(
      (c, i) => i !== lesson.predict.answerIndex && r.output.includes(c),
    )
    expect(wrongMatches, `Bài ${lesson.id}: lựa chọn sai lại khớp output`).toEqual([])
  })

  it.each(P1_PROJECT_STEPS)('$id — code tham chiếu đạt HẾT milestone check', (step) => {
    const results = gradeAll(step.referenceCode, step.checks)
    expect(allTestsPassed(results), `Bước ${step.id}: ${describeFailures(results)}`).toBe(true)
  })
})
