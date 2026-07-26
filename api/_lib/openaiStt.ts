// api/_lib/openaiStt.ts
// Speech-to-Text (nhận diện giọng nói) — hỗ trợ CẢ Groq lẫn OpenAI (cùng chuẩn API).
// CHỈ chạy ở server — KHÔNG bao giờ import file này từ code phía browser (src/),
// vì sẽ lộ API key. Tiền tố "_" trong "_lib" để Vercel không coi đây là API route.
//
// Tự chọn nhà cung cấp theo biến môi trường:
//   - Có GROQ_API_KEY  → dùng Groq (Whisper large v3 turbo — nhanh & rẻ), endpoint
//     tương thích chuẩn OpenAI.
//   - Ngược lại         → dùng OpenAI (OPENAI_API_KEY, model gpt-4o-mini-transcribe).
// Có thể ép model riêng qua STT_MODEL.

import { fetchWithTimeout } from './fetchTimeout.js'

// STT có thể chậm hơn chat (phải xử lý cả file audio) → cho timeout rộng hơn.
const STT_TIMEOUT_MS = 45_000

export type SttLang = 'en' | 'vi'

interface SttProvider {
  url: string
  apiKey: string
  model: string
  name: string
}

// Quyết định dùng nhà cung cấp nào dựa trên key có sẵn trong môi trường.
function resolveProvider(): SttProvider {
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    return {
      name: 'Groq',
      url: 'https://api.groq.com/openai/v1/audio/transcriptions',
      apiKey: groqKey,
      model: process.env.STT_MODEL || 'whisper-large-v3-turbo',
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    return {
      name: 'OpenAI',
      url: 'https://api.openai.com/v1/audio/transcriptions',
      apiKey: openaiKey,
      // Giữ tương thích ngược với biến cũ OPENAI_STT_MODEL.
      model: process.env.STT_MODEL || process.env.OPENAI_STT_MODEL || 'gpt-4o-mini-transcribe',
    }
  }

  throw new Error('Server chưa cấu hình GROQ_API_KEY hoặc OPENAI_API_KEY')
}

// Đoán đuôi file từ mime để API nhận đúng định dạng audio.
function extFromMime(mime: string): string {
  if (mime.includes('wav')) return 'wav'
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'mp4'
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3'
  if (mime.includes('ogg')) return 'ogg'
  return 'webm' // mặc định: bản ghi MediaRecorder trên Chrome/Firefox là webm/opus
}

// Gửi audio lên nhà cung cấp STT và nhận lại văn bản. `lang` giúp phiên âm chính xác hơn.
export async function transcribeAudio(
  audio: ArrayBuffer,
  mime: string,
  lang: SttLang,
): Promise<string> {
  const provider = resolveProvider()

  const cleanMime = mime || 'audio/webm'
  const blob = new Blob([audio], { type: cleanMime })

  // Cả Groq lẫn OpenAI đều nhận multipart/form-data với 1 file audio.
  const form = new FormData()
  form.append('file', blob, `audio.${extFromMime(cleanMime)}`)
  form.append('model', provider.model)
  form.append('language', lang)
  form.append('response_format', 'json')

  const resp = await fetchWithTimeout(
    provider.url,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${provider.apiKey}` },
      body: form,
    },
    STT_TIMEOUT_MS,
  )

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    throw new Error(`${provider.name} STT lỗi (${resp.status}): ${detail.slice(0, 200)}`)
  }

  // Ném lỗi khi thiếu/sai kiểu trường `text` — để nơi gọi (api/stt.ts) hoàn lượt,
  // giống nguyên tắc đã áp dụng cho nhánh Groq của /api/agent (xem parseGroqText
  // trong api/ai.ts): 200 nhưng body hỏng KHÔNG được coi là thành công. Chuỗi RỖNG
  // hợp lệ (im lặng thật, không phát hiện giọng nói) vẫn được trả về bình thường,
  // không throw — chỉ throw khi cấu trúc response sai (không phải im lặng).
  const data = (await resp.json()) as { text?: unknown }
  if (typeof data.text !== 'string') {
    throw new Error(`${provider.name} STT trả về cấu trúc không hợp lệ (thiếu trường text)`)
  }
  return data.text.trim()
}
