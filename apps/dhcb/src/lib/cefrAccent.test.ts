import { describe, it, expect } from 'vitest'
import { ACCENT } from './cefrAccent'

describe('cefrAccent — bảng màu nhấn theo cấp CEFR', () => {
  it('có đủ 6 màu accent (emerald/sky/violet/amber/rose/cyan)', () => {
    expect(Object.keys(ACCENT).sort()).toEqual(
      ['amber', 'cyan', 'emerald', 'rose', 'sky', 'violet'].sort(),
    )
  })

  it('mỗi màu có đủ 4 class bar/text/soft/ring không rỗng', () => {
    for (const classes of Object.values(ACCENT)) {
      expect(classes.bar.length).toBeGreaterThan(0)
      expect(classes.text.length).toBeGreaterThan(0)
      expect(classes.soft.length).toBeGreaterThan(0)
      expect(classes.ring.length).toBeGreaterThan(0)
    }
  })

  it('class bar đúng tên màu tương ứng (kiểm 1 ca cụ thể)', () => {
    expect(ACCENT.emerald.bar).toBe('bg-accent-500')
    expect(ACCENT.rose.bar).toBe('bg-rose-500')
    expect(ACCENT.cyan.bar).toBe('bg-cyan-500')
  })
})
