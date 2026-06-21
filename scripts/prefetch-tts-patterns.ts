// scripts/prefetch-tts-patterns.ts
// Tạo trước (pre-generate) audio TTS chất lượng cao cho TẤT CẢ câu trong src/data/patterns.ts,
// lưu vào Supabase Storage + bảng tts_cache — giống y hệt luồng của api/tts.ts.
//
// Đặc điểm:
//   - Tự lặp lại cho đến khi toàn bộ câu được cache thành công (không cần chạy tay nhiều lần).
//   - Mỗi vòng lặp chỉ xử lý các câu còn lỗi từ vòng trước — không gọi lại câu đã OK.
//   - Nghỉ dài hơn giữa các vòng retry để tránh bị Google TTS rate-limit.
//   - Dừng nếu vòng retry liên tiếp không giảm được số lỗi (tránh vòng lặp vô tận).
//
// Chạy: npm run prefetch:tts-patterns
// Debug: LIMIT=10 npm run prefetch:tts-patterns

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
const BATCH_SIZE = 3          // số câu xử lý song song mỗi lần
const DELAY_MS   = 400        // nghỉ giữa các batch (ms)
const RETRY_DELAY_MS = 8000   // nghỉ dài hơn giữa các vòng retry (ms)
const MAX_ROUNDS = 5          // số vòng retry tối đa nếu vẫn còn lỗi
const ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/prefetch-tts-errors.json')

const VOICE = 'female' as const

interface Task {
  text: string
  lang: Lang
}

type TaskResult =
  | { status: 'ok' }
  | { status: 'skip' }
  | { status: 'error'; message: string }

// Hash giống hệt api/tts.ts: SHA-256(text + lang + voice), lấy 32 ký tự hex đầu
function hashText(text: string, lang: Lang): string {
  return crypto
    .createHash('sha256')
    .update(text + lang + VOICE)
    .digest('hex')
    .slice(0, 32)
}

// Trích xuất tất cả câu (en + vi) từ patterns.ts, loại trùng
function collectAllTasks(): Task[] {
  const tasks: Task[] = []
  const seen = new Set<string>()

  for (const subject of patternsData) {
    for (const { en, vi } of subject.sentences) {
      const enKey = `${en.trim()}|en-US`
      if (en.trim() && !seen.has(enKey)) {
        seen.add(enKey)
        tasks.push({ text: en.trim(), lang: 'en-US' })
      }
      const viKey = `${vi.trim()}|vi-VN`
      if (vi.trim() && !seen.has(viKey)) {
        seen.add(viKey)
        tasks.push({ text: vi.trim(), lang: 'vi-VN' })
      }
    }
  }
  return tasks
}

// Xử lý 1 câu: kiểm tra cache → TTS → Upload → Lưu DB
async function processTask(task: Task): Promise<TaskResult> {
  const { text, lang } = task
  const hash = hashText(text, lang)

  try {
    const supabase = getSupabaseAdmin()

    // Bỏ qua nếu đã có trong cache
    const { data: cached } = await supabase
      .from('tts_cache')
      .select('audio_url')
      .eq('hash', hash)
      .maybeSingle()
    if (cached) return { status: 'skip' }

    // Gọi Google TTS
    const audioBuffer = await generateAudioFromGoogle(text, VOICE, lang)

    // Upload lên Supabase Storage bucket "tts-cache"
    const fileName = `${lang}/${VOICE}/${hash}.mp3`
    const { error: uploadError } = await supabase.storage
      .from('tts-cache')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
    if (uploadError) throw new Error(`Upload lỗi: ${uploadError.message}`)

    const { data: urlData } = supabase.storage.from('tts-cache').getPublicUrl(fileName)

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

// Chạy 1 vòng xử lý danh sách tasks, trả về danh sách câu vẫn còn lỗi
async function runPass(
  tasks: Task[],
  label: string,
): Promise<Array<{ task: Task; message: string }>> {
  console.log(`\n${label} — ${tasks.length} câu`)

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

  let countOk = 0, countSkip = 0, countError = 0
  const failed: Array<{ task: Task; message: string }> = []

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map((t) => processTask(t)))

    results.forEach((result, idx) => {
      if (result.status === 'ok')        countOk++
      else if (result.status === 'skip') countSkip++
      else {
        countError++
        failed.push({ task: batch[idx], message: result.message })
      }
    })

    bar.update(Math.min(i + BATCH_SIZE, tasks.length), { ok: countOk, skip: countSkip, errors: countError })

    if (i + BATCH_SIZE < tasks.length) await sleep(DELAY_MS)
  }

  bar.stop()
  console.log(`   ✓ Mới tạo: ${countOk}  ⏭ Đã có: ${countSkip}  ✗ Lỗi: ${countError}`)

  return failed
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_TTS_API_KEY'].filter(
    (k) => !process.env[k],
  )
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường trong .env: ${missing.join(', ')}`)
    process.exit(1)
  }

  const allTasks = collectAllTasks()
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
  const tasks = allTasks.slice(0, limit)

  console.log('🔊 Bắt đầu pre-generate TTS cho patterns.ts')
  console.log(`📋 Tổng câu: ${tasks.length} (en-US + vi-VN)`)
  console.log(`⚙️  Batch: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms | Retry delay: ${RETRY_DELAY_MS}ms | Max rounds: ${MAX_ROUNDS}`)

  // ── Vòng lặp chính: lặp cho đến khi hết lỗi hoặc đạt MAX_ROUNDS ──────────
  let remaining: Array<{ task: Task; message: string }> = []
  let previousErrorCount = Infinity

  // Vòng 1: xử lý toàn bộ
  remaining = await runPass(tasks, '🟢 Vòng 1 — Xử lý toàn bộ')

  // Vòng retry: chỉ xử lý câu vẫn còn lỗi
  for (let round = 2; round <= MAX_ROUNDS && remaining.length > 0; round++) {
    // Dừng sớm nếu số lỗi không giảm sau vòng trước (tránh vòng lặp vô tận)
    if (remaining.length >= previousErrorCount) {
      console.log(`\n⛔ Số lỗi không giảm (${remaining.length} câu) — dừng retry để tránh vòng lặp.`)
      break
    }
    previousErrorCount = remaining.length

    console.log(`\n⏳ Nghỉ ${RETRY_DELAY_MS / 1000}s trước khi retry...`)
    await sleep(RETRY_DELAY_MS)

    remaining = await runPass(
      remaining.map((r) => r.task),
      `🔄 Vòng ${round} — Retry ${remaining.length} câu còn lỗi`,
    )
  }

  // ── Kết quả cuối ─────────────────────────────────────────────────────────
  if (remaining.length === 0) {
    console.log('\n🎉 Hoàn thành 100%! Toàn bộ câu đã được cache.')
    // Xóa file lỗi cũ nếu có
    if (fs.existsSync(ERRORS_FILE)) fs.unlinkSync(ERRORS_FILE)
  } else {
    // Ghi lại các câu chưa xử lý được để xem xét thủ công
    const errorOutput = remaining.map((r) => ({
      text: r.task.text,
      lang: r.task.lang,
      message: r.message,
    }))
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errorOutput, null, 2))
    console.log(`\n⚠️  Còn ${remaining.length} câu không thể cache sau ${MAX_ROUNDS} vòng.`)
    console.log(`   Xem chi tiết: scripts/prefetch-tts-errors.json`)
    console.log(`   Lỗi mẫu: "${remaining[0].task.text}" — ${remaining[0].message}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi không mong đợi:', err)
  process.exit(1)
})
