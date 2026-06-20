// scripts/prefetch-tts-patterns.ts
// Tạo trước (pre-generate) audio TTS chất lượng cao cho TẤT CẢ câu trong src/data/patterns.ts,
// lưu vào Supabase Storage + bảng tts_cache — giống y hệt luồng của api/tts.ts.
//
// Tại sao cần script này?
//   - Câu đầu tiên của mỗi câu chưa được cache sẽ phải gọi Google TTS (tốn ~1-2s).
//   - Chạy script 1 lần → TOÀN BỘ câu được cache → mọi người dùng sau chỉ đọc file mp3 sẵn.
//   - Script resume được: chạy lại sẽ bỏ qua câu đã có trong bảng tts_cache.
//
// Dữ liệu seed:
//   - Tiếng Anh (lang=en-US, voice=female): mọi câu .en trong patterns.ts
//   - Tiếng Việt (lang=vi-VN, voice=female): mọi câu .vi trong patterns.ts
//   Tổng ~ số câu × 2.
//
// Thuật toán hash giống hệt api/tts.ts: SHA-256(text + lang + voice), lấy 32 ký tự hex đầu.
// Tên file Storage: {lang}/{voice}/{hash}.mp3
//
// Chạy: npm run prefetch:tts-patterns
// Debug 1 câu: LIMIT=1 npm run prefetch:tts-patterns

import * as crypto from 'node:crypto'
import * as dotenv from 'dotenv'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { generateAudioFromGoogle, type Lang } from '../api/_lib/googleTts.ts'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'
import patternsData from '../src/data/patterns.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
// BATCH_SIZE: số câu xử lý song song cùng lúc (mỗi câu = 1 lần gọi Google TTS)
// Đặt thấp để tránh Google TTS rate-limit; tăng lên nếu có quota cao.
const BATCH_SIZE = 3
// DELAY_MS: nghỉ giữa các batch (ms); giảm xuống nếu muốn nhanh hơn nhưng cẩn thận rate-limit
const DELAY_MS = 400
const ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/prefetch-tts-errors.json')

// Chỉ giọng nữ — giọng chính của app (api/tts.ts mặc định voice='female')
const VOICE = 'female' as const

interface Task {
  text: string
  lang: Lang
}

// ── Hash: giống hệt hàm hashText trong api/tts.ts ───────────────────────────
// Dùng node:crypto thay vì crypto.subtle (crypto.subtle chỉ có trong Edge/browser runtime)
function hashText(text: string, lang: Lang): string {
  return crypto
    .createHash('sha256')
    .update(text + lang + VOICE)
    .digest('hex')
    .slice(0, 32)
}

// ── Trích xuất tất cả câu cần seed từ patterns.ts ───────────────────────────
function collectTasks(): Task[] {
  const tasks: Task[] = []
  const seen = new Set<string>() // tránh trùng (cùng câu xuất hiện nhiều lần)

  for (const subject of patternsData) {
    for (const { en, vi } of subject.sentences) {
      const enTrimmed = en.trim()
      const viTrimmed = vi.trim()

      const keyEn = `${enTrimmed}|en-US`
      if (enTrimmed && !seen.has(keyEn)) {
        seen.add(keyEn)
        tasks.push({ text: enTrimmed, lang: 'en-US' })
      }

      const keyVi = `${viTrimmed}|vi-VN`
      if (viTrimmed && !seen.has(keyVi)) {
        seen.add(keyVi)
        tasks.push({ text: viTrimmed, lang: 'vi-VN' })
      }
    }
  }

  return tasks
}

// ── Xử lý 1 tác vụ: kiểm tra cache → TTS → Upload Storage → Lưu DB ─────────
async function processTask(task: Task): Promise<{ status: 'ok' | 'skip' } | { status: 'error'; message: string }> {
  const { text, lang } = task
  const hash = hashText(text, lang)

  try {
    const supabase = getSupabaseAdmin()

    // Kiểm tra cache trước để không tốn tiền TTS với câu đã có
    const { data: cached } = await supabase
      .from('tts_cache')
      .select('audio_url')
      .eq('hash', hash)
      .maybeSingle()

    if (cached) return { status: 'skip' }

    // Gọi Google TTS
    const audioBuffer = await generateAudioFromGoogle(text, VOICE, lang)

    // Upload lên Storage bucket "tts-cache" (tạo bucket này trong Supabase nếu chưa có)
    const fileName = `${lang}/${VOICE}/${hash}.mp3`
    const { error: uploadError } = await supabase.storage
      .from('tts-cache')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

    if (uploadError) throw new Error(`Upload lỗi: ${uploadError.message}`)

    // Lấy public URL
    const { data: urlData } = supabase.storage.from('tts-cache').getPublicUrl(fileName)

    // Lưu vào DB — upsert để idempotent nếu 2 process chạy song song
    const { error: dbError } = await supabase
      .from('tts_cache')
      .upsert(
        { hash, lang, voice: VOICE, audio_url: urlData.publicUrl },
        { onConflict: 'hash' },
      )

    if (dbError) throw new Error(`Lưu DB lỗi: ${dbError.message}`)

    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) }
  }
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // Kiểm tra biến môi trường
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_TTS_API_KEY'].filter(
    (k) => !process.env[k],
  )
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường trong .env: ${missing.join(', ')}`)
    process.exit(1)
  }

  const allTasks = collectTasks()

  // Giới hạn số câu nếu chạy debug (LIMIT=10 npm run prefetch:tts-patterns)
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
  const tasks = allTasks.slice(0, limit)

  console.log('🔊 Bắt đầu pre-generate TTS cho patterns.ts\n')
  console.log(`📋 Tổng câu cần xử lý: ${tasks.length} (en-US + vi-VN)`)
  console.log(`⚙️  Batch size: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms\n`)

  const bar = new cliProgress.SingleBar(
    {
      format: 'Tiến độ |{bar}| {percentage}% | {value}/{total} | ✓{ok} ⏭{skip} ✗{errors}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(tasks.length, 0, { ok: 0, skip: 0, errors: 0 })

  let countOk = 0
  let countSkip = 0
  let countError = 0
  const errorTexts: Array<{ text: string; lang: Lang; message: string }> = []

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map((t) => processTask(t)))

    results.forEach((result, idx) => {
      if (result.status === 'ok') countOk++
      else if (result.status === 'skip') countSkip++
      else {
        countError++
        errorTexts.push({ ...batch[idx], message: result.message })
      }
    })

    bar.update(Math.min(i + BATCH_SIZE, tasks.length), { ok: countOk, skip: countSkip, errors: countError })

    if (i + BATCH_SIZE < tasks.length) await sleep(DELAY_MS)
  }

  bar.stop()

  if (errorTexts.length > 0) {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errorTexts, null, 2))
    console.log(`\n⚠️  ${errorTexts.length} câu bị lỗi → xem chi tiết: scripts/prefetch-tts-errors.json`)
    console.log(`   Lỗi đầu tiên: "${errorTexts[0].text}" (${errorTexts[0].lang}) — ${errorTexts[0].message}`)
  }

  console.log(`\n✅ Hoàn thành!`)
  console.log(`   Mới tạo : ${countOk}`)
  console.log(`   Đã có   : ${countSkip}`)
  console.log(`   Lỗi     : ${countError}`)
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi:', err)
  process.exit(1)
})
