# 0221 — Bài học 8 bước thật cho chặng data-s3 (hướng Dữ liệu) (1 PR)

- **Ngày:** 2026-08-31
- **PR:** (điền khi tạo)
- **Đặc tả:** `docs/specs/2026-08-31-bai-hoc-chang-s3-huong-du-lieu.md` — Trạng thái: Approved
  for implementation. Nguồn nội dung: `packages/subject-programming/specializations/data.ts`
  (chặng `data-s3`, 4 module) + khuôn 8 bước ở `packages/subject-programming/lessonTypes.ts`.

## Việc đã làm

Soạn 6 bài học 8 bước thật cho chặng `data-s3` "Quy mô và thời gian thực" của hướng chuyên sâu
Dữ liệu (4 module), ở 3 unit mới, làn `typescript` — mô phỏng bằng hàm thuần TẤT ĐỊNH (mảng nhỏ
đóng vai "đĩa", kích thước khối đóng vai "RAM có hạn"; không Spark, không Kafka, không đồng hồ
thật, không số ngẫu nhiên):

- `p6-u126` (module m1 "Dữ liệu lớn"): xử lý theo khối với ĐỈNH BỘ NHỚ HẰNG SỐ (điều kiện "phép
  tổng hợp cộng dồn được", cách xử lý trung bình bằng cặp tổng/đếm, vì sao gộp theo khoá vẫn có
  thể tràn RAM và đó là lý do engine phân tán chia dữ liệu theo khoá); SẮP XẾP NGOÀI — tạo run
  đã sắp rồi trộn nhiều đường bằng con trỏ, luật ổn định khi giá trị bằng nhau, vì sao k lớn quá
  lại phản tác dụng.
- `p6-u127` (module m2 "Luồng thời gian thực"): thời gian sự kiện vs thời gian xử lý (câu hỏi
  quyết định: đang hỏi về THẾ GIỚI hay về HỆ THỐNG), cửa sổ nhảy rời tính bằng phép chia lấy
  nguyên và luật chứa-đầu-hở-đuôi; MỐC NƯỚC (watermark) chốt cửa sổ, đánh đổi giữa độ trễ cho
  phép và độ đầy đủ, ba cách xử lý sự kiện tới muộn, và "đúng-một-lần" đạt được bằng khử trùng
  theo id trong một cửa sổ hữu hạn.
- `p6-u128` (gộp module m3 "Thực nghiệm" + m4 "Chi phí và quản trị"): ba đòn bẩy nhân nhau để
  quét ít byte hơn (cắt tỉa phân vùng — và ca bọc cột phân vùng trong hàm làm mất cắt tỉa mà
  không báo lỗi; định dạng cột; nén), vấn đề tệp nhỏ khi phân vùng quá mịn, chính sách vòng đời
  và che dữ liệu cá nhân; A/B test — cỡ mẫu chốt TRƯỚC, bẫy dừng sớm (peeking) làm phồng mức sai
  lầm, chỉ số dẫn dắt vs chỉ số kết quả, và cách nói về nhân quả khi không thực nghiệm được.

Đăng ký đầy đủ ba tầng: import + spread trong `packages/subject-programming/lessons.ts`, ba entry
trong `PROGRAMMING_LEVELS` bậc p6 (`packages/subject-programming/curriculum.ts`), và cầu nối
`'data-s3': ['p6-u126', 'p6-u127', 'p6-u128']` trong
`packages/subject-programming/specializations/stageUnits.ts`.

## Quyết định kèm theo

- **Gộp m3+m4 thành unit cuối chặng.** Thực nghiệm và chi phí/quản trị cùng trả lời một câu hỏi:
  "con số này đáng bao nhiêu" — một bên là cái giá phải trả để có con số, một bên là mức tin cậy
  khi đem con số ra quyết định. Đúng tiền lệ `backend-s2/s3/s4` và `data-s2`.
- **Dải `p6-u126…u128`, không phải `u123…u125`.** Hai đợt việc song song trong cùng nhánh
  (`architecture-s3` lấy `u123…u125`, `mobile-s1` lấy `u131…u133`) nên dải được đo lại ngay
  trước khi đặt tên file; có ghi comment tại chỗ trong `curriculum.ts`.
- **Phần A/B test chấm bằng LUẬT QUYẾT ĐỊNH tất định, không dùng số ngẫu nhiên.** Bài dạy đúng
  thứ tự kiểm — cỡ mẫu trước, chênh lệch sau — vì đảo lại chính là cài cái bẫy dừng sớm; và logic
  ngẫu nhiên thì không cổng nào kiểm chứng được (QUY-TRINH-AUDIT tầng 10).
- Phần chữ trong lý thuyết dùng chữ ("lớn hơn hoặc bằng") thay cho ký hiệu so sánh trong mã
  inline — bộ dựng markdown của bài học không nhận mã inline chứa dấu so sánh, và
  `lessonMarkdown.test.ts` bắt đúng ca đó (bài học rút từ đợt `data-s2`).
- Mỗi bài có một ca test ẨN kiểm CẢ CÁC DÒNG output đúng thứ tự (chống hardcode từng dòng riêng
  lẻ), theo đúng cách các chặng backend/data trước đã làm.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ (0 lỗi)
- `npm run lint` ✅ (0 cảnh báo, `--max-warnings 0`)
- `npm run build` ✅
- `npx vitest run packages/subject-programming/lessonsTs.test.ts packages/subject-programming/srsCards.test.ts`
  ✅ 1363 test xanh — gồm cả 6 bài mới đi qua tsc THẬT + `node:vm`: code mẫu đạt hết test-case,
  ví dụ mẫu chạy không lỗi, đáp án Predict khớp output thật và không lựa chọn sai nào cũng khớp.
- `npx vitest run apps/dhcb/src/lib/lessonMarkdown.test.ts` ✅ 566 test xanh.
- `npx vitest run packages/subject-programming/lessons.test.ts curriculum.test.ts specializations.test.ts`
  ✅ cho phần `data-s3` (id unit duy nhất, `unitId` tồn tại trong curriculum, cầu nối chặng khớp).
- `npx prettier --check` ✅ trên toàn bộ file mới/đã sửa.
