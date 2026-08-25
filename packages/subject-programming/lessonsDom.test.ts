// CỔNG NỘI DUNG cho bài DOM (PR-L7d) — chạy JavaScript của học viên trên trang thật rồi diễn
// các hành động người dùng, chấm trên cây DOM SAU KHI mọi thứ đã xảy ra.
//
// Cổng này và Worker trong trình duyệt gọi CÙNG hàm chayBaiDom() với CÙNG thư viện linkedom,
// nên không có khe hở "xanh ở CI, rớt ở người học".
import { describe, expect, it } from 'vitest'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { chayBaiDom } from './domPrelude.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingLesson, ProgrammingTestCase } from './lessonTypes.js'

const DOM_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'dom')

const TRANG_THU = `<!doctype html><html lang="vi"><body>
<button id="nut">+1</button><span id="so">0</span><input id="ten" /></body></html>`

function gradeAll(lesson: ProgrammingLesson, js: string, cases: ProgrammingTestCase[]) {
  return cases.map((c) => {
    const r = chayBaiDom(lesson.domHtml!, js, c.stdinLines)
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

describe('nội dung DOM môn Lập trình chạy THẬT trên trang', () => {
  it('script chạy được và sửa được trang (chống test rỗng vô nghĩa)', () => {
    const r = chayBaiDom(TRANG_THU, 'document.getElementById("so").textContent = "9"', [])
    expect(r.output).toContain('span id="so" "9"')
  })

  it('hành động click phát sự kiện thật tới listener của học viên', () => {
    const js = `document.getElementById('nut').addEventListener('click', () => {
      const so = document.getElementById('so')
      so.textContent = String(Number(so.textContent) + 1)
    })`
    expect(chayBaiDom(TRANG_THU, js, ['click #nut', 'click #nut']).output).toContain('"2"')
  })

  it('hành động dien đặt giá trị rồi phát sự kiện input', () => {
    const js = `document.getElementById('ten').addEventListener('input', (e) => {
      document.getElementById('so').textContent = e.target.value
    })`
    expect(chayBaiDom(TRANG_THU, js, ['dien #ten = Lan']).output).toContain('span id="so" "Lan"')
  })

  it('mỗi lượt là một trang MỚI — không dính trạng thái lượt trước', () => {
    chayBaiDom(TRANG_THU, 'document.getElementById("so").textContent = "999"', [])
    expect(chayBaiDom(TRANG_THU, '', []).output).toContain('span id="so" "0"')
  })

  it('bộ chọn không tồn tại thì báo lỗi rõ ràng thay vì im lặng bỏ qua', () => {
    const r = chayBaiDom(TRANG_THU, '', ['click #khong-co'])
    expect(r.error).toContain('Không tìm thấy phần tử')
  })

  it('hành động sai cú pháp nói rõ cú pháp đúng', () => {
    expect(chayBaiDom(TRANG_THU, '', ['bam nut']).error).toContain('Chỉ nhận')
  })

  it('lỗi trong script của học viên được trả về, không làm vỡ bộ chấm', () => {
    const r = chayBaiDom(TRANG_THU, 'document.getElementById("khong-co").textContent = "x"', [])
    expect(r.error).toBeTruthy()
    expect(r.output).toBe('')
  })

  it.each(DOM_LESSONS)('$id — code mẫu đạt HẾT test-case', (lesson) => {
    const results = gradeAll(lesson, lesson.make.sampleSolution, lesson.make.testCases)
    expect(allTestsPassed(results), `Bài ${lesson.id}: ${describeFailures(results)}`).toBe(true)
  })

  it.each(DOM_LESSONS)('$id — ví dụ mẫu chạy không lỗi', (lesson) => {
    const r = chayBaiDom(
      lesson.domHtml!,
      lesson.workedExample.code,
      lesson.workedExample.stdinLines,
    )
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length).toBeGreaterThan(0)
  })

  it.each(DOM_LESSONS)('$id — đáp án Predict khớp cây DOM thật', (lesson) => {
    const r = chayBaiDom(lesson.domHtml!, lesson.predict.code, [])
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
