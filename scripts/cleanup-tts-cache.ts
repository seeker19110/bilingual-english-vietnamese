// scripts/cleanup-tts-cache.ts
// Dọn cache TTS CŨ (bảng tts_cache) — xoá cả file audio (local VPS hoặc Cloudflare R2, tùy
// STORAGE_DRIVER) lẫn bản ghi Postgres của những câu LÂU KHÔNG CÓ AI NGHE, tránh đầy đĩa VPS
// theo thời gian (audio_url của Google TTS nội dung TĨNH, không hết hạn nên trước đây không có
// gì tự xoá — xem cột tts_cache.last_accessed_at, cập nhật mỗi lần cache HIT ở packages/core-ai/tts.ts).
//
// An toàn khi xoá nhầm: audio cache "có thể tạo lại" (chỉ tốn thêm Google TTS quota khi câu đó
// được hỏi lại lần sau) — KHÔNG phải dữ liệu người dùng, xem docs/deploy-vps-ubuntu.md mục Backup.
//
// Chạy: npm run cleanup:tts-cache
// Xem trước (không xoá gì): npm run cleanup:tts-cache -- --dry-run
// Đổi ngưỡng (mặc định 90 ngày không ai nghe): npm run cleanup:tts-cache -- --days=180

import * as dotenv from 'dotenv'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { getPgPool } from '../packages/core-db/pgPool.ts'
import { deleteAudio } from '../packages/core-ai/fileStorage.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const DRY_RUN = process.argv.includes('--dry-run')

function parseDaysArg(): number {
  const arg = process.argv.find((a) => a.startsWith('--days='))
  const days = arg ? Number(arg.slice('--days='.length)) : Number(process.env.TTS_CACHE_TTL_DAYS)
  return Number.isFinite(days) && days > 0 ? days : 90
}

const TTL_DAYS = parseDaysArg()
const BATCH_SIZE = 20 // xoá file song song vừa phải — tránh dồn quá nhiều request R2/fs cùng lúc

interface StaleRow {
  hash: string
  lang: string
  voice: string
}

async function main(): Promise<void> {
  const missing = ['DATABASE_URL'].filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường trong .env: ${missing.join(', ')}`)
    process.exit(1)
  }

  const pool = getPgPool()

  const { rows } = await pool.query<StaleRow>(
    `select hash, lang, voice from public.tts_cache
     where last_accessed_at < now() - ($1 || ' days')::interval
     order by last_accessed_at asc`,
    [TTL_DAYS],
  )

  console.log(
    `🔎 Tìm thấy ${rows.length} câu TTS không ai nghe trong ${TTL_DAYS} ngày qua${DRY_RUN ? ' (--dry-run: chỉ xem, không xoá)' : ''}.`,
  )

  if (rows.length === 0) {
    console.log('✅ Không có gì cần dọn.')
    return
  }

  if (DRY_RUN) {
    for (const row of rows.slice(0, 20)) {
      console.log(`   - ${row.lang}/${row.voice}/${row.hash}.mp3`)
    }
    if (rows.length > 20) console.log(`   ... và ${rows.length - 20} câu khác`)
    return
  }

  const bar = new cliProgress.SingleBar(
    {
      format: 'Đang dọn |{bar}| {percentage}% | {value}/{total} | ✓{ok} ✗{errors}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(rows.length, 0, { ok: 0, errors: 0 })

  let countOk = 0
  let countError = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (row) => {
        try {
          const fileName = `${row.lang}/${row.voice}/${row.hash}.mp3`
          await deleteAudio('tts-cache', fileName)
          // Xoá file trước rồi mới xoá bản ghi DB — lỡ xoá file thất bại (R2 lỗi mạng) thì
          // bản ghi DB vẫn còn, lần chạy sau thử xoá lại thay vì mồ côi 1 file không ai biết.
          await pool.query('delete from public.tts_cache where hash = $1', [row.hash])
          countOk++
        } catch (err) {
          countError++
          console.error(
            `\n⚠️  Lỗi xoá ${row.lang}/${row.voice}/${row.hash}:`,
            err instanceof Error ? err.message : err,
          )
        }
      }),
    )
    bar.update(Math.min(i + BATCH_SIZE, rows.length), { ok: countOk, errors: countError })
  }

  bar.stop()
  console.log(
    `\n✅ Đã dọn ${countOk} câu.${countError > 0 ? ` ✗ ${countError} lỗi (xem log ở trên).` : ''}`,
  )
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi:', err)
  process.exit(1)
})
