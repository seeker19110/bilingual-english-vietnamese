// api/pronunciation.ts — Vercel Edge Function
// Endpoint: GET /api/pronunciation?word=apple&voice=female
//   - voice: "female" (mặc định) | "female2" | "male" | "male2" — bỏ qua thì dùng giọng nữ.
//
// Luồng xử lý (cache phát âm từ điển):
//   1. Tìm từ + giọng trong bảng `pronunciations` (Supabase) — có rồi thì trả luôn audio_url
//      (cache HIT, không tốn tiền gọi Google TTS). Mỗi (word, voice) là 1 dòng riêng,
//      vì cùng 1 từ có thể có nhiều file audio khác nhau theo giọng.
//   2. Chưa có (cache MISS) → gọi Google Cloud TTS để tạo file mp3 đúng giọng được chọn.
//   3. Upload file mp3 lên Supabase Storage (bucket "pronunciations").
//   4. Lưu audio_url vào bảng `pronunciations` để lần sau khỏi tạo lại.
//
// Cách test cục bộ: chạy `npm run dev`, mở
//   http://localhost:5173/api/pronunciation?word=apple
//   http://localhost:5173/api/pronunciation?word=apple&voice=male
// (vite.config.ts đã gắn middleware gọi thẳng handler này, không cần deploy lên Vercel).
//
// Hướng dẫn tạo bảng Supabase + bucket Storage + lấy API key: xem PRONUNCIATION_CACHE_SETUP.md

import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import {
  generateAudioFromGoogle,
  isValidVoice,
  DEFAULT_VOICE,
  VOICE_IDS,
  VOICE_VERSION,
} from './_lib/googleTts'
import { saveAudio } from './_lib/fileStorage'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security'
import { jsonResponse, getClientIp } from './_lib/http'

