// Text-to-Speech dùng Web Speech API (miễn phí, có sẵn trong Chrome/Edge)
// Khi production: thay bằng Azure Neural TTS để có giọng Việt tự nhiên hơn

let voices: SpeechSynthesisVoice[] = []

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const v = window.speechSynthesis.getVoices()
    if (v.length) { voices = v; resolve(v); return }
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices()
      resolve(voices)
    }
  })
}

function findVoice(lang: string): SpeechSynthesisVoice | undefined {
  return voices.find(v => v.lang.startsWith(lang) && v.localService) ??
         voices.find(v => v.lang.startsWith(lang))
}

export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window
}

// Đọc văn bản với ngôn ngữ chỉ định ('en' hoặc 'vi')
export async function speak(text: string, lang: 'en' | 'vi'): Promise<void> {
  if (!isTTSSupported() || !text.trim()) return
  await loadVoices()
  window.speechSynthesis.cancel() // dừng nếu đang đọc

  return new Promise((resolve, reject) => {
    const utt = new SpeechSynthesisUtterance(text)
    const voice = findVoice(lang === 'en' ? 'en' : 'vi')
    if (voice) utt.voice = voice
    utt.lang = lang === 'en' ? 'en-US' : 'vi-VN'
    utt.rate = lang === 'en' ? 0.9 : 0.85
    utt.pitch = 1.0
    utt.onend = () => resolve()
    utt.onerror = (e) => reject(new Error(e.error))
    window.speechSynthesis.speak(utt)
  })
}

export function stopSpeaking() {
  window.speechSynthesis.cancel()
}

// Đọc tuần tự: English → Vietnamese (hai giọng riêng)
export async function speakBilingual(speechEn: string, feedbackVi: string) {
  if (speechEn) await speak(speechEn, 'en')
  if (feedbackVi) await speak(feedbackVi, 'vi')
}
