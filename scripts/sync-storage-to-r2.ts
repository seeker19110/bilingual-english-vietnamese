// scripts/sync-storage-to-r2.ts
// Đồng bộ TẢI LÊN: đẩy audio đang nằm trên ổ đĩa VPS (STORAGE_DRIVER=local, thư mục
// UPLOADS_DIR) lên Cloudflare R2 + TÁI TẠO dòng Postgres tương ứng (`tts_cache`/
// `pronunciations`) — ngược hướng với scripts/sync-storage-to-vps.ts cũ (đã xóa, thời
// còn Supabase Storage).
//
// ⚠️ QUAN TRỌNG — nguồn dữ liệu là Ổ ĐĨA, không phải DB: quyết định 2026-07-19
// ("bỏ qua migrate dữ liệu người dùng cũ", xem docs/migration-thoat-ly-supabase.md)
// khiến Postgres tự host bắt đầu từ schema RỖNG — `tts_cache`/`pronunciations` KHÔNG
// có dòng nào dù `uploads/` trên VPS vẫn còn đầy audio đã cache từ trước khi cutover.
// Nếu chỉ đọc DB (cách làm ban đầu của script này) sẽ luôn thấy "0 dòng" và không đẩy
// được gì lên R2 dù ổ đĩa còn hàng nghìn file — bug đã sửa (đợt phát hiện 2026-07-20 khi
// người dùng chạy thử thấy "R2 không có file nào" dù thực tế uploads/ vẫn còn dữ liệu).
// Script giờ QUÉT ổ đĩa trực tiếp, suy ra (hash/lang/voice) hoặc (word/voice) từ TÊN
// FILE, rồi INSERT dòng DB mới cho file chưa có dòng (hoặc UPDATE nếu dòng đã tồn tại
// nhưng còn trỏ local).
//
// Vì sao suy ngược từ tên file AN TOÀN:
//   - tts-cache: hash = sha256(text+lang+voice+VOICE_VERSION) — VOICE_VERSION nằm
//     TRONG hash, không phải cột riêng → hash cũ tự động KHÔNG khớp nếu VOICE_VERSION
//     đã đổi từ lúc file được tạo (app sẽ không bao giờ tra trúng dòng sai giọng).
//     Khôi phục dòng (hash, lang, voice, audio_url) từ tên file luôn ĐÚNG 100%.
//   - pronunciations: bảng có cột `voice_version` riêng (không nằm trong tên file) để
//     phát hiện giọng đã lỗi thời. Script gán `voice_version = VOICE_VERSION hiện tại`
//     khi khôi phục — ĐÂY LÀ GIẢ ĐỊNH (không thể xác nhận từ tên file), dựa trên
//     `VOICE_VERSION` là 1 hằng số ít đổi (`api/_lib/googleTts.ts`, không có lịch sử đổi
//     nào tính tới lúc viết script). Nếu giả định sai (audio thật ra tạo bằng giọng cũ
//     hơn), hậu quả CHỈ LÀ người dùng nghe tạm 1 giọng hơi khác bản mới nhất — tự sửa
//     ngay lần VOICE_VERSION kế tiếp đổi (dòng bị coi lỗi thời, tự tạo lại).
//
// Cách hoạt động (an toàn, chạy lại nhiều lần được):
//   - Quét đệ quy `uploads/tts-cache/**/*.mp3` (cấu trúc `<lang>/<voice>/<hash>.mp3`) và
//     `uploads/pronunciations/*.mp3` (cấu trúc `<word-encoded>-<voice>.mp3`).
//   - Với mỗi file: tra DB xem đã có dòng trỏ R2 chưa (đã đồng bộ trước đó) → có thì bỏ
//     qua (trừ khi --force). Chưa có / còn trỏ local → đọc file → upload lên R2 qua
//     saveAudio() → INSERT ... ON CONFLICT DO UPDATE audio_url (giữ nguyên các cột khác
//     nếu dòng đã tồn tại, vd `created_at`).
//   - File local KHÔNG bị xóa (giữ lại làm bản sao dự phòng, tự dọn tay sau khi xác nhận
//     R2 hoạt động ổn nếu muốn giải phóng dung lượng).
//
// Cờ / biến môi trường:
//   --dry-run (DRY_RUN=1)      Chỉ ĐẾM (không tải lên R2, không ghi DB).
//   --force   (FORCE=1)        Tải lên + ghi đè cả dòng đã trỏ R2 rồi.
//   BUCKET=tts-cache           Chỉ xử lý 1 bucket (tts-cache | pronunciations).
//   LIMIT=100                  Giới hạn số file mỗi bucket (debug).
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
import { VOICE_IDS, VOICE_VERSION, type VoiceId } from '../api/_lib/googleTts.ts'

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

