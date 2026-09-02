// Breadcrumb — đường đi "Trang chủ › Phòng Học › Toán học" ở header, CHỈ hiện trên desktop.
//
// Vì sao chỉ desktop: mobile đã có nút Back to, dễ chạm, và bề ngang không đủ cho một
// chuỗi đốt. Trên desktop thì ngược lại — bề ngang dư dả, còn nút Back thì trả lời được
// mỗi câu "đi đâu tiếp" chứ không cho biết "tôi đang ở đâu" (xem lib/breadcrumb.ts).
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { buildCrumbs } from '../lib/breadcrumb'

interface Props {
  pathname: string
  /** Tiêu đề trang hiện tại — thành đốt cuối nếu cây route chưa biết trang này. */
  currentLabel?: string
  className?: string
}

export default function Breadcrumb({ pathname, currentLabel, className = '' }: Props) {
  const crumbs = buildCrumbs(pathname, currentLabel)
  // Ở Trang chủ (hoặc trang không xác định được nhánh) thì chỉ còn đúng 1 đốt — vẽ ra là
  // thừa, chiếm chỗ mà không nói thêm điều gì.
  if (crumbs.length < 2) return null

  return (
    <nav aria-label="Đường dẫn trang" className={`min-w-0 ${className}`}>
      <ol className="flex items-center gap-1 text-[13px] min-w-0">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <Fragment key={`${c.label}-${i}`}>
              {i > 0 && <ChevronRight aria-hidden className="w-3.5 h-3.5 shrink-0 text-zinc-500" />}
              <li className="min-w-0">
                {isLast ? (
                  // Đốt cuối = trang đang xem: không phải liên kết, và `aria-current`
                  // để trình đọc màn hình nói rõ đây mới là vị trí hiện tại.
                  <span aria-current="page" className="font-semibold text-white truncate block">
                    {c.label}
                  </span>
                ) : (
                  <Link
                    to={c.to}
                    className="text-zinc-400 hover:text-white transition truncate block rounded px-1 -mx-1 py-0.5 hover:bg-zinc-800/60"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
