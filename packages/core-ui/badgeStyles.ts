// packages/core-ui/badgeStyles.ts — Huy hiệu đếm số (badge) dùng chung.
//
// VÌ SAO CÓ FILE NÀY: cùng một chuỗi class badge được chép nguyên văn ở 3 trang
// (`CefrLevelPage`, `Learn`, `Dictionary`) — đúng kiểu trùng lặp mà design system sinh ra để
// chặn. Tệ hơn, bản chép đó mang một lỗi tương phản THẬT: `text-white` trên `bg-rose-500` chỉ
// đạt **3,67:1** (đo trong trình duyệt, xem `e2e/badge-contrast.spec.ts`), dưới sàn AA 4,5:1
// mà CLAUDE.md mục 4.5 ghi là sàn cứng, dung sai 0.
//
// Cổng a11y không bắt được vì badge CHỈ hiện khi số đếm > 0 — mà E2E chạy với tài khoản
// trống thì không có gì để đếm, nên phần tử đó chưa từng tồn tại lúc axe quét. Sửa ở một
// nguồn duy nhất là cách để nó không mọc lại ở màn hình thứ tư.
//
// HAI QUYẾT ĐỊNH MÀU:
//   1. Nền `rose-600` (#e11d48) thay `rose-500` (#f43f5e). Chữ trắng trên rose-600 đạt
//      **4,70:1** (đo thật) — qua AA. Giữ họ màu đỏ vì badge đếm việc-cần-làm là quy ước quen thuộc.
//   2. Chữ viết là `text-[#fff]` chứ KHÔNG phải `text-white`. Trong dự án này `text-white`
//      map sang token `--c-white` và **bị đảo thành màu tối ở các theme nền sáng** — nền
//      badge thì cố định đỏ ở mọi theme, nên để `text-white` là tự tạo lại đúng lỗi vừa vá.
//
// Cỡ chữ 12px (`text-xs`) thay 11px: badge là thứ người dùng liếc chứ không đọc kỹ, mà 11px
// bold trong vòng tròn 16px thì chữ số gần chạm viền.

/** Class cho badge đếm số gắn ở góc trên-phải của một nút/tab. */
export function countBadgeClass(): string {
  return [
    'absolute -top-1 -right-1',
    'bg-rose-600 text-[#fff]',
    'text-xs font-bold',
    'rounded-full min-w-[18px] h-[18px]',
    'flex items-center justify-center px-1',
    // `tabular-nums`: số 1 và 7 hẹp hơn các số khác, nên badge nhảy bề ngang khi đếm đổi.
    'tabular-nums',
  ].join(' ')
}

/** Rút gọn số đếm để badge không phình ra: trên 99 hiển thị "99+". */
export function badgeCount(n: number): string {
  return n > 99 ? '99+' : String(n)
}
