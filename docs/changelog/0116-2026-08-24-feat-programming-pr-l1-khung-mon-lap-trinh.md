# feat(programming): PR-L1 — KHUNG môn Lập trình (2026-08-24)

Người dùng duyệt 2 đặc tả môn Lập trình ("ok triển khai") → thi hành PR-L1 theo khuôn 5 mảnh:

- **Khai báo môn:** manifest `programming` vào `subjectRegistry` (`core-learner`) — category
  stem, taxonomy `topic_hierarchy`, standardLevels `p1..p6`; tự hiện trong trang `/mon-hoc`.
- **Gói môn mới `packages/subject-programming/`** (workspace + project references + lockfile):
  `curriculum.ts` — khung 6 bậc P1–P6, 55 unit (đề cương + bước dự án trục T1 mỗi unit),
  3 track dự án (MVP chỉ mở T1); có test bất biến (id unit duy nhất, mỗi bậc có milestone).
- **Migration `0064_programming_schema.sql`** (idempotent, đã ghi README): schema
  `programming` — `learner_state` (bậc + track), `lesson_progress`, `project_files`
  (workspace dự án per-user, 256KB/file), `project_snapshots` (chốt theo milestone).
- **UI:** `/lap-trinh` (tổng quan P1–P6 + dự án xuyên suốt) + `/lap-trinh/:levelId` (trang
  bậc: chặng dự án + đề cương unit, nhãn "sắp mở"); redirect `/mon-hoc/programming`;
  nút riêng ở trang Môn học. 2 trang vào danh sách quét a11y A/AA + AAA — chạy thật
  20/20 xanh cả 5 theme (đã vá 2 lỗi tương phản theme sáng bằng `theme-light:accent-800`
  - `zinc-400`).
- Cổng: typecheck · lint 0 cảnh báo · format · test 5187/5187 · build app+packages+server.
- **Tiếp theo:** PR-L2 (sandbox Pyodide + editor) → PR-L3 (engine bài học 8 bước) →
  PR-L3b (workspace dự án) → PR-L4 (nội dung P1). Việc tay khi deploy: `npm run migrate:pg`.
