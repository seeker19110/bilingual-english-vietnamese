// apps/dhcb/src/pages/subjects/english/lessons/shared.ts — tách từ pages/subjects/english/Lessons.tsx (1.693 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

export const PAGE_SIZE = 10

export type Speed = 0.75 | 1 | 1.25
export type AudioMode = 'en' | 'both' | 'vi'

// ── Hệ thống màu sắc — giống CommonPhrases ───────────────────────────────────
export const COLORS = [
  {
    bg: 'bg-accent-500/10',
    text: 'text-accent-400 theme-light:text-accent-800',
    border: 'border-accent-500/25',
    dot: 'bg-accent-400',
  },
  {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400 theme-light:text-sky-800',
    border: 'border-sky-500/25',
    dot: 'bg-sky-400',
  },
  {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400 theme-light:text-violet-800',
    border: 'border-violet-500/25',
    dot: 'bg-violet-400',
  },
  {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400 theme-light:text-amber-800',
    border: 'border-amber-500/25',
    dot: 'bg-amber-400',
  },
  {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400 theme-light:text-pink-800',
    border: 'border-pink-500/25',
    dot: 'bg-pink-400',
  },
  {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400 theme-light:text-teal-800',
    border: 'border-teal-500/25',
    dot: 'bg-teal-400',
  },
  {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400 theme-light:text-rose-800',
    border: 'border-rose-500/25',
    dot: 'bg-rose-400',
  },
  {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400 theme-light:text-indigo-800',
    border: 'border-indigo-500/25',
    dot: 'bg-indigo-400',
  },
  {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400 theme-light:text-orange-800',
    border: 'border-orange-500/25',
    dot: 'bg-orange-400',
  },
  {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400 theme-light:text-cyan-800',
    border: 'border-cyan-500/25',
    dot: 'bg-cyan-400',
  },
]

export function getColor(id: number) {
  // COLORS không rỗng; với id≥1 chỉ số luôn hợp lệ, fallback COLORS[0] phòng id lạ
  return COLORS[(id - 1) % COLORS.length] ?? COLORS[0]!
}

// ── Trạng thái đồng bộ từng chữ: turn nào đang phát, ngôn ngữ nào, từ thứ mấy
export interface WordSync {
  turnIdx: number
  lang: 'en' | 'vi'
  wordIdx: number
}

// Component highlight từng từ kiểu karaoke
