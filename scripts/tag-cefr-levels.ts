// scripts/tag-cefr-levels.ts
// Script chạy 1 LẦN trên máy có API key để gắn nhãn cấp CEFR (A1-C2) cho từ vựng MỞ RỘNG
// (public/data/dictionary/chunk-*.json, ~10.000 từ hiện chưa có cấp độ nào — xem CLAUDE.md
// mục 13 "Còn: gắn nhãn CEFR cho từ vựng mở rộng").
//
// NGUỒN DỮ LIỆU (ưu tiên — tra cứu THẬT, không phải AI đoán):
//   CEFR-J Vocabulary Profile v1.5 (A1-B2, Yukio Tono/Tokyo University of Foreign Studies)
//   + Octanove Vocabulary Profile C1/C2 v1.0 (Octanove Labs) — data/cefrj/*.csv.
//   GIẤY PHÉP: CEFR-J dùng được cho thương mại, miễn phí, BẮT BUỘC ghi nguồn; Octanove
//   C1/C2 theo CC BY-SA 4.0 (ghi nguồn + giữ cùng giấy phép nếu phát hành lại bản sửa đổi).
//   Chi tiết trích dẫn: xem data/cefrj/SOURCE.md. Tải từ:
//   https://github.com/openlanguageprofiles/olp-en-cefrj
//
//   Từ nào KHÔNG có trong 2 wordlist trên mới rơi xuống AI ƯỚC LƯỢNG (fallback) — coi nhãn
//   AI là gợi ý, có thể sai lệch; sửa tay từng từ trực tiếp trong file JSON nếu phát hiện sai.
//
// Nhà cung cấp AI (chỉ dùng cho phần fallback): ưu tiên GEMINI_API_KEY (free quota) →
// GROQ_API_KEY (free) → ANTHROPIC_API_KEY (trả phí) — khớp thứ tự ưu tiên trong
// .env.example / api/ai.ts.
//
// An toàn chạy lại: bỏ qua từ đã có field "level" (resume được nếu bị dừng giữa chừng).
// Ghi lại file chunk sau MỖI batch, không mất tiến độ khi Ctrl+C.
//
// Biến môi trường (tuỳ chọn):
//   LIMIT=200        chỉ gọi AI cho tối đa 200 từ (tra wordlist CEFR-J/Octanove KHÔNG bị giới
//                     hạn vì miễn phí, không tốn quota — LIMIT chỉ để chạy thử phần fallback AI)
//   BATCH_SIZE=40     số từ / 1 lần gọi AI (mặc định 40) — chỉ áp dụng cho phần fallback AI
//   DICT_DIR=...      đổi thư mục chunk (mặc định public/data/dictionary)
//   CEFRJ_DIR=...     đổi thư mục wordlist CEFR-J (mặc định data/cefrj)
//
// Chạy: npm run tag:cefr
//   Thử trước với số nhỏ: LIMIT=40 npm run tag:cefr
//   Chỉ dùng wordlist, không gọi AI cho phần thiếu: NO_AI_FALLBACK=1 npm run tag:cefr

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
import {
  parseCefrjCsv,
  buildCefrjIndex,
  lookupCefrLevel,
  type CefrjRow,
} from '../api/_lib/cefrjLookup.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const BATCH_SIZE = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE, 10) : 40
const DICT_DIR = process.env.DICT_DIR
  ? path.resolve(PROJECT_ROOT, process.env.DICT_DIR)
  : path.join(PROJECT_ROOT, 'public/data/dictionary')
const CEFRJ_DIR = process.env.CEFRJ_DIR
  ? path.resolve(PROJECT_ROOT, process.env.CEFRJ_DIR)
  : path.join(PROJECT_ROOT, 'data/cefrj')
const NO_AI_FALLBACK = process.env.NO_AI_FALLBACK === '1'
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

// ── Wordlist CEFR-J (A1-B2) + Octanove (C1-C2) — xem data/cefrj/SOURCE.md để ghi nguồn
// đúng giấy phép khi công bố/dùng lại dữ liệu đã gắn nhãn. ──────────────────────────────
const CEFRJ_FILES = ['cefrj-vocabulary-profile-1.5.csv', 'octanove-vocabulary-profile-c1c2-1.0.csv']

