// Text-to-Speech — gọi Google TTS qua /api/tts (server-side, có cache dùng chung)
// Audio được cache lên Supabase Storage: câu đã phát 1 lần thì mọi user sau dùng lại miễn phí.
// Fallback về Web Speech API nếu /api/tts lỗi (mất mạng, server timeout...).

type Lang = 'en-US' | 'vi-VN'

let currentAudio: HTMLAudioElement | null = null

export function isTTSSupported(): boolean {
  return true // Google TTS luôn hoạt động (không phụ thuộc trình duyệt)
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  // Dừng cả Web Speech API phòng khi đang dùng fallback
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

// Gọi /api/tts → lấy URL audio → phát qua <audio>
async function speakViaGoogle(text: string, lang: Lang): Promise<void> {
  if (!text.trim()) return

  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang, voice: 'female' }),
  })

  if (!res.ok) throw new Error(`TTS API lỗi: ${res.status}`)

  const { audio_url } = await res.json() as { audio_url: string }

  await new Promise<void>((resolve, reject) => {
    const audio = new Audio(audio_url)
    currentAudio = audio
    audio.onended = () => { currentAudio = null; resolve() }
    audio.onerror = () => { currentAudio = null; reject(new Error('Không phát được audio')) }
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
    // Nếu Google TTS lỗi (không có key, mất mạng...) → dùng Web Speech API tạm
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
