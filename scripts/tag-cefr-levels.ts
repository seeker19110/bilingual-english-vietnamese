// scripts/tag-cefr-levels.ts
// Script chạy 1 LẦN trên máy có API key để gắn nhãn cấp CEFR (A1-C2) cho từ vựng MỞ RỘNG
// (public/data/dictionary/chunk-*.json, ~10.000 từ hiện chưa có cấp độ nào — xem CLAUDE.md
// mục 13 "Còn: gắn nhãn CEFR cho từ vựng mở rộng").
//
// QUAN TRỌNG: nhãn do AI ƯỚC LƯỢNG (không phải nguồn CEFR chính thức như Oxford/EVP —
// repo hiện không có wordlist CEFR nào để tra chính xác). Coi là gợi ý, có thể sai lệch;
// sửa tay từng từ trực tiếp trong file JSON nếu phát hiện sai.
//
// Nhà cung cấp AI: ưu tiên GEMINI_API_KEY (free quota) → GROQ_API_KEY (free) →
// ANTHROPIC_API_KEY (trả phí) — khớp thứ tự ưu tiên trong .env.example / api/ai.ts.
//
// An toàn chạy lại: bỏ qua từ đã có field "level" (resume được nếu bị dừng giữa chừng).
// Ghi lại file chunk sau MỖI batch, không mất tiến độ khi Ctrl+C.
//
// Biến môi trường (tuỳ chọn):
//   LIMIT=200        chỉ xử lý tối đa 200 từ (chạy thử trước khi làm cả 10.000 từ)
//   BATCH_SIZE=40     số từ / 1 lần gọi AI (mặc định 40)
//   DICT_DIR=...      đổi thư mục chunk (mặc định public/data/dictionary)
//
// Chạy: npm run tag:cefr
//   Thử trước với số nhỏ: LIMIT=40 npm run tag:cefr

import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { callGemini } from '../api/_lib/geminiApi.ts'
import { fetchWithTimeout } from '../api/_lib/fetchTimeout.ts'
import {
  buildCefrTagPrompt,
  parseCefrTagResponse,
  type CefrTagInput,
  type CefrWordLevel,
} from '../api/_lib/cefrTagging.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const BATCH_SIZE = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE, 10) : 40
const DICT_DIR = process.env.DICT_DIR
  ? path.resolve(PROJECT_ROOT, process.env.DICT_DIR)
  : path.join(PROJECT_ROOT, 'public/data/dictionary')
const AI_TIMEOUT_MS = 30_000
const RETRY_DELAY_MS = 5000
const MAX_ROUNDS = 3

interface DictEntry {
  word: string
  pos: string
  vi: string
  ex_en: string
  ex_vi: string
  ipa_en?: string
  ipa_vi?: string
  level?: CefrWordLevel
}

// ── Chọn provider theo key có sẵn (giống thứ tự ưu tiên api/ai.ts) ──────────
type Provider = 'gemini' | 'groq' | 'anthropic'

function pickProvider(): { provider: Provider; key: string } {
  if (process.env.GEMINI_API_KEY) return { provider: 'gemini', key: process.env.GEMINI_API_KEY }
  if (process.env.GROQ_API_KEY) return { provider: 'groq', key: process.env.GROQ_API_KEY }
  if (process.env.ANTHROPIC_API_KEY)
    return { provider: 'anthropic', key: process.env.ANTHROPIC_API_KEY }
  console.error(
    '❌ Thiếu API key. Cần ÍT NHẤT MỘT trong: GEMINI_API_KEY, GROQ_API_KEY, ANTHROPIC_API_KEY (trong .env).',
  )
  process.exit(1)
}

async function callGroq(system: string, user: string): Promise<string> {
  const model = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile'
  const resp = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    },
    AI_TIMEOUT_MS,
  )
  if (!resp.ok) throw new Error(`Groq lỗi (${resp.status}): ${(await resp.text()).slice(0, 200)}`)
  const data = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq trả về nội dung rỗng')
  return text
}

async function callAnthropic(system: string, user: string): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001'
  const resp = await fetchWithTimeout(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY as string,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    },
    AI_TIMEOUT_MS,
  )
  if (!resp.ok)
    throw new Error(`Anthropic lỗi (${resp.status}): ${(await resp.text()).slice(0, 200)}`)
  const data = (await resp.json()) as { content?: Array<{ text?: string }> }
  const text = data.content?.[0]?.text
  if (!text) throw new Error('Anthropic trả về nội dung rỗng')
  return text
}

