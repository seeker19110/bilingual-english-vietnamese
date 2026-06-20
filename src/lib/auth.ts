// Wrapper đăng nhập/đăng ký qua Supabase Auth
// Giữ cùng tên hàm với storage.ts để Login.tsx thay import tối giản nhất
import { supabase } from './supabase'
import { ensureProfile } from './cloud'
import type { User as AppUser, Plan } from '../types'

// Chuyển Supabase user → kiểu User của app.
// plan đọc từ bảng profiles (mặc định 'free') để sau này nâng cấp Pro chỉ cần
// đổi cột plan trong DB là có hiệu lực.
async function toAppUser(sbUser: { id: string; email?: string; user_metadata?: { name?: string } }): Promise<AppUser> {
  const name = sbUser.user_metadata?.name ?? sbUser.email?.split('@')[0] ?? 'Học viên'
  const plan: Plan = await ensureProfile(sbUser.id, name)
  return {
    id: sbUser.id,
    email: sbUser.email ?? '',
    name,
    plan,
    createdAt: Date.now(),
  }
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

export async function logout() {
  await supabase.auth.signOut()
}

// Lấy user hiện tại (async — gọi 1 lần khi app khởi động)
export async function getCurrentUser(): Promise<AppUser | null> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  return await toAppUser(data.user)
}
