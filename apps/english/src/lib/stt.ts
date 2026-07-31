// Speech-to-Text dùng Web Speech API (miễn phí, Chrome/Edge)
// Khi production: thay bằng gpt-4o-mini-transcribe hoặc Deepgram

// Web Speech API không có trong lib.dom.d.ts của TypeScript — khai tối thiểu phần dùng tới
// (thay vì `any`) để vẫn có type safety mà không cần cài @types/dom-speech-recognition.
interface SpeechRecognitionResultLike {
  0: { transcript: string }
  isFinal: boolean
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionErrorEventLike {
  error: string
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
  start(): void
  stop(): void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

export function isSTTSupported(): boolean {
  return !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  )
}

export interface STTResult {
  transcript: string
  isFinal: boolean
}

export function startListening(
  lang: 'en' | 'vi',
  onResult: (r: STTResult) => void,
  onEnd: (lastTranscript: string) => void,
  onError: (err: string) => void,
): () => void {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  const SRClass = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!SRClass) {
    onError('Trình duyệt không hỗ trợ nhận giọng nói. Dùng Chrome hoặc Edge.')
    return () => {}
  }

  const rec = new SRClass()
  rec.lang = lang === 'en' ? 'en-US' : 'vi-VN'
  rec.continuous = false
  rec.interimResults = true

  let lastTranscript = ''
  let gotSpeech = false

  // Chống "mic mở vô tận": tự dừng nếu không nghe thấy gì sau 8s, hoặc nói quá 20s.
  const NO_SPEECH_MS = 8000
  const MAX_MS = 20000
  let noSpeechTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    noSpeechTimer = null
    if (!gotSpeech) {
      try {
        rec.stop()
      } catch {
        /* đã dừng */
      }
      onError('no-speech')
    }
  }, NO_SPEECH_MS)
  const maxTimer = setTimeout(() => {
    try {
      rec.stop()
    } catch {
      /* đã dừng */
    }
  }, MAX_MS)

  function clearTimers() {
    if (noSpeechTimer) {
      clearTimeout(noSpeechTimer)
      noSpeechTimer = null
    }
    clearTimeout(maxTimer)
  }

  rec.onresult = (e) => {
    gotSpeech = true
    if (noSpeechTimer) {
      clearTimeout(noSpeechTimer)
      noSpeechTimer = null
    }
    const result = e.results[e.results.length - 1]!
    const t = result[0].transcript
    lastTranscript = t
    onResult({ transcript: t, isFinal: result.isFinal })
  }

  rec.onend = () => {
    clearTimers()
    onEnd(lastTranscript)
  }
  rec.onerror = (e) => {
    clearTimers()
    onError(e.error)
  }
  rec.start()

  return () => {
    clearTimers()
    rec.onresult = null
    rec.onend = null
    rec.onerror = null
    rec.stop()
  }
}
