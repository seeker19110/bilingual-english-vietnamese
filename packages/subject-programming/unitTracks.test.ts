// Cổng cho việc GOM NHÓM unit theo mạch (PR-M12).
//
// Vì sao cần test riêng thay vì tin vào e2e: e2e chỉ chốt được bậc P6 và P3. Bất biến thật sự
// nằm ở dữ liệu — "P1–P5 phải ra ĐÚNG MỘT nhóm" — và nó dễ vỡ âm thầm: chỉ cần ai đó thêm
// `track` cho một unit của P2 là bậc đó bỗng hiện tiêu đề mạch với nhãn của nhóm mặc định
// ("Hướng chuyên sâu"), hoàn toàn sai ngữ cảnh, mà không cổng nào khác kêu.
import { describe, expect, it } from 'vitest'
import {
  PROGRAMMING_LEVELS,
  UNIT_TRACKS,
  nhomUnitTheoTrack,
  getProgrammingLevel,
} from './curriculum.js'

describe('gom nhóm unit theo mạch', () => {
  it('có ĐÚNG MỘT nhóm mặc định — nơi hứng unit không khai track', () => {
    expect(UNIT_TRACKS.filter((t) => t.macDinh)).toHaveLength(1)
  })

  it('mọi track khai trên unit đều tồn tại thật trong UNIT_TRACKS', () => {
    const hopLe = new Set(UNIT_TRACKS.map((t) => t.id))
    for (const level of PROGRAMMING_LEVELS) {
      for (const unit of level.units) {
        if (unit.track !== undefined) {
          expect(hopLe.has(unit.track), `Unit ${unit.id} khai track lạ: ${unit.track}`).toBe(true)
        }
      }
    }
  })

  it('KHÔNG mất unit nào khi gom nhóm', () => {
    for (const level of PROGRAMMING_LEVELS) {
      const tong = nhomUnitTheoTrack(level.units).reduce((s, n) => s + n.units.length, 0)
      expect(tong, `Bậc ${level.id} mất unit khi gom nhóm`).toBe(level.units.length)
    }
  })

  it('giữ nguyên thứ tự unit bên trong mỗi nhóm', () => {
    const p6 = getProgrammingLevel('p6')!
    for (const nhom of nhomUnitTheoTrack(p6.units)) {
      const viTri = nhom.units.map((u) => p6.units.indexOf(u))
      expect(viTri).toEqual([...viTri].sort((a, b) => a - b))
    }
  })

  // Bất biến chính: chỉ P6 được chia mạch. Bậc khác ra một nhóm nên giao diện giữ danh sách
  // phẳng và KHÔNG bao giờ hiện nhãn của nhóm mặc định.
  it('chỉ P6 chia nhiều mạch; P1–P5 ra đúng một nhóm', () => {
    for (const level of PROGRAMMING_LEVELS) {
      const soNhom = nhomUnitTheoTrack(level.units).length
      if (level.id === 'p6') expect(soNhom).toBeGreaterThan(1)
      else expect(soNhom, `Bậc ${level.id} bỗng chia mạch — xem chú thích đầu file`).toBe(1)
    }
  })

  it('bậc rỗng thì không sinh nhóm rỗng nào', () => {
    expect(nhomUnitTheoTrack([])).toEqual([])
  })
})
