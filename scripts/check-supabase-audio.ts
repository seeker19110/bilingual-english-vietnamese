// scripts/check-supabase-audio.ts
// Kiểm tra audio THỰC TẾ trên Supabase Storage so với VPS local: liệt kê object
// trong từng bucket (đệ quy theo thư mục), đối chiếu file local, báo cáo VPS còn
// thiếu file nào — và CHO PHÉP seed (tải) các file thiếu đó từ Supabase về VPS.
//
// Khác `sync:storage` (đi từ DÒNG DB): script này đi từ OBJECT THẬT trên Storage,
// nên bắt được cả file có trên Supabase mà DB KHÔNG có (orphan storage). Đúng nghĩa
// "kiểm tra dữ liệu trên supabase xem vps còn thiếu gì".
//
// Hai bucket:
//   • tts-cache       object = `${lang}/${voice}/${hash}.mp3`  (audio đã mã hóa)
//   • pronunciations  object = `${word}-${voice}.mp3`          (mp3 thường)
//
// Cờ / biến môi trường:
//   (mặc định)        Chỉ KIỂM TRA + báo cáo (không tải gì).
//   --seed (SEED=1)   Tải các object Storage còn thiếu ở VPS về local.
//   --force (FORCE=1) (kèm --seed) Tải lại + ghi đè cả file local đã có.
//   BUCKET=tts-cache  Chỉ xử lý 1 bucket (tts-cache | pronunciations).
//   LIMIT=100         Giới hạn số object xét mỗi bucket (debug).
//   SAMPLES=8         Số ví dụ "thiếu" in ra (mặc định 8).
//   UPLOADS_DIR=...   Thư mục local (mặc định <cwd>/uploads — khớp fileStorage.ts).
//
// Chạy TRÊN VPS:
//   npm run check:supabase            # xem báo cáo (Storage ↔ VPS ↔ DB)
//   npm run check:supabase -- --seed  # tải các file Storage còn thiếu về VPS

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
const SEED = process.argv.includes('--seed') || process.env.SEED === '1'
const FORCE = process.argv.includes('--force') || process.env.FORCE === '1'
const ONLY_BUCKET = process.env.BUCKET || ''
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
const SAMPLES = process.env.SAMPLES ? parseInt(process.env.SAMPLES, 10) : 8
const DOWNLOAD_BATCH = 24 // số file tải song song mỗi đợt (chế độ --seed)

const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads')

type Bucket = 'tts-cache' | 'pronunciations'

function resolveBuckets(): Bucket[] {
  const list = (ONLY_BUCKET ? [ONLY_BUCKET] : ['tts-cache', 'pronunciations']).filter(
    (b): b is Bucket => b === 'tts-cache' || b === 'pronunciations',
  )
  if (list.length === 0) {
    console.error(`❌ BUCKET không hợp lệ: ${ONLY_BUCKET} (chỉ nhận tts-cache | pronunciations)`)
    process.exit(1)
  }
  return list
}

// ── Đọc TẤT CẢ dòng 1 bảng (phân trang ỔN ĐỊNH theo khóa) — cho đối chiếu DB ──
async function fetchAllRows<T>(table: string, columns: string, orderCols: string[]): Promise<T[]> {
  const supabase = getSupabaseAdmin()
  const PAGE = 1000
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    let query = supabase.from(table).select(columns).order(orderCols[0], { ascending: true })
    for (let i = 1; i < orderCols.length; i++)
      query = query.order(orderCols[i], { ascending: true })
    const { data, error } = await query.range(from, from + PAGE - 1)
    if (error) throw new Error(`Đọc bảng ${table} lỗi: ${error.message}`)
    if (!data || data.length === 0) break
    out.push(...(data as T[]))
    if (data.length < PAGE) break
  }
  return out
}

