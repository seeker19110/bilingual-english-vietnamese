// src/lib/sttServer.ts
// Ghi âm giọng nói người dùng bằng MediaRecorder rồi gửi lên /api/stt để nhận diện
// (OpenAI gpt-4o-mini-transcribe). Chính xác hơn Web Speech API và chạy được trên hầu
// hết trình duyệt hiện đại (kể cả Safari mobile). Web Speech API (src/lib/stt.ts) chỉ
// còn là phương án dự phòng khi máy không hỗ trợ ghi âm.

import { supabase } from './supabase'

// Trình duyệt có hỗ trợ ghi âm không (cần getUserMedia + MediaRecorder).
export function isRecordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

export interface Recorder {
  stop: () => Promise<string> // dừng ghi + trả về văn bản nhận diện
  cancel: () => void          // hủy, không gọi API
}

// Lấy Supabase JWT để server xác thực (giống src/lib/ai.ts).
async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Chọn định dạng ghi âm mà trình duyệt hỗ trợ (Chrome/FF: webm/opus, Safari: mp4).
function pickMime(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  for (const c of candidates) {
    if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(c)) {
      return c
    }
  }
  return '' // để trình duyệt tự chọn mặc định
}

// Bắt đầu ghi âm. Trả về đối tượng Recorder để dừng (và nhận text) hoặc hủy.
export async function startRecording(lang: 'en' | 'vi'): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mime = pickMime()
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
  const chunks: Blob[] = []

  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }
  rec.start()

  // Tắt micro (nhả đèn ghi âm của trình duyệt) khi xong.
  const cleanup = () => stream.getTracks().forEach((t) => t.stop())

  return {
    cancel() {
      try { rec.stop() } catch { /* đã dừng rồi */ }
      cleanup()
    },
    stop() {
      return new Promise<string>((resolve, reject) => {
        rec.onstop = async () => {
          try {
            cleanup()
            const blob = new Blob(chunks, { type: mime || 'audio/webm' })
            if (blob.size === 0) { resolve(''); return }
            const b64 = await blobToBase64(blob)
            const text = await transcribe(b64, blob.type, lang)
            resolve(text)
          } catch (e) {
            cleanup()
            reject(e)
          }
        }
        try { rec.stop() } catch (e) {
          cleanup()
          reject(e)
        }
      })
    },
  }
}

// Gửi audio base64 lên /api/stt và nhận lại văn bản.
async function transcribe(audioB64: string, mime: string, lang: 'en' | 'vi'): Promise<string> {
  const auth = await getAuthHeader()
  const resp = await fetch('/api/stt', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ audio_b64: audioB64, mime, lang }),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Lỗi STT: ${resp.status}`)
  }
  const data = (await resp.json()) as unknown
  if (!data || typeof data !== 'object' || !('text' in data)) {
    throw new Error('STT API returned invalid response')
  }
  const text = (data as { text?: unknown }).text
  if (typeof text !== 'string') {
    throw new Error('STT API returned non-string text')
  }
  if (!text.trim()) {
    throw new Error('STT API returned empty text')
  }
  return text.trim()
}

// Đọc Blob → chuỗi base64 (bỏ tiền tố "data:...;base64,").
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (!reader.result) {
        reject(new Error('FileReader returned no result'))
        return
      }
      const result = typeof reader.result === 'string' ? reader.result : ''
      const b64 = result.split(',')[1] ?? ''
      if (!b64) {
        reject(new Error('Could not extract base64 from FileReader result'))
      } else {
        resolve(b64)
      }
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsDataURL(blob)
  })
}
