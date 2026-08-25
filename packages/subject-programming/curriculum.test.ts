// Kiểm bất biến của khung giáo trình môn Lập trình — chặn lỗi dữ liệu khi soạn thêm unit.
import { describe, expect, it } from 'vitest'
import {
  PROGRAMMING_LEVELS,
  PROGRAMMING_LEVEL_IDS,
  PROJECT_TRACKS,
  getProgrammingLevel,
} from './curriculum.js'

describe('programming curriculum', () => {
  it('có đủ 6 bậc P1–P6 đúng thứ tự', () => {
    expect(PROGRAMMING_LEVELS.map((l) => l.id)).toEqual(PROGRAMMING_LEVEL_IDS)
  })

  it('id unit duy nhất toàn giáo trình và đúng tiền tố bậc', () => {
    const seen = new Set<string>()
    for (const level of PROGRAMMING_LEVELS) {
      for (const unit of level.units) {
        expect(unit.id.startsWith(`${level.id}-u`)).toBe(true)
        expect(seen.has(unit.id)).toBe(false)
        seen.add(unit.id)
      }
    }
  })

  it('mỗi bậc P1–P5 đều có bước dự án trục và unit milestone cuối bậc', () => {
    for (const level of PROGRAMMING_LEVELS.filter((l) => l.id !== 'p6')) {
      const projectSteps = level.units.filter((u) => u.projectStep)
      expect(projectSteps.length).toBeGreaterThan(0)
      const last = level.units[level.units.length - 1]!
      expect(last.projectStep).toBeTruthy()
      expect(level.projectMilestone.length).toBeGreaterThan(0)
    }
  })

  it('getProgrammingLevel không phân biệt hoa thường và trả undefined khi id lạ', () => {
    expect(getProgrammingLevel('P1')?.name).toBe('Nhập môn tư duy')
    expect(getProgrammingLevel('p9')).toBeUndefined()
  })

  it('MVP chỉ mở track T1', () => {
    expect(PROJECT_TRACKS.filter((t) => t.available).map((t) => t.id)).toEqual(['T1'])
  })
})
