import { describe, it, expect } from 'vitest'
import { shouldAlignPopoverRight, ROLE_PICKER_WIDTH_PX } from './popoverAlign'

describe('shouldAlignPopoverRight — chọn phía neo popover theo vị trí nút', () => {
  it('390px, nút ở x=29 (nửa trái): còn chỗ bên phải → neo TRÁI', () => {
    expect(shouldAlignPopoverRight(29, 390)).toBe(false)
  })
  it('768px, nút ở x=549: 549 + 256 = 805 > 768 → neo PHẢI', () => {
    expect(shouldAlignPopoverRight(549, 768)).toBe(true)
  })
  it('1440px, nút ở x=1080: 1336 ≤ 1440 → neo TRÁI', () => {
    expect(shouldAlignPopoverRight(1080, 1440)).toBe(false)
  })
  it('ca biên: vừa khít mép phải (anchor + width = viewport) → vẫn neo TRÁI', () => {
    expect(shouldAlignPopoverRight(1440 - ROLE_PICKER_WIDTH_PX, 1440)).toBe(false)
    expect(shouldAlignPopoverRight(1440 - ROLE_PICKER_WIDTH_PX + 1, 1440)).toBe(true)
  })
  it('viewport hẹp hơn popover: mọi vị trí đều neo PHẢI (không thể vừa, ưu tiên không tràn phải)', () => {
    expect(shouldAlignPopoverRight(0, 200)).toBe(true)
  })
  it('chiều rộng tuỳ ý được tôn trọng', () => {
    expect(shouldAlignPopoverRight(100, 300, 150)).toBe(false)
    expect(shouldAlignPopoverRight(160, 300, 150)).toBe(true)
  })
})
