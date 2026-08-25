// CỔNG NỘI DUNG cho bài SQL (PR-L7b2) — anh em với lessonsPython/lessonsJs.test.ts.
// Chạy truy vấn THẬT trên SQLite (sql.js) rồi chấm bằng đúng grading.ts học viên gặp.
//
// Điểm mạnh riêng của mạch SQL: trình duyệt và cổng CI dùng CHUNG một engine (sql.js) và
// chung sqlDataset.ts + sqlPrelude.ts, nên không có khe hở "xanh ở CI, rớt ở người học".
import { describe, expect, it } from 'vitest'
import initSqlJs from 'sql.js'
import { createRequire } from 'node:module'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { SQL_SEED } from './sqlDataset.js'
import { formatSqlResults, type SqlResultTable } from './sqlPrelude.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingTestCase } from './lessonTypes.js'

const SQL_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'sql')

// Nạp file .wasm thẳng từ node_modules (không mạng, giống cách app tự host trong dist/).
const require = createRequire(import.meta.url)
const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm')
const SQL = await initSqlJs({ locateFile: () => wasmPath })

interface RunOutcome {
  output: string
  error?: string
}

/** Mở CSDL mới tinh, nạp dữ liệu mẫu, chạy câu của học viên — mỗi lượt một CSDL sạch. */
function runSql(sql: string): RunOutcome {
  const db = new SQL.Database()
  try {
    db.run(SQL_SEED)
    const tables = db.exec(sql) as SqlResultTable[]
    return { output: formatSqlResults(tables) }
  } catch (err) {
    return { output: '', error: (err as Error).message }
  } finally {
    db.close()
  }
}

function gradeAll(sql: string, cases: ProgrammingTestCase[]) {
  return cases.map((c) => {
    const r = runSql(sql)
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

describe('nội dung SQL môn Lập trình chạy THẬT trên SQLite (sql.js)', () => {
  it('dữ liệu mẫu nạp được và truy vấn được (chống test rỗng vô nghĩa)', () => {
    expect(runSql('SELECT COUNT(*) AS so_mon FROM mon;').output).toBe('so_mon\n6')
  })

  it('mỗi lượt chạy là một CSDL SẠCH (học viên xoá bảng không ảnh hưởng lượt sau)', () => {
    runSql('DELETE FROM mon;')
    expect(runSql('SELECT COUNT(*) AS con_lai FROM mon;').output).toBe('con_lai\n6')
  })

  it('câu lệnh không trả dòng nào thì nói rõ, không im lặng', () => {
    expect(runSql("INSERT INTO mon VALUES (99, 'Test', 'an', 1000);").output).toBe(
      '(khong co dong nao tra ve)',
    )
  })

  it('ô rỗng in thành NULL để phân biệt với chuỗi rỗng', () => {
    expect(formatSqlResults([{ columns: ['a', 'b'], values: [[null, '']] }])).toBe('a | b\nNULL | ')
  })

  it('câu SQL sai cú pháp trả lỗi có thông điệp, không làm vỡ bộ chấm', () => {
    const r = runSql('SELEC * FROM mon;')
    expect(r.error).toBeTruthy()
  })

  it.each(SQL_LESSONS)('$id — code mẫu đạt HẾT test-case', (lesson) => {
    const results = gradeAll(lesson.make.sampleSolution, lesson.make.testCases)
    expect(allTestsPassed(results), `Bài ${lesson.id}: ${describeFailures(results)}`).toBe(true)
  })

  it.each(SQL_LESSONS)('$id — ví dụ mẫu chạy không lỗi', (lesson) => {
    const r = runSql(lesson.workedExample.code)
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length, `Bài ${lesson.id}: ví dụ mẫu không in gì`).toBeGreaterThan(0)
  })

  it.each(SQL_LESSONS)('$id — đáp án Predict khớp kết quả thật', (lesson) => {
    const r = runSql(lesson.predict.code)
    expect(r.error, `Bài ${lesson.id} code Predict lỗi: ${r.error}`).toBeUndefined()
    const answer = lesson.predict.choices[lesson.predict.answerIndex]!
    expect(
      r.output.includes(answer),
      `Bài ${lesson.id}: đáp án "${answer}" KHÔNG có trong kết quả thật "${r.output}"`,
    ).toBe(true)
    const saiMaKhop = lesson.predict.choices.filter(
      (c, i) => i !== lesson.predict.answerIndex && r.output.includes(c),
    )
    expect(saiMaKhop, `Bài ${lesson.id}: lựa chọn sai lại khớp kết quả`).toEqual([])
  })
})
