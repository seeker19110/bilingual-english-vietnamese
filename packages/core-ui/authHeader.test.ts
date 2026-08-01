import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getAccessToken,
  getAuthHeader,
} from './authHeader'

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

  it('localStorage bị chặn (throw) → getStoredToken trả null, không throw', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(getStoredToken()).toBeNull()
    spy.mockRestore()
  })

  it('localStorage bị chặn (throw) → setStoredToken không throw', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => setStoredToken('x')).not.toThrow()
    spy.mockRestore()
  })

  it('localStorage bị chặn (throw) → clearStoredToken không throw', () => {
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => clearStoredToken()).not.toThrow()
    spy.mockRestore()
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
