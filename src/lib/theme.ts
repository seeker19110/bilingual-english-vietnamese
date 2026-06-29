// Lưu, đọc và áp dụng theme giao diện.
// 4 theme: Xanh đêm (mặc định) · Blue sky · Pink · Rực rỡ.
export type Theme = 'dark-blue' | 'blue-sky' | 'pink' | 'vibrant'

export const THEMES: {
  value: Theme
  labelVi: string
  labelEn: string
  emoji: string
  // Màu đại diện để vẽ ô swatch trong menu chọn theme (nền + nhấn)
  swatchBg: string
  swatchAccent: string
}[] = [
  {
    value: 'dark-blue',
    labelVi: 'Xanh đêm',
    labelEn: 'Night blue',
    emoji: '🌙',
    swatchBg: '#0f172a',
    swatchAccent: '#10b981',
  },
  {
    value: 'blue-sky',
    labelVi: 'Blue sky',
    labelEn: 'Blue sky',
    emoji: '☀️',
    swatchBg: '#f0f9ff',
    swatchAccent: '#0ea5e9',
  },
  {
    value: 'pink',
    labelVi: 'Pink',
    labelEn: 'Pink',
    emoji: '🌸',
    swatchBg: '#fff8fc',
    swatchAccent: '#ec4899',
  },
  {
    value: 'vibrant',
    labelVi: 'Rực rỡ',
    labelEn: 'Vibrant',
    emoji: '🎉',
    swatchBg: '#1c1428',
    swatchAccent: '#d946ef',
  },
]

const VALID = new Set<Theme>(THEMES.map((t) => t.value))
const DEFAULT_THEME: Theme = 'dark-blue' // mặc định: Xanh đêm
const KEY = 'ui_theme'

// Màu thanh trình duyệt (meta theme-color) theo từng theme — đồng bộ với --theme-color trong CSS
const THEME_COLORS: Record<Theme, string> = {
  'dark-blue': '#0f172a',
  'blue-sky': '#f0f9ff',
  pink: '#fff8fc',
  vibrant: '#1c1428',
}

export function getTheme(): Theme {
  const t = localStorage.getItem(KEY) as Theme | null
  if (t && VALID.has(t)) return t
  return DEFAULT_THEME
}

// Gắn theme vào thẻ <html> (data-theme) để CSS biến đổi màu theo,
// đồng thời cập nhật meta theme-color (màu thanh trình duyệt trên mobile/PWA).
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = THEME_COLORS[theme]
}

export function setTheme(theme: Theme) {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
}
