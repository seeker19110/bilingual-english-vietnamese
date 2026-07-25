// api/pronunciation.ts — chạy qua server.ts (Express) khi deploy VPS
// Endpoint: GET /api/pronunciation?word=apple&voice=female
//   - voice: "female" (mặc định) | "female2" | "male" | "male2" — bỏ qua thì dùng giọng nữ.
//
// Luồng xử lý (cache phát âm từ điển):
//   1. Tìm từ + giọng trong bảng `pronunciations` (Postgres tự host) — có rồi thì trả luôn
//      audio_url (cache HIT, không tốn tiền gọi Google TTS). Mỗi (word, voice) là 1 dòng
//      riêng, vì cùng 1 từ có thể có nhiều file audio khác nhau theo giọng.
//   2. Chưa có (cache MISS) → gọi Google Cloud TTS để tạo file mp3 đúng giọng được chọn.
//   3. Upload file mp3 qua saveAudio() (local VPS hoặc Cloudflare R2 tùy STORAGE_DRIVER).
//   4. Lưu audio_url vào bảng `pronunciations` để lần sau khỏi tạo lại.
//
// Cách test cục bộ: chạy `npm run dev`, mở
//   http://localhost:5173/api/pronunciation?word=apple
//   http://localhost:5173/api/pronunciation?word=apple&voice=male
// (vite.config.ts đã gắn middleware gọi thẳng handler này, không cần deploy lên Vercel).

