// ── Spaced Repetition System (SRS) — thuật toán SM-2 đơn giản ──────────────
// Mỗi từ được học xong → tự động vào SRS.
// Khi ôn, người dùng đánh giá: Quên / Khó / Nhớ / Dễ
// Hệ thống tính khoảng cách ôn tiếp theo dựa trên đánh giá.

import type { DictEntry } from '../types'
import { pushProgress } from './progressSync'

export interface SRSCard {
  interval: number // khoảng cách ôn (số ngày)
  ease: number // hệ số dễ (1.3 – 2.5)
  due: number // Unix ms — thời điểm cần ôn lại
  reps: number // tổng số lần đã ôn
  lapses?: number // số lần bấm "Quên" — thẻ cũ chưa có coi như 0
}

// Từ ≥3 lần "Quên" bị xem là "leech" — tự động xếp vào diện cần chú ý (tab Từ khó).
const LEECH_THRESHOLD = 3

// Cap số thẻ ôn mỗi phiên để tránh dồn quá nhiều sau khi nghỉ vài ngày —
// dễ ngợp và bỏ học (theo nghiên cứu Duolingo về lý do bỏ học).
export const SRS_SESSION_CAP = 30

export type Rating = 'again' | 'hard' | 'good' | 'easy'

const KEY = (uid: string) => `srs_${uid}`
const MS = 86_400_000 // 1 ngày tính bằng ms

