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

  it('nhánh tĩnh của môn Lập trình lồng dưới trang môn', () => {
    expect(buildCrumbs('/lap-trinh/huong').map((c) => c.label)).toEqual([
      'Trang chủ',
      'Phòng Học & STEM',
      'Lập trình',
      'Hướng chuyên sâu',
    ])
  })

  it('đốt cha ĐỘNG chèn sau các tầng tĩnh', () => {
    const crumbs = buildCrumbs('/lap-trinh/huong/web--lap-trinh-web/s2--nen-tang', undefined, [
      { label: 'Lập trình Web', to: '/lap-trinh/huong/web--lap-trinh-web' },
    ])
    expect(crumbs.map((c) => c.label)).toEqual([
      'Trang chủ',
      'Phòng Học & STEM',
      'Lập trình',
      'Hướng chuyên sâu',
      'Lập trình Web',
    ])
  })

  it('đốt cha động trùng tầng tĩnh liền trước thì KHÔNG nhân đôi', () => {
    expect(
      buildCrumbs('/lap-trinh/huong', undefined, [
        { label: 'Hướng chuyên sâu', to: '/lap-trinh/huong' },
      ]).map((c) => c.label),
    ).toEqual(['Trang chủ', 'Phòng Học & STEM', 'Lập trình', 'Hướng chuyên sâu'])
  })

  it('công cụ của trụ lồng dưới đúng studio, đốt tab giữ tham số ?muc=', () => {
    const crumbs = buildCrumbs('/career/interview', 'Phòng Luyện Phỏng Vấn AI')
    expect(crumbs.map((c) => c.label)).toEqual([
      'Trang chủ',
      'Sự Nghiệp & Khởi Nghiệp',
      'Sự nghiệp',
      'Phòng Luyện Phỏng Vấn AI',
    ])
    expect(crumbs[2].to).toBe('/su-nghiep-khoi-nghiep?muc=su-nghiep')
  })

  it('công cụ trụ Công việc & Đời sống cũng có tầng cha', () => {
    expect(buildCrumbs('/life/wheel').map((c) => c.label)).toEqual([
      'Trang chủ',
      'Công Việc & Đời Sống',
      'Đời sống',
    ])
    expect(buildCrumbs('/work/kanban').map((c) => c.label)).toEqual([
      'Trang chủ',
      'Công Việc & Đời Sống',
      'Công việc',
    ])
    expect(buildCrumbs('/startup/canvas').map((c) => c.label)).toEqual([
      'Trang chủ',
      'Sự Nghiệp & Khởi Nghiệp',
      'Khởi nghiệp',
    ])
  })

  it('đường dẫn lạ chỉ còn Trang chủ, không vỡ', () => {
    expect(buildCrumbs('/khong-ton-tai/gi-do').map((c) => c.label)).toEqual(['Trang chủ'])
  })
})
