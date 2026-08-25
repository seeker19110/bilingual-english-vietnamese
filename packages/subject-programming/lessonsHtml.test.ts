// CỔNG NỘI DUNG cho bài HTML/CSS (PR-L7c) — anh em với cổng Python/JavaScript/SQL.
// Dựng trang THẬT bằng happy-dom rồi chấm trên bản mô tả cây DOM (htmlPrelude.ts), đúng thứ
// mà học viên nhìn thấy và đúng bộ chấm grading.ts.
//
// KHÁC hai mạch kia một điểm phải nói rõ: parser ở đây là happy-dom, còn trong trình duyệt là
// DOMParser thật — hai bản phân tích cú pháp khác nhau (bộ đi cây thì dùng chung). Với HTML
// của người mới hai bên tương đương; E2E chạy code mẫu trong Chromium thật là lưới bắt lệch.
import { describe, expect, it } from 'vitest'
import { Window } from 'happy-dom'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { moTaCayDom, type ElementLike } from './htmlPrelude.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingTestCase } from './lessonTypes.js'

const HTML_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'html')

interface RunOutcome {
  output: string
  error?: string
}

/** Dựng trang rồi mô tả cây DOM — mỗi lượt một cửa sổ mới, không dính trạng thái lượt trước. */
function runHtml(html: string): RunOutcome {
  const win = new Window()
  try {
    win.document.write(html)
    return { output: moTaCayDom(win.document.documentElement as unknown as ElementLike) }
  } catch (err) {
    return { output: '', error: (err as Error).message }
  } finally {
    win.close()
  }
}

function gradeAll(html: string, cases: ProgrammingTestCase[]) {
  return cases.map((c) => {
    const r = runHtml(html)
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

describe('nội dung HTML/CSS môn Lập trình dựng trang THẬT', () => {
  it('dựng được trang và mô tả được cây (chống test rỗng vô nghĩa)', () => {
    expect(runHtml('<!doctype html><html><body><h1>Chao</h1></body></html>').output).toContain(
      'h1 "Chao"',
    )
  })

  it('thẻ quên đóng vẫn dựng được — trình duyệt tự sửa, cổng chấm cũng phải vậy', () => {
    // Người mới quên </li> suốt; nếu cổng đổ vỡ ở đây thì học viên nhận lỗi vô nghĩa.
    const r = runHtml('<!doctype html><html><body><ul><li>Mot<li>Hai</ul></body></html>')
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('li "Mot"')
    expect(r.output).toContain('li "Hai"')
  })

  it.each(HTML_LESSONS)('$id — code mẫu đạt HẾT test-case', (lesson) => {
    const results = gradeAll(lesson.make.sampleSolution, lesson.make.testCases)
    expect(allTestsPassed(results), `Bài ${lesson.id}: ${describeFailures(results)}`).toBe(true)
  })

  it.each(HTML_LESSONS)('$id — ví dụ mẫu dựng được và có nội dung', (lesson) => {
    const r = runHtml(lesson.workedExample.code)
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length, `Bài ${lesson.id}: ví dụ mẫu rỗng`).toBeGreaterThan(0)
  })

  it.each(HTML_LESSONS)('$id — đáp án Predict khớp cây DOM thật', (lesson) => {
    const r = runHtml(lesson.predict.code)
    expect(r.error, `Bài ${lesson.id} code Predict lỗi: ${r.error}`).toBeUndefined()
    const answer = lesson.predict.choices[lesson.predict.answerIndex]!
    expect(
      r.output.includes(answer),
      `Bài ${lesson.id}: đáp án "${answer}" KHÔNG có trong cây thật "${r.output}"`,
    ).toBe(true)
    const saiMaKhop = lesson.predict.choices.filter(
      (c, i) => i !== lesson.predict.answerIndex && r.output.includes(c),
    )
    expect(saiMaKhop, `Bài ${lesson.id}: lựa chọn sai lại khớp cây thật`).toEqual([])
  })
})
