import { useEffect, useState } from 'react'
import { pullUserData } from './cloud'
import { pullProgress } from './progressSync'

// Đồng bộ lại mỗi 1 GIỜ dù không có gì đặc biệt xảy ra — phòng trường hợp máy có mạng
// liên tục nhưng server từng sập một lúc rồi tự hồi phục (tab không tắt/mở lại nên không
// có cơ hội chạy lại effect ở trên, và cũng không có sự kiện 'online' nào bắn ra vì mạng
// máy vẫn luôn có, chỉ server là bên gặp lỗi).
const RESYNC_INTERVAL_MS = 60 * 60 * 1000

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
//
// Đồng bộ lại thêm khi: (1) mạng có lại sau khi mất (sự kiện 'online' — bù cho lúc offline
// không đẩy được gì lên), (2) mỗi 1 giờ trong lúc app vẫn mở (RESYNC_INTERVAL_MS — bù server
// sập rồi hồi phục mà không ai đóng/mở lại tab). Cả 2 đều gọi LẠI ĐÚNG cặp hàm kéo
// (pullUserData/pullProgress) như lúc mở app, KHÔNG gọi push thẳng: pullProgress() luôn kéo
// bản server về hợp nhất (union) với local rồi mới đẩy bản đã hợp nhất lên — nên không bao giờ
// ghi đè mất phần dữ liệu chỉ có trên server (khác nếu gọi pushProgress() trần, sẽ gửi thẳng
// bản local có thể đang cũ hơn server).
export function useCloudSync(userId: string | undefined): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!userId) return
    const uid = userId // chốt lại kiểu `string` (khỏi `string | undefined`) cho `sync` dùng
    let alive = true

    function sync() {
      Promise.all([pullUserData(uid), pullProgress(uid)])
        .then(() => {
          if (alive) setVersion((v) => v + 1)
        })
        .catch((err) => {
          console.warn(
            '[useCloudSync] Data sync failed, using local cache:',
            err instanceof Error ? err.message : err,
          )
        })
    }

    sync()
    window.addEventListener('online', sync)
    const intervalId = window.setInterval(sync, RESYNC_INTERVAL_MS)

    return () => {
      alive = false
      window.removeEventListener('online', sync)
      window.clearInterval(intervalId)
    }
  }, [userId])

  return version
}
