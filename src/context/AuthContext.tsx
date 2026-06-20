// src/context/AuthContext.tsx
// Đăng nhập THẬT bằng Supabase Auth (thay cho hệ thống cũ lưu ở localStorage
// trong src/lib/storage.ts — server không kiểm tra được nên không an toàn).
//
// Cung cấp cho toàn app: user hiện tại, accessToken (cần để gọi các API có
// xác thực, ví dụ lấy khóa giải mã audio ở api/tts.ts), và 3 hàm signIn/
// signUp/signOut. Dùng qua hook useAuth() ở bất kỳ component nào.
//
// Lưu ý cho người mới: Supabase Auth hoạt động KHÔNG đồng bộ (phải chờ mạng),
// khác với getCurrentUser() cũ đọc localStorage ngay lập tức. Vì vậy có thêm
// "loading" — true trong lúc đang kiểm tra phiên đăng nhập lúc mở app.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { Plan, User } from '../types'

interface AuthResult {
  error: string | null
  needsEmailConfirm?: boolean
}

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Đổi user của Supabase (nhiều field không cần) sang type User gọn của app.
// name/plan lưu trong user_metadata (đặt lúc signUp) — KHÔNG dùng để kiểm tra
// quyền quan trọng vì user có thể tự sửa metadata này; khi làm gói trả phí
// thật, chuyển "plan" sang một bảng riêng do server kiểm soát.
function mapUser(supaUser: SupabaseUser): User {
  const meta = supaUser.user_metadata as { name?: string; plan?: Plan } | null
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    name: meta?.name?.trim() || supaUser.email?.split('@')[0] || 'Học viên',
    plan: meta?.plan ?? 'free',
    createdAt: supaUser.created_at ? Date.parse(supaUser.created_at) : Date.now(),
  }
}

// Gộp các lỗi tiếng Anh phổ biến của Supabase thành tiếng Việt dễ hiểu.
function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email hoặc mật khẩu không đúng.'
  if (m.includes('user already registered')) return 'Email đã được dùng. Hãy đăng nhập.'
  if (m.includes('email not confirmed')) return 'Email chưa được xác nhận — kiểm tra hộp thư của bạn.'
  if (m.includes('password should be at least')) return 'Mật khẩu phải có ít nhất 6 ký tự.'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function applySession(session: Session | null) {
    setUser(session?.user ? mapUser(session.user) : null)
    setAccessToken(session?.access_token ?? null)
  }

  useEffect(() => {
    // Kiểm tra phiên đăng nhập đã có sẵn (ví dụ vừa mở lại trình duyệt).
    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session)
      setLoading(false)
    })

    // Lắng nghe mọi thay đổi sau đó: đăng nhập, đăng xuất, token tự làm mới...
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? translateAuthError(error.message) : null }
  }

  async function signUp(email: string, password: string, name: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, plan: 'free' satisfies Plan } },
    })
    if (error) return { error: translateAuthError(error.message) }
    // Nếu project Supabase đang bật "Confirm email" thì signUp không trả về
    // session ngay — phải xác nhận qua email mới đăng nhập được.
    return { error: null, needsEmailConfirm: !data.session }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
