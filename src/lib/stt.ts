// Speech-to-Text dùng Web Speech API (miễn phí, Chrome/Edge)
// Khi production: thay bằng gpt-4o-mini-transcribe hoặc Deepgram

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SRClass = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
  if (!SRClass) {
    onError('Trình duyệt không hỗ trợ nhận giọng nói. Dùng Chrome hoặc Edge.')
    return () => {}
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec = new SRClass() as any
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
    if (!gotSpeech) { try { rec.stop() } catch { /* đã dừng */ } onError('no-speech') }
  }, NO_SPEECH_MS)
  const maxTimer = setTimeout(() => { try { rec.stop() } catch { /* đã dừng */ } }, MAX_MS)

  function clearTimers() {
    if (noSpeechTimer) { clearTimeout(noSpeechTimer); noSpeechTimer = null }
    clearTimeout(maxTimer)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rec.onresult = (e: any) => {
    gotSpeech = true
    if (noSpeechTimer) { clearTimeout(noSpeechTimer); noSpeechTimer = null }
    const result = e.results[e.results.length - 1]
    const t = result[0].transcript as string
    lastTranscript = t
    onResult({ transcript: t, isFinal: result.isFinal as boolean })
  }

  rec.onend = () => { clearTimers(); onEnd(lastTranscript) }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rec.onerror = (e: any) => { clearTimers(); onError(e.error as string) }
  rec.start()

  return () => {
    clearTimers()
    rec.onresult = null
    rec.onend = null
    rec.onerror = null
    rec.stop()
  }
}
