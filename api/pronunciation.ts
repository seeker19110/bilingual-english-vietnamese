// api/pronunciation.ts — Vercel Edge Function
// Endpoint: GET /api/pronunciation?word=apple&voice=female
//   - voice: "female" (mặc định) hoặc "male" — bỏ qua tham số này thì dùng giọng nữ.
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
import { generateAudioFromGoogle, isValidVoice, DEFAULT_VOICE } from './_lib/googleTts'

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const url = new URL(req.url)
  const word = url.searchParams.get('word')?.toLowerCase().trim()
  const voiceParam = url.searchParams.get('voice')?.toLowerCase().trim() || DEFAULT_VOICE

  if (!word) {
    return jsonResponse({ error: 'Thiếu tham số word' }, 400)
  }
  if (!isValidVoice(voiceParam)) {
    return jsonResponse({ error: `voice không hợp lệ: ${voiceParam} (chỉ nhận "female" hoặc "male")` }, 400)
  }
  const voice = voiceParam

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }

  // ── BƯỚC 1: Kiểm tra cache (theo cặp word + voice) ─────────
  const { data: cachedRow } = await supabase
    .from('pronunciations')
    .select('audio_url')
    .eq('word', word)
    .eq('voice', voice)
    .maybeSingle()

  const cachedUrl = (cachedRow as { audio_url?: string } | null)?.audio_url
  if (cachedUrl) {
    return jsonResponse({ audio_url: cachedUrl, cached: true })
  }

  // ── BƯỚC 2: Cache MISS → gọi Google TTS ────────────────────
  let audioData: ArrayBuffer
  try {
    audioData = await generateAudioFromGoogle(word, voice, 'en-US')
  } catch (err) {
    return jsonResponse({ error: `Không thể tạo audio: ${(err as Error).message}` }, 500)
  }

  // ── BƯỚC 3: Upload lên Supabase Storage ────────────────────
  // upsert: true — cho phép ghi đè nếu 2 người tra cùng 1 từ chưa-cache gần như cùng lúc
  // (tránh lỗi "resource already exists" thay vì phải bắt lỗi riêng).
  // Tên file có hậu tố giọng (-female/-male) vì 1 từ giờ có thể có nhiều file audio.
  const fileName = `${encodeURIComponent(word)}-${voice}.mp3`
  const { error: uploadError } = await supabase.storage
    .from('pronunciations')
    .upload(fileName, audioData, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (uploadError) {
    return jsonResponse({ error: `Upload thất bại: ${uploadError.message}` }, 500)
  }

  // ── BƯỚC 4: Lấy public URL ─────────────────────────────────
  const { data: urlData } = supabase.storage.from('pronunciations').getPublicUrl(fileName)
  const audioUrl = urlData.publicUrl

  // ── BƯỚC 5: Lưu vào DB ─────────────────────────────────────
  // upsert theo cặp (word, voice) — cột unique composite — nếu lỡ có request trùng
  // từ+giọng chạy song song thì không bị lỗi vi phạm unique constraint.
  const { error: insertError } = await supabase
    .from('pronunciations')
    .upsert({ word, voice, audio_url: audioUrl, lang: 'en-US' }, { onConflict: 'word,voice' })

  if (insertError) {
    // Audio đã tạo & upload xong nên vẫn trả về cho user dùng được ngay —
    // chỉ là cache DB chưa lưu, lần tra sau sẽ phải tạo lại.
    console.error('Lỗi lưu cache pronunciations:', insertError.message)
  }

  return jsonResponse({ audio_url: audioUrl, cached: false })
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',  // TODO: đổi thành domain Vercel thật sau khi deploy
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
  })
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, giống api/claude.ts đã có
export const config = {
  runtime: 'edge',
}
