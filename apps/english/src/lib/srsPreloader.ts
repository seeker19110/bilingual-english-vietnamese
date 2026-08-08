// ──────────────────────────────────────────────────────────────────────────
// SRS PRELOADER — Nạp trước audio & từ vựng cho Chế độ Học SRS Offline
//
// Tải trước audio phát âm của từ + câu ví dụ các thẻ SRS đến hạn vào IndexedDB
// (audioCache.ts), sẵn sàng cho học viên ôn flashcard kể cả khi mất mạng.
//
// [2026-08-08] Sửa & nâng cấp — 4 lỗi khiến thanh "Tải trước SRS Offline" hiện ra
// nhưng thực tế vô dụng:
//   1. Chỉ nạp ĐÚNG 1 giọng (getVoicePref()). Bật chế độ giọng ngẫu nhiên thì mỗi
//      tab/phiên bốc giọng khác → khoá cache khác → offline vẫn không có audio.
//      NAY: nạp TẤT CẢ giọng gói người dùng được phép dùng (getPreloadVoices()).
//   2. Khoá kiểm tra tự ghép audioCacheKey(word, 'en-US', voice) — lệch với khoá bộ
//      phát dùng ở nhóm giọng ElevenLabs/Studio → luôn báo "chưa có" dù đã tải.
//      NAY: dùng chung speechCacheKey() của lib/tts.ts.
//   3. Không có thẻ due → status trả 0/0 "đã sẵn sàng", trong khi preload lại tải 20
//      từ đầu pool → bấm Tải xong thanh vẫn 0/0, người dùng tưởng không chạy.
//      NAY: status và preload dùng CHUNG một danh sách mục tiêu (getPreloadTargets).
//   4. Không đếm câu ví dụ dù có tải, và chạy sleep(60ms) → ~1000 request/phút, vượt
//      rate limit 60/phút của /api/tts (packages/core-ai/tts.ts) → 429 hàng loạt.
//      NAY: đếm cả ví dụ; bỏ qua mục đã có sẵn (không tốn request); chỉ giãn nhịp sau
//      request THẬT, đủ chậm để nằm dưới hạn mức.
// ──────────────────────────────────────────────────────────────────────────

import type { DictEntry } from '../types'
import { getDueWords } from './srs'
import { prefetchSpeech, speechCacheKey } from './tts'
import { getAudioBuffer } from './audioCache'
import { getPreloadVoices, type VoiceId } from './voiceTiers'

// Ngủ ngắn nhường main thread giữa các file audio
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Số từ chuẩn bị sẵn khi CHƯA có thẻ nào đến hạn (để offline vẫn học được ngay)
const LOOKAHEAD_WORDS = 20

// Giãn cách giữa 2 request TẢI THẬT. /api/tts giới hạn 60 request/phút mỗi IP; để chừa chỗ
// cho chính người dùng đang bấm nghe, giữ nhịp ~48 request/phút.
const REQUEST_GAP_MS = 1250

// Ngôn ngữ ôn SRS luôn là tiếng Anh (thẻ từ vựng tiếng Anh)
const SRS_LANG = 'en-US' as const

export interface SrsOfflineStatus {
  /** Số MỤC audio (từ/ví dụ × giọng) đã có sẵn trong IndexedDB */
  cachedCount: number
  /** Tổng số mục audio cần có để ôn offline trọn vẹn */
  totalDue: number
  isFullyPrepared: boolean
  /** Số từ sẽ được chuẩn bị (thẻ đến hạn, hoặc 20 từ kế tiếp nếu chưa có thẻ nào) */
  wordCount: number
  /** Số giọng đang nạp — bằng số giọng gói hiện tại cho phép */
  voiceCount: number
  /** true khi danh sách là "chuẩn bị trước" chứ không phải thẻ đang đến hạn */
  isLookahead: boolean
}

