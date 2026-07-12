// scripts/prefetch-tts-vlog.ts
// Tạo trước (pre-generate) audio TTS Chirp 3 HD cho TOÀN BỘ câu mẫu (sampleEn/sampleVi)
// của 30 chủ đề Vlog (src/data/vlogTopics.ts) — GIỐNG HỆT luồng api/tts.ts (cùng hash,
// cùng mã hóa, cùng cách lưu file) để người học bấm "🔊 Bấm nghe câu mẫu" (Vlog.tsx)
// là nghe được ngay, không phải đợi Google TTS tạo mới ở lần bấm đầu tiên.
//
// Seed cả 2 giọng female/male (Chirp 3 HD, rõ ràng, tự nhiên) — người dùng chọn giọng
// nào qua VoiceToggle (header) cũng đã có sẵn audio.
//
// Chạy: npm run prefetch:tts-vlog
// Debug 1 câu: LIMIT=1 npm run prefetch:tts-vlog
// Ghi đè cache cũ: npm run prefetch:tts-vlog -- --force

import * as crypto from 'node:crypto'
import * as dotenv from 'dotenv'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import {
  generateAudioFromGoogle,
  VOICE_VERSION,
  type Lang,
  type VoiceId,
} from '../api/_lib/googleTts.ts'
import { VLOG_TOPICS } from '../src/data/vlogTopics.ts'
import { encryptAudio } from '../api/_lib/ttsCrypto.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'
import { PREF_VOICE_IDS } from './_lib/patternOrder.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
const BATCH_SIZE = 15
const RETRY_DELAY_MS = 5000
const MAX_ROUNDS = 5
const ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/prefetch-tts-vlog-errors.json')

const BASE_URL = process.env.BASE_URL || ''
const FORCE = process.argv.includes('--force') || process.env.FORCE === '1'

interface Task {
  text: string
  lang: Lang
  voice: VoiceId
}

// ── Hash: GIỐNG HỆT hàm hashText trong api/tts.ts ───────────────────────────
function hashText(text: string, lang: Lang, voice: VoiceId): string {
  return crypto
    .createHash('sha256')
    .update(text + lang + voice + VOICE_VERSION)
    .digest('hex')
    .slice(0, 32)
}

// ── Trích xuất tất cả câu mẫu cần seed (sampleEn + sampleVi, 30 ngày) ───────
function collectTasks(): Task[] {
  const tasks: Task[] = []
  const seen = new Set<string>()

  const add = (rawText: string, lang: Lang) => {
    const text = rawText.trim()
    if (!text) return
    for (const voice of PREF_VOICE_IDS) {
      const key = `${text}|${lang}|${voice}`
      if (seen.has(key)) continue
      seen.add(key)
      tasks.push({ text, lang, voice })
    }
  }

  for (const t of VLOG_TOPICS) {
    for (const s of t.sampleEn) add(s, 'en-US')
    for (const s of t.sampleVi) add(s, 'vi-VN')
  }

  return tasks
}

