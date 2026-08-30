# 0199 — Trang khoá ngắn `/lap-trinh/khoa/:courseId` (PR 3/4 khoá Git)

PR 3 trong 4 của kế hoạch tách Git & GitHub thành khoá học riêng
(`docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md`). Nối tiếp PR 2
(`0198-2026-08-30-khoa-git-tang-courses-c1.md`, đã merge — tầng dữ liệu `courses/`).

## Đã làm

- `apps/dhcb/src/pages/subjects/programming/ProgrammingCoursePage.tsx` — trang một khoá ngắn.
  Theo đúng bố cục `ProgrammingLevelPage.tsx` (tiêu đề + can-do → dải tiến độ → danh sách) để
  quen tay, khác ở chỗ khoá không có unit riêng: mỗi chương liệt kê bài trực tiếp qua
  `chapter.lessonIds` (tra bằng `getLesson()`, không phải `getLessonsByUnit()`). Mã khoá lạ →
  `<Navigate to="/lap-trinh" replace />`, không render trang trắng.
- `App.tsx` — route `/lap-trinh/khoa/:courseId`, đặt **trước** `/lap-trinh/:levelId` (cùng lý do
  `/lap-trinh/huong` đã đặt trước: `'khoa'` không được để lọt vào route param `:levelId`).
- `ProgrammingHome.tsx` — thêm khối "Khoá ngắn" (④b, giữa ba nút tắt và lộ trình 6 bậc), liệt kê
  `SHORT_COURSES` — hiện chỉ có khoá `git`. Khối tự ẩn nếu `SHORT_COURSES` rỗng (không hứa suông).
- `e2e/programming-course.spec.ts` (mới) — 4 ca: vào thẳng khoá Git **chưa học bậc nào** vẫn học
  được ngay (đúng tiêu chí ④ trong spec), mã khoá lạ về trang tổng quan, bấm bài dẫn đúng URL bài
  học đã dùng lại từ P3, và lối vào từ trang môn.
- Thêm `/lap-trinh/khoa/git` vào cả hai danh sách quét a11y bắt buộc
  (`e2e/a11y.spec.ts` AA/A + `e2e/a11y-aaa.spec.ts` AAA nội dung/tiêu đề) — cổng CI, không có
  ngoại lệ theo CLAUDE.md mục 4.5.

## Bằng chứng kiểm chứng

- `npx playwright test e2e/programming-course.spec.ts` ✅ 4/4.
- `npx playwright test e2e/a11y.spec.ts --grep "lap-trinh/khoa/git"` ✅ 5/5 (cả 5 theme, 0 vi
  phạm A/AA).
- `npx playwright test e2e/a11y-aaa.spec.ts --grep "lap-trinh/khoa/git"` ✅ 5/5 (cả 5 theme, 0 vi
  phạm AAA nội dung/tiêu đề).
- `npx vitest run` (packages/subject-programming + apps/dhcb/src) ✅ 4068/4068 (153 file).
- `npm run typecheck` ✅ (gồm `tsconfig.e2e.json`) · lint 0 cảnh báo · `npm run build` (client +
  server + hub) ✅.
- `npm run budget`: Initial JS 125.29/140 kB (dùng 89.5%, còn 14.71 kB) · Initial CSS 16.36/18 kB
  (dùng 90.9%, còn 1.64 kB) — trang mới `lazyWithRetry` nên gần như không cộng vào bundle ban đầu.
- `npm run codemap -- impact apps/dhcb/src/App.tsx`: 1 điểm chạm (`main.tsx`, chỉ render `App`) —
  không cần sửa gì thêm.

## Việc tiếp theo (PR 4/4)

14 bài mới (chương C2 Nhìn thấy việc mình làm → C5 Nâng cao), nới regex không gian id
`git-uN-lM` ở `lessonTypes.ts` + `progress.ts` + `feedback.ts` — khối nội dung lớn nhất, đi
cuối theo bảng nghiệm thu trong spec.
