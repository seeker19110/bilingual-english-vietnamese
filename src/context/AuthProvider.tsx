import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import { getCurrentUser, clearProfileCache } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { preloadBrowseChunks } from '../lib/preloadBrowse'
import { resetPreload } from '../lib/preloadState'
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

  // Khi user đăng nhập xong → CHỈ warm-up nhẹ chunk đầu của trang Bài học + Cụm từ
  // khi browser rảnh. KHÔNG tải từ điển ở đây nữa (nặng ~560KB) — việc đó để trang
  // Học tự lo khi user thật sự vào (xem preloadLearnData trong Learn.tsx), nên người
  // chỉ dùng Chat/Tra từ/Viết không phải tải dữ liệu họ không dùng.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => { void preloadBrowseChunks() }, { timeout: 3000 })
      return () => cancelIdleCallback(id)
    } else {
      const tid = setTimeout(() => { void preloadBrowseChunks() }, 500)
      return () => clearTimeout(tid)
    }
  }, [userId])

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}
