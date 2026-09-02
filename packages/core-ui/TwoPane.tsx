// packages/core-ui/TwoPane.tsx — Bố cục hai cột "nội dung + cột ngữ cảnh" cho desktop.
//
// VÌ SAO CẦN (đo 2026-09-02): đúng công thức này đang được CHÉP TAY ở 6 trang (Home, Dashboard,
// CefrLevelPage, Chat, Speaking, Writing), với bề rộng cột phải lệch nhau giữa các bản sao
// (`w-72 xl:w-80` ở chỗ này, `w-80 xl:w-96` ở chỗ kia). Sáu bản sao nghĩa là mọi cải tiến về
// sau phải sửa sáu lần và chắc chắn sẽ có chỗ bị bỏ sót.
//
// TƯ TƯỞNG THIẾT KẾ: trên desktop, chỗ thừa KHÔNG dùng để kéo dài dòng chữ (dòng dài quá làm
// mắt mất dấu khi xuống hàng) mà dùng để đặt thứ đang hỗ trợ việc chính — mục lục, tiến độ,
// phần sửa lỗi. Đó là "chiều sâu thay vì chiều rộng".
//
// BẤT BIẾN QUAN TRỌNG — vì sao nhận `isDesktop` từ ngoài thay vì tự dùng `lg:hidden`:
// ẩn bằng CSS vẫn để NGUYÊN nội dung trong DOM ở cả hai nhánh. Bài học đã trả giá thật ở
// changelog `0199`: trình đọc màn hình đọc nội dung hai lần, và Playwright báo strict-mode
// violation vì tìm thấy hai phần tử trùng. Vì vậy nhánh desktop phải được quyết ở JS
// (`useIsDesktopViewport()` phía app) và chỉ MỘT nhánh được dựng.
import type { ReactNode } from 'react'

export interface TwoPaneProps {
  /** Cột chính. */
  children: ReactNode
  /** Cột phải — chỉ dựng khi `isDesktop` là true. Bỏ trống thì không có cột nào. */
  rail?: ReactNode
  /**
   * Có đang ở desktop không. Truyền từ `useIsDesktopViewport()` của app.
   * Cố ý KHÔNG tự đo bên trong: `packages/` không được phụ thuộc hook của `apps/`, và để
   * app giữ một nguồn sự thật duy nhất về ngưỡng 1024px.
   */
  isDesktop: boolean
  /** Bề rộng cột phải. `normal` cho mục lục/tiến độ, `wide` cho bảng sửa lỗi nhiều chữ. */
  railWidth?: 'normal' | 'wide'
  /** Nhãn cho vùng cột phải (đọc bởi trình đọc màn hình). */
  railLabel?: string
}

const RAIL_CLASS = {
  normal: 'w-72 xl:w-80',
  wide: 'w-80 xl:w-96',
} as const

export function TwoPane({
  children,
  rail,
  isDesktop,
  railWidth = 'normal',
  railLabel = 'Thông tin hỗ trợ',
}: TwoPaneProps) {
  if (!isDesktop || !rail) return <>{children}</>

  return (
    <div className="flex items-start gap-6">
      <div className="min-w-0 flex-1">{children}</div>
      {/* `sticky` + `max-h` + cuộn riêng: cột phải bám theo khi đọc nội dung dài, nhưng không
          bao giờ cao hơn khung nhìn nên không tự sinh thêm thanh cuộn cho cả trang.
          `top-20` chừa đúng chiều cao header sticky (h-14) cộng khoảng thở. */}
      <aside
        aria-label={railLabel}
        className={`sticky top-20 max-h-[calc(100dvh-6rem)] shrink-0 overflow-y-auto ${RAIL_CLASS[railWidth]}`}
      >
        {rail}
      </aside>
    </div>
  )
}
