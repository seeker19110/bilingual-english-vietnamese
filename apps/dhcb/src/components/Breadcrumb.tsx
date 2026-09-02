// Breadcrumb — đường đi "Trang chủ › Phòng Học" ở header, CHỈ hiện trên desktop.
//
// Vì sao chỉ desktop: mobile đã có nút Back to, dễ chạm, và bề ngang không đủ cho một
// chuỗi đốt. Trên desktop thì ngược lại — bề ngang dư dả, còn nút Back thì trả lời được
// mỗi câu "đi đâu tiếp" chứ không cho biết "tôi đang ở đâu" (xem lib/breadcrumb.ts).
//
// CHỈ vẽ các TẦNG CHA — bỏ đốt cuối (trang hiện tại): `buildCrumbs` trả về cả đốt đó vì
// hàm là logic THUẦN, dùng chung được cho việc khác; nhưng ở ĐÂY nó luôn trùng chữ với
// tiêu đề trang render ngay bên dưới (component `Layout.tsx`). Từng thử vẽ cả đốt cuối —
// vỡ `continue-viewing.spec.ts` vì `getByText` khớp nhầm HAI chỗ có cùng chữ.
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { buildCrumbs, type Crumb } from '../lib/breadcrumb'

interface Props {
  pathname: string
  /** Tiêu đề trang hiện tại — dùng để cây route xác định đúng nhánh, KHÔNG tự vẽ ra (xem trên). */
  currentLabel?: string
  /** Đốt cha ĐỘNG do trang tự cấp (tên hướng, tên lộ trình, tên bậc…) — xem lib/breadcrumb.ts. */
  crumbs?: readonly Crumb[]
  className?: string
}

export default function Breadcrumb({ pathname, currentLabel, crumbs, className = '' }: Props) {
  const ancestors = buildCrumbs(pathname, currentLabel, crumbs).slice(0, -1)
  // Không có tầng cha nào đáng kể (Trang chủ, hoặc trang tầng 1 mà cha DUY NHẤT chính là
  // Trang chủ) thì vẽ ra là thừa — tiêu đề trang bên dưới đã đủ nói "đang ở đâu".
  if (ancestors.length < 1) return null

  return (
    <nav aria-label="Đường dẫn trang" className={`min-w-0 ${className}`}>
      <ol className="flex items-center gap-1 text-[13px] min-w-0">
        {ancestors.map((c, i) => (
          <Fragment key={`${c.label}-${i}`}>
            {i > 0 && <ChevronRight aria-hidden className="w-3.5 h-3.5 shrink-0 text-zinc-500" />}
            <li className="min-w-0">
              <Link
                to={c.to}
                className="text-zinc-400 hover:text-white transition truncate block rounded px-1 -mx-1 py-0.5 hover:bg-zinc-800/60"
              >
                {c.label}
              </Link>
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
