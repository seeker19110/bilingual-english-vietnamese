// scripts/sync-storage-to-r2.ts
// Đồng bộ TẢI LÊN: đẩy audio đang nằm trên ổ đĩa VPS (STORAGE_DRIVER=local,
// thư mục UPLOADS_DIR) lên Cloudflare R2, rồi cập nhật `audio_url` trong Postgres
// tự host để app đọc thẳng từ R2 (STORAGE_DRIVER=r2) — ngược hướng với
// scripts/sync-storage-to-vps.ts cũ (đã xóa, thời còn Supabase Storage).
//
// Vì sao cần: VPS đã tích lũy audio cache khi còn chạy STORAGE_DRIVER=local. Sau khi
// bật Cloudflare R2 (Giai đoạn D, xem docs/migration-thoat-ly-supabase.md), audio MỚI
// tự đi thẳng lên R2, nhưng audio CŨ vẫn nằm trên đĩa VPS + `audio_url` trong DB vẫn
// trỏ `/uploads/...`. Script này đẩy nốt phần audio cũ lên R2 cho đồng bộ.
//
// Cách hoạt động (an toàn, chạy lại nhiều lần được):
//   - Đọc DB (`tts_cache`, `pronunciations`) lấy danh sách (key, audio_url hiện tại).
//   - Bỏ qua dòng đã trỏ R2 rồi (audio_url không còn chứa `/uploads/`).
//   - Đọc file local tương ứng → gọi saveAudio() (tôn trọng STORAGE_DRIVER=r2 lúc
//     chạy script — PHẢI đặt biến này khi chạy, xem "Cách chạy" bên dưới) → upload lên R2.
//   - Cập nhật `audio_url` trong DB trỏ về R2. File local KHÔNG bị xóa (giữ lại làm
//     bản sao dự phòng, tự dọn tay sau khi xác nhận R2 hoạt động ổn nếu muốn).
//
// Cờ / biến môi trường:
//   --dry-run (DRY_RUN=1)      Chỉ ĐẾM (không tải lên R2, không ghi DB).
//   --force   (FORCE=1)        Tải lên + ghi đè cả dòng đã trỏ R2 rồi.
//   BUCKET=tts-cache           Chỉ xử lý 1 bucket (tts-cache | pronunciations).
//   LIMIT=100                  Giới hạn số dòng mỗi bucket (debug).
//   UPLOADS_DIR=...            Thư mục nguồn (mặc định: <cwd>/uploads — khớp fileStorage.ts).
//
// Cách chạy TRÊN VPS (STORAGE_DRIVER=r2 CHỈ áp dụng cho lệnh này, không đổi .env):
//   STORAGE_DRIVER=r2 npm run sync:r2 -- --dry-run   # xem trước
//   STORAGE_DRIVER=r2 npm run sync:r2                # chạy thật
// Sau khi xác nhận ổn, đổi STORAGE_DRIVER=r2 trong .env + pm2 restart để audio MỚI
// cũng tự lên R2 (nếu chưa bật sẵn).

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { getPgPool } from '../api/_lib/pgPool.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
const BATCH_SIZE = 15 // upload song song mỗi đợt — vừa phải, tránh dồn ép R2 API
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1'
const FORCE = process.argv.includes('--force') || process.env.FORCE === '1'
const ONLY_BUCKET = process.env.BUCKET || ''
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity

// Thư mục gốc chứa file local — phải khớp api/_lib/fileStorage.ts (getUploadsRoot).
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

// audio_url local luôn chứa marker `/uploads/${bucket}/` (tuyệt đối hoặc tương đối —
// xem saveLocal() trong fileStorage.ts) — dùng để phân biệt "đã lên R2 chưa".
function isLocalUrl(bucket: Bucket, audioUrl: string | null): boolean {
  return !!audioUrl && audioUrl.includes(`/uploads/${bucket}/`)
}

interface Row {
  key: string // đường dẫn trong bucket, vd `en-US/female/<hash>.mp3` hoặc `<word>-<voice>.mp3`
  audioUrl: string | null
  update: (target: string) => Promise<void>
}

async function loadRows(bucket: Bucket): Promise<Row[]> {
  const pool = getPgPool()
  if (bucket === 'tts-cache') {
    const { rows } = await pool.query<{
      hash: string
      lang: string
      voice: string
      audio_url: string | null
    }>('select hash, lang, voice, audio_url from public.tts_cache order by hash')
    return rows.slice(0, LIMIT).map((r) => ({
      key: `${r.lang}/${r.voice}/${r.hash}.mp3`,
      audioUrl: r.audio_url,
      update: async (target: string) => {
        await pool.query('update public.tts_cache set audio_url = $1 where hash = $2', [
          target,
          r.hash,
        ])
      },
    }))
  }
  const { rows } = await pool.query<{ word: string; voice: string; audio_url: string | null }>(
    'select word, voice, audio_url from public.pronunciations order by word, voice',
  )
  return rows.slice(0, LIMIT).map((r) => ({
    // encodeURIComponent khớp key mà api/pronunciation.ts dùng cho từ có dấu (café...).
    key: `${encodeURIComponent(r.word)}-${r.voice}.mp3`,
    audioUrl: r.audio_url,
    update: async (target: string) => {
      await pool.query(
        'update public.pronunciations set audio_url = $1 where word = $2 and voice = $3',
        [target, r.word, r.voice],
      )
    },
  }))
}

