# Đặc tả — Bài học 8 bước thật cho chặng architecture-s2

**Trạng thái: Approved for implementation** (nội dung học liệu tĩnh, yêu cầu trực tiếp trong
phiên làm việc này — tiếp mạch soạn bài 8 bước cho các chặng chuyên sâu còn trống).

## Phạm vi

Soạn nội dung bài học 8 bước thật cho chặng `architecture-s2` ("Hợp đồng & mô hình miền", hướng
chuyên sâu Kiến trúc) — trước đây chặng này mới có metadata module ở
`packages/subject-programming/specializations/architecture.ts` (4 module: Mô hình hoá miền,
Hợp đồng kiểm được, Tiến hoá không phá, Dữ liệu là phần khó đổi nhất), chưa có bài học nào nên
học viên bấm "Vào học" gặp trang trắng.

**KHÔNG làm:** không đổi UI/route, không đổi schema DB, không đổi luồng auth/thanh toán, không
đụng chặng nào khác ngoài `architecture-s2`.

## Điểm chạm file

- Mới: `packages/subject-programming/lessons/p6u117.ts`, `p6u118.ts`, `p6u119.ts` (6 bài học,
  làn `typescript`, đúng `ProgrammingLesson`/`LessonSchema`).
- Đăng ký: `lessons.ts` (import + spread), `curriculum.ts` (3 entry unit `p6-u117..119`),
  `specializations/stageUnits.ts` (`'architecture-s2': [...]`).
- `specializations/stageUnits.test.ts`: đổi ví dụ minh hoạ "chặng chưa soạn bài" từ
  `architecture-s2` sang `architecture-s4` (dữ liệu ví dụ, không nới lỏng luật).

## Hợp đồng vào-ra

- Input: nội dung 4 module có sẵn trong `specializations/architecture.ts`.
- Output: 3 unit mới trong `CURRICULUM_UNITS`, mỗi unit ≥ 1 bài học hợp lệ theo `LessonSchema`
  (hook/theory/workedExample/predict/parsons/make/SRS card), ánh xạ `architecture-s2` → 3 unit
  qua `stageUnits.ts`.

## Tiêu chí chấp nhận đo được

- `npx vitest run packages/subject-programming` xanh 100% — gồm `lessonsTs.test.ts` (chạy tsc
  thật cho mọi bài mới), `lessons.test.ts`, `curriculum.test.ts`, `specializations/stageUnits.test.ts`.
- `npm run typecheck` và `npm run lint --max-warnings 0` sạch.
- Đủ 4 module gốc được phủ nội dung (không bỏ sót module nào).

## Bất biến + test canh

- `stageUnits.test.ts` giữ nguyên luật "chặng chưa soạn bài trả về mảng rỗng" — chỉ đổi ví dụ
  minh hoạ sang chặng khác vẫn còn trống (`architecture-s4`).
- `lessonsTs.test.ts` canh: mọi bài `typescript` phải biên dịch bằng tsc thật + chạy `node:vm`
  không lỗi, đáp án Predict phải khớp output thật.

## Quy ước dự án

Theo tiền lệ `backend-s2/s3/s4`, `web-s2/s3`, `data-s1`: gộp module khi hai module cùng trả lời
một câu hỏi sư phạm (ở đây m3 "Tiến hoá không phá" + m4 "Dữ liệu là phần khó đổi nhất" gộp vào
`p6-u119`). Mô phỏng khái niệm bằng hàm thuần TypeScript tất định, không cài thư viện ngoài
(Zod/JSON Schema chỉ mô phỏng bằng hàm kiểm tra thủ công).

## Nghiệm thu

Xem `docs/changelog/0218-2026-08-31-bai-hoc-chang-s2-huong-kien-truc.md` cho bằng chứng kiểm
chứng đầy đủ (test/typecheck/lint) và chi tiết 6 bài học đã soạn.
