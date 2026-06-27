// scripts/_lib/patternOrder.ts
// Tiện ích dùng chung cho các script seed TTS của trang "Cụm từ" (CommonPhrases).
//
// Hai việc:
//   1. PATTERN_VOICE_IDS — trang Cụm từ CHỈ phát 2 giọng female/male
//      (getVoicePref() trong src/lib/tts.ts chỉ trả 'female' | 'male'; female2/male2
//      chỉ dùng cho hội thoại trong Lessons.tsx). Vì vậy seed Cụm từ chỉ cần 2 giọng này
//      — bỏ female2/male2 giúp giảm một nửa số tác vụ + dung lượng, không mất gì cả.
//   2. loadSubjectsInDisplayOrder() — trả về chủ thể theo ĐÚNG thứ tự hiển thị trên
//      trang (round-robin theo category, giống interleave() trong CommonPhrases.tsx),
//      để seed "phổ biến nhất trước": I am, You are, We are, They are, He is, She is...
//      lên trước; các chủ thể hiếm (The receptionist used to...) seed sau cùng.

import * as fs from 'node:fs'
import * as path from 'node:path'
import type { VoiceId } from '../../api/_lib/googleTts.ts'

// Giọng cần seed cho trang Cụm từ — female trước (DEFAULT_VOICE), rồi male.
export const PATTERN_VOICE_IDS: VoiceId[] = ['female', 'male']

export interface Sentence { en: string; vi: string }
export interface Subject {
  starter: string
  category: string
  color: string
  sentences: Sentence[]
}

// Đọc toàn bộ chunk patterns rồi sắp theo thứ tự hiển thị (round-robin theo category).
export function loadSubjectsInDisplayOrder(patternDir: string): Subject[] {
  const files = fs
    .readdirSync(patternDir)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()
  const all: Subject[] = []
  for (const f of files) {
    all.push(...(JSON.parse(fs.readFileSync(path.join(patternDir, f), 'utf8')) as Subject[]))
  }
  return interleaveByCategory(all)
}

// Round-robin theo category (giữ nguyên thứ tự category xuất hiện lần đầu).
// GIỐNG interleave() ở CommonPhrases.tsx nhưng KHÔNG có giới hạn `items.length * 3`
// (giới hạn đó khiến frontend rớt mất các chủ thể cuối khi 1 category quá lớn) —
// ở đây phải giữ ĐỦ toàn bộ chủ thể, chỉ đổi thứ tự, nên lặp đến khi xếp hết.
function interleaveByCategory(items: Subject[]): Subject[] {
  const groups = new Map<string, Subject[]>()
  const order: string[] = []
  for (const s of items) {
    let grp = groups.get(s.category)
    if (!grp) { grp = []; groups.set(s.category, grp); order.push(s.category) }
    grp.push(s)
  }
  const result: Subject[] = []
  const cursor = new Map<string, number>(order.map((c) => [c, 0]))
  let placedSomething = true
  while (placedSomething) {
    placedSomething = false
    for (const cat of order) {
      const grp = groups.get(cat)!
      const i = cursor.get(cat)!
      if (i < grp.length) {
        result.push(grp[i])
        cursor.set(cat, i + 1)
        placedSomething = true
      }
    }
  }
  return result
}
