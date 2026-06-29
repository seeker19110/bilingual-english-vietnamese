import { useState, type ReactNode } from 'react'
import { ThemeContext } from './themeContext'
import { getTheme, setTheme as persistTheme, type Theme } from '../lib/theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getTheme)

  function setTheme(t: Theme) {
    persistTheme(t) // lưu localStorage + gắn data-theme lên <html>
    setThemeState(t)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
