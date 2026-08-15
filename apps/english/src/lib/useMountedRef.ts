// Theo dõi component còn "mounted" hay không — dùng để chặn setState sau khi
// component đã unmount (VD: người dùng rời trang giữa lúc đang chờ AI trả lời).
// React 18 không crash khi gọi setState sau unmount, chỉ cảnh báo ở dev + có thể
// ghi đè state của trang mới nếu instance cũ giữ tham chiếu callback cũ — nên vẫn
// nên chặn ở những chỗ gọi API lâu (AI/STT), không cần áp cho fetch nhanh mọi nơi.
import { useEffect, useRef } from 'react'

export function useMountedRef() {
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return mountedRef
}