import { getPgPool } from './_lib/pgPool'
import {
  generateAudioFromGoogle,
  generateStudioAudioFromGoogle,
  isValidVoice,
  isValidStudioVoice,
  DEFAULT_VOICE,
  VOICE_IDS,
  STUDIO_VOICE_IDS,
  VOICE_VERSION,
  type Lang,
  type VoiceId,
} from './_lib/googleTts'
import { saveAudio } from './_lib/fileStorage'
import { ensureProfileRow } from './_lib/authService'
import { clampVoiceToPlan, type AnyVoiceId } from './_lib/voiceAccess'
import { isValidElevenVoice } from './_lib/elevenLabsTts'
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
// cache key + text cho TTS (query Postgres parameterized, không nối chuỗi SQL).
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
  if (!(await checkRateLimit(clientIp, 60, 'pron'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/pronunciation' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  // Xác thực người dùng qua Bearer token tự viết (validateAuth)
  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/pronunciation' })
    return jsonResponse({ error: 'Chưa đăng nhập hoặc phiên hết hạn' }, 401, allHeaders)
  }

  const url = new URL(req.url)
  const rawWord = url.searchParams.get('word')?.toLowerCase().trim()
  const voiceParam = url.searchParams.get('voice')?.toLowerCase().trim() || DEFAULT_VOICE
  // lang: 'en-US' (mặc định, giữ tương thích chỗ gọi cũ chưa truyền) | 'vi-VN' (chiều B đọc từ
  // tiếng Việt — WordCard.tsx truyền card.vi kèm lang='vi-VN').
  const langParam = url.searchParams.get('lang')?.trim() || 'en-US'
  if (langParam !== 'en-US' && langParam !== 'vi-VN') {
    return jsonResponse(
      { error: `lang không hợp lệ: ${langParam} (chỉ nhận en-US | vi-VN)` },
      400,
      allHeaders,
    )
  }
  const lang: Lang = langParam

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

  if (!isValidVoice(voiceParam) && !isValidStudioVoice(voiceParam)) {
    return jsonResponse(
      {
        error: `voice không hợp lệ: ${voiceParam} (chỉ nhận ${[...VOICE_IDS, ...STUDIO_VOICE_IDS].join(' | ')})`,
      },
      400,
      allHeaders,
    )
  }
  // Không tin voice client gửi lên — hạ về giọng cho phép đúng gói của user (fail-safe,
  // không lỗi cứng: UI đã tự ẩn lựa chọn ngoài quyền, nhánh này chỉ chặn gọi thẳng API).
  const { plan } = await ensureProfileRow(authResult.userId, '')
  const clampedVoice = await clampVoiceToPlan(voiceParam, plan)
  // Endpoint tra từ đơn này dùng được cả Chirp3-HD lẫn Studio (tiếng Anh) — chỉ giọng
  // ElevenLabs (VIP) không áp dụng ở đây (dành cho câu/đoạn ở api/tts.ts).
  // clampedVoice đã qua isValidVoice()/isValidStudioVoice() (không có Eleven) ở trên nên
  // nhánh isValidElevenVoice không thực sự xảy ra, chỉ giữ để TypeScript hẹp kiểu.
  let voice: VoiceId | AnyVoiceId = isValidElevenVoice(clampedVoice) ? DEFAULT_VOICE : clampedVoice

  // Studio CHỈ có tiếng Anh (Google không có giọng Studio cho vi-VN) — nếu lỡ nhận Studio cho
  // từ tiếng Việt (chiều B), hạ về Chirp3-HD cùng giới tính thay vì lỗi cứng, giống fallback
  // đã có ở api/tts.ts.
  const STUDIO_TO_CHIRP_FALLBACK: Partial<Record<AnyVoiceId, VoiceId>> = {
    'Studio-O': 'Kore',
    'Studio-Q': 'Puck',
  }
  if (lang !== 'en-US' && isValidStudioVoice(voice)) {
    voice = STUDIO_TO_CHIRP_FALLBACK[voice] ?? DEFAULT_VOICE
  }

  let pool
  try {
    pool = getPgPool()
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500, allHeaders)
  }

  // ── BƯỚC 1: Kiểm tra cache (theo bộ ba word + voice + lang) ─────────
  // Cache CHỈ hợp lệ khi voice_version khớp VOICE_VERSION hiện tại. Khi ta đổi giọng
  // (vd: nâng lên Chirp 3 HD), các dòng cũ có voice_version khác (hoặc NULL — audio
  // seed bằng giọng đời cũ) sẽ bị coi là MISS → tạo lại bằng giọng mới rồi GHI ĐÈ
  // (upsert theo word,voice,lang). Nhờ vậy audio từ-đơn luôn trùng khớp với audio câu ví dụ.
  // Kèm lang vào khoá tra cứu: từ tiếng Anh và tiếng Việt trùng chữ (hiếm nhưng có thể) sẽ
  // KHÔNG bị lẫn cache của nhau (xem migration 0003_pronunciation_lang_key.sql).
  const { rows: cachedRows } = await pool.query<{
    audio_url: string
    voice_version: string | null
  }>(
    'select audio_url, voice_version from public.pronunciations where word = $1 and voice = $2 and lang = $3',
    [word, voice, lang],
  )
  const cached = cachedRows[0]
  if (cached?.audio_url && cached.voice_version === VOICE_VERSION) {
    void pool
      .query(
        'update public.pronunciations set last_accessed_at = now() where word = $1 and voice = $2 and lang = $3',
        [word, voice, lang],
      )
      .catch((err: unknown) => console.warn('[pronunciation] cập nhật last_accessed_at lỗi:', err))
    return jsonResponse({ audio_url: cached.audio_url, cached: true }, 200, allHeaders)
  }

  // ── BƯỚC 2: Cache MISS → gọi Google TTS ────────────────────
  // Hạn mức RIÊNG cho đường tạo audio mới (tốn tiền API): 60 lần/phút mỗi IP.
  // Audio tạo ra được lưu vào bảng `pronunciations` + Storage nên chỉ tốn tiền LẦN ĐẦU;
  // các lần sau là cache HIT miễn phí. Hạn mức này chỉ để chặn vòng lặp lỗi bất thường.
  if (!(await checkRateLimit(clientIp, 60, 'pron-gen'))) {
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
    audioData = isValidStudioVoice(voice)
      ? await generateStudioAudioFromGoogle(word, voice)
      : await generateAudioFromGoogle(word, voice, lang)
  } catch (err) {
    return jsonResponse(
      { error: `Không thể tạo audio: ${(err as Error).message}` },
      500,
      allHeaders,
    )
  }

  // ── BƯỚC 3: Lưu file audio (local VPS hoặc Cloudflare R2 tùy STORAGE_DRIVER) ──
  // Tên file có hậu tố giọng + ngôn ngữ (-female-en-US/-female-vi-VN...) vì 1 từ (chữ trùng
  // giữa 2 ngôn ngữ) có thể có nhiều file audio khác nhau.
  const fileName = `${encodeURIComponent(word)}-${voice}-${lang}.mp3`
  const origin = req.headers.get('origin') || ''

  let audioUrl: string
  try {
    audioUrl = await saveAudio('pronunciations', fileName, audioData, origin)
  } catch (err) {
    return jsonResponse({ error: `Lưu file thất bại: ${(err as Error).message}` }, 500, allHeaders)
  }

  // ── BƯỚC 5: Lưu vào DB ────────────────────────────
  // upsert theo bộ ba (word, voice, lang) — cột unique composite — nếu lỡ có request trùng
  // từ+giọng+ngôn ngữ chạy song song thì không bị lỗi vi phạm unique constraint.
  try {
    await pool.query(
      `insert into public.pronunciations (word, voice, audio_url, lang, voice_version, last_accessed_at)
       values ($1, $2, $3, $4, $5, now())
       on conflict (word, voice, lang) do update set
         audio_url = excluded.audio_url, voice_version = excluded.voice_version,
         last_accessed_at = now()`,
      [word, voice, audioUrl, lang, VOICE_VERSION],
    )
  } catch (err) {
    // Audio đã tạo & upload xong nên vẫn trả về cho user dùng được ngay —
    // chỉ là cache DB chưa lưu, lần tra sau sẽ phải tạo lại.
    console.error('Lỗi lưu cache pronunciations:', err instanceof Error ? err.message : err)
  }

  return jsonResponse({ audio_url: audioUrl, cached: false }, 200, allHeaders)
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, giống api/claude.ts đã có
export const config = {
  runtime: 'edge',
}
