# 0283 — 2026-09-06 — Popover "Đóng vai" không còn tràn ra ngoài màn hình hẹp

**PR:** #871 · **Loại:** `fix(english)` · **Nhánh:** `claude/phuong-an-a-rgkgoc`

## Việc đã làm

Trả nợ ghi ở `0282`: popover chọn vai (rộng `w-64` = 256px) neo cứng `right-0` dưới nút "Đóng
vai", mà nút này nằm nửa TRÁI thanh điều khiển → ở 390px popover trôi ra ngoài mép trái, cắt mất
chữ "Chọn vai bạn muốn đọc…". Lỗi có ở **hai chỗ cùng mẫu**: `lessons/RolePlayToolbar.tsx`
(trang Bài hội thoại) và `DialogueView` trong `components/CefrLessonViews.tsx` (Lộ trình CEFR).

Sửa thử `left-0` cứng → ở 768px (nút đã trôi sang phải vì thanh điều khiển gói hàng khác) lại
tràn mép PHẢI (đo: x=549, mép phải 805 > 768). Vậy phải **quyết theo vị trí thật của nút lúc bấm**:

- `apps/dhcb/src/lib/popoverAlign.ts` (mới): `shouldAlignPopoverRight(anchorLeft, viewportWidth,
popoverWidth = 256)` — hàm thuần theo số, `true` khi mở về bên phải sẽ tràn; và
  `shouldAlignPopoverRightFor(anchor)` đọc `getBoundingClientRect` + `window.innerWidth`.
- Hai toolbar: thêm một `useState` phía neo, gán lúc `onClick` từ `e.currentTarget`, class
  `right-0`/`left-0` theo đó. Không đổi gì khác (chữ, kích cỡ, hiệu ứng).
- `popoverAlign.test.ts`: 6 ca, gồm 3 số đo thật (390/768/1440) và ca biên "vừa khít mép".

## Bằng chứng

- Đo bằng Playwright (`boundingBox` của popover chọn vai), **sau sửa**:

  | Viewport | x trái | mép phải | Nằm trong màn    |
  | -------- | ------ | -------- | ---------------- |
  | 390      | 29     | 285      | ✅               |
  | 640      | 29     | 285      | ✅               |
  | 768      | 382    | 638      | ✅ (đã neo phải) |
  | 1024     | 761    | 1017     | ✅ (đã neo phải) |
  | 1440     | 1080   | 1336     | ✅               |

  Trước sửa (ảnh Tầng 8b của `0282`, cùng mã cũ): 390px popover bắt đầu ở x ≈ −131.

- `DialogueView` (CefrLevelPage) dùng đúng cùng helper, cùng class; không chụp riêng vì luồng mở
  hội thoại CEFR cần dữ liệu tiến độ — rủi ro thấp vì thay đổi là một class có điều kiện.
- `npm run codemap -- impact CefrLessonViews.tsx` → `CefrLevelPage.tsx` (chỉ dùng, không đổi API).
- Cổng: typecheck ✅ · lint ✅ · format ✅ · `npm test` ✅ · build ✅ (số trong mô tả PR).
