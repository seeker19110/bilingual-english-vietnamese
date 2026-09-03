// Lưu, đọc và áp dụng theme giao diện.
// 4 theme tự chọn: Xanh đêm (mặc định) · Blue sky · Pink · Rực rỡ.
// + 1 theme "Nhi đồng" (kid) — KHÔNG nằm trong THEMES (không cho tự chọn/cycle qua
// ThemeToggle), chỉ tự áp + khoá cứng cho user có age_group='nhi_dong' (xem
// ThemeProvider.tsx). Kế hoạch "giao diện + nội dung theo độ tuổi", PROGRESS.md 2026-07-22.
export type Theme = 'dark-blue' | 'blue-sky' | 'pink' | 'vibrant' | 'kid'

export const THEMES: {
  value: Theme
  labelVi: string
  labelEn: string
}[] = [
  { value: 'dark-blue', labelVi: 'Xanh đêm', labelEn: 'Night blue' },
  { value: 'blue-sky', labelVi: 'Blue sky', labelEn: 'Blue sky' },
  { value: 'pink', labelVi: 'Pink', labelEn: 'Pink' },
  { value: 'vibrant', labelVi: 'Rực rỡ', labelEn: 'Vibrant' },
]

// Theme "Nhi đồng" — tách riêng khỏi THEMES (mảng cho ThemeToggle cycle qua) vì đây là
// theme BỊ KHOÁ, không phải lựa chọn tự do.
export const KID_THEME = { value: 'kid' as const, labelVi: 'Nhi đồng', labelEn: 'Kids' }

const VALID = new Set<Theme>([...THEMES.map((t) => t.value), KID_THEME.value])
const DEFAULT_THEME: Theme = 'dark-blue' // mặc định: Xanh đêm
const KEY = 'ui_theme'

// Màu thanh trình duyệt (meta theme-color) theo từng theme — đồng bộ với --theme-color trong CSS
const THEME_COLORS: Record<Theme, string> = {
  'dark-blue': '#0b1226', // = --z-900 mới của theme Sci-Fi (2026-09-03)
  'blue-sky': '#f0f9ff',
  pink: '#fff8fc',
  vibrant: '#1c1428',
  kid: '#fffbeb',
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
