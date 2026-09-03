import { describe, it, expect } from 'vitest'
import { resolveRovingGridKey, type RovingGridOptions } from './rovingGrid.js'

// Lịch desktop: đổ theo CỘT, mỗi cột 7 ngày (thứ 2 → CN).
const col = (index: number, total = 182): RovingGridOptions => ({
  index,
  total,
  span: 7,
  flow: 'column',
})
// Lịch mobile: đổ theo HÀNG, mỗi hàng 7 ngày.
const row = (index: number, total = 35): RovingGridOptions => ({
  index,
  total,
  span: 7,
  flow: 'row',
})

describe('resolveRovingGridKey', () => {
  it('phím không điều hướng trả null — nơi gọi nhờ đó KHÔNG nuốt phím tắt trình duyệt', () => {
    for (const k of ['a', 'Enter', ' ', 'Tab', 'Escape', 'F5']) {
      expect(resolveRovingGridKey(k, col(50)), k).toBeNull()
    }
  })

  it('lưới đổ theo CỘT: xuống = ngày kế tiếp, sang phải = cùng thứ của tuần sau', () => {
    expect(resolveRovingGridKey('ArrowDown', col(0))).toBe(1)
    expect(resolveRovingGridKey('ArrowUp', col(5))).toBe(4)
    expect(resolveRovingGridKey('ArrowRight', col(0))).toBe(7)
    expect(resolveRovingGridKey('ArrowLeft', col(9))).toBe(2)
  })

  it('lưới đổ theo HÀNG: sang phải = ngày kế tiếp, xuống = cùng thứ của tuần sau', () => {
    expect(resolveRovingGridKey('ArrowRight', row(0))).toBe(1)
    expect(resolveRovingGridKey('ArrowLeft', row(3))).toBe(2)
    expect(resolveRovingGridKey('ArrowDown', row(0))).toBe(7)
    expect(resolveRovingGridKey('ArrowUp', row(9))).toBe(2)
  })

  it('KẸP ở hai đầu chứ không cuộn vòng — lịch có mốc đầu và mốc cuối thật', () => {
    // Nhảy từ hôm nay (ô cuối) về ngày xa nhất là mất phương hướng, nên chặn.
    expect(resolveRovingGridKey('ArrowUp', col(0))).toBe(0)
    expect(resolveRovingGridKey('ArrowLeft', col(3))).toBe(0)
    expect(resolveRovingGridKey('ArrowDown', col(181))).toBe(181)
    expect(resolveRovingGridKey('ArrowRight', col(180))).toBe(181)
  })

  it('Home/End nhảy thẳng về ngày xa nhất / hôm nay', () => {
    expect(resolveRovingGridKey('Home', col(99))).toBe(0)
    expect(resolveRovingGridKey('End', col(3))).toBe(181)
  })

  it('PageUp/PageDown nhảy trọn một tuần — bước lớn cho lịch dài nửa năm', () => {
    expect(resolveRovingGridKey('PageDown', col(0))).toBe(7)
    expect(resolveRovingGridKey('PageUp', col(70))).toBe(63)
    expect(resolveRovingGridKey('PageUp', col(2))).toBe(0)
  })

  it('lưới rỗng hoặc span 0 không làm sập — trả null thay vì tính ra NaN', () => {
    expect(
      resolveRovingGridKey('ArrowDown', { index: 0, total: 0, span: 7, flow: 'column' }),
    ).toBeNull()
    expect(
      resolveRovingGridKey('ArrowDown', { index: 0, total: 10, span: 0, flow: 'column' }),
    ).toBeNull()
  })
})
