import { describe, it, expect } from 'vitest'

import {
  PLACEMENT_START,
  PLACEMENT_MAX_ROUNDS,
  PLACEMENT_UP_PCT,
  PLACEMENT_DOWN_PCT,
  PLACEMENT_JUMP_PCT,
  cefrToAppLevel,
  nextPlacementStep,
  canRetakePlacement,
  type PlacementRound,
} from './placement'

// Rút gọn: tạo 1 vòng đã thi.
const r = (levelId: PlacementRound['levelId'], pct: number): PlacementRound => ({ levelId, pct })

// Chạy trọn bài test với "người thi" trả lời theo hàm pct(level) — mô phỏng
// đúng cách trang /placement sẽ dùng: hỏi bước kế → thi → ghi lịch sử → lặp.
function runPlacement(pctAt: (level: PlacementRound['levelId']) => number) {
  const history: PlacementRound[] = []
  for (;;) {
    const step = nextPlacementStep(history)
    if (step.done) return { result: step.result, rounds: history.length }
    history.push(r(step.nextLevel, pctAt(step.nextLevel)))
  }
}

describe('cefrToAppLevel', () => {
  it('ánh xạ đủ 6 cấp về 3 mức app', () => {
    expect(cefrToAppLevel('A1')).toBe('beginner')
    expect(cefrToAppLevel('A2')).toBe('beginner')
    expect(cefrToAppLevel('B1')).toBe('intermediate')
    expect(cefrToAppLevel('B2')).toBe('intermediate')
    expect(cefrToAppLevel('C1')).toBe('advanced')
    expect(cefrToAppLevel('C2')).toBe('advanced')
  })
})

describe('nextPlacementStep — bước đầu & dừng giữa', () => {
  it('chưa thi vòng nào → thi ở cấp khởi điểm A2', () => {
    expect(nextPlacementStep([])).toEqual({ done: false, nextLevel: PLACEMENT_START })
  })

  it('điểm ở giữa (41–74%) → dừng ngay tại cấp đang thi', () => {
    const step = nextPlacementStep([r('A2', 60)])
    expect(step).toEqual({ done: true, result: { cefr: 'A2', appLevel: 'beginner' } })
  })

  it('đúng biên ngưỡng: 75% là vững (đi tiếp), 40% là rớt (đi xuống), 74/41 là dừng', () => {
    expect(nextPlacementStep([r('A2', PLACEMENT_UP_PCT)]).done).toBe(false)
    expect(nextPlacementStep([r('A2', PLACEMENT_DOWN_PCT)]).done).toBe(false)
    expect(nextPlacementStep([r('A2', PLACEMENT_UP_PCT - 1)]).done).toBe(true)
    expect(nextPlacementStep([r('A2', PLACEMENT_DOWN_PCT + 1)]).done).toBe(true)
  })
})

describe('nextPlacementStep — đi lên', () => {
  it('vững A2 (75–94%) → thi B1', () => {
    expect(nextPlacementStep([r('A2', 80)])).toEqual({ done: false, nextLevel: 'B1' })
  })

  it('điểm gần tuyệt đối (≥95%) → nhảy 2 cấp', () => {
    expect(nextPlacementStep([r('A2', PLACEMENT_JUMP_PCT)])).toEqual({
      done: false,
      nextLevel: 'B2',
    })
  })

  it('nhảy 2 cấp không vượt trần C2 (từ C1 nhảy 2 → kẹp C2)', () => {
    expect(nextPlacementStep([r('A2', 100), r('B2', 100)])).toEqual({
      done: false,
      nextLevel: 'C2',
    })
  })

  it('đúng hết mọi vòng → ra C2 trong tối đa 3 vòng', () => {
    const { result, rounds } = runPlacement(() => 100)
    expect(result).toEqual({ cefr: 'C2', appLevel: 'advanced' })
    expect(rounds).toBeLessThanOrEqual(PLACEMENT_MAX_ROUNDS)
  })
})

describe('nextPlacementStep — đi xuống', () => {
  it('rớt A2 → thi A1', () => {
    expect(nextPlacementStep([r('A2', 20)])).toEqual({ done: false, nextLevel: 'A1' })
  })

  it('sai hết mọi vòng → chạm đáy, kết quả A1', () => {
    const { result, rounds } = runPlacement(() => 0)
    expect(result).toEqual({ cefr: 'A1', appLevel: 'beginner' })
    expect(rounds).toBe(2) // A2 rớt → A1 rớt → dừng ở biên
  })
})

