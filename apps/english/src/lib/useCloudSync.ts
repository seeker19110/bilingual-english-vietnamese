import { useEffect, useState } from 'react'
import { pullUserData } from './cloud'
import { pullProgress } from './progressSync'

// Hook nhỏ: khi trang mở (hoặc userId đổi), kéo dữ liệu mới nhất từ server về
// localStorage rồi tăng "version" để báo hiệu đã đồng bộ xong.
//
// QUAN TRỌNG — PHẢI DÙNG GIÁ TRỊ TRẢ VỀ: gọi suông `useCloudSync(user?.id)` rồi bỏ qua kết
// quả CHỈ đủ để bản thân component re-render, nhưng KHÔNG đủ để bất kỳ `useMemo`/`useEffect`
// nào đọc dữ liệu localStorage (streak, từ đã học, lịch sử...) tính lại — nếu deps của chúng
// không có `version`, React vẫn trả về giá trị đã cache TRƯỚC lúc kéo dữ liệu xong (thường là
// 0/rỗng trên thiết bị mới). Đây chính là nguyên nhân bug "streak/từ đã thuộc hiện 0 dù đã học
// trên máy khác" (audit 2026-07-28) — luôn gán `const version = useCloudSync(...)` rồi thêm
// `version` vào mảng deps của MỌI `useMemo` đọc dữ liệu qua localStorage.
export function useCloudSync(userId: string | undefined): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!userId) return
    let alive = true
    Promise.all([pullUserData(userId), pullProgress(userId)])
      .then(() => {
        if (alive) setVersion((v) => v + 1)
      })
      .catch((err) => {
        console.warn(
          '[useCloudSync] Data sync failed, using local cache:',
          err instanceof Error ? err.message : err,
        )
      })
    return () => {
      alive = false
    }
  }, [userId])

  return version
}
