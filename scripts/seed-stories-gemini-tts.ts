// scripts/seed-stories-gemini-tts.ts
// Seed TRƯỚC audio Gemini TTS cho toàn bộ truyện cổ tích/ngụ ngôn (public/data/stories/*.json)
// — mỗi lần đọc truyện KHÔNG cần chờ tạo audio động nữa (đã có sẵn trong tts_cache).
//
// Khác scripts/seed-all.ts (dùng cho Google Chirp3-HD/Studio): stories.ts giờ dùng giọng
// Gemini riêng (xem packages/core-ai/geminiTts.ts) — tách script riêng cho gọn, vì lược đồ
// hash/DB dùng CHUNG bảng tts_cache với các provider khác (chỉ khác hàm sinh audio).
//
// Chạy: npm run seed:stories:gemini
// Cờ:   --force   Tạo lại + ghi đè audio đã có sẵn trong cache.
//       --limit=N Chỉ seed N câu đầu tiên (debug nhanh).
//
// Giới hạn tốc độ gọi API (đúc kết từ lần chạy thật 2026-08-06 trên VPS — gói Gemini API
// FREE báo lỗi 429 RESOURCE_EXHAUSTED chỉ sau ĐÚNG 4 lệnh gọi liên tiếp; Google không công bố
// số RPM chính xác cho model TTS preview, số liệu quan sát được là nguồn đáng tin nhất hiện
// có). Mặc định: cứ 3 lệnh gọi API THẬT (không tính câu cache HIT — câu đó không gọi Gemini)
// thì nghỉ 61 giây (61s thay vì 60s vì cửa sổ RPM đôi khi lệch vài trăm ms, chốt "61" cho
// chắc). Chỉnh qua biến môi trường nếu gói trả phí có hạn mức cao hơn:
//   SEED_BATCH_SIZE=3        Số lệnh gọi API liên tiếp trước khi nghỉ.
//   SEED_BATCH_PAUSE_MS=61000  Thời gian nghỉ (ms) sau mỗi đợt.
// Gặp 429 giữa chừng (batch chưa đủ ngưỡng nghỉ) → tự nghỉ NGAY 1 đợt rồi thử lại đúng câu đó
// 1 lần, không bỏ cuộc ngay để đỡ phải chạy lại cả danh sách.
//
// Truyện NGẮN được xếp seed TRƯỚC truyện dài (sắp xếp theo số câu tăng dần) — với hạn mức
// thấp thế này, 1 lần chạy khó seed hết ngay, nên ưu tiên seed XONG HẲN nhiều truyện ngắn
// thay vì seed dở dang 1 truyện dài.

import * as crypto from 'node:crypto'
import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { VOICE_VERSION } from '../api/_lib/googleTts.ts'
import { encryptAudio } from '../api/_lib/ttsCrypto.ts'
import { saveAudio } from '../packages/core-ai/fileStorage.ts'
import {
  generateAudioFromGemini,
  isValidGeminiVoice,
  type GeminiVoiceId,
} from '../packages/core-ai/geminiTts.ts'
import { getPgPool } from '../packages/core-db/pgPool.ts'
import { STORY_KIND_VOICE } from '../apps/english/src/lib/stories.ts'
import type { StoryKind } from '../apps/english/src/data/stories/index.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const args = process.argv.slice(2)
const FORCE = args.includes('--force') || process.env.FORCE === '1'
const limitArg = args.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity
const BASE_URL = process.env.BASE_URL || ''
const BATCH_SIZE = Number(process.env.SEED_BATCH_SIZE) || 3
const BATCH_PAUSE_MS = Number(process.env.SEED_BATCH_PAUSE_MS) || 61_000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type Lang = 'en-US' | 'vi-VN'

// Hash PHẢI khớp hoàn toàn với packages/core-ai/tts.ts (endpoint /api/tts) — cùng công thức
// text + lang + voice + VOICE_VERSION dùng chung cho MỌI provider (server không phân biệt
// Google/Gemini/ElevenLabs khi tính hash, chỉ khác hàm sinh audio).
function hashText(text: string, lang: Lang, voice: string): string {
  return crypto
    .createHash('sha256')
    .update(text + lang + voice + VOICE_VERSION)
    .digest('hex')
    .slice(0, 32)
}

interface StoryLineRaw {
  en: string
  vi: string
}
interface StoryJson {
  kind: StoryKind
  lines: StoryLineRaw[]
  moralEn?: string
  moralVi?: string
}

interface Job {
  text: string
  lang: Lang
  voice: GeminiVoiceId
}