interface Counters {
  skip: number
  uploaded: number
  missingLocal: number
  errors: number
}

async function syncOne(bucket: Bucket, row: Row, counters: Counters, samples: string[]) {
  if (!FORCE && !isLocalUrl(bucket, row.audioUrl)) {
    counters.skip++
    return
  }
  const localPath = path.join(UPLOADS_ROOT, bucket, row.key)
  if (!fs.existsSync(localPath)) {
    counters.missingLocal++
    if (samples.length < 5) samples.push(row.key)
    return
  }
  if (DRY_RUN) {
    counters.uploaded++
    return
  }
  try {
    const buf = await fs.promises.readFile(localPath)
    // Buffer có thể chia sẻ 1 ArrayBuffer lớn hơn (pooled allocation) — cắt đúng đoạn
    // byteOffset..byteOffset+byteLength để không gửi thừa/thiếu byte lên R2.
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const target = await saveAudio(bucket, row.key, arrayBuffer)
    await row.update(target)
    counters.uploaded++
  } catch (err) {
    counters.errors++
    if (samples.length < 5)
      samples.push(`${row.key} → ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function syncBucket(bucket: Bucket): Promise<Counters> {
  process.stdout.write(`\n📤 Bucket "${bucket}" — đang đọc DB...`)
  const rows = await loadRows(bucket)
  console.log(` ${rows.length.toLocaleString('vi-VN')} dòng`)

  const counters: Counters = { skip: 0, uploaded: 0, missingLocal: 0, errors: 0 }
  const samples: string[] = []

  const bar = new cliProgress.SingleBar(
    {
      format: `  |{bar}| {percentage}% | {value}/{total} | ⏭{skip} ${DRY_RUN ? 'sẽ tải' : '↑'}{uploaded} ∅{missingLocal} ✗{errors}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(rows.length, 0, { ...counters })

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await Promise.all(
      rows.slice(i, i + BATCH_SIZE).map((r) => syncOne(bucket, r, counters, samples)),
    )
    bar.update(Math.min(i + BATCH_SIZE, rows.length), { ...counters })
  }
  bar.stop()

  console.log(
    `  ⏭ Đã ở R2: ${counters.skip}  ${DRY_RUN ? 'sẽ tải' : '↑ Đã tải lên'}: ${counters.uploaded}  ∅ Thiếu file local: ${counters.missingLocal}  ✗ Lỗi: ${counters.errors}`,
  )
  if (samples.length > 0) {
    console.log('     Ví dụ (thiếu/lỗi):')
    for (const s of samples) console.log(`       • ${s}`)
  }
  return counters
}

async function main(): Promise<void> {
  const missing = [
    'DATABASE_URL',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'R2_PUBLIC_BASE_URL',
  ].filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường: ${missing.join(', ')}`)
    process.exit(1)
  }
  if (process.env.STORAGE_DRIVER !== 'r2') {
    console.error(
      '❌ Cần STORAGE_DRIVER=r2 khi chạy lệnh này (saveAudio() mới upload lên R2) — vd:\n' +
        '   STORAGE_DRIVER=r2 npm run sync:r2 -- --dry-run',
    )
    process.exit(1)
  }

  console.log(
    '🔄 Đẩy audio local VPS → Cloudflare R2' +
      (DRY_RUN ? ' (DRY-RUN: chỉ đếm)' : '') +
      (FORCE ? ' (FORCE: ghi đè cả dòng đã ở R2)' : ''),
  )
  console.log(`📁 Thư mục nguồn: ${UPLOADS_ROOT}`)

  const buckets = resolveBuckets()
  const totals: Counters = { skip: 0, uploaded: 0, missingLocal: 0, errors: 0 }
  for (const bucket of buckets) {
    const c = await syncBucket(bucket)
    totals.skip += c.skip
    totals.uploaded += c.uploaded
    totals.missingLocal += c.missingLocal
    totals.errors += c.errors
  }

  console.log('\n──────────────────────────────────────────────')
  console.log(
    `📦 TỔNG: ⏭ đã ở R2 ${totals.skip}  ${DRY_RUN ? 'sẽ tải' : '↑ đã tải lên'} ${totals.uploaded}  ∅ thiếu local ${totals.missingLocal}  ✗ lỗi ${totals.errors}`,
  )
  if (DRY_RUN) {
    console.log('ℹ️  Đây là DRY-RUN — chưa tải/ghi gì. Bỏ --dry-run để chạy thật.')
  } else if (totals.errors === 0 && totals.missingLocal === 0) {
    console.log('✅ Mọi audio_url đang trỏ /uploads/ đã chuyển sang R2.')
    console.log(
      'ℹ️  Có thể đổi STORAGE_DRIVER=r2 trong .env + pm2 restart để audio MỚI cũng tự lên R2\n' +
        '   (nếu chưa bật sẵn) — file local trong uploads/ vẫn giữ nguyên, tự dọn tay sau nếu muốn.',
    )
  }
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
