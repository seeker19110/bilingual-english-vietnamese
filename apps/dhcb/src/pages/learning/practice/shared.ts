// apps/dhcb/src/pages/learning/practice/shared.ts — tách từ pages/learning/Practice.tsx (1.752 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

import type { DictEntry } from '../../../types'
import { shuffle } from '@dhcb/core-contracts/shuffle'

export type Mode =
  | 'hub'
  | 'vocab-listen'
  | 'scramble'
  | 'dictation'
  | 'fillblank'
  | 'pronounce-words'
  | 'read-aloud'
  | 'shadowing'
  | 'interview'

export const SESSION_SIZE = 8
export const INTERVIEW_ROUNDS = 5

// Rút câu ví dụ (ex_en/ex_vi) từ 1 pool từ vựng, lọc theo độ dài — dùng chung
// cho Sắp xếp câu và Shadowing.
export function pickExampleSentences(
  pool: DictEntry[],
  isA: boolean,
  minWords: number,
  maxWords: number,
  count: number,
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of shuffle(pool)) {
    const text = isA ? w.ex_en : w.ex_vi
    const n = text.trim().split(/\s+/).filter(Boolean).length
    if (text && n >= minWords && n <= maxWords && !seen.has(text)) {
      seen.add(text)
      out.push(text)
    }
    if (out.length >= count) break
  }
  return out
}
