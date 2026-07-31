// api/_lib/visemeTimeline.ts — Dựng timeline khẩu hình (viseme) từ mốc thời gian THẬT của TTS.
//
// Khác gì bản cũ? src/lib/viseme.ts chia đều thời lượng audio cho toàn bộ âm tiết trong câu →
// sai số dồn dần, cuối câu miệng lệch hẳn so với giọng. Ở đây mỗi TỪ có mốc bắt đầu/kết thúc
// THẬT (ElevenLabs /with-timestamps trả timestamp từng ký tự), nên sai số không bao giờ vượt
// quá độ dài một từ (~200ms) và không tích luỹ.
//
// Bên trong một từ vẫn chia đều cho các viseme của từ đó — muốn chính xác hơn nữa phải có
// timestamp mức phoneme, thứ không provider TTS nào hiện trả về.

import { wordVisemesFromEspeak, type Viseme } from './espeakPhonemes.js'
import type { ElevenAlignment } from '../../packages/core-ai/elevenLabsTts.js'

export type { Viseme }

export interface VisemeFrame {
  viseme: Viseme
  startMs: number
  endMs: number
}

export interface WordSpan {
  word: string
  startMs: number
  endMs: number
}

// Trần số khung hình cho 1 câu — chặn timeline khổng lồ (câu 4000 ký tự) làm phình cột jsonb và
// response. Vượt trần thì bỏ timing thật, client tự ước lượng như cũ.
const MAX_FRAMES = 4000

// Gom các ký tự liên tiếp không phải khoảng trắng thành "từ", lấy mốc thời gian thật của ký tự
// đầu và ký tự cuối trong từ đó. Dấu câu dính liền từ (vd "hello,") được giữ nguyên trong span —
// eSpeak nhận cả cụm đó như một token nên số từ vẫn khớp.
export function wordSpansFromAlignment(alignment: ElevenAlignment): WordSpan[] {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment
  const spans: WordSpan[] = []

  let current = ''
  let startSec = 0
  let endSec = 0

  const flush = () => {
    if (current.length === 0) return
    spans.push({
      word: current,
      startMs: Math.round(startSec * 1000),
      // Chống dữ liệu bẩn: mốc kết thúc không được nhỏ hơn mốc bắt đầu.
      endMs: Math.round(Math.max(endSec, startSec) * 1000),
    })
    current = ''
  }

  characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      flush()
      return
    }
    if (current.length === 0) startSec = character_start_times_seconds[i] ?? 0
    endSec = character_end_times_seconds[i] ?? startSec
    current += ch
  })
  flush()

  return spans
}

// Ghép mốc thời gian thật của từng từ với dãy viseme của từ đó → timeline hoàn chỉnh.
// Khoảng lặng giữa hai từ (và trước từ đầu tiên) được lấp bằng REST để miệng khép lại.
export function framesFromWordSpans(spans: WordSpan[], wordVisemes: Viseme[][]): VisemeFrame[] {
  if (spans.length === 0 || spans.length !== wordVisemes.length) return []

  const frames: VisemeFrame[] = []
  let prevEndMs = 0

  spans.forEach((span, i) => {
    const visemes = wordVisemes[i] ?? []
    if (visemes.length === 0) return

    // Khoảng lặng trước từ này (im lặng đầu câu hoặc nghỉ giữa hai từ).
    if (span.startMs > prevEndMs) {
      frames.push({ viseme: 'REST', startMs: prevEndMs, endMs: span.startMs })
    }

    const durationMs = span.endMs - span.startMs
    if (durationMs <= 0) {
      // Từ có thời lượng 0 (dữ liệu bẩn) — bỏ qua thay vì tạo khung hình vô nghĩa.
      prevEndMs = Math.max(prevEndMs, span.endMs)
      return
    }

    const msPerViseme = durationMs / visemes.length
    visemes.forEach((viseme, vIdx) => {
      const startMs = Math.round(span.startMs + msPerViseme * vIdx)
      // Viseme cuối bám đúng mốc kết thúc thật của từ (tránh lệch do làm tròn).
      const endMs =
        vIdx === visemes.length - 1
          ? span.endMs
          : Math.round(span.startMs + msPerViseme * (vIdx + 1))
      frames.push({ viseme, startMs, endMs })
    })

    prevEndMs = span.endMs
  })

  return frames
}

// Đường dùng chính: alignment thật từ provider → timeline sẵn sàng lưu cache.
// Trả null khi không dựng được (không có eSpeak-ng, số từ không khớp, câu quá dài) — nơi gọi
// coi như "không có timing thật" và client tự ước lượng như trước, KHÔNG phải lỗi.
export async function visemeTimelineFromAlignment(
  alignment: ElevenAlignment,
  lang: 'en-US' | 'vi-VN',
): Promise<VisemeFrame[] | null> {
  const spans = wordSpansFromAlignment(alignment)
  if (spans.length === 0) return null

  const wordVisemes = await wordVisemesFromEspeak(
    spans.map((s) => s.word),
    lang,
  )
  if (!wordVisemes) return null

  const frames = framesFromWordSpans(spans, wordVisemes)
  if (frames.length === 0 || frames.length > MAX_FRAMES) return null

  return frames
}
