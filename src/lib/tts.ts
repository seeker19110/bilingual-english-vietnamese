// Text-to-Speech — gọi Google TTS qua /api/tts (server-side, có cache dùng chung)
// Audio cache được MÃ HÓA AES-256-GCM trên Supabase Storage: ai có link cũng không
// nghe được nội dung nếu chưa đăng nhập — server chỉ trả khoá giải mã (key_b64/iv_b64)
// cho request có JWT Supabase hợp lệ, gửi qua header Authorization: Bearer <token>.
// Fallback về Web Speech API nếu /api/tts lỗi (mất mạng, server timeout, chưa đăng nhập...).

import { supabase } from './supabase'
import { audioCacheKey, getAudioBuffer, setAudioBuffer } from './audioCache'

type Lang = 'en-US' | 'vi-VN'
export type Voice = 'female' | 'female2' | 'male' | 'male2'

// ── Thẻ <audio> DUY NHẤT dùng chung cho mọi lần phát ────────────────────────
// iOS/Safari (kể cả khi cài PWA) chỉ cho JavaScript phát audio trên một thẻ
// <audio> ĐÃ được người dùng "mở khoá" bằng một cú chạm tay. Nếu mỗi câu tạo
// `new Audio()` mới rồi gọi .play() trong chuỗi async (sau khi await tải/giải mã),
// thì sau câu 1–2 hiệu lực của cú chạm tay đã hết → iOS chặn các câu sau (hội
// thoại đứng giữa chừng). Khắc phục: tái dùng MỘT thẻ duy nhất, mở khoá 1 lần
// lúc chạm đầu tiên (unlockAudio), sau đó chỉ đổi .src cho từng câu — thẻ đã mở
// khoá sẽ phát được mãi. Máy tính không có giới hạn này nên trước đây vẫn chạy.
let sharedAudio: HTMLAudioElement | null = null
let audioUnlocked = false
let currentBlobUrl: string | null = null
let currentAudioId: string | null = null
// Callback để unblock Promise đang chờ trong speakViaGoogle khi stopSpeaking() được gọi
let currentResolve: (() => void) | null = null

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio()
    sharedAudio.preload = 'auto'
  }
  return sharedAudio
}

// Gỡ mọi handler cũ trên thẻ dùng chung trước khi gắn handler cho lượt phát mới
function clearAudioHandlers(a: HTMLAudioElement) {
  a.onended = null
  a.onerror = null
  a.ontimeupdate = null
  a.onloadedmetadata = null
}

// WAV im lặng cực ngắn để "mở khoá" thẻ audio trên iOS (tạo 1 lần, dùng lại)
let silentUrl: string | null = null
function getSilentUrl(): string {
  if (silentUrl) return silentUrl
  const numSamples = 8
  const buf = new ArrayBuffer(44 + numSamples)
  const dv = new DataView(buf)
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i))
  }
  writeStr(0, 'RIFF'); dv.setUint32(4, 36 + numSamples, true); writeStr(8, 'WAVE')
  writeStr(12, 'fmt '); dv.setUint32(16, 16, true)
  dv.setUint16(20, 1, true)     // PCM
  dv.setUint16(22, 1, true)     // 1 kênh (mono)
  dv.setUint32(24, 8000, true)  // sample rate
  dv.setUint32(28, 8000, true)  // byte rate
  dv.setUint16(32, 1, true)     // block align
  dv.setUint16(34, 8, true)     // 8 bit / mẫu
  writeStr(36, 'data'); dv.setUint32(40, numSamples, true)
  for (let i = 0; i < numSamples; i++) dv.setUint8(44 + i, 128) // 128 = im lặng (8-bit)
  silentUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
  return silentUrl
}

// Mở khoá audio cho iOS — PHẢI gọi ĐỒNG BỘ bên trong handler của một cú chạm tay
// (onClick/onTouch...), TRƯỚC mọi await. Phát 1 đoạn im lặng để Safari đánh dấu
// thẻ dùng chung là "được người dùng cho phép". Gọi nhiều lần vẫn an toàn (chỉ
// chạy thực sự ở lần đầu).
export function unlockAudio(): void {
  if (audioUnlocked) return
  try {
    const a = getSharedAudio()
    a.src = getSilentUrl()
    const p = a.play()
    if (p && typeof p.then === 'function') {
      p.then(() => { a.pause(); a.currentTime = 0 }).catch(() => {})
    }
    audioUnlocked = true
  } catch { /* sẽ thử lại ở lần phát thật */ }
}

// ── Pause / Resume — dùng cho trình phát hội thoại ──────────────────────────
export function pauseCurrentAudio() {
  if (sharedAudio) sharedAudio.pause()
  if ('speechSynthesis' in window) window.speechSynthesis.pause()
}

export function resumeCurrentAudio() {
  if (sharedAudio) void sharedAudio.play().catch(() => {})
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
  if (sharedAudio) {
    // Xóa handler trước khi pause để tránh onerror/onended fire sau khi đã stop.
    // KHÔNG huỷ thẻ sharedAudio (đặt = null) — phải giữ lại để nó vẫn "đã mở
    // khoá" trên iOS cho các lần phát sau. Chỉ pause + revoke blob là đủ.
    clearAudioHandlers(sharedAudio)
    sharedAudio.pause()
  }
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
  currentAudioId = null
  // Dừng cả Web Speech API phòng khi đang dùng fallback
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  // Unblock Promise đang chờ trong speakViaGoogle (nếu có) — resolve thay vì reject
  // để speak() KHÔNG fallback sang Web Speech khi bị stop có chủ đích
  currentResolve?.()
  currentResolve = null
}

