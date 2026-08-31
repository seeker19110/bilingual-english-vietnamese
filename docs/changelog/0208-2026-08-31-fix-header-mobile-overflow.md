# 0208 — Sửa tràn ngang header mobile khi có cả streak + subtitle + nút Companion

- **Ngày:** 2026-08-31
- **PR:** (điền số PR sau khi tạo)

## Việc đã làm

Phát hiện khi kiểm chứng trình duyệt thật cho loạt audit UI/UX đợt 3 (bố cục 2 cột
Home/Speaking): tại `apps/dhcb/src/components/Layout.tsx`, header mobile xếp streak badge
("🔥 N ngày liên tiếp"), subtitle của trang, và nút "Đồng Hành AI" trên cùng một hàng, tất cả
đều `shrink-0`, không có cơ chế co giãn khi màn hẹp.

Tái hiện: vào `/luyen-noi`, bấm "Bắt đầu luyện nói" để vào màn hội thoại (Speaking.tsx truyền
`subtitle` cho Layout ở màn này) — ở viewport 390px, nút Companion bị đẩy ra ngoài viewport bên
phải, đo được tràn ngang **54px** (`scrollWidth - clientWidth`).

**Sửa:** khi header có cả title/subtitle lẫn streak (nhánh streak nằm trong flow, không phải
nhánh streak-nổi-giữa-màn-hình khi không có title/subtitle), ẩn streak badge ở màn hẹp
(`hidden sm:flex` thay vì `flex`) để nhường chỗ. Streak không mất thông tin — vẫn hiện đầy đủ ở
trang `/progress` và ở màn hẹp khi trang không có title/subtitle (badge nổi giữa màn hình,
không chiếm chỗ trong flex row).

## Bằng chứng kiểm chứng

Dùng Playwright điều khiển Chromium thật ở viewport 390×844, mock `/api/auth?action=me` +
`/api/agent` (môi trường phiên này không có `DATABASE_URL`, không đăng nhập thật được) để vào
được màn hội thoại thật của `/luyen-noi` với subtitle + streak = 1:

- **Trước sửa:** `document.documentElement.scrollWidth - clientWidth` = **54px** (khớp đúng số
  đo trong báo cáo) — subtitle bị bóp mất, nút Companion + phần header còn lại tràn ra ngoài.
- **Sau sửa:** overflow = **0px** — streak badge tự ẩn, subtitle hiện đủ (truncate), nút
  Companion nằm gọn trong viewport.

Đã chạy đủ cổng trước commit: `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ ·
`npm run build` ✅ (cần `npm ci` trước — môi trường phiên lệch lockfile ban đầu, gây lỗi
TS5101 giả ở mọi file, không liên quan thay đổi này).

## Quyết định

Không đổi cấu trúc/HTML khác của header — chỉ thêm `hidden sm:flex` cho đúng 1 nhánh streak
badge (nhánh khi có title/subtitle). Không cần `flex-wrap` hay đổi subtitle sang truncate mới
(subtitle đã `truncate` + cha đã `min-w-0` từ trước).
