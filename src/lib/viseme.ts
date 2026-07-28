// src/lib/viseme.ts — PoC ước lượng thời điểm khẩu hình (viseme) cho avatar nói chuyện.
// Xem docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md — hướng B (ước lượng đơn giản):
// Chirp3-HD (giọng TTS đang dùng, api/_lib/googleTts.ts) KHÔNG hỗ trợ SSML nên không có
// timepoints thật từ server. Ở đây chỉ ƯỚC LƯỢNG bằng cách chia đều thời lượng audio theo
// số âm tiết trong câu — không phải phoneme thật, chỉ đủ để avatar "có vẻ" đang nói khớp nhịp.

export type Viseme = 'PP' | 'FF' | 'AA' | 'OO' | 'REST'

export interface VisemeFrame {
  viseme: Viseme
  startMs: number
  endMs: number
}

// Chu kỳ hình miệng lặp lại khi đang phát âm — không map theo phoneme thật (xem ghi chú đầu
// file), chỉ đủ tạo cảm giác chuyển động tự nhiên khi lướt qua các âm tiết.
const SPEAKING_CYCLE: Viseme[] = ['AA', 'OO', 'PP', 'FF']

// Đếm số "cụm nguyên âm" trong 1 từ làm số âm tiết ước lượng — heuristic thô, đủ cho PoC.
// Áp dụng chung cho cả tiếng Anh lẫn tiếng Việt (bộ chữ cái nguyên âm cơ bản, bỏ dấu để đơn giản).
function estimateSyllables(word: string): number {
  const normalized = word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh điệu tiếng Việt
    .toLowerCase()
  const groups = normalized.match(/[aeiouy]+/g)
  return Math.max(1, groups?.length ?? 1)
}

// audioDurationMs: lấy từ audio.duration (thẻ <audio>) sau khi đã tải audio thật — hàm này
// KHÔNG tự đoán thời lượng, chỉ chia thời lượng THẬT đã biết theo tỉ lệ âm tiết mỗi từ.
export function textToVisemeTimeline(text: string, audioDurationMs: number): VisemeFrame[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0 || audioDurationMs <= 0) return []

  const syllableCounts = words.map(estimateSyllables)
  const totalSyllables = syllableCounts.reduce((a, b) => a + b, 0)

  // Khoảng nghỉ ngắn (REST) giữa các từ để miệng không "nói liên tục không ngừng" —
  // trích 1 phần nhỏ tổng thời lượng, chia đều cho số khoảng trống giữa các từ.
  const gapCount = Math.max(0, words.length - 1)
  const gapFraction = 0.08
  const gapMs = gapCount > 0 ? (audioDurationMs * gapFraction) / gapCount : 0
  const speakingMs = audioDurationMs - gapMs * gapCount
  const msPerSyllable = totalSyllables > 0 ? speakingMs / totalSyllables : 0

  const frames: VisemeFrame[] = []
  let cursorMs = 0
  let syllableIndex = 0

  words.forEach((_word, wordIdx) => {
    const count = syllableCounts[wordIdx]!
    for (let s = 0; s < count; s++) {
      const viseme = SPEAKING_CYCLE[syllableIndex % SPEAKING_CYCLE.length]!
      const startMs = cursorMs
      const endMs = cursorMs + msPerSyllable
      frames.push({ viseme, startMs, endMs })
      cursorMs = endMs
      syllableIndex++
    }
    if (wordIdx < words.length - 1) {
      frames.push({ viseme: 'REST', startMs: cursorMs, endMs: cursorMs + gapMs })
      cursorMs += gapMs
    }
  })

  return frames
}

export function visemeAtTime(frames: VisemeFrame[], timeMs: number): Viseme {
  const frame = frames.find((f) => timeMs >= f.startMs && timeMs < f.endMs)
  return frame?.viseme ?? 'REST'
}
