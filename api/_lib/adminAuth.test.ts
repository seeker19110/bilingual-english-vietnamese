import { describe, it, expect, afterEach } from 'vitest'
import { isAdminEmail } from './adminAuth'

const OLD_ADMIN_EMAILS = process.env.ADMIN_EMAILS

afterEach(() => {
  if (OLD_ADMIN_EMAILS === undefined) delete process.env.ADMIN_EMAILS
  else process.env.ADMIN_EMAILS = OLD_ADMIN_EMAILS
})

describe('isAdminEmail', () => {
  it('email nằm trong ADMIN_EMAILS → true', () => {
    process.env.ADMIN_EMAILS = 'a@x.com,b@y.com'
    expect(isAdminEmail('b@y.com')).toBe(true)
  })

  it('không phân biệt hoa/thường', () => {
    process.env.ADMIN_EMAILS = 'Admin@Example.com'
    expect(isAdminEmail('admin@example.com')).toBe(true)
  })

  it('email không nằm trong danh sách → false', () => {
    process.env.ADMIN_EMAILS = 'a@x.com'
    expect(isAdminEmail('other@x.com')).toBe(false)
  })

  it('ADMIN_EMAILS rỗng/chưa set → luôn false (không lỡ tay cấp quyền)', () => {
    delete process.env.ADMIN_EMAILS
    expect(isAdminEmail('a@x.com')).toBe(false)
  })

  it('email null/undefined → false', () => {
    process.env.ADMIN_EMAILS = 'a@x.com'
    expect(isAdminEmail(null)).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
  })

  it('khoảng trắng thừa quanh dấu phẩy vẫn khớp đúng', () => {
    process.env.ADMIN_EMAILS = ' a@x.com , b@y.com '
    expect(isAdminEmail('b@y.com')).toBe(true)
  })
})
