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
//   --check  (CHECK=1)       Chỉ in báo cáo rồi thoát (không seed, không menu).
//   --verify (VERIFY=1)      Kiểm tra KỸ DB: đối chiếu 2 chiều (thiếu / thừa / lệch đường dẫn).
//   --all    (SEED_ALL=1/YES=1) Seed tất cả ngay, không hỏi menu (dùng cho CI/cron).
//   --force  (FORCE=1)       Tạo lại + ghi đè cả audio đã có.
//   LIMIT=20                 Giới hạn số tác vụ mỗi nhóm (debug).
//   VERIFY_DECRYPT=20        (kèm --verify) Tải + giải mã thử 20 file để chắc dùng được.
//   WORDS_FILE=...           Đọc danh sách từ cần phát âm từ file (retry lỗi).
//
// Chạy: npm run seed:all   ·   Xem báo cáo: npm run seed:all -- --check   ·   Kiểm tra kỹ: npm run seed:all -- --verify
//
// 📖 Hướng dẫn chi tiết (báo cáo / remap / verify): docs/seed-guide.md

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
import { loadSubjectsInDisplayOrder, PREF_VOICE_IDS } from './_lib/patternOrder.ts'

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
const VERIFY_ONLY     = process.argv.includes('--verify') || process.env.VERIFY === '1'
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

  // voices: cho phép giới hạn giọng theo nhóm (vd. patterns chỉ cần female/male).
  const add = (rawText: string, lang: Lang, cat: CatId, voices: readonly VoiceId[] = VOICE_IDS) => {
    const text = rawText.trim()
    if (!text) return
    for (const voice of voices) {
      const key = `${text}|${lang}|${voice}`
      if (seen.has(key)) continue   // bỏ qua giọng đã thêm, KHÔNG return (return sẽ rớt các giọng còn lại)
      seen.add(key)
      tasks.push({ type: 'pattern', cat, text, lang, voice })
    }
  }

  // ── Ưu tiên 1: curriculum (câu thông dụng + ví dụ từng từ) ────────────────
  // Phát qua KaraokeText/getVoicePref → chỉ 2 giọng female/male (xem PREF_VOICE_IDS).
  for (const circle of FOUNDATION) {
    for (const { en } of circle.sentences) add(en, 'en-US', 'curriculum', PREF_VOICE_IDS)
    for (const entry of circle.words) {
      if (entry.ex_en) add(entry.ex_en, 'en-US', 'curriculum', PREF_VOICE_IDS)
      if (entry.ex_vi) add(entry.ex_vi, 'vi-VN', 'curriculum', PREF_VOICE_IDS)
    }
  }

  // ── Ưu tiên 2: CEFR grammar examples → Roadmap tab ────────────────────────
  // Cũng phát qua KaraokeText/getVoicePref → chỉ 2 giọng female/male.
  for (const level of CEFR_LEVELS) {
    for (const unit of level.units) {
      for (const lesson of unit.grammar) {
        for (const { en, vi } of lesson.examples) {
          add(en, 'en-US', 'cefr', PREF_VOICE_IDS)
          add(vi, 'vi-VN', 'cefr', PREF_VOICE_IDS)
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

  // ── Ưu tiên 4: pattern sentences (Cụm từ page) — PHỔ BIẾN NHẤT TRƯỚC ────────
  // Hai điều chỉnh để seed đúng cái app thật sự dùng, trước tiên:
  //   • Chỉ 2 giọng female/male (PREF_VOICE_IDS): trang Cụm từ không bao giờ phát
  //     female2/male2 → bỏ đi giảm một nửa tác vụ, không ảnh hưởng người dùng.
  //   • Thứ tự hiển thị (loadSubjectsInDisplayOrder): I am, You are, We are, He is...
  //     lên trước; chủ thể hiếm seed sau → nếu seed dở dang vẫn có sẵn câu hay gặp nhất.
  const patternDir = path.join(PROJECT_ROOT, 'public/data/patterns')
  for (const subject of loadSubjectsInDisplayOrder(patternDir)) {
    for (const { en, vi } of subject.sentences) {
      add(en, 'en-US', 'patterns', PREF_VOICE_IDS)
      add(vi, 'vi-VN', 'patterns', PREF_VOICE_IDS)
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

// ── Đọc TẤT CẢ dòng 1 bảng (phân trang ỔN ĐỊNH theo khóa) ───────────────────
// Supabase mặc định trả tối đa 1000 dòng/query → phải phân trang mới đếm đúng.
//
// ⚠️ LỖI "số liệu nhảy loạn xạ": nếu phân trang bằng `.range()` mà KHÔNG kèm
// ORDER BY thì Postgres/PostgREST KHÔNG đảm bảo thứ tự dòng giống nhau giữa các
// trang. Với hàng trăm nghìn dòng (tts_cache 300k+ → 300+ trang) các trang bị
// CHỒNG/LỌT dòng ngẫu nhiên → số dòng gom vào Set đổi mỗi lần chạy → báo cáo
// (và --verify) nhảy số.
//
// Cách sửa: LUÔN sắp xếp theo một bộ cột tạo KHÓA DUY NHẤT (orderCols):
//   • tts_cache       → ['hash']          (primary key)
//   • pronunciations  → ['word','voice']  (unique (word,voice))
// Thứ tự TỔNG + ổn định → phân trang không lọt/trùng → đếm chuẩn, lặp lại y hệt.
async function fetchAllRows<T>(table: string, columns: string, orderCols: string[]): Promise<T[]> {
  const supabase = getSupabaseAdmin()
  const PAGE = 1000
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    // Áp ORDER BY cho từng cột khóa rồi mới phân trang (range = limit/offset).
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

// ── Kiểm tra DB → tính done/total/remaining cho từng nhóm ────────────────────
interface CatStat { id: CatId; label: string; total: number; done: number; remaining: AnyTask[] }

async function audit(allByCat: Map<CatId, AnyTask[]>): Promise<CatStat[]> {
  process.stdout.write('🔎 Đang kiểm tra DB (pronunciations + tts_cache)...')

  // Tập đã có trên DB
  const pronRows = await fetchAllRows<{ word: string; voice: string }>('pronunciations', 'word, voice', ['word', 'voice'])
  const donePron = new Set(pronRows.map((r) => `${r.word}:${r.voice}`))
  const ttsRows  = await fetchAllRows<{ hash: string }>('tts_cache', 'hash', ['hash'])
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

// ── KIỂM TRA KỸ DB: đối chiếu dữ liệu đã seed với tập KỲ VỌNG ────────────────
// Khác `audit()` (chỉ đếm có/thiếu). Hàm này đối chiếu HAI CHIỀU vì đã seed rất nhiều:
//   • Chiều thiếu : câu kỳ vọng nào CHƯA có trong DB (theo nhóm).
//   • Chiều thừa  : bản ghi nào trong DB KHÔNG còn nằm trong tập kỳ vọng
//                   (vd. female2/male2 của Cụm từ đã bỏ, hoặc VOICE_VERSION cũ) → "orphan".
//   • Nhất quán   : audio_url có đúng dạng `${lang}/${voice}/${hash}.mp3` không.
//   • (tùy chọn)  : VERIFY_DECRYPT=N → tải + giải mã thử N file để chắc dùng được thật.
async function verifyDb(allByCat: Map<CatId, AnyTask[]>): Promise<void> {
  console.log('\n🔬 KIỂM TRA KỸ DB — đối chiếu hash kỳ vọng với dữ liệu đã seed')

  // 1) Tập KỲ VỌNG: hash TTS (kèm VOICE_VERSION) + key phát âm
  const expectedTts  = new Set<string>()           // hash câu TTS kỳ vọng
  const expectedPron = new Set<string>()           // `word:voice` phát âm kỳ vọng
  for (const { id } of CATEGORIES) {
    for (const t of allByCat.get(id) ?? []) {
      if (t.type === 'pron') expectedPron.add(`${t.word}:${t.voice}`)
      else                   expectedTts.add(hashText(t.text, t.lang, t.voice))
    }
  }

  // 2) Đọc DB (phân trang đầy đủ)
  process.stdout.write('   Đang đọc DB...')
  const ttsRows  = await fetchAllRows<{ hash: string; lang: string; voice: string; audio_url: string }>(
    'tts_cache', 'hash, lang, voice, audio_url', ['hash'])
  const pronRows = await fetchAllRows<{ word: string; voice: string; audio_url: string }>(
    'pronunciations', 'word, voice, audio_url', ['word', 'voice'])
  const dbHash = new Set(ttsRows.map((r) => r.hash))
  console.log(` xong (${ttsRows.length} câu TTS, ${pronRows.length} phát âm)`)

  // 3) Chiều THIẾU — theo nhóm
  const labelWidth = Math.max(...CATEGORIES.map((c) => c.label.length))
  console.log('\n📋 Câu kỳ vọng đã có trong DB chưa (theo nhóm):')
  let totalMissing = 0
  for (const { id, label } of CATEGORIES) {
    if (id === 'pron') continue
    const tasks = (allByCat.get(id) ?? []).filter((t): t is PatternTask => t.type === 'pattern')
    let present = 0, missing = 0
    for (const t of tasks) (dbHash.has(hashText(t.text, t.lang, t.voice)) ? present++ : missing++)
    totalMissing += missing
    const tag = tasks.length === 0 ? '∅' : missing === 0 ? '✅' : '⚠️'
    console.log(`  ${tag} ${label.padEnd(labelWidth)}  có ${present}/${tasks.length}  thiếu ${missing}`)
  }
  // phát âm
  let pronPresent = 0
  for (const r of pronRows) if (expectedPron.has(`${r.word}:${r.voice}`)) pronPresent++
  console.log(`  ${pronPresent === expectedPron.size ? '✅' : '⚠️'} ${'Phát âm (pron)'.padEnd(labelWidth)}  có ${pronPresent}/${expectedPron.size}  thiếu ${expectedPron.size - pronPresent}`)

  // 4) Chiều THỪA — orphan (DB có nhưng không còn kỳ vọng)
  const orphans = ttsRows.filter((r) => !expectedTts.has(r.hash))
  const orphanByVoice = new Map<string, number>()
  for (const r of orphans) {
    const k = `${r.lang}/${r.voice}`
    orphanByVoice.set(k, (orphanByVoice.get(k) ?? 0) + 1)
  }
  console.log(`\n🧹 Bản ghi tts_cache KHÔNG còn trong tập kỳ vọng: ${orphans.length}/${ttsRows.length}`)
  if (orphans.length > 0) {
    for (const [k, n] of [...orphanByVoice.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`     • ${k}: ${n}`)
    }
    console.log('     (thường là female2/male2 đã bỏ ở curriculum/cefr/Cụm từ, hoặc VOICE_VERSION cũ — có thể xóa cho gọn)')
  }

  // 5) Nhất quán đường dẫn: audio_url phải chứa `${lang}/${voice}/${hash}.mp3`
  let pathBad = 0
  const badSample: string[] = []
  for (const r of ttsRows) {
    if (!r.audio_url || !r.audio_url.includes(`${r.lang}/${r.voice}/${r.hash}.mp3`)) {
      pathBad++
      if (badSample.length < 5) badSample.push(r.hash)
    }
  }
  console.log(`\n🔗 audio_url khớp lang/voice/hash: ${ttsRows.length - pathBad}/${ttsRows.length}` +
    (pathBad ? `  (✗ ${pathBad} lệch, vd: ${badSample.join(', ')})` : ' ✅'))

  // 6) (tùy chọn) Giải mã thử N file để chắc dùng được — VERIFY_DECRYPT=20
  const sampleN = process.env.VERIFY_DECRYPT ? parseInt(process.env.VERIFY_DECRYPT, 10) : 0
  if (sampleN > 0) {
    // ⚠️ Ở STORAGE_DRIVER=local, audio_url thường là đường dẫn TƯƠNG ĐỐI
    // ('/uploads/...') khi seed/generate không đặt BASE_URL. Node `fetch` KHÔNG
    // nhận URL tương đối → phải ghép base, nếu không sẽ fail HẾT ngay ở bước tải
    // (chưa tới giải mã). Base lấy theo: VERIFY_BASE_URL > BASE_URL > VITE_SITE_URL.
    const verifyBase = (process.env.VERIFY_BASE_URL || process.env.BASE_URL || process.env.VITE_SITE_URL || '')
      .trim().replace(/\/$/, '')
    const toAbsolute = (u: string): string =>
      /^https?:\/\//i.test(u) ? u : verifyBase ? `${verifyBase}${u.startsWith('/') ? '' : '/'}${u}` : u

    const pick = ttsRows.filter((r) => expectedTts.has(r.hash)).slice(0, sampleN)
    let okDec = 0
    const reasons = new Map<string, number>()        // gom LÝ DO fail để biết hỏng ở khâu nào
    const samples: string[] = []
    for (const r of pick) {
      try {
        const url = toAbsolute(r.audio_url)
        if (!/^https?:\/\//i.test(url)) throw new Error('URL_TƯƠNG_ĐỐI (đặt VERIFY_BASE_URL=https://...)')
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP_${res.status}`)
        const buf = await res.arrayBuffer()
        if (buf.byteLength < 32) throw new Error(`BODY_NGẮN_${buf.byteLength}B (có thể là trang lỗi, không phải audio)`)
        await decryptAudio(buf, r.hash)              // giải mã bằng khoá suy từ hash
        okDec++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const label = msg.split(/[:\n]/)[0].trim().slice(0, 40) || 'lỗi không rõ'  // gom theo nhãn đầu
        reasons.set(label, (reasons.get(label) ?? 0) + 1)
        if (samples.length < 3) samples.push(`${r.audio_url.slice(0, 70)} → ${msg.slice(0, 90)}`)
      }
    }
    const failDec = pick.length - okDec
    console.log(`\n🔓 Giải mã thử ${pick.length} file (mẫu): ✓ ${okDec}  ✗ ${failDec}`)
    if (failDec > 0) {
      for (const [k, n] of [...reasons.entries()].sort((a, b) => b[1] - a[1])) console.log(`     • ${k}: ${n}`)
      for (const s of samples) console.log(`     ↳ ${s}`)
      console.log('     Gợi ý: URL_TƯƠNG_ĐỐI / "Failed to parse URL" → đặt VERIFY_BASE_URL (vd domain production);')
      console.log('            HTTP_4xx/5xx → file chưa có trên Storage/Nginx; OperationError → sai master key hoặc file hỏng.')
    }
  }

  // 7) Kết luận
  console.log('─'.repeat(labelWidth + 30))
  if (totalMissing === 0 && pathBad === 0) {
    console.log('✅ DB KHỚP tập kỳ vọng: mọi câu cần thiết đã có, đường dẫn đúng.' +
      (orphans.length ? ` (còn ${orphans.length} bản ghi thừa có thể dọn)` : ''))
  } else {
    console.log(`⚠️  Chưa khớp: thiếu ${totalMissing} câu kỳ vọng` +
      (pathBad ? `, ${pathBad} đường dẫn lệch` : '') +
      `. Chạy \`npm run seed:all -- --all\` để bù.`)
  }
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

  // ── Chế độ kiểm tra kỹ DB (đối chiếu 2 chiều, không seed) ──────────────────
  if (VERIFY_ONLY) {
    await verifyDb(allByCat)
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
