// src/lib/authHeader.ts — Lấy JWT Supabase hiện tại để gửi kèm request lên server.
import { supabase } from './supabase'

export async function getAccessToken(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

// Header sẵn sàng spread vào fetch({ headers: { ...await getAuthHeader() } }).
// Rỗng nếu chưa đăng nhập — server sẽ tự trả 401 cho các endpoint bắt buộc auth.
export async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
