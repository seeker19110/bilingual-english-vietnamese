// ── Spaced Repetition System (SRS) — thuật toán SM-2 đơn giản ──────────────
// Mỗi từ được học xong → tự động vào SRS.
// Khi ôn, người dùng đánh giá: Quên / Khó / Nhớ / Dễ
// Hệ thống tính khoảng cách ôn tiếp theo dựa trên đánh giá.

import type { DictEntry } from '../types'
import { pushProgress } from './progressSync'
import { markDifficult } from './vocab'

export interface SRSCard {
  interval: number // khoảng cách ôn (số ngày)
  ease: number // hệ số dễ (1.3 – 2.5)
  due: number // Unix ms — thời điểm cần ôn lại
  reps: number // tổng số lần đã ôn
  lapses?: number // số lần đánh "Quên" — thêm sau nên optional, dữ liệu cũ coi như 0
}

export type Rating = 'again' | 'hard' | 'good' | 'easy'

const KEY = (uid: string) => `srs_${uid}`
const MS = 86_400_000 // 1 ngày tính bằng ms

// Từ bị "Quên" từ ngưỡng này trở lên tự động vào "Từ khó" (leech) — không cần đợi
// người dùng tự bấm ⭐, giúp thời gian ôn tập không dồn hết vào những từ mãi không nhớ.
const LEECH_THRESHOLD = 3

// Giới hạn số thẻ/phiên ôn để tránh "ngợp" khi quay lại sau khi nghỉ vài ngày —
// lý do bỏ học phổ biến nhất theo dữ liệu churn của Duolingo (xem docs/research).
export const SESSION_CAP = 30
// Quay lại sau ≥3 ngày nghỉ: phiên "khởi động nhẹ" nhỏ hơn hẳn, không dội cả backlog.
export const WELCOME_BACK_CAP = 10

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

// Thêm từ vào SRS khi đánh dấu "đã thuộc" — due = ngay bây giờ để ôn luôn hôm nay
export function addToSRS(uid: string, word: string) {
  const data = load(uid)
  const key = word.toLowerCase()
  if (!data[key]) {
    data[key] = { interval: 1, ease: 2.5, due: Date.now(), reps: 0 }
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
      if (card.lapses >= LEECH_THRESHOLD) markDifficult(uid, word)
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

// Lấy các từ đến hạn ôn hôm nay
export function getDueWords(uid: string, words: DictEntry[]): DictEntry[] {
  const data = load(uid)
  const now = Date.now()
  return words.filter((w) => {
    const c = data[w.word.toLowerCase()]
    return c && c.due <= now
  })
}

export interface DueSession {
  cards: DictEntry[] // thẻ của phiên này, đã ưu tiên + giới hạn (cap)
  totalDue: number // tổng số thẻ đến hạn THẬT (kể cả thẻ chưa vào phiên vì vượt cap)
}

// Lấy thẻ đến hạn ôn cho 1 PHIÊN, ưu tiên thẻ quá hạn LÂU NHẤT rồi tới thẻ DỄ QUÊN
// NHẤT (ease thấp) trước, giới hạn tối đa `cap` thẻ — chống ngợp khi backlog lớn
// (V2, docs/research/cai-tien-lo-trinh-hoc.md). `totalDue` giữ nguyên tổng số thật
// để UI có thể mời ôn thêm phiên khác, không cần dội hết một lần.
export function getDueSession(uid: string, words: DictEntry[], cap: number): DueSession {
  const data = load(uid)
  const now = Date.now()
  const due = words.filter((w) => {
    const c = data[w.word.toLowerCase()]
    return c != null && c.due <= now
  })
  const sorted = due.sort((a, b) => {
    const ca = data[a.word.toLowerCase()]
    const cb = data[b.word.toLowerCase()]
    /* c8 ignore next 2 -- ca/cb luôn tồn tại vì vừa lọc ở trên, guard chỉ để TS narrow kiểu */
    if (!ca || !cb) return 0
    if (ca.due !== cb.due) return ca.due - cb.due
    return ca.ease - cb.ease
  })
  return { cards: sorted.slice(0, cap), totalDue: due.length }
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
