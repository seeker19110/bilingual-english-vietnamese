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

  const jobs: Job[] = []
  const storyFiles = fs
    .readdirSync(storyDir)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')

  for (const file of storyFiles) {
    const story = JSON.parse(fs.readFileSync(path.join(storyDir, file), 'utf8')) as StoryJson
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
  console.log(`📚 ${storyFiles.length} truyện — ${limitedJobs.length}/${jobs.length} câu cần xét.`)

  const pool = getPgPool()
  let ok = 0
  let skip = 0
  let error = 0

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

      const audioBuffer = await generateAudioFromGemini(text, voice)
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
  }

  console.log(`\n\n✅ Xong — tạo mới ${ok}, đã có sẵn ${skip}, lỗi ${error}.`)
  await pool.end()
  process.exit(error > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('❌ Lỗi không mong đợi:', err)
  process.exit(1)
})
