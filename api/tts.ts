// api/tts.ts — Vercel Edge Function / chạy qua server.ts (Express) khi deploy VPS
// Endpoint: POST /api/tts
// Body: { text: string, lang: 'en-US' | 'vi-VN', voice?: 'female' | 'male' }
// Trả về: { audio_url: string, key_b64: string, iv_b64: string, cached: boolean }
//
// Luồng xử lý:
//   1. Hash (text + lang + voice) → tìm trong bảng tts_cache (Supabase DB)
//   2. Cache HIT → trả audio_url + khoá giải mã luôn, không tốn API
//   3. Cache MISS → gọi Google TTS → MÃ HÓA AES-256-GCM → lưu file qua saveAudio()
//      (local VPS hoặc Supabase Storage tùy STORAGE_DRIVER, xem api/_lib/fileStorage.ts)
//      → lưu DB → trả URL + khoá giải mã
//
// Chiến lược cache dùng chung: câu nào đã phát sinh 1 lần thì mọi user sau dùng lại,
// không tốn thêm tiền API nữa. Khác với api/pronunciation.ts (chỉ đọc 1 từ), endpoint
// này đọc cả câu/đoạn — dùng cho câu ví dụ, cụm từ, hội thoại trong Chat/Speaking.
//
// Bảo mật: file audio (bucket/thư mục "tts-cache") bị MÃ HÓA AES-256-GCM trước khi lưu —
// ai có link cũng không nghe được nếu không có khoá, và khoá chỉ phát cho request có JWT
// Supabase hợp lệ. validateAuth() ở dưới đã bắt buộc đăng nhập cho TOÀN BỘ endpoint
// này (không có chế độ ẩn danh) nên mọi response thành công đều kèm khoá giải mã.
// Chi tiết suy khoá: xem api/_lib/ttsCrypto.ts.

import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import { generateAudioFromGoogle, isValidVoice, DEFAULT_VOICE, VOICE_VERSION, type Lang } from './_lib/googleTts'
import { saveAudio } from './_lib/fileStorage'
import { encryptAudio, getClientKeyMaterial } from './_lib/ttsCrypto'
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

// Hash đơn giản dùng để tạo tên file + key tìm kiếm trong DB (KHÔNG phải khoá mã hóa —
// khoá mã hóa thật được suy ra riêng trong ttsCrypto.ts từ TTS_ENCRYPTION_MASTER_KEY).
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

  // Rate limit TỔNG: 60 request/phút mỗi IP. Phần lớn request là cache HIT (chỉ tra DB,
  // gần như miễn phí), nên hạn mức rộng để phát cả bài học / nghe nhiều câu liên tiếp
  // không bị chặn. Đường tạo audio mới (tốn tiền) có hạn mức riêng, chặt hơn ở BƯỚC 2.
  if (!checkRateLimit(clientIp, 60, 'tts')) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/tts' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  // Xác thực người dùng qua Supabase JWT — bắt buộc, vì audio cache bị mã hóa và
  // khoá giải mã chỉ phát cho người đã đăng nhập.
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
    console.error('[tts] Failed to initialize Supabase admin:', err)
    return jsonResponse({ error: 'Server configuration error' }, 500, allHeaders)
  }

  // ── BƯỚC 1: Kiểm tra cache ──────────────────────────────────────────────────
  // Khóa cache có kèm VOICE_VERSION → khi đổi giọng (đổi version), câu cũ không khớp
  // nữa nên sẽ tạo lại bằng giọng mới thay vì phát lại audio cũ.
  const textHash = await hashText(text + lang + voice + VOICE_VERSION)

  const { data: cachedRow } = await supabase
    .from('tts_cache')
    .select('audio_url')
    .eq('hash', textHash)
    .maybeSingle()

  const cachedUrl = (cachedRow as { audio_url?: string } | null)?.audio_url
  if (cachedUrl) {
    const { key_b64, iv_b64 } = await getClientKeyMaterial(textHash)
    return jsonResponse({ audio_url: cachedUrl, key_b64, iv_b64, cached: true }, 200, allHeaders)
  }

  // ── BƯỚC 2: Cache MISS → gọi Google TTS ────────────────────────────────────
  // Hạn mức RIÊNG cho đường tạo audio mới (tốn tiền API): 60 lần/phút mỗi IP.
  // Đủ rộng để phát lần đầu cả một bài học chưa cache (chế độ EN+VI ~16 câu mới),
  // nhưng vẫn chặn vòng lặp lỗi chạy vô hạn làm cháy hạn mức Google TTS. Tách khỏi
  // hạn mức tổng để cache HIT (gần như miễn phí) không bao giờ bị đường này cản.
  if (!checkRateLimit(clientIp, 60, 'tts-gen')) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/tts', stage: 'generate' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu tạo audio mới — thử lại sau 1 phút' }, 429, allHeaders)
  }

  let audioData: ArrayBuffer
  try {
    audioData = await generateAudioFromGoogle(text, voice, lang)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // 429 = hết quota Google TTS. Đây là tình huống VẬN HÀNH (cần nâng quota/bật billing),
    // không phải bug code → log GỌN 1 dòng (tránh spam stack trace), trả 503 + Retry-After
    // để client biết tạm thời và tự fallback sang Web Speech. Lỗi khác mới log full + 500.
    const isQuota = /\(429\)|RESOURCE_EXHAUSTED|quota/i.test(msg)
    if (isQuota) {
      console.warn('[tts] Google TTS hết quota (429) — client sẽ fallback Web Speech')
      return jsonResponse({ error: 'Dịch vụ giọng đọc tạm quá tải — thử lại sau', fallback: true }, 503, {
        ...allHeaders,
        'Retry-After': '60',
      })
    }
    console.error('[tts] Google TTS generation failed:', err)
    return jsonResponse({ error: 'Không thể tạo audio — thử lại sau' }, 500, allHeaders)
  }

  // ── BƯỚC 3: Mã hóa AES-256-GCM rồi lưu file (local VPS hoặc Supabase Storage tùy
  // STORAGE_DRIVER) ── Mã hóa TRƯỚC khi lưu — file luôn là ciphertext, không phải mp3 gốc.
  const encryptedData = await encryptAudio(audioData, textHash)
  const fileName = `${lang}/${voice}/${textHash}.mp3`
  const origin = req.headers.get('origin') || ''

  let audioUrl: string
  try {
    audioUrl = await saveAudio('tts-cache', fileName, encryptedData, origin)
  } catch (err) {
    console.error('[tts] Audio save failed:', err)
    return jsonResponse({ error: 'Không thể lưu audio — thử lại sau' }, 500, allHeaders)
  }

  // ── BƯỚC 4: Lưu vào DB ─────────────────────────────────────────────────────

  const { error: insertError } = await supabase
    .from('tts_cache')
    .upsert({ hash: textHash, lang, voice, audio_url: audioUrl }, { onConflict: 'hash' })

  if (insertError) {
    console.error('Lỗi lưu tts_cache:', insertError.message)
  }

  const { key_b64, iv_b64 } = await getClientKeyMaterial(textHash)
  return jsonResponse({ audio_url: audioUrl, key_b64, iv_b64, cached: false }, 200, allHeaders)
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

export const config = { runtime: 'edge' }
