// ── Spaced Repetition System (SRS) — thuật toán SM-2 đơn giản ──────────────
// Mỗi từ được học xong → tự động vào SRS.
// Khi ôn, người dùng đánh giá: Quên / Khó / Nhớ / Dễ
// Hệ thống tính khoảng cách ôn tiếp theo dựa trên đánh giá.

import type { DictEntry } from '../types'

export interface SRSCard {
  interval: number   // khoảng cách ôn (số ngày)
  ease:     number   // hệ số dễ (1.3 – 2.5)
  due:      number   // Unix ms — thời điểm cần ôn lại
  reps:     number   // tổng số lần đã ôn
}

export type Rating = 'again' | 'hard' | 'good' | 'easy'

const KEY = (uid: string) => `srs_${uid}`
const MS  = 86_400_000 // 1 ngày tính bằng ms

function load(uid: string): Record<string, SRSCard> {
  try {
    const raw = localStorage.getItem(KEY(uid))
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function save(uid: string, data: Record<string, SRSCard>) {
  localStorage.setItem(KEY(uid), JSON.stringify(data))
}

// Thêm từ vào SRS khi đánh dấu "đã thuộc" — due = ngay bây giờ để ôn luôn hôm nay
export function addToSRS(uid: string, word: string) {
  const data = load(uid)
  const key  = word.toLowerCase()
  if (!data[key]) {
    data[key] = { interval: 1, ease: 2.5, due: Date.now(), reps: 0 }
    save(uid, data)
  }
}

// Cập nhật lịch ôn sau khi người dùng đánh giá 1 thẻ
export function reviewWord(uid: string, word: string, rating: Rating) {
  const data = load(uid)
  const key  = word.toLowerCase()
  const card: SRSCard = data[key] ?? { interval: 0, ease: 2.5, due: 0, reps: 0 }
  const now  = Date.now()

  switch (rating) {
    case 'again':
      card.interval = 0
      card.ease     = Math.max(1.3, card.ease - 0.2)
      break
    case 'hard':
      card.interval = Math.max(1, Math.round(card.interval * 1.2))
      card.ease     = Math.max(1.3, card.ease - 0.15)
      break
    case 'good':
      card.interval = card.reps === 0 ? 1 : card.reps === 1 ? 4 : Math.round(card.interval * card.ease)
      break
    case 'easy':
      card.interval = card.reps === 0 ? 4 : Math.round(card.interval * card.ease * 1.3)
      card.ease     = Math.min(2.5, card.ease + 0.15)
      break
  }

  card.reps += 1
  card.due   = now + Math.max(card.interval, 1) * MS
  data[key]  = card
  save(uid, data)
}

// Lấy các từ đến hạn ôn hôm nay
export function getDueWords(uid: string, words: DictEntry[]): DictEntry[] {
  const data = load(uid)
  const now  = Date.now()
  return words.filter(w => {
    const c = data[w.word.toLowerCase()]
    return c && c.due <= now
  })
}

// Thống kê SRS của user
export function getSRSStats(uid: string): { total: number; due: number } {
  const data    = load(uid)
  const now     = Date.now()
  const entries = Object.values(data)
  return {
    total: entries.length,
    due:   entries.filter(c => c.due <= now).length,
  }
}

// Ngày ôn tiếp theo của 1 từ (null nếu chưa trong SRS)
export function getNextReview(uid: string, word: string): Date | null {
  const data = load(uid)
  const card = data[word.toLowerCase()]
  return card ? new Date(card.due) : null
}
