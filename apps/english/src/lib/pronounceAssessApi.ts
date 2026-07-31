// src/lib/pronounceAssessApi.ts — Gọi /api/pronounce-assess (① Giai đoạn 2, chấm phát âm
// chi tiết từng âm vị qua Azure). Điểm tính Ở SERVER — file này chỉ convert audio + gọi API.

import { getAuthHeader } from '@core/authHeader'
import { blobToWav16kMono } from './wav'

export interface PhonemeScore {
  phoneme: string
  score: number
}
export interface WordAssessment {
  word: string
  score: number
  errorType: string
  phonemes: PhonemeScore[]
}
export interface PronounceAssessResult {
  overall: number
  accuracy: number
  fluency: number
  completeness: number
  words: WordAssessment[]
}

export type PronounceAssessOutcome =
  | { ok: true; result: PronounceAssessResult }
  // fallback:true = nên rơi về Giai đoạn 1 (chưa cấu hình / hết lượt) — KHÁC lỗi cứng
  // (audio hỏng, mạng lỗi) chỉ nên báo người dùng thử lại.
  | { ok: false; fallback: boolean; message: string }

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

// Chuyển audioBlob (webm/opus ghi từ MediaRecorder) → WAV 16kHz mono → gọi server chấm điểm.
export async function assessPronunciationClient(
  audioBlob: Blob,
  referenceText: string,
): Promise<PronounceAssessOutcome> {
  let wavBuffer: ArrayBuffer
  try {
    wavBuffer = await blobToWav16kMono(audioBlob)
  } catch (e) {
    return {
      ok: false,
      fallback: false,
      message: e instanceof Error ? e.message : 'Không xử lý được bản ghi âm',
    }
  }

  const auth = await getAuthHeader()
  let resp: Response
  try {
    resp = await fetch('/api/pronounce-assess', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...auth },
      body: JSON.stringify({ audio_b64: toBase64(wavBuffer), referenceText }),
    })
  } catch {
    return { ok: false, fallback: false, message: 'Không kết nối được máy chủ' }
  }

  if (!resp.ok) {
    const body = (await resp.json().catch(() => ({}))) as { error?: string; fallback?: boolean }
    return {
      ok: false,
      fallback: !!body.fallback,
      message: body.error ?? `Lỗi chấm phát âm (${resp.status})`,
    }
  }

  const result = (await resp.json()) as PronounceAssessResult
  return { ok: true, result }
}
