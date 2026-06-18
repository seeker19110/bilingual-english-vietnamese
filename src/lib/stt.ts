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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rec.onresult = (e: any) => {
    const result = e.results[e.results.length - 1]
    const t = result[0].transcript as string
    lastTranscript = t
    onResult({ transcript: t, isFinal: result.isFinal as boolean })
  }

  rec.onend = () => onEnd(lastTranscript)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rec.onerror = (e: any) => onError(e.error as string)
  rec.start()

  return () => rec.stop()
}
