# 0198 — Tầng `courses/` + khoá Git chương C1 (PR 2/4 khoá Git)

PR 2 trong 4 của kế hoạch tách Git & GitHub thành khoá học riêng
(`docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md`). Nối tiếp PR 1
(`0197-2026-08-30-git-sim-hoan-tac-remote-nang-cao.md`, đã merge — hạ tầng `gitSim.ts`).

## Đã làm

- Thêm tầng **khoá ngắn** `packages/subject-programming/courses/` — tầng thứ ba của môn, song
  song `curriculum.ts` (xương sống P1–P6) và `specializations/` (13 hướng chuyên sâu). Khoá cắt
  ngang bậc, học được độc lập, không đòi hỏi đã học xong bậc nào trước:
  - `types.ts` — `ShortCourse` / `CourseChapter`. Luật quan trọng nhất: chương chỉ **tham chiếu**
    id bài đã tồn tại trong `lessons.ts`, không bao giờ nhúng nội dung.
  - `git.ts` — khoá `git`, **chỉ có chương C1** ở PR này: `title: 'Nền móng'`, `lessonIds:
['p3-u10-l1', 'p3-u10-l2']` — hai bài Git đã có của P3, **dùng lại nguyên vẹn bằng id**.
  - `registry.ts` — `SHORT_COURSES` + `getShortCourse(id)`.
  - `courses.test.ts` — cổng chấm, gồm nhóm test **KHÔNG HỒI QUY** canh riêng: `p3-u10` vẫn có
    đúng 2 bài id không đổi, và bài mà khoá Git trỏ tới là **cùng một đối tượng** (`toBe`, không
    phải `toEqual`) với bài trong xương sống P3 — chứng minh đây là tham chiếu một nguồn sự
    thật, không phải bản sao.
- Bốn chương còn lại (C2 Nhìn thấy việc mình làm → C5 Nâng cao, 14 bài mới) để dành cho PR 4 —
  cố ý không khai chương rỗng ở PR này.

## KHÔNG LÀM (đúng phạm vi PR 2 theo spec)

- Không đụng `curriculum.ts`, không thêm unit/bậc mới.
- Không có route/trang giao diện — đó là PR 3.
- Không đụng `lessonTypes.ts`/regex `lessonId` ở API — không gian id mới `git-uN-lM` chỉ cần
  từ PR 4 trở đi.

## Bằng chứng kiểm chứng

- `npx vitest run packages/subject-programming` ✅ 1634/1634 (37 file, gồm 7 ca mới ở
  `courses.test.ts`).
- `npm run typecheck` ✅ · `npx eslint packages/subject-programming/courses --max-warnings 0` ✅
  · `npm run build` (client + server + hub) ✅.
- Ca không hồi quy `getLessonsByUnit('p3-u10')` vẫn trả đúng `['p3-u10-l1', 'p3-u10-l2']`, và
  `getLesson('p3-u10-l1') === getLessonsByUnit('p3-u10')[0]` — bằng id lẫn tham chiếu đối
  tượng, hai bài Git cũ không hề bị đụng tới.

## Việc tiếp theo (PR 3/4)

Trang `/lap-trinh/khoa/:courseId` + route + lối vào từ `ProgrammingHome` — giao diện cho tầng
khoá ngắn, sau khi dữ liệu đã đứng ở PR này.
