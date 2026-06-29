// scripts/prefetch-tts-patterns.ts
// Tạo trước (pre-generate) audio TTS chất lượng cao cho TẤT CẢ câu trong src/data/patterns/chunk-*.json,
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
//   - CEFR + Cụm từ: chỉ 2 giọng female/male — đều phát qua getVoicePref (female2/male2
//     chỉ dùng cho hội thoại Lessons). Câu Cụm từ seed theo thứ tự hiển thị (phổ biến nhất trước).
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
import {
  generateAudioFromGoogle,
  VOICE_IDS,
  VOICE_VERSION,
  type Lang,
  type VoiceId,
} from '../api/_lib/googleTts.ts'
import { CEFR_LEVELS } from '../src/data/cefr.ts'
import { encryptAudio } from '../api/_lib/ttsCrypto.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'
import { getSupabaseAdmin } from '../api/_lib/supabaseAdmin.ts'
import { loadSubjectsInDisplayOrder, PREF_VOICE_IDS } from './_lib/patternOrder.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// ── Cấu hình ────────────────────────────────────────────────────────────────
const BATCH_SIZE = 15 // số tác vụ song song — Google TTS cho phép ~100 req/s
const DELAY_MS = 0 // không cần nghỉ giữa batch với BATCH_SIZE vừa phải
const RETRY_DELAY_MS = 5000 // nghỉ giữa các vòng retry (ms)
const MAX_ROUNDS = 5 // số vòng retry tối đa
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
// api/tts.ts băm chuỗi (text + lang + voice + VOICE_VERSION). Phải khớp hoàn toàn
// nếu không cache seeded sẽ không bao giờ được tìm thấy bởi API.
function hashText(text: string, lang: Lang, voice: VoiceId): string {
  return crypto
    .createHash('sha256')
    .update(text + lang + voice + VOICE_VERSION)
    .digest('hex')
    .slice(0, 32)
}

// ── Trích xuất tất cả câu cần seed ──────────────────────────────────────────
// Thứ tự ưu tiên: CEFR examples → patterns (lessons được seed trong seed-all.ts)
function collectTasks(): Task[] {
  const tasks: Task[] = []
  const seen = new Set<string>()

  // voices: giới hạn giọng theo nhóm. CEFR + patterns đều phát qua getVoicePref nên chỉ
  // cần female/male (PREF_VOICE_IDS — xem _lib/patternOrder.ts).
  const add = (rawText: string, lang: Lang, voices: readonly VoiceId[] = VOICE_IDS) => {
    const text = rawText.trim()
    if (!text) return
    for (const voice of voices) {
      const key = `${text}|${lang}|${voice}`
      if (seen.has(key)) continue
      seen.add(key)
      tasks.push({ text, lang, voice })
    }
  }

  // ── Ưu tiên 1: CEFR grammar examples → Roadmap tab (/learn) — chỉ female/male
  for (const level of CEFR_LEVELS) {
    for (const unit of level.units) {
      for (const lesson of unit.grammar) {
        for (const { en, vi } of lesson.examples) {
          add(en, 'en-US', PREF_VOICE_IDS)
          add(vi, 'vi-VN', PREF_VOICE_IDS)
        }
      }
    }
  }

  // ── Ưu tiên 2: Pattern sentences → Cụm từ page (PHỔ BIẾN NHẤT TRƯỚC)
  // Chỉ 2 giọng female/male (trang Cụm từ không phát female2/male2) và theo thứ tự
  // hiển thị (I am, You are, He is... trước) — xem scripts/_lib/patternOrder.ts.
  for (const subject of loadSubjectsInDisplayOrder(
    path.join(PROJECT_ROOT, 'public/data/patterns'),
  )) {
    for (const { en, vi } of subject.sentences) {
      add(en, 'en-US', PREF_VOICE_IDS)
      add(vi, 'vi-VN', PREF_VOICE_IDS)
    }
  }

  return tasks
}

// ── Xử lý 1 tác vụ: kiểm tra cache → TTS → MÃ HÓA → lưu file → lưu DB ───────
// Các bước này khớp với api/tts.ts để file seed dùng được ngay trên app.
async function processTask(
  task: Task,
): Promise<{ status: 'ok' } | { status: 'skip' } | { status: 'error'; message: string }> {
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
      .upsert({ hash, lang, voice, audio_url: audioUrl }, { onConflict: 'hash' })

    if (dbError) throw new Error(`Lưu DB lỗi: ${dbError.message}`)

    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) }
  }
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// Chạy 1 vòng xử lý, trả về danh sách tác vụ còn lỗi
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
        failed.push({ task: batch[idx], message: result.message })
      }
    })

    bar.update(Math.min(i + BATCH_SIZE, tasks.length), {
      ok: countOk,
      skip: countSkip,
      errors: countError,
    })

    if (DELAY_MS > 0 && i + BATCH_SIZE < tasks.length) await sleep(DELAY_MS)
  }

  bar.stop()
  console.log(`   ✓ Mới tạo: ${countOk}  ⏭ Đã có: ${countSkip}  ✗ Lỗi: ${countError}`)

  return failed
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // Kiểm tra biến môi trường — thêm TTS_ENCRYPTION_MASTER_KEY vì giờ có mã hóa.
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

  // Giới hạn số tác vụ nếu chạy debug (LIMIT=10 npm run prefetch:tts-patterns)
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
  const tasks = allTasks.slice(0, limit)

  console.log('🔊 Bắt đầu pre-generate TTS cho CEFR + Cụm từ (Cụm từ: phổ biến nhất trước)')
  console.log(
    `📋 Tổng tác vụ: ${tasks.length} (en-US + vi-VN · chỉ 2 giọng ${PREF_VOICE_IDS.join('/')})`,
  )
  console.log(
    `⚙️  Batch: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms | Retry delay: ${RETRY_DELAY_MS}ms | Max rounds: ${MAX_ROUNDS}${FORCE ? ' | ⚠️  FORCE: ghi đè cache cũ' : ''}`,
  )

  // ── Vòng lặp: lặp cho đến khi hết lỗi hoặc đạt MAX_ROUNDS ───────────────
  let remaining: Array<{ task: Task; message: string }> = []
  let previousErrorCount = Infinity

  // Vòng 1: xử lý toàn bộ
  remaining = await runPass(tasks, '🟢 Vòng 1 — Xử lý toàn bộ')

  // Vòng retry: chỉ xử lý tác vụ còn lỗi
  for (let round = 2; round <= MAX_ROUNDS && remaining.length > 0; round++) {
    // Dừng sớm nếu số lỗi không giảm so với vòng trước (tránh vòng lặp vô tận)
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

  // ── Kết quả cuối ─────────────────────────────────────────────────────────
  if (remaining.length === 0) {
    console.log('\n🎉 Hoàn thành 100%! Toàn bộ câu đã được cache.')
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
    console.log(`   Xem chi tiết: scripts/prefetch-tts-errors.json`)
    console.log(
      `   Lỗi mẫu: "${remaining[0].task.text}" (${remaining[0].task.lang}/${remaining[0].task.voice}) — ${remaining[0].message}`,
    )
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi:', err)
  process.exit(1)
})
