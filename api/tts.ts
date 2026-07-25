// api/tts.ts — Vercel Edge Function / chạy qua server.ts (Express) khi deploy VPS
// Endpoint: POST /api/tts
// Body: { text: string, lang: 'en-US' | 'vi-VN', voice?: 'female' | 'female2' | 'male' | 'male2' }
// Trả về: { audio_url: string, key_b64: string, iv_b64: string, cached: boolean }
//
// Luồng xử lý:
//   1. Hash (text + lang + voice) → tìm trong bảng tts_cache (Postgres tự host)
//   2. Cache HIT → trả audio_url + khoá giải mã luôn, không tốn API
//   3. Cache MISS → gọi Google TTS → MÃ HÓA AES-256-GCM → lưu file qua saveAudio()
//      (local VPS hoặc Cloudflare R2 tùy STORAGE_DRIVER, xem api/_lib/fileStorage.ts)
//      → lưu DB → trả URL + khoá giải mã
//
// Chiến lược cache dùng chung: câu nào đã phát sinh 1 lần thì mọi user sau dùng lại,
// không tốn thêm tiền API nữa. Khác với api/pronunciation.ts (chỉ đọc 1 từ), endpoint
// này đọc cả câu/đoạn — dùng cho câu ví dụ, cụm từ, hội thoại trong Chat/Speaking.
//
// Bảo mật: file audio (bucket/thư mục "tts-cache") bị MÃ HÓA AES-256-GCM trước khi lưu —
// ai có link cũng không nghe được nếu không có khoá, và khoá chỉ phát cho request có Bearer
// token hợp lệ. validateAuth() ở dưới đã bắt buộc đăng nhập cho TOÀN BỘ endpoint
// này (không có chế độ ẩn danh) nên mọi response thành công đều kèm khoá giải mã.
// Chi tiết suy khoá: xem api/_lib/ttsCrypto.ts.

import { z } from 'zod'
import { getPgPool } from './_lib/pgPool.js'
import {
  generateAudioFromGoogle,
  generateStudioAudioFromGoogle,
  isValidVoice,
  isValidStudioVoice,
  DEFAULT_VOICE,
  VOICE_VERSION,
  type Lang,
  type VoiceId,
} from './_lib/googleTts.js'
import { generateAudioFromElevenLabs, isValidElevenVoice } from './_lib/elevenLabsTts.js'
import { ensureProfileRow } from './_lib/authService.js'
import { clampVoiceToPlan, type AnyVoiceId } from './_lib/voiceAccess.js'
import { saveAudio } from './_lib/fileStorage.js'
import { encryptAudio, getClientKeyMaterial } from './_lib/ttsCrypto.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  validateContentType,
  logSecurityEvent,
} from './_lib/security.js'
import { readJsonBody, validateBody } from './_lib/validation.js'
import { withConcurrencyLimit } from './_lib/concurrencyLimiter.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

const VALID_LANGS: Lang[] = ['en-US', 'vi-VN']

// Trần độ dài văn bản 1 lần đọc. Nội dung hợp lệ dài nhất của app (câu trả lời Chat/Speaking,
// câu ví dụ) đều dưới mức này rất xa; Google TTS cũng chỉ nhận ~5000 byte/lần. Chặn ở server
// để body 64KB không đẩy được chuỗi khổng lồ tới Google (tốn tiền theo ký tự) và trả 413 rõ
// ràng thay vì lỗi 500 từ Google.
const MAX_TTS_TEXT = 4000

function isValidLang(value: string): value is Lang {
  return VALID_LANGS.includes(value as Lang)
}

const TtsBodySchema = z.object({
  text: z
    .string({ error: 'Thiếu text' })
    .trim()
    .min(1, 'Thiếu text')
    .refine((v) => v.length <= MAX_TTS_TEXT, {
      error: `Văn bản quá dài — tối đa ${MAX_TTS_TEXT} ký tự`,
      params: { status: 413 },
    }),
  lang: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : 'en-US'))
    .refine((v): v is Lang => isValidLang(v), {
      error: (ctx) => `lang không hợp lệ: ${ctx.input}`,
    }),
  voice: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : DEFAULT_VOICE))
    .refine(
      (v): v is AnyVoiceId => isValidVoice(v) || isValidElevenVoice(v) || isValidStudioVoice(v),
      {
        error: (ctx) => `voice không hợp lệ: ${ctx.input}`,
      },
    ),
})

