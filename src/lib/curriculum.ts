// ──────────────────────────────────────────────────────────────────────
// LOGIC LỘ TRÌNH HỌC
//
// Ghép phần NỀN TẢNG (src/data/curriculum.ts) với phần MỞ RỘNG tự động
// (các từ còn lại trong dictionary.json) thành 1 lộ trình phẳng, có thứ tự.
//
//   - getLearningPath(): toàn bộ chuỗi từ theo thứ tự học.
//   - getCircles():       chuỗi đó nhưng gom theo "vòng tròn" (chủ đề / cụm mở rộng).
//   - getTodayBatch():    lấy 20 từ KẾ TIẾP chưa thuộc (mục tiêu mỗi ngày).
//   - daily counter:      đếm số từ đã học trong ngày (mục tiêu 20/ngày).
//   - random queue:       hàng đợi ôn tập ngẫu nhiên KHÔNG lặp trong 1 vòng.
// ──────────────────────────────────────────────────────────────────────

import type { DictEntry } from '../types'
import type { Circle } from '../data/curriculum'
import { loadDictionary } from '../data/dictionary/loader'
import { loadFoundation } from '../data/curriculumLoader'

// Mục tiêu 20 từ/ngày — khớp với tài liệu (CLAUDE.md), FAQ trong index.html và UI tab "Hôm nay".
export const DAILY_GOAL = 20
// Tối đa 100 từ/ngày (5 batch × 20 từ). Mỗi batch thêm phải pass quiz 100%.
export const DAILY_MAX = 100

// Dữ liệu từ điển — KHÔNG import tĩnh nữa (file ~2MB). Nạp ĐỘNG bằng
// dynamic import() qua loadCurriculum() để Vite tách dictionary.json thành
// chunk riêng, không nằm trong bundle tải lần đầu.
// ENTRIES rỗng cho tới khi nạp xong → phải await loadCurriculum() trước khi
// gọi các hàm bên dưới (xem Learn.tsx / Dictionary.tsx).
let ENTRIES: DictEntry[] = []
let FOUNDATION: Circle[] = []

// Promise nạp — cache lại để chỉ tải MỘT lần dù được gọi từ nhiều nơi.
let _loadPromise: Promise<void> | null = null

// Gọi (await) một lần trước khi dùng getCircles/getLearningPath/getTodayBatch...
export function loadCurriculum(): Promise<void> {
  if (!_loadPromise) {
    _loadPromise = Promise.all([loadDictionary(), loadFoundation()]).then(([entries, foundation]) => {
      ENTRIES = entries
      FOUNDATION = foundation
    })
  }
  return _loadPromise
}

// Đã nạp xong dữ liệu từ điển chưa (dùng để khởi tạo state "ready" ở UI).
export function isCurriculumReady(): boolean {
  return ENTRIES.length > 0
}

// Khóa nhận diện 1 từ (không phân biệt hoa/thường) để so trùng giữa
// phần nền tảng và từ điển.
export const wordKey = (word: string) => word.trim().toLowerCase()

// ── Xây dựng các vòng MỞ RỘNG từ dictionary (memo hóa 1 lần) ────────────
let _circlesCache: Circle[] | null = null

export function getCircles(): Circle[] {
  if (_circlesCache) return _circlesCache

  // Tập các từ đã có trong phần nền tảng → loại khỏi phần mở rộng để khỏi trùng
  const foundationKeys = new Set<string>()
  FOUNDATION.forEach(c => c.words.forEach(w => foundationKeys.add(wordKey(w.word))))

  // Các từ còn lại trong từ điển, giữ nguyên thứ tự (alphabet) làm phần mở rộng
  const rest = ENTRIES.filter(e => !foundationKeys.has(wordKey(e.word)))

  // Gom phần mở rộng thành các cụm DAILY_GOAL từ → mỗi cụm là 1 "vòng"
  const extra: Circle[] = []
  for (let i = 0; i < rest.length; i += DAILY_GOAL) {
    const words = rest.slice(i, i + DAILY_GOAL)
    const n = extra.length + 1
    extra.push({
      id: `extra-${n}`,
      titleVi: `Mở rộng ${n}`,
      titleEn: `Set ${n}`,
      emoji: '📚',
      words,
      sentences: [], // phần mở rộng dùng câu ví dụ sẵn trong từng từ
    })
  }

  _circlesCache = [...FOUNDATION, ...extra]
  return _circlesCache
}

