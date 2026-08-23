// "Huấn luyện viên lỗi phát âm" — khi 1 từ bị chấm sai (xem scoreWords trong
// pronounceScore.ts), tra xem đây có phải lỗi "chuyển di" quen thuộc của người
// Việt không (vd "three" đọc thành "tree") và sinh gợi ý tiếng Việt ngắn gọn.
// Đây là suy đoán tốt-nhất (best-effort) dựa trên bảng lỗi soạn tay, KHÔNG phải
// chấm điểm âm vị học thật — không nhận diện được thì trả null, không báo bừa.

import { WORD_TRAPS, matchesFinalConsonantDrop } from '../data/pronunciationTraps'
import type { TrapGroup } from '../data/pronunciationTraps'

export interface TrapTip {
  word: string // từ target
  spokenWord: string // từ mà STT nghe ra
  tipVi: string
  group: TrapGroup
}

// Chuẩn hoá tối giản cho 1 từ đơn: thường hoá + bỏ khoảng trắng thừa.
// Không dùng chung normalize() của pronounceScore.ts (bỏ dấu câu cả câu) vì
// pronounceScore.ts đã import findTrap từ file này — dùng lại sẽ tạo import
// vòng (circular). Ở đây chỉ nhận từ ĐƠN nên .toLowerCase().trim() là đủ.
function normalizeWord(w: string): string {
  return w.toLowerCase().trim()
}

// Tra 1 cặp (target, spoken) — 2 từ ĐƠN — xem có khớp lỗi điển hình của người
// Việt không. Trả null nếu không nhận diện được.
export function findTrap(target: string, spoken: string): TrapTip | null {
  const t = normalizeWord(target)
  const s = normalizeWord(spoken)
  if (!t || !s || t === s) return null

  const known = WORD_TRAPS.find((entry) => entry.target === t && entry.traps.includes(s))
  if (known) {
    return { word: t, spokenWord: s, tipVi: known.tipVi, group: known.group }
  }

  if (matchesFinalConsonantDrop(t, s)) {
    return {
      word: t,
      spokenWord: s,
      tipVi: `Người Việt hay "nuốt" âm cuối — nhớ bật hơi rõ phụ âm cuối của "${t}" (đừng dừng lại sớm).`,
      group: 'final-consonant',
    }
  }

  return null
}

// Sinh tối đa `max` gợi ý (mặc định 2, tránh ngợp UI) từ danh sách các cặp
// (target, spoken) bị chấm sai — giữ thứ tự xuất hiện, dừng khi đủ `max`.
export function coachTips(pairs: Array<{ target: string; spoken: string }>, max = 2): TrapTip[] {
  const tips: TrapTip[] = []
  for (const { target, spoken } of pairs) {
    if (tips.length >= max) break
    const tip = findTrap(target, spoken)
    if (tip) tips.push(tip)
  }
  return tips
}
