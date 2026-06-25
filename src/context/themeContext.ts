import { createContext } from 'react'
import type { Theme } from '../lib/theme'

export interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
