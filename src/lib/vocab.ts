// Lưu danh sách các từ học viên đã đánh dấu "đã thuộc".
// Dùng chung cho VocabMilestone (đếm tiến độ) và Flashcard (đánh dấu nhớ/chưa nhớ).
// Lưu trong localStorage theo từng user để mỗi tài khoản có tiến độ riêng.

import { pushProgress } from './progressSync'

const KEY = (uid: string) => `et_learned_${uid}`

// Đọc Set các từ đã thuộc của 1 user.
// CHUẨN HOÁ chữ thường khi đọc → khớp nhất quán ở mọi nơi (giống "từ khó" vốn đã lowercase)
// và tự "migrate" dữ liệu cũ từng lưu nguyên dạng hoa/thường. An toàn vì các nơi tiêu thụ
// đều so bằng .toLowerCase()/wordKey hoặc kiểm tra kép.
export function getLearnedWords(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(KEY(userId))
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(arr.map((w) => w.toLowerCase()))
  } catch {
    return new Set()
  }
}

// Số từ đã thuộc (dùng cho thanh mốc tiến độ)
export function getLearnedCount(userId: string): number {
  return getLearnedWords(userId).size
}

// N từ HỌC GẦN NHẤT, mới nhất trước — dùng cho gợi ý "Luyện nói với từ vừa học"
// ở Home (② M4). Đọc THẲNG mảng localStorage (không qua Set) để giữ đúng thứ tự
// chèn — markLearned() luôn thêm vào cuối nên mảng đã là thứ tự thời gian tăng dần.
// Xấp xỉ (không hoàn hảo qua nhiều thiết bị do hợp nhất ở progressSync.ts) — chấp
// nhận được cho 1 gợi ý, không phải số liệu cần chính xác tuyệt đối.
export function getRecentlyLearnedWords(userId: string, n: number): string[] {
  try {
    const raw = localStorage.getItem(KEY(userId))
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return arr.slice(-n).reverse()
  } catch {
    return []
  }
}

// Ghi đè toàn bộ Set xuống localStorage
function save(userId: string, set: Set<string>) {
  localStorage.setItem(KEY(userId), JSON.stringify([...set]))
}

// Đánh dấu 1 từ là đã thuộc (chuẩn hoá chữ thường để khớp nhất quán)
export function markLearned(userId: string, word: string) {
  const set = getLearnedWords(userId)
  set.add(word.toLowerCase())
  save(userId, set)
  pushProgress(userId) // đồng bộ lên Supabase
}

// Bỏ đánh dấu (đánh dấu là chưa thuộc)
export function unmarkLearned(userId: string, word: string) {
  const set = getLearnedWords(userId)
  set.delete(word.toLowerCase())
  save(userId, set)
  pushProgress(userId) // đồng bộ lên Supabase
}

// Kiểm tra 1 từ đã thuộc chưa
export function isLearned(userId: string, word: string): boolean {
  return getLearnedWords(userId).has(word.toLowerCase())
}

// ── Từ khó (đánh dấu thủ công bằng nút ⭐) ──────────────────────────────────

const HARD_KEY = (uid: string) => `et_hard_${uid}`

export function getDifficultWords(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(HARD_KEY(userId))
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

// Bật/tắt đánh dấu khó — trả về trạng thái mới (true = đang khó)
export function toggleDifficult(userId: string, word: string): boolean {
  const set = getDifficultWords(userId)
  const key = word.toLowerCase()
  if (set.has(key)) {
    set.delete(key)
  } else {
    set.add(key)
  }
  localStorage.setItem(HARD_KEY(userId), JSON.stringify([...set]))
  pushProgress(userId) // đồng bộ lên Supabase
  return set.has(key)
}

export function isDifficult(userId: string, word: string): boolean {
  return getDifficultWords(userId).has(word.toLowerCase())
}
