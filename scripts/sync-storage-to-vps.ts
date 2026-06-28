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
//   --force  (FORCE=1)         Tải lại + ghi đè cả file local đã có.
//   --dry-run (DRY_RUN=1)      Chỉ ĐẾM (không tải, không ghi DB).
//   --rewrite-urls            Sau khi đã có file local, ĐỔI audio_url trong DB sang
//     (REWRITE_URLS=1)         đường dẫn local /uploads/... — CHỈ đổi dòng có file ở VPS.
//                              Mặc định ghi URL TƯƠNG ĐỐI; đặt REWRITE_BASE_URL để ghi tuyệt đối.
//   BUCKET=tts-cache           Chỉ xử lý 1 bucket (tts-cache | pronunciations).
//   LIMIT=100                  Giới hạn số dòng mỗi bucket (debug).
//   UPLOADS_DIR=...            Thư mục đích (mặc định: <cwd>/uploads — khớp fileStorage.ts).
//
// Quy trình 2 bước TRÊN VPS:
//   1) Tải file:  npm run sync:storage            (xem trước: -- --dry-run)
//   2) Đổi URL:   npm run sync:storage -- --rewrite-urls   (xem trước: thêm --dry-run)

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
const BATCH_SIZE   = 24   // số file tải song song mỗi đợt
const UPDATE_BATCH = 40   // số dòng cập nhật DB song song (chế độ --rewrite-urls)
const FORCE        = process.argv.includes('--force')        || process.env.FORCE        === '1'
const DRY_RUN      = process.argv.includes('--dry-run')      || process.env.DRY_RUN      === '1'
const REWRITE_URLS = process.argv.includes('--rewrite-urls') || process.env.REWRITE_URLS === '1'
const ONLY_BUCKET  = process.env.BUCKET || ''
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

type Bucket = 'tts-cache' | 'pronunciations'

// Chọn bucket cần xử lý (mặc định cả hai; lọc theo biến BUCKET nếu có).
function resolveBuckets(): Bucket[] {
  const list = (ONLY_BUCKET ? [ONLY_BUCKET] : ['tts-cache', 'pronunciations'])
    .filter((b): b is Bucket => b === 'tts-cache' || b === 'pronunciations')
  if (list.length === 0) {
    console.error(`❌ BUCKET không hợp lệ: ${ONLY_BUCKET} (chỉ nhận tts-cache | pronunciations)`)
    process.exit(1)
  }
  return list
}

// Đường dẫn URL của file (để ghép audio_url). Khác localPath ở chỗ word được encode
// cho hợp lệ URL — Nginx sẽ decode lại đúng tên file thô trên đĩa.
function urlKeyFor(bucket: Bucket, parts: { lang?: string; voice: string; hash?: string; word?: string }): string {
  return bucket === 'tts-cache'
    ? `${parts.lang}/${parts.voice}/${parts.hash}.mp3`
    : `${encodeURIComponent(parts.word!)}-${parts.voice}.mp3`
}

