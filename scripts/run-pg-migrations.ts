// scripts/run-pg-migrations.ts — Tự động chạy các migration SQL còn thiếu trên
// PostgreSQL TỰ HOST (VPS), thay cho scripts/run-migrations.ts (Supabase).
//
// Kết nối bằng `DATABASE_URL` (Postgres tự host trên VPS, KHÔNG cần TLS vì kết nối
// nội bộ localhost — khác SUPABASE_DB_URL trước đây phải bật TLS vì đi qua mạng
// công cộng tới Supabase).
//
// Bảng theo dõi `public._schema_migrations` được TỰ TẠO ở lần chạy đầu tiên. Mỗi
// migration chạy trong 1 TRANSACTION riêng — lỗi giữa chừng thì rollback, KHÔNG đánh
// dấu "đã áp dụng" (lần chạy sau tự thử lại). Dừng ngay (exit code khác 0) nếu 1
// migration lỗi.
//
// Cách chạy: npm run migrate:pg   (hoặc: tsx scripts/run-pg-migrations.ts)

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const SCHEMA_FILE = path.join(PROJECT_ROOT, 'postgres', 'schema.sql')
const MIGRATIONS_DIR = path.join(PROJECT_ROOT, 'postgres', 'migrations')

async function main(): Promise<void> {
  // Ưu tiên MIGRATE_DATABASE_URL nếu có — dùng khi DATABASE_URL (app) trỏ qua PgBouncer
  // (transaction pooling, xem postgres/pgbouncer.ini.example): DDL/migration nên nối THẲNG
  // Postgres (cổng 5432), không qua pooler, vì vài kiểu DDL (vd CREATE INDEX CONCURRENTLY)
  // không chạy được trong 1 transaction/qua transaction pooling. Không set thì dùng DATABASE_URL
  // như cũ (đúng hành vi hiện tại khi chưa tách PgBouncer).
  const connectionString = process.env.MIGRATE_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    console.error(
      '[migrate:pg] Thiếu DATABASE_URL trong .env — vd ' +
        'postgresql://tutor_app:MAT_KHAU@localhost:5432/english_tutor — xem ' +
        'docs/migration-thoat-ly-supabase.md Giai đoạn A.',
    )
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    // Lần chạy đầu tiên trên DB rỗng: áp toàn bộ schema.sql (idempotent, dùng
    // IF NOT EXISTS/OR REPLACE nên chạy lại nhiều lần vẫn an toàn).
    console.log('[migrate:pg] Áp postgres/schema.sql (idempotent) ...')
    await client.query(fs.readFileSync(SCHEMA_FILE, 'utf8'))
    console.log('[migrate:pg] ✅ schema.sql xong.')

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('[migrate:pg] Chưa có thư mục postgres/migrations/ — bỏ qua bước migration lẻ.')
      return
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('[migrate:pg] Không có file migration lẻ nào trong postgres/migrations/.')
      return
    }

    const { rows } = await client.query<{ filename: string }>(
      'select filename from public._schema_migrations',
    )
    const applied = new Set(rows.map((r) => r.filename))
    const pending = files.filter((f) => !applied.has(f))

    if (pending.length === 0) {
      console.log(`[migrate:pg] Đã áp dụng đủ ${files.length} migration lẻ — không có gì mới.`)
      return
    }

    console.log(`[migrate:pg] ${pending.length} migration lẻ cần chạy: ${pending.join(', ')}`)

    for (const filename of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8')
      process.stdout.write(`[migrate:pg] → ${filename} ... `)

      try {
        await client.query('begin')
        await client.query(sql)
        await client.query('insert into public._schema_migrations (filename) values ($1)', [
          filename,
        ])
        await client.query('commit')
        console.log('xong')
      } catch (err) {
        await client.query('rollback').catch(() => undefined)
        console.log('LỖI')
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[migrate:pg] ${filename} thất bại (đã rollback): ${message}`)
        process.exit(1)
      }
    }

    console.log(`[migrate:pg] ✅ Hoàn tất — đã áp dụng ${pending.length} migration lẻ mới.`)
  } finally {
    await client.end()
  }
}

main().catch((err: unknown) => {
  console.error('[migrate:pg] Lỗi không mong đợi:', err)
  process.exit(1)
})
