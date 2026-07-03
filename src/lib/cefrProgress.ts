// ──────────────────────────────────────────────────────────────────────
// TIẾN ĐỘ LỘ TRÌNH CEFR
//
// Gom toàn bộ logic tính tiến độ cho lộ trình A1→B2 (tab Lộ trình + trang
// riêng từng cấp) vào 1 chỗ, để UI chỉ gọi hàm thay vì tự lắp ráp:
//   - Đánh dấu BÀI NGỮ PHÁP đã học xong (nút "Đã học xong" trong bài).
//   - Đánh dấu HỘI THOẠI đã xem (tự ghi khi mở hội thoại).
//   - Đếm tiến độ từ vựng / ngữ pháp theo unit + theo cấp.
//   - Luật mở khóa cấp (A1 luôn mở; cấp sau cần ≥70% từ vựng cấp trước).
//   - Tìm "mục học tiếp theo" (vòng từ vựng / bài ngữ pháp đầu tiên chưa xong).
//
// Dữ liệu lưu localStorage theo từng user (giống vocab.ts) và ĐỒNG BỘ lên
// Supabase qua bảng learning_progress — cột cefr_grammar / cefr_dialogues
// (migration 0007, xem lib/progressSync.ts).
// ──────────────────────────────────────────────────────────────────────

import type { CefrLevel, CefrUnit } from '../data/cefr'
import type { Circle } from '../data/curriculum'
import { pushProgress } from './progressSync'

// Ngưỡng mở khóa cấp tiếp theo: thuộc ≥70% từ vựng của cấp trước.
export const UNLOCK_PCT = 0.7

const GRAMMAR_KEY = (uid: string) => `et_cefr_grammar_${uid}`
const DIALOGUE_KEY = (uid: string) => `et_cefr_dialogue_${uid}`

// Đọc 1 Set chuỗi từ localStorage (hỏng/thiếu → Set rỗng).
function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return new Set(Array.isArray(arr) ? (arr as string[]) : [])
  } catch {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]))
}

// ── Bài ngữ pháp đã học xong ────────────────────────────────────────────
export function getDoneGrammar(uid: string): Set<string> {
  return readSet(GRAMMAR_KEY(uid))
}

export function markGrammarDone(uid: string, lessonId: string) {
  const set = getDoneGrammar(uid)
  set.add(lessonId)
  writeSet(GRAMMAR_KEY(uid), set)
  pushProgress(uid) // đồng bộ lên Supabase
}

export function unmarkGrammarDone(uid: string, lessonId: string) {
  const set = getDoneGrammar(uid)
  set.delete(lessonId)
  writeSet(GRAMMAR_KEY(uid), set)
  pushProgress(uid) // đồng bộ lên Supabase
}

export function isGrammarDone(uid: string, lessonId: string): boolean {
  return getDoneGrammar(uid).has(lessonId)
}

// ── Hội thoại đã xem ────────────────────────────────────────────────────
// Hội thoại không có id riêng → khóa = "<id unit/vòng>:<titleEn>" (ổn định).
export const dialogueKey = (ownerId: string, titleEn: string) => `${ownerId}:${titleEn}`

export function getViewedDialogues(uid: string): Set<string> {
  return readSet(DIALOGUE_KEY(uid))
}

export function markDialogueViewed(uid: string, ownerId: string, titleEn: string) {
  const set = getViewedDialogues(uid)
  const key = dialogueKey(ownerId, titleEn)
  if (set.has(key)) return // đã xem rồi — khỏi ghi lại + khỏi đẩy mạng thừa
  set.add(key)
  writeSet(DIALOGUE_KEY(uid), set)
  pushProgress(uid) // đồng bộ lên Supabase
}

// ── Đếm tiến độ ─────────────────────────────────────────────────────────
export interface Counts {
  done: number
  total: number
}

// Số từ đã thuộc trong 1 vòng — so cả nguyên dạng lẫn chữ thường
// (learned đọc từ vocab.ts đã lowercase, nhưng giữ kiểm tra kép cho an toàn).
export function circleDoneCount(circle: Circle, learned: Set<string>): number {
  return circle.words.filter((w) => learned.has(w.word) || learned.has(w.word.toLowerCase())).length
}

// Từ vựng của 1 unit (cộng các vòng liên kết).
export function unitVocabCounts(
  unit: CefrUnit,
  byId: Record<string, Circle>,
  learned: Set<string>,
): Counts {
  let done = 0
  let total = 0
  for (const id of unit.vocabCircleIds) {
    const c = byId[id]
    if (!c) continue
    total += c.words.length
    done += circleDoneCount(c, learned)
  }
  return { done, total }
}

// Từ vựng của cả cấp.
export function levelVocabCounts(
  level: CefrLevel,
  byId: Record<string, Circle>,
  learned: Set<string>,
): Counts {
  return level.units.reduce(
    (acc, u) => {
      const c = unitVocabCounts(u, byId, learned)
      return { done: acc.done + c.done, total: acc.total + c.total }
    },
    { done: 0, total: 0 },
  )
}

// Ngữ pháp của 1 unit / cả cấp (done = số bài đã đánh dấu học xong).
export function unitGrammarCounts(unit: CefrUnit, doneGrammar: Set<string>): Counts {
  return {
    done: unit.grammar.filter((g) => doneGrammar.has(g.id)).length,
    total: unit.grammar.length,
  }
}

export function levelGrammarCounts(level: CefrLevel, doneGrammar: Set<string>): Counts {
  return level.units.reduce(
    (acc, u) => {
      const c = unitGrammarCounts(u, doneGrammar)
      return { done: acc.done + c.done, total: acc.total + c.total }
    },
    { done: 0, total: 0 },
  )
}

// ── Khóa cấp ────────────────────────────────────────────────────────────
// A1 luôn mở; cấp sau bị khóa khi từ vựng cấp TRƯỚC chưa đạt UNLOCK_PCT.
export function computeLockedMap(
  levels: CefrLevel[],
  byId: Record<string, Circle>,
  learned: Set<string>,
): Map<CefrLevel['id'], boolean> {
  const map = new Map<CefrLevel['id'], boolean>()
  levels.forEach((l, idx) => {
    const prev = idx > 0 ? levels[idx - 1] : undefined
    if (!prev) {
      map.set(l.id, false)
      return
    }
    const { done, total } = levelVocabCounts(prev, byId, learned)
    map.set(l.id, total > 0 && done / total < UNLOCK_PCT)
  })
  return map
}

// ── Mục học tiếp theo trong 1 cấp ───────────────────────────────────────
// Duyệt unit theo thứ tự; trong mỗi unit ưu tiên TỪ VỰNG trước, NGỮ PHÁP sau
// (đúng trình tự hiển thị). Hội thoại không bắt buộc nên không tính.
export interface NextStep {
  unitIndex: number
  unit: CefrUnit
  kind: 'vocab' | 'grammar'
  circleId?: string
  lessonId?: string
}

export function findNextStep(
  level: CefrLevel,
  byId: Record<string, Circle>,
  learned: Set<string>,
  doneGrammar: Set<string>,
): NextStep | null {
  for (let i = 0; i < level.units.length; i++) {
    const unit = level.units[i]
    if (!unit) continue
    for (const id of unit.vocabCircleIds) {
      const c = byId[id]
      if (c && circleDoneCount(c, learned) < c.words.length) {
        return { unitIndex: i, unit, kind: 'vocab', circleId: id }
      }
    }
    for (const g of unit.grammar) {
      if (!doneGrammar.has(g.id)) {
        return { unitIndex: i, unit, kind: 'grammar', lessonId: g.id }
      }
    }
  }
  return null
}