// Regex cho phép chữ (mọi ngôn ngữ, gồm chữ CÓ DẤU như sauté/café/naïve và tiếng Việt),
// dấu phụ tổ hợp, số, dấu cách, gạch nối, dấu nháy (don't), dấu chấm (Mr.). Ngăn ký tự lạ.
// \p{L}=letter, \p{M}=combining mark; cờ u để bật Unicode. An toàn: giá trị chỉ dùng làm
// cache key + text cho TTS (query Supabase parameterized, không nối chuỗi SQL).
const WORD_SAFE_PATTERN = /^[\p{L}\p{M}0-9\s'’.-]+$/u

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders(req)
  const allHeaders = { ...corsHeaders, ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: allHeaders })
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  // Lấy IP để rate limit
  const clientIp = getClientIp(req)

  // Rate limit TỔNG: 60 request/phút mỗi IP. Hầu hết là cache HIT (tra DB, gần như miễn phí),
  // nên hạn mức rộng để tra nhiều từ / lật nhiều thẻ liên tiếp không bị chặn. Đường tạo
  // audio mới (tốn tiền) có hạn mức riêng, chặt hơn ở BƯỚC 2.
  if (!checkRateLimit(clientIp, 60, 'pron')) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/pronunciation' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  // Xác thực người dùng qua Supabase JWT
  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/pronunciation' })
    return jsonResponse({ error: 'Chưa đăng nhập hoặc phiên hết hạn' }, 401, allHeaders)
  }

  const url = new URL(req.url)
  const rawWord = url.searchParams.get('word')?.toLowerCase().trim()
  const voiceParam = url.searchParams.get('voice')?.toLowerCase().trim() || DEFAULT_VOICE

  if (!rawWord) {
    return jsonResponse({ error: 'Thiếu tham số word' }, 400, allHeaders)
  }

  // Sanitize: chỉ chấp nhận chữ/số/dấu cách/gạch nối, tối đa 100 ký tự
  if (rawWord.length > 100 || !WORD_SAFE_PATTERN.test(rawWord)) {
    logSecurityEvent('INVALID_WORD_PARAM', clientIp, { word: rawWord.slice(0, 30) })
    return jsonResponse(
      { error: 'Từ không hợp lệ (chỉ chấp nhận chữ, số, dấu cách, gạch nối, dấu nháy)' },
      400,
      allHeaders,
    )
  }
  const word = rawWord

  if (!isValidVoice(voiceParam)) {
    return jsonResponse(
      { error: `voice không hợp lệ: ${voiceParam} (chỉ nhận ${VOICE_IDS.join(' | ')})` },
      400,
      allHeaders,
    )
  }
  const voice = voiceParam

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500, allHeaders)
  }

  // ── BƯỚC 1: Kiểm tra cache (theo cặp word + voice) ─────────
  // Cache CHỈ hợp lệ khi voice_version khớp VOICE_VERSION hiện tại. Khi ta đổi giọng
  // (vd: nâng lên Chirp 3 HD), các dòng cũ có voice_version khác (hoặc NULL — audio
  // seed bằng giọng đời cũ) sẽ bị coi là MISS → tạo lại bằng giọng mới rồi GHI ĐÈ
  // (upsert theo word,voice). Nhờ vậy audio từ-đơn luôn trùng khớp với audio câu ví dụ.
  const { data: cachedRow } = await supabase
    .from('pronunciations')
    .select('audio_url, voice_version')
    .eq('word', word)
    .eq('voice', voice)
    .maybeSingle()

  const cached = cachedRow as { audio_url?: string; voice_version?: string | null } | null
  if (cached?.audio_url && cached.voice_version === VOICE_VERSION) {
    return jsonResponse({ audio_url: cached.audio_url, cached: true }, 200, allHeaders)
  }

  // ── BƯỚC 2: Cache MISS → gọi Google TTS ────────────────────
  // Hạn mức RIÊNG cho đường tạo audio mới (tốn tiền API): 60 lần/phút mỗi IP.
  // Audio tạo ra được lưu vào bảng `pronunciations` + Storage nên chỉ tốn tiền LẦN ĐẦU;
  // các lần sau là cache HIT miễn phí. Hạn mức này chỉ để chặn vòng lặp lỗi bất thường.
  if (!checkRateLimit(clientIp, 60, 'pron-gen')) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, {
      path: '/api/pronunciation',
      stage: 'generate',
    })
    return jsonResponse(
      { error: 'Quá nhiều yêu cầu tạo audio mới — thử lại sau 1 phút' },
      429,
      allHeaders,
    )
  }

  let audioData: ArrayBuffer
  try {
    audioData = await generateAudioFromGoogle(word, voice, 'en-US')
  } catch (err) {
    return jsonResponse(
      { error: `Không thể tạo audio: ${(err as Error).message}` },
      500,
      allHeaders,
    )
  }

  // ── BƯỚC 3: Lưu file audio (local VPS hoặc Supabase Storage tùy STORAGE_DRIVER) ──
  // Tên file có hậu tố giọng (-female/-male) vì 1 từ có thể có nhiều file audio.
  const fileName = `${encodeURIComponent(word)}-${voice}.mp3`
  const origin = req.headers.get('origin') || ''

  let audioUrl: string
  try {
    audioUrl = await saveAudio('pronunciations', fileName, audioData, origin)
  } catch (err) {
    return jsonResponse({ error: `Lưu file thất bại: ${(err as Error).message}` }, 500, allHeaders)
  }

  // ── BƯỚC 5: Lưu vào DB ────────────────────────────
  // upsert theo cặp (word, voice) — cột unique composite — nếu lỡ có request trùng
  // từ+giọng chạy song song thì không bị lỗi vi phạm unique constraint.
  const { error: insertError } = await supabase
    .from('pronunciations')
    .upsert(
      { word, voice, audio_url: audioUrl, lang: 'en-US', voice_version: VOICE_VERSION },
      { onConflict: 'word,voice' },
    )

  if (insertError) {
    // Audio đã tạo & upload xong nên vẫn trả về cho user dùng được ngay —
    // chỉ là cache DB chưa lưu, lần tra sau sẽ phải tạo lại.
    console.error('Lỗi lưu cache pronunciations:', insertError.message)
  }

  return jsonResponse({ audio_url: audioUrl, cached: false }, 200, allHeaders)
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, giống api/claude.ts đã có
export const config = {
  runtime: 'edge',
}
