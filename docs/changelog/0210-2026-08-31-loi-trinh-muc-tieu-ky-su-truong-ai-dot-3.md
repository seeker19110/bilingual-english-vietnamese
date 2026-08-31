# 0210 — 2026-08-31 — Lộ trình mục tiêu "Kỹ Sư Trưởng AI" (đợt 3/4: quiz + artifact + Companion)

Đặc tả: `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` (đợt 3, nối tiếp đợt 2 —
`docs/changelog/0209-*.md`, PR #769).

## Đã làm

1. **Quiz sau chặng** (`learningPaths/stageQuizzes.ts` + `quizOfStage()`): ngân hàng câu hỏi
   cho 4 chặng — chặng ĐẦU của mỗi giai đoạn P1–P4 của lộ trình (`mathforcode-s1` · `data-s1` ·
   `ai-s1` · `devops-s1`), 5 câu/chặng, bám sát `topics` module thật. Phạm vi thu hẹp có ghi
   chú (18/22 chặng còn lại trả `quizOfStage() === []` — UI nói rõ "chưa có bài kiểm", không
   hứa suông, đúng tiền lệ `stageUnits.ts`).
2. **Chấm ở SERVER, không tin client**: `submitStageQuiz()` (`pathProgressService.ts`) chấm
   bằng đúng ngân hàng câu hỏi dùng cho UI; đạt ≥ 80% (4/5) mới ghi `completed`. Thêm guard:
   `setPathStageProgress()` từ chối thẳng mọi yêu cầu ghi `status: 'completed'` cho chặng ĐÃ
   có quiz qua đường ghi hàng loạt cũ (chẩn đoán đợt 2) — chặn việc client tự gửi "hoàn thành"
   để bỏ qua bài kiểm.
3. **Kho artifact cá nhân** — bảng mới `programming.path_artifacts` (migration `0074`, khoá
   `id` vì là NHẬT KÝ nộp bài, không phải trạng thái hiện tại) + `pathArtifactService.ts`
   (create/list/delete, chỉ của chính người dùng, đối chiếu `phase_id` với
   `learningPaths/registry.ts`). KHÔNG chấm bằng AI (quyết định đặc tả, chống phình phạm vi).
4. **API mới**: `POST /api/programming/path-quiz` (chấm quiz), `GET/POST/DELETE
/api/programming/path-artifact` (kho artifact) — cả hai `validateAuth()` bắt buộc, Zod
   validate; url artifact bắt buộc `http(s)://`.
5. **Companion kiểm hiểu** — prompt mới `apps/dhcb/src/prompts/pathCheckPrompt.ts` (KHÔNG
   sửa `feedbackPrompt.ts` của môn Lập trình — `git diff` xác nhận sạch, không cần chạy
   `eval:code-feedback`). Một lượt hỏi-đáp TUỲ CHỌN sau khi đạt quiz, qua `/api/agent` mode
   `chat` hiện hành (đếm lượt Free/Pro như Chat tổng hợp, không thêm mode mới, không lưu lại
   nội dung hội thoại).
6. **UI**: `PathStageQuiz.tsx` (quiz inline dưới mỗi chặng có bài kiểm, làm lại không giới
   hạn, không lưu điểm cũ khi mở lại) + `PathArtifactVault.tsx` ("Hồ sơ bằng chứng" cuối trang
   lộ trình, chỉ cho nộp ở giai đoạn P1–P4 đã có nội dung) — gắn vào `ProgrammingPathPage.tsx`.

## Luật số 1 & bất biến giữ nguyên (có test canh)

- Server chấm điểm, client không tự tính — `pathQuiz.test.ts` xác nhận trả lời sai hết không
  chạm DB, trả lời đúng hết ghi `completed` theo `user_id` của TOKEN chứ không theo body.
- `feedbackPrompt.ts` và eval baseline KHÔNG đổi (diff sạch — kiểm thủ công trước khi commit).
- Quiz làm lại không giới hạn, không phạt — `PathStageQuiz.test.ts` (SSR) xác nhận trạng thái
  đóng ban đầu không lộ điểm số nào.

## Cố ý KHÔNG làm (đúng phạm vi đợt 3, còn lại là đợt 4)

Nội dung giai đoạn P5 "Tầm trưởng" (vận hành AI, agent/MCP, ADR, dẫn dắt) — đợt 4, đặc tả con
riêng từng chặng trước khi soạn.

## Bằng chứng

- `npm run typecheck` ✅ (4 project) · `npm run lint` ✅ (0 cảnh báo) · `npx vitest run` ✅
  525 file / 8817 test (54 ca mới: 6 `stageQuizzes.test.ts` + 9 ca mới trong
  `pathProgressService.test.ts` (guard quiz + `submitStageQuiz`) + 9 `pathArtifactService.test.ts`
  - 6 `pathQuiz.test.ts` (handler) + 10 `pathArtifact.test.ts` (handler) + 5
    `pathCheckPrompt.test.ts` + 2 `PathStageQuiz.test.tsx` + 2 `PathArtifactVault.test.tsx` + 3 ca
    mới trong `ProgrammingPathPage.test.tsx` + cập nhật `routes-registered.test.ts`) ·
    `npm run build` ✅ (dhcb + server + hub) · `npm run budget` ✅ JS 127,29/140kB (90,9%) · CSS
    16,79/18kB (93,3%) · coverage branches 90,15/90 (dư 0,15 — MỎNG, không xấu thêm ở đợt này).
- `npm run codemap -- impact` cho `pathProgressService.ts`, `ProgrammingPathPage.tsx`,
  `routes.ts`: chỉ lan tới test của chính file + `server.ts`/`main.tsx` — không phá tính năng
  khác.
