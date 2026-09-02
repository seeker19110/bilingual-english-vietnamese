# 0230 — Header desktop: bỏ nút Back, thay bằng breadcrumb

- **Ngày:** 2026-09-02
- **Nhánh:** `claude/redesign-desktop-ui-ux-t838bm`
- **Bối cảnh:** đợt 1/4 của việc nghiên cứu + thiết kế lại UI/UX desktop (mỗi lát cắt một
  PR riêng — xem các đợt tiếp theo trong changelog cho lát B/C/D).

## Vấn đề

Header desktop (component `Layout.tsx`, dùng chung mọi trang) chỉ có nút "Back" trả lời được
CÓ MỘT câu: "bấm vào thì đi đâu" (và thường là văng thẳng về Trang chủ, không lùi đúng một
bậc phân cấp). Nó không trả lời được câu quan trọng hơn khi lặn sâu vào một bài học/chặng
học: "tôi đang đứng ở đâu trong cây điều hướng". DesktopSidebar đã có cây phân cấp
(`lib/navTree.ts`, đợt #809) nhưng header phía trên nội dung không phản ánh lại cây đó.

## Đã làm

- **Mới `apps/dhcb/src/lib/breadcrumb.ts`** — hàm THUẦN `buildCrumbs(pathname, currentLabel?)`
  sinh đường đi kiểu "Trang chủ › Phòng Học & STEM › Toán học" từ đường dẫn hiện tại. Nhãn
  lấy lại từ `studios.ts` + `navTree.ts` (một nguồn sự thật — sidebar và breadcrumb không
  bao giờ gọi cùng một trang bằng hai tên khác nhau). So khớp theo BIÊN đoạn (`/mon-hoc`
  không nuốt nhầm `/mon-hoc-abc`). Đốt cuối luôn là trang hiện tại, không phải liên kết.
  9 test ca biên: Trang chủ rỗng, tầng 1, môn học lồng dưới Phòng Học, trang con sâu vẫn lần
  đúng nhánh cha, tiêu đề trùng đốt cuối không nhân đôi, đường dẫn lạ không vỡ.
- **Mới `components/Breadcrumb.tsx`** — vẽ chuỗi đốt, `aria-current="page"` ở đốt cuối,
  CHỈ hiện ở `lg:` trở lên (mobile bề ngang không đủ, giữ nguyên trải nghiệm cũ).
- **`components/Layout.tsx`** — nút Back và logo "Đồng Hành" trong header nay `lg:hidden`
  (desktop đã có breadcrumb + sidebar có sẵn logo, hiện hai lần là thừa). Vùng
  title/subtitle cũ đổi thành breadcrumb ở desktop, giữ nguyên ở mobile.

## Chưa làm (cố ý — thuộc các lát cắt sau)

Chuẩn hoá bề rộng nội dung trang (lát B), cây điều hướng sâu hơn 1 tầng + flyout khi thu gọn
sidebar (lát C), bảng lệnh ⌘K tìm kiếm toàn app (lát D).

## Bằng chứng

`npm ci` (khớp lockfile) rồi: Build ✅ · Typecheck ✅ · Lint ✅ (0 cảnh báo) · Test ✅ 535 file
/ 10.863 test xanh (gồm `lib/breadcrumb.test.ts` mới, 9 test) · Budget ✅ (JS 128,18/140 kB,
CSS 17,02/20 kB — trong ngân sách).