async function classifyBatch(
  provider: Provider,
  key: string,
  items: CefrTagInput[],
): Promise<Map<string, CefrWordLevel>> {
  const { system, user } = buildCefrTagPrompt(items)
  let raw: string
  if (provider === 'gemini') {
    raw = await callGemini(
      key,
      process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      system,
      [{ role: 'user', content: user }],
      2000,
    )
  } else if (provider === 'groq') {
    raw = await callGroq(system, user)
  } else {
    raw = await callAnthropic(system, user)
  }
  return parseCefrTagResponse(raw)
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

async function main(): Promise<void> {
  const { provider, key } = pickProvider()

  const files = fs
    .readdirSync(DICT_DIR)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()
  if (files.length === 0) {
    console.error(`❌ Không tìm thấy chunk-*.json trong ${DICT_DIR}`)
    process.exit(1)
  }

  console.log('🚀 Bắt đầu gắn nhãn CEFR cho từ vựng mở rộng')
  console.log(`📋 Nguồn: ${path.relative(PROJECT_ROOT, DICT_DIR)} (${files.length} chunk)`)
  console.log(`🤖 Provider: ${provider} | Batch: ${BATCH_SIZE} từ/lần gọi`)

  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
  let totalTagged = 0
  let totalSkippedAlready = 0
  let totalFailed = 0
  let processedThisRun = 0

  for (const file of files) {
    if (processedThisRun >= limit) break

    const filePath = path.join(DICT_DIR, file)
    const entries = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DictEntry[]

    const todoIdx = entries
      .map((e, i) => i)
      .filter((i) => {
        const e = entries[i]
        if (!e) return false
        if (e.level) {
          totalSkippedAlready++
          return false
        }
        return true
      })

    if (todoIdx.length === 0) continue

    console.log(`\n📦 ${file} — ${todoIdx.length} từ cần gắn nhãn`)
    const bar = new cliProgress.SingleBar(
      {
        format: 'Tiến độ |{bar}| {percentage}% | {value}/{total}',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic,
    )
    bar.start(todoIdx.length, 0)

    let fileChanged = false
    for (let i = 0; i < todoIdx.length; i += BATCH_SIZE) {
      if (processedThisRun >= limit) break
      const batchIdx = todoIdx.slice(i, i + BATCH_SIZE).slice(0, limit - processedThisRun)
      const batchItems: CefrTagInput[] = batchIdx.map((idx) => {
        const e = entries[idx]!
        return { word: e.word, pos: e.pos, vi: e.vi }
      })

      let levelMap: Map<string, CefrWordLevel> | null = null
      for (let attempt = 1; attempt <= MAX_ROUNDS && !levelMap; attempt++) {
        try {
          levelMap = await classifyBatch(provider, key, batchItems)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (attempt === MAX_ROUNDS) {
            console.error(`\n⚠️  Batch lỗi sau ${MAX_ROUNDS} lần thử: ${msg}`)
          } else {
            await sleep(RETRY_DELAY_MS)
          }
        }
      }

      if (levelMap) {
        for (const idx of batchIdx) {
          const e = entries[idx]!
          const level = levelMap.get(e.word.trim().toLowerCase())
          if (level) {
            e.level = level
            totalTagged++
            fileChanged = true
          } else {
            totalFailed++
          }
        }
      } else {
        totalFailed += batchIdx.length
      }

      processedThisRun += batchIdx.length
      bar.update(Math.min(i + BATCH_SIZE, todoIdx.length))

      // Ghi lại ngay sau mỗi batch — Ctrl+C không mất tiến độ đã làm.
      if (fileChanged) fs.writeFileSync(filePath, JSON.stringify(entries))
    }

    bar.stop()
  }

  console.log('\n📊 Kết quả:')
  console.log(`   ✅ Gắn nhãn mới : ${totalTagged}`)
  console.log(`   ⏭️  Đã có sẵn    : ${totalSkippedAlready}`)
  console.log(`   ❌ Không gắn được: ${totalFailed}`)
  if (totalFailed > 0) {
    console.log(
      '   → Chạy lại lệnh cũ để thử lại các từ chưa gắn được (script tự bỏ qua từ đã xong).',
    )
  }
  console.log(
    '\n⚠️  Nhãn CEFR là ƯỚC LƯỢNG của AI, chưa qua kiểm tra tay — spot-check trước khi tin tưởng hoàn toàn.',
  )
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi không mong đợi:', err)
  process.exit(1)
})