// ── Xử lý 1 tác vụ: kiểm tra cache → TTS → MÃ HÓA → lưu file → lưu DB ───────
async function processTask(
  task: Task,
): Promise<{ status: 'ok' } | { status: 'skip' } | { status: 'error'; message: string }> {
  const { text, lang, voice } = task
  const hash = hashText(text, lang, voice)

  try {
    const supabase = getSupabaseAdmin()

    if (!FORCE) {
      const { data: cached } = await supabase
        .from('tts_cache')
        .select('audio_url')
        .eq('hash', hash)
        .maybeSingle()

      if (cached) return { status: 'skip' }
    }

    const audioBuffer = await generateAudioFromGoogle(text, voice, lang)
    const encrypted = await encryptAudio(audioBuffer, hash)

    const fileName = `${lang}/${voice}/${hash}.mp3`
    const audioUrl = await saveAudio('tts-cache', fileName, encrypted, BASE_URL)

    const { error: dbError } = await supabase
      .from('tts_cache')
      .upsert({ hash, lang, voice, audio_url: audioUrl }, { onConflict: 'hash' })

    if (dbError) throw new Error(`Lưu DB lỗi: ${dbError.message}`)

    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) }
  }
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function runPass(
  tasks: Task[],
  label: string,
): Promise<Array<{ task: Task; message: string }>> {
  console.log(`\n${label} — ${tasks.length} tác vụ`)

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

  let countOk = 0,
    countSkip = 0,
    countError = 0
  const failed: Array<{ task: Task; message: string }> = []

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map((t) => processTask(t)))

    results.forEach((result, idx) => {
      if (result.status === 'ok') countOk++
      else if (result.status === 'skip') countSkip++
      else {
        countError++
        failed.push({ task: batch[idx]!, message: result.message })
      }
    })

    bar.update(Math.min(i + BATCH_SIZE, tasks.length), {
      ok: countOk,
      skip: countSkip,
      errors: countError,
    })
  }

  bar.stop()
  console.log(`   ✓ Mới tạo: ${countOk}  ⏭ Đã có: ${countSkip}  ✗ Lỗi: ${countError}`)

  return failed
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const missing = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_TTS_API_KEY',
    'TTS_ENCRYPTION_MASTER_KEY',
  ].filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường trong .env: ${missing.join(', ')}`)
    process.exit(1)
  }

  const allTasks = collectTasks()
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
  const tasks = allTasks.slice(0, limit)

  console.log('🔊 Bắt đầu pre-generate TTS Chirp 3 HD cho 30 chủ đề Vlog')
  console.log(`📋 Tổng tác vụ: ${tasks.length} (en-US + vi-VN · giọng ${PREF_VOICE_IDS.join('/')})`)
  console.log(
    `⚙️  Batch: ${BATCH_SIZE} | Retry delay: ${RETRY_DELAY_MS}ms | Max rounds: ${MAX_ROUNDS}${FORCE ? ' | ⚠️  FORCE: ghi đè cache cũ' : ''}`,
  )

  let remaining: Array<{ task: Task; message: string }> = []
  let previousErrorCount = Infinity

  remaining = await runPass(tasks, '🟢 Vòng 1 — Xử lý toàn bộ')

  for (let round = 2; round <= MAX_ROUNDS && remaining.length > 0; round++) {
    if (remaining.length >= previousErrorCount) {
      console.log(`\n⛔ Số lỗi không giảm (${remaining.length} tác vụ) — dừng retry.`)
      break
    }
    previousErrorCount = remaining.length

    console.log(`\n⏳ Nghỉ ${RETRY_DELAY_MS / 1000}s trước khi retry...`)
    await sleep(RETRY_DELAY_MS)

    remaining = await runPass(
      remaining.map((r) => r.task),
      `🔄 Vòng ${round} — Retry ${remaining.length} tác vụ còn lỗi`,
    )
  }

  if (remaining.length === 0) {
    console.log('\n🎉 Hoàn thành 100%! Toàn bộ câu mẫu Vlog đã được cache.')
    if (fs.existsSync(ERRORS_FILE)) fs.unlinkSync(ERRORS_FILE)
  } else {
    const errorOutput = remaining.map((r) => ({
      text: r.task.text,
      lang: r.task.lang,
      voice: r.task.voice,
      message: r.message,
    }))
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errorOutput, null, 2))
    console.log(`\n⚠️  Còn ${remaining.length} tác vụ không thể cache sau ${MAX_ROUNDS} vòng.`)
    console.log(`   Xem chi tiết: scripts/prefetch-tts-vlog-errors.json`)
    const sample = remaining[0]!
    console.log(
      `   Lỗi mẫu: "${sample.task.text}" (${sample.task.lang}/${sample.task.voice}) — ${sample.message}`,
    )
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi:', err)
  process.exit(1)
})
