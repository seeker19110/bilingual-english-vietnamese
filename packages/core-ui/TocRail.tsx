// packages/core-ui/TocRail.tsx — MỤC LỤC của một trang dài, đặt ở cột phụ desktop.
//
// VÌ SAO CẦN: trang khoá học và trang bậc học là những danh sách dài nhất trong app (khoá
// `pyai` có 4 chương/17 bài, bậc P1 có 10 unit). Ở desktop chúng vẫn là một cột cuộn dọc: muốn
// xem chương 4 phải cuộn qua toàn bộ chương 1–3, và cuộn xong thì không còn biết mình đang ở
// đâu trong khoá. Đó đúng là chỗ mà chiều ngang thừa của desktop nên gánh — xem tư tưởng
// "chiều sâu thay vì chiều rộng" ở `TwoPane.tsx`.
//
// Component này CỐ Ý thuần trình bày: nó không biết chương/unit/chặng là gì, chỉ nhận một danh
// sách `{ id, label }` và mã của mục đang xem. Nhờ vậy trang khoá học, trang bậc học và mọi
// trang danh sách dài về sau dùng chung đúng một mục lục, không ai chép lại.
//
// Việc theo dõi "đang đọc tới mục nào" nằm ở hook `useActiveSection` bên dưới — tách khỏi phần
// vẽ để trang nào chỉ cần mục lục tĩnh thì không phải trả giá cho IntersectionObserver.

export interface TocItem {
  /** Mã mục — PHẢI trùng `id` của phần tử tương ứng trong trang (đích của liên kết neo). */
  id: string
  /** Nhãn hiển thị. */
  label: string
  /** Chữ phụ bên phải (vd "4 bài", "2/5"). Bỏ trống thì không vẽ. */
  hint?: string
  /** Đã hoàn thành chưa — vẽ dấu ✓ thay cho số thứ tự. */
  done?: boolean
}

export interface TocRailProps {
  items: readonly TocItem[]
  /** Mã mục đang xem — thường lấy từ `useActiveSection`. */
  activeId?: string
  /** Tiêu đề của mục lục. */
  title?: string
}

export function TocRail({ items, activeId, title = 'Mục lục' }: TocRailProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label={title} className="rounded-2xl border border-line-subtle bg-surface-card p-3">
      <h2 className="t-label px-2 pb-2 text-content">{title}</h2>
      <ol className="space-y-0.5">
        {items.map((item, i) => {
          const isActive = item.id === activeId
          return (
            <li key={item.id}>
              {/* Liên kết neo thật (`<a href="#...">`) chứ không phải nút gọi `scrollTo`: nó
                  hoạt động khi JS chưa chạy, mở được ở tab mới, và trình duyệt tự lo phần cuộn
                  mượt (`scroll-behavior` của trang) lẫn việc đưa tiêu điểm bàn phím tới đích. */}
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={`flex items-baseline gap-2 rounded-xl px-2 py-1.5 transition ${
                  isActive
                    ? 'bg-accent-500/15 text-content'
                    : 'text-content-secondary hover:bg-surface-raised hover:text-content'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-4 shrink-0 text-right tabular-nums ${
                    item.done
                      ? 'text-emerald-400 theme-light:text-emerald-800'
                      : 'text-content-muted'
                  } t-caption`}
                >
                  {item.done ? '✓' : i + 1}
                </span>
                <span className="t-caption min-w-0 flex-1 leading-snug">{item.label}</span>
                {item.hint && (
                  <span className="t-caption shrink-0 text-content-muted">{item.hint}</span>
                )}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
