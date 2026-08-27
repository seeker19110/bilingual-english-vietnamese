// Test core-examplan — lập lịch ngược từ ngày thi.
// Bảng ca biên ở mục 5 đặc tả (dac-ta-che-do-on-thi-2026-08-26.md) được kiểm ĐỦ ở đây: lập lịch
// sai không làm CI đỏ ở đâu khác, chỉ làm người học học sai nhịp rồi thi trượt.

import { describe, it, expect } from 'vitest'
import {
  buildExamPlan,
  effectiveDaysLeft,
  hasNoStudyDay,
  phaseOf,
  ExamDatePassedError,
  type ExamPlanInput,
} from './examPlan.js'

const TODAY = '2026-08-26' // thứ tư

function input(over: Partial<ExamPlanInput> = {}): ExamPlanInput {
  return {
    today: TODAY,
    examDate: '2026-12-26',
    scopeItems: 1000,
    masteredItems: 200,
    dueToday: 10,
    dailyCapItems: 20,
    restDays: [],
    ...over,
  }
}

describe('phaseOf', () => {
  it('T-3 trở xuống là taper, T-14 trở xuống là consolidate, xa hơn là build', () => {
    expect(phaseOf(0)).toBe('taper')
    expect(phaseOf(3)).toBe('taper')
    expect(phaseOf(4)).toBe('consolidate')
    expect(phaseOf(14)).toBe('consolidate')
    expect(phaseOf(15)).toBe('build')
    expect(phaseOf(200)).toBe('build')
  })
})

describe('effectiveDaysLeft', () => {
  it('tính cả ngày hôm nay lẫn ngày thi', () => {
    expect(effectiveDaysLeft('2026-08-26', '2026-08-28', [])).toBe(3)
  })

  it('trừ đúng ngày nghỉ trong tuần', () => {
    // 26/8 tư · 27 năm · 28 sáu · 29 bảy · 30 CN. Nghỉ thứ bảy (6) và CN (0) → còn 3.
    expect(effectiveDaysLeft('2026-08-26', '2026-08-30', [6, 0])).toBe(3)
  })

  it('nghỉ cả 7 ngày vẫn KHÔNG trả 0 — không bao giờ chia cho 0', () => {
    expect(effectiveDaysLeft('2026-08-26', '2026-12-26', [0, 1, 2, 3, 4, 5, 6])).toBe(1)
    expect(hasNoStudyDay([0, 1, 2, 3, 4, 5, 6])).toBe(true)
    expect(hasNoStudyDay([0, 6])).toBe(false)
  })
})

