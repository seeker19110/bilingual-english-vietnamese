// Text-to-Speech dùng Web Speech API (miễn phí, có sẵn trong Chrome/Edge)
// Khi production: thay bằng Azure Neural TTS để có giọng Việt tự nhiên hơn

let voices: SpeechSynthesisVoice[] = []
let voicesLoaded = false

// Tải danh sách giọng đọc — xử lý cả hai trường hợp:
// (1) voices đã sẵn sàng ngay khi gọi, (2) cần đợi sự kiện onvoiceschanged.
// Timeout 2 giây phòng khi onvoiceschanged đã bắn trước khi ta gắn listener.
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

    // Fallback timeout: nếu onvoiceschanged không bao giờ bắn
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

export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window
}

// Các lỗi "bình thường" — xảy ra khi dừng chủ động, không phải lỗi thật
const BENIGN_ERRORS = new Set(['canceled', 'interrupted'])

// Đọc văn bản với ngôn ngữ chỉ định ('en' hoặc 'vi')
export async function speak(text: string, lang: 'en' | 'vi'): Promise<void> {
  if (!isTTSSupported() || !text.trim()) return
  await loadVoices()
  window.speechSynthesis.cancel() // dừng nếu đang đọc cái gì đó

  return new Promise((resolve, reject) => {
    const utt = new SpeechSynthesisUtterance(text)

    // Tìm giọng phù hợp với ngôn ngữ
    const langPrefix = lang === 'en' ? 'en' : 'vi'
    const voice = findVoice(langPrefix)
    if (voice) utt.voice = voice

    // Đặt ngôn ngữ rõ ràng để trình duyệt chọn đúng accent/giọng đọc
    utt.lang = lang === 'en' ? 'en-US' : 'vi-VN'
    utt.rate = lang === 'en' ? 0.9 : 0.85
    utt.pitch = 1.0

    utt.onend = () => resolve()
    utt.onerror = (e) => {
      // 'canceled'/'interrupted' là do người dùng dừng hoặc bắt đầu câu mới — không phải lỗi
      if (BENIGN_ERRORS.has(e.error)) resolve()
      else reject(new Error(e.error))
    }

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