// ── Lấy danh sách key (đường dẫn trong bucket) cần đồng bộ cho 1 bucket ──────
async function loadKeys(bucket: Bucket): Promise<string[]> {
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
async function syncOne(bucket: Bucket, key: string, counters: Counters, samples: string[]): Promise<void> {
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
async function syncBucket(bucket: Bucket): Promise<Counters> {
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

// ── Chế độ --rewrite-urls: đổi audio_url sang đường dẫn local /uploads/... ───
// CHỈ đổi dòng mà file ĐÃ CÓ ở VPS (tránh trỏ tới file 404). Bỏ qua dòng đã trỏ
// local sẵn. Không tải file (giả định đã chạy bước tải trước đó).
interface RewriteCounters { changed: number; alreadyLocal: number; noFile: number; errors: number }

// 1 dòng cần xét: URL hiện tại + key URL + đường file đĩa + hàm cập nhật DB.
interface RewriteRow {
  audioUrl: string | null
  urlKey: string
  localPath: string
  update: (target: string) => PromiseLike<{ error: { message: string } | null }>
}

async function loadRewriteRows(bucket: Bucket): Promise<RewriteRow[]> {
  const supabase = getSupabaseAdmin()
  if (bucket === 'tts-cache') {
    const rows = await fetchAllRows<{ hash: string; lang: string; voice: string; audio_url: string | null }>(
      'tts_cache', 'hash, lang, voice, audio_url', ['hash'])
    return rows.slice(0, LIMIT).map((r) => {
      const urlKey = urlKeyFor(bucket, { lang: r.lang, voice: r.voice, hash: r.hash })
      return {
        audioUrl: r.audio_url,
        urlKey,
        localPath: path.join(UPLOADS_ROOT, bucket, `${r.lang}/${r.voice}/${r.hash}.mp3`),
        update: (target) => supabase.from('tts_cache').update({ audio_url: target }).eq('hash', r.hash),
      }
    })
  }
  const rows = await fetchAllRows<{ word: string; voice: string; audio_url: string | null }>(
    'pronunciations', 'word, voice, audio_url', ['word', 'voice'])
  return rows.slice(0, LIMIT).map((r) => {
    const urlKey = urlKeyFor(bucket, { word: r.word, voice: r.voice })
    return {
      audioUrl: r.audio_url,
      urlKey,
      // file trên đĩa lưu theo tên THÔ (khớp key seed lên Supabase), không encode
      localPath: path.join(UPLOADS_ROOT, bucket, `${r.word}-${r.voice}.mp3`),
      update: (target) => supabase.from('pronunciations').update({ audio_url: target }).eq('word', r.word).eq('voice', r.voice),
    }
  })
}

async function rewriteBucket(bucket: Bucket, base: string): Promise<RewriteCounters> {
  process.stdout.write(`\n✏️  Bucket "${bucket}" — đang đọc DB...`)
  const rows = await loadRewriteRows(bucket)
  console.log(` ${rows.length.toLocaleString('vi-VN')} dòng`)

  const counters: RewriteCounters = { changed: 0, alreadyLocal: 0, noFile: 0, errors: 0 }
  const samples: string[] = []

  const bar = new cliProgress.SingleBar({
    format: `  |{bar}| {percentage}% | {value}/{total} | ${DRY_RUN ? 'sẽ đổi' : '✏️'}{changed} ⏭{alreadyLocal} ∅{noFile} ✗{errors}`,
    barCompleteChar: '█', barIncompleteChar: '░', hideCursor: true,
  }, cliProgress.Presets.shades_classic)
  bar.start(rows.length, 0, { ...counters })

  for (let i = 0; i < rows.length; i += UPDATE_BATCH) {
    await Promise.all(rows.slice(i, i + UPDATE_BATCH).map(async (row) => {
      const marker = `/uploads/${bucket}/${row.urlKey}`
      // Đã trỏ local (tương đối hoặc tuyệt đối đều chứa marker) → không đụng.
      if (row.audioUrl && row.audioUrl.includes(marker)) { counters.alreadyLocal++; return }
      // Chưa có file ở VPS → KHÔNG đổi (đổi sẽ thành link hỏng).
      if (!fs.existsSync(row.localPath)) { counters.noFile++; return }
      if (DRY_RUN) { counters.changed++; if (samples.length < 5) samples.push(marker); return }
      const target = base ? `${base}${marker}` : marker
      const { error } = await row.update(target)
      if (error) { counters.errors++; if (samples.length < 5) samples.push(`${marker} → ${error.message}`) }
      else counters.changed++
    }))
    bar.update(Math.min(i + UPDATE_BATCH, rows.length), { ...counters })
  }
  bar.update(rows.length, { ...counters })
  bar.stop()

  console.log(`  ✏️ ${DRY_RUN ? 'sẽ đổi' : 'Đã đổi'}: ${counters.changed}  ⏭ đã local: ${counters.alreadyLocal}  ∅ chưa có file VPS: ${counters.noFile}  ✗ lỗi: ${counters.errors}`)
  if (samples.length > 0) {
    console.log('     Ví dụ:')
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

  console.log(`📁 Thư mục đích: ${UPLOADS_ROOT}`)
  if (process.env.STORAGE_DRIVER !== 'local') {
    console.log('⚠️  STORAGE_DRIVER hiện KHÔNG phải "local" — app chỉ phục vụ /uploads khi chạy chế độ local.')
  }

  const buckets = resolveBuckets()

  // ── Chế độ đổi audio_url sang local ───────────────────────────────────────
  if (REWRITE_URLS) {
    const base = (process.env.REWRITE_BASE_URL || process.env.BASE_URL || '').trim().replace(/\/$/, '')
    console.log(`✏️  Đổi audio_url → local${base ? ` (base: ${base})` : ' (đường dẫn tương đối /uploads/...)'}` + (DRY_RUN ? ' — DRY-RUN' : ''))
    const totals: RewriteCounters = { changed: 0, alreadyLocal: 0, noFile: 0, errors: 0 }
    for (const bucket of buckets) {
      const c = await rewriteBucket(bucket, base)
      totals.changed += c.changed; totals.alreadyLocal += c.alreadyLocal
      totals.noFile += c.noFile; totals.errors += c.errors
    }
    console.log('\n──────────────────────────────────────────────')
    console.log(`📦 TỔNG: ✏️ ${DRY_RUN ? 'sẽ đổi' : 'đã đổi'} ${totals.changed}  ⏭ đã local ${totals.alreadyLocal}  ∅ chưa có file VPS ${totals.noFile}  ✗ lỗi ${totals.errors}`)
    if (DRY_RUN) console.log('ℹ️  DRY-RUN — chưa ghi DB. Bỏ --dry-run để đổi thật.')
    else if (totals.noFile > 0) console.log(`ℹ️  ${totals.noFile} dòng chưa có file ở VPS → chạy \`npm run sync:storage\` (tải file) trước rồi đổi URL lại.`)
    else if (totals.errors === 0) console.log('✅ audio_url đã trỏ local cho mọi dòng có file ở VPS.')
    return
  }

  // ── Chế độ tải file (mặc định) ────────────────────────────────────────────
  console.log('🔄 Tải audio Supabase Storage → VPS local' + (DRY_RUN ? ' (DRY-RUN: chỉ đếm)' : '') + (FORCE ? ' (FORCE: ghi đè)' : ''))
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
    console.log('✅ Mọi file kỳ vọng đã có ở local trên VPS. Bước tiếp: npm run sync:storage -- --rewrite-urls')
  }
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
