# Đặc tả — Bài học 8 bước thật cho chặng architecture-s3

**Trạng thái: Approved for implementation** (nội dung học liệu tĩnh, yêu cầu trực tiếp trong
phiên làm việc này — tiếp mạch soạn bài 8 bước cho các chặng chuyên sâu còn trống, ngay sau
`architecture-s2`).

## Phạm vi

Soạn nội dung bài học 8 bước thật cho chặng `architecture-s3` ("Đặc tả thi hành được & nghiệm
thu code mình không tự gõ", hướng chuyên sâu Kiến trúc) — trước đây chặng này mới có metadata
module ở `packages/subject-programming/specializations/architecture.ts` (4 module: m1 Đặc tả
kín · m2 Giao việc cho AI hoặc cho người mới · m3 Nghiệm thu · m4 Sổ quyết định ADR), chưa có
bài học nào nên học viên bấm "Vào học" gặp trang trắng.

**KHÔNG làm:** không đổi UI/route, không đổi schema DB, không đụng luồng auth/thanh toán, không
sửa `PROGRESS.md`, không đụng chặng nào khác ngoài `architecture-s3` (các chặng `data-s3` và
`mobile-s1` do đợt việc song song khác phụ trách).

## Điểm chạm file

- Mới: `packages/subject-programming/lessons/p6u123.ts`, `p6u124.ts`, `p6u125.ts` (6 bài học,
  làn `typescript`, đúng `ProgrammingLesson`/`LessonSchema`).
- Đăng ký: `packages/subject-programming/lessons.ts` (import + spread),
  `packages/subject-programming/curriculum.ts` (3 entry unit `p6-u123..u125`),
  `packages/subject-programming/specializations/stageUnits.ts` (`'architecture-s3': [...]`).
- Mới: `docs/specs/2026-08-31-bai-hoc-chang-s3-huong-kien-truc.md` (file này) +
  một file nhật ký trong `docs/changelog/`.

## Hợp đồng vào-ra

- Input: nội dung 4 module có sẵn trong `specializations/architecture.ts` (chặng
  `architecture-s3`), khuôn bài học ở `packages/subject-programming/lessonTypes.ts`, tiền lệ
  soạn bài ở `lessons/p6u108.ts` và `lessons/p6u117.ts`.
- Output: 3 unit mới trong `PROGRAMMING_LEVELS` (bậc P6), mỗi unit 2 bài học hợp lệ theo
  `LessonSchema` (hook → theory → workedExample → predict → parsons → make/testCases → homework
  → SRS card), ánh xạ `architecture-s3` → 3 unit qua `stageUnits.ts`.
- Ánh xạ module → unit: `p6-u123` = m1 (đặc tả kín), `p6-u124` = m2 (giao việc cho AI/người
  mới), `p6-u125` gộp m3+m4 (nghiệm thu + sổ quyết định ADR).

## Tiêu chí chấp nhận đo được

- `npx vitest run packages/subject-programming` xanh 100% — gồm `lessonsTs.test.ts` (chạy tsc
  thật cho mọi bài mới), `lessons.test.ts`, `curriculum.test.ts`,
  `specializations/stageUnits.test.ts`, `srsCards.test.ts`, `lessonMarkdown.test.ts`.
- `npm run typecheck`, `npm run lint` (max-warnings 0), `npm run build`, `npm test` sạch.
- `npx prettier --check` sạch trên mọi file đã chạm.
- Đủ 4 module gốc được phủ nội dung (không bỏ sót module nào), mỗi bài có đủ 8 bước.

## Bất biến + test canh

- `lessonsTs.test.ts` canh: mọi bài `typescript` phải biên dịch bằng tsc thật (strict) + chạy
  `node:vm` không lỗi; code mẫu đạt HẾT test-case; đáp án Predict khớp output thật và **không**
  lựa chọn sai nào lại khớp output.
- `lessons.test.ts` canh: `unitId` phải tồn tại trong `curriculum.ts`, `id` bài phải bắt đầu
  bằng `unitId`, không trùng id.
- `stageUnits.test.ts` canh: mọi unit khai trong `SPEC_STAGE_UNITS` phải tồn tại thật.
- `srsCards.test.ts` canh: mỗi thẻ hỏi đúng một ý, đáp án ≥ 40 ký tự, không lộ đáp án trong đề.
- `lessonMarkdown.test.ts` canh: lý thuyết không chứa mã inline có dấu so sánh làm hỏng bộ dựng.

## Quy ước dự án

Theo tiền lệ `web-s1`, `backend-s2/s3/s4`, `architecture-s2`: gộp module khi hai module cùng
trả lời một câu hỏi sư phạm — ở đây m3 "Nghiệm thu" + m4 "Sổ quyết định (ADR)" gộp vào
`p6-u125`, vì cả hai cùng trả lời "làm sao GIỮ ĐÚNG kết quả của code mình không tự gõ" (nghiệm
thu giữ đúng ở lượt này, ADR giữ đúng qua các lượt sau). Mô phỏng khái niệm bằng hàm thuần
TypeScript tất định, không dùng thư viện ngoài. Comment trong code ví dụ viết không dấu theo
đúng tiền lệ các bài `typescript` đã có; phần giảng viết tiếng Việt có dấu.

## Nghiệm thu

Xem file nhật ký tương ứng trong `docs/changelog/` cho bằng chứng kiểm chứng đầy đủ
(build/typecheck/lint/test) và chi tiết 6 bài học đã soạn.
