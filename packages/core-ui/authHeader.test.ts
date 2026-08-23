import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getAccessToken,
  getAuthHeader,
} from './authHeader.js'

beforeEach(() => {
  localStorage.clear()
})

describe('getStoredToken/setStoredToken/clearStoredToken', () => {
  it('chưa lưu gì → null', () => {
    expect(getStoredToken()).toBeNull()
  })

  it('lưu rồi đọc lại → đúng giá trị', () => {
    setStoredToken('abc123')
    expect(getStoredToken()).toBe('abc123')
  })

  it('xoá token → đọc lại null', () => {
    setStoredToken('abc123')
    clearStoredToken()
    expect(getStoredToken()).toBeNull()
  })

  // `vi.spyOn(Storage.prototype, ...)` KHÔNG dùng ở đây dù chạy đúng logic (đã xác minh thủ công) —
  // v8 coverage provider của Vitest không ghi nhận nhánh `catch` được chạm khi spy ở tầng
  // prototype xen giữa các lệnh gọi `localStorage` bình thường khác trong cùng file test (bug
  // công cụ, không phải bug code). Thay `window.localStorage` toàn bộ bằng
  // `Object.defineProperty` để v8 coverage đếm đúng nhánh catch.
  function withBlockedLocalStorage<T>(stub: Partial<Storage>, run: () => T): T {
    const original = window.localStorage
    Object.defineProperty(window, 'localStorage', { configurable: true, value: stub })
    try {
      return run()
    } finally {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: original })
    }
  }

  it('localStorage bị chặn (throw) → getStoredToken trả null, không throw', () => {
    const result = withBlockedLocalStorage(
      {
        getItem() {
          throw new Error('blocked')
        },
      },
      () => getStoredToken(),
    )
    expect(result).toBeNull()
  })

  it('localStorage bị chặn (throw) → setStoredToken không throw', () => {
    withBlockedLocalStorage(
      {
        setItem() {
          throw new Error('blocked')
        },
      },
      () => expect(() => setStoredToken('x')).not.toThrow(),
    )
  })

  it('localStorage bị chặn (throw) → clearStoredToken không throw', () => {
    withBlockedLocalStorage(
      {
        removeItem() {
          throw new Error('blocked')
        },
      },
      () => expect(() => clearStoredToken()).not.toThrow(),
    )
  })
})

describe('getAccessToken', () => {
  it('chưa đăng nhập → undefined (không phải null)', () => {
    expect(getAccessToken()).toBeUndefined()
  })

  it('đã đăng nhập → trả đúng token', () => {
    setStoredToken('tok-1')
    expect(getAccessToken()).toBe('tok-1')
  })
})

describe('getAuthHeader', () => {
  it('chưa đăng nhập → header rỗng', () => {
    expect(getAuthHeader()).toEqual({})
  })

  it('đã đăng nhập → header có Authorization Bearer đúng token', () => {
    setStoredToken('tok-2')
    expect(getAuthHeader()).toEqual({ Authorization: 'Bearer tok-2' })
  })
})
