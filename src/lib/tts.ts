// Text-to-Speech — gọi Google TTS qua /api/tts (server-side, có cache dùng chung)
// Audio cache được MÃ HÓA AES-256-GCM trên Supabase Storage: ai có link cũng không
// nghe được nội dung nếu chưa đăng nhập — server chỉ trả khoá giải mã (key_b64/iv_b64)
// cho request có JWT Supabase hợp lệ, gửi qua header Authorization: Bearer <token>.
// Fallback về Web Speech API nếu /api/tts lỗi (mất mạng, server timeout, chưa đăng nhập...).

import { supabase } from './supabase'
import { audioCacheKey, getAudioBuffer, setAudioBuffer } from './audioCache'

type Lang = 'en-US' | 'vi-VN'
export type Voice = 'female' | 'male'

let currentAudio: HTMLAudioElement | null = null
let currentBlobUrl: string | null = null

// ── Pause / Resume — dùng cho trình phát hội thoại ──────────────────────────
export function pauseCurrentAudio() {
  if (currentAudio) currentAudio.pause()
  if ('speechSynthesis' in window) window.speechSynthesis.pause()
}

export function resumeCurrentAudio() {
  if (currentAudio) void currentAudio.play().catch(() => {})
  if ('speechSynthesis' in window) window.speechSynthesis.resume()
}

// ── Giọng đọc toàn cục (nữ/nam) ─────────────────────────────────────────────
// Lưu lựa chọn của người dùng vào localStorage để giữ nguyên qua các lần mở app.
// Mọi nút loa (SpeakButton) đọc giá trị này lúc bấm, nên đổi 1 chỗ là áp dụng tất cả.
const VOICE_KEY = 'tts_voice'

export function getVoicePref(): Voice {
  return localStorage.getItem(VOICE_KEY) === 'male' ? 'male' : 'female'
}

export function setVoicePref(voice: Voice): void {
  localStorage.setItem(VOICE_KEY, voice)
}

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

// Tải + giải mã audio → trả ArrayBuffer (lưu được vào IndexedDB, không chiếm RAM liên tục)
async function decryptToBuffer(audioUrl: string, keyB64: string, ivB64: string): Promise<ArrayBuffer> {
  const cipherRes = await fetch(audioUrl)
  if (!cipherRes.ok) throw new Error(`Không tải được audio: ${cipherRes.status}`)
  const cipherBuffer = await cipherRes.arrayBuffer()

  const keyBytes = base64ToBytes(keyB64)
  const ivBytes = base64ToBytes(ivB64)
  // Ép kiểu BufferSource: @types/node làm Uint8Array generic theo ArrayBufferLike, lệch với
  // kiểu BufferSource của lib DOM — chỉ là vấn đề kiểu TypeScript, không ảnh hưởng runtime.
  const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, 'AES-GCM', false, ['decrypt'])
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes as BufferSource }, key, cipherBuffer)
}

// Tạo blob URL tạm từ ArrayBuffer để phát qua <audio>
function bufferToBlobUrl(buffer: ArrayBuffer): string {
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }))
}

