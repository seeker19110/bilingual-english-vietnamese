// api/stt.ts — Vercel Edge Function / chạy qua server.ts (Express) khi deploy VPS
// Endpoint: POST /api/stt
// Body: { audio_b64: string, mime?: string, lang?: 'en' | 'vi' }
// Trả về: { text: string }
//
// Nhiệm vụ: nhận đoạn audio người dùng vừa nói (ghi âm ở trình duyệt bằng MediaRecorder,
// mã hóa base64) → gọi Groq/OpenAI Whisper → trả lại văn bản để đưa vào luồng hội thoại
// trong chế độ "Luyện nói song ngữ".
//
// Khác với /api/tts: STT không cache (mỗi lần nói là audio khác nhau), nên chỉ cần
// auth + rate limit + giới hạn dung lượng. API key giữ ở server — xem api/_lib/openaiStt.ts
// (ưu tiên GROQ_API_KEY, fallback OPENAI_API_KEY).

import { transcribeAudio, type SttLang } from './_lib/openaiStt'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  validateContentType,
  logSecurityEvent,
} from './_lib/security'
import { checkAndConsumeUsage, refundUsage } from './_lib/usage'

// Giới hạn dung lượng base64 (~8MB chuỗi ≈ ~6MB audio thật, đủ cho ~1–2 phút nói).
const MAX_AUDIO_B64 = 8 * 1024 * 1024
const VALID_LANGS: SttLang[] = ['en', 'vi']

function isValidLang(v: string): v is SttLang {
  return VALID_LANGS.includes(v as SttLang)
}

// Giải mã base64 → ArrayBuffer (dùng atob của Web API cho cả Edge lẫn Node).
function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders(req)
  const allHeaders = { ...corsHeaders, ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: allHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!validateContentType(req)) {
    logSecurityEvent('INVALID_CONTENT_TYPE', clientIp, { path: '/api/stt' })
    return jsonResponse({ error: 'Content-Type phải là application/json' }, 415, allHeaders)
  }

  // Rate limit: 15 request/phút mỗi IP (STT tốn tiền API nên giới hạn chặt vừa phải).
  if (!checkRateLimit(clientIp, 15)) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/stt' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  // Bắt buộc đăng nhập — tránh người lạ lạm dụng API tốn tiền.
  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/stt' })
    return jsonResponse({ error: 'Chưa đăng nhập hoặc phiên hết hạn' }, 401, allHeaders)
  }

  let body: { audio_b64?: string; mime?: string; lang?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Body JSON không hợp lệ' }, 400, allHeaders)
  }

  const audioB64 = body.audio_b64?.trim()
  const mime = body.mime?.trim() || 'audio/webm'
  const lang = body.lang?.trim() || 'en'

  if (!audioB64) return jsonResponse({ error: 'Thiếu audio_b64' }, 400, allHeaders)
  if (audioB64.length > MAX_AUDIO_B64) {
    return jsonResponse({ error: 'Đoạn ghi âm quá dài — nói ngắn hơn' }, 413, allHeaders)
  }
  if (!isValidLang(lang)) {
    return jsonResponse({ error: `lang không hợp lệ: ${lang}` }, 400, allHeaders)
  }

  let audio: ArrayBuffer
  try {
    audio = base64ToArrayBuffer(audioB64)
  } catch {
    return jsonResponse({ error: 'audio_b64 không phải base64 hợp lệ' }, 400, allHeaders)
  }

  // Giới hạn lượt STT ở SERVER (theo gói Free/Pro) — STT tốn tiền API riêng.
  const gate = await checkAndConsumeUsage(authResult.userId, 'stt')
  if (!gate.ok) {
    logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/stt' })
    return jsonResponse({ error: gate.message }, 429, allHeaders)
  }

  try {
    const text = await transcribeAudio(audio, mime, lang)
    return jsonResponse({ text }, 200, allHeaders)
  } catch (err) {
    // Provider STT lỗi → người dùng không nhận được kết quả: hoàn lại lượt vừa trừ.
    await refundUsage(authResult.userId, 'stt')
    return jsonResponse(
      { error: `Không nhận diện được giọng nói: ${(err as Error).message}` },
      500,
      allHeaders,
    )
  }
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

export const config = { runtime: 'edge' }
