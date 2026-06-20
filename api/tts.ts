// api/tts.ts — Vercel Edge Function
// Endpoint: POST /api/tts
// Body: { text: string, lang: 'en-US' | 'vi-VN', voice?: 'female' | 'male' }
// Trả về: { audio_url: string, cached: boolean }
//
// Luồng xử lý:
//   1. Hash (text + lang + voice) → tìm trong bảng tts_cache (Supabase DB)
//   2. Cache HIT → trả audio_url luôn, không tốn API
//   3. Cache MISS → gọi Google TTS → upload mp3 lên Supabase Storage → lưu DB → trả URL
//
// Chiến lược cache dùng chung: câu nào đã phát sinh 1 lần thì mọi user sau dùng lại,
// không tốn thêm tiền API nữa.

import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import { generateAudioFromGoogle, isValidVoice, DEFAULT_VOICE, type Lang } from './_lib/googleTts'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  validateContentType,
  logSecurityEvent,
} from './_lib/security'

const VALID_LANGS: Lang[] = ['en-US', 'vi-VN']

function isValidLang(value: string): value is Lang {
  return VALID_LANGS.includes(value as Lang)
}

// Hash đơn giản dùng để tạo tên file + key tìm kiếm trong DB
// Không cần bảo mật, chỉ cần ngắn + ít xung đột
async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
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

  // Lấy IP để rate limit
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // Kiểm tra Content-Type
  if (!validateContentType(req)) {
    logSecurityEvent('INVALID_CONTENT_TYPE', clientIp, { path: '/api/tts' })
    return jsonResponse({ error: 'Content-Type phải là application/json' }, 415, allHeaders)
  }

  // Rate limit: 10 request/phút mỗi IP (TTS tốn tiền ít hơn AI nhưng vẫn cần giới hạn)
  if (!checkRateLimit(clientIp, 10)) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/tts' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  // Xác thực người dùng qua Supabase JWT
  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/tts' })
    return jsonResponse({ error: 'Chưa đăng nhập hoặc phiên hết hạn' }, 401, allHeaders)
  }

  let body: { text?: string; lang?: string; voice?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Body JSON không hợp lệ' }, 400, allHeaders)
  }

  const text = body.text?.trim()
  const lang = body.lang?.trim() || 'en-US'
  const voiceParam = body.voice?.trim() || DEFAULT_VOICE

  if (!text) return jsonResponse({ error: 'Thiếu text' }, 400, allHeaders)
  if (!isValidLang(lang)) return jsonResponse({ error: `lang không hợp lệ: ${lang}` }, 400, allHeaders)
  if (!isValidVoice(voiceParam)) return jsonResponse({ error: `voice không hợp lệ: ${voiceParam}` }, 400, allHeaders)

  const voice = voiceParam

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500, allHeaders)
  }

  // ── BƯỚC 1: Kiểm tra cache ──────────────────────────────────────────────────
  const textHash = await hashText(text + lang + voice)

  const { data: cachedRow } = await supabase
    .from('tts_cache')
    .select('audio_url')
    .eq('hash', textHash)
    .maybeSingle()

  const cachedUrl = (cachedRow as { audio_url?: string } | null)?.audio_url
  if (cachedUrl) {
    return jsonResponse({ audio_url: cachedUrl, cached: true }, 200, allHeaders)
  }

  // ── BƯỚC 2: Cache MISS → gọi Google TTS ────────────────────────────────────
  let audioData: ArrayBuffer
  try {
    audioData = await generateAudioFromGoogle(text, voice, lang)
  } catch (err) {
    return jsonResponse({ error: `Không thể tạo audio: ${(err as Error).message}` }, 500, allHeaders)
  }

  // ── BƯỚC 3: Upload lên Supabase Storage (bucket "tts-cache") ───────────────
  const fileName = `${lang}/${voice}/${textHash}.mp3`
  const { error: uploadError } = await supabase.storage
    .from('tts-cache')
    .upload(fileName, audioData, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (uploadError) {
    return jsonResponse({ error: `Upload thất bại: ${uploadError.message}` }, 500, allHeaders)
  }

  // ── BƯỚC 4: Lưu vào DB ─────────────────────────────────────────────────────
  const { data: urlData } = supabase.storage.from('tts-cache').getPublicUrl(fileName)
  const audioUrl = urlData.publicUrl

  const { error: insertError } = await supabase
    .from('tts_cache')
    .upsert({ hash: textHash, lang, voice, audio_url: audioUrl }, { onConflict: 'hash' })

  if (insertError) {
    console.error('Lỗi lưu tts_cache:', insertError.message)
  }

  return jsonResponse({ audio_url: audioUrl, cached: false }, 200, allHeaders)
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

export const config = { runtime: 'edge' }
