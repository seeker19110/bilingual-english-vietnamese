import { describe, it, expect } from 'vitest'
import { buildCrumbs } from './breadcrumb'

describe('buildCrumbs', () => {
  it('Trang chủ không có đường đi (không vẽ breadcrumb)', () => {
    expect(buildCrumbs('/')).toEqual([])
  })

  it('trang tầng 1 chỉ có Trang chủ › chính nó', () => {
    const crumbs = buildCrumbs('/tien-do')
    expect(crumbs.map((c) => c.label)).toEqual(['Trang chủ', 'Tiến độ'])
    expect(crumbs[0].to).toBe('/')
  })

  it('môn học lồng dưới Phòng Học', () => {
    expect(buildCrumbs('/mon-hoc/mathematics').map((c) => c.label)).toEqual([
      'Trang chủ',
      'Phòng Học & STEM',
      'Toán học',
    ])
  })

  it('trang con sâu vẫn lần đúng về nhánh cha', () => {
    expect(buildCrumbs('/lap-trinh/khoa/pyai').map((c) => c.label)).toEqual([
      'Trang chủ',
      'Phòng Học & STEM',
      'Lập trình',
    ])
  })

  it('đốt cuối KHÔNG phải liên kết, các đốt trước thì có', () => {
    const crumbs = buildCrumbs('/mon-hoc/physics')
    expect(crumbs[crumbs.length - 1].to).toBe('')
    expect(crumbs.slice(0, -1).every((c) => c.to !== '')).toBe(true)
  })

  it('tiêu đề trang thành đốt cuối khi khác đốt sẵn có', () => {
    expect(buildCrumbs('/lo-trinh-hoc/a1', 'Cấp A1').map((c) => c.label)).toEqual([
      'Trang chủ',
      'Học Tiếng Anh',
      'Lộ trình CEFR',
      'Cấp A1',
    ])
  })

  it('tiêu đề trùng đốt cuối thì KHÔNG nhân đôi', () => {
    expect(buildCrumbs('/tien-do', 'Tiến độ').map((c) => c.label)).toEqual(['Trang chủ', 'Tiến độ'])
  })

  it('so khớp theo BIÊN đoạn — /mon-hoc không nuốt /mon-hoc-abc', () => {
    expect(buildCrumbs('/mon-hoc-abc').map((c) => c.label)).toEqual(['Trang chủ'])
  })

  it('đường dẫn lạ chỉ còn Trang chủ, không vỡ', () => {
    expect(buildCrumbs('/khong-ton-tai/gi-do').map((c) => c.label)).toEqual(['Trang chủ'])
  })
})