// ── Quét đệ quy tìm mọi file .mp3 dưới 1 thư mục (đường dẫn TƯƠNG ĐỐI so với gốc) ──
async function walkMp3(root: string, dir = ''): Promise<string[]> {
  const full = path.join(root, dir)
  if (!fs.existsSync(full)) return []
  const entries = await fs.promises.readdir(full, { withFileTypes: true })
  const out: string[] = []
  for (const entry of entries) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...(await walkMp3(root, rel)))
    else if (entry.isFile() && entry.name.endsWith('.mp3')) out.push(rel)
  }
  return out
}

// tts-cache: <lang>/<voice>/<hash>.mp3 — 3 phần cố định, suy trực tiếp từ đường dẫn.
function parseTtsCacheKey(key: string): { lang: string; voice: string; hash: string } | null {
  const parts = key.split('/')
  if (parts.length !== 3) return null
  const [lang, voice, file] = parts
  if (!lang || !voice || !file?.endsWith('.mp3')) return null
  return { lang, voice, hash: file.slice(0, -'.mp3'.length) }
}

// pronunciations: <word-encoded>-<voice>.mp3 — voice là 1 trong 4 giá trị cố định
// (VOICE_IDS), khớp SUFFIX dài nhất trước (female2/male2 trước female/male) để tránh
// cắt nhầm từ có gạch nối kết thúc trùng ký tự.
const VOICE_SUFFIXES = [...VOICE_IDS].sort((a, b) => b.length - a.length)
function parsePronunciationKey(key: string): { word: string; voice: VoiceId } | null {
  if (!key.endsWith('.mp3')) return null
  const base = key.slice(0, -'.mp3'.length)
  for (const voice of VOICE_SUFFIXES) {
    const suffix = `-${voice}`
    if (base.endsWith(suffix)) {
      const encodedWord = base.slice(0, -suffix.length)
      if (!encodedWord) continue
      try {
        return { word: decodeURIComponent(encodedWord), voice }
      } catch {
        return null // encodeURIComponent lỗi (hiếm) — bỏ qua file này
      }
    }
  }
  return null
}

interface Counters {
  skip: number
  uploaded: number
  parseError: number
  errors: number
}

