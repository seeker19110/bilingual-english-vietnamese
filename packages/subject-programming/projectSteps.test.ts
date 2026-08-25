// Bất biến dữ liệu các bước dự án trục chặng P1 — kèm KIỂM SỐ HỌC đối chiếu độc lập
// (bài học từ lessons.test.ts: test số học đã bắt được lỗi tính tay khi soạn).
import { describe, expect, it } from 'vitest'
import {
  P1_PROJECT_STEPS,
  ProjectStepSchema,
  getProjectStep,
  PROJECT_STARTER_CODE,
  PROJECT_MAIN_FILE,
} from './projectSteps.js'
import { PROGRAMMING_LEVELS } from './curriculum.js'

const P1_UNIT_IDS = new Set(PROGRAMMING_LEVELS.find((l) => l.id === 'p1')!.units.map((u) => u.id))
const GIA = [5000, 15000, 10000]
const thanhToan = (tong: number) =>
  tong >= 100_000 ? Math.floor(tong * 0.8) : tong >= 50_000 ? Math.floor(tong * 0.9) : tong

describe('P1 project steps', () => {
  it('đúng khuôn schema, id tuần tự p1-s1..s5, unit tồn tại, bước cuối là milestone', () => {
    expect(P1_PROJECT_STEPS.map((s) => s.id)).toEqual(['p1-s1', 'p1-s2', 'p1-s3', 'p1-s4', 'p1-s5'])
    for (const step of P1_PROJECT_STEPS) {
      expect(ProjectStepSchema.safeParse(step).success).toBe(true)
      expect(P1_UNIT_IDS.has(step.unitId)).toBe(true)
      expect(step.checks.some((c) => !c.hidden)).toBe(true) // luôn có ca hiện để học viên đối chiếu
    }
    expect(P1_PROJECT_STEPS.at(-1)!.isMilestone).toBe(true)
    expect(P1_PROJECT_STEPS.slice(0, -1).every((s) => !s.isMilestone)).toBe(true)
  })

  it('số học các ca chấm khớp luật đề (giá món, giảm giá bậc, doanh thu)', () => {
    // s2: Tong = gia[mon-1] * so_luong
    for (const c of getProjectStep('p1-s2')!.checks) {
      const [, mon, sl] = c.stdinLines.map(Number)
      expect(c.expected).toBe(`Tong: ${GIA[mon! - 1]! * sl!}`)
    }
    // s3: các ca "Thanh toan" khớp luật bậc
    for (const c of getProjectStep('p1-s3')!.checks.filter((c) => c.expected.startsWith('Thanh'))) {
      const [, mon, sl] = c.stdinLines.map(Number)
      expect(c.expected).toBe(`Thanh toan: ${thanhToan(GIA[mon! - 1]! * sl!)}`)
    }
    // s4: doanh thu = tổng thanh toán các đơn
    const s4 = getProjectStep('p1-s4')!.checks[0]!
    // ['Lan','2', '2','3', '1','2'] → cam×3 + trà×2
    expect(s4.expected).toBe(`Doanh thu: ${thanhToan(15000 * 3) + thanhToan(5000 * 2)}`)
    // s5: thối lại = tiền đưa − thanh toán
    const s5 = getProjectStep('p1-s5')!.checks[0]!
    expect(s5.expected).toBe(`Thoi lai: ${50000 - thanhToan(15000 * 3)}`)
  })

  it('starter code và file chính hợp lệ; tra bước lạ trả undefined', () => {
    expect(PROJECT_MAIN_FILE).toBe('cua_hang.py')
    expect(PROJECT_STARTER_CODE).toContain('cua_hang.py')
    expect(getProjectStep('p1-s9')).toBeUndefined()
  })
})
