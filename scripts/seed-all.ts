// scripts/seed-all.ts
// Công cụ seed audio (phát âm + TTS câu) có BÁO CÁO TIẾN ĐỘ + MENU chọn việc.
//
// Khi chạy `npm run seed:all`:
//   1. Kiểm tra DB → báo cáo bao nhiêu % mỗi nhóm đã seed xong (sẵn sàng cho client).
//   2. Hiện menu: seed riêng 1 nhóm · seed tất cả · thoát.
//   3. Sau mỗi lần seed, kiểm tra lại + hiện menu mới (lặp đến khi bạn thoát).
//
// Các nhóm (theo thứ tự ưu tiên client cần):
//   - pron          Phát âm từ điển (pronunciations)
//   - curriculum    Câu + ví dụ giáo trình nền tảng (/learn)
//   - cefr          Ví dụ ngữ pháp CEFR (Roadmap)
//   - lessons-early Hội thoại 50 bài đầu (Luyện nói)
//   - patterns      Câu mẫu trang Cụm từ
//   - lessons-rest  Hội thoại các bài còn lại
//
// Cờ / biến môi trường:
//   --check (CHECK=1)        Chỉ in báo cáo rồi thoát (không seed, không menu).
//   --all   (SEED_ALL=1/YES=1) Seed tất cả ngay, không hỏi menu (dùng cho CI/cron).
//   --force (FORCE=1)        Tạo lại + ghi đè cả audio đã có.
//   LIMIT=20                 Giới hạn số tác vụ mỗi nhóm (debug).
//   WORDS_FILE=...           Đọc danh sách từ cần phát âm từ file (retry lỗi).
//
// Chạy: npm run seed:all   ·   Chỉ xem báo cáo: npm run seed:all -- --check

import * as crypto from 'node:crypto'
import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { generateAudioFromGoogle, VOICE_IDS, VOICE_VERSION, type Lang, type VoiceId } from '../api/_lib/googleTts.ts'
import { CEFR_LEVELS } from '../src/data/cefr.ts'
import { encryptAudio, decryptAudio } from '../api/_lib/ttsCrypto.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'
import { FOUNDATION } from '../src/data/curriculum.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
// Pronunciations chỉ cần 2 giọng cơ bản — female2/male2 chỉ dùng cho TTS hội thoại
const PRON_VOICE_IDS: VoiceId[] = ['female', 'male']

const BATCH_SIZE      = 50    // số tác vụ song song
const DELAY_MS        = 0     // không cần delay
const RETRY_DELAY_MS  = 5000  // nghỉ giữa vòng retry
const MAX_ROUNDS      = 100
// Rate limit thích nghi — tự điều chỉnh theo lượng req thực của window trước:
//   429 xuất hiện  → nghỉ 60s, limit 180
//   req >= 180     → nghỉ 60s, limit 180
//   req < 180      → chạy liên tục (không nghỉ)
const RATE_LIMIT_DEFAULT = 180  // limit mặc định khi bắt đầu
const BASE_URL        = process.env.BASE_URL || ''
const FORCE           = process.argv.includes('--force') || process.env.FORCE === '1'
const CHECK_ONLY      = process.argv.includes('--check') || process.env.CHECK === '1'
const SEED_ALL_FLAG   = process.argv.includes('--all') || process.env.SEED_ALL === '1' || process.env.YES === '1'

const PRON_ERRORS_FILE    = path.join(PROJECT_ROOT, 'scripts/seed-errors.json')
const PATTERN_ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/prefetch-tts-errors.json')

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// ── Nhóm (category) ─────────────────────────────────────────────────────────
type CatId = 'pron' | 'curriculum' | 'cefr' | 'lessons-early' | 'patterns' | 'lessons-rest'

const CATEGORIES: { id: CatId; label: string }[] = [
  { id: 'pron',          label: 'Phát âm từ điển (pronunciations)' },
  { id: 'curriculum',    label: 'Câu + ví dụ giáo trình nền tảng (/learn)' },
  { id: 'cefr',          label: 'Ví dụ ngữ pháp CEFR (Roadmap)' },
  { id: 'lessons-early', label: 'Hội thoại 50 bài đầu (Luyện nói)' },
  { id: 'patterns',      label: 'Câu mẫu trang Cụm từ' },
  { id: 'lessons-rest',  label: 'Hội thoại các bài còn lại' },
]