async function main(): Promise<void> {
  const storyDir = path.join(PROJECT_ROOT, 'public/data/stories')
  if (!fs.existsSync(storyDir)) {
    console.error(
      `❌ Chưa có ${storyDir} (chạy \`node scripts/gen-stories-json.mjs\` trước khi seed).`,
    )
    process.exit(1)
  }

  const storyFiles = fs
    .readdirSync(storyDir)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')

  // Đọc hết trước rồi sắp truyện NGẮN lên đầu (theo số câu tăng dần) — xem lý do ở ghi chú
  // đầu file. lineCount có sẵn trong JSON (gen-stories-json.mjs đã tính), fallback đếm
  // lines.length nếu thiếu field (file cũ/thủ công).
  const stories = storyFiles
    .map((file) => ({
      file,
      story: JSON.parse(fs.readFileSync(path.join(storyDir, file), 'utf8')) as StoryJson & {
        lineCount?: number
      },
    }))
    .sort(
      (a, b) =>
        (a.story.lineCount ?? a.story.lines.length) - (b.story.lineCount ?? b.story.lines.length),
    )

  const jobs: Job[] = []
  for (const { file, story } of stories) {
    const voice = STORY_KIND_VOICE[story.kind]
    if (!isValidGeminiVoice(voice)) {
      console.warn(`⚠️  Giọng "${voice}" (thể loại ${story.kind}) không hợp lệ — bỏ qua ${file}.`)
      continue
    }
    for (const line of story.lines) {
      jobs.push({ text: line.en, lang: 'en-US', voice })
      jobs.push({ text: line.vi, lang: 'vi-VN', voice })
    }
    if (story.moralEn) jobs.push({ text: story.moralEn, lang: 'en-US', voice })
    if (story.moralVi) jobs.push({ text: story.moralVi, lang: 'vi-VN', voice })
  }

  const limitedJobs = jobs.slice(0, LIMIT)
  console.log(
    `📚 ${storyFiles.length} truyện (ngắn → dài) — ${limitedJobs.length}/${jobs.length} câu cần xét. ` +
      `Giới hạn tốc độ: ${BATCH_SIZE} lệnh gọi / nghỉ ${Math.round(BATCH_PAUSE_MS / 1000)}s.`,
  )

  const pool = getPgPool()
  let ok = 0
  let skip = 0
  let error = 0
  let callsSinceLastPause = 0

  const isQuotaError = (err: unknown): boolean =>
    /\(429\)|RESOURCE_EXHAUSTED|quota/i.test(err instanceof Error ? err.message : String(err))

  for (let i = 0; i < limitedJobs.length; i++) {
    const { text, lang, voice } = limitedJobs[i]!
    const hash = hashText(text, lang, voice)
    process.stdout.write(`\r[${i + 1}/${limitedJobs.length}] ok=${ok} skip=${skip} lỗi=${error}   `)

    try {
      if (!FORCE) {
        const { rows } = await pool.query('select 1 from public.tts_cache where hash = $1', [hash])
        if (rows.length > 0) {
          skip++
          continue
        }
      }

      // Gọi Gemini — tự thử lại 1 lần nếu gặp 429 GIỮA lô (chưa tới ngưỡng nghỉ theo lịch),
      // để không mất câu này chỉ vì lệch nhịp vài trăm ms so với cửa sổ RPM thật của Google.
      let audioBuffer: ArrayBuffer
      try {
        audioBuffer = await generateAudioFromGemini(text, voice)
        callsSinceLastPause++
      } catch (err) {
        callsSinceLastPause++
        if (!isQuotaError(err)) throw err
        process.stdout.write(
          `\n⏸️  429 giữa lô — nghỉ ${Math.round(BATCH_PAUSE_MS / 1000)}s rồi thử lại câu này...\n`,
        )
        await sleep(BATCH_PAUSE_MS)
        callsSinceLastPause = 0
        audioBuffer = await generateAudioFromGemini(text, voice)
        callsSinceLastPause++
      }

      const encrypted = await encryptAudio(audioBuffer, hash)
      const fileName = `${lang}/${voice}/${hash}.wav`
      const audioUrl = await saveAudio('tts-cache', fileName, encrypted, BASE_URL)
      await pool.query(
        `insert into public.tts_cache (hash, lang, voice, audio_url, last_accessed_at)
         values ($1, $2, $3, $4, now())
         on conflict (hash) do update set
           audio_url = excluded.audio_url, last_accessed_at = now()`,
        [hash, lang, voice, audioUrl],
      )
      ok++
    } catch (err) {
      error++
      console.error(
        `\n❌ Lỗi câu "${text.slice(0, 60)}..." (${voice}/${lang}): ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // Nghỉ theo lịch — CHỈ đếm lệnh gọi API thật (câu cache HIT ở trên "continue" trước khi
    // tới đây, không tính). Nghỉ ở cuối vòng lặp (không phải đầu) để không nghỉ thừa sau câu
    // cuối cùng khi đã xong hết.
    if (callsSinceLastPause >= BATCH_SIZE && i < limitedJobs.length - 1) {
      process.stdout.write(
        `\n⏳ Đủ ${BATCH_SIZE} lệnh gọi — nghỉ ${Math.round(BATCH_PAUSE_MS / 1000)}s...\n`,
      )
      await sleep(BATCH_PAUSE_MS)
      callsSinceLastPause = 0
    }
  }

  console.log(`\n\n✅ Xong — tạo mới ${ok}, đã có sẵn ${skip}, lỗi ${error}.`)
  await pool.end()
  process.exit(error > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('❌ Lỗi không mong đợi:', err)
  process.exit(1)
})
