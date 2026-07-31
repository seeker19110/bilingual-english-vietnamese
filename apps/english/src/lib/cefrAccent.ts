// Bảng màu nhấn cho từng cấp CEFR (Tailwind cần class tĩnh, không ghép động).
// Kèm biến thể `theme-light:` sắc độ đậm cho 2 theme nền sáng (đạt AA — giống Dashboard).
// Để riêng khỏi file component (react-refresh yêu cầu file component chỉ export component).

import type { CefrLevel } from '../data/cefr'

export const ACCENT: Record<
  CefrLevel['accent'],
  {
    bar: string
    text: string
    soft: string
    ring: string
  }
> = {
  emerald: {
    bar: 'bg-accent-500',
    text: 'text-accent-300 theme-light:text-accent-800',
    soft: 'bg-accent-500/10',
    ring: 'border-accent-500/30',
  },
  sky: {
    bar: 'bg-sky-500',
    text: 'text-sky-300 theme-light:text-sky-800',
    soft: 'bg-sky-500/10',
    ring: 'border-sky-500/30',
  },
  violet: {
    bar: 'bg-violet-500',
    text: 'text-violet-300 theme-light:text-violet-800',
    soft: 'bg-violet-500/10',
    ring: 'border-violet-500/30',
  },
  amber: {
    bar: 'bg-amber-500',
    text: 'text-amber-300 theme-light:text-amber-800',
    soft: 'bg-amber-500/10',
    ring: 'border-amber-500/30',
  },
  // C1/C2 dùng rose/cyan — khớp LEVEL_COLOR badge cấp CEFR ở src/lib/pos.ts.
  rose: {
    bar: 'bg-rose-500',
    text: 'text-rose-300 theme-light:text-rose-800',
    soft: 'bg-rose-500/10',
    ring: 'border-rose-500/30',
  },
  cyan: {
    bar: 'bg-cyan-500',
    text: 'text-cyan-300 theme-light:text-cyan-800',
    soft: 'bg-cyan-500/10',
    ring: 'border-cyan-500/30',
  },
}

export type AccentClasses = (typeof ACCENT)[keyof typeof ACCENT]
