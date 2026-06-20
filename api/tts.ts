// api/tts.ts — Vercel Edge Function
// Đọc một CÂU / ĐOẠN bất kỳ bằng Google TTS chất lượng cao (giọng Anh hoặc Việt).
// Khác với api/pronunciation.ts (chỉ đọc 1 TỪ tiếng Anh và luôn cache), endpoint này có 2 chế độ:
//
//   • cache = true  → dùng cho NỘI DUNG TĨNH (câu ví dụ trong từ điển, cụm từ, bài học...).
//                     Lưu/đọc cache ở bảng `tts_cache` + Storage Supabase, trả về { audio_url }.
//                     Cùng 1 câu chỉ tạo audio 1 lần → tiết kiệm tiền Google TTS.
//                     File lưu trên Storage được MÃ HÓA AES-256-GCM (xem ./_lib/ttsCrypto.ts) —
//                     chỉ request có JWT Supabase hợp lệ mới được kèm khoá giải mã (key_b64/iv_b64)
//                     trong response; chưa đăng nhập thì vẫn nhận audio_url nhưng không giải mã được.
//
//   • cache = false → dùng cho NỘI DUNG ĐỘNG (câu trả lời AI trong Chat / Speaking).
//                     Mỗi câu gần như không bao giờ trùng nên KHÔNG lưu (đỡ phình storage).
//                     Trả về { audio_base64 } để frontend phát ngay rồi bỏ. KHÔNG mã hóa
//                     (không cần — không lưu lại, không có gì để rò rỉ sau này).
//
// Gọi: POST /api/tts  body JSON: { text, lang: "en-US"|"vi-VN", voice?: "female"|"male", cache?: boolean }
// Header (khuyên dùng với cache=true): Authorization: Bearer <supabase access_token>
//
// Bảng `tts_cache` + bucket Storage + thiết lập mã hóa: xem TTS_CACHE_SETUP.md.

import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import {
  generateAudioFromGoogle,
  isValidVoice,
  isValidLang,
  DEFAULT_VOICE,
  DEFAULT_LANG,
} from './_lib/googleTts'
import { encryptAudio, getClientKeyMaterial, isAuthenticatedRequest } from './_lib/ttsCrypto'

