// Text-to-Speech — gọi Google TTS qua /api/tts (server-side, có cache dùng chung)
// Audio cache được MÃ HÓA AES-256-GCM trên Supabase Storage: ai có link cũng không
// nghe được nội dung nếu chưa đăng nhập — server chỉ trả khoá giải mã (key_b64/iv_b64)
// cho request có JWT Supabase hợp lệ, gửi qua header Authorization: Bearer <token>.
// Fallback về Web Speech API nếu /api/tts lỗi (mất mạng, server timeout, chưa đăng nhập...).

import { supabase } from './supabase'

type Lang = 'en-US' | 'vi-VN'

let currentAudio: HTMLAudioElement | null = null
let currentBlobUrl: string | null = null

export function isTTSSupported(): boolean {
  return true // Google TTS luôn hoạt động (không phụ thuộc trình duyệt)
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
  // Dừng cả Web Speech API phòng khi đang dùng fallback
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

// ── Giải mã audio AES-256-GCM (xem api/_lib/ttsCrypto.ts ở phía server) ─────
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function decryptCachedAudio(audioUrl: string, keyB64: string, ivB64: string): Promise<string> {
  const cipherRes = await fetch(audioUrl)
  if (!cipherRes.ok) throw new Error(`Không tải được audio: ${cipherRes.status}`)
  const cipherBuffer = await cipherRes.arrayBuffer()

  const keyBytes = base64ToBytes(keyB64)
  const ivBytes = base64ToBytes(ivB64)
  // Ép kiểu BufferSource: @types/node làm Uint8Array generic theo ArrayBufferLike, lệch với
  // kiểu BufferSource của lib DOM — chỉ là vấn đề kiểu TypeScript, không ảnh hưởng runtime.
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, 'AES-GCM', false, ['decrypt'])
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes as BufferSource }, key, cipherBuffer)

  const blob = new Blob([plainBuffer], { type: 'audio/mpeg' })
  return URL.createObjectURL(blob)
}

// Gọi /api/tts (kèm JWT) → giải mã audio → phát qua <audio>
async function speakViaGoogle(text: string, lang: Lang): Promise<void> {
  if (!text.trim()) return

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Chưa đăng nhập — không gọi được /api/tts')

  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, lang, voice: 'female' }),
  })

  if (!res.ok) throw new Error(`TTS API lỗi: ${res.status}`)

  const { audio_url, key_b64, iv_b64 } = await res.json() as {
    audio_url: string; key_b64: string; iv_b64: string
  }

  const blobUrl = await decryptCachedAudio(audio_url, key_b64, iv_b64)

  await new Promise<void>((resolve, reject) => {
    const audio = new Audio(blobUrl)
    currentAudio = audio
    currentBlobUrl = blobUrl
    const cleanup = () => {
      URL.revokeObjectURL(blobUrl)
      if (currentBlobUrl === blobUrl) currentBlobUrl = null
      if (currentAudio === audio) currentAudio = null
    }
    audio.onended = () => { cleanup(); resolve() }
    audio.onerror = () => { cleanup(); reject(new Error('Không phát được audio')) }
    audio.play().catch(reject)
  })
}

// Fallback Web Speech API khi Google TTS không khả dụng
function speakViaWebSpeech(text: string, lang: Lang): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || !text.trim()) { resolve(); return }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang
    utt.rate = lang === 'en-US' ? 0.9 : 0.85
    utt.onend = () => resolve()
    utt.onerror = () => resolve() // không throw để tránh crash UI
    window.speechSynthesis.speak(utt)
  })
}

export async function speak(text: string, lang: Lang): Promise<void> {
  try {
    await speakViaGoogle(text, lang)
  } catch {
    // Lỗi Google TTS (chưa đăng nhập, mất mạng, server lỗi...) → dùng Web Speech API tạm
    await speakViaWebSpeech(text, lang)
  }
}

// Đọc tuần tự: câu hội thoại (ngôn ngữ đích) → sửa lỗi (tiếng mẹ đẻ)
export async function speakBilingual(
  speech: string,
  feedback: string,
  speechLang: Lang = 'en-US',
  feedbackLang: Lang = 'vi-VN',
) {
  if (speech)   await speak(speech, speechLang)
  if (feedback) await speak(feedback, feedbackLang)
}
