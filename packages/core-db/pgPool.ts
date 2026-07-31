// api/_lib/pgPool.ts — Pool kết nối PostgreSQL tự host (Giai đoạn B trở đi).
// Dùng chung cho mọi truy vấn phía server tới Postgres mới (KHÁC getSupabaseAdmin() —
// file đó vẫn còn dùng cho các bảng nghiệp vụ CHƯA di trú, xem docs/migration-thoat-ly-supabase.md).

import { Pool } from 'pg'

function makePool(connectionString: string, maxEnvVar: string): Pool {
  const maxEnv = Number(process.env[maxEnvVar])
  const max = Number.isFinite(maxEnv) && maxEnv > 0 ? maxEnv : 10
  const pool = new Pool({ connectionString, max })
  pool.on('error', (err) => {
    // Lỗi kết nối idle (vd DB restart) — log, KHÔNG crash cả process.
    console.error(`[pgPool] Lỗi kết nối idle (${maxEnvVar}):`, err.message)
  })
  return pool
}

let cached: Pool | null = null

// Pool GHI (write) — mọi insert/update/delete PHẢI qua đây. Cũng là pool ĐỌC mặc định khi
// chưa cấu hình read-replica (DATABASE_URL_READ) — xem getPgReadPool() bên dưới.
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
  cached = makePool(connectionString, 'PG_POOL_MAX')
  return cached
}

let cachedRead: Pool | null = null

// Pool ĐỌC riêng — trỏ vào Postgres READ-REPLICA qua biến môi trường DATABASE_URL_READ
// (chuẩn bị cho scale 100k-1M, xem docs/research/ke-hoach-scale-30k-concurrent.md). KHÔNG bắt
// buộc: nếu không set, tự động dùng CHUNG pool ghi (getPgPool()) — hành vi giống hệt trước khi
// có tính năng này, không phá gì khi chưa dựng replica.
//
// CHỈ dùng cho truy vấn ĐỌC THUẦN, không cần dữ liệu mới nhất tuyệt đối (replication có độ trễ
// vài chục ms tới vài giây tuỳ tải) — ví dụ tra từ điển, bảng xếp hạng, xem tiến độ học. KHÔNG
// dùng cho bất kỳ luồng nào ngay sau khi vừa ghi cùng request (đọc lại có thể chưa thấy dữ liệu
// mới ghi — "read-after-write" không đảm bảo qua replica).
export function getPgReadPool(): Pool {
  const connectionString = process.env.DATABASE_URL_READ
  if (!connectionString) return getPgPool()

  if (cachedRead) return cachedRead
  cachedRead = makePool(connectionString, 'PG_POOL_READ_MAX')
  return cachedRead
}
