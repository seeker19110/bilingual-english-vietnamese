import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import { getCurrentUser } from '../lib/auth'
import { supabase } from '../lib/supabase'
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refresh()
    })
    return () => subscription.unsubscribe()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}
