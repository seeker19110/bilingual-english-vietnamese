// packages/core-ui/clientAuth.test.ts — Kiểm thử module xác thực clientAuth và Safe Redirect.

import { describe, it, expect } from 'vitest'
import { getSafeRedirectUrl } from './clientAuth'

describe('packages/core-ui/clientAuth.ts', () => {
  describe('getSafeRedirectUrl', () => {
    it('không có tham số hoặc chuỗi rỗng → trả về fallbackUrl mặc định', () => {
      expect(getSafeRedirectUrl(null)).toBe('https://www.donghanhcungban.org/')
      expect(getSafeRedirectUrl('')).toBe('https://www.donghanhcungban.org/')
      expect(getSafeRedirectUrl('   ', '/dashboard')).toBe('/dashboard')
    })

    it('đường dẫn tương đối hợp lệ (bắt đầu bằng /) → cho phép', () => {
      expect(getSafeRedirectUrl('/')).toBe('/')
      expect(getSafeRedirectUrl('/login')).toBe('/login')
      expect(getSafeRedirectUrl('/practice?level=A1')).toBe('/practice?level=A1')
    })

    it('đường dẫn bắt đầu bằng // (protocol-relative URL lạ) → từ chối, trả fallbackUrl', () => {
      expect(getSafeRedirectUrl('//evil.com/phishing')).toBe('https://www.donghanhcungban.org/')
    })

    it('URL tuyệt đối thuộc domain donghanhcungban.org / donghanhcungban.com → cho phép', () => {
      expect(getSafeRedirectUrl('https://donghanhcungban.org/')).toBe(
        'https://donghanhcungban.org/',
      )
      expect(getSafeRedirectUrl('https://www.donghanhcungban.org/profile')).toBe(
        'https://www.donghanhcungban.org/profile',
      )
      expect(getSafeRedirectUrl('https://en-vi.donghanhcungban.org/learning-path')).toBe(
        'https://en-vi.donghanhcungban.org/learning-path',
      )
      expect(getSafeRedirectUrl('https://math.donghanhcungban.org/')).toBe(
        'https://math.donghanhcungban.org/',
      )
      expect(getSafeRedirectUrl('https://en-vi.donghanhcungban.com/test')).toBe(
        'https://en-vi.donghanhcungban.com/test',
      )
    })

    it('URL localhost / 127.0.0.1 khi dev → cho phép', () => {
      expect(getSafeRedirectUrl('http://localhost:3000/')).toBe('http://localhost:3000/')
      expect(getSafeRedirectUrl('http://localhost:5173/practice')).toBe(
        'http://localhost:5173/practice',
      )
      expect(getSafeRedirectUrl('http://127.0.0.1:3000/test')).toBe('http://127.0.0.1:3000/test')
    })

    it('URL độc hại / domain bên ngoài (Open Redirect Attack) → từ chối, trả fallbackUrl', () => {
      expect(getSafeRedirectUrl('https://evil.com/hack')).toBe('https://www.donghanhcungban.org/')
      expect(getSafeRedirectUrl('https://attacker-donghanhcungban.org/')).toBe(
        'https://www.donghanhcungban.org/',
      )
      expect(getSafeRedirectUrl('javascript:alert(1)')).toBe('https://www.donghanhcungban.org/')
    })
  })
})
