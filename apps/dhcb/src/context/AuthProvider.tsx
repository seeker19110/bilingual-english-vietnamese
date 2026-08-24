import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import { getCurrentUser } from '../lib/auth'
import { preloadBrowseChunks } from '../lib/preloadBrowse'
import { resetPreload } from '../lib/preloadState'
import { clearAudioCache } from '../lib/audioCache'
import { cacheAllowedVoices } from '../lib/voiceTiers'
import type { User } from '../types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const wasLoggedIn = useRef(false)

  const refresh = useCallback(async () => {
    const u = await getCurrentUser()
    // Token vừa mất (đăng xuất / hết hạn) mà trước đó đang đăng nhập → dọn state client-only
    // (Giai đoạn B: không còn onAuthStateChange của Supabase để bắt sự kiện SIGNED_OUT).
    if (wasLoggedIn.current && !u) {
      resetPreload()
      void clearAudioCache()
    }
    wasLoggedIn.current = !!u
    setUser(u)
    // Cache giọng gói thật (Free/Pro/VIP) để chế độ "giọng ngẫu nhiên" (lib/tts.ts) chỉ random
    // đúng trong phạm vi được phép — tránh random ra giọng rồi bị server âm thầm hạ xuống.
    if (u) cacheAllowedVoices(u.plan)
  }, [])

  useEffect(() => {
    // Gọi qua then() để mọi setState chạy trong callback bất đồng bộ
    // (luật react-hooks/set-state-in-effect — không setState đồng bộ trong effect).
    void Promise.resolve()
      .then(refresh)
      .finally(() => setLoading(false))

    // Bearer token không tự "hết hạn giữa chừng" như cookie — chỉ cần đồng bộ lại giữa các
    // tab khi 1 tab đăng xuất/đăng nhập (localStorage 'storage' event chỉ bắn ở TAB KHÁC).
    function onStorage(e: StorageEvent) {
      if (e.key === null || e.key === 'gsa_session_token_v1') refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  // Khi user đăng nhập xong → CHỈ warm-up nhẹ chunk đầu của trang Bài học + Cụm từ
  // khi browser rảnh. KHÔNG tải từ điển ở đây nữa (nặng ~560KB) — việc đó để trang
  // Học tự lo khi user thật sự vào (xem preloadLearnData trong Learn.tsx), nên người
  // chỉ dùng Chat/Tra từ/Viết không phải tải dữ liệu họ không dùng.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(
        () => {
          void preloadBrowseChunks()
        },
        { timeout: 3000 },
      )
      return () => cancelIdleCallback(id)
    } else {
      const tid = setTimeout(() => {
        void preloadBrowseChunks()
      }, 500)
      return () => clearTimeout(tid)
    }
  }, [userId])

  return <AuthContext.Provider value={{ user, loading, refresh }}>{children}</AuthContext.Provider>
}
