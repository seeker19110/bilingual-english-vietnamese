// scripts/sync-storage-to-vps.ts
// Đồng bộ TẢI XUỐNG: kéo audio đang nằm trên Supabase Storage về thư mục local
// của VPS (UPLOADS_DIR) — CHỈ tải file nào CHƯA có ở local.
//
// Vì sao cần:
//   VPS chạy STORAGE_DRIVER=local (audio do Nginx phục vụ ở /uploads/). Nhưng nhiều
//   file đã được seed lên Supabase Storage trước đó (đặc biệt bảng pronunciations seed
//   luôn đẩy thẳng lên Supabase). Script này tạo BẢN SAO LOCAL đầy đủ để VPS có sẵn
//   mọi file, không phụ thuộc Supabase Storage nữa.
//
// Cách hoạt động (an toàn, chạy lại nhiều lần được):
//   - Đọc DB tìm danh sách file kỳ vọng theo từng bucket:
//       • tts-cache      key = `${lang}/${voice}/${hash}.mp3`     (đã mã hóa AES-GCM)
//       • pronunciations key = `${word}-${voice}.mp3`            (mp3 thường)
//   - Với mỗi key: nếu file local ĐÃ CÓ → bỏ qua. Nếu CHƯA → tải từ Supabase
//     (storage.download, dùng service-role nên đọc được cả bucket private) → ghi ra
//     `${UPLOADS_DIR}/${bucket}/${key}` (mirror đúng đường dẫn).
//   - Bản nào KHÔNG có cả ở local lẫn Supabase → đếm là "thiếu hẳn" (cần seed lại).
//
// KHÔNG đụng DB, KHÔNG ghi đè file local đã có (trừ khi --force).
//
// Cờ / biến môi trường:
//   --force  (FORCE=1)     Tải lại + ghi đè cả file local đã có.
//   --dry-run (DRY_RUN=1)  Chỉ ĐẾM còn thiếu bao nhiêu ở local (không tải, không ghi).
//   BUCKET=tts-cache       Chỉ đồng bộ 1 bucket (tts-cache | pronunciations).
//   LIMIT=100              Giới hạn số file mỗi bucket (debug).
//   UPLOADS_DIR=...        Thư mục đích (mặc định: <cwd>/uploads — khớp fileStorage.ts).
//
// Chạy TRÊN VPS: npm run sync:storage
//   Xem trước:  npm run sync:storage -- --dry-run

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
const BATCH_SIZE = 24   // số file tải song song mỗi đợt
const FORCE      = process.argv.includes('--force')   || process.env.FORCE   === '1'
const DRY_RUN    = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1'
const ONLY_BUCKET = process.env.BUCKET || ''
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity

// Thư mục gốc chứa file — phải khớp api/_lib/fileStorage.ts (getUploadsRoot).
const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads')

// ── Đọc TẤT CẢ dòng 1 bảng (phân trang ỔN ĐỊNH theo khóa) ───────────────────
// Giống fetchAllRows trong seed-all.ts: LUÔN ORDER BY khóa duy nhất, nếu không
// các trang .range() sẽ chồng/lọt dòng → danh sách key đếm sai mỗi lần chạy.
async function fetchAllRows<T>(table: string, columns: string, orderCols: string[]): Promise<T[]> {
  const supabase = getSupabaseAdmin()
  const PAGE = 1000
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    let query = supabase.from(table).select(columns).order(orderCols[0], { ascending: true })
    for (let i = 1; i < orderCols.length; i++) query = query.order(orderCols[i], { ascending: true })
    const { data, error } = await query.range(from, from + PAGE - 1)
    if (error) throw new Error(`Đọc bảng ${table} lỗi: ${error.message}`)
    if (!data || data.length === 0) break
    out.push(...(data as T[]))
    if (data.length < PAGE) break
  }
  return out
}

// ── Lấy danh sách key (đường dẫn trong bucket) cần đồng bộ cho 1 bucket ──────
async function loadKeys(bucket: string): Promise<string[]> {
  if (bucket === 'tts-cache') {
    const rows = await fetchAllRows<{ hash: string; lang: string; voice: string }>(
      'tts_cache', 'hash, lang, voice', ['hash'])
    return rows.map((r) => `${r.lang}/${r.voice}/${r.hash}.mp3`).slice(0, LIMIT)
  }
  // pronunciations: seed đẩy lên Supabase với tên file = `${word}-${voice}.mp3` (word thô)
  const rows = await fetchAllRows<{ word: string; voice: string }>(
    'pronunciations', 'word, voice', ['word', 'voice'])
  return rows.map((r) => `${r.word}-${r.voice}.mp3`).slice(0, LIMIT)
}

interface Counters { skip: number; copied: number; missingRemote: number; errors: number }

