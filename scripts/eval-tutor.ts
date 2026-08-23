// scripts/eval-tutor.ts — ĐÁNH GIÁ OFFLINE chất lượng sửa lỗi của "gia sư AI" (⑤ T1).
//
// VÌ SAO: prompt/model hiện tốt nhưng KHÔNG đo được sửa đúng bao nhiêu %, bịa lỗi bao nhiêu —
// đổi prompt/model là "đổi mù". Script này chạy golden set (scripts/eval-tutor-fixtures.json)
// qua ĐÚNG prompt + model + guardrail production (api/_lib/aiConfig.ts, src/prompts) rồi chấm
// tự động: recall (bắt lỗi thật) · precision (bịa lỗi ở câu đúng) · JSON hợp lệ (speaking) ·
// feedback đúng tiếng Việt.
//
// ⚠️ CHẠY TAY, TỐN PHÍ API — KHÔNG đưa vào CI. Cần 1 trong: GEMINI_API_KEY / GROQ_API_KEY /
// ANTHROPIC_API_KEY (ưu tiên theo đúng thứ tự như api/ai.ts). Đặt trong .env ở gốc dự án.
//
// Dùng:
//   npm run eval:tutor                          # chế độ chat, in bảng ra stdout
//   npm run eval:tutor -- --mode speaking       # chế độ speaking (JSON)
//   npm run eval:tutor -- --mode both           # chạy cả hai
//   npm run eval:tutor -- --write-baseline      # ghi docs/research/eval-tutor-baseline.md
//   npm run eval:tutor -- --limit 5             # chỉ 5 câu đầu (thử nhanh)
//   npm run eval:tutor -- --delay 800           # giãn cách giữa các lời gọi (ms), tránh rate limit
//
// QUY TRÌNH (CLAUDE.md §8): mọi PR đổi prompt (src/prompts) hoặc model (aiConfig) PHẢI chạy lại
// eval và dán bảng so sánh với baseline vào mô tả PR.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'
import * as dotenv from 'dotenv'
import { chatSystemPrompt, speakingSystemPrompt } from '../apps/english/src/prompts/index.ts'
import { callGemini } from '@dhcb/core-ai/geminiApi'
import { fetchWithTimeout } from '@dhcb/core-http/fetchTimeout'
import {
  ALLOWED_MODEL,
  GEMINI_CHAT_MODEL,
  GROQ_CHAT_MODEL,
  SYSTEM_GUARDRAIL,
} from '@dhcb/core-ai/aiConfig'
import {
  parseFixtures,
  scoreOne,
  summarize,
  ERROR_TYPES,
  type EvalMode,
  type EvalResult,
  type ErrorType,
  type Fixture,
  type Summary,
} from './lib/evalScoring.ts'

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..')
const FIXTURES_PATH = path.join(SCRIPT_DIR, 'eval-tutor-fixtures.json')
const BASELINE_PATH = path.join(PROJECT_ROOT, 'docs', 'research', 'eval-tutor-baseline.md')

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const AI_TIMEOUT_MS = 30_000
const MAX_TOKENS = 1024

// ─── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function argVal(name: string, def: string): string {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1]! : def
}
const MODE_ARG = argVal('--mode', 'chat')
const LIMIT = Number(argVal('--limit', '0'))
const DELAY_MS = Number(argVal('--delay', '500'))
const WRITE_BASELINE = args.includes('--write-baseline')

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// ─── Chọn provider — GIỐNG thứ tự ưu tiên api/ai.ts (Gemini → Groq → Anthropic) ──
const GEMINI_KEY = process.env.GEMINI_API_KEY
const GROQ_KEY = process.env.GROQ_API_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

function providerLabel(): string {
  if (GEMINI_KEY) return `Gemini · ${GEMINI_CHAT_MODEL}`
  if (GROQ_KEY) return `Groq · ${GROQ_CHAT_MODEL}`
  if (ANTHROPIC_KEY) return `Anthropic · ${ALLOWED_MODEL}`
  return 'none'
}

type Msg = { role: 'user' | 'assistant'; content: string }

async function callGroq(system: string, messages: Msg[]): Promise<string> {
  const resp = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_KEY!}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: GROQ_CHAT_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    },
    AI_TIMEOUT_MS,
  )
  if (!resp.ok) throw new Error(`Groq ${resp.status}: ${(await resp.text()).slice(0, 200)}`)
  const data = (await resp.json()) as { choices?: Array<{ message?: { content?: unknown } }> }
  const text = data.choices?.[0]?.message?.content
  if (typeof text !== 'string') throw new Error('Groq trả về cấu trúc không hợp lệ')
  return text
}

