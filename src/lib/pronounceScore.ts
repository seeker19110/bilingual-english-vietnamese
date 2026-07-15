// Chấm phát âm đơn giản, chạy hoàn toàn ở trình duyệt:
// so sánh chuỗi người dùng đọc (lấy từ Web Speech STT) với từ/câu mục tiêu.
// Không cần API key — dùng độ tương đồng Levelshtein chuẩn hóa.

import { findTrap } from './pronounceCoach'

// Chuẩn hóa: thường hóa, bỏ dấu câu, gộp khoảng trắng
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Khoảng cách Levenshtein giữa 2 chuỗi (theo ký tự)
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let cur = new Array<number>(n + 1)
  for (let i = 1; i <= m; i++) {
    cur[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      // i,j luôn trong [1..m]/[1..n] và prev/cur dài n+1 nên các ô này chắc chắn có
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost)
    }
    const swap = prev
    prev = cur
    cur = swap
  }
  return prev[n]!
}

// Điểm phát âm 0–100 (so từ/câu người đọc với mục tiêu)
export function scorePronunciation(target: string, spoken: string): number {
  const t = normalize(target)
  const s = normalize(spoken)
  if (!t || !s) return 0
  const dist = levenshtein(t, s)
  const maxLen = Math.max(t.length, s.length)
  const score = Math.round((1 - dist / maxLen) * 100)
  return Math.max(0, Math.min(100, score))
}

// Nhận xét ngắn theo điểm (chiều A: tiếng Việt | chiều B: tiếng Anh)
export function pronounceFeedback(score: number, isA: boolean): { label: string; color: string } {
  if (score >= 85) return { label: isA ? 'Tuyệt vời!' : 'Excellent!', color: 'text-emerald-400' }
  if (score >= 65) return { label: isA ? 'Khá tốt' : 'Good', color: 'text-lime-400' }
  if (score >= 40)
    return { label: isA ? 'Tạm được, thử lại nhé' : 'Almost, try again', color: 'text-amber-400' }
  return { label: isA ? 'Chưa rõ, thử lại' : 'Unclear, try again', color: 'text-rose-400' }
}

// Kết quả chấm 1 từ: ok = đúng/sai; trapHit/spokenWord chỉ có khi sai VÀ có từ
// STT nghe được ở vị trí đó (không thể chẩn đoán lỗi khi không có gì để so sánh).
export interface WordScore {
  word: string
  ok: boolean
  trapHit?: boolean
  spokenWord?: string
}

// So sánh từng từ: trả về mảng { word, ok, trapHit?, spokenWord? } — dùng để
// highlight từng từ đúng/sai và (nếu sai) tra xem có phải lỗi phát âm điển hình
// của người Việt không (xem src/lib/pronounceCoach.ts).
export function scoreWords(target: string, spoken: string): WordScore[] {
  const targetWords = normalize(target).split(' ').filter(Boolean)
  const spokenWords = normalize(spoken).split(' ').filter(Boolean)
  // DP alignment đơn giản: ghép từng từ target với từ spoken gần nhất (theo thứ tự)
  let si = 0
  return targetWords.map((tw) => {
    if (si >= spokenWords.length) return { word: tw, ok: false }
    const sw = spokenWords[si]! // đã chặn si >= length ở trên nên chắc chắn có
    // Coi "đúng" khi khoảng cách Levenshtein ≤ 1 (cho phép 1 lỗi ký tự nhỏ)
    const dist = levenshtein(tw, sw)
    const ok = dist <= Math.max(1, Math.floor(tw.length * 0.25))
    if (ok || dist <= tw.length / 2) si++ // tiêu thụ từ spoken chỉ khi khớp được
    if (ok) return { word: tw, ok }
    // Sai và có từ spoken để so sánh → tra xem có phải lỗi "chuyển di" quen thuộc không
    const trap = findTrap(tw, sw)
    return { word: tw, ok, trapHit: !!trap, spokenWord: sw }
  })
}
