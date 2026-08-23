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
import { GoogleGenAI, Modality } from '@google/genai'

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

// ── Bước 2+3: mở phiên thật bằng SDK CHÍNH THỨC ─────────────────────────────
//
// [2026-08-23] ĐỔI TỪ WEBSOCKET TỰ DỰNG SANG SDK. Bản tự dựng bắt tay được nhưng Google đóng
// ngay với `1011 Internal error encountered` ở CẢ v1alpha lẫn v1beta, kể cả khi gói `setup`
// tối giản (chỉ `model`). Phép thử đường dẫn bịa trả 404 ngay → chứng minh endpoint KHÔNG phải
// nguyên nhân. Tức lỗi nằm ở chi tiết giao thức mà ta không nhìn thấy được từ ngoài — đúng lúc
// nên ngừng đoán và dùng thư viện chính chủ (`@google/genai`), nơi endpoint/xác thực/khung
// setup do Google tự lo.
function runLiveSession(apiKey: string, model: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let done = false
    const finish = (fn: () => void) => {
      if (done) return
      done = true
      clearTimeout(timer)
      fn()
    }

    const timer = setTimeout(
      () =>
        finish(() =>
          reject(new Error('Không nhận được phản hồi nào trong 30s (SDK không báo lỗi lẫn đóng).')),
        ),
      TIMEOUT_MS,
    )

    void (async () => {
      try {
        const ai = new GoogleGenAI({ apiKey })
        const session = await ai.live.connect({
          model,
          config: { responseModalities: [Modality.TEXT] },
          callbacks: {
            onopen: () => console.log('   • Phiên Live đã mở (SDK)'),
            onmessage: (msg) => {
              const text = msg.serverContent?.modelTurn?.parts
                ?.map((p) => p.text)
                .filter(Boolean)
                .join('')
              if (text) {
                console.log(`   • ✅ Model trả lời: "${text.trim().slice(0, 120)}"`)
                finish(resolve)
              } else if (msg.setupComplete) {
                console.log('   • ✅ setupComplete — Google chấp nhận model')
              }
            },
            // Đây chính là thứ bản tự dựng KHÔNG in ra, khiến mọi lỗi thành "timeout bí ẩn".
            onerror: (e) => finish(() => reject(new Error(`SDK báo lỗi: ${e.message}`))),
            onclose: (e) =>
              finish(() =>
                reject(
                  new Error(`Google đóng phiên — mã ${e.code}: ${e.reason || '(không lý do)'}`),
                ),
              ),
          },
        })

        console.log('   • Gửi một lượt text để lấy phản hồi thật…')
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text: 'Say hello in one short sentence.' }] }],
          turnComplete: true,
        })
      } catch (err) {
        finish(() => reject(err instanceof Error ? err : new Error(String(err))))
      }
    })()
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

  // Ưu tiên model đang cấu hình nếu nó CÒN dùng được. Không thì ưu tiên model có chữ 'live'
  // (đối thoại text/audio hai chiều) thay vì lấy bừa cái đầu danh sách — cái đầu thường là
  // model 'native-audio', loại CHỈ trả audio nên xin TEXT sẽ bị từ chối (bài học 2026-08-23:
  // script từng chọn native-audio rồi treo 30s không rõ lý do).
  const configured = process.env.GEMINI_LIVE_MODEL
  const chosen =
    configured && models.includes(configured)
      ? configured
      : (models.find((m) => /(^|-)live-/.test(m)) ?? models[0]!)
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
