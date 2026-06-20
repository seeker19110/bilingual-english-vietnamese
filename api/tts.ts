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
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  let body: { text?: string; lang?: string; voice?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Body JSON không hợp lệ' }, 400)
  }

  const text = body.text?.trim()
  const lang = body.lang?.trim() || 'en-US'
  const voiceParam = body.voice?.trim() || DEFAULT_VOICE

  if (!text) return jsonResponse({ error: 'Thiếu text' }, 400)
  if (!isValidLang(lang)) return jsonResponse({ error: `lang không hợp lệ: ${lang}` }, 400)
  if (!isValidVoice(voiceParam)) return jsonResponse({ error: `voice không hợp lệ: ${voiceParam}` }, 400)

  const voice = voiceParam

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
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
    return jsonResponse({ audio_url: cachedUrl, cached: true })
  }

  // ── BƯỚC 2: Cache MISS → gọi Google TTS ────────────────────────────────────
  let audioData: ArrayBuffer
  try {
    audioData = await generateAudioFromGoogle(text, voice, lang)
  } catch (err) {
    return jsonResponse({ error: `Không thể tạo audio: ${(err as Error).message}` }, 500)
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
    return jsonResponse({ error: `Upload thất bại: ${uploadError.message}` }, 500)
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

  return jsonResponse({ audio_url: audioUrl, cached: false })
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
  })
}

export const config = { runtime: 'edge' }
