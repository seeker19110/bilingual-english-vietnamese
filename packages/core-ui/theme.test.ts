import { describe, it, expect, beforeEach } from 'vitest'
import { getTheme, applyTheme, setTheme, THEMES, KID_THEME, type Theme } from './theme.js'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.head.innerHTML = '<meta name="theme-color" content="" />'
})

describe('getTheme', () => {
  it('chưa lưu gì → mặc định dark-blue (Xanh đêm)', () => {
    expect(getTheme()).toBe('dark-blue')
  })

  it('đã lưu theme hợp lệ → đọc đúng giá trị đó', () => {
    localStorage.setItem('ui_theme', 'pink')
    expect(getTheme()).toBe('pink')
  })

  it('giá trị lưu không hợp lệ (rác/cũ) → rơi về mặc định, không throw', () => {
    localStorage.setItem('ui_theme', 'khong-ton-tai')
    expect(getTheme()).toBe('dark-blue')
  })

  it('theme "kid" (Nhi đồng) cũng đọc được dù không nằm trong THEMES', () => {
    localStorage.setItem('ui_theme', 'kid')
    expect(getTheme()).toBe('kid')
  })
})

describe('applyTheme', () => {
  it('gắn data-theme lên <html> và đổi meta theme-color tương ứng', () => {
    applyTheme('blue-sky')
    expect(document.documentElement.getAttribute('data-theme')).toBe('blue-sky')
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    expect(meta?.content).toBe('#f0f9ff')
  })

  it('không có thẻ meta theme-color trong DOM → không throw', () => {
    document.head.innerHTML = ''
    expect(() => applyTheme('dark-blue')).not.toThrow()
  })
})

describe('setTheme', () => {
  it('lưu vào localStorage VÀ áp dụng ngay lên DOM', () => {
    setTheme('vibrant')
    expect(localStorage.getItem('ui_theme')).toBe('vibrant')
    expect(document.documentElement.getAttribute('data-theme')).toBe('vibrant')
  })
})

describe('THEMES / KID_THEME', () => {
  it('THEMES có đúng 4 theme tự chọn, KHÔNG chứa "kid"', () => {
    expect(THEMES).toHaveLength(4)
    expect(THEMES.some((t) => t.value === ('kid' as Theme))).toBe(false)
  })

  it('KID_THEME tách riêng, value = "kid"', () => {
    expect(KID_THEME.value).toBe('kid')
  })
})
