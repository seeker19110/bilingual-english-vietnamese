// Text-to-Speech ưu tiên dùng Google TTS (giọng tự nhiên, chất lượng cao) qua endpoint /api/tts.
// Nếu gọi Google lỗi (mất mạng / server chưa cấu hình key) thì TỰ ĐỘNG quay về Web Speech API
// (giọng trình duyệt) để app không bao giờ "im tiếng".
//
// Caching: nội dung TĨNH (câu ví dụ, cụm từ, bài học) → opts.cache = true (mặc định), server lưu
// audio lên Supabase, lần sau khỏi tạo lại. Nội dung ĐỘNG (câu trả lời AI) → opts.cache = false,
// server chỉ tạo audio tạm, không lưu.
//
// Bảo mật: audio TĨNH lưu trên Storage được server mã hóa AES-256-GCM (xem api/_lib/ttsCrypto.ts).
// Server chỉ kèm khoá giải mã (key_b64/iv_b64) trong response nếu request có đăng nhập (gửi kèm
// access_token Supabase) — chưa đăng nhập thì nhận được audio_url nhưng không giải mã được, sẽ
// tự fallback sang giọng trình duyệt như lúc lỗi mạng.

import { supabase } from './supabaseClient'

// ── Theo dõi audio Google đang phát để có thể dừng (stopSpeaking) ───────────
let currentAudio: HTMLAudioElement | null = null
// Hàm "kết thúc sạch" của lần phát hiện tại — stopSpeaking gọi để resolve Promise đang chờ,
// tránh việc dừng chủ động bị hiểu nhầm thành lỗi rồi kích hoạt fallback giọng trình duyệt.
let currentStop: (() => void) | null = null

export interface SpeakOptions {
  cache?: boolean            // true: nội dung tĩnh (lưu cache) | false: nội dung động
  voice?: 'female' | 'male'  // giọng nam/nữ (mặc định nữ)
  onPlay?: () => void        // gọi đúng lúc audio bắt đầu phát (sau khi đã tải xong)
}

