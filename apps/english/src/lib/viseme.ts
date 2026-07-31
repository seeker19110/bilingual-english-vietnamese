// src/lib/viseme.ts — Ước lượng thời điểm khẩu hình (viseme) cho avatar nói chuyện.
// Xem docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md — hướng B (ước lượng đơn giản):
// Chirp3-HD (giọng TTS đang dùng, api/_lib/googleTts.ts) KHÔNG hỗ trợ SSML nên không có
// timepoints thật từ server. Dù có phoneme thật (server gọi eSpeak-ng, xem
// api/_lib/espeakPhonemes.ts) hay chỉ đếm nguyên âm chữ viết (fallback khi không có server),
// vẫn phải CHIA ĐỀU thời lượng audio THẬT (đã biết từ audio.duration) theo số đơn vị phát âm
// ước lượng — không có timing chính xác từng phoneme.

export type Viseme = 'PP' | 'FF' | 'AA' | 'OO' | 'REST'

export interface VisemeFrame {
  viseme: Viseme
  startMs: number
  endMs: number
}

// Chu kỳ hình miệng dùng khi KHÔNG có phoneme thật (server không cài eSpeak-ng, hoặc lỗi) —
// không map theo phoneme thật, chỉ đủ tạo cảm giác chuyển động khi lướt qua các âm tiết.
const FALLBACK_CYCLE: Viseme[] = ['AA', 'OO', 'PP', 'FF']

// Đếm số "cụm nguyên âm" trong 1 từ làm số âm tiết ước lượng — heuristic thô dựa trên CHỮ VIẾT
// (không phải cách đọc thật), chỉ dùng khi không có phoneme thật từ eSpeak-ng.
function estimateSyllables(word: string): number {
  const normalized = word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh điệu tiếng Việt
    .toLowerCase()
  const groups = normalized.match(/[aeiouy]+/g)
  return Math.max(1, groups?.length ?? 1)
}

// Fallback: sinh dãy viseme cho từng từ bằng cách LẶP VÒNG cố định — dùng khi không có phoneme
// thật (xem wordVisemesFromApi ở AvatarDemo.tsx / api/avatar-visemes.ts).
export function fallbackWordVisemes(words: string[]): Viseme[][] {
  let cursor = 0
  return words.map((word) => {
    const count = estimateSyllables(word)
    const visemes: Viseme[] = []
    for (let i = 0; i < count; i++) {
      visemes.push(FALLBACK_CYCLE[cursor % FALLBACK_CYCLE.length]!)
      cursor++
    }
    return visemes
  })
}

// Chia thời lượng audio THẬT (audioDurationMs, lấy từ audio.duration sau khi đã tải audio) cho
// dãy viseme của TỪNG TỪ (wordVisemes — từ eSpeak-ng thật hoặc fallback ở trên), chèn khoảng
// nghỉ ngắn (REST) giữa các từ để miệng không "nói liên tục không ngừng".
export function framesFromWordVisemes(
  wordVisemes: Viseme[][],
  audioDurationMs: number,
): VisemeFrame[] {
  const totalUnits = wordVisemes.reduce((sum, w) => sum + w.length, 0)
  if (totalUnits === 0 || audioDurationMs <= 0) return []

  const gapCount = Math.max(0, wordVisemes.length - 1)
  const gapFraction = 0.08
  const gapMs = gapCount > 0 ? (audioDurationMs * gapFraction) / gapCount : 0
  const speakingMs = audioDurationMs - gapMs * gapCount
  const msPerUnit = speakingMs / totalUnits

  const frames: VisemeFrame[] = []
  let cursorMs = 0

  wordVisemes.forEach((visemes, wordIdx) => {
    for (const viseme of visemes) {
      const startMs = cursorMs
      const endMs = cursorMs + msPerUnit
      frames.push({ viseme, startMs, endMs })
      cursorMs = endMs
    }
    if (wordIdx < wordVisemes.length - 1) {
      frames.push({ viseme: 'REST', startMs: cursorMs, endMs: cursorMs + gapMs })
      cursorMs += gapMs
    }
  })

  return frames
}

// Tiện ích gộp: câu văn + thời lượng audio thật → timeline, dùng bộ đếm nguyên âm thô (KHÔNG
// gọi server). Dùng khi chưa có phoneme thật từ /api/avatar-visemes (đang tải, lỗi mạng...).
export function textToVisemeTimeline(text: string, audioDurationMs: number): VisemeFrame[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return framesFromWordVisemes(fallbackWordVisemes(words), audioDurationMs)
}

export function visemeAtTime(frames: VisemeFrame[], timeMs: number): Viseme {
  const frame = frames.find((f) => timeMs >= f.startMs && timeMs < f.endMs)
  return frame?.viseme ?? 'REST'
}
