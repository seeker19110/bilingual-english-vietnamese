// packages/core-ui/PageShell.tsx — Khung trang dùng chung cho mọi trang trong app.
//
// VÌ SAO CẦN (đo 2026-09-02): `Layout.tsx` mang tên "Layout" nhưng thực chất chỉ là THANH
// HEADER — nó không bọc `children`. Hệ quả là không có chỗ nào áp được bề rộng/nhịp chung, và
// mỗi trang tự đặt lấy: đếm được 154 chỗ khai `max-w-*` rải từ `max-w-lg` tới `max-w-7xl`.
// Trên desktop điều đó lộ ra thành hai lỗi thị giác thấy ngay: mép nội dung KHÔNG thẳng hàng
// với header (`max-w-3xl lg:max-w-5xl`), và cùng một app nhưng mỗi trang rộng một kiểu.
//
// Component này là nơi DUY NHẤT quyết định bề rộng + nhịp dọc của một trang. Trang chỉ còn
// phải trả lời một câu: nội dung của tôi thuộc loại nào?
//
// Đặt ở `packages/core-ui` (không phải `apps/dhcb`) vì đây là hạ tầng trình bày thuần, không
// phụ thuộc dữ liệu/route của app nào — và luật phụ thuộc của dự án cấm `packages/` import
// `apps/`, nên nó buộc phải giữ mình thuần tuý như vậy.
import type { ReactNode } from 'react'

/**
 * Bề rộng theo LOẠI NỘI DUNG, không theo con số.
 *
 * - `reading`  — trang chủ yếu là chữ để đọc (bài học, giới thiệu, điều khoản). Giới hạn quanh
 *   65–75 ký tự mỗi dòng, là khoảng mắt người đọc thoải mái nhất; rộng hơn thì mắt mất dấu
 *   dòng khi xuống hàng. Đây là lý do trang bài học KHÔNG nên giãn hết màn hình.
 * - `standard` — mặc định: bảng điều khiển, danh sách, biểu mẫu. Khớp đúng bề rộng header.
 * - `wide`     — lưới nhiều cột, bảng dữ liệu, bảng giá — thứ thật sự cần chỗ.
 */
export type PageWidth = 'reading' | 'standard' | 'wide'

/** Bề rộng ở DESKTOP (≥1024px) — phần mà component này thật sự quyết định. */
const WIDTH_CLASS: Record<PageWidth, string> = {
  // ~65–75 ký tự/dòng. Dùng cho trang KHÔNG có cột phải; trang có cột phải nên chọn
  // `standard` để sau khi trừ cột phải, cột chữ vẫn rơi đúng khoảng đọc này.
  reading: 'lg:max-w-3xl',
  standard: 'lg:max-w-5xl', // khớp đúng bề rộng header → mép nội dung thẳng hàng
  wide: 'lg:max-w-7xl',
}

export interface PageShellProps {
  children: ReactNode
  /** Loại nội dung → quyết định bề rộng ở desktop. Mặc định `standard` (khớp header). */
  width?: PageWidth
  /**
   * Bề rộng DƯỚI 1024px, giữ nguyên đúng giá trị trang đang dùng trước khi di trú.
   *
   * VÌ SAO CÓ THAM SỐ NÀY: các trang hiện đặt mobile mỗi nơi một kiểu (`max-w-2xl`, `3xl`,
   * `4xl`…). Nếu ép một giá trị chung thì dải tablet 768–1024px sẽ đổi bề rộng — mà đợt 1 cam
   * kết KHÔNG đổi bất cứ thứ gì dưới 1024px. Truyền đúng class cũ vào đây thì việc di trú là
   * thay đổi thuần desktop, kiểm chứng được bằng ảnh chụp trước/sau ở 390px.
   */
  baseWidth?: string
  /** Class thêm cho thẻ bọc ngoài (nền riêng, khoảng đệm đặc biệt…). */
  className?: string
}

/**
 * Khung trang: căn giữa, áp bề rộng chuẩn, chừa chỗ cho thanh điều hướng dưới ở mobile.
 *
 * `--bnav-h` là chiều cao thanh điều hướng đáy; biến này đã được đặt về 0 từ 1024px trong
 * `index.css`, nên cùng một biểu thức padding chạy đúng cho cả hai đầu mà không cần nhánh
 * riêng cho desktop.
 */
export function PageShell({
  children,
  width = 'standard',
  baseWidth = 'max-w-3xl',
  className = '',
}: PageShellProps) {
  return (
    <main
      className={`mx-auto w-full px-4 pt-6 lg:pt-8 ${baseWidth} ${WIDTH_CLASS[width]} pb-[calc(2rem+var(--bnav-h))] ${className}`}
    >
      {children}
    </main>
  )
}
