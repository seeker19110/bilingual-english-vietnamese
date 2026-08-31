# 0204 — Đổi tiền tố route tầng khoá ngắn: `/khoa/` → `/khoa-hoc/`

Người dùng yêu cầu: đổi `/lap-trinh/khoa/hermes` thành `/lap-trinh/khoa-hoc/hermes`. Route
của tầng khoá ngắn dùng CHUNG một mẫu tham số `:courseId` cho cả hai khoá đã có (`git`,
`hermes`), nên đổi tiền tố áp dụng cho cả hai — không có cách tách riêng URL theo khoá mà
không nhân đôi route.

## Đã làm

- `apps/dhcb/src/App.tsx` — route `/lap-trinh/khoa/:courseId` → `/lap-trinh/khoa-hoc/:courseId`.
- `apps/dhcb/src/pages/subjects/programming/ProgrammingHome.tsx` — nút vào khoá điều hướng
  sang tiền tố mới.
- `apps/dhcb/src/pages/subjects/programming/ProgrammingCoursePage.tsx` — cập nhật comment đầu
  file (không đổi logic — trang không tự tham chiếu URL của chính nó).
- `packages/subject-programming/courses/types.ts` — cập nhật doc-comment `ShortCourseId`.
- `e2e/programming-course.spec.ts` — toàn bộ `page.goto`/`toHaveURL` đổi sang `/khoa-hoc/`.
- `e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts` — URL quét a11y của khoá Git đổi theo.

## KHÔNG làm

- Không thêm redirect từ `/khoa/` cũ sang `/khoa-hoc/` mới — hai khoá vừa merge trong ngày
  (#751–#754), chưa có traffic/backlink thật cần giữ tương thích ngược.
- Không sửa nội dung các changelog/đặc tả LỊCH SỬ đã ghi route cũ (`0198`–`0203`,
  `2026-08-30-khoa-hoc-thuc-hanh-github.md`, `2026-08-31-khoa-dieu-phoi-ai-van-phong.md`) —
  đó là ghi chép tại thời điểm PR, sửa lại là viết lại lịch sử.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npm test` ✅ 8187/8187 (507 file)
  · `npm run build` ✅.
- `npx playwright test e2e/programming-course.spec.ts` ✅ **7/7** chạy thật trong trình
  duyệt trên route mới (không chỉ đọc code) — cả khoá Git và Hermes vào thẳng, bấm bài đúng,
  lối vào từ trang môn.
- Quét lại toàn repo: không còn tham chiếu `/lap-trinh/khoa/` (thiếu `-hoc`) trong `apps/`,
  `packages/`, `e2e/`.
