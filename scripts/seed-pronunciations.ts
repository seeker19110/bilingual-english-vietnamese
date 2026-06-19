// scripts/seed-pronunciations.ts
// Script chạy 1 LẦN trên máy local để tạo trước (bulk) audio phát âm cho cả danh sách từ,
// thay vì để người dùng app phải chờ TTS ở lần tra từ đầu tiên.
//
// Mặc định lấy danh sách từ trong src/data/dictionary.json (từ điển đang dùng trong app —
// hiện có ~8800 từ). Có thể đổi nguồn từ bằng biến môi trường WORDS_FILE, ví dụ để retry
// các từ bị lỗi:
//   WORDS_FILE=scripts/seed-errors.json npm run seed:pronunciation
//
// Tạo CẢ 2 giọng (nữ + nam — xem api/_lib/googleTts.ts) cho mỗi từ, vì app cho học viên
// chọn giọng khi nghe phát âm (PronounceButton.tsx). Vậy tổng số lần gọi TTS = số từ × 2.
//
// Logic gọi Google TTS + Supabase được TÁI DÙNG từ api/_lib/ (cùng 1 chỗ với api/pronunciation.ts)
// để không phải viết/duy trì 2 bản giống nhau — sửa 1 nơi là cả app + script đều theo.
//
// Chạy: npm run seed:pronunciation

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { generateAudioFromGoogle, VOICE_IDS, type VoiceId } from '../api/_lib/googleTts.ts'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'

// Thư mục gốc của project (1 cấp trên thư mục scripts/), để mọi đường dẫn file
// đều đúng dù bạn chạy lệnh từ đâu.
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Nạp file .env ở gốc project (cùng file api/pronunciation.ts dùng khi deploy) —
// KHÔNG dùng .env.local như bản spec gốc, để chỉ cần quản lý đúng 1 file .env duy nhất.
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
const BATCH_SIZE = 5 // Số tác vụ (từ+giọng) xử lý song song cùng lúc — tăng lên nếu mạng ổn định
const DELAY_MS = 300 // Nghỉ giữa các batch để tránh bị Google TTS chặn vì gọi quá nhanh

const DEFAULT_WORDS_FILE = path.join(PROJECT_ROOT, 'src/data/dictionary.json')
const ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/seed-errors.json')

// 1 tác vụ = tạo audio cho 1 (từ, giọng) cụ thể.
interface Task {
  word: string
  voice: VoiceId
}

// ── Đọc danh sách từ cần seed ────────────────────────────────────────────────
// Hỗ trợ 2 dạng file JSON:
//   1. Mảng chuỗi:        ["apple", "banana", ...]   (ví dụ scripts/seed-errors.json)
//   2. Mảng object có .word: [{ "word": "apple", ... }, ...]  (dictionary.json đang dùng trong app)
function loadWords(filePath: string): string[] {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown
  if (!Array.isArray(raw)) {
    throw new Error(`File ${filePath} phải là 1 mảng JSON`)
  }
  return raw.map((item) => (typeof item === 'string' ? item : (item as { word: string }).word))
}

