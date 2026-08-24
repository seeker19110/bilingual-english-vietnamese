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
import { addGrammarToSRS } from './srs'

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
  addGrammarToSRS(uid, lessonId) // vào vòng ôn lặp (đề xuất E) — xem lib/srs.ts
  pushProgress(uid) // đồng bộ lên Supabase
}

// LƯU Ý (2026-08-13): server giờ hợp nhất cefrGrammar kiểu UNION (chỉ tăng, không giảm — xem
// api/_lib/progressMerge.ts) để tiến độ không mất khi dùng nhiều thiết bị. Hệ quả: bỏ đánh dấu
// ở ĐÂY chỉ có tác dụng TẠM trên máy này — lần đồng bộ sau (máy khác vẫn còn bản "đã học") sẽ
// tự thêm lại bài này vào danh sách đã học. Đánh đổi đã xác nhận với người dùng.
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

// ── Điều kiện DỰ THI cuối cấp ────────────────────────────────────────────
// Đã học đủ để được thi: ≥70% từ vựng (UNLOCK_PCT) VÀ 100% ngữ pháp của cấp.
// (Trước đây đây CHÍNH là điều kiện tự mở khóa cấp sau; nay chỉ để bật nút "Thi
// cuối cấp" — cấp sau mở khóa khi THI ĐẠT, xem computeLockedMap.)
export function isExamEligible(
  level: CefrLevel,
  byId: Record<string, Circle>,
  learned: Set<string>,
  doneGrammar: Set<string>,
): boolean {
  const vocab = levelVocabCounts(level, byId, learned)
  const grammar = levelGrammarCounts(level, doneGrammar)
  const vocabOk = vocab.total === 0 || vocab.done / vocab.total >= UNLOCK_PCT
  const grammarOk = grammar.total === 0 || grammar.done === grammar.total
  return vocabOk && grammarOk
}

// ── Khóa cấp ────────────────────────────────────────────────────────────
// A1 luôn mở; cấp sau bị khóa cho tới khi THI ĐẠT bài thi cuối cấp TRƯỚC
// (examPassed = tập id cấp đã thi đạt, xem lib/cefrExam.ts getPassedExamLevels).
// Người dùng đã mở khóa từ trước (grandfather) được giữ ở computeLockedMapPersisted.
export function computeLockedMap(
  levels: CefrLevel[],
  examPassed: Set<string>,
): Map<CefrLevel['id'], boolean> {
  const map = new Map<CefrLevel['id'], boolean>()
  levels.forEach((l, idx) => {
    const prev = idx > 0 ? levels[idx - 1] : undefined
    map.set(l.id, prev ? !examPassed.has(prev.id) : false)
  })
  return map
}

// ── Grandfather: cấp đã từng mở khóa thì không bao giờ khóa lại ─────────
// QUAN TRỌNG khi ra mắt bài THI cuối cấp: trước đây cấp sau tự mở khi cấp trước
// đạt ≥70% từ vựng + 100% ngữ pháp; nay cần THI ĐẠT. Người dùng đã mở khóa cấp
// theo luật cũ (đã ghi vào et_cefr_unlocked_*) PHẢI được giữ nguyên — không bị
// khóa lại vì chưa thi (chống hồi tố). Với họ, bài thi thành TÙY CHỌN lấy chứng
// nhận. (Cột này cũng chống hồi tố khi tổng từ vựng cấp trước tăng thêm sau này.)
const UNLOCKED_KEY = (uid: string) => `et_cefr_unlocked_${uid}`

export function getUnlockedLevels(uid: string): Set<string> {
  return readSet(UNLOCKED_KEY(uid))
}

// [2026-08-24] Tách làm 2 hàm — trả nợ ghi ở PROGRESS.md: hàm compute phải THUẦN
// (gọi được trong render/useMemo, React Compiler bảo toàn memo được); phần GHI
// localStorage + pushProgress tách sang persistUnlockedLevels, gọi từ useEffect.
export function computeLockedMapPersisted(
  uid: string,
  levels: CefrLevel[],
  examPassed: Set<string>,
): Map<CefrLevel['id'], boolean> {
  const everUnlocked = getUnlockedLevels(uid)
  const liveMap = computeLockedMap(levels, examPassed)
  const result = new Map<CefrLevel['id'], boolean>()
  for (const l of levels) {
    const liveLocked = liveMap.get(l.id) ?? false
    // Cấp đang mở theo luật sống HOẶC đã từng mở (grandfather) → không khóa.
    result.set(l.id, liveLocked && !everUnlocked.has(l.id))
  }
  return result
}

// Ghi nhớ các cấp VỪA mở theo luật sống vào et_cefr_unlocked_* (chống hồi tố về sau)
// + đồng bộ cloud. Idempotent: không đổi gì thì không ghi, không push. Gọi từ
// useEffect ở các trang dùng computeLockedMapPersisted — KHÔNG gọi trong render.
export function persistUnlockedLevels(
  uid: string,
  levels: CefrLevel[],
  examPassed: Set<string>,
): void {
  if (!uid) return
  const everUnlocked = getUnlockedLevels(uid)
  const liveMap = computeLockedMap(levels, examPassed)
  let changed = false
  for (const l of levels) {
    const liveLocked = liveMap.get(l.id) ?? false
    if (!liveLocked && !everUnlocked.has(l.id)) {
      everUnlocked.add(l.id)
      changed = true
    }
  }
  if (changed) {
    writeSet(UNLOCKED_KEY(uid), everUnlocked)
    pushProgress(uid) // đồng bộ lên Supabase
  }
}

// ── Mục học tiếp theo trong 1 cấp ───────────────────────────────────────
// Duyệt unit theo thứ tự; TRONG mỗi unit XEN KẼ từ vựng ↔ ngữ pháp (vòng 1 →
// bài 1 → vòng 2 → bài 2 …) thay vì bắt xong 100% từ vựng mới tới ngữ pháp —
// đúng nguyên tắc interleaving (trộn dạng bài giữ chú ý tốt hơn học 1 dạng kéo
// dài, xem docs/research/cai-tien-lo-trinh-hoc.md mục V5). Hết loại nào (vòng
// hoặc bài) thì tiếp tục loại còn lại. Hội thoại không bắt buộc nên không tính.
// CHỈ đổi thứ tự gợi ý — không đổi dữ liệu/ngưỡng "xong vòng" (vẫn 100%).
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
    const maxLen = Math.max(unit.vocabCircleIds.length, unit.grammar.length)
    for (let j = 0; j < maxLen; j++) {
      const circleId = unit.vocabCircleIds[j]
      if (circleId != null) {
        const c = byId[circleId]
        if (c && circleDoneCount(c, learned) < c.words.length) {
          return { unitIndex: i, unit, kind: 'vocab', circleId }
        }
      }
      const g = unit.grammar[j]
      if (g && !doneGrammar.has(g.id)) {
        return { unitIndex: i, unit, kind: 'grammar', lessonId: g.id }
      }
    }
  }
  return null
}