// Danh sách từ cần chuẩn bị — DÙNG CHUNG cho cả đếm trạng thái lẫn tải, để hai bên không
// bao giờ lệch nhau (lỗi 3 ở đầu file).
function getPreloadTargets(
  uid: string,
  pool: DictEntry[],
): { words: DictEntry[]; isLookahead: boolean } {
  const due = getDueWords(uid, pool)
  if (due.length > 0) return { words: due, isLookahead: false }
  return { words: pool.slice(0, LOOKAHEAD_WORDS), isLookahead: true }
}

// Mọi câu cần có audio cho 1 từ: chính từ đó + câu ví dụ (nếu có)
function textsOf(entry: DictEntry): string[] {
  const texts = [entry.word]
  if (entry.ex_en?.trim()) texts.push(entry.ex_en)
  return texts.filter((t) => t.trim().length > 0)
}

// Mọi mục (câu × giọng) cần nạp cho danh sách từ
function buildJobs(words: DictEntry[], voices: VoiceId[]): { text: string; voice: VoiceId }[] {
  const jobs: { text: string; voice: VoiceId }[] = []
  for (const entry of words) {
    for (const text of textsOf(entry)) {
      for (const voice of voices) jobs.push({ text, voice })
    }
  }
  return jobs
}

// Kiểm tra đã nạp được bao nhiêu mục audio offline cho các thẻ SRS
export async function getSrsOfflineAudioStatus(
  uid: string,
  pool: DictEntry[],
): Promise<SrsOfflineStatus> {
  const { words, isLookahead } = getPreloadTargets(uid, pool)
  const voices = getPreloadVoices(SRS_LANG)
  const jobs = buildJobs(words, voices)

  if (jobs.length === 0) {
    return {
      cachedCount: 0,
      totalDue: 0,
      isFullyPrepared: true,
      wordCount: 0,
      voiceCount: voices.length,
      isLookahead,
    }
  }

  let cachedCount = 0
  for (const job of jobs) {
    if (await getAudioBuffer(speechCacheKey(job.text, SRS_LANG, job.voice))) cachedCount++
  }

  return {
    cachedCount,
    totalDue: jobs.length,
    isFullyPrepared: cachedCount >= jobs.length,
    wordCount: words.length,
    voiceCount: voices.length,
    isLookahead,
  }
}

export interface PreloadOptions {
  onProgress?: (done: number, total: number) => void
  /** Trả true để DỪNG giữa chừng (nút "Dừng" trên UI) */
  shouldStop?: () => boolean
}

// Tải trước audio cho các từ SRS đến hạn, ĐỦ MỌI GIỌNG gói hiện tại cho phép.
// Mục đã có trong IndexedDB được bỏ qua ngay (không gọi API, không chờ) nên lần bấm thứ hai
// gần như xong tức thì.
export async function preloadSrsAudio(
  uid: string,
  pool: DictEntry[],
  options: PreloadOptions | ((done: number, total: number) => void) = {},
): Promise<{ done: number; total: number; stopped: boolean }> {
  const { onProgress, shouldStop } =
    typeof options === 'function' ? { onProgress: options } : options

  const { words } = getPreloadTargets(uid, pool)
  const voices = getPreloadVoices(SRS_LANG)
  const jobs = buildJobs(words, voices)
  const total = jobs.length

  if (total === 0) {
    onProgress?.(0, 0)
    return { done: 0, total: 0, stopped: false }
  }

  let done = 0
  for (const job of jobs) {
    if (shouldStop?.()) return { done, total, stopped: true }

    const key = speechCacheKey(job.text, SRS_LANG, job.voice)
    // Đã có sẵn → không tốn request, cũng không cần giãn nhịp
    if (await getAudioBuffer(key)) {
      done++
      onProgress?.(done, total)
      continue
    }

    try {
      await prefetchSpeech(job.text, SRS_LANG, job.voice)
    } catch {
      /* bỏ qua lỗi 1 mục — mục khác vẫn tiếp tục, lát nữa bấm lại là bù được */
    }
    done++
    onProgress?.(done, total)
    await sleep(REQUEST_GAP_MS)
  }

  return { done, total, stopped: false }
}
