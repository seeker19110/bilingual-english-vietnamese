// scripts/seed-pronunciations.ts
// Script chạy 1 LẦN trên máy local để tạo trước (bulk) audio phát âm cho cả danh sách từ,
// thay vì để người dùng app phải chờ TTS ở lần tra từ đầu tiên.
//
// Mặc định đọc toàn bộ từ điển từ public/data/dictionary/chunk-*.json
// Có thể đổi nguồn từ bằng biến môi trường WORDS_FILE (file JSON) hoặc DICT_DIR (thư mục chunk),
// ví dụ retry các từ bị lỗi:
//   WORDS_FILE=scripts/seed-errors.json npm run seed:pronunciation
//
// Tạo CẢ 2 giọng (nữ + nam — xem api/_lib/googleTts.ts) cho mỗi từ, vì app cho học viên
// chọn giọng khi nghe phát âm (PronounceButton.tsx). Vậy tổng số lần gọi TTS = số từ × 2.
//
// Logic gọi Google TTS + lưu file/DB được TÁI DÙNG từ api/_lib/ (cùng 1 chỗ với
// api/pronunciation.ts) để không phải viết/duy trì 2 bản giống nhau — sửa 1 nơi là cả
// app + script đều theo. BASE_URL=https://... khi STORAGE_DRIVER=local (mặc định lưu
// đường dẫn tương đối /uploads/... nếu không đặt).
//
// Chạy: npm run seed:pronunciation

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import {
  generateAudioFromGoogle,
  hasGoogleTtsKey,
  probeApiKeys,
  setActiveKeyPool,
  VOICE_VERSION,
  DEFAULT_SEED_VOICE_IDS,
  type VoiceId,
} from '../api/_lib/googleTts.ts'
import { getPgPool } from '../api/_lib/pgPool.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'

// Thư mục gốc của project (1 cấp trên thư mục scripts/), để mọi đường dẫn file
// đều đúng dù bạn chạy lệnh từ đâu.
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Nạp file .env ở gốc project (cùng file api/pronunciation.ts dùng khi deploy) —
// KHÔNG dùng .env.local như bản spec gốc, để chỉ cần quản lý đúng 1 file .env duy nhất.
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ─────────────────────────────────────────────────────────
const BATCH_SIZE = 15 // số tác vụ song song — Google TTS cho phép ~100 req/s
const DELAY_MS = 0 // không cần nghỉ giữa batch với BATCH_SIZE vừa phải
const RETRY_DELAY_MS = 5000 // nghỉ giữa các vòng retry (ms) để tránh rate-limit tạm thời
const MAX_ROUNDS = 5 // số vòng retry tối đa

// Pronunciations chỉ seed trước 8 giọng mặc định (4 nữ + 4 nam phổ biến nhất) trong số 14
// giọng hiện có (xem api/_lib/googleTts.ts) — 6 giọng còn lại tự tạo lúc người dùng chủ động
// chọn, không seed trước.
const PRON_VOICE_IDS: VoiceId[] = DEFAULT_SEED_VOICE_IDS

// Thư mục chứa chunk từ điển — đây là nguồn mặc định
const DEFAULT_DICT_DIR = path.join(PROJECT_ROOT, 'public/data/dictionary')
const ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/seed-errors.json')
const BASE_URL = process.env.BASE_URL || ''

// 1 tác vụ = tạo audio cho 1 (từ, giọng) cụ thể.
interface Task {
  word: string
  voice: VoiceId
}

