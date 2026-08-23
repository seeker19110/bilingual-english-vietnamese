// scripts/smoke-gemini-live.ts — Kiểm THẬT Gemini Live API bằng GEMINI_API_KEY của bạn.
//
// VÌ SAO CÓ SCRIPT NÀY: phiên AI chạy trong sandbox KHÔNG có key AI, nên không thể tự xác minh
// `packages/core-ai/geminiLiveService.ts` chạy được với Google hay không — nợ này đã treo từ
// 2026-08-21. Script biến việc đó thành MỘT LỆNH bạn chạy trên máy có key.
//
//   npm run smoke:gemini-live
//
// Nó làm 3 việc, dừng ngay ở bước đầu tiên thất bại và nói rõ phải sửa gì:
//   1. Hỏi Google xem TÀI KHOẢN CỦA BẠN được dùng model Live nào (ListModels, lọc
//      bidiGenerateContent) — thay vì tin một cái tên ghim sẵn trong code.
//   2. Mở WebSocket thật, gửi gói `setup`, chờ `setupComplete`.
//   3. Gửi một lượt text ngắn, chờ phản hồi đầu tiên của model.
//
// Thoát 0 = chạy được. Thoát 1 = có vấn đề, đọc thông báo để biết sửa ở đâu.

import * as dotenv from 'dotenv'
import { WebSocket } from 'ws'
import { DEFAULT_GEMINI_LIVE_WS_URL } from '../packages/core-ai/geminiLiveService.js'

dotenv.config()

const REST_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const TIMEOUT_MS = 30_000

function die(msg: string): never {
  console.error(`\n❌ ${msg}\n`)
  process.exit(1)
}

// ── Bước 1: model nào thực sự dùng được cho Live? ───────────────────────────
async function listLiveModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${REST_BASE}/models?key=${encodeURIComponent(apiKey)}&pageSize=200`)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    die(
      `Không liệt kê được model (HTTP ${res.status}). Kiểm tra GEMINI_API_KEY còn hiệu lực và ` +
        `đã bật Generative Language API chưa.\n${body.slice(0, 400)}`,
    )
  }
  const data = (await res.json()) as {
    models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>
  }
  return (data.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.some((x) => /bidiGenerateContent/i.test(x)))
    .map((m) => (m.name ?? '').replace(/^models\//, ''))
    .filter(Boolean)
}

// ── Bước 2+3: mở phiên thật, chào hỏi một câu ───────────────────────────────
function runLiveSession(apiKey: string, model: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const base = process.env.GEMINI_LIVE_WS_URL || DEFAULT_GEMINI_LIVE_WS_URL
    const ws = new WebSocket(`${base}?key=${encodeURIComponent(apiKey)}`)
    let setupDone = false

    const timer = setTimeout(() => {
      ws.close()
      reject(
        new Error(
          setupDone
            ? 'Đã setup xong nhưng KHÔNG nhận được phản hồi nào của model trong 30s.'
            : `Không nhận được setupComplete trong 30s. Nghi endpoint sai — đang dùng:\n   ${base}`,
        ),
      )
    }, TIMEOUT_MS)

    ws.on('open', () => {
      console.log('   • WebSocket đã mở, gửi gói setup…')
      ws.send(
        JSON.stringify({
          setup: {
            model: `models/${model}`,
            generationConfig: { responseModalities: ['TEXT'] },
          },
        }),
      )
    })

    ws.on('message', (raw) => {
      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        return
      }

      if (msg.setupComplete && !setupDone) {
        setupDone = true
        console.log('   • ✅ setupComplete — Google chấp nhận model và endpoint')
        console.log('   • Gửi một lượt text để lấy phản hồi thật…')
        ws.send(
          JSON.stringify({
            clientContent: {
              turns: [{ role: 'user', parts: [{ text: 'Say hello in one short sentence.' }] }],
              turnComplete: true,
            },
          }),
        )
        return
      }

      const server = msg.serverContent as
        { modelTurn?: { parts?: Array<{ text?: string }> } } | undefined
      const text = server?.modelTurn?.parts
        ?.map((p) => p.text)
        .filter(Boolean)
        .join('')
      if (text) {
        console.log(`   • ✅ Model trả lời: "${text.trim().slice(0, 120)}"`)
        clearTimeout(timer)
        ws.close()
        resolve()
      }
    })

    ws.on('error', (err) => {
      clearTimeout(timer)
      reject(new Error(`Lỗi WebSocket: ${String(err)}`))
    })
  })
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    die('Thiếu GEMINI_API_KEY. Thêm vào .env rồi chạy lại: GEMINI_API_KEY=...')
  }

  console.log('\n🔎 Kiểm tra Gemini Live API bằng key thật\n')

  console.log('1) Model nào tài khoản này dùng được cho Live?')
  const models = await listLiveModels(apiKey)
  if (models.length === 0) {
    die(
      'Tài khoản KHÔNG có model nào hỗ trợ bidiGenerateContent (Live API).\n' +
        'Có thể key thuộc gói/khu vực chưa mở Live API. Kiểm tra lại trên Google AI Studio.',
    )
  }
  console.log(`   • Dùng được ${models.length} model: ${models.join(', ')}`)

  // Ưu tiên model đang cấu hình nếu nó nằm trong danh sách; không thì lấy cái đầu tiên.
  const configured = process.env.GEMINI_LIVE_MODEL
  const chosen = configured && models.includes(configured) ? configured : models[0]!
  if (configured && !models.includes(configured)) {
    console.log(
      `   • ⚠️  GEMINI_LIVE_MODEL="${configured}" KHÔNG nằm trong danh sách trên — ` +
        `sẽ thử "${chosen}". Nên sửa .env thành model này.`,
    )
  }

  console.log(`\n2+3) Mở phiên Live thật với model "${chosen}"`)
  await runLiveSession(apiKey, chosen)

  console.log('\n✅ XONG — Gemini Live chạy được với key này.')
  console.log(`   Đặt vào .env trên VPS:  GEMINI_LIVE_MODEL=${chosen}\n`)
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)))