// Phát audio từ URL ngoài TTS (ví dụ phát âm từ) — dùng chung thẻ sharedAudio để ngăn chồng
export function playAudioUrl(url: string): void {
  stopSpeaking()
  const audio = getSharedAudio()
  const audioId = crypto.randomUUID()
  currentAudioId = audioId
  clearAudioHandlers(audio)
  audio.playbackRate = 1
  audio.src = url
  const cleanup = () => {
    if (currentAudioId === audioId) currentAudioId = null
  }
  audio.onended = cleanup
  audio.onerror = cleanup
  audio.play().catch(err => {
    console.error('Lỗi phát audio:', err)
    cleanup()
  })
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

// ── Nạp audio (IndexedDB → server) — tách riêng để vừa phát vừa NẠP TRƯỚC ────
// Trả ArrayBuffer đã giải mã, sẵn sàng phát. Có trong IndexedDB thì lấy ngay;
// chưa có thì gọi /api/tts → giải mã → lưu IndexedDB. Dùng chung cho cả việc
// phát ngay (speakViaGoogle) lẫn nạp trước (prefetchSpeech).
//
// `inflight`: gộp các yêu cầu TRÙNG key đang chạy làm 1 — tránh việc trình phát
// và bộ nạp-trước cùng tải một câu (tải đôi + dễ dính 429).
const inflight = new Map<string, Promise<ArrayBuffer>>()

async function ensureAudioBuffer(text: string, lang: Lang, voice: Voice): Promise<ArrayBuffer> {
  const cacheKey = audioCacheKey(text, lang, voice)

  // Kiểm tra IndexedDB trước — nếu đã có thì khỏi gọi server
  const cached = await getAudioBuffer(cacheKey)
  if (cached) return cached

  // Đang có yêu cầu tải cùng câu này (vd: bộ nạp-trước) → dùng chung, không tải lại
  const running = inflight.get(cacheKey)
  if (running) return running

  const job = (async () => {
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
    // 1 lần trước khi báo lỗi — phần lớn câu đã cache nên lần 2 thường qua.
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
    return buffer
  })()

  inflight.set(cacheKey, job)
  try {
    return await job
  } finally {
    inflight.delete(cacheKey)
  }
}

// Nạp TRƯỚC audio một câu vào IndexedDB mà KHÔNG phát — gọi nền cho các câu kế
// tiếp để khi tới lượt phát đã có sẵn, hội thoại chạy liền mạch không bị khựng.
// Lỗi thì bỏ qua (sẽ tải lại lúc phát). Không giữ buffer trong RAM — chỉ cần nó
// nằm trong IndexedDB là đủ.
export async function prefetchSpeech(
  text: string, lang: Lang, voice: Voice = getVoicePref(),
): Promise<void> {
  if (!text.trim()) return
  try { await ensureAudioBuffer(text, lang, voice) } catch { /* sẽ tải lại lúc phát */ }
}

// Gọi /api/tts (kèm JWT) → giải mã audio → phát qua <audio>
// rate: 0.75 = chậm, 1 = bình thường, 1.25 = nhanh (điều chỉnh client-side, không tốn thêm API)
// onWord: callback(wordIndex) gọi mỗi khi từ tiếp theo bắt đầu — dùng cho karaoke highlight
async function speakViaGoogle(
  text: string, lang: Lang, voice: Voice, rate = 1,
  onWord?: (idx: number) => void,
): Promise<void> {
  if (!text.trim()) return

  // Lấy audio (ưu tiên IndexedDB; bộ nạp-trước thường đã tải sẵn câu này)
  const buffer = await ensureAudioBuffer(text, lang, voice)
  const blobUrl = bufferToBlobUrl(buffer)

  // Tách từ để tính index tương ứng với vị trí phát (ước tính theo tỉ lệ thời gian)
  const words = onWord ? text.trim().split(/\s+/) : []
  const audioId = crypto.randomUUID()

  await new Promise<void>((resolve, reject) => {
    // Tái dùng thẻ <audio> đã mở khoá (xem ghi chú đầu file) thay vì tạo mới mỗi câu
    const audio = getSharedAudio()
    clearAudioHandlers(audio)
    audio.pause()
    audio.src = blobUrl
    audio.playbackRate = rate
    currentBlobUrl = blobUrl
    currentAudioId = audioId
    // Lưu resolve để stopSpeaking() có thể unblock Promise này mà không cần onerror
    currentResolve = resolve

    // Cập nhật từ đang phát dựa trên tiến trình audio (≈4 lần/giây)
    if (onWord && words.length > 0) {
      audio.onloadedmetadata = () => {
        const dur = audio.duration
        audio.ontimeupdate = () => {
          // Chỉ cập nhật nếu audio này vẫn còn active (không bị thay thế)
          if (currentAudioId !== audioId || !dur || dur <= 0) return
          const idx = Math.min(Math.floor((audio.currentTime / dur) * words.length), words.length - 1)
          onWord(idx)
        }
      }
    }

    const cleanup = () => {
      // Blob URL là tạm — revoke ngay sau khi phát xong để giải phóng RAM.
      // Buffer gốc vẫn còn trong IndexedDB, lần sau tạo blob URL mới từ buffer đó.
      URL.revokeObjectURL(blobUrl)
      // Chỉ cleanup nếu lượt phát này vẫn còn active (chưa bị câu khác thay thế)
      if (currentBlobUrl === blobUrl && currentAudioId === audioId) currentBlobUrl = null
      if (currentAudioId === audioId) currentAudioId = null
      if (currentResolve === resolve) currentResolve = null
    }
    audio.onended = () => { cleanup(); resolve() }
    audio.onerror = () => { cleanup(); reject(new Error('Không phát được audio')) }
    audio.play().catch(err => { cleanup(); reject(err) })
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
