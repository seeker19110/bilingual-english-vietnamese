import type { ReactNode } from 'react'
import { ThemeProvider } from '@core/ThemeProvider'
import { useAuth } from './useAuth'
import { useOnboarding } from '../lib/onboarding'

// Bọc ThemeProvider dùng chung (packages/core-ui) — tự tính "locked" (khoá cứng theme cho
// nhóm tuổi Nhi đồng) từ auth + onboarding CỦA RIÊNG APP TIẾNG ANH, rồi truyền xuống dạng
// prop thuần. package core-ui không biết gì về khái niệm "Nhi đồng"/onboarding — môn khác
// (Toán, GĐ2) tự quyết định có cần khoá theme hay không, không bị buộc theo app tiếng Anh.
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const onboardingData = useOnboarding(user?.id)
  // Chỉ biết CHẮC CHẮN người dùng KHÔNG phải Nhi đồng khi đã đọc được ageGroup (cache hoặc
  // fetch xong) — trong lúc đang tải (onboardingData null), KHÔNG ép đổi theme (tránh giật
  // theme của người dùng đang dùng bình thường mỗi lần load trang trước khi dữ liệu về).
  const locked = onboardingData?.ageGroup === 'nhi_dong'
  const settled = onboardingData != null

  return (
    <ThemeProvider locked={locked} settled={settled}>
      {children}
    </ThemeProvider>
  )
}