// Hash đơn giản dùng để tạo tên file + key tìm kiếm trong DB (KHÔNG phải khoá mã hóa —
// khoá mã hóa thật được suy ra riêng trong ttsCrypto.ts từ TTS_ENCRYPTION_MASTER_KEY).
async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
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
  const clientIp = getClientIp(req)

  // Kiểm tra Content-Type
  if (!validateContentType(req)) {
    logSecurityEvent('INVALID_CONTENT_TYPE', clientIp, { path: '/api/tts' })
    return jsonResponse({ error: 'Content-Type phải là application/json' }, 415, allHeaders)
  }

  // Rate limit TỔNG: 60 request/phút mỗi IP. Phần lớn request là cache HIT (chỉ tra DB,
  // gần như miễn phí), nên hạn mức rộng để phát cả bài học / nghe nhiều câu liên tiếp
  // không bị chặn. Đường tạo audio mới (tốn tiền) có hạn mức riêng, chặt hơn ở BƯỚC 2.
  if (!(await checkRateLimit(clientIp, 60, 'tts'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/tts' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  // Xác thực người dùng qua Bearer token tự viết (validateAuth) — bắt buộc, vì audio
  // cache bị mã hóa và khoá giải mã chỉ phát cho người đã đăng nhập.
  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/tts' })
    return jsonResponse({ error: 'Chưa đăng nhập hoặc phiên hết hạn' }, 401, allHeaders)
  }

  const bodyResult = await readJsonBody(req)
  if (!bodyResult.ok) {
    return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, allHeaders)
  }
  const parsed = validateBody(TtsBodySchema, bodyResult.raw)
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error.message }, parsed.error.status, allHeaders)
  }

  const { text, lang } = parsed.data
  // Không tin voice client gửi lên — hạ về giọng cho phép đúng gói của user (fail-safe,
  // không lỗi cứng: UI đã tự ẩn lựa chọn ngoài quyền, nhánh này chỉ chặn gọi thẳng API).
  const { plan } = await ensureProfileRow(authResult.userId, '')
  let voice = await clampVoiceToPlan(parsed.data.voice, plan)

  // Studio CHỈ có tiếng Anh (Google không có giọng Studio cho vi-VN) — nếu lỡ nhận Studio
  // cho câu tiếng Việt (client fallback lỗi, hoặc gọi thẳng API), hạ về Chirp3-HD cùng giới
  // tính thay vì lỗi cứng, giống các nhánh fail-safe khác ở trên.
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
    console.error('[tts] Failed to initialize Postgres pool:', err)
    return jsonResponse({ error: 'Server configuration error' }, 500, allHeaders)
  }

  // ── BƯỚC 1: Kiểm tra cache ──────────────────────────────────────────────────
  // Khóa cache có kèm VOICE_VERSION → khi đổi giọng (đổi version), câu cũ không khớp
  // nữa nên sẽ tạo lại bằng giọng mới thay vì phát lại audio cũ.
  const textHash = await hashText(text + lang + voice + VOICE_VERSION)

  const { rows: cachedRows } = await pool.query<{ audio_url: string }>(
    'select audio_url from public.tts_cache where hash = $1',
    [textHash],
  )

  const cachedUrl = cachedRows[0]?.audio_url
  if (cachedUrl) {
    // Cập nhật last_accessed_at (bắn rồi quên — dùng cho LRU dọn cache khi gần ngưỡng
    // 10GB R2 sau này, xem docs/migration-thoat-ly-supabase.md mục 3.3). Không chặn response.
    void pool
      .query('update public.tts_cache set last_accessed_at = now() where hash = $1', [textHash])
      .catch((err: unknown) => console.warn('[tts] cập nhật last_accessed_at lỗi:', err))
    const { key_b64, iv_b64 } = await getClientKeyMaterial(textHash)
    return jsonResponse({ audio_url: cachedUrl, key_b64, iv_b64, cached: true }, 200, allHeaders)
  }

  // ── BƯỚC 2: Cache MISS → gọi Google TTS ────────────────────────────────────
  // Bộ đếm RIÊNG cho đường tạo audio mới (tốn tiền API): 60 lần/phút mỗi IP.
  // Mục đích của việc TÁCH bucket (không phải đặt hạn mức thấp hơn): cách ly đường tốn
  // tiền khỏi lưu lượng cache HIT (gần như miễn phí) — nhờ đó phát cả bài học đã cache
  // hay tra nhiều từ vẫn mượt, mà mỗi IP không thể tạo quá 60 audio MỚI/phút (chặn vòng
  // lặp lỗi làm cháy hạn mức Google TTS). Giữ 60 để lần đầu "Phát tất cả" một bài học
  // chưa cache (chế độ EN+VI ~16 câu × 2 giọng) không bị chặn giữa chừng.
  if (!(await checkRateLimit(clientIp, 60, 'tts-gen'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/tts', stage: 'generate' })
    return jsonResponse(
      { error: 'Quá nhiều yêu cầu tạo audio mới — thử lại sau 1 phút' },
      429,
      allHeaders,
    )
  }

  // Giọng ElevenLabs (VIP) dùng provider khác hẳn Google — text đọc y nguyên, provider
  // tự nhận diện ngôn ngữ qua model đa ngôn ngữ nên không cần truyền `lang`. Giọng Studio
  // vẫn là Google Cloud TTS nhưng lang luôn 'en-US' (đã clamp ở trên).
  const providerLabel = isValidElevenVoice(voice)
    ? 'ElevenLabs'
    : isValidStudioVoice(voice)
      ? 'Google Studio'
      : 'Google'

  let audioData: ArrayBuffer
  try {
    if (isValidElevenVoice(voice)) {
      audioData = await withConcurrencyLimit('elevenlabs', () => generateAudioFromElevenLabs(text))
    } else if (isValidStudioVoice(voice)) {
      audioData = await withConcurrencyLimit('google-tts-studio', () =>
        generateStudioAudioFromGoogle(text, voice),
      )
    } else {
      audioData = await withConcurrencyLimit('google-tts', () =>
        generateAudioFromGoogle(text, voice, lang),
      )
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // 429 = hết quota Google TTS. Đây là tình huống VẬN HÀNH (cần nâng quota/bật billing),
    // không phải bug code → log GỌN 1 dòng (tránh spam stack trace), trả 503 + Retry-After
    // để client biết tạm thời và tự fallback sang Web Speech. Lỗi khác mới log full + 500.
    const isQuota = /\(429\)|RESOURCE_EXHAUSTED|quota/i.test(msg)
    if (isQuota) {
      console.warn('[tts] Google TTS hết quota (429) — client sẽ fallback Web Speech')
      return jsonResponse(
        { error: 'Dịch vụ giọng đọc tạm quá tải — thử lại sau', fallback: true },
        503,
        {
          ...allHeaders,
          'Retry-After': '60',
        },
      )
    }
    console.error(`[tts] ${providerLabel} TTS generation failed:`, err)
    return jsonResponse({ error: 'Không thể tạo audio — thử lại sau' }, 500, allHeaders)
  }

  // ── BƯỚC 3: Mã hóa AES-256-GCM rồi lưu file (local VPS hoặc Cloudflare R2 tùy
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

  try {
    await pool.query(
      `insert into public.tts_cache (hash, lang, voice, audio_url, last_accessed_at)
       values ($1, $2, $3, $4, now())
       on conflict (hash) do update set
         lang = excluded.lang, voice = excluded.voice, audio_url = excluded.audio_url,
         last_accessed_at = now()`,
      [textHash, lang, voice, audioUrl],
    )
  } catch (err) {
    console.error('Lỗi lưu tts_cache:', err instanceof Error ? err.message : err)
  }

  const { key_b64, iv_b64 } = await getClientKeyMaterial(textHash)
  return jsonResponse({ audio_url: audioUrl, key_b64, iv_b64, cached: false }, 200, allHeaders)
}

export const config = { runtime: 'edge' }
