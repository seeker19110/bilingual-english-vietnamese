import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './themeContext.js'
import { getTheme, applyTheme, setTheme as persistTheme, KID_THEME, type Theme } from './theme.js'

export interface ThemeProviderProps {
  children: ReactNode
  // Khoá cứng theme (ví dụ nhóm tuổi Nhi đồng của app tiếng Anh) — package core-ui KHÔNG tự
  // biết lý do khoá là gì, chỉ nhận cờ true/false từ app gọi. App tự tính giá trị này (đọc
  // auth/onboarding riêng của mình) rồi truyền vào, để core-ui không phụ thuộc ngược vào
  // logic nghiệp vụ của từng môn.
  locked?: boolean
  // true khi app ĐÃ xác định chắc chắn giá trị `locked` (không còn ở trạng thái đang tải dữ
  // liệu quyết định khoá). Mặc định true (app không có bước tải riêng thì luôn coi là đã rõ
  // ngay). Trong lúc chưa rõ (false), hiệu ứng tự-khôi-phục theme thật khi hết bị khoá sẽ
  // KHÔNG chạy — tránh giật theme trước khi biết chắc.
  settled?: boolean
}

export function ThemeProvider({ children, locked = false, settled = true }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getTheme)

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
    } else if (settled && theme === KID_THEME.value) {
      // Đổi nhóm tuổi ra khỏi Nhi đồng — quay lại đúng theme thật đã lưu trong localStorage.
      const stored = getTheme()
      applyTheme(stored)
      setThemeState(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, settled])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, locked }}>{children}</ThemeContext.Provider>
  )
}
