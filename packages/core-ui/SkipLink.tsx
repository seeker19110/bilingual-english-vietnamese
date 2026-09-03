// packages/core-ui/SkipLink.tsx — "Bỏ qua tới nội dung chính".
//
// VẤN ĐỀ NÓ GIẢI: mọi trang đều có sidebar cố định (~15 mục) cộng thanh header. Người dùng
// bàn phím muốn tới nội dung phải Tab qua toàn bộ khối đó — MỖI LẦN đổi trang. Đo thật ở
// 1440px: trang cấp CEFR có 137 điểm dừng Tab, các trang khác 26–59; phần đầu danh sách luôn
// là cùng một menu đã đi qua ở trang trước.
//
// Đây là tiêu chí WCAG **2.4.1 Bypass Blocks — mức A** (thấp hơn cả AA, tức là mức sàn nhất).
// Cổng axe của dự án vẫn xanh vì `PageShell` có render landmark `<main>`, và luật `bypass`
// của axe chấp nhận landmark là đủ. Nhưng landmark chỉ giúp người dùng TRÌNH ĐỌC MÀN HÌNH
// (họ nhảy theo landmark); người dùng bàn phím thuần — không dùng trình đọc — không có cách
// nào bỏ qua menu. Nói cách khác: cổng xanh ở đây KHÔNG có nghĩa là không có việc phải làm.
//
// CÁCH HOẠT ĐỘNG: liên kết nằm ở phần tử đầu tiên của trang nên là điểm dừng Tab ĐẦU TIÊN.
// Nó vô hình cho tới khi nhận tiêu điểm (`sr-only` + `focus:not-sr-only`) — người dùng chuột
// không bao giờ thấy, người dùng bàn phím bấm Tab một lần là thấy ngay.

import { MAIN_CONTENT_ID } from './PageShell.js'

export interface SkipLinkProps {
  /** Nhãn hiển thị. Mặc định tiếng Việt — truyền vào để đổi theo ngôn ngữ đang chọn. */
  label?: string
}

export function SkipLink({ label = 'Bỏ qua tới nội dung chính' }: SkipLinkProps) {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      // `sr-only` khi chưa có tiêu điểm, hiện đầy đủ khi được Tab tới. KHÔNG dùng
      // `display:none`/`visibility:hidden` — hai thứ đó gỡ luôn phần tử khỏi thứ tự Tab,
      // tức là liên kết sẽ không bao giờ nhận được tiêu điểm để mà hiện ra.
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-accent-500 focus:text-[#09090b] focus:font-semibold focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-300"
    >
      {label}
    </a>
  )
}
