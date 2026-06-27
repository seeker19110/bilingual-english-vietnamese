// Wrapper đăng nhập/đăng ký qua Supabase Auth
// Giữ cùng tên hàm với storage.ts để Login.tsx thay import tối giản nhất
import { supabase } from './supabase'
import { ensureProfile } from './cloud'
import type { User as AppUser, Plan } from '../types'

// Cache profile trong localStorage để lần tiếp theo mở app không cần gọi DB
// (chỉ cache khi đã onboarded — state ổn định, không thay đổi nữa)
const PROFILE_CACHE_KEY = 'gsa_profile_v1'
// TTL 5 phút: quá hạn thì lấy lại gói từ DB. Tránh trường hợp user nâng cấp Pro nhưng
// cache cũ vẫn báo Free → bị chặn nhầm bởi giới hạn gói Free phía client.
const PROFILE_TTL_MS = 5 * 60 * 1000

function getCachedProfile(userId: string): { plan: string; onboarded: boolean } | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as { id: string; plan: string; onboarded: boolean; ts?: number }
    // Bỏ cache nếu sai user, chưa onboarded (chưa ổn định), hoặc đã quá hạn TTL
    if (c.id !== userId || !c.onboarded) return null
    if (typeof c.ts !== 'number' || Date.now() - c.ts > PROFILE_TTL_MS) return null
    return c
  } catch { return null }
}

function setCachedProfile(userId: string, profile: { plan: 'free' | 'pro'; onboarded: boolean }) {
  try { localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ id: userId, ...profile, ts: Date.now() })) } catch { /* localStorage đầy/bị chặn — bỏ qua, chỉ là cache */ }
}

export function clearProfileCache() {
  localStorage.removeItem(PROFILE_CACHE_KEY)
}

// Chuyển Supabase user → kiểu User của app.
// Chiến lược 2 tầng: cache localStorage → DB (nền).
// Lần đầu / chưa onboarded: đợi DB (~400ms). Lần sau: cache (~1ms), DB chạy nền.
async function toAppUser(sbUser: { id: string; email?: string; user_metadata?: { name?: string } }): Promise<AppUser> {
  const name = sbUser.user_metadata?.name ?? sbUser.email?.split('@')[0] ?? 'Học viên'

  const cached = getCachedProfile(sbUser.id)
  if (cached) {
    // Refresh plan ngầm (không block UI) — cập nhật khi user nâng cấp Pro
    void ensureProfile(sbUser.id, name)
      .then(p => setCachedProfile(sbUser.id, p))
      .catch(err => console.warn('[auth] Background profile refresh failed:', err instanceof Error ? err.message : err))
    return { id: sbUser.id, email: sbUser.email ?? '', name, plan: cached.plan as Plan, onboarded: true, createdAt: Date.now() }
  }

  // Không cache (lần đầu hoặc chưa onboarded) — fetch DB thật
  const profile = await ensureProfile(sbUser.id, name)
  if (profile.onboarded) setCachedProfile(sbUser.id, profile)
  return { id: sbUser.id, email: sbUser.email ?? '', name, plan: profile.plan as Plan, onboarded: profile.onboarded, createdAt: Date.now() }
}

export async function register(email: string, name: string, password: string): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error || !data.user) return null
  return await toAppUser(data.user)
}

export async function login(email: string, password: string): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return null
  return await toAppUser(data.user)
}

// Đăng nhập bằng Google (OAuth qua Supabase).
// Lưu ý: hàm này KHÔNG trả về user ngay — nó chuyển hướng trình duyệt sang
// trang đăng nhập Google. Sau khi Google trả về, Supabase tự đọc token trên URL
// và AuthProvider (onAuthStateChange) sẽ cập nhật user.
// Cần bật Google provider trong Supabase Dashboard → Authentication → Providers.
export async function loginWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Quay lại đúng trang hiện tại sau khi đăng nhập xong
      redirectTo: window.location.origin,
    },
  })
  if (error) throw error
}

export async function logout() {
  await supabase.auth.signOut()
}

// Lấy user hiện tại (async — gọi 1 lần khi app khởi động).
// Dùng getSession() (đọc localStorage ~1ms) thay getUser() (gọi mạng ~500ms).
// Supabase client tự refresh token hết hạn qua onAuthStateChange — không cần validate thủ công.
export async function getCurrentUser(): Promise<AppUser | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  return await toAppUser(session.user)
}
