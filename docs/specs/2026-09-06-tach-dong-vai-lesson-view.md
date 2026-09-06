# Đặc tả ngắn: tách chế độ "Đóng vai" khỏi `LessonView.tsx` (1.016 dòng)

> Khuôn: `docs/templates/dac-ta-tinh-nang.md` (rút gọn). Trạng thái: **ĐÃ THI HÀNH 2026-09-06**
> theo yêu cầu "xử lý nốt" của người dùng sau khi PR #869 merge. Kết quả: `docs/changelog/0282`.

## 0. Một câu

Dời state + logic chế độ "Đóng vai" (10 `useState`, 4 ref, 11 hàm) từ `LessonView.tsx` sang hook
`useRolePlay`, và 3 khối JSX đóng vai sang 3 component nhỏ — **không đổi hành vi, không đổi DOM**.

## ① Phạm vi

**LÀM:**

- `lessons/useRolePlay.ts` — hook chứa nguyên khối "Chế độ Đóng vai" (từ `isPro` tới `useEffect`
  dọn dẹp). Thứ hook cần từ trình phát nhận qua tham số tường minh: `speedRef`, `voiceARef`,
  `voiceBRef`, `setActiveTurn`, `syncWord` (+ `lesson`, `isA`, `plan`, `userId`).
- `lessons/RolePlayToolbar.tsx` — nút "Đóng vai" + popover chọn vai / mời nâng cấp + nút "Dừng
  đóng vai".
- `lessons/RolePlayTurnControls.tsx` — nút ghi âm / dừng ghi âm / bỏ qua trong bong bóng "đến
  lượt bạn".
- `lessons/RolePlayFinishBar.tsx` — thanh dưới "Kết thúc & chấm điểm" / "Đọc lại".
- `UiNoise.design.test.ts`: khoá `animate-pulse` của `LessonView.tsx` 4 → 3, thêm
  `RolePlayTurnControls.tsx` 1 (tổng không đổi).

**KHÔNG LÀM:** đổi prompt chấm điểm, giới hạn lượt, class Tailwind, thứ tự nút; sửa lỗi có sẵn
(nếu phát hiện thì ghi nợ, không sửa trong đợt này).

## ② Vì sao là hook, không phải "state dời chỗ" như AppliedKnowledge

Chế độ Đóng vai và trình phát dùng chung `activeTurn`/`wordSync` (dòng đang đọc, sáng chữ) và
`speedRef`/`voiceRef`. Tách thành component con giữ state riêng sẽ **phải nhân đôi** các state đó
→ đổi hành vi. Hook giữ nguyên số state, nguyên chủ sở hữu (vẫn là `LessonView` render), chỉ đổi
file — nên đây vẫn là dời mã, bằng chứng chính là so DOM/ảnh, không phải so chuỗi.

## ③ Tiêu chí chấp nhận

- [x] `LessonView.tsx` ≤ 700 dòng; không file mới > 300 dòng.
- [x] Tầng 8b: `/bai-hoc` danh sách · mở bài thứ 3 · popover Đóng vai (gói Free → lời mời nâng
      cấp) · panel Cài đặt giọng, 1440px + 390px, trước/sau → giống hệt từng byte (ghi rõ nếu
      khác và vì sao).
- [x] Cổng: typecheck · lint · format · `npm test` · build.

## Nghiệm thu

- Ngày · PR: 2026-09-06 · PR #870.
- Ảnh Tầng 8b: xem `docs/changelog/0282`.
- Lệch phát hiện thêm: xem `docs/changelog/0282` mục "Phát hiện bên lề".
