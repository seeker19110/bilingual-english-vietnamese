import { useEffect } from 'react'

/**
 * Đặt document.title riêng cho một trang, trả về tiêu đề gốc khi rời trang.
 *
 * Dự án không dùng react-helmet — mọi trang set title trực tiếp qua document API (xem
 * Landing.tsx). Hook này gom lại logic đó để không lặp cùng một useEffect ở hàng chục trang.
 */
export function usePageTitle(title: string): void {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title
    return () => {
      document.title = prevTitle
    }
  }, [title])
}
