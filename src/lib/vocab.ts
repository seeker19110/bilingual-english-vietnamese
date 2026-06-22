// Lưu danh sách các từ học viên đã đánh dấu "đã thuộc".
// Dùng chung cho VocabMilestone (đếm tiến độ) và Flashcard (đánh dấu nhớ/chưa nhớ).
// Lưu trong localStorage theo từng user để mỗi tài khoản có tiến độ riêng.
// Khi đánh dấu/bỏ dấu, tự động đồng bộ số lượng lên Supabase (profiles.words_learned)
// để tính bảng xếp hạng toàn server.

import { pushWordsLearned } from './cloud'

const KEY = (uid: string) => `et_learned_${uid}`

// Đọc Set các từ đã thuộc của 1 user
export function getLearnedWords(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(KEY(userId))
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(arr)
  } catch {
    return new Set()
  }
}

// Số từ đã thuộc (dùng cho thanh mốc tiến độ)
export function getLearnedCount(userId: string): number {
  return getLearnedWords(userId).size
}

// Ghi đè toàn bộ Set xuống localStorage
function save(userId: string, set: Set<string>) {
  localStorage.setItem(KEY(userId), JSON.stringify([...set]))
}

// Đánh dấu 1 từ là đã thuộc — tự sync số lượng lên Supabase cho leaderboard
export function markLearned(userId: string, word: string) {
  const set = getLearnedWords(userId)
  set.add(word)
  save(userId, set)
  pushWordsLearned(userId, set.size)
}

// Bỏ đánh dấu (đánh dấu là chưa thuộc) — tự sync số lượng lên Supabase
export function unmarkLearned(userId: string, word: string) {
  const set = getLearnedWords(userId)
  set.delete(word)
  save(userId, set)
  pushWordsLearned(userId, set.size)
}

// Kiểm tra 1 từ đã thuộc chưa
export function isLearned(userId: string, word: string): boolean {
  return getLearnedWords(userId).has(word)
}
