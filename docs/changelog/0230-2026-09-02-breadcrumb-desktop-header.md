# 0230 — Header desktop: thêm breadcrumb bên cạnh nút Back

- **Ngày:** 2026-09-02
- **Nhánh:** `claude/redesign-desktop-ui-ux-t838bm`
- **Bối cảnh:** đợt 1/4 của việc nghiên cứu + thiết kế lại UI/UX desktop (mỗi lát cắt một
  PR riêng — xem các đợt tiếp theo trong changelog cho lát B/C/D).

## Vấn đề

Header desktop (component `Layout.tsx`, dùng chung mọi trang) chỉ có nút "Back" trả lời được
CÓ MỘT câu: "bấm vào thì đi đâu". Nó không trả lời được câu quan trọng hơn khi lặn sâu vào
một bài học/chặng học: "tôi đang đứng ở đâu trong cây điều hướng". DesktopSidebar đã có cây
phân cấp (`lib/navTree.ts`, đợt #809) nhưng header phía trên nội dung không phản ánh lại
cây đó.

## Đã làm

- **Mới `apps/dhcb/src/lib/breadcrumb.ts`** — hàm THUẦN `buildCrumbs(pathname, currentLabel?)`
  sinh đường đi kiểu "Trang chủ › Phòng Học & STEM › Toán học" từ đường dẫn hiện tại. Nhãn
  lấy lại từ `studios.ts` + `navTree.ts` (một nguồn sự thật — sidebar và breadcrumb không
  bao giờ gọi cùng một trang bằng hai tên khác nhau). So khớp theo BIÊN đoạn (`/mon-hoc`
  không nuốt nhầm `/mon-hoc-abc`). 9 test ca biên: Trang chủ rỗng, tầng 1, môn học lồng dưới
  Phòng Học, trang con sâu vẫn lần đúng nhánh cha, tiêu đề trùng đốt cuối không nhân đôi,
  đường dẫn lạ không vỡ.
- **Mới `components/Breadcrumb.tsx`** — vẽ chuỗi đốt CÁC TẦNG CHA (KHÔNG vẽ đốt cuối — trang
  hiện tại), CHỈ hiện ở `lg:` trở lên, đặt phía trên dòng tiêu đề trang trong header.

## Sửa hướng đi giữa chừng (2 vòng CI đỏ, ghi lại để không lặp)

Bản đầu định **THAY HẲN** nút Back bằng breadcrumb ở desktop. CI bắt được 2 lỗi thật:

1. `e2e/programming-lesson.spec.ts` đỏ — nhiều trang truyền `onBack` RIÊNG để lùi ĐÚNG một
   bậc theo phân cấp của chính trang đó (vd bài học Lập trình lùi về đúng chặng, không phải
   P1). Breadcrumb chỉ biết cây route TĨNH, không biết logic đó — ẩn Back là mất hẳn hành vi
   lùi đúng bậc trên desktop. **Sửa: giữ nguyên nút Back ở mọi kích thước màn hình**, breadcrumb
   là phần BỔ SUNG, không thay thế.
2. `e2e/continue-viewing.spec.ts` đỏ vì `getByText` khớp NHẦM hai chỗ cùng chữ — đốt cuối của
   breadcrumb (trang hiện tại) luôn trùng chữ với tiêu đề trang render ngay bên dưới.
   **Sửa: `Breadcrumb.tsx` chỉ vẽ các TẦNG CHA** (`buildCrumbs(...).slice(0, -1)`), bỏ hẳn đốt
   cuối — tiêu đề trang đã đủ nói "đang ở trang nào".
3. `e2e/a11y.spec.ts` (trang chủ) đỏ vì title/subtitle bị ẩn ở desktop trong bản đầu, còn
   breadcrumb ở Trang chủ lại rỗng (không có tầng cha) — dòng chào "Hi there" biến mất khỏi
   header desktop. Đã hết vì (1) khôi phục title/subtitle luôn hiện.

## Chưa làm (cố ý — thuộc các lát cắt sau)

Chuẩn hoá bề rộng nội dung trang (lát B), cây điều hướng sâu hơn 1 tầng + flyout khi thu gọn
sidebar (lát C), bảng lệnh ⌘K tìm kiếm toàn app (lát D).

## Bằng chứng

`npm ci` (khớp lockfile) rồi: Build ✅ · Typecheck ✅ · Lint ✅ (0 cảnh báo) · Test ✅ 535 file
/ 10.863 test xanh (gồm `lib/breadcrumb.test.ts` mới, 9 test) · Budget ✅ (JS 128,19/140 kB,
CSS 17,02/20 kB — trong ngân sách) · E2E: chạy lại đủ 3 file đã đỏ trên CI
(`a11y.spec.ts -g "trang chủ"` 7/7, `continue-viewing.spec.ts` 2/2,
`programming-lesson.spec.ts -g "quay lại từ bài học"` 1/1) — tất cả xanh sau khi sửa.