// ── Đọc danh sách từ: từ 1 file JSON hoặc cả thư mục chunk-*.json ───────────
// WORDS_FILE=path/to/file.json → đọc file đó (dùng để retry từ seed-errors.json)
// Mặc định (không có WORDS_FILE) → đọc tất cả public/data/dictionary/chunk-*.json
function loadWords(fileOrDir: string): string[] {
  const stat = fs.statSync(fileOrDir)
  if (stat.isDirectory()) {
    const files = fs
      .readdirSync(fileOrDir)
      .filter((f) => /^chunk-\d+\.json$/.test(f))
      .sort()
    const words: string[] = []
    for (const file of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(fileOrDir, file), 'utf-8')) as unknown[]
      words.push(
        ...raw.map((item) => (typeof item === 'string' ? item : (item as { word: string }).word)),
      )
    }
    return words
  }
  // File đơn (vd. seed-errors.json)
  const raw = JSON.parse(fs.readFileSync(fileOrDir, 'utf-8')) as unknown
  if (!Array.isArray(raw)) throw new Error(`File ${fileOrDir} phải là 1 mảng JSON`)
  return raw.map((item) => (typeof item === 'string' ? item : (item as { word: string }).word))
}

// ── Xử lý 1 tác vụ (1 từ + 1 giọng): TTS → Upload Storage → Lưu DB ─────────
async function processTask(
  task: Task,
): Promise<{ status: 'ok' } | { status: 'error'; message: string }> {
  try {
    const { word, voice } = task
    const audioBuffer = await generateAudioFromGoogle(word, voice)
    // encodeURIComponent — GIỐNG HỆT api/pronunciation.ts (API thật) — để hỗ trợ từ
    // có dấu (café, naïve...) trong URL, dù key trong tên file thô vẫn hợp lệ với R2/local.
    const fileName = `${encodeURIComponent(word)}-${voice}.mp3`

    const audioUrl = await saveAudio('pronunciations', fileName, audioBuffer, BASE_URL)

    // upsert theo (word, voice) — script chạy lại an toàn (không lỗi khi 1 từ đã
    // upload xong nhưng chưa kịp lưu DB ở lần chạy trước).
    await getPgPool().query(
      `insert into public.pronunciations (word, voice, audio_url, lang, voice_version, last_accessed_at)
       values ($1, $2, $3, 'en-US', $4, now())
       on conflict (word, voice, lang) do update set
         audio_url = excluded.audio_url, voice_version = excluded.voice_version,
         last_accessed_at = now()`,
      [word, voice, audioUrl, VOICE_VERSION],
    )

    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) }
  }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

// Chạy 1 vòng xử lý, trả về danh sách tác vụ còn lỗi
async function runPass(
  tasks: Task[],
  label: string,
): Promise<Array<{ task: Task; message: string }>> {
  console.log(`\n${label} — ${tasks.length} tác vụ`)

  const bar = new cliProgress.SingleBar(
    {
      format: 'Tiến độ |{bar}| {percentage}% | {value}/{total} | ✓{ok} ✗{errors}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(tasks.length, 0, { ok: 0, errors: 0 })

  let countOk = 0,
    countError = 0
  const failed: Array<{ task: Task; message: string }> = []

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map((t) => processTask(t)))

    results.forEach((result, idx) => {
      if (result.status === 'ok') countOk++
      else {
        countError++
        failed.push({ task: batch[idx]!, message: result.message }) // idx khớp batch nên có
      }
    })

    bar.update(Math.min(i + BATCH_SIZE, tasks.length), { ok: countOk, errors: countError })

    if (DELAY_MS > 0 && i + BATCH_SIZE < tasks.length) await sleep(DELAY_MS)
  }

  bar.stop()
  console.log(`   ✓ Thành công: ${countOk}  ✗ Lỗi: ${countError}`)

  return failed
}