// Tập object KỲ VỌNG theo DB (để biết object Storage nào KHÔNG có dòng DB = orphan).
async function dbObjectPaths(bucket: Bucket): Promise<Set<string>> {
  if (bucket === 'tts-cache') {
    const rows = await fetchAllRows<{ hash: string; lang: string; voice: string }>(
      'tts_cache',
      'hash, lang, voice',
      ['hash'],
    )
    return new Set(rows.map((r) => `${r.lang}/${r.voice}/${r.hash}.mp3`))
  }
  const rows = await fetchAllRows<{ word: string; voice: string }>(
    'pronunciations',
    'word, voice',
    ['word', 'voice'],
  )
  return new Set(rows.map((r) => `${r.word}-${r.voice}.mp3`))
}

// ── Liệt kê ĐỆ QUY mọi object trong 1 bucket (Storage list theo từng thư mục) ─
// Supabase .list() chỉ trả 1 cấp thư mục/lần → phải tự đệ quy + phân trang.
// Mục thư mục có id === null; mục file có id (uuid). Bỏ qua .emptyFolderPlaceholder.
async function collectFiles(bucket: Bucket, prefix: string, out: string[]): Promise<void> {
  const supabase = getSupabaseAdmin()
  const PAGE = 1000
  const subFolders: string[] = []
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix || undefined, {
      limit: PAGE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) throw new Error(`Liệt kê "${bucket}/${prefix}" lỗi: ${error.message}`)
    if (!data || data.length === 0) break
    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue
      const full = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null)
        subFolders.push(full) // thư mục con → đệ quy sau
      else out.push(full) // file
    }
    if (data.length < PAGE) break
  }
  for (const sub of subFolders) await collectFiles(bucket, sub, out)
}

interface Report {
  total: number
  presentVps: number
  missingVps: string[]
  inDb: number
  orphanStorage: number
}

// ── Kiểm tra 1 bucket: Storage ↔ VPS ↔ DB ───────────────────────────────────
async function checkBucket(bucket: Bucket): Promise<Report> {
  process.stdout.write(`\n🔎 Bucket "${bucket}" — đang liệt kê Storage...`)
  const objects: string[] = []
  await collectFiles(bucket, '', objects)
  const all = Number.isFinite(LIMIT) ? objects.slice(0, LIMIT) : objects
  process.stdout.write(` ${all.length.toLocaleString('vi-VN')} object`)

  const dbSet = await dbObjectPaths(bucket)
  console.log(` · DB ${dbSet.size.toLocaleString('vi-VN')} dòng`)

  const report: Report = {
    total: all.length,
    presentVps: 0,
    missingVps: [],
    inDb: 0,
    orphanStorage: 0,
  }
  for (const obj of all) {
    if (dbSet.has(obj)) report.inDb++
    else report.orphanStorage++
    if (fs.existsSync(path.join(UPLOADS_ROOT, bucket, obj))) report.presentVps++
    else report.missingVps.push(obj)
  }

  // Báo cáo
  console.log(`  • Trên Supabase Storage : ${report.total.toLocaleString('vi-VN')}`)
  console.log(`  • Đã có ở VPS local     : ${report.presentVps.toLocaleString('vi-VN')}`)
  console.log(`  • THIẾU ở VPS local     : ${report.missingVps.length.toLocaleString('vi-VN')}`)
  if (report.missingVps.length > 0 && bucket === 'tts-cache') {
    // gom thiếu theo thư mục lang/voice cho dễ nhìn
    const byFolder = new Map<string, number>()
    for (const m of report.missingVps) {
      const folder = m.split('/').slice(0, 2).join('/')
      byFolder.set(folder, (byFolder.get(folder) ?? 0) + 1)
    }
    for (const [k, n] of [...byFolder.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`       - ${k}: ${n.toLocaleString('vi-VN')}`)
    }
  }
  if (report.missingVps.length > 0) {
    console.log(`     ví dụ: ${report.missingVps.slice(0, SAMPLES).join(', ')}`)
  }
  console.log(
    `  • Đối chiếu DB          : có dòng ${report.inDb.toLocaleString('vi-VN')}  ·  KHÔNG có dòng (orphan storage) ${report.orphanStorage.toLocaleString('vi-VN')}`,
  )

  return report
}