// ── Kiểu dữ liệu ────────────────────────────────────────────────────────────
interface PronTask    { type: 'pron';    cat: 'pron'; word: string; voice: VoiceId }
interface PatternTask { type: 'pattern'; cat: CatId;  text: string; lang: Lang; voice: VoiceId }
type AnyTask = PronTask | PatternTask

// Tách thành các nhánh literal riêng để TypeScript narrow đúng về nhánh 'error'
// (gộp 'ok'|'skip'|'remapped' vào 1 nhánh khiến else không suy ra được .message).
type TaskResult =
  | { status: 'ok' }
  | { status: 'skip' }
  | { status: 'remapped' }
  | { status: 'error'; message: string }

// ── Hash cho pattern cache — phải khớp hoàn toàn với api/tts.ts ─────────────
// Hash đúng (mới): có VOICE_VERSION — dùng cho mọi entry mới
function hashText(text: string, lang: Lang, voice: VoiceId): string {
  return crypto.createHash('sha256').update(text + lang + voice + VOICE_VERSION).digest('hex').slice(0, 32)
}
// Hash cũ (sai): thiếu VOICE_VERSION — dùng để tìm entry đã seed trước đây
function oldHashText(text: string, lang: Lang, voice: VoiceId): string {
  return crypto.createHash('sha256').update(text + lang + voice).digest('hex').slice(0, 32)
}

// ── Load dữ liệu ────────────────────────────────────────────────────────────
interface Sentence { en: string; vi: string }
interface Subject   { starter: string; sentences: Sentence[] }

// Thứ tự ưu tiên seed TTS cache:
//   1. Curriculum sentences + examples  → /learn chạy ngay cho user đầu tiên
//   2. CEFR grammar examples            → Roadmap tab (/learn)
//   3. Lesson turns (50 bài đầu)        → Luyện nói beginner instant
//   4. Pattern sentences                → Cụm từ page
//   5. Lesson turns còn lại             → cache dần, ít urgent hơn
//
// Lesson turns: mỗi turn chỉ seed ĐÚNG 1 giọng (voiceA hoặc voiceB) thay vì cả 4.
// Giống logic Lessons.tsx — speakerAGender/speakerBGender quyết định giọng từng nhân vật,
// nếu cùng giới thì B dùng giọng variant2 (female2/male2) để phân biệt.
// Kết quả: ~5,900 tasks thay vì ~160,000 (giảm 96%).
function loadPatternTasks(): PatternTask[] {
  const tasks: PatternTask[] = []
  const seen  = new Set<string>()

  const add = (rawText: string, lang: Lang, cat: CatId) => {
    const text = rawText.trim()
    if (!text) return
    for (const voice of VOICE_IDS) {
      const key = `${text}|${lang}|${voice}`
      if (seen.has(key)) continue   // bỏ qua giọng đã thêm, KHÔNG return (return sẽ rớt các giọng còn lại)
      seen.add(key)
      tasks.push({ type: 'pattern', cat, text, lang, voice })
    }
  }

  // ── Ưu tiên 1: curriculum (câu thông dụng + ví dụ từng từ) ────────────────
  for (const circle of FOUNDATION) {
    for (const { en } of circle.sentences) add(en, 'en-US', 'curriculum')
    for (const entry of circle.words) {
      if (entry.ex_en) add(entry.ex_en, 'en-US', 'curriculum')
      if (entry.ex_vi) add(entry.ex_vi, 'vi-VN', 'curriculum')
    }
  }

  // ── Ưu tiên 2: CEFR grammar examples → Roadmap tab ────────────────────────
  for (const level of CEFR_LEVELS) {
    for (const unit of level.units) {
      for (const lesson of unit.grammar) {
        for (const { en, vi } of lesson.examples) {
          add(en, 'en-US', 'cefr')
          add(vi, 'vi-VN', 'cefr')
        }
      }
    }
  }

  // ── Ưu tiên 3 & 5: lesson turns — giọng đúng per nhân vật ─────────────────
  // Giống Lessons.tsx: voiceA = giới tính A; voiceB = variant2 nếu cùng giới, giọng kia nếu khác
  const lessonDir = path.join(PROJECT_ROOT, 'public/data/lessons')
  const lessonFiles = fs.readdirSync(lessonDir).filter((f) => /^chunk-\d+\.json$/.test(f)).sort()
  let lessonCount = 0
  const laterLessonTasks: PatternTask[] = []

  type LessonRaw = {
    speakerAGender?: 'female' | 'male' | null
    speakerBGender?: 'female' | 'male' | null
    turns?: Array<{ speaker: string; en: string; vi: string }>
  }

  for (const file of lessonFiles) {
    const chunks = JSON.parse(fs.readFileSync(path.join(lessonDir, file), 'utf8')) as LessonRaw[]
    for (const lesson of chunks) {
      const gA = lesson.speakerAGender ?? 'female'
      const gB = lesson.speakerBGender ?? 'male'
      const voiceA: VoiceId = gA === 'female' ? 'female' : 'male'
      const voiceB: VoiceId = gB === gA
        ? (gB === 'female' ? 'female2' : 'male2')
        : (gB === 'female' ? 'female' : 'male')

      const isEarly = lessonCount < 50
      const cat: CatId = isEarly ? 'lessons-early' : 'lessons-rest'
      const bucket = isEarly ? tasks : laterLessonTasks
      for (const turn of (lesson.turns ?? [])) {
        const voice = turn.speaker === 'A' ? voiceA : voiceB
        if (turn.en) {
          const text = turn.en.trim(); if (!text) continue
          const key = `${text}|en-US|${voice}`
          if (!seen.has(key)) { seen.add(key); bucket.push({ type: 'pattern', cat, text, lang: 'en-US', voice }) }
        }
        if (turn.vi) {
          const text = turn.vi.trim(); if (!text) continue
          const key = `${text}|vi-VN|${voice}`
          if (!seen.has(key)) { seen.add(key); bucket.push({ type: 'pattern', cat, text, lang: 'vi-VN', voice }) }
        }
      }
      lessonCount++
    }
  }

  // ── Ưu tiên 4: pattern sentences (Cụm từ page) ─────────────────────────────
  const patternDir = path.join(PROJECT_ROOT, 'public/data/patterns')
  const patternFiles = fs.readdirSync(patternDir).filter((f) => /^chunk-\d+\.json$/.test(f)).sort()
  for (const file of patternFiles) {
    const subjects = JSON.parse(fs.readFileSync(path.join(patternDir, file), 'utf8')) as Subject[]
    for (const subject of subjects) {
      for (const { en, vi } of subject.sentences) {
        add(en, 'en-US', 'patterns')
        add(vi, 'vi-VN', 'patterns')
      }
    }
  }

  // ── Ưu tiên 5: lesson turns còn lại ────────────────────────────────────────
  tasks.push(...laterLessonTasks)

  return tasks
}

