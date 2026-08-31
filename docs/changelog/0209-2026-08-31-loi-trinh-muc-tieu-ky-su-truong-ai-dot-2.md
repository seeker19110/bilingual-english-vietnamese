# 0209 — 2026-08-31 — Lộ trình mục tiêu "Kỹ Sư Trưởng AI" (đợt 2/4: chẩn đoán + tiến độ)

Đặc tả: `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` (đợt 2, nối tiếp đợt 1 —
`docs/changelog/0207-*.md`, PR #766).

## Đã làm

1. **Chẩn đoán chọn điểm vào** (`packages/subject-programming/learningPaths/diagnostic.ts`):
   hàm thuần `suggestEntry(path, answers, questions)`, tất định, KHÔNG gọi AI. Bank 6 câu trắc
   nghiệm (`PRINCIPAL_AI_DIAGNOSTIC`), mỗi câu gắn với một giai đoạn P1–P4. Giai đoạn được coi
   là "vững" khi trả lời ĐÚNG HẾT câu tín hiệu của nó; không trả lời = coi như chưa vững (bảo
   thủ có chủ đích). Đề xuất điểm vào = chặng đầu của giai đoạn đầu tiên chưa vững; nếu mọi
   giai đoạn có chặng đều vững thì lùi về chặng CUỐI của giai đoạn có chặng gần nhất (P5 đang
   soạn nên đợt này luôn lùi về cuối P4).
2. **Tiến độ riêng của lộ trình** — bảng mới `programming.path_progress` (migration `0073`,
   khoá `(user_id, path_id, stage_id)`, trạng thái `skipped`/`in_progress`/`completed` **chỉ
   tốt lên**, bảo vệ bằng `array_position` ngay trong câu SQL upsert — không đọc-rồi-ghi hai
   bước). Service `pathProgressService.ts` đối chiếu `path_id`/`stage_id` với
   `learningPaths/registry.ts` trước khi ghi — id lạ hoặc chặng không thuộc lộ trình bị từ chối,
   không ghi rác.
3. **API** `GET/POST /api/programming/path-progress` (`apps/server/src/api/subjects/programming/
pathProgress.ts`, đăng ký trong `routes.ts`), `validateAuth()` bắt buộc, Zod validate body.
4. **Trang chẩn đoán** `/lap-trinh/lo-trinh/:pathId/chan-doan`
   (`ProgrammingPathDiagnostic.tsx`): 6 câu trắc nghiệm → hiện MỘT đề xuất điểm vào bằng TÊN
   CHẶNG (không phải điểm số) → người học **sửa tay được** bằng ô chọn trước khi lưu → lưu
   xuống DB, quay lại trang lộ trình. Chấm hoàn toàn ở client.
5. **Trang lộ trình** (`ProgrammingPathPage.tsx`) đọc thêm tiến độ riêng: chặng `completed` ở
   HOẶC tiến độ hướng HOẶC tiến độ lộ trình đều hiện dấu "đã xong"; chặng `skipped` (đề xuất từ
   chẩn đoán, chưa xong) hiện dấu riêng (biểu tượng lấp lánh) — phân biệt rõ với "đã học xong
   thật". Thêm nút vào trang chẩn đoán.

## Luật số 1 giữ nguyên (bắt buộc, có test canh)

Trang chẩn đoán KHÔNG BAO GIỜ hiện điểm số/phần trăm — chỉ hiện tên chặng đề xuất
(`ProgrammingPathDiagnostic.test.tsx` canh bằng regex chặn `\d+%` và `\d+/\d+ (điểm|câu đúng)`).
Đây là công cụ CHỌN VIỆC, người học luôn sửa được đề xuất trước khi lưu.

## Điểm lệch so với đặc tả (ghi rõ, không giấu)

1. **Vị trí handler:** đặc tả nháp ghi `api/learning/pathProgress.ts`; thi hành đặt tại
   `api/subjects/programming/pathProgress.ts` — khớp đúng vị trí `specialization.ts` đã có
   trong repo (mọi handler môn Lập trình nằm cùng thư mục).
2. **Phạm vi chẩn đoán:** đặc tả gốc mô tả "5–7 câu trắc nghiệm + 2 bài code chấm bằng Sim
   sẵn có". Đợt này dùng THUẦN 6 câu trắc nghiệm (đủ 1 tín hiệu/giai đoạn P1–P4), bỏ phần chấm
   code qua Sim để giữ phạm vi PR gọn. `suggestEntry` không phụ thuộc nguồn câu hỏi nên đợt sau
   thêm câu hỏi dạng code không phải viết lại logic suy điểm vào.

## Cố ý KHÔNG làm (đúng phạm vi đợt 2, còn lại là đợt 3/4)

Quiz sau chặng, kho artifact cá nhân, Companion kiểm hiểu (đợt 3); nội dung P5 "Tầm trưởng"
(đợt 4).

## Bằng chứng

- `npm run typecheck` ✅ (4 project) · `npm run lint` ✅ (0 cảnh báo) · `npx vitest run` ✅
  518 file / 8763 test (43 ca mới: 7 `diagnostic.test.ts` + 10 `pathProgressService.test.ts` +
  7 `pathProgress.test.ts` (handler) + 4 `ProgrammingPathDiagnostic.test.tsx` + cập nhật
  `routes-registered.test.ts`/`migrations-readme-coverage.test.ts`) · `npm run build` ✅
  (dhcb + server + hub) · `npm run budget` ✅ JS 127,33/140kB (91,0%) · CSS 16,79/18kB (93,3%) ·
  coverage branches 90,15/90 (dư 0,15 — MỎNG, đã ghi nhận từ đợt 1, chưa xấu thêm).
- `npm run codemap -- impact` cho `App.tsx`, `ProgrammingPathPage.tsx`, `routes.ts`: chỉ lan
  tới `main.tsx`/`server.ts`/test của chính file đó — không phá tính năng khác.
