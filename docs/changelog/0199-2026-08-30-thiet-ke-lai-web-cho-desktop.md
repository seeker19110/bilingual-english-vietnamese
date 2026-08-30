# 0199 — Thiết kế lại web cho desktop (sidebar + Chat hai cột)

Web trước đây là app mobile phóng to trên mọi kích thước màn hình: BottomNav cố định ở đáy
dù màn rộng, 6 Studio chỉ vào được qua dropdown, nội dung giới hạn `max-w-3xl` bất kể chiều
ngang màn hình. PR này thiết kế lại vỏ ứng dụng (app shell) cho desktop (`≥1024px`, breakpoint
`lg:` của Tailwind) — dưới ngưỡng đó không đổi gì.

## Đã làm

- `apps/dhcb/src/lib/studios.ts` — tách danh sách 6 Studio dùng chung (trước lặp nguyên trong
  `Layout.tsx`), tránh Layout (dropdown mobile) và DesktopSidebar (sidebar desktop) lệch nhau
  khi thêm/bớt studio sau này.
- `apps/dhcb/src/components/DesktopSidebar.tsx` — sidebar trái cố định, chỉ hiện `≥1024px`
  (`hidden lg:flex`), liệt kê thẳng Trang chủ + 6 Studio + Tiến độ/Hồ sơ. **Thu gọn được**
  (icon-only), trạng thái nhớ qua `localStorage` (`ui_sidebar_collapsed`) và đẩy xuống toàn
  trang qua biến CSS `--sidebar-w` gắn trên `<html data-sidebar>` — trang tự co giãn lề trái
  (`lg:pl-[var(--sidebar-w)]` ở `App.tsx`) mà không cần biết sidebar rộng bao nhiêu.
- `components/BottomNav.tsx` — thêm `lg:hidden` (giữ nguyên ở mobile/tablet).
- `index.css` — `--bnav-h`/`--bnav-only-h` về `0px` ở `lg:` vì BottomNav không còn chiếm chỗ
  đáy trang; biến `--sidebar-w` (16rem mở rộng / 4.5rem thu gọn).
- `components/Layout.tsx` — header nới `max-w-3xl lg:max-w-5xl`.
- `pages/subjects/english/Chat.tsx` — thêm cột **"Sửa lỗi & giải thích"** ghim bên phải ở
  desktop, gom TẤT CẢ lời sửa/giải thích trong phiên kèm câu gốc — đỡ cuộn lên đối chiếu lỗi
  cũ. Tách khung sửa lỗi (KaraokeText + vote 👍👎) thành `FeedbackBlock` dùng chung giữa
  `Bubble` (mobile) và `FeedbackPanel` (desktop) để vote hoạt động y hệt ở cả hai nơi.

## Sự cố phát hiện qua full E2E — đã sửa

Vòng full E2E đầu tiên (24 spec) lộ ra: ẩn khung sửa lỗi bằng **CSS** (`lg:hidden` /
`hidden lg:flex`) vẫn để nguyên text đó trong DOM ở **CẢ HAI nơi** cùng lúc — trình đọc màn
hình sẽ đọc trùng 2 lần, và Playwright bắt đúng lỗi này (`getByText` strict-mode: "resolved to
2 elements") ở 5 test `a11y.spec.ts` "Chat (kết quả AI)". Sửa tận gốc bằng **JS** thay vì CSS:
thêm `apps/dhcb/src/lib/useIsDesktopViewport.ts` (1 `matchMedia('(min-width: 1024px)')` gọi
1 lần ở `Chat()`, truyền xuống qua prop) — `Bubble` chỉ render khung sửa lỗi khi `!isDesktop`,
`FeedbackPanel` chỉ được cha render khi `isDesktop`. Đảm bảo đúng MỘT bản tồn tại trong DOM tại
một thời điểm, không phải ẩn-nhưng-vẫn-còn.

## KHÔNG LÀM (phạm vi PR này)

- Không đụng route/logic nghiệp vụ, API, hay bất kỳ trang nào ngoài Chat.tsx + vỏ ứng dụng.
- Không đổi màu/token — vẫn dùng nguyên `--a-*`/`--z-*`.
- CefrLevelPage master–detail, cột ngữ cảnh phải ở Dashboard, phím tắt (`⌘K`, `/`) — để dành
  cho các PR sau (đề xuất ban đầu chia 4 PR, đây là PR 1+2 gộp).

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Test ✅ (7729/7729)
Budget: JS 126.49/140kB (90.4%, còn dư 13.51kB) | CSS 16.44/18kB (91.3%, còn dư 1.56kB)
E2E full suite (24 spec, 634 test) ✅ — kể cả 3 test programming-lesson.spec.ts từng flaky ở
  vòng chạy trước (xác nhận không liên quan nhánh này: chạy riêng lẻ với code cũ vẫn xanh,
  chỉ là tranh chấp tài nguyên khi 24 spec chạy song song).
```
