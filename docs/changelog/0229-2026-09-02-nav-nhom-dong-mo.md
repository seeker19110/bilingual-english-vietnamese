# 0229 — Thanh điều hướng desktop: mục cha ĐÓNG/MỞ được, môn học nằm ngay dưới "Phòng Học"

- **Ngày:** 2026-09-02
- **Nhánh:** `claude/nav-redesign-collapsible-tabs-pg4usz`

## Vấn đề

Sidebar desktop là danh sách PHẲNG: muốn vào môn Toán phải đi hai chặng (bấm "Phòng Học" →
chờ trang danh sách môn tải → bấm thẻ môn). Các môn học là nơi người dùng ở lâu nhất mà lại
nằm sâu nhất.

## Đã làm

- **Mới `apps/dhcb/src/lib/navTree.ts`** — cây điều hướng dùng chung: mục con của "Phòng Học"
  (6 môn của `packages/core-learner/subjectRegistry.ts`: Tiếng Anh · Toán · Lý · Hóa · Sinh ·
  Lập trình), của "Luyện tập" (trò chuyện · nói · viết · nghe · từ điển · thử thách) và của
  "Học Tiếng Anh" (lộ trình CEFR · bài học · câu thông dụng · sổ tay lỗi sai · ôn thi). Kèm
  hàm THUẦN `toggleGroup` / `groupContainsPath` và `readOpenGroups`/`writeOpenGroups`
  (localStorage `ui_sidebar_groups`, hỏng dữ liệu thì coi như chưa mở nhóm nào).
- **`components/DesktopSidebar.tsx`** — mục có mục con nay render nút mũi tên riêng
  (`aria-expanded` + `aria-controls`, nhãn nói rõ nhóm nào) bên cạnh liên kết. Bấm mũi tên
  mở/đóng nhóm; bấm chữ vẫn đi tới trang tổng quan như cũ. Nhóm chứa trang đang xem TỰ MỞ để
  người vào thẳng bằng URL vẫn định vị được. Chế độ thu gọn (icon-only) không hiện mục con.
- Mục con môn học dùng `SubjectsLink` chứ không `<Link>` cứng — trụ Học tập có thể ở origin
  riêng (`hoc-tap.donghanhcungban.org`, xem `lib/subjectsHost.ts`).

## Chưa làm (cố ý)

BottomNav mobile giữ nguyên 5 tab: thanh dưới không đủ chỗ cho cây đóng/mở, và mở nhóm ở đó
sẽ che nội dung. Nếu muốn, đợt sau làm bảng trượt (sheet) khi giữ lâu một tab.

## Bằng chứng

`npm ci` (khớp lockfile) rồi: Build ✅ · Typecheck ✅ · Lint ✅ (0 cảnh báo) · Prettier ✅ ·
Test ✅ 534 file / 10.854 test xanh (gồm `apps/dhcb/src/lib/navTree.test.ts` mới, 7 test).
