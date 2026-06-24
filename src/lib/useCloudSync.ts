import { useEffect, useState } from 'react'
import { pullUserData } from './cloud'

// Hook nhỏ: khi trang mở (hoặc userId đổi), kéo dữ liệu mới nhất từ Supabase
// về localStorage rồi tăng "version" để component vẽ lại với dữ liệu đã đồng bộ.
// Dùng: gọi useCloudSync(user?.id) ở đầu component — không cần dùng giá trị trả về,
// việc setState bên trong đã đủ kích hoạt re-render.
export function useCloudSync(userId: string | undefined): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!userId) return
    let alive = true
    pullUserData(userId)
      .then(() => { if (alive) setVersion(v => v + 1) })
      .catch(err => {
        console.warn('[useCloudSync] Data sync failed, using local cache:', err instanceof Error ? err.message : err)
      })
    return () => { alive = false }
  }, [userId])

  return version
}