// ── (1) Google TTS ──────────────────────────────────────────────────────────
// Trả về true nếu phát thành công bằng Google; false nếu thất bại (để caller fallback).
async function speakGoogle(text: string, lang: 'en' | 'vi', opts: SpeakOptions): Promise<boolean> {
  const useCache = opts.cache ?? true
  let data: { audio_url?: string; audio_base64?: string; key_b64?: string; iv_b64?: string; error?: string }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    // Nội dung tĩnh (cache) cần kèm token đăng nhập để server biết có nên trả khoá giải mã
    // hay không. Chưa đăng nhập vẫn gọi được, chỉ là sẽ không nhận được khoá.
    if (useCache) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`
    }
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text,
        lang: lang === 'en' ? 'en-US' : 'vi-VN',
        voice: opts.voice ?? 'female',
        cache: useCache,
      }),
    })
    if (!res.ok) return false
    data = (await res.json()) as typeof data
  } catch {
    return false // lỗi mạng / fetch → để caller fallback
  }

  // Nội dung ĐỘNG: server trả audio_base64 (data URL), không mã hóa, phát trực tiếp.
  if (data.audio_base64) {
    await playAudio(`data:audio/mpeg;base64,${data.audio_base64}`, opts.onPlay)
    return true
  }

  // Nội dung TĨNH: audio trên Storage đã bị mã hóa AES-256-GCM ở server — phải có
  // key_b64 + iv_b64 (server chỉ trả cho request đã đăng nhập) mới giải mã được.
  if (data.audio_url) {
    if (!data.key_b64 || !data.iv_b64) return false // chưa đăng nhập → fallback giọng trình duyệt
    const blobUrl = await decryptCachedAudio(data.audio_url, data.key_b64, data.iv_b64)
    if (!blobUrl) return false // giải mã lỗi (khoá sai / dữ liệu cũ chưa mã hóa) → fallback

    // Đã có audio hợp lệ → phát. Lỗi lúc phát (hiếm) coi như đã xong, KHÔNG fallback
    // (tránh đọc lặp lại 2 lần bằng 2 giọng khác nhau).
    await playAudio(blobUrl, opts.onPlay)
    URL.revokeObjectURL(blobUrl) // dọn bộ nhớ — audio đã phát xong (hoặc bị dừng) lúc này
    return true
  }

  return false
}

// Tải ciphertext từ Storage rồi giải mã AES-256-GCM bằng Web Crypto (crypto.subtle) →
// trả về blob: URL phát được như audio thường. Trả null nếu có lỗi bất kỳ (sai khoá, mất
// mạng, dữ liệu cũ chưa mã hóa...) để caller tự fallback, không bao giờ ném lỗi ra ngoài.
async function decryptCachedAudio(audioUrl: string, keyB64: string, ivB64: string): Promise<string | null> {
  try {
    const res = await fetch(audioUrl)
    if (!res.ok) return null
    const cipherBuffer = await res.arrayBuffer()
    const keyBytes = base64ToBytes(keyB64)
    const iv = base64ToBytes(ivB64)
    // Ép kiểu BufferSource: @types/node làm Uint8Array generic theo ArrayBufferLike, lệch
    // với kiểu BufferSource của lib DOM (chỉ là vấn đề kiểu TypeScript, không ảnh hưởng runtime).
    const key = await crypto.subtle.importKey('raw', keyBytes as BufferSource, 'AES-GCM', false, ['decrypt'])
    const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, cipherBuffer)
    return URL.createObjectURL(new Blob([plainBuffer], { type: 'audio/mpeg' }))
  } catch {
    return null
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// Phát 1 file audio, đợi tới khi đọc xong hoặc bị dừng chủ động (luôn resolve, không reject).
function playAudio(src: string, onPlay?: () => void): Promise<void> {
  return new Promise((resolve) => {
    stopSpeaking() // dừng mọi thứ đang phát trước đó
    const audio = new Audio(src)
    let done = false
    const finish = () => {
      if (done) return
      done = true
      if (currentAudio === audio) { currentAudio = null; currentStop = null }
      resolve()
    }
    audio.onended = finish
    audio.onerror = finish
    currentAudio = audio
    currentStop = finish // stopSpeaking gọi để kết thúc sạch
    audio.play().then(() => onPlay?.()).catch(finish)
  })
}

// ── (2) Web Speech API (fallback miễn phí) ──────────────────────────────────
let voices: SpeechSynthesisVoice[] = []
let voicesLoaded = false

// Tải danh sách giọng đọc — xử lý cả hai trường hợp:
// (1) voices đã sẵn sàng ngay khi gọi, (2) cần đợi sự kiện onvoiceschanged.
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voicesLoaded && voices.length) return Promise.resolve(voices)

  return new Promise(resolve => {
    const immediate = window.speechSynthesis.getVoices()
    if (immediate.length) {
      voices = immediate
      voicesLoaded = true
      resolve(voices)
      return
    }

    const timer = setTimeout(() => {
      voices = window.speechSynthesis.getVoices()
      voicesLoaded = true
      resolve(voices)
    }, 2000)

    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timer)
      voices = window.speechSynthesis.getVoices()
      voicesLoaded = true
      resolve(voices)
    }
  })
}

// Tìm giọng phù hợp: ưu tiên giọng local, nếu không có thì dùng giọng online (Google)
function findVoice(langPrefix: string): SpeechSynthesisVoice | undefined {
  return (
    voices.find(v => v.lang.startsWith(langPrefix) && v.localService) ??
    voices.find(v => v.lang.startsWith(langPrefix))
  )
}

// Các lỗi "bình thường" — xảy ra khi dừng chủ động, không phải lỗi thật
const BENIGN_ERRORS = new Set(['canceled', 'interrupted'])

// Đọc bằng giọng trình duyệt (fallback). Trả về Promise hoàn tất khi đọc xong.
function speakBrowser(text: string, lang: 'en' | 'vi', onPlay?: () => void): Promise<void> {
  if (!('speechSynthesis' in window) || !text.trim()) return Promise.resolve()

  return loadVoices().then(() => new Promise<void>((resolve, reject) => {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)

    const voice = findVoice(lang === 'en' ? 'en' : 'vi')
    if (voice) utt.voice = voice

    utt.lang = lang === 'en' ? 'en-US' : 'vi-VN'
    utt.rate = lang === 'en' ? 0.9 : 0.85
    utt.pitch = 1.0

    utt.onend = () => resolve()
    utt.onerror = (e) => {
      if (BENIGN_ERRORS.has(e.error)) resolve()
      else reject(new Error(e.error))
    }

    window.speechSynthesis.speak(utt)
    // Một số trình duyệt không bắn onstart kịp — gọi onPlay ngay sau khi enqueue.
    onPlay?.()
  }))
}

// ── API công khai ───────────────────────────────────────────────────────────
export function isTTSSupported(): boolean {
  // Luôn coi là hỗ trợ: ưu tiên Google (chạy mọi trình duyệt có mạng),
  // và còn fallback giọng trình duyệt nếu có.
  return true
}

// Đọc văn bản với ngôn ngữ chỉ định ('en' hoặc 'vi').
// Thử Google trước; nếu thất bại thì fallback giọng trình duyệt.
export async function speak(text: string, lang: 'en' | 'vi', opts: SpeakOptions = {}): Promise<void> {
  if (!text.trim()) return

  const ok = await speakGoogle(text, lang, opts)
  if (ok) return

  // Google thất bại → fallback giọng trình duyệt
  try {
    await speakBrowser(text, lang, opts.onPlay)
  } catch {
    // Lỗi thật (không phải canceled/interrupted) — im lặng
  }
}

export function stopSpeaking() {
  // Dừng audio Google đang phát (resolve sạch Promise, không kích hoạt fallback)
  if (currentAudio) {
    const a = currentAudio
    const stop = currentStop
    currentAudio = null
    currentStop = null
    a.onerror = null
    a.pause()
    if (stop) stop()
  }
  // Dừng giọng trình duyệt (nếu có)
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

// Đọc tuần tự: speech (ngôn ngữ đích) → feedback (ngôn ngữ mẹ đẻ)
// Dùng cho hội thoại AI (nội dung ĐỘNG) nên mặc định KHÔNG cache.
export async function speakBilingual(
  speech: string,
  feedback: string,
  speechLang: 'en-US' | 'vi-VN' = 'en-US',
  feedbackLang: 'en-US' | 'vi-VN' = 'vi-VN',
) {
  const sLang = speechLang.startsWith('en') ? 'en' as const : 'vi' as const
  const fLang = feedbackLang.startsWith('en') ? 'en' as const : 'vi' as const
  if (speech)   await speak(speech, sLang, { cache: false })
  if (feedback) await speak(feedback, fLang, { cache: false })
}
