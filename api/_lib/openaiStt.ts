// api/_lib/openaiStt.ts
// Speech-to-Text (nhận diện giọng nói) qua OpenAI — model rẻ "gpt-4o-mini-transcribe".
// CHỈ chạy ở server — KHÔNG bao giờ import file này từ code phía browser (src/),
// vì sẽ lộ OPENAI_API_KEY. Tiền tố "_" trong "_lib" để Vercel không coi đây là API route.

export type SttLang = 'en' | 'vi'

// Model phiên âm rẻ của OpenAI. Có thể đổi sang 'whisper-1' nếu cần định dạng khác.
const STT_MODEL = process.env.OPENAI_STT_MODEL || 'gpt-4o-mini-transcribe'

// Đoán đuôi file từ mime để OpenAI nhận đúng định dạng audio.
function extFromMime(mime: string): string {
  if (mime.includes('wav')) return 'wav'
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'mp4'
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3'
  if (mime.includes('ogg')) return 'ogg'
  return 'webm' // mặc định: bản ghi MediaRecorder trên Chrome/Firefox là webm/opus
}

// Gửi audio lên OpenAI và nhận lại văn bản. `lang` giúp model phiên âm chính xác hơn.
export async function transcribeAudio(
  audio: ArrayBuffer,
  mime: string,
  lang: SttLang,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Server chưa cấu hình OPENAI_API_KEY')
  }

  const cleanMime = mime || 'audio/webm'
  const blob = new Blob([audio], { type: cleanMime })

  // OpenAI nhận multipart/form-data với 1 file audio — dùng FormData chuẩn của Web API
  // (có sẵn trên cả Edge Runtime lẫn Node 18+).
  const form = new FormData()
  form.append('file', blob, `audio.${extFromMime(cleanMime)}`)
  form.append('model', STT_MODEL)
  form.append('language', lang)
  form.append('response_format', 'json')

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    throw new Error(`OpenAI STT lỗi (${resp.status}): ${detail.slice(0, 200)}`)
  }

  const data = (await resp.json()) as { text?: string }
  return data.text?.trim() ?? ''
}
