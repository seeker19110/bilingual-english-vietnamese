import { describe, it, expect } from 'vitest'
import { isReservedName, RESERVED_NAME_PATTERNS } from './reservedNames'

describe('isReservedName', () => {
  it('chặn từ khoá cấm viết thường, không dấu', () => {
    expect(isReservedName('admin')).toBe(true)
    expect(isReservedName('support')).toBe(true)
    expect(isReservedName('cskh')).toBe(true)
  })

  it('chặn không phân biệt hoa/thường', () => {
    expect(isReservedName('Admin')).toBe(true)
    expect(isReservedName('ADMIN')).toBe(true)
    expect(isReservedName('CSKH')).toBe(true)
  })

  it('chặn dù gõ có dấu hay không dấu tiếng Việt', () => {
    expect(isReservedName('quản trị viên')).toBe(true)
    expect(isReservedName('Quan Tri Vien')).toBe(true)
    expect(isReservedName('chăm sóc khách hàng')).toBe(true)
    expect(isReservedName('cham soc khach hang')).toBe(true)
    expect(isReservedName('hỗ trợ')).toBe(true)
    expect(isReservedName('ho tro')).toBe(true)
  })

  it('chặn khi từ khoá là 1 phần của cụm tên dài hơn (khớp theo TỪ, có ranh giới)', () => {
    expect(isReservedName('Ngô Admin Trần')).toBe(true)
    expect(isReservedName('Admin En-Vi')).toBe(true)
    expect(isReservedName('Ban Quản Trị Hệ Thống')).toBe(true)
  })

  it('chặn tên trùng thương hiệu app', () => {
    expect(isReservedName('donghanhcungban')).toBe(true)
    expect(isReservedName('DongHanhCungBan')).toBe(true)
  })

  it('không chặn tên hợp lệ bình thường', () => {
    expect(isReservedName('Nguyễn Văn A')).toBe(false)
    expect(isReservedName('Trần Thị B')).toBe(false)
    expect(isReservedName('Minh Anh')).toBe(false)
    expect(isReservedName('Hoa')).toBe(false)
  })

  it('ca biên: không chặn nhầm khi khớp là substring ngẫu nhiên, không phải nguyên từ/cụm', () => {
    // "Adam" chứa "dm" ngẫu nhiên nhưng không khớp bất kỳ cụm cấm nào theo TỪ nguyên vẹn.
    expect(isReservedName('Adam')).toBe(false)
    // "Modesta" chứa "mod" nhưng không phải từ "mod" đứng riêng.
    expect(isReservedName('Modesta')).toBe(false)
    // "Administrative" (tên lạ nhưng không khớp cụm "admin" đứng riêng — chứa "admin" +
    // ký tự dính liền, không có ranh giới) không nên bị chặn nhầm.
    expect(isReservedName('Administrative')).toBe(false)
    // "Modal Nguyen" không phải "mod" đứng riêng.
    expect(isReservedName('Modal Nguyen')).toBe(false)
  })

  it('export RESERVED_NAME_PATTERNS là mảng RegExp không rỗng', () => {
    expect(Array.isArray(RESERVED_NAME_PATTERNS)).toBe(true)
    expect(RESERVED_NAME_PATTERNS.length).toBeGreaterThan(0)
    expect(RESERVED_NAME_PATTERNS[0]).toBeInstanceOf(RegExp)
  })
})
