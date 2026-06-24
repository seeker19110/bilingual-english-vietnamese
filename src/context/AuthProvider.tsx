import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import { getCurrentUser, clearProfileCache } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { startPreload, resetPreload } from '../lib/preloader'
import { clearAudioCache } from '../lib/audioCache'
import type { User } from '../types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const u = await getCurrentUser()
    setUser(u)
  }, [])

  useEffect(() => {
    // Lấy session lần đầu
    refresh().finally(() => setLoading(false))

    // Lắng nghe thay đổi auth (đăng nhập / đăng xuất / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT') { resetPreload(); clearProfileCache(); void clearAudioCache() }
      refresh()
    })
    return () => subscription.unsubscribe()
  }, [refresh])

  // Khi user đăng nhập xong → tải trước từ điển + audio khi browser rảnh (không block UI).
  // Chỉ phụ thuộc userId (không phải cả object user) để không chạy lại mỗi khi user đổi tham chiếu.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    if ('requestIdleCallback' in window) {
      // Chờ browser hoàn toàn rảnh rồi mới preload; maxWait: tối đa 3s vẫn chạy
      const id = requestIdleCallback(() => { void startPreload(userId) }, { timeout: 3000 })
      return () => cancelIdleCallback(id)
    } else {
      // Fallback cho Safari cũ: chờ 500ms (ngắn hơn 2000ms vì auth nhanh hơn rồi)
      const tid = setTimeout(() => { void startPreload(userId) }, 500)
      return () => clearTimeout(tid)
    }
  }, [userId])

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}
