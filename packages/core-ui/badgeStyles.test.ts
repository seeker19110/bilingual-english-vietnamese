import { describe, it, expect } from 'vitest'
import { countBadgeClass, badgeCount } from './badgeStyles.js'

describe('badgeStyles', () => {
  it('không dùng `text-white` — token đó bị đảo thành màu tối ở theme nền sáng', () => {
    // Nền badge cố định đỏ ở MỌI theme, nên chữ cũng phải cố định. Đây chính là lỗi đã vá ở
    // đợt trước (17 file); test canh để nó không mọc lại qua đường badge.
    expect(countBadgeClass()).not.toMatch(/\btext-white\b/)
    expect(countBadgeClass()).toContain('text-[#fff]')
  })

  it('dùng rose-600 chứ không phải rose-500 (rose-500 + chữ trắng chỉ đạt ~3,95:1)', () => {
    expect(countBadgeClass()).toContain('bg-rose-600')
    expect(countBadgeClass()).not.toContain('bg-rose-500')
  })

  it('rút gọn số trên 99 để badge không phình ngang', () => {
    expect(badgeCount(0)).toBe('0')
    expect(badgeCount(7)).toBe('7')
    expect(badgeCount(99)).toBe('99')
    expect(badgeCount(100)).toBe('99+')
    expect(badgeCount(4821)).toBe('99+')
  })
})
