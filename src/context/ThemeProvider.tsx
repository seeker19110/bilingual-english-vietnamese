import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './themeContext'
import { getTheme, applyTheme, setTheme as persistTheme, KID_THEME, type Theme } from '../lib/theme'
import { useAuth } from './useAuth'
import { useOnboarding } from '../lib/onboarding'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const { user } = useAuth()
  const onboardingData = useOnboarding(user?.id)
  // Chỉ biết CHẮC CHẮN người dùng KHÔNG phải Nhi đồng khi đã đọc được ageGroup (cache hoặc
  // fetch xong) — trong lúc đang tải (onboardingData null), KHÔNG ép đổi theme (tránh giật
  // theme của người dùng đang dùng bình thường mỗi lần load trang trước khi dữ liệu về).
  const locked = onboardingData?.ageGroup === 'nhi_dong'

  function setTheme(t: Theme) {
    if (locked) return // Nhi đồng bị khoá cứng — không cho tự đổi qua ThemeToggle
    persistTheme(t) // lưu localStorage + gắn data-theme lên <html>
    setThemeState(t)
  }

  // Tự áp/gỡ theme "Nhi đồng" ngay khi biết chắc ageGroup. CHỦ Ý dùng applyTheme() (chỉ đổi
  // DOM/hiển thị) thay vì persistTheme() ở đây — KHÔNG ghi đè localStorage (ui_theme) để giữ
  // nguyên lựa chọn theme thật của user; nếu sau này đổi lại nhóm tuổi khác nhi_dong, đọc lại
  // đúng theme đã chọn trước đó qua getTheme() (không hề bị mất).
  useEffect(() => {
    if (locked) {
      if (theme !== KID_THEME.value) {
        applyTheme(KID_THEME.value)
        setThemeState(KID_THEME.value)
      }
    } else if (onboardingData && theme === KID_THEME.value) {
      // Đổi nhóm tuổi ra khỏi Nhi đồng — quay lại đúng theme thật đã lưu trong localStorage.
      const stored = getTheme()
      applyTheme(stored)
      setThemeState(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, onboardingData])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, locked }}>{children}</ThemeContext.Provider>
  )
}
