# 0212 — 2026-08-31 — Soạn nốt quiz cho 18/22 chặng còn lại của lộ trình "Kỹ Sư Trưởng AI"

> PR: (điền số PR khi mở) · Nhánh: `feat/quiz-18-chang-con-lai`

## Việc đã làm

Đợt 3 (`#771`) cố ý chỉ soạn quiz cho 4/22 chặng P1–P4 (chặng đầu mỗi giai đoạn:
`mathforcode-s1` · `data-s1` · `ai-s1` · `devops-s1`). Đợt này lấp nốt 18 chặng còn lại, đưa lộ
trình `principal-ai` lên **đủ 26/26 chặng có quiz** (22 P1–P4 + 4 P5 `principal-*` đã soạn ở
đợt 4) — không còn chặng nào của lộ trình thiếu bài kiểm.

18 chặng mới: `mathforcode-s2,s3,s4` · `algo-s1,s2` · `data-s2,s3` · `backend-s1,s2` ·
`ai-s2,s3,s4` · `devops-s2` · `security-s1,s2` · `architecture-s1,s2,s3,s4`. Tổng 90 câu hỏi
trắc nghiệm mới trong `packages/subject-programming/learningPaths/stageQuizzes.ts`, mỗi chặng
đúng 5 câu, đúng khuôn `StageQuizQuestion` sẵn có (không đổi hợp đồng dữ liệu, không migration).

**Cách soạn:** 4 agent song song, mỗi agent phụ trách một nhóm chặng, ĐỌC trực tiếp nội dung
thật của `topics` trong `packages/subject-programming/specializations/<hướng>.ts` trước khi
viết câu hỏi — tránh bịa kiến thức ngoài phạm vi chặng. Kết quả được tích hợp thủ công vào
đúng vị trí trong `STAGE_QUIZZES`.

## Quyết định kèm theo

- **Không còn chặng THẬT nào của `principal-ai` thiếu quiz** — điều này làm hai nhánh code cũ
  (`setPathStageProgress`/`submitStageQuiz` xử lý chặng "chưa có quiz") mất ví dụ dữ liệu thật
  để test. Đã sửa 2 test trong `pathProgressService.test.ts` dùng `vi.mock` giả lập
  `quizOfStage` trả rỗng CHỈ trong đúng 2 ca đó — vẫn canh được nhánh code, không phá cổng.
  Tương tự sửa `pathQuiz.test.ts` (đổi sang chặng `web-s1` không thuộc lộ trình, cùng trả 400)
  và `ProgrammingPathPage.test.tsx` (đổi khẳng định "có chặng chưa quiz" thành "mọi chặng đều
  có quiz").
- `stageQuizzes.test.ts`: `QUIZZED_STAGES` mở rộng từ 8 lên 26 chặng; ca "chưa soạn trả mảng
  rỗng" đổi từ `ai-s2` (nay đã có quiz) sang `web-s2` (chặng có thật, không thuộc lộ trình).

## Bằng chứng

- `npx vitest run packages/subject-programming` ✅ 49 file / 2728 test.
- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo).
- `npm test` (toàn repo) ✅ 526 file / 9222 test.
- `npm run build` ✅ · `npm run budget` ✅ không đổi (127,35/140kB JS, 16,79/18kB CSS — dữ liệu
  quiz chỉ nạp lười trong trang chặng, không vào initial bundle).

## Còn để ngỏ

Không còn — lộ trình "Kỹ Sư Trưởng AI" nay có quiz đầy đủ cho toàn bộ 26 chặng.
