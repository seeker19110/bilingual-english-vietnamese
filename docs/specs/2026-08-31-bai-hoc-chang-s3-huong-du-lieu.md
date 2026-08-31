# Đặc tả — Bài học 8 bước thật cho chặng data-s3

**Trạng thái: Approved for implementation** (nội dung học liệu tĩnh, yêu cầu trực tiếp trong
phiên làm việc này — tiếp mạch soạn bài 8 bước cho các chặng chuyên sâu còn trống, nối tiếp
`data-s1` và `data-s2`).

## Phạm vi

Soạn nội dung bài học 8 bước thật cho chặng `data-s3` ("Quy mô và thời gian thực", hướng chuyên
sâu Dữ liệu) — trước đây chặng này mới có metadata module ở
`packages/subject-programming/specializations/data.ts` (4 module: dữ liệu lớn, luồng thời gian
thực, thực nghiệm, chi phí & quản trị), chưa có bài học nào nên học viên bấm "Vào học" gặp trang
trắng.

**KHÔNG làm:** không đổi UI/route, không đổi schema DB, không đổi luồng auth/thanh toán, không
sửa `PROGRESS.md`, không đụng chặng nào khác ngoài `data-s3` (kể cả `architecture-s3` và
`mobile-s1` đang được soạn song song).

## Điểm chạm file

- Mới: `packages/subject-programming/lessons/p6u126.ts`, `p6u127.ts`, `p6u128.ts` (6 bài học,
  làn `typescript`, đúng `ProgrammingLesson`/`LessonSchema`).
- Đăng ký: `lessons.ts` (import + spread), `curriculum.ts` (3 entry unit `p6-u126..128` trong
  bậc P6), `specializations/stageUnits.ts` (dòng `'data-s3': [...]`).
- Tài liệu: đặc tả này + một file changelog mới trong `docs/changelog/`.

## Hợp đồng vào-ra

- Input: nội dung 4 module có sẵn trong `specializations/data.ts` (`data-s3-m1..m4`) và dự án
  chặng "Luồng dữ liệu gần thời gian thực".
- Output: 3 unit mới trong `PROGRAMMING_LEVELS` (bậc p6), mỗi unit 2 bài học hợp lệ theo
  `LessonSchema` (hook / theory / workedExample / predict / parsons / make / homework / SRS),
  ánh xạ `data-s3` → 3 unit qua `stageUnits.ts`.
- Mọi bài mô phỏng bằng hàm thuần TẤT ĐỊNH: không Spark, không Kafka, không đồng hồ thật, không
  số ngẫu nhiên (logic ngẫu nhiên không kiểm chứng được — QUY-TRINH-AUDIT tầng 10).

## Tiêu chí chấp nhận đo được

- `npx vitest run packages/subject-programming` xanh cho mọi test liên quan bài mới — gồm
  `lessonsTs.test.ts` (chạy tsc thật + `node:vm` cho cả 6 bài), `lessons.test.ts`,
  `curriculum.test.ts`, `specializations.test.ts`, `srsCards.test.ts`, và
  `apps/dhcb/src/lib/lessonMarkdown.test.ts`.
- `npm run typecheck`, `npm run lint` (0 cảnh báo), `npm run build` sạch.
- Đủ 4 module gốc được phủ nội dung (không bỏ sót module nào).

## Bất biến + test canh

- `lessonsTs.test.ts` canh: mọi bài `typescript` phải biên dịch bằng tsc thật + chạy `node:vm`
  không lỗi; code mẫu phải đạt HẾT test-case; đáp án Predict phải khớp output thật và không có
  lựa chọn sai nào cũng khớp.
- `lessons.test.ts` canh: id bài duy nhất, `unitId` tồn tại thật trong `curriculum.ts`.
- `specializations.test.ts`/`stageUnits` canh: mọi unit khai trong `SPEC_STAGE_UNITS` phải có
  bài thật và có mặt trong curriculum.
- `srsCards.test.ts` canh: mỗi thẻ hỏi đúng một ý, đáp án đủ dài để tự chấm, không lộ đáp án.
- `lessonMarkdown.test.ts` canh: lý thuyết không mất chữ khi dựng markdown và không có dòng code
  thụt lề bị hiểu nhầm thành đoạn văn — nên phần chữ dùng chữ ("lớn hơn hoặc bằng") thay cho ký
  hiệu so sánh.

## Quy ước dự án

Theo tiền lệ `backend-s2/s3/s4`, `web-s2/s3`, `data-s1/s2`: gộp module khi hai module cùng trả
lời một câu hỏi sư phạm. Ở đây `p6-u128` gộp m3 "Thực nghiệm" + m4 "Chi phí và quản trị", vì cả
hai cùng trả lời "con số này đáng bao nhiêu" — một bên là cái giá để có con số, một bên là mức
tin cậy của con số khi đem ra quyết định. Comment tiếng Việt ở đầu mỗi file lesson, conventional
commits, không hard-code màu/secret (không áp dụng ở đây vì chỉ là dữ liệu học liệu).

## Nghiệm thu

Ba unit: `p6-u126` (xử lý theo khối, sắp xếp ngoài) · `p6-u127` (thời gian sự kiện vs thời gian
xử lý, mốc nước & sự kiện tới muộn) · `p6-u128` (cắt tỉa phân vùng + định dạng cột + vòng đời dữ
liệu, A/B test và bẫy dừng sớm). Bằng chứng kiểm chứng đầy đủ (build/typecheck/lint/test) ghi
trong file changelog kèm theo PR.
