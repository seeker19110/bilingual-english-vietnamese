# Đặc tả — Bài học 8 bước thật cho chặng data-s2

**Trạng thái: Approved for implementation** (nội dung học liệu tĩnh, yêu cầu trực tiếp trong
phiên làm việc này — tiếp mạch soạn bài 8 bước cho các chặng chuyên sâu còn trống).

## Phạm vi

Soạn nội dung bài học 8 bước thật cho chặng `data-s2` ("Kỹ sư dữ liệu — đường ống", hướng chuyên
sâu Dữ liệu) — trước đây chặng này mới có metadata module ở
`packages/subject-programming/specializations/data.ts` (4 module: ETL/ELT, mô hình hoá kho dữ
liệu, điều phối, chất lượng dữ liệu), chưa có bài học nào nên học viên bấm "Vào học" gặp trang
trắng.

**KHÔNG làm:** không đổi UI/route, không đổi schema DB, không đổi luồng auth/thanh toán, không
đụng chặng nào khác ngoài `data-s2`.

## Điểm chạm file

- Mới: `packages/subject-programming/lessons/p6u120.ts`, `p6u121.ts`, `p6u122.ts` (6 bài học,
  làn `typescript`, đúng `ProgrammingLesson`/`LessonSchema`).
- Đăng ký: `lessons.ts` (import + spread), `curriculum.ts` (3 entry unit `p6-u120..122`),
  `specializations/stageUnits.ts` (`'data-s2': [...]`).

## Hợp đồng vào-ra

- Input: nội dung 4 module có sẵn trong `specializations/data.ts`.
- Output: 3 unit mới trong `CURRICULUM_UNITS`, mỗi unit ≥ 1 bài học hợp lệ theo `LessonSchema`
  (hook/theory/workedExample/predict/parsons/make/SRS card), ánh xạ `data-s2` → 3 unit qua
  `stageUnits.ts`.

## Tiêu chí chấp nhận đo được

- `npx vitest run packages/subject-programming` (và `npm test` toàn monorepo) xanh 100% — gồm
  `lessonsTs.test.ts` (chạy tsc thật cho mọi bài mới), `lessons.test.ts`, `curriculum.test.ts`,
  `specializations/stageUnits.test.ts`, `lessonMarkdown.test.ts`.
- `npm run typecheck`, `npm run lint --max-warnings 0`, `npm run build` sạch.
- Đủ 4 module gốc được phủ nội dung (không bỏ sót module nào).

## Bất biến + test canh

- `lessonsTs.test.ts` canh: mọi bài `typescript` phải biên dịch bằng tsc thật + chạy `node:vm`
  không lỗi, đáp án Predict phải khớp output thật.
- `lessonMarkdown.test.ts` canh: lý thuyết không được chứa mã inline có dấu so sánh (`>=`/`>`)
  làm hỏng bộ dựng markdown.

## Quy ước dự án

Theo tiền lệ `backend-s2/s3/s4`, `web-s2/s3`, `data-s1`: gộp module khi hai module cùng trả lời
một câu hỏi sư phạm (ở đây m3 "Điều phối" + m4 "Chất lượng dữ liệu" gộp vào `p6-u122`, vì cả hai
cùng trả lời "đường ống sai thì làm sao biết và làm sao sửa"). Mô phỏng khái niệm bằng hàm thuần
TypeScript tất định, không cài Airflow/Spark/dbt thật.

## Nghiệm thu

Xem `docs/changelog/0219-2026-08-31-bai-hoc-chang-data-s2.md` cho bằng chứng kiểm chứng đầy đủ
(build/typecheck/lint/test) và chi tiết 6 bài học đã soạn.