async function callAnthropic(system: string, messages: Msg[]): Promise<string> {
  const resp = await fetchWithTimeout(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model: ALLOWED_MODEL, max_tokens: MAX_TOKENS, system, messages }),
    },
    AI_TIMEOUT_MS,
  )
  if (!resp.ok) throw new Error(`Anthropic ${resp.status}: ${(await resp.text()).slice(0, 200)}`)
  const data = (await resp.json()) as { content?: Array<{ text?: unknown }> }
  const text = data.content?.[0]?.text
  if (typeof text !== 'string') throw new Error('Anthropic trả về cấu trúc không hợp lệ')
  return text
}

async function callProvider(system: string, userText: string): Promise<string> {
  const messages: Msg[] = [{ role: 'user', content: userText }]
  if (GEMINI_KEY) return callGemini(GEMINI_KEY, GEMINI_CHAT_MODEL, system, messages, MAX_TOKENS)
  if (GROQ_KEY) return callGroq(system, messages)
  if (ANTHROPIC_KEY) return callAnthropic(system, messages)
  throw new Error('Chưa cấu hình GEMINI_API_KEY / GROQ_API_KEY / ANTHROPIC_API_KEY')
}

// Dựng system prompt ĐÚNG như production: guardrail (server) + prompt nền theo mode (client).
// Situation 'free' để trung tính; dir 'A' (người Việt học tiếng Anh) — nơi VIET_COMMON_ERRORS áp dụng.
function systemFor(mode: EvalMode, fx: Fixture): string {
  const base =
    mode === 'speaking'
      ? speakingSystemPrompt('free', fx.level, fx.dir)
      : chatSystemPrompt('free', fx.level, fx.dir)
  return SYSTEM_GUARDRAIL + base
}

