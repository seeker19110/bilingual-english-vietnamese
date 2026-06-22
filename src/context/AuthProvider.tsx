import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import { getCurrentUser } from '../lib/auth'
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
      if (event === 'SIGNED_OUT') { resetPreload(); void clearAudioCache() }
      refresh()
    })
    return () => subscription.unsubscribe()
  }, [refresh])

  // Khi user đăng nhập xong → bắt đầu tải trước từ điển + audio (chạy nền)
  useEffect(() => {
    if (user) {
      // Dùng setTimeout để không block quá trình render trang đầu tiên
      const tid = setTimeout(() => { void startPreload(user.id) }, 2000)
      return () => clearTimeout(tid)
    }
  }, [user?.id])

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}