// ── Lộ trình phẳng (mảng từ theo thứ tự học) ──────────────────────────
let _pathCache: DictEntry[] | null = null

export function getLearningPath(): DictEntry[] {
  if (_pathCache) return _pathCache
  // Khử trùng theo key (vd: chữ cái "I" và đại từ "I") — giữ lần xuất hiện đầu,
  // để mỗi từ chỉ học 1 lần và đếm tiến độ không bị lệch.
  const seen = new Set<string>()
  _pathCache = getCircles()
    .flatMap(c => c.words)
    .filter(w => {
      const k = wordKey(w.word)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  return _pathCache
}

// Vòng (chủ đề) chứa 1 từ — để hiển thị tên chủ đề đang học
export function findCircleOfWord(word: string): Circle | undefined {
  const k = wordKey(word)
  return getCircles().find(c => c.words.some(w => wordKey(w.word) === k))
}

// ── Mục tiêu hôm nay: 20 từ KẾ TIẾP chưa thuộc ─────────────────────────
export function getTodayBatch(learned: Set<string>, size = DAILY_GOAL): DictEntry[] {
  const batch: DictEntry[] = []
  for (const e of getLearningPath()) {
    if (batch.length >= size) break
    if (!learned.has(wordKey(e.word)) && !learned.has(e.word)) batch.push(e)
  }
  return batch
}

// Tiến độ tổng: đã thuộc bao nhiêu / tổng lộ trình
export function getPathProgress(learned: Set<string>): { done: number; total: number } {
  const path = getLearningPath()
  let done = 0
  for (const e of path) {
    if (learned.has(wordKey(e.word)) || learned.has(e.word)) done++
  }
  return { done, total: path.length }
}

// ── Bộ đếm "học trong ngày" (mục tiêu 20/ngày) ────────────────────────
const DAILY_KEY = (uid: string) => `et_learn_daily_${uid}`
const todayStr = () => new Date().toISOString().slice(0, 10)

export function getDailyLearned(uid: string): number {
  try {
    const raw = localStorage.getItem(DAILY_KEY(uid))
    if (!raw) return 0
    const obj = JSON.parse(raw) as { date: string; count: number }
    return obj.date === todayStr() ? obj.count : 0
  } catch {
    return 0
  }
}

// Tiến độ của 1 vòng cụ thể (dùng để hiển thị "15/20" bên cạnh tên chủ đề)
export function getCircleProgress(circleId: string, learned: Set<string>): { done: number; total: number } {
  const circle = getCircles().find(c => c.id === circleId)
  if (!circle) return { done: 0, total: 0 }
  let done = 0
  for (const w of circle.words) {
    if (learned.has(wordKey(w.word)) || learned.has(w.word)) done++
  }
  return { done, total: circle.words.length }
}

// Tăng bộ đếm ngày (gọi khi đánh dấu 1 từ MỚI là đã thuộc trong phần lộ trình)
export function bumpDailyLearned(uid: string): number {
  const cur = getDailyLearned(uid)
  const next = cur + 1
  localStorage.setItem(DAILY_KEY(uid), JSON.stringify({ date: todayStr(), count: next }))
  return next
}

// ── Số lần pass quiz để mở batch mới trong ngày ──────────────────────────
const QUIZ_PASS_KEY = (uid: string) => `et_quiz_pass_${uid}`

export function getDailyQuizPasses(uid: string): number {
  try {
    const raw = localStorage.getItem(QUIZ_PASS_KEY(uid))
    if (!raw) return 0
    const obj = JSON.parse(raw) as { date: string; passes: number }
    return obj.date === todayStr() ? obj.passes : 0
  } catch {
    return 0
  }
}

export function bumpDailyQuizPasses(uid: string): number {
  const cur = getDailyQuizPasses(uid)
  const next = cur + 1
  localStorage.setItem(QUIZ_PASS_KEY(uid), JSON.stringify({ date: todayStr(), passes: next }))
  return next
}

// Số từ được phép học hôm nay: DAILY_GOAL × (quizPasses + 1), tối đa DAILY_MAX
export function getDailyAllowance(uid: string): number {
  return Math.min(DAILY_GOAL * (getDailyQuizPasses(uid) + 1), DAILY_MAX)
}
