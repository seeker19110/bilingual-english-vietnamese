import { describe, it, expect } from 'vitest'
import { slugify, buildSlugSegment, idFromSlugSegment } from './slug'

describe('slugify', () => {
  it('bỏ dấu tiếng Việt và chuyển thành chữ thường có gạch ngang', () => {
    expect(slugify('Chương trình đầu tiên — máy tính làm gì và lệnh print')).toBe(
      'chuong-trinh-dau-tien-may-tinh-lam-gi-va-lenh-print',
    )
  })

  it('xử lý chữ Đ hoa và đ thường', () => {
    expect(slugify('Đi chợ mua đồ')).toBe('di-cho-mua-do')
  })

  it('không có ký tự chữ/số nào → chuỗi rỗng', () => {
    expect(slugify('...!!!')).toBe('')
  })

  it('cắt bớt slug quá dài, không để dư gạch ngang ở cuối', () => {
    const long = 'a'.repeat(100)
    const result = slugify(long)
    expect(result.length).toBeLessThanOrEqual(80)
    expect(result.endsWith('-')).toBe(false)
  })
})

describe('buildSlugSegment / idFromSlugSegment', () => {
  it('ghép id và slug bằng "--", tách lại đúng id gốc', () => {
    const segment = buildSlugSegment('p1-u1-l1', 'Chương trình đầu tiên')
    expect(segment).toBe('p1-u1-l1--chuong-trinh-dau-tien')
    expect(idFromSlugSegment(segment)).toBe('p1-u1-l1')
  })

  it('tiêu đề rỗng/không slug hoá được → giữ nguyên id, không thêm "--"', () => {
    expect(buildSlugSegment('p1-u1-l1', '')).toBe('p1-u1-l1')
    expect(buildSlugSegment('p1-u1-l1', '???')).toBe('p1-u1-l1')
  })

  it('id có nhiều gạch ngang vẫn tách đúng (không lẫn với slug)', () => {
    // p1-u1-l1 và p1-u1-l10 dễ lẫn nếu tách bằng 1 gạch ngang — "--" tránh được ca này.
    const seg1 = buildSlugSegment('p1-u1-l1', 'Bài một')
    const seg10 = buildSlugSegment('p1-u1-l10', 'Bài mười')
    expect(idFromSlugSegment(seg1)).toBe('p1-u1-l1')
    expect(idFromSlugSegment(seg10)).toBe('p1-u1-l10')
  })

  it('URL cũ chỉ có id (không có slug) vẫn tách ra đúng id', () => {
    expect(idFromSlugSegment('p1-u1-l1')).toBe('p1-u1-l1')
  })
})
