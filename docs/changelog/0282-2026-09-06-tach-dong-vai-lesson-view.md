# 0282 — 2026-09-06 — Tách chế độ "Đóng vai" khỏi `LessonView.tsx` (1.016 → 699 dòng)

**PR:** #TBD · **Loại:** `refactor(english)` · **Nhánh:** `claude/phuong-an-a-rgkgoc` ·
**Đặc tả ngắn:** `docs/specs/2026-09-06-tach-dong-vai-lesson-view.md`

## Việc đã làm

Phần "còn dở có chủ ý" của `0280`: `LessonView.tsx` vẫn 1.016 dòng vì chế độ Đóng vai lồng chung
state với trình phát. Người dùng yêu cầu "xử lý nốt" → viết đặc tả ngắn rồi tách **theo hook**
(không phải component giữ state riêng, xem lý do ở đặc tả §②):

| File (`apps/dhcb/src/pages/subjects/english/lessons/`) | Dòng | Nội dung                                                                                     |
| ------------------------------------------------------ | ---- | -------------------------------------------------------------------------------------------- |
| `useRolePlay.ts` (mới)                                 | 290  | 10 `useState` + 4 ref + 11 hàm đóng vai, nguyên văn; nhận ref/hàm của trình phát qua tham số |
| `RolePlayToolbar.tsx` (mới)                            | 109  | nút Đóng vai + popover chọn vai / mời nâng cấp + nút Dừng đóng vai                           |
| `RolePlayTurnControls.tsx` (mới)                       | 58   | nút ghi âm / dừng ghi âm / bỏ qua trong bong bóng "đến lượt bạn"                             |
| `RolePlayFinishBar.tsx` (mới)                          | 50   | thanh dưới "Kết thúc & chấm điểm" / "Đọc lại"                                                |
| `LessonView.tsx`                                       | 699  | trình phát + karaoke; gọi `useRolePlay` và gắn 3 component trên                              |

Không đổi: prompt chấm, giới hạn lượt, class Tailwind, thứ tự nút, số state (vẫn do `LessonView`
sở hữu qua hook → hành vi y hệt). `UiNoise.design.test.ts`: khoá `animate-pulse` `LessonView.tsx`
4 → 3 + `RolePlayTurnControls.tsx` 1 (tổng không đổi).

## Bằng chứng

- **Tầng 8b — `/bai-hoc` 1440px + 390px, trước/sau, 4 màn mỗi cỡ** (danh sách · mở bài thứ 3 ·
  popover Đóng vai · panel Cài đặt giọng): **7/8 giống hệt từng byte**; ảnh `1440-lesson` /
  `1440-voice` lệch 61 px ở **cột danh sách bên trái** (ngoài `LessonView`), và cùng 61 px đó xuất
  hiện giữa hai lần chạy cùng mã → nhiễu render. Để ảnh so được phải cố định `Math.random`
  (giọng nhân vật chọn ngẫu nhiên bởi `pickRandomVoice`) và chờ popover thật sự hiện — lần chụp
  đầu không làm vậy nên lệch 53.000 px giả.
- `npm run codemap`: `LessonView` chỉ được `Lessons.tsx` import → không đổi.
- Cổng: typecheck ✅ · lint ✅ · format ✅ · `npm test` ✅ 574 file / 12.162 test · build ✅.

## Phát hiện bên lề (KHÔNG sửa trong đợt này — ghi nợ)

- **Popover "Đóng vai" tràn ra ngoài mép trái ở 390px** (`absolute right-0 w-64` trong một
  `relative` nhỏ nằm ở nửa trái thanh điều khiển) — phần chữ "Chọn vai bạn muốn đọc…" bị cắt. Có ở
  cả bản trước (ảnh trước/sau giống hệt) → lỗi sẵn có, không do tách. Đề xuất sửa riêng: đổi
  `right-0` thành `left-0` hoặc neo theo viewport khi màn hẹp; phải chụp lại Tầng 8b.
