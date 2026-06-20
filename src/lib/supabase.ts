// Supabase client phía browser — dùng ANON KEY (an toàn để public)
// Khác với api/_lib/supabaseAdmin.ts dùng SERVICE ROLE KEY (chỉ dùng ở server)
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  console.warn('Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env')
}

export const supabase = createClient(url ?? '', anonKey ?? '')
