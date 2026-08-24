// ──────────────────────────────────────────────────────────────────────
// LUYỆN NGHE THEO CẤP (③ N3 — docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md)
//
// 2 dạng bài, KHÔNG soạn nội dung mới — tái dùng hạ tầng sẵn có (nguyên tắc
// "chi phí ≈0" của đặc tả):
//   - "Nghe → chọn nghĩa": tái dùng buildListeningQuestions() của cefrExam.ts
//     (đã xuất khẩu — cùng engine với phần Nghe của đề thi cuối cấp).
//   - "Nghe → gõ lại" (dictation): câu lấy từ hội thoại của cấp + câu ví dụ có
//     sẵn trong từ điển (DictEntry.ex_en/ex_vi); chấm bằng scorePronunciation/
//     scoreWords (đã có, dùng chung với PronunciationCheck.tsx).
// ──────────────────────────────────────────────────────────────────────

import type { DictEntry } from '../types'
import type { Dialogue } from '../data/dialogues'
import type { CefrId } from './placement'
import { shuffle } from '@dhcb/core-contracts/shuffle'

// Tốc độ phát MẶC ĐỊNH của bài luyện nghe theo cấp — người mới cần chậm hơn để
// tách được từng âm, cấp cao nghe tốc độ gần tự nhiên. KHÁC RateToggle (0.75/1/
// 1.25, lựa chọn toàn cục của người dùng) — đây là gợi ý ban đầu riêng cho bài
// luyện nghe, người dùng vẫn đổi được qua RateToggle như mọi nơi khác.
export const LISTENING_RATE_BY_LEVEL: Record<CefrId, number> = {
  A1: 0.9,
  A2: 0.9,
  B1: 1,
  B2: 1,
  C1: 1.1,
  C2: 1.1,
}

export function listeningRateForLevel(levelId: CefrId): number {
  return LISTENING_RATE_BY_LEVEL[levelId] ?? 1
}

// ── Dictation (Nghe → gõ lại) ────────────────────────────────────────────
export interface DictationItem {
  key: string
  text: string // câu ngôn ngữ ĐÍCH cần gõ lại
  lang: 'en-US' | 'vi-VN'
}

// Câu quá ngắn (1-2 từ) không đáng gõ lại; quá dài khó nghe trọn trong 1 lượt
// (đợt đầu ưu tiên câu vừa sức — có thể nới sau khi có phản hồi người dùng).
const DICTATION_MIN_WORDS = 3
const DICTATION_MAX_WORDS = 12

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function isDictationLength(text: string): boolean {
  const n = wordCount(text)
  return n >= DICTATION_MIN_WORDS && n <= DICTATION_MAX_WORDS
}

// Câu từ hội thoại của cấp — nguồn CHÍNH: tự nhiên, có ngữ cảnh hội thoại thật.
function dictationFromDialogues(isA: boolean, dialogues: Dialogue[]): DictationItem[] {
  const lang: 'en-US' | 'vi-VN' = isA ? 'en-US' : 'vi-VN'
  const out: DictationItem[] = []
  dialogues.forEach((d, di) => {
    d.lines.forEach((ln, li) => {
      const text = isA ? ln.en : ln.vi
      if (isDictationLength(text)) out.push({ key: `d-${di}-${li}`, text, lang })
    })
  })
  return out
}

// Câu ví dụ có sẵn trong từ điển — bù thêm khi kho hội thoại của cấp còn mỏng.
function dictationFromWords(isA: boolean, words: DictEntry[]): DictationItem[] {
  const lang: 'en-US' | 'vi-VN' = isA ? 'en-US' : 'vi-VN'
  const out: DictationItem[] = []
  words.forEach((w, i) => {
    const text = isA ? w.ex_en : w.ex_vi
    if (text && isDictationLength(text)) out.push({ key: `w-${i}-${w.word}`, text, lang })
  })
  return out
}

// Dựng tối đa `count` câu dictation: ưu tiên hội thoại (tự nhiên hơn), bù bằng
// câu ví dụ từ điển nếu thiếu. Khử trùng theo nội dung câu (2 nguồn có thể trùng).
export function buildDictationItems(
  isA: boolean,
  dialogues: Dialogue[],
  words: DictEntry[],
  count: number,
): DictationItem[] {
  const pool = [
    ...shuffle(dictationFromDialogues(isA, dialogues)),
    ...shuffle(dictationFromWords(isA, words)),
  ]
  const seen = new Set<string>()
  const out: DictationItem[] = []
  for (const item of pool) {
    if (out.length >= count) break
    if (seen.has(item.text)) continue
    seen.add(item.text)
    out.push(item)
  }
  return out
}
