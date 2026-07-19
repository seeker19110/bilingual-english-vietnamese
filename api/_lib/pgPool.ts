// api/_lib/pgPool.ts — Pool kết nối PostgreSQL tự host (Giai đoạn B trở đi).
// Dùng chung cho mọi truy vấn phía server tới Postgres mới (KHÁC getSupabaseAdmin() —
// file đó vẫn còn dùng cho các bảng nghiệp vụ CHƯA di trú, xem docs/migration-thoat-ly-supabase.md).

import { Pool } from 'pg'

let cached: Pool | null = null

export function getPgPool(): Pool {
  if (cached) return cached

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'Server chưa cấu hình DATABASE_URL — xem docs/setup-postgresql-vps.md (Giai đoạn A).',
    )
  }

  cached = new Pool({ connectionString, max: 10 })
  cached.on('error', (err) => {
    // Lỗi kết nối idle (vd DB restart) — log, KHÔNG crash cả process.
    console.error('[pgPool] Lỗi kết nối idle:', err.message)
  })
  return cached
}