async function runMode(mode: EvalMode, fixtures: Fixture[]): Promise<EvalResult[]> {
  const out: EvalResult[] = []
  process.stderr.write(`\n▶ Chế độ ${mode} — ${fixtures.length} câu\n`)
  for (let i = 0; i < fixtures.length; i++) {
    const fx = fixtures[i]!
    process.stderr.write(`  ${String(i + 1).padStart(2)}/${fixtures.length} ${fx.id} … `)
    try {
      const text = await callProvider(systemFor(mode, fx), fx.input)
      const r = scoreOne(mode, fx, text)
      out.push(r)
      process.stderr.write(`${r.outcome}${r.jsonValid === false ? ' (JSON hỏng)' : ''}\n`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      out.push({
        id: fx.id,
        kind: fx.kind,
        expectedErrors: fx.expectedErrors,
        outcome: 'FN', // placeholder — bị loại khỏi metric vì providerError
        feedbackNonEmpty: false,
        feedbackVi: false,
        jsonValid: mode === 'speaking' ? false : null,
        typeHit: false,
        providerError: msg,
      })
      process.stderr.write(`LỖI: ${msg}\n`)
    }
    if (DELAY_MS > 0 && i < fixtures.length - 1) await sleep(DELAY_MS)
  }
  return out
}

// ─── Định dạng báo cáo markdown ─────────────────────────────────────────────────
function pct(x: number | null): string {
  return x === null ? 'n/a' : `${(x * 100).toFixed(1)}%`
}

function recallByType(
  results: EvalResult[],
): Array<{ type: ErrorType; total: number; hit: number }> {
  const map = new Map<ErrorType, { total: number; hit: number }>()
  for (const t of ERROR_TYPES) map.set(t, { total: 0, hit: 0 })
  for (const r of results) {
    if (r.providerError) continue
    for (const t of r.expectedErrors) {
      const e = map.get(t)!
      e.total++
      if (r.outcome === 'TP') e.hit++
    }
  }
  return ERROR_TYPES.map((t) => ({ type: t, ...map.get(t)! }))
}

interface Section {
  mode: EvalMode
  summary: Summary
  results: EvalResult[]
}

function renderReport(fixtures: Fixture[], sections: Section[]): string {
  const nErr = fixtures.filter((f) => f.kind === 'error').length
  const nOk = fixtures.filter((f) => f.kind === 'correct').length
  const nEdge = fixtures.filter((f) => f.kind === 'edge').length
  const L: string[] = []
  L.push('# Eval gia sư AI — baseline (⑤ T1)')
  L.push('')
  L.push('> Sinh tự động bởi `npm run eval:tutor -- --write-baseline`. KHÔNG sửa tay phần số liệu.')
  L.push('> Phương pháp + cách đọc chỉ số: xem cuối file.')
  L.push('')
  L.push(`- **Ngày chạy:** ${new Date().toISOString().slice(0, 10)}`)
  L.push(`- **Provider · model:** ${providerLabel()}`)
  L.push(`- **Golden set:** ${fixtures.length} câu (${nErr} lỗi · ${nOk} đúng · ${nEdge} ca biên)`)
  L.push(`- **Chế độ chạy:** ${sections.map((s) => s.mode).join(', ')}`)
  L.push('')
  L.push('## Tổng hợp')
  L.push('')
  L.push(
    '| Chế độ | Chấm được | Recall | Precision | FP-rate | Specificity | Feedback VI | JSON hợp lệ | Type-hit* |',
  )
  L.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |')
  for (const s of sections) {
    const m = s.summary
    L.push(
      `| ${s.mode} | ${m.scored}${m.providerErrors ? ` (+${m.providerErrors} lỗi)` : ''} | ${pct(m.recall)} | ${pct(m.precision)} | ${pct(m.falsePositiveRate)} | ${pct(m.specificity)} | ${pct(m.feedbackViRate)} | ${s.mode === 'speaking' ? pct(m.jsonValidRate) : '—'} | ${pct(m.typeHitRate)} |`,
    )
  }
  L.push('')
  for (const s of sections) {
    L.push(`## Recall theo loại lỗi — chế độ ${s.mode}`)
    L.push('')
    L.push('| Loại lỗi | Bắt được / Tổng |')
    L.push('| --- | --- |')
    for (const row of recallByType(s.results)) {
      L.push(`| ${row.type} | ${row.hit}/${row.total} |`)
    }
    L.push('')
    const fn = s.results.filter((r) => !r.providerError && r.outcome === 'FN').map((r) => r.id)
    const fp = s.results.filter((r) => !r.providerError && r.outcome === 'FP').map((r) => r.id)
    const perr = s.results.filter((r) => r.providerError).map((r) => r.id)
    L.push(`**Bỏ sót lỗi (FN):** ${fn.length ? fn.join(', ') : 'không'}`)
    L.push('')
    L.push(`**Bịa lỗi ở câu đúng/ca biên (FP):** ${fp.length ? fp.join(', ') : 'không'}`)
    L.push('')
    if (perr.length) {
      L.push(`**Provider lỗi (không chấm được):** ${perr.join(', ')}`)
      L.push('')
    }
  }
  L.push('## Cách đọc')
  L.push('')
  L.push('- **Recall** = bắt được lỗi thật / tổng câu có lỗi. Cao = ít bỏ sót.')
  L.push('- **Precision** = báo lỗi đúng / tổng lần báo lỗi. Cao = ít bịa.')
  L.push(
    '- **FP-rate** = bịa lỗi trên câu đúng/ca biên. Thấp = tốt (với người mới, sửa SAI hại hơn bỏ SÓT).',
  )
  L.push('- **Feedback VI** = tỉ lệ nhận xét (chiều A) đúng bằng tiếng Việt.')
  L.push(
    '- **JSON hợp lệ** = tỉ lệ câu trả lời speaking đúng schema `{speech,feedback,corrected}`.',
  )
  L.push(
    '- **Type-hit\\*** = ĐO GẦN ĐÚNG bằng từ khoá xem nhận xét có nhắm đúng loại lỗi không — CHỈ tham khảo, không dùng để pass/fail.',
  )
  L.push('')
  return L.join('\n')
}

// ─── main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  if (providerLabel() === 'none') {
    console.error(
      '❌ Chưa có key AI. Đặt GEMINI_API_KEY (hoặc GROQ_API_KEY / ANTHROPIC_API_KEY) trong .env rồi chạy lại.',
    )
    process.exit(1)
  }
  if (!['chat', 'speaking', 'both'].includes(MODE_ARG)) {
    console.error(`❌ --mode không hợp lệ: "${MODE_ARG}" (cho phép: chat | speaking | both)`)
    process.exit(1)
  }

  let fixtures = parseFixtures(JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')))
  if (LIMIT > 0) fixtures = fixtures.slice(0, LIMIT)

  const modes: EvalMode[] = MODE_ARG === 'both' ? ['chat', 'speaking'] : [MODE_ARG as EvalMode]
  process.stderr.write(
    `Provider: ${providerLabel()} · ${fixtures.length} câu · delay ${DELAY_MS}ms\n`,
  )

  const sections: Section[] = []
  for (const mode of modes) {
    const results = await runMode(mode, fixtures)
    sections.push({ mode, summary: summarize(results), results })
  }

  const doc = renderReport(fixtures, sections)
  process.stdout.write('\n' + doc + '\n')
  if (WRITE_BASELINE) {
    writeFileSync(BASELINE_PATH, doc + '\n')
    process.stderr.write(`\n✅ Đã ghi ${path.relative(PROJECT_ROOT, BASELINE_PATH)}\n`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
