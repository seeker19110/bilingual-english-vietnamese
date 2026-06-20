// scripts/prefetch-tts-patterns.ts
// Tạo trước (pre-generate) audio TTS chất lượng cao cho TẤT CẢ câu trong src/data/patterns.ts,
// lưu vào Storage + bảng tts_cache — GIỐNG HỆT luồng của api/tts.ts (cùng hash, cùng mã hóa,
// cùng cách lưu file) để dữ liệu seed dùng được ngay trên app, không bị lệch.
//
// Tại sao cần script này?
//   - Câu đầu tiên của mỗi câu chưa được cache sẽ phải gọi Google TTS (tốn ~1-2s).
//   - Chạy script 1 lần → TOÀN BỘ câu được cache → mọi người dùng sau chỉ đọc file sẵn.
//   - Script resume được: chạy lại sẽ bỏ qua câu đã có trong bảng tts_cache.
//
// Dữ liệu seed (giống api/tts.ts — mã hóa AES-256-GCM, lưu qua saveAudio theo STORAGE_DRIVER):
//   - Tiếng Anh (lang=en-US) và Tiếng Việt (lang=vi-VN)
//   - CẢ 2 GIỌNG nữ + nam (VOICE_IDS) cho mỗi câu — vì app cho chọn giọng.
//   Tổng ~ số câu × 2 ngôn ngữ-phù-hợp × 2 giọng.
//
// ⚠️ QUAN TRỌNG — phải nhất quán với api/tts.ts, nếu không app sẽ giải mã thất bại:
//   - Hash: SHA-256(text + lang + voice), lấy 32 ký tự hex đầu (giống hàm hashText trong api/tts.ts).
//   - Mã hóa: encryptAudio() (AES-256-GCM, khoá suy từ hash) TRƯỚC khi lưu.
//   - Lưu file: saveAudio('tts-cache', `${lang}/${voice}/${hash}.mp3`, ...) — tôn trọng STORAGE_DRIVER.
//
// Chạy: npm run prefetch:tts-patterns
// Debug 1 câu: LIMIT=1 npm run prefetch:tts-patterns
// Ghi đè cache cũ (vd. cache hỏng/thiếu giọng): npm run prefetch:tts-patterns -- --force

import * as crypto from 'node:crypto'
import * as dotenv from 'dotenv'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { generateAudioFromGoogle, VOICE_IDS, type Lang, type VoiceId } from '../api/_lib/googleTts.ts'
import { encryptAudio } from '../api/_lib/ttsCrypto.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'
import patternsData from '../src/data/patterns.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
// BATCH_SIZE: số tác vụ (câu+giọng) xử lý song song cùng lúc (mỗi tác vụ = 1 lần gọi Google TTS)
// Đặt thấp để tránh Google TTS rate-limit; tăng lên nếu có quota cao.
const BATCH_SIZE = 3
// DELAY_MS: nghỉ giữa các batch (ms); giảm xuống nếu muốn nhanh hơn nhưng cẩn thận rate-limit
const DELAY_MS = 400
const ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/prefetch-tts-errors.json')

// URL gốc của server — chỉ cần khi STORAGE_DRIVER=local (lưu file lên VPS) để tạo link đầy đủ.
// Khi dùng Supabase Storage (mặc định) thì biến này bị bỏ qua.
const BASE_URL = process.env.BASE_URL || ''

// --force (hoặc FORCE=1): tạo lại + GHI ĐÈ tất cả, kể cả câu đã có trong tts_cache.
// Dùng khi cache cũ bị hỏng (vd. file seed cũ chưa mã hóa / thiếu giọng) — bỏ qua bước
// kiểm tra cache để chắc chắn mọi bản ghi được tạo lại đúng luồng api/tts.ts.
const FORCE = process.argv.includes('--force') || process.env.FORCE === '1'

// 1 tác vụ = tạo audio cho 1 (câu, ngôn ngữ, giọng) cụ thể.
interface Task {
  text: string
  lang: Lang
  voice: VoiceId
}

