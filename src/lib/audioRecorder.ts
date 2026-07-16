// src/lib/audioRecorder.ts — Ghi âm NGẮN, CHỈ ÂM THANH (không video) cho chấm phát âm chi
// tiết (① Giai đoạn 2, xem PronunciationCheck.tsx). Khác `challengeRecorder.ts` (quay video +
// audio song song cho Challenge, trần 180s) và `sttServer.ts` (ghi âm rồi TỰ gọi /api/stt) —
// module này CHỈ ghi âm và trả Blob thô, để nơi gọi tự chuyển WAV (src/lib/wav.ts) rồi gọi
// /api/pronounce-assess. Trần ngắn (mặc định 15s) vì chỉ chấm 1 câu/từ, không phải hội thoại.

export const MAX_PRONOUNCE_RECORD_SEC = 15

export const AUDIO_REC_ERR_PERMISSION = 'audio-rec-permission-denied'
export const AUDIO_REC_ERR_UNSUPPORTED = 'audio-rec-unsupported'

export function isAudioRecordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

export interface AudioRecording {
  blob: Blob
  mime: string
  durationSec: number
}

export interface AudioRecorderHandle {
  stop: () => Promise<AudioRecording>
  cancel: () => void
}

function pickMime(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  for (const c of candidates) {
    if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(c)) {
      return c
    }
  }
  return ''
}

// Ném Error có message AUDIO_REC_ERR_UNSUPPORTED / AUDIO_REC_ERR_PERMISSION.
export async function startAudioRecording(
  maxSec = MAX_PRONOUNCE_RECORD_SEC,
): Promise<AudioRecorderHandle> {
  if (!isAudioRecordingSupported()) {
    throw new Error(AUDIO_REC_ERR_UNSUPPORTED)
  }

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === 'NotAllowedError' ||
        e.name === 'PermissionDeniedError' ||
        e.name === 'SecurityError')
    ) {
      throw new Error(AUDIO_REC_ERR_PERMISSION)
    }
    throw e instanceof Error ? e : new Error(String(e))
  }

  const mime = pickMime()
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
  const chunks: Blob[] = []
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }

  rec.start()
  const startedAt = Date.now()
  const releaseTracks = () => stream.getTracks().forEach((t) => t.stop())

  let finalized: Promise<AudioRecording> | null = null
  const finalize = (): Promise<AudioRecording> => {
    if (finalized) return finalized
    clearTimeout(autoStopTimer)
    const durationSec = Math.min(maxSec, Math.round((Date.now() - startedAt) / 1000))
    finalized = new Promise<AudioRecording>((resolve) => {
      const toResult = () => ({
        blob: new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' }),
        mime: rec.mimeType || mime || 'audio/webm',
        durationSec,
      })
      if (rec.state === 'inactive') {
        resolve(toResult())
        return
      }
      rec.onstop = () => resolve(toResult())
      try {
        rec.stop()
      } catch {
        resolve(toResult())
      }
    }).finally(releaseTracks)
    return finalized
  }

  const autoStopTimer = setTimeout(() => {
    void finalize()
  }, maxSec * 1000)

  return {
    stop: () => finalize(),
    cancel() {
      clearTimeout(autoStopTimer)
      if (!finalized) {
        finalized = Promise.resolve({
          blob: new Blob([], { type: mime || 'audio/webm' }),
          mime: mime || 'audio/webm',
          durationSec: 0,
        })
      }
      try {
        if (rec.state !== 'inactive') rec.stop()
      } catch {
        /* đã dừng rồi */
      }
      releaseTracks()
    },
  }
}