describe('buildExamPlan — ca biên bắt buộc (mục 5 đặc tả)', () => {
  it('ngày thi LÀ HÔM NAY → 1 ngày hữu dụng, phase taper, không học mục mới', () => {
    const out = buildExamPlan(input({ examDate: TODAY }))
    expect(out.daysLeft).toBe(0)
    expect(out.effectiveDaysLeft).toBe(1)
    expect(out.phase).toBe('taper')
    expect(out.todayNewItems).toBe(0)
  })

  it('ngày thi ĐÃ QUA → ném lỗi, KHÔNG trả số ngày âm', () => {
    expect(() => buildExamPlan(input({ examDate: '2026-08-25' }))).toThrow(ExamDatePassedError)
  })

  it('nghỉ cả 7 ngày → vẫn ra kế hoạch, không NaN/Infinity', () => {
    const out = buildExamPlan(input({ restDays: [0, 1, 2, 3, 4, 5, 6] }))
    expect(Number.isFinite(out.todayNewItems)).toBe(true)
    expect(out.effectiveDaysLeft).toBe(1)
  })

  it('đã thuộc NHIỀU HƠN phạm vi → 0 mục mới, không âm', () => {
    const out = buildExamPlan(input({ scopeItems: 100, masteredItems: 500 }))
    expect(out.todayNewItems).toBe(0)
    expect(out.feasibility).toBe('comfortable')
    expect(out.suggestedScopeCut).toBeNull()
  })

  it('ôn đến hạn ngốn hết trần ngày → 0 mục mới, không âm', () => {
    const out = buildExamPlan(input({ dueToday: 50, dailyCapItems: 20 }))
    expect(out.todayReviewItems).toBe(20)
    expect(out.todayNewItems).toBe(0)
  })

  it('còn 200 ngày, phạm vi nhỏ → thoải mái nhưng vẫn ≥ 1 mục/ngày (không đứng im)', () => {
    const out = buildExamPlan(
      input({ examDate: '2027-03-14', scopeItems: 300, masteredItems: 0, dueToday: 0 }),
    )
    expect(out.feasibility).toBe('comfortable')
    expect(out.todayNewItems).toBeGreaterThanOrEqual(1)
  })

  it('còn 3 ngày, phạm vi lớn → not-feasible + đề xuất cắt phạm vi > 0', () => {
    const out = buildExamPlan(
      input({ examDate: '2026-08-29', scopeItems: 1000, masteredItems: 0, dueToday: 0 }),
    )
    expect(out.feasibility).toBe('not-feasible')
    expect(out.suggestedScopeCut).toBeGreaterThan(0)
  })

  it('ngày tính theo chuỗi ngày VN, không lệch khi chạy ở múi giờ khác', () => {
    // Cùng cặp ngày cho ra cùng kết quả bất kể TZ của tiến trình: hàm chỉ nhận chuỗi 'YYYY-MM-DD'
    // và quy về mốc UTC nửa đêm — không đọc đồng hồ máy.
    const a = buildExamPlan(input({ today: '2026-08-26', examDate: '2026-08-30' }))
    const b = buildExamPlan(input({ today: '2026-08-26', examDate: '2026-08-30' }))
    expect(a).toEqual(b)
    expect(a.daysLeft).toBe(4)
  })
})

describe('buildExamPlan — quy tắc phân bổ', () => {
  it('ôn được ưu tiên trước học mới trong cùng trần ngày', () => {
    const out = buildExamPlan(input({ dueToday: 15, dailyCapItems: 20, scopeItems: 10_000 }))
    expect(out.todayReviewItems).toBe(15)
    expect(out.todayNewItems).toBe(5) // chỉ còn 5 chỗ
  })

  it('taper không thêm mục mới KỂ CẢ khi còn chỗ trống', () => {
    const out = buildExamPlan(
      input({ examDate: '2026-08-28', dueToday: 0, dailyCapItems: 20, scopeItems: 10_000 }),
    )
    expect(out.phase).toBe('taper')
    expect(out.todayNewItems).toBe(0)
  })

  it('requestRetention tăng dần theo giai đoạn', () => {
    const build = buildExamPlan(input({ examDate: '2026-12-26' })).requestRetention
    const consolidate = buildExamPlan(input({ examDate: '2026-09-05' })).requestRetention
    const taper = buildExamPlan(input({ examDate: '2026-08-28' })).requestRetention
    expect(build).toBeLessThan(consolidate)
    expect(consolidate).toBeLessThan(taper)
    expect(taper).toBeLessThanOrEqual(0.95)
  })

  it('dùng gần hết chỗ trống mỗi ngày → "tight", người học được cảnh báo trước', () => {
    // Còn 10 ngày, 180 mục, trần 20/ngày và không có thẻ ôn ⇒ cần 18/20 = 90% chỗ.
    const out = buildExamPlan(
      input({
        examDate: '2026-09-04',
        scopeItems: 180,
        masteredItems: 0,
        dueToday: 0,
        dailyCapItems: 20,
      }),
    )
    expect(out.feasibility).toBe('tight')
    expect(out.suggestedScopeCut).toBeNull()
  })

  it('trần ngày = 0 (cấu hình lỗi) → không chia cho 0, không âm', () => {
    const out = buildExamPlan(input({ dailyCapItems: 0, dueToday: 5 }))
    expect(out.todayReviewItems).toBe(0)
    expect(out.todayNewItems).toBe(0)
    expect(out.feasibility).toBe('not-feasible')
    expect(out.suggestedScopeCut).toBeGreaterThan(0)
  })

  it('dueToday âm (dữ liệu rác) được kẹp về 0', () => {
    expect(buildExamPlan(input({ dueToday: -5 })).todayReviewItems).toBe(0)
  })
})
