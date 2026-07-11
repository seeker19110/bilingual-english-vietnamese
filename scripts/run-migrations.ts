// scripts/run-migrations.ts — Tự động chạy các migration SQL còn thiếu trên Supabase
// production. Gọi từ deploy.sh mỗi lần deploy (thay cho việc dán tay từng file vào
// Supabase Dashboard → SQL Editor).
//
// Kết nối THẲNG tới Postgres bằng connection string (`SUPABASE_DB_URL`, lấy ở Supabase
// Dashboard → Project Settings → Database → Connection string → mục "Direct connection")
// — KHÔNG qua PostgREST/RPC, không tạo thêm hàm/quyền đặc biệt nào trên DB.
//
// Bảng theo dõi `public._schema_migrations` được TỰ TẠO ở lần chạy đầu tiên
// (`create table if not exists`) — KHÔNG cần bước bootstrap thủ công nào. Migration
// nào chưa có trong bảng này sẽ được áp dụng; 0001–0009 (đã chạy tay trên production
// từ trước) đều viết idempotent nên chạy lại ở lần đầu tiên vẫn AN TOÀN, chỉ tốn thêm
// vài trăm ms — sau lần đầu, các lần sau chỉ còn migration thật sự mới.
//
// Cách chạy: npm run migrate   (hoặc: tsx scripts/run-migrations.ts)
//
// Mỗi migration chạy trong 1 TRANSACTION riêng (BEGIN … COMMIT, ROLLBACK nếu lỗi) —
// migration lỗi giữa chừng sẽ KHÔNG để lại thay đổi dở dang, và KHÔNG bị đánh dấu
// "đã áp dụng" (lần chạy sau sẽ tự thử lại). Dừng deploy ngay (exit code khác 0) nếu 1
// migration lỗi — deploy.sh (set -e) sẽ dừng theo, tránh chạy code mới trên schema cũ.

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const MIGRATIONS_DIR = path.join(PROJECT_ROOT, 'supabase', 'migrations')

async function main(): Promise<void> {
  const connectionString = process.env.SUPABASE_DB_URL
  if (!connectionString) {
    console.error(
      '[migrate] Thiếu SUPABASE_DB_URL trong .env — lấy ở Supabase Dashboard → Project ' +
        'Settings → Database → Connection string → "Direct connection". Xem hướng dẫn: ' +
        'docs/deploy-vps-ubuntu.md.',
    )
    process.exit(1)
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort() // tên file NNNN_*.sql → sort chuỗi = đúng thứ tự số

  if (files.length === 0) {
    console.log('[migrate] Không có file migration nào trong supabase/migrations/.')
    return
  }

  // TLS BẬT + XÁC THỰC CHỨNG CHỈ ĐẦY ĐỦ theo mặc định (an toàn trước tấn công
  // man-in-the-middle) — Supabase dùng chứng chỉ ký bởi CA công khai (Let's Encrypt)
  // nên xác thực bằng kho CA hệ thống của Node hoạt động bình thường, không cần cấu
  // hình thêm. CHỈ tắt xác thực (kém an toàn hơn) nếu môi trường deploy thật sự gặp lỗi
  // chuỗi chứng chỉ (hiếm) và bạn hiểu rõ đánh đổi — đặt SUPABASE_DB_SSL_INSECURE=true.
  const insecureTls = process.env.SUPABASE_DB_SSL_INSECURE === 'true'
  if (insecureTls) {
    console.warn(
      '[migrate] ⚠️ SUPABASE_DB_SSL_INSECURE=true — KHÔNG xác thực chứng chỉ TLS của DB ' +
        '(kết nối vẫn mã hóa nhưng dễ bị man-in-the-middle). Chỉ dùng khi thật sự cần thiết.',
    )
  }
  const client = new Client({
    connectionString,
    ssl: insecureTls ? { rejectUnauthorized: false } : true,
  })
  await client.connect()

  try {
    await client.query(`
      create table if not exists public._schema_migrations (
        filename   text primary key,
        applied_at timestamptz not null default now()
      );
    `)

    const { rows } = await client.query<{ filename: string }>(
      'select filename from public._schema_migrations',
    )
    const applied = new Set(rows.map((r) => r.filename))
    const pending = files.filter((f) => !applied.has(f))

    if (pending.length === 0) {
      console.log(`[migrate] Đã áp dụng đủ ${files.length} migration — không có gì mới.`)
      return
    }

    console.log(`[migrate] ${pending.length} migration cần chạy: ${pending.join(', ')}`)

    for (const filename of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8')
      process.stdout.write(`[migrate] → ${filename} ... `)

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
        console.error(`[migrate] ${filename} thất bại (đã rollback): ${message}`)
        process.exit(1)
      }
    }

    console.log(`[migrate] ✅ Hoàn tất — đã áp dụng ${pending.length} migration mới.`)
  } finally {
    await client.end()
  }
}

main().catch((err: unknown) => {
  console.error('[migrate] Lỗi không mong đợi:', err)
  process.exit(1)
})
