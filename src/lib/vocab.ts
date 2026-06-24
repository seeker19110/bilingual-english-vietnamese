// Lưu danh sách các từ học viên đã đánh dấu "đã thuộc".
// Dùng chung cho VocabMilestone (đếm tiến độ) và Flashcard (đánh dấu nhớ/chưa nhớ).
// Lưu trong localStorage theo từng user để mỗi tài khoản có tiến độ riêng.

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

// Đánh dấu 1 từ là đã thuộc
export function markLearned(userId: string, word: string) {
  const set = getLearnedWords(userId)
  set.add(word)
  save(userId, set)
}

// Bỏ đánh dấu (đánh dấu là chưa thuộc)
export function unmarkLearned(userId: string, word: string) {
  const set = getLearnedWords(userId)
  set.delete(word)
  save(userId, set)
}

// Kiểm tra 1 từ đã thuộc chưa
export function isLearned(userId: string, word: string): boolean {
  return getLearnedWords(userId).has(word)
}

// ── Từ khó (đánh dấu thủ công bằng nút ⭐) ──────────────────────────────────

const HARD_KEY = (uid: string) => `et_hard_${uid}`

export function getDifficultWords(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(HARD_KEY(userId))
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch { return new Set() }
}

// Bật/tắt đánh dấu khó — trả về trạng thái mới (true = đang khó)
export function toggleDifficult(userId: string, word: string): boolean {
  const set = getDifficultWords(userId)
  const key = word.toLowerCase()
  if (set.has(key)) { set.delete(key) } else { set.add(key) }
  localStorage.setItem(HARD_KEY(userId), JSON.stringify([...set]))
  return set.has(key)
}

export function isDifficult(userId: string, word: string): boolean {
  return getDifficultWords(userId).has(word.toLowerCase())
}
