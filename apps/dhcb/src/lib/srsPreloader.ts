// ──────────────────────────────────────────────────────────────────────────
// SRS PRELOADER — Nạp trước audio & từ vựng cho Chế độ Học SRS Offline
//
// Tải trước audio phát âm của từ + câu ví dụ vào IndexedDB (audioCache.ts), sẵn sàng cho
// học viên học/ôn flashcard kể cả khi mất mạng. Phạm vi: thẻ SRS đến hạn HÔM NAY + từ mới
// của tab "Hôm nay" (xem getPreloadTargets).
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
//      NAY: đếm cả ví dụ; mục đã có sẵn đi thẳng không chờ; mục phải gọi API thì đi qua
//      ngân sách trượt 60 giây (xem makeRequestBudget) — nhanh hết mức server cho phép.
// ──────────────────────────────────────────────────────────────────────────

import type { DictEntry } from '../types'
import { getDueWords } from './srs'
import { getTodayBatchFrom, getDailyAllowance } from './curriculum'
import { getLearnedWords } from './vocab'
import { prefetchSpeech, speechCacheKey, getVoicePref } from './tts'
import { getAudioBuffer } from './audioCache'
import { getPreloadVoices, type VoiceId } from './voiceTiers'

// Ngủ ngắn nhường main thread giữa các file audio
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Số từ chuẩn bị sẵn khi KHÔNG có thẻ due lẫn từ mới nào (để offline vẫn học được ngay)
const LOOKAHEAD_WORDS = 20

// ── Nhịp gọi API: NGÂN SÁCH TRƯỢT 60 GIÂY, không phải nghỉ cố định ──────────
// Chỉ mục nào THỰC SỰ phải gọi /api/tts mới tính vào ngân sách; mục đã có trong IndexedDB
// đi thẳng, không chờ một mili-giây nào. Nhờ vậy lượt tải lần hai (phần lớn đã có sẵn) chạy
// vụt qua, còn lượt đầu vẫn nằm dưới hạn mức server.
//
// Server (packages/core-ai/tts.ts) có 2 bộ đếm, đều 60 request/phút mỗi IP: một cho TOÀN BỘ
// /api/tts, một riêng cho đường TẠO audio mới. Ngân sách 50 ở đây nằm dưới cả hai và chừa
// ~10 lượt/phút cho chính người dùng đang bấm nghe song song.
const MAX_REQUESTS_PER_WINDOW = 50
const WINDOW_MS = 60_000

// Mốc thời gian các request thật trong cửa sổ 60s gần nhất. Để ở CẤP MODULE (không phải mỗi
// lượt tải một bộ đếm riêng) — bấm Dừng rồi bấm Tải lại ngay không được cấp thêm ngân sách,
// vì hạn mức của server tính theo IP chứ không theo lượt bấm.
const requestStamps: number[] = []

async function waitForRequestSlot(): Promise<void> {
  const now = Date.now()
  // Bỏ các mốc đã ra khỏi cửa sổ
  while (requestStamps.length > 0 && now - requestStamps[0]! >= WINDOW_MS) requestStamps.shift()
  if (requestStamps.length >= MAX_REQUESTS_PER_WINDOW) {
    // Hết lượt → chờ đúng tới lúc mốc cũ nhất rơi khỏi cửa sổ, không chờ thừa
    await sleep(WINDOW_MS - (now - requestStamps[0]!))
    return waitForRequestSlot()
  }
  requestStamps.push(Date.now())
}

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
//
// Gồm CẢ HAI nhóm từ mà học viên sẽ gặp trong ngày (quyết định 2026-08-09):
//   · thẻ SRS đến hạn ôn hôm nay (getDueWords)
//   · từ MỚI của tab "Hôm nay" (getTodayBatchFrom) — trước đây bị bỏ sót, nên mất mạng
//     giữa buổi là học tiếp không có audio dù thanh tải trước báo đã xong.
// Không có nhóm nào (đã ôn hết + đã học hết phần hôm nay) → chuẩn bị sẵn 20 từ kế tiếp.
function getPreloadTargets(
  uid: string,
  pool: DictEntry[],
): { words: DictEntry[]; isLookahead: boolean } {
  const due = getDueWords(uid, pool)
  const today = getTodayBatchFrom(pool, getLearnedWords(uid), getDailyAllowance(uid))

  // Gộp, khử trùng theo từ (một từ có thể vừa đến hạn ôn vừa nằm trong batch hôm nay)
  const seen = new Set<string>()
  const words: DictEntry[] = []
  for (const entry of [...due, ...today]) {
    const key = entry.word.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    words.push(entry)
  }

  if (words.length > 0) return { words, isLookahead: due.length === 0 }
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
  const voices = getPreloadVoices(SRS_LANG, getVoicePref())
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

// Tải trước audio cho thẻ SRS đến hạn + từ mới hôm nay, ĐỦ MỌI GIỌNG gói hiện tại cho phép.
//
// Chạy HAI LƯỢT (quyết định 2026-08-09) — mục phải gọi API để nạp SAU CÙNG:
//   Lượt 1 — rà toàn bộ IndexedDB, đánh dấu xong ngay những mục đã có sẵn. Không gọi API,
//            không chờ, nên thanh tiến độ nhảy lên phần đã có gần như tức thì.
//   Lượt 2 — mới tải phần còn thiếu qua /api/tts, đi qua ngân sách nhịp.
// Trước đây hai loại xen kẽ nhau: mục có sẵn nằm sau một mục phải chờ ngân sách thì cũng bị
// kẹt theo, dù bản thân nó chẳng tốn gì. Tách lượt cũng có nghĩa: bấm Dừng giữa chừng vẫn giữ
// trọn phần "miễn phí", chỉ bỏ dở phần tốn request.
export async function preloadSrsAudio(
  uid: string,
  pool: DictEntry[],
  options: PreloadOptions | ((done: number, total: number) => void) = {},
): Promise<{ done: number; total: number; stopped: boolean }> {
  const { onProgress, shouldStop } =
    typeof options === 'function' ? { onProgress: options } : options

  const { words } = getPreloadTargets(uid, pool)
  const voices = getPreloadVoices(SRS_LANG, getVoicePref())
  const jobs = buildJobs(words, voices)
  const total = jobs.length

  if (total === 0) {
    onProgress?.(0, 0)
    return { done: 0, total: 0, stopped: false }
  }

  // ── Lượt 1: những mục ĐÃ có sẵn (không tốn request nào) ───────────────────
  let done = 0
  const missing: { text: string; voice: VoiceId }[] = []
  for (const job of jobs) {
    if (shouldStop?.()) return { done, total, stopped: true }
    if (await getAudioBuffer(speechCacheKey(job.text, SRS_LANG, job.voice))) {
      done++
      onProgress?.(done, total)
    } else {
      missing.push(job)
    }
  }

  // ── Lượt 2: phần còn thiếu — PHẢI gọi /api/tts nên để sau cùng ────────────
  for (const job of missing) {
    if (shouldStop?.()) return { done, total, stopped: true }

    // Xin lượt trong ngân sách (thường tức thì, chỉ chờ khi chạm hạn mức)
    await waitForRequestSlot()
    if (shouldStop?.()) return { done, total, stopped: true }

    try {
      await prefetchSpeech(job.text, SRS_LANG, job.voice)
    } catch {
      /* bỏ qua lỗi 1 mục — mục khác vẫn tiếp tục, lát nữa bấm lại là bù được */
    }
    done++
    onProgress?.(done, total)
  }

  return { done, total, stopped: false }
}
