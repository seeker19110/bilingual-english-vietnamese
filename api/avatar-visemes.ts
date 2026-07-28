// api/avatar-visemes.ts — Trả dãy viseme (hình miệng) THEO TỪNG TỪ cho 1 câu, dùng để đồng bộ
// avatar AI nói chuyện (PoC — xem docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md).
// KHÔNG gọi API trả phí nào — chạy eSpeak-ng OFFLINE trên chính server (api/_lib/espeakPhonemes.ts).
// Nếu server chưa cài eSpeak-ng (hoặc lỗi), trả `wordVisemes: null` — client tự fallback về cách
// ước lượng thô hơn (đếm nguyên âm chữ viết, xem src/lib/viseme.ts fallbackWordVisemes()).
//
// POST /api/avatar-visemes
// Body: { text: string, lang: 'en-US' | 'vi-VN' }
// Trả về: { wordVisemes: Viseme[][] | null }

import { z } from 'zod'
import { wordVisemesFromEspeak } from './_lib/espeakPhonemes.js'
import { validateAuth, checkRateLimit, validateContentType } from './_lib/security.js'
import { getCorsHeaders, SECURITY_HEADERS, logSecurityEvent } from './_lib/security.js'
import { readJsonBody, validateBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

// Cùng trần độ dài như /api/tts (api/tts.ts) — không cho câu quá dài đẩy vào tiến trình con.
const MAX_TEXT_LENGTH = 4000

const BodySchema = z.object({
  text: z
    .string({ error: 'Thiếu text' })
    .trim()
    .min(1, 'Thiếu text')
    .refine((v) => v.length <= MAX_TEXT_LENGTH, {
      error: `Văn bản quá dài — tối đa ${MAX_TEXT_LENGTH} ký tự`,
      params: { status: 413 },
    }),
  lang: z.enum(['en-US', 'vi-VN'], { error: 'lang không hợp lệ' }),
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
    logSecurityEvent('INVALID_CONTENT_TYPE', clientIp, { path: '/api/avatar-visemes' })
    return jsonResponse({ error: 'Content-Type phải là application/json' }, 415, allHeaders)
  }

  // Rate limit chặt hơn /api/tts — mỗi lần gọi spawn 1 tiến trình con (eSpeak-ng), tốn CPU
  // (đáng kể hơn tra cache DB thông thường) dù không tốn tiền API.
  if (!(await checkRateLimit(clientIp, 30, 'avatar-visemes'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/avatar-visemes' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/avatar-visemes' })
    return jsonResponse({ error: 'Chưa đăng nhập hoặc phiên hết hạn' }, 401, allHeaders)
  }

  const bodyResult = await readJsonBody(req)
  if (!bodyResult.ok) {
    return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, allHeaders)
  }
  const parsed = validateBody(BodySchema, bodyResult.raw)
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error.message }, parsed.error.status, allHeaders)
  }

  const { text, lang } = parsed.data
  const words = text.split(/\s+/).filter(Boolean)

  const wordVisemes = await wordVisemesFromEspeak(words, lang)

  return jsonResponse({ wordVisemes }, 200, allHeaders)
}
