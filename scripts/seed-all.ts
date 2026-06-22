// scripts/seed-all.ts
// Chạy cả 2 script seed song song xen kẽ nhau:
//   - seed:pronunciation  (phát âm từ điển)
//   - prefetch:tts-patterns (câu mẫu patterns)
//
// Chiến lược: không chạy 2 script riêng lẻ nối tiếp (sẽ mất hàng giờ trước khi
// bắt đầu script thứ 2). Thay vào đó, cứ mỗi INTERLEAVE_PCT% tổng tác vụ của
// script A thì chạy INTERLEAVE_PCT% của script B — 2 loại dữ liệu tăng dần đều.
//
// Chạy: npm run seed:all
// Debug: LIMIT=20 npm run seed:all

import * as crypto from 'node:crypto'
import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { generateAudioFromGoogle, VOICE_IDS, type Lang, type VoiceId } from '../api/_lib/googleTts.ts'
import { encryptAudio } from '../api/_lib/ttsCrypto.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
const BATCH_SIZE      = 10    // số tác vụ song song (giảm để tránh burst)
const DELAY_MS        = 0     // không cần delay thêm (rate limiter lo)
const RETRY_DELAY_MS  = 10000 // nghỉ 10s giữa vòng retry
const MAX_ROUNDS      = 5
const INTERLEAVE_PCT  = 5     // cứ mỗi 5% pronunciation thì chạy 5% patterns
const BASE_URL        = process.env.BASE_URL || ''
const FORCE           = process.argv.includes('--force') || process.env.FORCE === '1'
// Giới hạn request/phút gửi đến Google TTS — đặt dưới quota thật ~20% để an toàn
// Chirp 3 HD quota mặc định: 100 RPM → đặt 80 để có buffer
const MAX_RPM         = parseInt(process.env.MAX_RPM ?? '80', 10)

const PRON_ERRORS_FILE    = path.join(PROJECT_ROOT, 'scripts/seed-errors.json')
const PATTERN_ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/prefetch-tts-errors.json')

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// Token bucket rate limiter — đảm bảo không vượt MAX_RPM request/phút
// Cách hoạt động: mỗi request phải "mua" 1 token; token tự nạp theo thời gian thực.
class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillPerMs: number // token/ms

  constructor(rpm: number) {
    this.maxTokens   = rpm
    this.tokens      = rpm           // bắt đầu đầy bucket
    this.lastRefill  = Date.now()
    this.refillPerMs = rpm / 60_000
  }

  async acquire(): Promise<void> {
    const now     = Date.now()
    const elapsed = now - this.lastRefill
    // Nạp token theo thời gian đã trôi qua
    this.tokens    = Math.min(this.maxTokens, this.tokens + elapsed * this.refillPerMs)
    this.lastRefill = now

    if (this.tokens >= 1) {
      this.tokens--
      return
    }
    // Hết token → tính thời gian chờ cho đến khi nạp được 1 token
    const waitMs = Math.ceil((1 - this.tokens) / this.refillPerMs)
    await sleep(waitMs)
    this.tokens     = 0
    this.lastRefill = Date.now()
  }
}

const rateLimiter = new RateLimiter(MAX_RPM)

// ── Kiểu dữ liệu ────────────────────────────────────────────────────────────
interface PronTask { type: 'pron'; word: string; voice: VoiceId }
interface PatternTask { type: 'pattern'; text: string; lang: Lang; voice: VoiceId }
type AnyTask = PronTask | PatternTask

type TaskResult = { status: 'ok' | 'skip' } | { status: 'error'; message: string }

// ── Hash cho pattern cache (giống api/tts.ts) ────────────────────────────────
function hashText(text: string, lang: Lang, voice: VoiceId): string {
  return crypto.createHash('sha256').update(text + lang + voice).digest('hex').slice(0, 32)
}

// ── Load dữ liệu ────────────────────────────────────────────────────────────
interface Sentence { en: string; vi: string }
interface Subject   { starter: string; sentences: Sentence[] }