function loadPronTasks(wordsFile?: string): PronTask[] {
  let words: string[]
  if (wordsFile) {
    // Retry từ file lỗi (seed-errors.json)
    const raw = JSON.parse(fs.readFileSync(wordsFile, 'utf-8')) as unknown[]
    words = raw.map((item) =>
      (typeof item === 'string' ? item : (item as { word: string }).word).toLowerCase(),
    )
  } else {
    // Đọc từ public/data/dictionary/chunk-*.json
    const dir = path.join(PROJECT_ROOT, 'public/data/dictionary')
    const files = fs.readdirSync(dir).filter((f) => /^chunk-\d+\.json$/.test(f)).sort()
    words = []
    for (const file of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as unknown[]
      for (const item of raw) {
        words.push((typeof item === 'string' ? item : (item as { word: string }).word).toLowerCase())
      }
    }
  }
  // Curriculum words lên đầu → /learn hoạt động instant cho mọi user mới
  const curriculumWords = new Set(
    FOUNDATION.flatMap((c) => c.words.map((w) => w.word.toLowerCase()))
  )
  const tasks: PronTask[] = []
  const seen = new Set<string>()
  for (const word of words) {
    // Pronunciations chỉ cần 2 giọng (female/male) — female2/male2 dành cho TTS hội thoại
    for (const voice of PRON_VOICE_IDS) {
      const key = `${word}:${voice}`
      if (seen.has(key)) continue
      seen.add(key)
      tasks.push({ type: 'pron', cat: 'pron', word, voice })
    }
  }
  tasks.sort((a, b) => {
    const aHigh = curriculumWords.has(a.word) ? 0 : 1
    const bHigh = curriculumWords.has(b.word) ? 0 : 1
    return aHigh - bHigh
  })
  return tasks
}

