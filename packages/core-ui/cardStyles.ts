// packages/core-ui/Card.tsx — Thẻ nội dung chuẩn.
//
// VÌ SAO CẦN: thẻ là đơn vị lặp nhiều nhất trong app học tập (mỗi bài học, mỗi unit, mỗi mục
// tiến độ là một thẻ). Đo trên apps/dhcb/src ngày 2026-09-02: `border-zinc-800` xuất hiện 609
// lần, `bg-zinc-950` 310 lần, `bg-zinc-900/80` 214 lần, cùng với `rounded-xl` (894) lẫn
// `rounded-2xl` (603) — tức cùng một khái niệm "thẻ" đang có ít nhất bốn hình dạng. Trên một
// trang có nhiều thẻ cạnh nhau, mắt đọc sự khác biệt đó thành "chưa hoàn thiện" ngay cả khi
// người dùng không chỉ ra được vì sao.
//
// Component này chốt: bo góc `rounded-2xl`, nền `surface-card`, viền `line-subtle` — đều là
// token ngữ nghĩa đã đo đạt WCAG trên cả 5 theme.

/**
 * - `plain`       — thẻ tĩnh, chỉ để trình bày.
 * - `interactive` — cả thẻ là một mục bấm được (bài học, unit). Có phản hồi khi rê chuột và
 *   viền lấy nét — nhưng CHÍNH THẺ phải là `<a>`/`<button>` ở nơi gọi, không phải `<div>` gắn
 *   `onClick`: `<div onClick>` không lấy được nét bằng phím Tab và không bấm được bằng Enter.
 * - `highlight`   — thẻ đang được nhấn mạnh (việc hôm nay, mục đang học dở). Viền mang màu
 *   thương hiệu để mắt bắt được ngay trong một danh sách dài.
 */
export type CardVariant = 'plain' | 'interactive' | 'highlight'

const VARIANT_CLASS: Record<CardVariant, string> = {
  plain: 'bg-surface-card border-line-subtle',
  // `hover:-translate-y-0.5` rất nhẹ (2px): đủ để thẻ "nhấc lên" báo hiệu bấm được, không đủ
  // để làm xô lệch dòng chữ bên cạnh. Kèm `motion-reduce:transform-none` để tôn trọng cài đặt
  // giảm chuyển động của hệ điều hành (WCAG 2.3.3).
  interactive:
    'bg-surface-card border-line-subtle hover:border-accent-500/40 hover:-translate-y-0.5 ' +
    'motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
  highlight: 'bg-surface-card border-accent-500/40 shadow-lg shadow-accent-500/5',
}

/** Đệm trong. `md` là mặc định; `sm` cho thẻ trong danh sách dày, `lg` cho thẻ chính của trang. */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const PADDING_CLASS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 lg:p-5',
  lg: 'p-5 lg:p-7',
}

/** Sinh chuỗi class của thẻ — dùng khi thẻ phải là `<a>`/`<button>` chứ không phải `<div>`. */
export function cardClass({
  variant = 'plain',
  padding = 'md',
  className = '',
}: {
  variant?: CardVariant
  padding?: CardPadding
  className?: string
} = {}): string {
  return [
    'rounded-2xl border transition-all',
    PADDING_CLASS[padding],
    VARIANT_CLASS[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