function loadPatternTasks(): PatternTask[] {
  const dir   = path.join(PROJECT_ROOT, 'src/data/patterns')
  const files = fs.readdirSync(dir).filter((f) => /^chunk-\d+\.json$/.test(f)).sort()
  const tasks: PatternTask[] = []
  const seen  = new Set<string>()

  for (const file of files) {
    const subjects = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as Subject[]
    for (const subject of subjects) {
      for (const { en, vi } of subject.sentences) {
        for (const [rawText, lang] of [[en, 'en-US'], [vi, 'vi-VN']] as [string, Lang][]) {
          const text = rawText.trim()
          if (!text) continue
          for (const voice of VOICE_IDS) {
            const key = `${text}|${lang}|${voice}`
            if (seen.has(key)) continue
            seen.add(key)
            tasks.push({ type: 'pattern', text, lang, voice })
          }
        }
      }
    }
  }
  return tasks
}

function loadPronTasks(wordsFile?: string): PronTask[] {
  let words: string[]
  if (wordsFile) {
    const raw = JSON.parse(fs.readFileSync(wordsFile, 'utf-8')) as unknown[]
    words = raw.map((item) =>
      (typeof item === 'string' ? item : (item as { word: string }).word).toLowerCase(),
    )
  } else {
    // Đọc từ src/data/dictionary/chunk-*.json
    const dir = path.join(PROJECT_ROOT, 'src/data/dictionary')
    const files = fs.readdirSync(dir).filter((f) => /^chunk-\d+\.json$/.test(f)).sort()
    words = []
    for (const file of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as unknown[]
      for (const item of raw) {
        words.push((typeof item === 'string' ? item : (item as { word: string }).word).toLowerCase())
      }
    }
  }
  const tasks: PronTask[] = []
  for (const word of words) {
    for (const voice of VOICE_IDS) tasks.push({ type: 'pron', word, voice })
  }
  return tasks
}

// ── Xử lý 1 tác vụ ──────────────────────────────────────────────────────────
async function processTask(task: AnyTask): Promise<TaskResult> {
  const supabase = getSupabaseAdmin()

  try {
    if (task.type === 'pron') {
      const { word, voice } = task
      await rateLimiter.acquire()
      const audioBuffer = await generateAudioFromGoogle(word, voice, 'en-US')
      const fileName    = `${word}-${voice}.mp3`
      const { error: uploadError } = await supabase.storage
        .from('pronunciations')
        .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
      if (uploadError) throw new Error(`Upload lỗi: ${uploadError.message}`)
      const { data: urlData } = supabase.storage.from('pronunciations').getPublicUrl(fileName)
      const { error: dbError } = await supabase
        .from('pronunciations')
        .upsert({ word, voice, audio_url: urlData.publicUrl, lang: 'en-US' }, { onConflict: 'word,voice' })
      if (dbError) throw new Error(`DB lỗi: ${dbError.message}`)
      return { status: 'ok' }
    }

    // pattern task
    const { text, lang, voice } = task
    const hash = hashText(text, lang, voice)

    if (!FORCE) {
      const { data: cached } = await supabase
        .from('tts_cache').select('audio_url').eq('hash', hash).maybeSingle()
      if (cached) return { status: 'skip' }
    }

    await rateLimiter.acquire()
    const audioBuffer = await generateAudioFromGoogle(text, voice, lang)
    const encrypted   = await encryptAudio(audioBuffer, hash)
    const fileName    = `${lang}/${voice}/${hash}.mp3`
    const audioUrl    = await saveAudio('tts-cache', fileName, encrypted, BASE_URL)
    const { error: dbError } = await supabase
      .from('tts_cache')
      .upsert({ hash, lang, voice, audio_url: audioUrl }, { onConflict: 'hash' })
    if (dbError) throw new Error(`DB lỗi: ${dbError.message}`)
    return { status: 'ok' }

  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) }
  }
}