// ── Xử lý 1 tác vụ ──────────────────────────────────────────────────────────
async function processTask(task: AnyTask): Promise<TaskResult> {
  const supabase = getSupabaseAdmin()

  try {
    if (task.type === 'pron') {
      const { word, voice } = task
      const audioBuffer = await generateAudioFromGoogle(word, voice, 'en-US')
      const fileName    = `${word}-${voice}.mp3`
      const { error: uploadError } = await supabase.storage
        .from('pronunciations')
        .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
      if (uploadError) throw new Error(`Upload lỗi: ${uploadError.message}`)
      const { data: urlData } = supabase.storage.from('pronunciations').getPublicUrl(fileName)
      const { error: dbError } = await supabase
        .from('pronunciations')
        .upsert({ word, voice, audio_url: urlData.publicUrl, lang: 'en-US', voice_version: VOICE_VERSION }, { onConflict: 'word,voice' })
      if (dbError) throw new Error(`DB lỗi: ${dbError.message}`)
      return { status: 'ok' }
    }

    // pattern task
    const { text, lang, voice } = task
    const hash    = hashText(text, lang, voice)
    const oldHash = oldHashText(text, lang, voice)

    if (!FORCE) {
      const { data: cached } = await supabase
        .from('tts_cache').select('audio_url').eq('hash', hash).maybeSingle()
      if (cached) return { status: 'skip' }
    }

    // Trước khi gọi Google TTS: thử remap từ cache cũ (hash thiếu VOICE_VERSION).
    // Nếu có → tải về → giải mã bằng oldHash → re-encrypt bằng hash mới → upload.
    // Không tốn API quota, chỉ tốn băng thông Storage.
    if (!FORCE) {
      const { data: oldCached } = await supabase
        .from('tts_cache').select('audio_url').eq('hash', oldHash).maybeSingle()
      if (oldCached?.audio_url) {
        try {
          const res = await fetch(oldCached.audio_url)
          if (res.ok) {
            const plain     = await decryptAudio(await res.arrayBuffer(), oldHash)
            const newCipher = await encryptAudio(plain, hash)
            const fileName  = `${lang}/${voice}/${hash}.mp3`
            const audioUrl  = await saveAudio('tts-cache', fileName, newCipher, BASE_URL)
            const { error } = await supabase
              .from('tts_cache')
              .upsert({ hash, lang, voice, audio_url: audioUrl }, { onConflict: 'hash' })
            if (error) throw new Error(`DB lỗi: ${error.message}`)
            return { status: 'remapped' }
          }
        } catch {
          // Remap thất bại (file hỏng, mạng lỗi...) → tiếp tục generate mới bên dưới
        }
      }
    }

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

// Trạng thái rate limit thích nghi — dùng chung trong 1 pass
interface RateState {
  limit: number   // ngưỡng req hiện tại
  pauseMs: number // thời gian nghỉ hiện tại
  count: number   // đếm req trong window hiện tại
  has429: boolean // window hiện tại có gặp lỗi 429 không
}

function nextRateState(prevReqs: number, prev429: boolean): { limit: number; pauseMs: number } {
  if (prev429)          return { limit: 180, pauseMs: 62000 } // 429 → nghỉ 62s
  if (prevReqs >= 180)  return { limit: 180, pauseMs: 62000 } // đầy window → nghỉ 62s
  return                       { limit: 180, pauseMs: 0     } // chưa đầy → liên tục
}

// ── Chạy 1 batch tác vụ + cập nhật progress bar ─────────────────────────────
async function runBatch(
  tasks: AnyTask[],
  failed: Array<{ task: AnyTask; message: string }>,
  counters: { ok: number; remapped: number; skip: number; errors: number },
  bar: cliProgress.SingleBar,
  processed: { value: number },
  total: number,
  rate: RateState,
): Promise<void> {
  const results = await Promise.all(tasks.map((t) => processTask(t)))
  let newReqs = 0
  results.forEach((result, idx) => {
    if (result.status === 'ok')      { counters.ok++;      newReqs++ }  // gọi Google TTS → tính rate
    else if (result.status === 'remapped') counters.remapped++          // re-encrypt, không tốn API
    else if (result.status === 'skip')     counters.skip++
    else {
      counters.errors++; newReqs++
      if (result.message.includes('429')) rate.has429 = true
      failed.push({ task: tasks[idx], message: result.message })
    }
  })
  rate.count += newReqs
  processed.value = Math.min(processed.value + tasks.length, total)
  bar.update(processed.value, { ...counters })
  if (DELAY_MS > 0) await sleep(DELAY_MS)
  // Kiểm tra ngưỡng rate limit
  if (rate.count >= rate.limit) {
    const prevReqs = rate.count
    const prev429  = rate.has429
    const next = nextRateState(prevReqs, prev429)
    rate.count   = 0
    rate.has429  = false
    rate.limit   = next.limit
    rate.pauseMs = next.pauseMs
    bar.stop()
    process.stdout.write(`\n⏸  ${prevReqs} req${prev429 ? ' [429!]' : ''} → nghỉ ${next.pauseMs / 1000}s, limit tiếp=${next.limit}\n`)
    await sleep(next.pauseMs)
    bar.start(total, processed.value, { ...counters })
  }
}

// ── Chạy 1 pass trên 1 danh sách tác vụ (có thanh tiến độ) ───────────────────
async function runPass(
  tasks: AnyTask[],
  label: string,
): Promise<Array<{ task: AnyTask; message: string }>> {
  const total = tasks.length
  console.log(`\n${label} — ${total} tác vụ`)

  const bar = new cliProgress.SingleBar(
    {
      format: 'Tiến độ |{bar}| {percentage}% | {value}/{total} | ✓{ok} ↺{remapped} ⏭{skip} ✗{errors}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(total, 0, { ok: 0, remapped: 0, skip: 0, errors: 0 })

  const counters  = { ok: 0, remapped: 0, skip: 0, errors: 0 }
  const processed = { value: 0 }
  const rate: RateState = { limit: RATE_LIMIT_DEFAULT, pauseMs: 0, count: 0, has429: false }
  const failed: Array<{ task: AnyTask; message: string }> = []

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    await runBatch(tasks.slice(i, i + BATCH_SIZE), failed, counters, bar, processed, total, rate)
  }

  bar.stop()
  console.log(`   ✓ OK: ${counters.ok}  ↺ Remap: ${counters.remapped}  ⏭ Skip: ${counters.skip}  ✗ Lỗi: ${failed.length}`)
  return failed
}

// ── Seed 1 danh sách: pass đầu + các vòng retry cho tới khi hết/ngừng giảm ───
async function seedWithRetry(tasks: AnyTask[], baseLabel: string): Promise<AnyTask[]> {
  if (tasks.length === 0) return []
  let failed   = await runPass(tasks, `🟢 ${baseLabel} — Vòng 1`)
  let remaining = failed.map((f) => f.task)
  let prevErr   = Infinity

  for (let round = 2; round <= MAX_ROUNDS && remaining.length > 0; round++) {
    if (remaining.length >= prevErr) {
      console.log(`\n⛔ Lỗi không giảm (${remaining.length}) — dừng retry.`)
      break
    }
    prevErr = remaining.length
    console.log(`\n⏳ Nghỉ ${RETRY_DELAY_MS / 1000}s...`)
    await sleep(RETRY_DELAY_MS)
    failed    = await runPass(remaining, `🔄 ${baseLabel} — Vòng ${round} (còn ${remaining.length})`)
    remaining = failed.map((f) => f.task)
  }
  return remaining
}

// ── Đọc TẤT CẢ dòng 1 bảng (phân trang 1000 dòng/lần) ───────────────────────
// Supabase mặc định trả tối đa 1000 dòng/query → phải phân trang mới đếm đúng.
async function fetchAllRows<T>(table: string, columns: string): Promise<T[]> {
  const supabase = getSupabaseAdmin()
  const PAGE = 1000
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + PAGE - 1)
    if (error) throw new Error(`Đọc bảng ${table} lỗi: ${error.message}`)
    if (!data || data.length === 0) break
    out.push(...(data as T[]))
    if (data.length < PAGE) break
  }
  return out
}

// ── Kiểm tra DB → tính done/total/remaining cho từng nhóm ────────────────────
interface CatStat { id: CatId; label: string; total: number; done: number; remaining: AnyTask[] }

async function audit(allByCat: Map<CatId, AnyTask[]>): Promise<CatStat[]> {
  process.stdout.write('🔎 Đang kiểm tra DB (pronunciations + tts_cache)...')

  // Tập đã có trên DB
  const pronRows = await fetchAllRows<{ word: string; voice: string }>('pronunciations', 'word, voice')
  const donePron = new Set(pronRows.map((r) => `${r.word}:${r.voice}`))
  const ttsRows  = await fetchAllRows<{ hash: string }>('tts_cache', 'hash')
  const doneHash = new Set(ttsRows.map((r) => r.hash))

  process.stdout.write(` xong (${donePron.size} phát âm, ${doneHash.size} câu TTS)\n`)

  const isDone = (t: AnyTask): boolean =>
    t.type === 'pron'
      ? donePron.has(`${t.word}:${t.voice}`)
      : doneHash.has(hashText(t.text, t.lang, t.voice))

  const stats: CatStat[] = []
  for (const { id, label } of CATEGORIES) {
    const tasks = allByCat.get(id) ?? []
    const done  = tasks.reduce((n, t) => n + (isDone(t) ? 1 : 0), 0)
    // FORCE: seed lại tất cả; bình thường: chỉ seed tác vụ chưa có
    const remaining = FORCE ? tasks.slice() : tasks.filter((t) => !isDone(t))
    stats.push({ id, label, total: tasks.length, done, remaining })
  }
  return stats
}

// ── In báo cáo tiến độ ──────────────────────────────────────────────────────
function bar10(pct: number): string {
  const filled = Math.round((pct / 100) * 10)
  return '▓'.repeat(filled) + '░'.repeat(10 - filled)
}

function printReport(stats: CatStat[]): void {
  let grandTotal = 0, grandDone = 0
  const labelWidth = Math.max(...CATEGORIES.map((c) => c.label.length))

  console.log('\n📊 BÁO CÁO TIẾN ĐỘ SEED (sẵn sàng cho client)')
  console.log('─'.repeat(labelWidth + 34))
  for (const s of stats) {
    grandTotal += s.total
    grandDone  += s.done
    const pct = s.total === 0 ? 100 : (s.done / s.total) * 100
    const tag = s.total === 0 ? '∅' : pct >= 100 ? '✅' : '⏳'
    const counts = `${s.done}/${s.total}`.padStart(13)
    console.log(`  ${tag} ${s.label.padEnd(labelWidth)}  ${counts}  ${bar10(pct)} ${pct.toFixed(1).padStart(5)}%`)
  }
  console.log('─'.repeat(labelWidth + 34))
  const gPct = grandTotal === 0 ? 100 : (grandDone / grandTotal) * 100
  const gCounts = `${grandDone}/${grandTotal}`.padStart(13)
  console.log(`  📦 ${'TỔNG CỘNG'.padEnd(labelWidth)}  ${gCounts}  ${bar10(gPct)} ${gPct.toFixed(1).padStart(5)}%`)
  if (gPct >= 100) console.log('\n🎉 Tất cả đã seed xong — client dùng được ngay, không cần gọi TTS realtime.')
  else             console.log(`\nℹ️  Còn ${(grandTotal - grandDone).toLocaleString('vi-VN')} tác vụ chưa seed.`)
}

// ── Ghi/xóa file lỗi sau khi seed ───────────────────────────────────────────
function writeErrorFiles(remaining: AnyTask[]): void {
  const pronLeft    = remaining.filter((t): t is PronTask => t.type === 'pron')
  const patternLeft = remaining.filter((t): t is PatternTask => t.type === 'pattern')

  if (pronLeft.length > 0) {
    const words = [...new Set(pronLeft.map((t) => t.word))]
    fs.writeFileSync(PRON_ERRORS_FILE, JSON.stringify(words, null, 2))
    console.log(`⚠️  ${pronLeft.length} phát âm lỗi → scripts/seed-errors.json`)
  } else if (fs.existsSync(PRON_ERRORS_FILE)) fs.unlinkSync(PRON_ERRORS_FILE)

  if (patternLeft.length > 0) {
    const errors = patternLeft.map((t) => ({ text: t.text, lang: t.lang, voice: t.voice }))
    fs.writeFileSync(PATTERN_ERRORS_FILE, JSON.stringify(errors, null, 2))
    console.log(`⚠️  ${patternLeft.length} câu TTS lỗi → scripts/prefetch-tts-errors.json`)
  } else if (fs.existsSync(PATTERN_ERRORS_FILE)) fs.unlinkSync(PATTERN_ERRORS_FILE)
}

// ── Seed nhiều nhóm rồi báo kết quả ─────────────────────────────────────────
async function seedCategories(stats: CatStat[], picked: CatId[]): Promise<void> {
  const tasks = picked.flatMap((id) => stats.find((s) => s.id === id)?.remaining ?? [])
  if (tasks.length === 0) {
    console.log('\n✅ Các nhóm đã chọn không còn gì để seed.')
    return
  }
  const label = picked.length === CATEGORIES.length
    ? 'Seed TẤT CẢ'
    : `Seed ${picked.map((id) => CATEGORIES.find((c) => c.id === id)?.label).join(' + ')}`
  console.log(`\n🚀 ${label} — ${tasks.length} tác vụ${FORCE ? ' (FORCE: ghi đè)' : ''}`)
  const remaining = await seedWithRetry(tasks, label)
  writeErrorFiles(remaining)
  if (remaining.length === 0) console.log('\n🎉 Hoàn thành — không còn lỗi.')
  else                        console.log(`\n⚠️  Còn ${remaining.length} tác vụ chưa xong (xem file lỗi ở trên).`)
}

// ── Menu tương tác ──────────────────────────────────────────────────────────
async function interactiveMenu(allByCat: Map<CatId, AnyTask[]>): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    for (;;) {
      const stats = await audit(allByCat)
      printReport(stats)

      const pending = stats.filter((s) => s.remaining.length > 0)
      if (pending.length === 0 && !FORCE) {
        console.log('\n✨ Mọi nhóm đã seed đủ. Thoát.')
        return
      }

      console.log('\n── Chọn việc tiếp theo ──')
      stats.forEach((s, i) => {
        const left = s.remaining.length
        const mark = left === 0 ? '✔ đã đủ' : `còn ${left.toLocaleString('vi-VN')}`
        console.log(`  ${i + 1}) ${s.label}  (${mark})`)
      })
      console.log('  a) Seed TẤT CẢ nhóm còn thiếu')
      console.log('  r) Làm mới báo cáo')
      console.log('  q) Thoát')

      const ans = (await rl.question('\nNhập lựa chọn (số / a / r / q): ')).trim().toLowerCase()

      if (ans === 'q' || ans === '') { console.log('👋 Thoát.'); return }
      if (ans === 'r') continue
      if (ans === 'a') {
        await seedCategories(stats, CATEGORIES.map((c) => c.id))
        continue
      }
      const n = parseInt(ans, 10)
      if (Number.isInteger(n) && n >= 1 && n <= stats.length) {
        await seedCategories(stats, [stats[n - 1].id])
      } else {
        console.log('❓ Lựa chọn không hợp lệ.')
      }
    }
  } finally {
    rl.close()
  }
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

  // Gom toàn bộ tác vụ theo nhóm (LIMIT cắt bớt mỗi nhóm khi debug)
  const allByCat = new Map<CatId, AnyTask[]>()
  for (const { id } of CATEGORIES) allByCat.set(id, [])
  allByCat.set('pron', loadPronTasks(wordsFile).slice(0, limit))
  for (const t of loadPatternTasks()) allByCat.get(t.cat)!.push(t)
  if (Number.isFinite(limit)) {
    for (const { id } of CATEGORIES) {
      if (id === 'pron') continue
      allByCat.set(id, allByCat.get(id)!.slice(0, limit))
    }
  }

  // ── Chế độ chỉ xem báo cáo ────────────────────────────────────────────────
  if (CHECK_ONLY) {
    printReport(await audit(allByCat))
    return
  }

  // ── Chế độ seed tất cả không hỏi (CI/cron) ────────────────────────────────
  if (SEED_ALL_FLAG) {
    const stats = await audit(allByCat)
    printReport(stats)
    await seedCategories(stats, CATEGORIES.map((c) => c.id))
    // In lại báo cáo cuối để biết đã 100% chưa
    printReport(await audit(allByCat))
    return
  }

  // ── Không có TTY (không gõ được) mà không kèm cờ → in báo cáo + hướng dẫn ──
  if (!process.stdin.isTTY) {
    printReport(await audit(allByCat))
    console.log('\nℹ️  Không có bàn phím tương tác. Chạy `npm run seed:all -- --all` để seed hết,')
    console.log('   hoặc `npm run seed:all -- --check` để chỉ xem báo cáo.')
    return
  }

  // ── Mặc định: menu tương tác ──────────────────────────────────────────────
  console.log('🔊 seed:all — báo cáo tiến độ + chọn việc (phát âm + TTS câu)')
  await interactiveMenu(allByCat)
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
