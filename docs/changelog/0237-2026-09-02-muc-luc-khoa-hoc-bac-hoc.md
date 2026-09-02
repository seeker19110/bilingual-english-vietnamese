# 0237 — 2026-09-02 — Cột mục lục cho trang khoá học và trang bậc học

PR: (điền khi tạo) · Nhánh: `claude/muc-luc-khoa-hoc-bac-hoc`

## Việc đã làm

Người dùng nêu: "các bài học, khoá học phải thêm 1 cột để làm mục lục sẽ tiện dụng hơn".

Đo trước khi sửa (Playwright 1440px, đã đăng nhập giả): trang **bài học** thật ra ĐÃ có cột
phụ — bài Lập trình có `StepRail` (các bước trong bài), bài tiếng Anh có cột danh sách unit ở
`CefrLevelPage`. Thiếu hẳn mục lục là hai trang danh sách DÀI nhất:

- **Trang khoá học** (`/lap-trinh/khoa-hoc/:id`) — một cột duy nhất, khoá `pyai` có 4 chương /
  17 bài nên muốn xem chương 4 phải cuộn qua toàn bộ chương 1–3.
- **Trang bậc học** (`/lap-trinh/:levelId`) — có cột phải (tiến độ + chặng dự án) nhưng không
  có mục lục; bậc P1 có 10 unit.

Đã thêm:

1. **`packages/core-ui/TocRail.tsx`** — mục lục dùng chung, thuần trình bày: nhận
   `{ id, label, hint?, done? }`, không biết chương/unit/chặng là gì nên trang nào có danh sách
   dài đều dùng lại được. Mỗi mục là **liên kết neo thật** (`<a href="#...">`), không phải nút
   gọi `scrollTo`: mở được ở tab mới, hoạt động cả khi JS chưa chạy, và trình duyệt tự lo phần
   cuộn lẫn việc đưa tiêu điểm bàn phím tới đích.
2. **`packages/core-ui/useActiveSection.ts`** — theo dõi "đang đọc tới mục nào" bằng
   `IntersectionObserver` (không nghe `scroll`: trình duyệt tự gộp nhịp nên không phải tự chống
   dội). `rootMargin: -20% / -65%` thu vùng quan sát về một dải hẹp gần đỉnh màn hình — để
   nguyên cả khung nhìn thì lúc nào cũng có 2–3 mục cùng hiện và mục lục nhảy qua lại.
   **Tách khỏi `TocRail.tsx`** vì file component không được xuất thêm hàm thường (lint
   `react-refresh/only-export-components` chặn — đã đỏ thật một lượt).
3. **Trang khoá học** — bọc `TwoPane` với `railSide="left"`: mục lục là danh sách để CHỌN, mà
   mắt đọc từ trái sang, nên thứ "chọn trước rồi mới xem" phải đứng trước thứ được chọn.
4. **Trang bậc học** — mục lục 10 unit đặt lên ĐẦU cột phải sẵn có (trên tiến độ + chặng dự án),
   không dựng cột thứ ba: ở 1152px ba cột sẽ bóp cột chữ xuống dưới khoảng đọc dễ chịu.

## Quyết định kèm theo

- **Chữ phụ là SỐ BÀI, không phải "C1/C2/U1"** — bản đầu ghi mã chương/unit, nhìn ảnh chụp thì
  thấy nó lặp lại đúng số thứ tự đã nằm ở cột trái. Số bài mới là thứ chưa biết.
- **`scroll-mt-20` trên từng thẻ chương/unit** — không có nó thì nhảy tới mục qua mục lục sẽ
  đưa tiêu đề nằm khuất sau header dính.
- **Hook gọi TRƯỚC mọi `return` sớm** — cả hai trang đều có nhánh `<Navigate>` cho mã lạ; đặt
  `useActiveSection` sau nhánh đó là vi phạm Rules of Hooks. Danh sách mã tính bằng
  `level?.units.map(...) ?? []` để hook luôn được gọi đúng số lần.

## Việc CHƯA làm (nêu rõ)

Trang **landing** (`/welcome`, `/learn-vietnamese`) vẫn là một cột ~640px giữa màn hình 1440px —
đúng nghĩa "mobile phóng to". Loạt thiết kế lại desktop (#815–#818) chỉ phủ các trang TRONG app
(sau đăng nhập), chưa đụng landing. Đây là việc riêng, chưa làm trong đợt này.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npm run format` ✅
- `npm test` ✅ — 537 file / 10.937 test, thêm `packages/core-ui/TocRail.test.tsx` (7 ca: danh
  sách rỗng không vẽ gì · liên kết neo đúng id · đúng MỘT mục mang `aria-current` · không
  `activeId` thì không mục nào được đánh dấu · ✓ thay số khi xong · chữ phụ · nhãn vùng a11y).
- `npm run build` ✅ — 214,09 kB JS (không đổi) / 38,59 kB CSS.
- **Ảnh chụp thật ở 1440px** (Playwright, đăng nhập giả) cho cả hai trang: mục lục hiện đúng,
  mục đang đọc được tô sáng, bấm nhảy đúng chương/unit.
