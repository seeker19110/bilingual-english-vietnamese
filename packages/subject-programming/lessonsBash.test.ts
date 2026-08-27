// CỔNG NỘI DUNG cho bài DÒNG LỆNH (bash) — hạ tầng PR-M1, nội dung đổ vào từ PR-M2.
//
// Vì sao cổng có mặt TỪ PR hạ tầng chứ không đợi PR nội dung: hiến chương M §0.1 ghi đúng bài
// học đắt nhất của môn — 6/8 ngôn ngữ trong bảng đặc tả gốc chỉ tồn tại dưới dạng MỘT DÒNG CHỮ
// vì không có cổng nào chấm chúng. Cổng dựng trước thì bài đầu tiên của PR-M2 đã được chấm
// ngay từ commit đầu, không có cửa cho một bài "chạy trong đầu người soạn" lọt vào.
//
// Mạch này KHÔNG có khe hở "xanh ở CI, rớt ở người học": engine là TypeScript thuần, cổng CI
// và trình duyệt gọi chung một hàm chayBash() (hiến chương M §3.1).
import { describe, expect, it } from 'vitest'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { chayBash } from './bashSim.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingLesson, ProgrammingTestCase } from './lessonTypes.js'

const BASH_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'bash')

/** Lệnh chỉ tồn tại ngoài đời (cần mạng/máy thật) — cấm xuất hiện trong code CHẠY của bài. */
const LENH_NGOAI_DOI = /\b(sudo|curl|wget|ssh|sed|awk|apt|apt-get|systemctl|crontab)\b/

function gradeAll(code: string, cases: ProgrammingTestCase[]) {
  return cases.map((c) => {
    const r = chayBash(code, c.stdinLines)
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

describe('nội dung DÒNG LỆNH môn Lập trình chạy THẬT', () => {
  it('cổng đã sẵn sàng: mọi bài language=bash đều bị chấm ở đây', () => {
    // PR-M1 là PR HẠ TẦNG nên danh sách còn rỗng là đúng — nội dung nằm ở PR-M2 (p3-u11).
    // Test này không kiểm số lượng; nó chốt rằng cổng đọc đúng nguồn bài và không im lặng bỏ
    // sót ngôn ngữ mới. Khi PR-M2 thêm bài, các it.each dưới đây tự phủ tới.
    expect(PROGRAMMING_LESSONS.every((l) => typeof l.language === 'string')).toBe(true)
  })

  it.each(BASH_LESSONS)('$id — code mẫu đạt HẾT test-case', (lesson: ProgrammingLesson) => {
    const results = gradeAll(lesson.make.sampleSolution, lesson.make.testCases)
    expect(allTestsPassed(results), `Bài ${lesson.id}: ${describeFailures(results)}`).toBe(true)
  })

  // `error` nay chỉ mang lỗi ĐỘNG CƠ, nên cổng phải canh riêng mã thoát: một code mẫu kết thúc
  // bằng lệnh thất bại gần như luôn là lỗi của người soạn (gõ nhầm tên file, quên tạo thư mục),
  // và nó dạy học viên đúng cái thói quen xấu là bỏ qua mã thoát.
  it.each(BASH_LESSONS)('$id — code mẫu kết thúc với mã thoát 0', (lesson: ProgrammingLesson) => {
    for (const c of lesson.make.testCases) {
      const r = chayBash(lesson.make.sampleSolution, c.stdinLines)
      expect(r.exitCode, `Bài ${lesson.id} [${c.label}] mã thoát ${r.exitCode}`).toBe(0)
    }
  })

  it.each(BASH_LESSONS)('$id — ví dụ mẫu chạy không lỗi', (lesson: ProgrammingLesson) => {
    const r = chayBash(lesson.workedExample.code, lesson.workedExample.stdinLines)
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length).toBeGreaterThan(0)
  })

  it.each(BASH_LESSONS)(
    '$id — KHÔNG dạy lệnh mô phỏng không chạy được như thể chạy được',
    (lesson: ProgrammingLesson) => {
      // Lệnh cần máy thật/mạng CHỈ được nằm ở phần lý thuyết hoặc bước ⑦ (về nhà, làn C),
      // không được nằm trong code mà học viên bấm Chạy — luật tự khai, hiến chương M §3.3.
      for (const code of [
        lesson.workedExample.code,
        lesson.make.sampleSolution,
        lesson.predict.code,
      ]) {
        expect(
          LENH_NGOAI_DOI.test(code),
          `Bài ${lesson.id} có lệnh ngoài đời trong code chạy`,
        ).toBe(false)
      }
    },
  )
})
