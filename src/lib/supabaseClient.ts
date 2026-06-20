// src/lib/supabaseClient.ts
// Supabase client dùng ở PHÍA BROWSER — dùng anon key (public, an toàn vì có
// Row Level Security bảo vệ), khác với api/_lib/supabaseAdmin.ts dùng service
// role key (chỉ chạy ở server, KHÔNG bao giờ import file đó từ đây).
//
// Dùng cho: đăng nhập/đăng ký (Supabase Auth) — xem src/context/AuthContext.tsx.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Lỗi rõ ràng ngay lúc khởi động thay vì lỗi khó hiểu lúc gọi auth.
  // Xem AUTH_SETUP.md để biết cách lấy 2 biến này.
  console.error(
    'Thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY trong .env — xem AUTH_SETUP.md',
  )
}

export const supabase = createClient(url ?? '', anonKey ?? '')