// ── Seed: tải các object Storage còn thiếu ở VPS về local ────────────────────
async function seedMissing(
  bucket: Bucket,
  missing: string[],
): Promise<{ copied: number; errors: number }> {
  const targets = FORCE
    ? missing
    : missing.filter((obj) => !fs.existsSync(path.join(UPLOADS_ROOT, bucket, obj)))
  if (targets.length === 0) return { copied: 0, errors: 0 }

  console.log(
    `\n📥 Seed bucket "${bucket}" — tải ${targets.length.toLocaleString('vi-VN')} file từ Supabase`,
  )
  const supabase = getSupabaseAdmin()
  let copied = 0,
    errors = 0
  const samples: string[] = []

  const bar = new cliProgress.SingleBar(
    {
      format: `  |{bar}| {percentage}% | {value}/{total} | ↓{copied} ✗{errors}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(targets.length, 0, { copied, errors })

  for (let i = 0; i < targets.length; i += DOWNLOAD_BATCH) {
    await Promise.all(
      targets.slice(i, i + DOWNLOAD_BATCH).map(async (obj) => {
        const localPath = path.join(UPLOADS_ROOT, bucket, obj)
        try {
          const { data, error } = await supabase.storage.from(bucket).download(obj)
          if (error || !data) throw new Error(error?.message || 'không tải được')
          await fs.promises.mkdir(path.dirname(localPath), { recursive: true })
          await fs.promises.writeFile(localPath, Buffer.from(await data.arrayBuffer()))
          copied++
        } catch (err) {
          errors++
          if (samples.length < 5)
            samples.push(`${obj} → ${err instanceof Error ? err.message : String(err)}`)
        }
      }),
    )
    bar.update(Math.min(i + DOWNLOAD_BATCH, targets.length), { copied, errors })
  }
  bar.stop()
  console.log(`  ↓ Tải về: ${copied}  ✗ Lỗi: ${errors}`)
  if (samples.length > 0) for (const s of samples) console.log(`     • ${s}`)
  return { copied, errors }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const missingEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].filter((k) => !process.env[k])
  if (missingEnv.length > 0) {
    console.error(`❌ Thiếu biến môi trường: ${missingEnv.join(', ')}`)
    process.exit(1)
  }

  console.log(
    '🔍 Kiểm tra audio Supabase Storage ↔ VPS local' +
      (SEED ? ' (sẽ SEED file thiếu)' : ' (chỉ báo cáo)'),
  )
  console.log(`📁 Thư mục local: ${UPLOADS_ROOT}`)

  const buckets = resolveBuckets()
  let grandMissing = 0,
    grandCopied = 0,
    grandErrors = 0
  for (const bucket of buckets) {
    const report = await checkBucket(bucket)
    grandMissing += report.missingVps.length
    if (SEED && report.missingVps.length > 0) {
      const r = await seedMissing(bucket, report.missingVps)
      grandCopied += r.copied
      grandErrors += r.errors
    }
  }

  console.log('\n──────────────────────────────────────────────')
  if (SEED) {
    console.log(
      `📦 TỔNG: thiếu ${grandMissing.toLocaleString('vi-VN')} → tải về ${grandCopied.toLocaleString('vi-VN')}  ✗ lỗi ${grandErrors}`,
    )
    if (grandErrors === 0 && grandCopied === grandMissing)
      console.log('✅ Đã kéo hết file Storage còn thiếu về VPS.')
  } else {
    console.log(
      `📦 TỔNG: VPS còn thiếu ${grandMissing.toLocaleString('vi-VN')} file so với Supabase Storage.`,
    )
    if (grandMissing > 0)
      console.log('ℹ️  Chạy `npm run check:supabase -- --seed` để tải các file thiếu về VPS.')
    else console.log('✅ VPS đã có đủ mọi file đang nằm trên Supabase Storage.')
  }
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