// ── Chạy 1 batch tác vụ + cập nhật progress bar ─────────────────────────────
async function runBatch(
  tasks: AnyTask[],
  failed: Array<{ task: AnyTask; message: string }>,
  counters: { ok: number; skip: number; errors: number },
  bar: cliProgress.SingleBar,
  processed: { value: number },
  total: number,
): Promise<void> {
  const results = await Promise.all(tasks.map((t) => processTask(t)))
  results.forEach((result, idx) => {
    if (result.status === 'ok')        counters.ok++
    else if (result.status === 'skip') counters.skip++
    else {
      counters.errors++
      failed.push({ task: tasks[idx], message: result.message })
    }
  })
  processed.value = Math.min(processed.value + tasks.length, total)
  bar.update(processed.value, { ...counters })
  if (DELAY_MS > 0) await sleep(DELAY_MS)
}

// ── Vòng xử lý xen kẽ ───────────────────────────────────────────────────────
async function runInterleavedPass(
  pronTasks: AnyTask[],
  patternTasks: AnyTask[],
  label: string,
): Promise<{ pronFailed: Array<{ task: AnyTask; message: string }>; patternFailed: Array<{ task: AnyTask; message: string }> }> {
  const total = pronTasks.length + patternTasks.length
  console.log(`\n${label} — ${pronTasks.length} pron + ${patternTasks.length} pattern`)

  const bar = new cliProgress.SingleBar(
    {
      format: 'Tổng |{bar}| {percentage}% | {value}/{total} | ✓{ok} ⏭{skip} ✗{errors}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(total, 0, { ok: 0, skip: 0, errors: 0 })

  const counters  = { ok: 0, skip: 0, errors: 0 }
  const processed = { value: 0 }
  const pronFailed: Array<{ task: AnyTask; message: string }>    = []
  const patternFailed: Array<{ task: AnyTask; message: string }> = []

  // Chia thành các chunk theo INTERLEAVE_PCT
  const pronChunkSize    = Math.max(BATCH_SIZE, Math.ceil(pronTasks.length * INTERLEAVE_PCT / 100))
  const patternChunkSize = Math.max(BATCH_SIZE, Math.ceil(patternTasks.length * INTERLEAVE_PCT / 100))

  let pi = 0, ti = 0
  while (pi < pronTasks.length || ti < patternTasks.length) {
    // Chạy chunk pronunciation
    if (pi < pronTasks.length) {
      const chunk = pronTasks.slice(pi, pi + pronChunkSize)
      for (let i = 0; i < chunk.length; i += BATCH_SIZE) {
        await runBatch(chunk.slice(i, i + BATCH_SIZE), pronFailed, counters, bar, processed, total)
      }
      pi += pronChunkSize
    }
    // Chạy chunk pattern
    if (ti < patternTasks.length) {
      const chunk = patternTasks.slice(ti, ti + patternChunkSize)
      for (let i = 0; i < chunk.length; i += BATCH_SIZE) {
        await runBatch(chunk.slice(i, i + BATCH_SIZE), patternFailed, counters, bar, processed, total)
      }
      ti += patternChunkSize
    }
  }

  bar.stop()
  // In ra lỗi đầu tiên để debug
  const firstPronErr = pronFailed[0]
  const firstPatErr  = patternFailed[0]
  if (firstPronErr)  console.log(`\n🔴 Lỗi pron mẫu:  [${(firstPronErr.task as PronTask).word}] ${firstPronErr.message}`)
  if (firstPatErr)   console.log(`\n🔴 Lỗi pattern mẫu: ${firstPatErr.message}`)
  console.log(`   ✓ OK: ${counters.ok}  ⏭ Skip: ${counters.skip}  ✗ Lỗi pron: ${pronFailed.length} | pattern: ${patternFailed.length}`)

  return { pronFailed, patternFailed }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const missing = [
    'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_TTS_API_KEY', 'TTS_ENCRYPTION_MASTER_KEY',
  ].filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường: ${missing.join(', ')}`)
    process.exit(1)
  }

  const wordsFile = process.env.WORDS_FILE
    ? path.resolve(PROJECT_ROOT, process.env.WORDS_FILE)
    : undefined

  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity

  // Lấy tác vụ chưa có trong DB cho pronunciation
  const supabase = getSupabaseAdmin()
  const { data: existingPron } = await supabase.from('pronunciations').select('word, voice')
  const donePron = new Set(
    (existingPron ?? []).map((r) => `${(r as { word: string }).word}:${(r as { voice: string }).voice}`),
  )
  const allPronTasks = loadPronTasks(wordsFile)
    .filter((t) => !donePron.has(`${t.word}:${t.voice}`))
    .slice(0, limit) as AnyTask[]

  const allPatternTasks = loadPatternTasks().slice(0, limit) as AnyTask[]

  console.log('🔊 Bắt đầu seed:all — pronunciation + patterns (xen kẽ)')
  console.log(`📋 Pronunciation : ${allPronTasks.length} tác vụ cần tạo`)
  console.log(`📋 Patterns      : ${allPatternTasks.length} tác vụ cần tạo`)
  console.log(`⚙️  Batch: ${BATCH_SIZE} | RPM limit: ${MAX_RPM} | Interleave: ${INTERLEAVE_PCT}% | Max rounds: ${MAX_ROUNDS}${FORCE ? ' | FORCE' : ''}`)

  let pronRemaining    = allPronTasks
  let patternRemaining = allPatternTasks
  let prevPronErr      = Infinity
  let prevPatternErr   = Infinity

  // Vòng 1
  let result = await runInterleavedPass(pronRemaining, patternRemaining, '🟢 Vòng 1 — Xử lý toàn bộ')
  pronRemaining    = result.pronFailed.map((r) => r.task)
  patternRemaining = result.patternFailed.map((r) => r.task)

  // Vòng retry
  for (let round = 2; round <= MAX_ROUNDS; round++) {
    if (pronRemaining.length === 0 && patternRemaining.length === 0) break
    if (pronRemaining.length >= prevPronErr && patternRemaining.length >= prevPatternErr) {
      console.log('\n⛔ Lỗi không giảm — dừng retry.')
      break
    }
    prevPronErr    = pronRemaining.length
    prevPatternErr = patternRemaining.length

    console.log(`\n⏳ Nghỉ ${RETRY_DELAY_MS / 1000}s...`)
    await sleep(RETRY_DELAY_MS)

    result = await runInterleavedPass(
      pronRemaining, patternRemaining,
      `🔄 Vòng ${round} — Retry (pron: ${pronRemaining.length}, pattern: ${patternRemaining.length})`,
    )
    pronRemaining    = result.pronFailed.map((r) => r.task)
    patternRemaining = result.patternFailed.map((r) => r.task)
  }

  // Ghi file lỗi nếu còn
  let hasError = false
  if (pronRemaining.length > 0) {
    hasError = true
    const words = [...new Set(pronRemaining.map((t) => (t as PronTask).word))]
    fs.writeFileSync(PRON_ERRORS_FILE, JSON.stringify(words, null, 2))
    console.log(`\n⚠️  ${pronRemaining.length} pron lỗi → scripts/seed-errors.json`)
  } else if (fs.existsSync(PRON_ERRORS_FILE)) fs.unlinkSync(PRON_ERRORS_FILE)

  if (patternRemaining.length > 0) {
    hasError = true
    const errors = patternRemaining.map((t) => {
      const pt = t as PatternTask
      return { text: pt.text, lang: pt.lang, voice: pt.voice }
    })
    fs.writeFileSync(PATTERN_ERRORS_FILE, JSON.stringify(errors, null, 2))
    console.log(`⚠️  ${patternRemaining.length} pattern lỗi → scripts/prefetch-tts-errors.json`)
  } else if (fs.existsSync(PATTERN_ERRORS_FILE)) fs.unlinkSync(PATTERN_ERRORS_FILE)

  if (!hasError) {
    console.log('\n🎉 Hoàn thành 100%! Toàn bộ audio đã được cache.')
  } else {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
