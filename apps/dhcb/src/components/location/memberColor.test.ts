import { describe, it, expect } from 'vitest'
import { MEMBER_INK, memberColor, memberInitial } from './memberColor'

// Màu định danh là thứ nối CHẤM TRÊN BẢN ĐỒ với DÒNG TRONG DANH SÁCH. Nếu nó đổi giữa hai lần
// tải trang, hoặc hai máy cho ra hai màu khác nhau cho cùng một người, thì cả ý tưởng "nhìn màu
// là biết ai" sập — nên tính ổn định được khoá lại bằng test.

describe('memberColor', () => {
  it('cùng userId luôn ra cùng màu', () => {
    const id = '8e1f2a44-0000-4000-8000-000000000001'
    expect(memberColor(id)).toBe(memberColor(id))
  })

  it('luôn trả về mã màu hex hợp lệ', () => {
    for (let i = 0; i < 50; i++) {
      expect(memberColor(`user-${i}`)).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('trải đều trên nhiều màu chứ không dồn hết vào một màu', () => {
    const seen = new Set(Array.from({ length: 40 }, (_, i) => memberColor(`user-${i}`)))
    expect(seen.size).toBeGreaterThan(1)
  })

  it('chuỗi rỗng vẫn ra màu, không nổ', () => {
    expect(memberColor('')).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('memberInitial', () => {
  it('lấy chữ cái đầu và viết hoa', () => {
    expect(memberInitial('lan')).toBe('L')
    expect(memberInitial('  Minh')).toBe('M')
  })

  it('giữ nguyên dấu tiếng Việt', () => {
    expect(memberInitial('Đức')).toBe('Đ')
  })

  it('tên rỗng thì có ký tự thay thế, không ra chuỗi rỗng', () => {
    expect(memberInitial('')).toBe('?')
    expect(memberInitial('   ')).toBe('?')
  })
})

describe('MEMBER_INK', () => {
  it('là mực tối dùng cho chữ trên nền màu định danh', () => {
    expect(MEMBER_INK).toBe('#09090b')
  })
})
