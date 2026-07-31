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

import { z } from 'zod'
import { transcribeAudio, type SttLang } from './openaiStt.js'
import { withConcurrencyLimit } from '../core-db/concurrencyLimiter.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  validateContentType,
  logSecurityEvent,
} from '../../api/_lib/security.js'
import { checkAndConsumeUsage, refundUsage } from '../../api/_lib/usage.js'
import { readJsonBody, validateBody } from '../../api/_lib/validation.js'
import { jsonResponse, getClientIp } from '../../api/_lib/http.js'
import { base64ToBytes } from '../core-db/base64.js'

// Giới hạn dung lượng base64 (~8MB chuỗi ≈ ~6MB audio thật, đủ cho ~1–2 phút nói).
const MAX_AUDIO_B64 = 8 * 1024 * 1024
const VALID_LANGS: SttLang[] = ['en', 'vi']

function isValidLang(v: string): v is SttLang {
  return VALID_LANGS.includes(v as SttLang)
}

const SttBodySchema = z.object({
  audio_b64: z
    .string({ error: 'Thiếu audio_b64' })
    .trim()
    .min(1, 'Thiếu audio_b64')
    .refine((v) => v.length <= MAX_AUDIO_B64, {
      error: 'Đoạn ghi âm quá dài — nói ngắn hơn',
      params: { status: 413 },
    }),
  mime: z.string().trim().optional(),
  lang: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : 'en'))
    .refine((v): v is SttLang => isValidLang(v), {
      error: (ctx) => `lang không hợp lệ: ${ctx.input}`,
    }),
})

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders(req)
  const allHeaders = { ...corsHeaders, ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: allHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  const clientIp = getClientIp(req)

  if (!validateContentType(req)) {
    logSecurityEvent('INVALID_CONTENT_TYPE', clientIp, { path: '/api/stt' })
    return jsonResponse({ error: 'Content-Type phải là application/json' }, 415, allHeaders)
  }

  // Rate limit: 15 request/phút mỗi IP (STT tốn tiền API nên giới hạn chặt vừa phải).
  if (!(await checkRateLimit(clientIp, 15))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/stt' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  // Bắt buộc đăng nhập — tránh người lạ lạm dụng API tốn tiền.
  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/stt' })
    return jsonResponse({ error: 'Chưa đăng nhập hoặc phiên hết hạn' }, 401, allHeaders)
  }

  const bodyResult = await readJsonBody(req)
  if (!bodyResult.ok) {
    return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, allHeaders)
  }
  const parsed = validateBody(SttBodySchema, bodyResult.raw)
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error.message }, parsed.error.status, allHeaders)
  }

  const audioB64 = parsed.data.audio_b64
  const mime = parsed.data.mime || 'audio/webm'
  const lang = parsed.data.lang

  let audio: ArrayBuffer
  try {
    audio = base64ToBytes(audioB64).buffer as ArrayBuffer
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
    const text = await withConcurrencyLimit('stt', () => transcribeAudio(audio, mime, lang))
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

export const config = { runtime: 'edge' }