function loadCefrjIndex(): ReturnType<typeof buildCefrjIndex> {
  const rows: CefrjRow[] = []
  for (const file of CEFRJ_FILES) {
    const filePath = path.join(CEFRJ_DIR, file)
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Không tìm thấy ${file} trong ${CEFRJ_DIR} — bỏ qua, dồn hết sang AI.`)
      continue
    }
    rows.push(...parseCefrjCsv(fs.readFileSync(filePath, 'utf-8')))
  }
  return buildCefrjIndex(rows)
}

// ── Chọn provider theo key có sẵn (giống thứ tự ưu tiên api/ai.ts) — chỉ gọi khi wordlist
// không phủ hết, để chạy không cần API key nào nếu wordlist đã đủ. ──────────────────────
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
  const files = fs
    .readdirSync(DICT_DIR)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()
  if (files.length === 0) {
    console.error(`❌ Không tìm thấy chunk-*.json trong ${DICT_DIR}`)
    process.exit(1)
  }

  console.log('🚀 Bắt đầu gắn nhãn CEFR cho từ vựng mở rộng')
  console.log(`📋 Nguồn từ điển: ${path.relative(PROJECT_ROOT, DICT_DIR)} (${files.length} chunk)`)
  console.log(
    '📚 Ưu tiên tra wordlist CEFR-J (A1-B2, © Tono Lab/TUFS) + Octanove (C1-C2, CC BY-SA 4.0)',
  )
  console.log(
    `   — ${path.relative(PROJECT_ROOT, CEFRJ_DIR)}, xem data/cefrj/SOURCE.md để trích dẫn đúng.`,
  )
  console.log('🤖 AI chỉ dùng để ước lượng phần từ KHÔNG có trong wordlist (fallback).')

  const cefrjIndex = loadCefrjIndex()

  let providerInfo: { provider: Provider; key: string } | null = null
  const getProvider = (): { provider: Provider; key: string } => {
    if (!providerInfo) providerInfo = pickProvider()
    return providerInfo
  }

  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
  let totalSkippedAlready = 0
  let totalFromWordlist = 0
  let totalFromAi = 0
  let totalFailed = 0
  let totalSkippedNoAi = 0
  let aiProcessedThisRun = 0

  for (const file of files) {
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

    // Đợt 1 — tra wordlist CEFR-J/Octanove: miễn phí, tra cứu THẬT, không giới hạn LIMIT
    // (không gọi AI nên không tốn quota/chi phí).
    let fileChanged = false
    const needsAiIdx: number[] = []
    for (const idx of todoIdx) {
      const e = entries[idx]!
      const level = lookupCefrLevel(cefrjIndex, e.word, e.pos)
      if (level) {
        e.level = level
        totalFromWordlist++
        fileChanged = true
      } else {
        needsAiIdx.push(idx)
      }
    }
    if (fileChanged) fs.writeFileSync(filePath, JSON.stringify(entries))

    if (needsAiIdx.length === 0) continue

    if (NO_AI_FALLBACK) {
      totalSkippedNoAi += needsAiIdx.length
      continue
    }
    if (aiProcessedThisRun >= limit) continue

    // Đợt 2 — AI ước lượng phần còn lại (không có trong wordlist).
    console.log(`\n📦 ${file} — ${needsAiIdx.length} từ không có trong wordlist, nhờ AI ước lượng`)
    const bar = new cliProgress.SingleBar(
      {
        format: 'Tiến độ |{bar}| {percentage}% | {value}/{total}',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic,
    )
    bar.start(needsAiIdx.length, 0)

    for (let i = 0; i < needsAiIdx.length; i += BATCH_SIZE) {
      if (aiProcessedThisRun >= limit) break
      const batchIdx = needsAiIdx.slice(i, i + BATCH_SIZE).slice(0, limit - aiProcessedThisRun)
      const batchItems: CefrTagInput[] = batchIdx.map((idx) => {
        const e = entries[idx]!
        return { word: e.word, pos: e.pos, vi: e.vi }
      })

      const { provider, key } = getProvider()
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
            totalFromAi++
            fileChanged = true
          } else {
            totalFailed++
          }
        }
      } else {
        totalFailed += batchIdx.length
      }

      aiProcessedThisRun += batchIdx.length
      bar.update(Math.min(i + BATCH_SIZE, needsAiIdx.length))

      // Ghi lại ngay sau mỗi batch — Ctrl+C không mất tiến độ đã làm.
      if (fileChanged) fs.writeFileSync(filePath, JSON.stringify(entries))
    }

    bar.stop()
  }

  console.log('\n📊 Kết quả:')
  console.log(`   📚 Từ wordlist CEFR-J/Octanove (miễn phí, chính xác): ${totalFromWordlist}`)
  console.log(`   🤖 Từ AI ước lượng (fallback)                       : ${totalFromAi}`)
  console.log(`   ⏭️  Đã có nhãn từ trước                              : ${totalSkippedAlready}`)
  if (totalSkippedNoAi > 0) {
    console.log(`   ⏸️  Bỏ qua (NO_AI_FALLBACK=1, chưa gọi AI)           : ${totalSkippedNoAi}`)
  }
  console.log(`   ❌ AI không gắn được                                : ${totalFailed}`)
  if (totalFailed > 0) {
    console.log(
      '   → Chạy lại lệnh cũ để thử lại các từ chưa gắn được (script tự bỏ qua từ đã xong).',
    )
  }
  console.log(
    `\n📝 Nguồn wordlist: CEFR-J v1.5 (Yukio Tono, Tokyo University of Foreign Studies) + ` +
      `Octanove C1/C2 v1.0 (CC BY-SA 4.0) — chi tiết trích dẫn xem data/cefrj/SOURCE.md.`,
  )
  console.log(
    '⚠️  Phần còn lại do AI ƯỚC LƯỢNG (không tra được wordlist), chưa qua kiểm tra tay — spot-check trước khi tin tưởng hoàn toàn.',
  )
}

main().catch((err) => {
  console.error('❌ Script dừng vì lỗi không mong đợi:', err)
  process.exit(1)
})
