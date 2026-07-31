import { createContext } from 'react'
import type { Theme } from '../lib/theme'

export interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  // true khi theme đang bị khoá cứng theo nhóm tuổi (Nhi đồng) — ThemeToggle ẩn nút đổi.
  locked: boolean
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
