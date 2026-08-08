import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  SESSION_COOKIE_NAME,
  buildSessionCookie,
  buildClearSessionCookie,
  readSessionCookie,
} from './sessionCookie'

const ORIGINAL_ENV = { ...process.env }

describe('buildSessionCookie', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('môi trường dev (NODE_ENV != production) → không có Secure/Domain (cookie chạy được trên http://localhost)', () => {
    process.env.NODE_ENV = 'test'
    const cookie = buildSessionCookie('tok123')
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=tok123`)
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).not.toContain('Secure')
    expect(cookie).not.toContain('Domain=')
  })

  it('môi trường production → có Secure + Domain', () => {
    process.env.NODE_ENV = 'production'
    const cookie = buildSessionCookie('tok123')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('Domain=.donghanhcungban.org')
  })

  it('COOKIE_DOMAIN override qua env', () => {
    process.env.NODE_ENV = 'production'
    process.env.COOKIE_DOMAIN = '.example.com'
    expect(buildSessionCookie('tok123')).toContain('Domain=.example.com')
  })
})

describe('buildClearSessionCookie', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('Max-Age=0 để trình duyệt xoá ngay', () => {
    expect(buildClearSessionCookie()).toContain('Max-Age=0')
  })
})

// happy-dom (môi trường test) chặn set header "Cookie" qua `new Request(...)` (forbidden
// header name theo spec fetch, giống trình duyệt thật) — Node thật (server.ts chạy bằng
// undici) KHÔNG chặn vì đó không phải script trong trang. Giả một Request tối giản để test
// đúng logic parse mà không đụng giới hạn riêng của happy-dom.
function fakeRequestWithCookie(cookieHeader: string | null): Request {
  return {
    headers: { get: (name: string) => (name.toLowerCase() === 'cookie' ? cookieHeader : null) },
  } as unknown as Request
}

describe('readSessionCookie', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('không có header Cookie → null', () => {
    expect(readSessionCookie(fakeRequestWithCookie(null))).toBeNull()
  })

  it('có cookie đúng tên → trả giá trị', () => {
    const req = fakeRequestWithCookie(`${SESSION_COOKIE_NAME}=abc123; other=x`)
    expect(readSessionCookie(req)).toBe('abc123')
  })

  it('nhiều cookie khác, không có session_token → null', () => {
    const req = fakeRequestWithCookie('a=1; b=2')
    expect(readSessionCookie(req)).toBeNull()
  })

  it('giá trị cookie có ký tự cần decode (URI-encoded) → giải mã đúng', () => {
    const req = fakeRequestWithCookie(`${SESSION_COOKIE_NAME}=${encodeURIComponent('a b')}`)
    expect(readSessionCookie(req)).toBe('a b')
  })
})
