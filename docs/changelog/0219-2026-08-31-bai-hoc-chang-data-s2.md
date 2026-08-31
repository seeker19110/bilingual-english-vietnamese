# 0219 — Bài học 8 bước thật cho chặng data-s2 (hướng Dữ liệu) (1 PR)

- **Ngày:** 2026-08-31
- **PR:** #
- **Đặc tả nguồn:** `packages/subject-programming/specializations/data.ts` (chặng `data-s2`,
  4 module) + khuôn 8 bước ở `packages/subject-programming/lessonTypes.ts`.

## Việc đã làm

Soạn 6 bài học 8 bước thật cho chặng `data-s2` "Kỹ sư dữ liệu — đường ống" của hướng chuyên sâu
Dữ liệu (4 module), ở 3 unit mới, làn `typescript` (mô phỏng bằng hàm thuần tất định — không
Airflow/Spark/dbt thật, đúng cách `p6-u108` mô phỏng ước lượng dung lượng):

- `p6-u120` (module m1 "ETL / ELT"): nạp gia tăng bằng MỐC NƯỚC (watermark) — bẫy `>=` làm nhân
  đôi dữ liệu, bẫy `>` làm mất bản ghi tới muộn, và cách lấy CHỒNG LẤN để sống chung với cả hai;
  bước ghi IDEMPOTENT (upsert theo khoá tự nhiên, xoá-rồi-ghi-lại phân vùng) để chạy lại một
  ngày không nhân đôi dữ liệu. Có nói rõ khác biệt ETL vs ELT và giá trị của lớp thô.
- `p6-u121` (module m2 "Mô hình hoá kho dữ liệu"): star schema (bảng sự kiện vs bảng chiều, tuyên
  bố HẠT, khoá thay thế, vì sao kho phân tích cố ý không chuẩn hoá sâu, ba lớp thô → sạch →
  phục vụ; sự kiện mồ côi phải vào nhóm "Khong ro" chứ không được bỏ đi để tổng vẫn khớp nguồn);
  chiều biến đổi chậm SCD type 1 vs type 2 (`hieuLucTu`/`hieuLucDen`/`laHienTai`, tra cứu tại
  một thời điểm quá khứ, bẫy quên đóng dòng cũ làm nhân đôi doanh thu).
- `p6-u122` (gộp module m3 "Điều phối" + m4 "Chất lượng dữ liệu"): DAG + sắp xếp tô-pô (Kahn,
  phá hoà tất định theo chữ cái), tính PHẠM VI CHẠY LẠI xuôi dòng thay vì đoán, SLA và cảnh báo
  khi tác vụ không chạy chứ không chỉ khi báo lỗi, điều kiện để backfill được; bốn nhóm kiểm chất
  lượng (không rỗng · duy nhất · khoảng giá trị · KHỚP TỔNG) với luật fail-fast chặn bước sau,
  hợp đồng dữ liệu và theo vết nguồn gốc (lineage).

Đăng ký đầy đủ ba tầng: import + spread trong `packages/subject-programming/lessons.ts`, ba entry
trong `CURRICULUM_UNITS` (`packages/subject-programming/curriculum.ts`), và cầu nối
`'data-s2': ['p6-u120', 'p6-u121', 'p6-u122']` trong
`packages/subject-programming/specializations/stageUnits.ts`.

## Quyết định kèm theo

- **Gộp m3+m4 thành unit cuối chặng** (thay vì gộp m1+m2): điều phối và chất lượng dữ liệu cùng
  trả lời một câu hỏi ở hai đầu — "đường ống sai thì làm sao BIẾT và làm sao SỬA" — trong khi
  ETL/ELT và mô hình hoá kho đều nặng, đủ chỗ cho một unit riêng. Đúng tiền lệ
  `backend-s2`/`s3`/`s4` gộp m3+m4.
- **Dùng dải `p6-u120…u122` chứ không phải `u117…u119`.** Dải `u117…u119` đã bị một đợt việc
  song song (chặng `architecture-s2`) chiếm trong cùng nhánh; giữ nguyên số đã định sẽ đụng
  id unit lẫn tên file. Đây là lý do đánh số nhảy một quãng trong `curriculum.ts`, có ghi comment
  tại chỗ.
- Mỗi bài có một ca test ẨN kiểm CẢ CÁC DÒNG output đúng thứ tự (chống hardcode từng dòng riêng
  lẻ), theo đúng cách các chặng backend đã làm.
- `p6-u120-l1`: bỏ dấu backtick quanh `>=`/`>` trong phần lý thuyết — bộ dựng markdown của bài
  học (`apps/dhcb/src/lib/lessonMarkdown.ts`) không nhận mã inline chứa dấu so sánh, và cổng
  `lessonMarkdown.test.ts` bắt đúng ca đó (đã tái hiện, sửa, chạy lại xanh).

## Bằng chứng kiểm chứng

- `npm run build` ✅ (build xanh, `dist/` sinh đủ)
- `npm run typecheck` ✅ (0 lỗi)
- `npm run lint` ✅ (0 cảnh báo, `--max-warnings 0`)
- `npm test` ✅ **526 tệp / 9702 test xanh**, trong đó các cổng nội dung liên quan trực tiếp:
  `lessonsTs.test.ts` (chạy tsc THẬT + node:vm — code mẫu đạt hết test-case, ví dụ mẫu chạy
  không lỗi, đáp án Predict khớp output thật và không lựa chọn sai nào khớp),
  `lessons.test.ts`, `srsCards.test.ts`, `curriculum.test.ts`,
  `specializations/stageUnits.test.ts`, `lessonMarkdown.test.ts`.
- `npx prettier --check` ✅ trên toàn bộ file mới/đã sửa.