// Giới hạn độ dài để tránh bị lạm dụng tạo audio quá lớn / tốn tiền.
const MAX_TEXT_LENGTH = 1000

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  // ── Đọc & kiểm tra body ────────────────────────────────────
  let body: { text?: string; lang?: string; voice?: string; cache?: boolean }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return jsonResponse({ error: 'Body JSON không hợp lệ' }, 400)
  }

  const text = body.text?.trim()
  if (!text) {
    return jsonResponse({ error: 'Thiếu tham số text' }, 400)
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return jsonResponse({ error: `text quá dài (tối đa ${MAX_TEXT_LENGTH} ký tự)` }, 400)
  }

  const lang = (body.lang ?? DEFAULT_LANG).trim()
  if (!isValidLang(lang)) {
    return jsonResponse({ error: `lang không hợp lệ: ${lang} (chỉ nhận "en-US" hoặc "vi-VN")` }, 400)
  }

  const voiceParam = (body.voice ?? DEFAULT_VOICE).toLowerCase().trim()
  if (!isValidVoice(voiceParam)) {
    return jsonResponse({ error: `voice không hợp lệ: ${voiceParam} (chỉ nhận "female" hoặc "male")` }, 400)
  }
  const voice = voiceParam

  const useCache = body.cache !== false // mặc định true nếu không truyền

  // ── CHẾ ĐỘ ĐỘNG (không cache): tạo audio và trả base64 ngay ─
  if (!useCache) {
    try {
      const audioData = await generateAudioFromGoogle(text, voice, lang)
      return jsonResponse({ audio_base64: arrayBufferToBase64(audioData), cached: false })
    } catch (err) {
      return jsonResponse({ error: `Không thể tạo audio: ${(err as Error).message}` }, 500)
    }
  }

  // ── CHẾ ĐỘ TĨNH (cache): tra Supabase trước, miss thì tạo + lưu ─
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }

  // Khoá cache = băm SHA-256 của (nội dung + ngôn ngữ + giọng) — câu dài nên không dùng làm khoá trực tiếp.
  // Hash này còn được dùng làm "seed" suy ra khoá mã hóa AES (xem ./_lib/ttsCrypto.ts).
  const hash = await sha256Hex(`${lang}|${voice}|${text}`)

  // Có đăng nhập thật (JWT Supabase hợp lệ) không — quyết định có trả khoá giải mã hay không.
  const authed = await isAuthenticatedRequest(req)

  // BƯỚC 1: kiểm tra cache
  const { data: cachedRow } = await supabase
    .from('tts_cache')
    .select('audio_url')
    .eq('text_hash', hash)
    .maybeSingle()

  const cachedUrl = (cachedRow as { audio_url?: string } | null)?.audio_url
  if (cachedUrl) {
    const keyMaterial = authed ? await getClientKeyMaterial(hash) : null
    return jsonResponse({ audio_url: cachedUrl, cached: true, ...keyMaterial })
  }

  // BƯỚC 2: cache MISS → gọi Google TTS
  let audioData: ArrayBuffer
  try {
    audioData = await generateAudioFromGoogle(text, voice, lang)
  } catch (err) {
    return jsonResponse({ error: `Không thể tạo audio: ${(err as Error).message}` }, 500)
  }

  // BƯỚC 3: mã hóa AES-256-GCM trước khi lưu (khoá suy ra từ `hash`, không cần lưu riêng)
  let cipherData: ArrayBuffer
  try {
    cipherData = await encryptAudio(audioData, hash)
  } catch (err) {
    return jsonResponse({ error: `Không thể mã hóa audio: ${(err as Error).message}` }, 500)
  }

  // BƯỚC 4: upload ciphertext lên Storage (dùng chung bucket "pronunciations", tiền tố "sentences/")
  // contentType là octet-stream (không phải audio/mpeg nữa) vì nội dung giờ là dữ liệu đã mã hóa,
  // không phát trực tiếp được — phải giải mã ở client trước (xem src/lib/tts.ts).
  const fileName = `sentences/${hash}.mp3`
  const { error: uploadError } = await supabase.storage
    .from('pronunciations')
    .upload(fileName, cipherData, { contentType: 'application/octet-stream', upsert: true })

  if (uploadError) {
    return jsonResponse({ error: `Upload thất bại: ${uploadError.message}` }, 500)
  }

  // BƯỚC 5: lấy public URL
  const { data: urlData } = supabase.storage.from('pronunciations').getPublicUrl(fileName)
  const audioUrl = urlData.publicUrl

  // BƯỚC 6: lưu vào DB (upsert theo text_hash để request trùng chạy song song không lỗi unique)
  const { error: insertError } = await supabase
    .from('tts_cache')
    .upsert({ text_hash: hash, lang, voice, audio_url: audioUrl, text }, { onConflict: 'text_hash' })

  if (insertError) {
    // Audio đã tạo xong nên vẫn trả cho user dùng — chỉ là chưa lưu được cache DB.
    console.error('Lỗi lưu cache tts_cache:', insertError.message)
  }

  const keyMaterial = authed ? await getClientKeyMaterial(hash) : null
  return jsonResponse({ audio_url: audioUrl, cached: false, ...keyMaterial })
}

// ── Tiện ích ───────────────────────────────────────────────
// Băm SHA-256 → chuỗi hex, dùng Web Crypto (có sẵn trên Edge Runtime).
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ArrayBuffer → base64 (dùng btoa, có sẵn trên Edge Runtime).
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // TODO: đổi thành domain Vercel thật sau khi deploy
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
  })
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, giống api/claude.ts và api/pronunciation.ts
export const config = {
  runtime: 'edge',
}
