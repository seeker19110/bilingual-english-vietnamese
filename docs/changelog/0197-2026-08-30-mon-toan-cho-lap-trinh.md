# 0197 — Hướng "Toán học cho Lập trình" xuyên môn Toán và Lập trình (2026-08-30)

**Ngày:** 2026-08-30
**PR:** _(chưa tạo — commit cục bộ trên nhánh `claude/math-programming-course-est4q2`)_

## Việc đã làm

Người dùng muốn một khoá học **ứng dụng toán trong lập trình**, đi từ căn bản tới nâng cao.
Vì DHCB là MỘT nền tảng và Toán lẫn Lập trình đều là môn trong trụ Learning, nội dung này được
gắn vào **cả hai môn** thay vì nhân đôi thành hai khoá rời:

### Môn Lập trình — hướng chuyên sâu thứ 14

Thêm `mathforcode` — **"Toán học cho Lập trình"**, là hướng NỀN cắt ngang thứ ba (cùng
`architecture` và `algo`), điều kiện đầu vào `p3`, ngôn ngữ Python (numpy chỉ dùng ở S3/S4 làm
thư viện ĐỐI CHIẾU, không dùng trong nhân tính toán). Bốn chặng:

- **S1 — Nền tảng rời rạc cho lập trình viên:** hệ đếm và bù 2, dấu phẩy động IEEE 754 (vì sao
  `0.1 + 0.2 != 0.3`), đại số Boolean và De Morgan, số học modulo (băm, buffer vòng, Luhn/ISBN),
  Big-O bằng ngôn ngữ toán chặt chẽ (chặn trên, cấp số, quy nạp).
- **S2 — Tổ hợp và xác suất:** đếm trước khi vét cạn, xác suất va chạm bảng băm (bài toán sinh
  nhật), kỳ vọng, PRNG và hạt giống, thống kê mô tả khi đo hiệu năng (p50/p95/p99).
- **S3 — Đại số tuyến tính ứng dụng:** vector và tích vô hướng, ma trận biến đổi 2D + toạ độ
  thuần nhất, khử Gauss có chọn trụ, vector riêng qua lặp luỹ thừa (nền cho PageRank/ML).
- **S4 — Giải tích và tối ưu cho AI/ML:** gradient descent cài từ số 0, hàm mất mát và tính lồi,
  đạo hàm riêng và lan truyền ngược ở mức trực giác, tối ưu cho bài toán thực tế.

Capstone: cài lại một mô hình toán **hoàn toàn bằng Python thuần** rồi chứng minh khớp một thư
viện tham chiếu trong ngưỡng sai số công bố.

Files mới:

- `packages/subject-programming/specializations/mathforcode.ts` (bản đồ hướng + bản đồ kiến trúc
  5 ô: mô hình toán · nhân tính toán · bộ đối chiếu · sinh dữ liệu thử · trực quan hoá).
- `packages/subject-programming/specializations/details/mathforcode-s1..s4.ts` (chi tiết chặng:
  mục tiêu, bài luyện tay, tự kiểm, dấu hiệu đã nắm, rubric nghiệm thu, đặc tả mẫu 7 ô).

Đã nối vào `specializations/registry.ts` (nhóm cắt ngang) và `specializations/stageDetails.ts`
(bốn khối S1–S4), thêm `'mathforcode'` vào union `SpecializationId`.

### Môn Toán — bộ chương "Toán ứng dụng trong Lập trình"

Thêm một mục `grade: 'university'` mới vào `STEM_CURRICULUM.mathematics`
(`apps/dhcb/src/data/stemCurriculum.ts`), nhãn **"Đại học — Toán ứng dụng trong Lập trình"**,
gồm 4 chương `mfc_c1..mfc_c4` soi gương đúng S1–S4, mỗi chương có công thức lõi và bài mẫu giải
từng bước: bù 2 + XOR (`mfc_p1`), xác suất va chạm bảng băm 365 ô / 23 khoá (`mfc_p2`), ma trận
xoay 2D + tịnh tiến (`mfc_p3`), một bước gradient descent tay (`mfc_p4`).

### Cập nhật số đếm

`13 hướng` → `14 hướng` ở: `specializations/types.ts`, `registry.ts`, `stageDetails.ts`
(`52 chặng` → `56 chặng`), `curriculum.ts` (2 chỗ, kèm bổ sung "toán học cho lập trình" vào danh
sách trong ngoặc), `specializations/stageUnits.ts`, `details/systems-s4.ts`, và chuỗi hiển thị
"Xem 14 hướng chuyên sâu" ở `ProgrammingSpecializationPage.tsx`. Hai test hardcode số cũ được
sửa cho ĐÚNG (không nới lỏng assertion nào): `specializations.test.ts` (14 hướng, cross-cutting
= `['algo','architecture','mathforcode']`, `specializationsOpenAt('p5')` 14; `productSpecializations()`
GIỮ NGUYÊN 11 vì hướng mới là nền cắt ngang), và 2 dòng comment trong `specStageDetails.test.ts`.

## Bằng chứng kiểm chứng

Lưu ý: `node_modules` trong container ban đầu lệch lockfile (tsc 6.0.2 trong khi `package.json`
ghi `^5.2.2`), gây lỗi giả `TS5101 baseUrl deprecated`. Đã `npm ci` rồi mới chạy cổng — đúng
quy trình mục 8 CLAUDE.md.

- `npm run typecheck` — **PASS** (0 lỗi; tsc 5.9.3 sau `npm ci`).
- `npx vitest run packages/subject-programming apps/dhcb/src/data/stemCurriculum.test.ts` —
  **PASS 36/36 test file, 1590/1590 test**. Trong đó `specializations.test.ts` 15 test,
  `specStageDetails.test.ts` 19 test, `stemCurriculum.test.ts` 2 test đều xanh.
- `npm run lint` (`--max-warnings 0`) — **PASS**, 0 cảnh báo.
- `npx prettier --write` trên các file mới/đã sửa — đã format.

## Quyết định kèm theo

- **Hướng NỀN chứ không phải hướng sản phẩm.** Toán không phải một nghề riêng; nó học SONG SONG
  một hướng sản phẩm. Vì vậy `crossCutting: true` và `productSpecializations()` vẫn là 11.
- **Điều kiện đầu vào `p3`, giống `algo`.** Người học cần biết hàm/list/một chút OOP là đủ; bắt
  chờ tới `p5` thì phần nền toán tới quá muộn so với lúc họ bắt đầu dùng thư viện AI.
- **Cài tay trước, thư viện sau.** numpy chỉ được xuất hiện ở tầng đối chiếu — bất biến này được
  ghi thẳng vào `invariants` của specBrief S3/S4, không phải lời khuyên suông.
- **KHÔNG thêm bài học 8 bước (`SPEC_STAGE_UNITS`) cho hướng này** ở đợt này, giống 13 hướng còn
  lại — tầng bản đồ và tầng bài học vốn tách nhau, `stageUnits.test.ts` vẫn xanh.
