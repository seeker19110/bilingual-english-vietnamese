// lib/stories.ts — hàm THUẦN (pure) dùng cho trang Nghe (Truyện cổ tích / Ngụ ngôn).
// Tách riêng khỏi component để test đơn vị không cần render UI (mục 8 đặc tả trang Nghe).

import type { StoryLine } from '../data/stories/index'

// Số giây ước lượng cho mỗi câu khi nghe (mục 6.4 đặc tả).
const SECONDS_PER_LINE = 4

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
 * Luôn trả về tối thiểu 1 phút để không hiện "0 phút" với truyện rất ngắn.
 */
export function estimateListenMinutes(lineCount: number): number {
  if (lineCount <= 0) return 0
  const minutes = Math.round((lineCount * SECONDS_PER_LINE) / 60)
  return Math.max(1, minutes)
}
