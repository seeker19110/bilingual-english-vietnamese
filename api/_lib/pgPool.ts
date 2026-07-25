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

  // PG_POOL_MAX cấu hình được qua .env (mặc định 10 — giữ nguyên hành vi cũ nếu không set).
  // Khi tách Postgres ra VPS riêng + PgBouncer (GĐ2 kế hoạch scale, xem
  // docs/research/dac-ta-gd2-scale-50k.md), tăng số này lên cho khớp default_pool_size của
  // PgBouncer — không cần sửa code + build lại mỗi lần đổi.
  const maxEnv = Number(process.env.PG_POOL_MAX)
  const max = Number.isFinite(maxEnv) && maxEnv > 0 ? maxEnv : 10

  cached = new Pool({ connectionString, max })
  cached.on('error', (err) => {
    // Lỗi kết nối idle (vd DB restart) — log, KHÔNG crash cả process.
    console.error('[pgPool] Lỗi kết nối idle:', err.message)
  })
  return cached
}
