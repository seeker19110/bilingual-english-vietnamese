// lib/stories.ts — hàm THUẦN (pure) dùng cho trang Nghe (Truyện cổ tích / Ngụ ngôn).
// Tách riêng khỏi component để test đơn vị không cần render UI (mục 8 đặc tả trang Nghe).

import type { StoryKind, StoryLine } from '../data/stories/index'
import type { VoiceId } from './voiceTiers'

// Số giây ước lượng cho mỗi câu khi nghe (mục 6.4 đặc tả).
const SECONDS_PER_LINE = 4

// Giọng đọc mặc định theo thể loại truyện (đổi sang giọng Gemini 2026-08-06) — mỗi thể loại
// 1 giọng CỐ ĐỊNH, không dùng getVoicePref() (giọng chung toàn app) nữa khi đọc truyện. Từ
// dùng Chirp3-HD (Google Cloud TTS) chuyển sang giọng Gemini (native audio, đọc TRUYỀN CẢM
// hơn nhờ điều khiển được phong cách đọc bằng câu lệnh tự nhiên — xem
// packages/core-ai/geminiTts.ts) để hợp không khí từng thể loại (cổ tích nhẹ nhàng, thần
// thoại hùng tráng, hài hước dí dỏm...). Seed trước qua scripts/seed-stories-gemini-tts.ts;
// nếu chưa seed kịp truyện mới, /api/tts vẫn tự tạo động (cache-on-demand) khi có người đọc.
// Dùng CHUNG cho cả runtime (StoryReader.tsx) lẫn script seed — đổi ở đây là đổi cho cả hai.
export const STORY_KIND_VOICE: Record<StoryKind, VoiceId> = {
  'fairy-tale': 'Gemini-Leda',
  fable: 'Gemini-Charon',
  'vn-folk': 'Gemini-Aoede',
  myth: 'Gemini-Orus',
  humor: 'Gemini-Puck',
  children: 'Gemini-Kore',
}

export function getStoryVoice(kind: StoryKind): VoiceId {
  return STORY_KIND_VOICE[kind]
}

/**
 * Gom các câu (StoryLine) theo chỉ số đoạn `p` để hiển thị truyện theo đoạn văn.
 * Giữ nguyên thứ tự xuất hiện; mỗi đoạn là 1 mảng con các câu có cùng `p`.
 */
export function groupLinesByParagraph(lines: StoryLine[]): StoryLine[][] {
  const paragraphs: StoryLine[][] = []
  let currentP: number | null = null
  let current: StoryLine[] = []

  for (const line of lines) {
    if (currentP === null || line.p !== currentP) {
      if (current.length > 0) paragraphs.push(current)
      current = []
      currentP = line.p
    }
    current.push(line)
  }
  if (current.length > 0) paragraphs.push(current)

  return paragraphs
}

/**
 * Ước lượng thời gian nghe (phút, làm tròn) từ số câu: lineCount × 4 giây.
 * Với lineCount > 0, luôn trả về tối thiểu 1 phút (không hiện "0 phút" với truyện rất ngắn).
 * lineCount <= 0 (dữ liệu lỗi — không nên xảy ra, đã có test chặn ở stories.test.ts) trả về 0.
 */
export function estimateListenMinutes(lineCount: number): number {
  if (lineCount <= 0) return 0
  const minutes = Math.round((lineCount * SECONDS_PER_LINE) / 60)
  return Math.max(1, minutes)
}