// ── Xử lý 1 tác vụ (1 từ + 1 giọng): TTS → Upload Storage → Lưu DB ─────────
async function processTask(task: Task): Promise<{ status: 'ok' } | { status: 'error'; message: string }> {
  try {
    const { word, voice } = task
    const supabase = getSupabaseAdmin()
    const audioBuffer = await generateAudioFromGoogle(word, voice)
    const fileName = `${word}-${voice}.mp3`

    // upsert: true — ghi đè nếu đã tồn tại, để script chạy lại an toàn (không lỗi
    // khi 1 từ đã được upload Storage nhưng chưa kịp lưu vào DB ở lần chạy trước).
    const { error: uploadError } = await supabase.storage
      .from('pronunciations')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
    if (uploadError) throw new Error(`Upload lỗi: ${uploadError.message}`)

    const { data: publicUrlData } = supabase.storage.from('pronunciations').getPublicUrl(fileName)

    const { error: dbError } = await supabase
      .from('pronunciations')
      .upsert(
        { word, voice, audio_url: publicUrlData.publicUrl, lang: 'en-US' },
        { onConflict: 'word,voice' },
      )
    if (dbError) throw new Error(`Lưu DB lỗi: ${dbError.message}`)

    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) }
  }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // Kiểm tra đủ biến môi trường trước — tránh chạy hàng nghìn từ rồi mới phát hiện thiếu key.
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_TTS_API_KEY'].filter(
    (key) => !process.env[key],
  )
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường trong .env: ${missing.join(', ')}`)
    console.error('   Xem hướng dẫn lấy key trong PRONUNCIATION_CACHE_SETUP.md')
    process.exit(1)
  }

  console.log('🚀 Bắt đầu seed phát âm...\n')

  const wordsFile = process.env.WORDS_FILE
    ? path.resolve(PROJECT_ROOT, process.env.WORDS_FILE)
    : DEFAULT_WORDS_FILE
  const allWords = loadWords(wordsFile)
  console.log(`📋 Nguồn từ: ${path.relative(PROJECT_ROOT, wordsFile)}`)
  console.log(`📋 Tổng số từ: ${allWords.length} × ${VOICE_IDS.length} giọng (${VOICE_IDS.join(', ')})`)

  // Lấy danh sách (từ, giọng) đã có trong DB để bỏ qua — script resume được nếu bị dừng giữa chừng.
  const supabase = getSupabaseAdmin()
  const { data: existing, error: selectError } = await supabase
    .from('pronunciations')
    .select('word, voice')
  if (selectError) {
    console.error(`❌ Không đọc được bảng pronunciations: ${selectError.message}`)
    process.exit(1)
  }

  const done = new Set(
    (existing ?? []).map((row) => {
      const r = row as { word: string; voice: string }
      return `${r.word}:${r.voice}`
    }),
  )

  // Mỗi từ cần seed cho TỪNG giọng trong VOICE_IDS → danh sách tác vụ = từ × giọng.
  const allTasks: Task[] = []
  for (const w of allWords) {
    for (const voice of VOICE_IDS) {
      allTasks.push({ word: w.toLowerCase(), voice })
    }
  }
  const todo = allTasks.filter((t) => !done.has(`${t.word}:${t.voice}`))

  console.log(`✅ Đã có: ${done.size} (từ, giọng)`)
  console.log(`⏳ Cần tạo: ${todo.length} (từ, giọng)\n`)

  if (todo.length === 0) {
    console.log('🎉 Tất cả đã được cache rồi!')
    return
  }

  const bar = new cliProgress.SingleBar(
    {
      format: 'Tiến độ |{bar}| {percentage}% | {value}/{total} | ✓{ok} ✗{errors}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(todo.length, 0, { ok: 0, errors: 0 })

  let countOk = 0
  let countError = 0
  // Dùng Set để 1 từ bị lỗi ở cả 2 giọng cũng chỉ ghi 1 lần vào file lỗi.
  const errorWords = new Set<string>()
  let firstError: { word: string; voice: VoiceId; message: string } | null = null

  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map((task) => processTask(task)))

    results.forEach((result, idx) => {
      if (result.status === 'ok') {
        countOk++
      } else {
        countError++
        errorWords.add(batch[idx].word)
        if (!firstError) firstError = { ...batch[idx], message: result.message }
      }
    })

    bar.update(Math.min(i + BATCH_SIZE, todo.length), { ok: countOk, errors: countError })

    if (i + BATCH_SIZE < todo.length) {
      await sleep(DELAY_MS)
    }
  }

  bar.stop()

  if (errorWords.size > 0) {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify([...errorWords], null, 2))
    console.log(`\n⚠️  ${errorWords.size} từ bị lỗi (ở ít nhất 1 giọng) → xem danh sách: scripts/seed-errors.json`)
    console.log('   Chạy lại các từ lỗi bằng: WORDS_FILE=scripts/seed-errors.json npm run seed:pronunciation')
    if (firstError) {
      console.log(`   Lỗi đầu tiên (ví dụ): ${firstError.word} (giọng ${firstError.voice}) — ${firstError.message}`)
    }
  }

  console.log(`\n✅ Hoàn thành! Thành công: ${countOk} | Lỗi: ${countError}`)
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi không mong đợi:', err)
  process.exit(1)
})