// ── Xử lý 1 key: bỏ qua nếu local đã có; nếu chưa thì tải từ Supabase về ─────
async function syncOne(bucket: string, key: string, counters: Counters, samples: string[]): Promise<void> {
  const localPath = path.join(UPLOADS_ROOT, bucket, key)

  if (!FORCE && fs.existsSync(localPath)) { counters.skip++; return }
  if (DRY_RUN) { counters.copied++; return }   // dry-run: chỉ đếm "sẽ tải", không gọi mạng

  const supabase = getSupabaseAdmin()
  try {
    const { data, error } = await supabase.storage.from(bucket).download(key)
    if (error || !data) {
      counters.missingRemote++
      if (samples.length < 5) samples.push(key)
      return
    }
    const buf = Buffer.from(await data.arrayBuffer())
    await fs.promises.mkdir(path.dirname(localPath), { recursive: true })
    await fs.promises.writeFile(localPath, buf)
    counters.copied++
  } catch (err) {
    counters.errors++
    if (samples.length < 5) samples.push(`${key} → ${err instanceof Error ? err.message : String(err)}`)
  }
}

// ── Đồng bộ 1 bucket (có thanh tiến độ) ──────────────────────────────────────
async function syncBucket(bucket: string): Promise<Counters> {
  process.stdout.write(`\n📥 Bucket "${bucket}" — đang đọc DB...`)
  const keys = await loadKeys(bucket)
  console.log(` ${keys.length.toLocaleString('vi-VN')} file kỳ vọng`)

  const counters: Counters = { skip: 0, copied: 0, missingRemote: 0, errors: 0 }
  const samples: string[] = []

  const bar = new cliProgress.SingleBar({
    format: `  |{bar}| {percentage}% | {value}/{total} | ⏭{skip} ${DRY_RUN ? 'sẽ tải' : '↓'}{copied} ∅{missingRemote} ✗{errors}`,
    barCompleteChar: '█', barIncompleteChar: '░', hideCursor: true,
  }, cliProgress.Presets.shades_classic)
  bar.start(keys.length, 0, { ...counters })

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    await Promise.all(keys.slice(i, i + BATCH_SIZE).map((k) => syncOne(bucket, k, counters, samples)))
    bar.update(Math.min(i + BATCH_SIZE, keys.length), { ...counters })
  }
  bar.update(keys.length, { ...counters })
  bar.stop()

  console.log(`  ⏭ Đã có local: ${counters.skip}  ${DRY_RUN ? 'sẽ tải' : '↓ Tải về'}: ${counters.copied}  ∅ Không có trên Supabase: ${counters.missingRemote}  ✗ Lỗi: ${counters.errors}`)
  if (samples.length > 0) {
    console.log('     Ví dụ (thiếu/ lỗi):')
    for (const s of samples) console.log(`       • ${s}`)
  }
  return counters
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường: ${missing.join(', ')}`)
    process.exit(1)
  }

  console.log('🔄 Đồng bộ audio Supabase Storage → VPS local' + (DRY_RUN ? ' (DRY-RUN: chỉ đếm)' : '') + (FORCE ? ' (FORCE: ghi đè)' : ''))
  console.log(`📁 Thư mục đích: ${UPLOADS_ROOT}`)
  if (process.env.STORAGE_DRIVER !== 'local') {
    console.log('⚠️  STORAGE_DRIVER hiện KHÔNG phải "local" — vẫn tải về được, nhưng app chỉ phục vụ /uploads khi chạy chế độ local.')
  }

  const buckets = (ONLY_BUCKET ? [ONLY_BUCKET] : ['tts-cache', 'pronunciations'])
    .filter((b) => b === 'tts-cache' || b === 'pronunciations')
  if (buckets.length === 0) {
    console.error(`❌ BUCKET không hợp lệ: ${ONLY_BUCKET} (chỉ nhận tts-cache | pronunciations)`)
    process.exit(1)
  }

  const totals: Counters = { skip: 0, copied: 0, missingRemote: 0, errors: 0 }
  for (const bucket of buckets) {
    const c = await syncBucket(bucket)
    totals.skip += c.skip; totals.copied += c.copied
    totals.missingRemote += c.missingRemote; totals.errors += c.errors
  }

  console.log('\n──────────────────────────────────────────────')
  console.log(`📦 TỔNG: ⏭ đã có ${totals.skip}  ${DRY_RUN ? 'sẽ tải' : '↓ tải về'} ${totals.copied}  ∅ thiếu trên Supabase ${totals.missingRemote}  ✗ lỗi ${totals.errors}`)
  if (DRY_RUN) {
    console.log('ℹ️  Đây là DRY-RUN — chưa tải gì. Bỏ --dry-run để tải thật.')
  } else if (totals.missingRemote > 0) {
    console.log(`ℹ️  ${totals.missingRemote} file không có ở cả local lẫn Supabase → cần tạo lại bằng \`npm run seed:all -- --all\`.`)
  } else if (totals.errors === 0) {
    console.log('✅ Mọi file kỳ vọng đã có ở local trên VPS.')
  }
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