// Gọi /api/tts (kèm JWT) → giải mã audio → phát qua <audio>
// rate: 0.75 = chậm, 1 = bình thường, 1.25 = nhanh (điều chỉnh client-side, không tốn thêm API)
// onWord: callback(wordIndex) gọi mỗi khi từ tiếp theo bắt đầu — dùng cho karaoke highlight
async function speakViaGoogle(
  text: string, lang: Lang, voice: Voice, rate = 1,
  onWord?: (idx: number) => void,
): Promise<void> {
  if (!text.trim()) return

  const cacheKey = audioCacheKey(text, lang, voice)

  // Kiểm tra IndexedDB trước — nếu đã có thì tạo blob URL ngay, không gọi server
  const cached = await getAudioBuffer(cacheKey)
  let blobUrl: string

  if (cached) {
    blobUrl = bufferToBlobUrl(cached)
  } else {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) throw new Error('Chưa đăng nhập — không gọi được /api/tts')

    const callTts = () => fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, lang, voice }),
    })

    let res = await callTts()
    // 429 = quá nhiều request (thường do phát nhiều câu liên tiếp). Đợi 1.2s rồi thử lại
    // 1 lần trước khi rơi về Web Speech — phần lớn câu đã cache nên lần 2 thường qua.
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 1200))
      res = await callTts()
    }

    if (!res.ok) throw new Error(`TTS API lỗi: ${res.status}`)

    const { audio_url, key_b64, iv_b64 } = await res.json() as {
      audio_url: string; key_b64: string; iv_b64: string
    }

    const buffer = await decryptToBuffer(audio_url, key_b64, iv_b64)
    // Lưu vào IndexedDB để lần sau (kể cả mở lại app) dùng ngay không cần fetch
    void setAudioBuffer(cacheKey, buffer)
    blobUrl = bufferToBlobUrl(buffer)
  }

  // Tách từ để tính index tương ứng với vị trí phát (ước tính theo tỉ lệ thời gian)
  const words = onWord ? text.trim().split(/\s+/) : []

  await new Promise<void>((resolve, reject) => {
    const audio = new Audio(blobUrl)
    audio.playbackRate = rate
    currentAudio = audio
    currentBlobUrl = blobUrl

    // Cập nhật từ đang phát dựa trên tiến trình audio (≈4 lần/giây)
    if (onWord && words.length > 0) {
      audio.onloadedmetadata = () => {
        const dur = audio.duration
        audio.ontimeupdate = () => {
          if (!dur || dur <= 0) return
          const idx = Math.min(Math.floor((audio.currentTime / dur) * words.length), words.length - 1)
          onWord(idx)
        }
      }
    }

    const cleanup = () => {
      // Blob URL là tạm — revoke ngay sau khi phát xong để giải phóng RAM.
      // Buffer gốc vẫn còn trong IndexedDB, lần sau tạo blob URL mới từ buffer đó.
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
function speakViaWebSpeech(
  text: string, lang: Lang, voice: Voice, rate = 1,
  onWord?: (idx: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || !text.trim()) { resolve(); return }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang
    utt.rate = (lang === 'en-US' ? 0.9 : 0.85) * rate

    // WebSpeech API cung cấp sự kiện 'boundary' với charIndex chính xác hơn ước tính tỉ lệ
    if (onWord) {
      const words = text.trim().split(/\s+/)
      utt.onboundary = (e: SpeechSynthesisEvent) => {
        if (e.name !== 'word') return
        let cumLen = 0
        for (let i = 0; i < words.length; i++) {
          if (e.charIndex <= cumLen + words[i].length) { onWord(i); return }
          cumLen += words[i].length + 1 // +1 cho dấu cách
        }
      }
    }

    // Cố chọn giọng nam/nữ khớp ngôn ngữ nếu trình duyệt có sẵn (không phải lúc nào cũng có)
    const wanted = window.speechSynthesis.getVoices().find((v) => {
      if (!v.lang.startsWith(lang.slice(0, 2))) return false
      const n = v.name.toLowerCase()
      return voice === 'male'
        ? n.includes('male') || n.includes('david') || n.includes('nam')
        : n.includes('female') || n.includes('zira') || n.includes('samantha') || n.includes('nữ')
    })
    if (wanted) utt.voice = wanted
    utt.onend = () => resolve()
    utt.onerror = () => resolve() // không throw để tránh crash UI
    window.speechSynthesis.speak(utt)
  })
}

export async function speak(
  text: string, lang: Lang,
  voice: Voice = getVoicePref(),
  rate = 1,
  onWord?: (idx: number) => void,
): Promise<void> {
  try {
    await speakViaGoogle(text, lang, voice, rate, onWord)
  } catch {
    // Lỗi Google TTS (chưa đăng nhập, mất mạng, server lỗi...) → dùng Web Speech API tạm
    await speakViaWebSpeech(text, lang, voice, rate, onWord)
  }
}

// Đọc tuần tự: câu hội thoại (ngôn ngữ đích) → sửa lỗi (tiếng mẹ đẻ)
export async function speakBilingual(
  speech: string,
  feedback: string,
  speechLang: Lang = 'en-US',
  feedbackLang: Lang = 'vi-VN',
  voice: Voice = getVoicePref(),
  rate = 1,
) {
  if (speech)   await speak(speech, speechLang, voice, rate)
  if (feedback) await speak(feedback, feedbackLang, voice, rate)
}