async function syncTtsCacheFile(key: string, counters: Counters, samples: string[]) {
  const parsed = parseTtsCacheKey(key)
  if (!parsed) {
    counters.parseError++
    if (samples.length < 5) samples.push(key)
    return
  }
  const pool = getPgPool()
  if (!FORCE) {
    const { rows } = await pool.query<{ audio_url: string }>(
      'select audio_url from public.tts_cache where hash = $1',
      [parsed.hash],
    )
    if (rows[0] && !rows[0].audio_url.includes('/uploads/')) {
      counters.skip++
      return
    }
  }
  if (DRY_RUN) {
    counters.uploaded++
    return
  }
  try {
    const localPath = path.join(UPLOADS_ROOT, 'tts-cache', key)
    const buf = await fs.promises.readFile(localPath)
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const audioUrl = await saveAudio('tts-cache', key, arrayBuffer)
    await pool.query(
      `insert into public.tts_cache (hash, lang, voice, audio_url, last_accessed_at)
       values ($1, $2, $3, $4, now())
       on conflict (hash) do update set audio_url = excluded.audio_url, last_accessed_at = now()`,
      [parsed.hash, parsed.lang, parsed.voice, audioUrl],
    )
    counters.uploaded++
  } catch (err) {
    counters.errors++
    if (samples.length < 5)
      samples.push(`${key} → ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function syncPronunciationFile(key: string, counters: Counters, samples: string[]) {
  const parsed = parsePronunciationKey(key)
  if (!parsed) {
    counters.parseError++
    if (samples.length < 5) samples.push(key)
    return
  }
  const pool = getPgPool()
  if (!FORCE) {
    const { rows } = await pool.query<{ audio_url: string }>(
      'select audio_url from public.pronunciations where word = $1 and voice = $2',
      [parsed.word, parsed.voice],
    )
    if (rows[0] && !rows[0].audio_url.includes('/uploads/')) {
      counters.skip++
      return
    }
  }
  if (DRY_RUN) {
    counters.uploaded++
    return
  }
  try {
    const localPath = path.join(UPLOADS_ROOT, 'pronunciations', key)
    const buf = await fs.promises.readFile(localPath)
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const audioUrl = await saveAudio('pronunciations', key, arrayBuffer)
    // voice_version = VOICE_VERSION hiện tại — GIẢ ĐỊNH tài liệu hoá ở đầu file (không
    // xác nhận được từ tên file), chấp nhận được vì hằng số này hiếm đổi.
    await pool.query(
      `insert into public.pronunciations (word, voice, audio_url, lang, voice_version, last_accessed_at)
       values ($1, $2, $3, 'en-US', $4, now())
       on conflict (word, voice) do update set audio_url = excluded.audio_url, last_accessed_at = now()`,
      [parsed.word, parsed.voice, audioUrl, VOICE_VERSION],
    )
    counters.uploaded++
  } catch (err) {
    counters.errors++
    if (samples.length < 5)
      samples.push(`${key} → ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function syncBucket(bucket: Bucket): Promise<Counters> {
  process.stdout.write(`\n📤 Bucket "${bucket}" — đang quét ổ đĩa...`)
  const allFiles = await walkMp3(path.join(UPLOADS_ROOT, bucket))
  const files = allFiles.slice(0, LIMIT)
  console.log(` ${files.length.toLocaleString('vi-VN')} file .mp3`)

  const counters: Counters = { skip: 0, uploaded: 0, parseError: 0, errors: 0 }
  const samples: string[] = []
  const syncFile = bucket === 'tts-cache' ? syncTtsCacheFile : syncPronunciationFile

  const bar = new cliProgress.SingleBar(
    {
      format: `  |{bar}| {percentage}% | {value}/{total} | ⏭{skip} ${DRY_RUN ? 'sẽ tải' : '↑'}{uploaded} ⚠{parseError} ✗{errors}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(files.length, 0, { ...counters })

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    await Promise.all(files.slice(i, i + BATCH_SIZE).map((f) => syncFile(f, counters, samples)))
    bar.update(Math.min(i + BATCH_SIZE, files.length), { ...counters })
  }
  bar.stop()

  console.log(
    `  ⏭ Đã ở R2: ${counters.skip}  ${DRY_RUN ? 'sẽ tải' : '↑ Đã tải lên'}: ${counters.uploaded}  ⚠ Tên file lạ (bỏ qua): ${counters.parseError}  ✗ Lỗi: ${counters.errors}`,
  )
  if (samples.length > 0) {
    console.log('     Ví dụ (tên lạ/lỗi):')
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
    '🔄 Quét ổ đĩa VPS → đẩy audio lên Cloudflare R2 + tái tạo dòng DB' +
      (DRY_RUN ? ' (DRY-RUN: chỉ đếm)' : '') +
      (FORCE ? ' (FORCE: ghi đè cả dòng đã ở R2)' : ''),
  )
  console.log(`📁 Thư mục nguồn: ${UPLOADS_ROOT}`)

  const buckets = resolveBuckets()
  const totals: Counters = { skip: 0, uploaded: 0, parseError: 0, errors: 0 }
  for (const bucket of buckets) {
    const c = await syncBucket(bucket)
    totals.skip += c.skip
    totals.uploaded += c.uploaded
    totals.parseError += c.parseError
    totals.errors += c.errors
  }

  console.log('\n──────────────────────────────────────────────')
  console.log(
    `📦 TỔNG: ⏭ đã ở R2 ${totals.skip}  ${DRY_RUN ? 'sẽ tải' : '↑ đã tải lên'} ${totals.uploaded}  ⚠ tên lạ ${totals.parseError}  ✗ lỗi ${totals.errors}`,
  )
  if (DRY_RUN) {
    console.log('ℹ️  Đây là DRY-RUN — chưa tải/ghi gì. Bỏ --dry-run để chạy thật.')
  } else if (totals.errors === 0) {
    console.log('✅ Mọi audio trên ổ đĩa đã có dòng DB trỏ về R2.')
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