// ── MAIN ──────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const missing = ['DATABASE_URL'].filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường trong .env: ${missing.join(', ')}`)
    process.exit(1)
  }
  if (!hasGoogleTtsKey()) {
    console.error(
      '❌ Thiếu biến môi trường trong .env: GOOGLE_TTS_API_KEY hoặc GOOGLE_TTS_API_KEYS',
    )
    process.exit(1)
  }

  // Probe trước: chỉ xoay vòng qua key CÒN DÙNG ĐƯỢC lúc này (quota có thể đã cạn từ
  // lần seed trước trong ngày) — tránh phí hàng loạt request 429 vào key đã cạn.
  console.log('🔑 Kiểm tra key TTS còn dùng được...')
  const { working, total } = await probeApiKeys()
  if (working.length === 0) {
    console.error(
      '❌ Không key GOOGLE_TTS nào dùng được lúc này (có thể tất cả đã hết quota) — thử lại sau.',
    )
    process.exit(1)
  }
  setActiveKeyPool(working)
  console.log(
    working.length === total.length
      ? `   ✓ ${working.length}/${total.length} key dùng được — xoay vòng đủ cả bể.`
      : `   ⚠️  ${working.length}/${total.length} key dùng được — ${total.length - working.length} key đã cạn quota, tạm loại khỏi vòng xoay lượt chạy này.`,
  )

  const wordsSource = process.env.WORDS_FILE
    ? path.resolve(PROJECT_ROOT, process.env.WORDS_FILE)
    : DEFAULT_DICT_DIR
  const allWords = loadWords(wordsSource)

  console.log('🚀 Bắt đầu seed phát âm từ điển')
  console.log(`📋 Nguồn từ : ${path.relative(PROJECT_ROOT, wordsSource)}`)
  console.log(
    `📋 Tổng từ  : ${allWords.length} × ${PRON_VOICE_IDS.length} giọng (${PRON_VOICE_IDS.join(', ')})`,
  )
  console.log(
    `⚙️  Batch: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms | Retry delay: ${RETRY_DELAY_MS}ms | Max rounds: ${MAX_ROUNDS}`,
  )

  // Lấy danh sách (từ, giọng) đã có trong DB — bỏ qua để resume được nếu bị dừng giữa chừng
  const { rows: existing } = await getPgPool().query<{ word: string; voice: string }>(
    'select word, voice from public.pronunciations',
  )
  const done = new Set(existing.map((r) => `${r.word}:${r.voice}`))

  const allTasks: Task[] = []
  for (const w of allWords) {
    for (const voice of PRON_VOICE_IDS) {
      allTasks.push({ word: w.toLowerCase(), voice })
    }
  }

  // Giới hạn số tác vụ nếu chạy debug (LIMIT=10 npm run seed:pronunciation)
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
  const todo = allTasks.filter((t) => !done.has(`${t.word}:${t.voice}`)).slice(0, limit)

  console.log(`\n✅ Đã có  : ${done.size} (từ × giọng)`)
  console.log(`⏳ Cần tạo: ${todo.length} (từ × giọng)`)

  if (todo.length === 0) {
    console.log('\n🎉 Tất cả đã được cache rồi!')
    return
  }

  // ── Vòng lặp: lặp cho đến khi hết lỗi hoặc đạt MAX_ROUNDS ───────────────
  let remaining: Array<{ task: Task; message: string }> = []
  let previousErrorCount = Infinity

  remaining = await runPass(todo, '🟢 Vòng 1 — Xử lý toàn bộ')

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

  // ── Kết quả cuối ────────────────────────────────────────────────
  if (remaining.length === 0) {
    console.log('\n🎉 Hoàn thành 100%! Toàn bộ từ đã được cache.')
    if (fs.existsSync(ERRORS_FILE)) fs.unlinkSync(ERRORS_FILE)
  } else {
    fs.writeFileSync(
      ERRORS_FILE,
      JSON.stringify(
        remaining.map((r) => r.task.word),
        null,
        2,
      ),
    )
    console.log(`\n⚠️  Còn ${remaining.length} tác vụ không thể cache sau ${MAX_ROUNDS} vòng.`)
    console.log(`   Retry thủ công: WORDS_FILE=scripts/seed-errors.json npm run seed:pronunciation`)
    const sample = remaining[0]! // nhánh else nên remaining.length>0, chắc chắn có
    console.log(`   Lỗi mẫu: ${sample.task.word} (${sample.task.voice}) — ${sample.message}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi không mong đợi:', err)
  process.exit(1)
})
