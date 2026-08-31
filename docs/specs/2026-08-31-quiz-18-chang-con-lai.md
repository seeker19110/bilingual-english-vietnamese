# Đặc tả bổ sung: soạn nốt quiz cho 18/22 chặng còn lại (P1–P4, lộ trình "Kỹ Sư Trưởng AI")

> Ngày: 2026-08-31 · Đặc tả gốc: `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` (đợt 3) —
> đợt 3 cố ý chỉ soạn 4/22 chặng đầu mỗi giai đoạn ("đúng tiền lệ phủ từng phần có ghi chú của
> `stageUnits.ts`"). Đặc tả này lấp nốt 18 chặng còn lại, KHÔNG đổi hợp đồng dữ liệu.

## Một câu

Thêm 18 mục vào `STAGE_QUIZZES` (`learningPaths/stageQuizzes.ts`) — mỗi chặng đúng 5 câu, đúng
khuôn `StageQuizQuestion` sẵn có — cho các chặng P1–P4 của `principal-ai` chưa có quiz.

## Phạm vi

**LÀM:** soạn quiz cho đúng 18 chặng: `mathforcode-s2,s3,s4` · `algo-s1,s2` · `data-s2,s3` ·
`backend-s1,s2` · `ai-s2,s3,s4` · `devops-s2` · `security-s1,s2` · `architecture-s1,s2,s3,s4`.
Nội dung câu hỏi PHẢI bám sát `topics` của các `SpecModule` thật trong
`packages/subject-programming/specializations/<hướng>.ts` (không bịa kiến thức ngoài phạm vi
chặng). Cập nhật `QUIZZED_STAGES` trong `stageQuizzes.test.ts` để test canh phủ đủ 22 chặng.

**KHÔNG LÀM:** không đổi kiểu `StageQuizQuestion`, không đổi luật chấm (≥4/5 mới `completed`),
không đụng 4 chặng P5 `principal-*`, không migration, không AI.

## Tiêu chí chấp nhận

- Đúng 22 chặng có quiz (4 cũ + 18 mới), mỗi chặng đúng 5 câu, 4 lựa chọn, `answerIndex` 0–3.
- id câu hỏi duy nhất toàn ngân hàng, đúng tiền tố `<stageId>-qN`.
- Mọi `stageId` tra được qua `resolveStage()`, thuộc `principal-ai`.
- `npm run typecheck && npm run lint && npx vitest run packages/subject-programming/learningPaths`.

## Nghiệm thu

- Lệnh đã chạy + kết quả:
- Còn để ngỏ:
