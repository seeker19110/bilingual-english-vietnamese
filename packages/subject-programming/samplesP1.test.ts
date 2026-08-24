// Bất biến của bộ bài mẫu P1 — giữ khớp với curriculum và an toàn cho sandbox.
import { describe, expect, it } from 'vitest'
import { P1_SAMPLES } from './samplesP1.js'
import { getProgrammingLevel } from './curriculum.js'

describe('P1 samples', () => {
  it('đúng 10 bài, id khớp 1-1 với unit của bậc P1', () => {
    const p1 = getProgrammingLevel('p1')!
    expect(P1_SAMPLES.map((s) => s.id)).toEqual(p1.units.map((u) => u.id))
  })

  it('mọi bài có code không rỗng; bài dùng input() phải điền sẵn dữ liệu nhập', () => {
    for (const s of P1_SAMPLES) {
      expect(s.code.trim().length).toBeGreaterThan(0)
      if (s.code.includes('input(')) {
        expect(
          s.stdinLines.length,
          `Bài ${s.id} gọi input() nhưng không có stdinLines — chạy mẫu sẽ báo lỗi EOF`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('bài đầu tiên chạy được ngay không cần nhập gì (trải nghiệm mở trang)', () => {
    expect(P1_SAMPLES[0]!.stdinLines).toEqual([])
    expect(P1_SAMPLES[0]!.code).toContain('print(')
  })
})