function load(uid: string): Record<string, SRSCard> {
  try {
    const raw = localStorage.getItem(KEY(uid))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(uid: string, data: Record<string, SRSCard>) {
  localStorage.setItem(KEY(uid), JSON.stringify(data))
}

// Từ MỚI học đến hạn ôn sau 4 GIỜ (không phải ngay lập tức): ôn cùng ngày buổi
// tối vẫn giữ spacing ngắn đầu tiên, nhưng badge "Ôn SRS" không nhảy số NGAY khi
// vừa học xong batch — tránh cảm giác "vừa xong đã nợ" (E4, xem
// docs/research/cai-tien-trai-nghiem-hoc-2026-07-11.md). Chỉ ảnh hưởng thẻ TẠO MỚI.
export const NEW_CARD_DELAY_MS = 4 * 3_600_000

// Thêm từ vào SRS khi đánh dấu "đã thuộc" — due = +4h để ôn lại trong ngày
export function addToSRS(uid: string, word: string) {
  const data = load(uid)
  const key = word.toLowerCase()
  if (!data[key]) {
    data[key] = { interval: 1, ease: 2.5, due: Date.now() + NEW_CARD_DELAY_MS, reps: 0 }
    save(uid, data)
    pushProgress(uid) // đồng bộ lịch ôn lên Supabase
  }
}

// Từ "đã biết sẵn" qua test-out (nút "Tôi đã biết vòng này" — quiz ≥90% đúng)
// vào SRS với interval DÀI HƠN addToSRS() thường (mặc định 7 ngày): người dùng
// đã CHỨNG MINH thuộc từ qua quiz nên không cần ôn ngay hôm nay như từ mới học
// lần đầu.
const KNOWN_INTERVAL_DAYS = 7
export function addToSRSKnown(uid: string, word: string, intervalDays = KNOWN_INTERVAL_DAYS) {
  const data = load(uid)
  const key = word.toLowerCase()
  if (!data[key]) {
    data[key] = {
      interval: intervalDays,
      ease: 2.5,
      due: Date.now() + intervalDays * MS,
      reps: 1,
    }
    save(uid, data)
    pushProgress(uid) // đồng bộ lịch ôn lên Supabase
  }
}

// Cập nhật lịch ôn sau khi người dùng đánh giá 1 thẻ
export function reviewWord(uid: string, word: string, rating: Rating) {
  const data = load(uid)
  const key = word.toLowerCase()
  const card: SRSCard = data[key] ?? { interval: 0, ease: 2.5, due: 0, reps: 0 }
  const now = Date.now()

  switch (rating) {
    case 'again':
      card.interval = 0
      card.ease = Math.max(1.3, card.ease - 0.2)
      card.lapses = (card.lapses ?? 0) + 1
      break
    case 'hard':
      card.interval = Math.max(1, Math.round(card.interval * 1.2))
      card.ease = Math.max(1.3, card.ease - 0.15)
      break
    case 'good':
      card.interval =
        card.reps === 0 ? 1 : card.reps === 1 ? 4 : Math.round(card.interval * card.ease)
      break
    case 'easy':
      card.interval = card.reps === 0 ? 4 : Math.round(card.interval * card.ease * 1.3)
      card.ease = Math.min(2.5, card.ease + 0.15)
      break
  }

  card.reps += 1
  // 'again' (Quên): hẹn ôn lại NGAY trong phiên này (due = bây giờ) — đúng như gợi ý UI
  // "Quên → ôn sớm" và để SRSReview tải lại thẻ này cho người dùng drill tới khi nhớ.
  // Các mức khác tối thiểu 1 ngày.
  card.due = rating === 'again' ? now : now + Math.max(card.interval, 1) * MS
  data[key] = card
  save(uid, data)
  pushProgress(uid) // đồng bộ lịch ôn lên Supabase
}

// Lấy các từ đến hạn ôn hôm nay.
// `limit`: cap số thẻ trả về (mặc định không cap — dùng cho đếm badge/thống kê),
// ưu tiên thẻ quá hạn LÂU NHẤT rồi tới ease THẤP NHẤT trước, tránh cảm giác ngợp
// khi danh sách due dồn lại sau vài ngày nghỉ (chỉ áp khi gọi có limit, ví dụ
// phiên ôn thật trong SRSReview).
export function getDueWords(uid: string, words: DictEntry[], limit?: number): DictEntry[] {
  const data = load(uid)
  const now = Date.now()
  const due = words.filter((w) => {
    const c = data[w.word.toLowerCase()]
    return c && c.due <= now
  })
  if (limit == null) return due
  const sorted = [...due].sort((a, b) => {
    const ca = data[a.word.toLowerCase()]!
    const cb = data[b.word.toLowerCase()]!
    return ca.due - cb.due || ca.ease - cb.ease
  })
  return sorted.slice(0, limit)
}

// Từ bị đánh "Quên" ≥3 lần — tự động coi là "leech", cần chú ý thêm (tab Từ khó).
export function getLeechWords(uid: string, words: DictEntry[]): DictEntry[] {
  const data = load(uid)
  return words.filter((w) => (data[w.word.toLowerCase()]?.lapses ?? 0) >= LEECH_THRESHOLD)
}

// Thống kê SRS của user
export function getSRSStats(uid: string): { total: number; due: number } {
  const data = load(uid)
  const now = Date.now()
  const entries = Object.values(data)
  return {
    total: entries.length,
    due: entries.filter((c) => c.due <= now).length,
  }
}

// Ngày ôn tiếp theo của 1 từ (null nếu chưa trong SRS)
export function getNextReview(uid: string, word: string): Date | null {
  const data = load(uid)
  const card = data[word.toLowerCase()]
  return card ? new Date(card.due) : null
}

// ── Ngữ pháp: dùng CHUNG kho SM-2 này (đề xuất E,
// docs/research/danh-gia-tien-trien-hoc-2026-07-07.md — "spacing áp cho mọi loại kiến thức,
// không riêng từ vựng"). Tiền tố `grammar:` để khoá KHÔNG đụng namespace với từ tiếng Anh
// (word) đang lưu trong cùng 1 kho `srs_${uid}`.
const grammarKey = (lessonId: string) => `grammar:${lessonId}`

// Vào vòng ôn khi 1 bài ngữ pháp được đánh dấu "đã học xong" (gọi từ markGrammarDone).
export function addGrammarToSRS(uid: string, lessonId: string) {
  addToSRS(uid, grammarKey(lessonId))
}

// Cập nhật lịch ôn sau khi trả lời 1 câu quiz ngữ pháp — đúng → 'good', sai → 'again'
// (suy ra tự động từ đúng/sai, không hỏi người dùng tự đánh giá như thẻ từ vựng).
export function reviewGrammar(uid: string, lessonId: string, rating: Rating) {
  reviewWord(uid, grammarKey(lessonId), rating)
}

// Các bài ngữ pháp đến hạn ôn trong số `lessonIds` đã học xong — cùng thứ tự ưu tiên
// (quá hạn lâu nhất trước) như getDueWords.
export function getDueGrammarLessonIds(uid: string, lessonIds: string[], limit?: number): string[] {
  const data = load(uid)
  const now = Date.now()
  const due = lessonIds.filter((id) => {
    const c = data[grammarKey(id)]
    return c && c.due <= now
  })
  if (limit == null) return due
  const sorted = [...due].sort((a, b) => {
    const ca = data[grammarKey(a)]!
    const cb = data[grammarKey(b)]!
    return ca.due - cb.due || ca.ease - cb.ease
  })
  return sorted.slice(0, limit)
}
