// Lưu, đọc và áp dụng theme giao diện: light / dark / dark blue
export type Theme = 'light' | 'dark' | 'dark-blue'

export const THEMES: { value: Theme; labelVi: string; labelEn: string }[] = [
  { value: 'light', labelVi: 'Sáng', labelEn: 'Light' },
  { value: 'dark', labelVi: 'Tối', labelEn: 'Dark' },
  { value: 'dark-blue', labelVi: 'Xanh đêm', labelEn: 'Dark blue' },
]

const KEY = 'ui_theme'

export function getTheme(): Theme {
  const t = localStorage.getItem(KEY)
  if (t === 'light' || t === 'dark' || t === 'dark-blue') return t
  return 'dark' // mặc định: tối
}

// Gắn theme vào thẻ <html> (data-theme) để CSS biến đổi màu theo
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function setTheme(theme: Theme) {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
}
