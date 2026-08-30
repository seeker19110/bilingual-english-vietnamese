// useIsDesktopViewport — true khi màn hình rộng ≥1024px (khớp breakpoint Tailwind `lg:`).
// Dùng khi PHẢI quyết định bằng JS chứ không chỉ bằng CSS — vd tránh render TRÙNG cùng một
// nội dung ở 2 nơi rồi ẩn bằng class `lg:hidden`/`hidden lg:flex` (ẩn bằng CSS vẫn để nguyên
// text đó trong DOM ở CẢ HAI nơi, khiến trình đọc màn hình/kiểm thử `getByText` thấy 2 phần
// tử trùng — xem Chat.tsx: FeedbackBlock trong Bubble/FeedbackPanel).
import { useState, useEffect } from 'react'

const QUERY = '(min-width: 1024px)'

export function useIsDesktopViewport(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = () => setIsDesktop(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}
