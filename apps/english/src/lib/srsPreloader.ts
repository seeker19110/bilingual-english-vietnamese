// ──────────────────────────────────────────────────────────────────────────
// SRS PRELOADER — Nạp trước audio & từ vựng cho Chế độ Học SRS Offline
//
// Tải trước định nghĩa, câu ví dụ và audio phát âm của các thẻ SRS đến hạn
// (và thẻ sắp đến hạn) vào IndexedDB (audioCache.ts), sẵn sàng cho học viên
// ôn tập flashcard mượt mà kể cả khi không có kết nối mạng.
// ──────────────────────────────────────────────────────────────────────────

import type { DictEntry } from '../types'
import { getDueWords } from './srs'
import { getVoicePref, prefetchSpeech } from './tts'
import { audioCacheKey, getAudioBuffer } from './audioCache'

// Ngủ ngắn nhường main thread giữa các file audio
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export interface SrsOfflineStatus {
  cachedCount: number
  totalDue: number
  isFullyPrepared: boolean
}

// Kiểm tra có bao nhiêu thẻ SRS đến hạn đã có sẵn audio offline trong IndexedDB
export async function getSrsOfflineAudioStatus(
  uid: string,
  pool: DictEntry[],
): Promise<SrsOfflineStatus> {
  const dueWords = getDueWords(uid, pool)
  const totalDue = dueWords.length
  if (totalDue === 0) {
    return { cachedCount: 0, totalDue: 0, isFullyPrepared: true }
  }

  const voice = getVoicePref()
  let cachedCount = 0

  for (const entry of dueWords) {
    const key = audioCacheKey(entry.word, 'en-US', voice)
    const buf = await getAudioBuffer(key)
    if (buf) cachedCount++
  }

  return {
    cachedCount,
    totalDue,
    isFullyPrepared: cachedCount >= totalDue,
  }
}

// Tải trước audio cho các từ SRS đến hạn (kèm câu ví dụ)
export async function preloadSrsAudio(
  uid: string,
  pool: DictEntry[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ done: number; total: number }> {
  const dueWords = getDueWords(uid, pool)
  // Nếu không có thẻ nào due, lấy tối đa 20 từ tiếp theo để chuẩn bị sẵn
  const targetWords = dueWords.length > 0 ? dueWords : pool.slice(0, 20)
  const total = targetWords.length

  if (total === 0) {
    onProgress?.(0, 0)
    return { done: 0, total: 0 }
  }

  const voice = getVoicePref()
  let done = 0

  for (const entry of targetWords) {
    try {
      // Prefetch audio phát âm từ
      await prefetchSpeech(entry.word, 'en-US', voice)
      // Prefetch audio ví dụ nếu có
      if (entry.ex_en) {
        await prefetchSpeech(entry.ex_en, 'en-US', voice)
      }
    } catch {
      /* bỏ qua lỗi preload 1 file */
    }
    done++
    onProgress?.(done, total)
    await sleep(60)
  }

  return { done, total }
}