describe('nextPlacementStep — dao động lên/xuống (ca biên quan trọng)', () => {
  it('vững A2 rồi rớt B1 → không thi lại A2, kết quả = B1 (cấp thấp nhất chưa vững)', () => {
    const step = nextPlacementStep([r('A2', 80), r('B1', 30)])
    expect(step).toEqual({ done: true, result: { cefr: 'B1', appLevel: 'intermediate' } })
  })

  it('rớt A2 nhưng vững A1 → không thi lại A2, kết quả = A2', () => {
    const step = nextPlacementStep([r('A2', 30), r('A1', 90)])
    expect(step).toEqual({ done: true, result: { cefr: 'A2', appLevel: 'beginner' } })
  })

  it('nhảy 2 cấp rồi rớt: A2 ≥95 → B2 rớt → thi B1 (chưa thi, nằm giữa)', () => {
    expect(nextPlacementStep([r('A2', 96), r('B2', 20)])).toEqual({
      done: false,
      nextLevel: 'B1',
    })
  })
})

describe('nextPlacementStep — trần số vòng & tổng hợp kết quả', () => {
  it('đủ 3 vòng đều vững (A2→B1→B2) → đề xuất cấp KẾ TIẾP chưa thi (C1)', () => {
    const step = nextPlacementStep([r('A2', 80), r('B1', 80), r('B2', 80)])
    expect(step).toEqual({ done: true, result: { cefr: 'C1', appLevel: 'advanced' } })
  })

  it('3 vòng: vững A2, vững B1, rớt B2 → kết quả B2', () => {
    const step = nextPlacementStep([r('A2', 80), r('B1', 80), r('B2', 10)])
    expect(step).toEqual({ done: true, result: { cefr: 'B2', appLevel: 'intermediate' } })
  })

  it('kịch bản chấp nhận của đặc tả: A2 đúng 80%, B1 đúng 50% → B1', () => {
    const { result } = runPlacement((lv) => (lv === 'A2' ? 80 : lv === 'B1' ? 50 : 0))
    expect(result).toEqual({ cefr: 'B1', appLevel: 'intermediate' })
  })

  it('vững C2 → dừng, kết quả C2 (không có cấp cao hơn)', () => {
    const step = nextPlacementStep([r('A2', 100), r('B2', 100), r('C2', 100)])
    expect(step).toEqual({ done: true, result: { cefr: 'C2', appLevel: 'advanced' } })
  })
})

describe('nextPlacementStep — dữ liệu bẩn không làm vỡ logic', () => {
  it('pct ngoài [0,100] được kẹp lại (120 kẹp về 100 → vững + nhảy 2 cấp, -5 coi như rớt)', () => {
    expect(nextPlacementStep([r('A2', 120)])).toEqual({ done: false, nextLevel: 'B2' })
    expect(nextPlacementStep([r('A2', -5)])).toEqual({ done: false, nextLevel: 'A1' })
  })

  it('mọi luồng trả lời bất kỳ đều KẾT THÚC trong tối đa 3 vòng (không lặp vô hạn)', () => {
    // Quét lưới điểm thô 0/40/41/74/75/95/100 cho 3 vòng đầu — đủ phủ các nhánh.
    const grid = [0, 40, 41, 74, 75, 95, 100]
    for (const p1 of grid)
      for (const p2 of grid)
        for (const p3 of grid) {
          const answers = [p1, p2, p3]
          let i = 0
          const { rounds } = runPlacement(() => answers[Math.min(i++, 2)] as number)
          expect(rounds).toBeLessThanOrEqual(PLACEMENT_MAX_ROUNDS)
        }
  })
})

describe('canRetakePlacement', () => {
  const now = new Date('2026-07-15T00:00:00Z')

  it('chưa thi bao giờ → được thi', () => {
    expect(canRetakePlacement(null, now)).toBe(true)
  })

  it('mới thi 5 ngày trước → chưa được thi lại; đủ 30 ngày → được', () => {
    expect(canRetakePlacement('2026-07-10T00:00:00Z', now)).toBe(false)
    expect(canRetakePlacement('2026-06-15T00:00:00Z', now)).toBe(true)
    expect(canRetakePlacement('2026-06-16T00:00:01Z', now)).toBe(false) // thiếu vài giây
  })

  it('timestamp hỏng → không khóa oan người dùng', () => {
    expect(canRetakePlacement('not-a-date', now)).toBe(true)
  })
})
