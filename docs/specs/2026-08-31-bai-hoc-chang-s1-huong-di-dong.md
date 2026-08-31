# Đặc tả — Bài học 8 bước thật cho chặng mobile-s1 (hướng Di động)

**Trạng thái: Approved for implementation** (nội dung học liệu tĩnh, yêu cầu trực tiếp trong
phiên làm việc này — tiếp mạch soạn bài 8 bước cho các chặng chuyên sâu còn trống).

## Phạm vi

Soạn nội dung bài học 8 bước thật cho chặng `mobile-s1` ("App đầu tiên trên máy thật", hướng
chuyên sâu Ứng dụng di động). Trước đợt này hướng Di động **chưa có bài học nào ở bất kỳ chặng
nào** — chỉ có metadata module ở `packages/subject-programming/specializations/mobile.ts` (4
module: chọn nền tảng & đánh đổi, giao diện khai báo, điều hướng & trạng thái, lưu trữ cục bộ),
nên học viên bấm "Vào học" gặp trang trắng.

**KHÔNG làm:** không đổi UI/route, không đổi schema DB, không đổi luồng auth/thanh toán, không
đụng chặng nào khác ngoài `mobile-s1`, không thêm ngôn ngữ mới vào `LESSON_LANGUAGES`, không sửa
`PROGRESS.md`.

## Điểm chạm file

- Mới: `packages/subject-programming/lessons/p6u131.ts`, `p6u132.ts`, `p6u133.ts` (5 bài học,
  làn `typescript`, đúng `ProgrammingLesson`/`LessonSchema`).
- Đăng ký: `lessons.ts` (import + spread), `curriculum.ts` (3 entry unit `p6-u131..133`),
  `specializations/stageUnits.ts` (`'mobile-s1': [...]`).
- Mới: `docs/changelog/` — một file nhật ký đợt việc.

## Hợp đồng vào-ra

- Input: nội dung 4 module có sẵn trong `specializations/mobile.ts` (`mobile-s1-m1..m4`).
- Output: 3 unit mới trong giáo trình P6, mỗi unit 1–2 bài học hợp lệ theo `LessonSchema`
  (hook → theory → workedExample → predict → parsons → make/testCases → homework → thẻ SRS),
  ánh xạ `mobile-s1` → 3 unit qua `stageUnits.ts` để giao diện hiện nút "Vào học".

## Tiêu chí chấp nhận đo được

- `npx vitest run packages/subject-programming` xanh 100% — gồm `lessonsTs.test.ts` (chạy tsc
  thật + `node:vm` cho mọi bài mới), `lessons.test.ts`, `curriculum.test.ts`,
  `specializations/stageUnits.test.ts`, `srsCards.test.ts`.
- `apps/dhcb/src/lib/lessonMarkdown.test.ts` xanh (bộ dựng markdown chạy trên dữ liệu thật của
  mọi bài).
- `npm run typecheck`, `npm run lint` (max-warnings 0), `npm run build` sạch; Prettier sạch.
- Đủ 4 module gốc được phủ nội dung, không bỏ sót module nào.

## Bất biến + test canh

- `lessonsTs.test.ts` canh: mọi bài `typescript` phải biên dịch bằng tsc thật, ví dụ mẫu chạy
  không lỗi, code mẫu đạt HẾT test-case, đáp án Predict khớp output thật **và không lựa chọn
  sai nào khớp output** (bất biến này đã bắt một lỗi thật trong đợt: phương án nhiễu `Home` là
  chuỗi con của output `Home>Bill` — sửa bằng cách in ngăn xếp trong dấu ngoặc vuông).
- `lessons.test.ts` canh: `unitId` phải tồn tại thật trong `curriculum.ts`; mọi bài Make có ít
  nhất một ca test HIỆN.
- `specializations/stageUnits.test.ts` canh: chặng khai trong bảng phải có thật, unit khai phải
  có bài thật, một unit không được gán cho hai chặng.
- `srsCards.test.ts` canh: mỗi thẻ hỏi đúng một ý, đáp án ≥ 40 ký tự, câu hỏi không tự lộ đáp án.

## Quy ước dự án

- **Làn ngôn ngữ:** dùng `typescript`, KHÔNG dùng `kotlin`/`swift`. Lý do đo được: hai làn kia
  có bộ mô phỏng (`kotlinSim/`) nhưng hiện **không bài học nào** khai `language: 'kotlin'` hay
  `'swift'` (`lessonsKotlin.test.ts`/`lessonsSwift.test.ts` mỗi file chỉ 1 test), nên chưa có
  cổng CI nào chứng minh chúng chấm đúng bài mới; còn làn `typescript` được `lessonsTs.test.ts`
  chấm bằng tsc thật + `node:vm`. Nguyên lý dạy ở cả 5 bài (máy trạng thái vòng đời, UI là hàm
  của state, cửa sổ ảo hoá, ngăn xếp điều hướng, migration từng bậc) là nguyên lý CHUNG cho
  Android lẫn iOS lẫn đa nền tảng, mô phỏng được bằng hàm thuần tất định — đúng cách `p6u108`
  mô phỏng ước lượng dung lượng mà không dựng hệ phân tán thật. Cố ý **không bịa API Compose /
  SwiftUI / React Native cụ thể**.
- **Gộp module:** theo tiền lệ `web-s1`, `backend-s2/s3/s4`, `data-s1/s2` — gộp khi hai module
  cùng trả lời một câu hỏi sư phạm. Ở đây `p6-u131` = m1, `p6-u132` = m2, `p6-u133` gộp m3+m4
  (điều hướng & trạng thái + lưu trữ cục bộ, vì cả hai cùng trả lời "cái gì phải sống sót, và
  sống sót ở đâu" — m3 lo trong một phiên, m4 lo qua các phiên).
- **Dải mã unit:** `p6-u131..133`. Dải `u129/u130` bỏ trống có chủ đích: đợt này chạy song song
  với hai đợt soạn bài khác (`architecture-s3`, `data-s3`) trên cùng nhánh, nên số unit được cấp
  cách quãng để hai bên không đụng nhau (dải `u126..128` đã bị đợt `data-s3` lấy trong lúc đợt
  này đang soạn).

## Nghiệm thu

Xem file nhật ký tương ứng trong `docs/changelog/` cho bằng chứng kiểm chứng đầy đủ
(build/typecheck/lint/test) và chi tiết 5 bài học đã soạn.
