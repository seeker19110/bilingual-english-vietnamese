// api/_lib/supabaseAdmin.ts
// Supabase client dùng SERVICE ROLE KEY — chỉ chạy ở server, có quyền đọc/ghi toàn bộ
// (bỏ qua Row Level Security). Dùng để đọc/ghi bảng `pronunciations` và upload file vào Storage.
// KHÔNG bao giờ import file này từ code phía browser (thư mục src/) — lộ service role key
// đồng nghĩa với việc bất kỳ ai cũng có toàn quyền với database.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Server chưa cấu hình SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
  return cached
}