// ── Hash: GIỐNG HỆT hàm hashText trong api/tts.ts ───────────────────────────
// api/tts.ts băm chuỗi (text + lang + voice). Dùng node:crypto thay vì crypto.subtle
// (crypto.subtle chỉ có trong Edge/browser runtime) — kết quả hex giống nhau.
function hashText(text: string, lang: Lang, voice: VoiceId): string {
  return crypto
    .createHash('sha256')
    .update(text + lang + voice)
    .digest('hex')
    .slice(0, 32)
}

// ── Trích xuất tất cả câu cần seed từ patterns.ts (cho cả 2 giọng) ──────────
function collectTasks(): Task[] {
  const tasks: Task[] = []
  const seen = new Set<string>() // tránh trùng (cùng câu+lang+giọng xuất hiện nhiều lần)

  const add = (rawText: string, lang: Lang) => {
    const text = rawText.trim()
    if (!text) return
    for (const voice of VOICE_IDS) {
      const key = `${text}|${lang}|${voice}`
      if (seen.has(key)) continue
      seen.add(key)
      tasks.push({ text, lang, voice })
    }
  }

  for (const subject of patternsData) {
    for (const { en, vi } of subject.sentences) {
      add(en, 'en-US')
      add(vi, 'vi-VN')
    }
  }

  return tasks
}

// ── Xử lý 1 tác vụ: kiểm tra cache → TTS → MÃ HÓA → lưu file → lưu DB ───────
// Các bước này khớp với api/tts.ts để file seed dùng được ngay trên app.
async function processTask(task: Task): Promise<{ status: 'ok' | 'skip' } | { status: 'error'; message: string }> {
  const { text, lang, voice } = task
  const hash = hashText(text, lang, voice)

  try {
    const supabase = getSupabaseAdmin()

    // Kiểm tra cache trước để không tốn tiền TTS với câu đã có.
    // Bỏ qua bước này khi --force để tạo lại + ghi đè bản ghi cũ (vd. cache hỏng).
    if (!FORCE) {
      const { data: cached } = await supabase
        .from('tts_cache')
        .select('audio_url')
        .eq('hash', hash)
        .maybeSingle()

      if (cached) return { status: 'skip' }
    }

    // Gọi Google TTS → mp3 gốc
    const audioBuffer = await generateAudioFromGoogle(text, voice, lang)

    // Mã hóa AES-256-GCM TRƯỚC khi lưu (khoá suy từ hash) — giống api/tts.ts.
    const encrypted = await encryptAudio(audioBuffer, hash)

    // Lưu file qua saveAudio → tôn trọng STORAGE_DRIVER (local VPS hoặc Supabase Storage).
    const fileName = `${lang}/${voice}/${hash}.mp3`
    const audioUrl = await saveAudio('tts-cache', fileName, encrypted, BASE_URL)

    // Lưu vào DB — upsert để idempotent nếu 2 process chạy song song
    const { error: dbError } = await supabase
      .from('tts_cache')
      .upsert(
        { hash, lang, voice, audio_url: audioUrl },
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
  // Kiểm tra biến môi trường — thêm TTS_ENCRYPTION_MASTER_KEY vì giờ có mã hóa.
  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_TTS_API_KEY', 'TTS_ENCRYPTION_MASTER_KEY'].filter(
    (k) => !process.env[k],
  )
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường trong .env: ${missing.join(', ')}`)
    process.exit(1)
  }

  const allTasks = collectTasks()

  // Giới hạn số tác vụ nếu chạy debug (LIMIT=10 npm run prefetch:tts-patterns)
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
  const tasks = allTasks.slice(0, limit)

  console.log('🔊 Bắt đầu pre-generate TTS cho patterns.ts (cả 2 giọng)\n')
  console.log(`📋 Tổng tác vụ cần xử lý: ${tasks.length} (en-US + vi-VN × ${VOICE_IDS.join('/')})`)
  console.log(`⚙️  Batch size: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms${FORCE ? ' | ⚠️  FORCE: ghi đè cache cũ' : ''}\n`)

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
  const errorTexts: Array<{ text: string; lang: Lang; voice: VoiceId; message: string }> = []

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
    console.log(`\n⚠️  ${errorTexts.length} tác vụ bị lỗi → xem chi tiết: scripts/prefetch-tts-errors.json`)
    console.log(`   Lỗi đầu tiên: "${errorTexts[0].text}" (${errorTexts[0].lang}/${errorTexts[0].voice}) — ${errorTexts[0].message}`)
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
