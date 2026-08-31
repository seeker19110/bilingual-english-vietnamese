# Đặc tả: Bài học 8 bước thật cho chặng `data-s1` (hướng chuyên sâu Dữ liệu)

| Thuộc tính   | Giá trị                                    |
| ------------ | ------------------------------------------ |
| Issue        | #                                          |
| Spec owner   | Claude (phiên làm việc 2026-08-31)         |
| Trạng thái   | **Approved for implementation**            |
| Người duyệt  | Chủ dự án (donghanhcungban.org@gmail.com)  |
| Ngày duyệt   | 2026-08-31 (yêu cầu trực tiếp trong phiên) |
| Lần cập nhật | 2026-08-31                                 |

> Không bắt đầu code khi trạng thái chưa là **Approved for implementation**.

## 1. Tóm tắt quyết định

Người dùng yêu cầu trực tiếp trong phiên: "soạn thêm bài học 8 bước thật cho stageUnits.ts của
hướng ai" — sau khi khép xong chặng `ai-s1` (PR #772), tiếp mạch tự nhiên là mở rộng sang chặng
kế tiếp còn thiếu bài. Giải pháp: soạn 6 bài học 8 bước thật cho chặng `data-s1`
(`specializations/data.ts`, 4 module) ở 3 unit mới trong `curriculum.ts`, đăng ký cầu nối vào
`specializations/stageUnits.ts` — đúng khuôn dữ liệu đã có, không đổi kiến trúc.

## 2. Vấn đề, người dùng và bằng chứng

- Persona: người học đã chọn hướng chuyên sâu Dữ liệu, vào chặng S1 nhưng chưa có bài học thật
  — trang chặng không hiện khối "Vào học" (chỉ hiện khi `stageUnits.ts` có đăng ký).
- Hiện trạng: `stageUnits.ts` trước đợt này có 5 chặng đã đăng ký (`web-s1`, `architecture-s1`,
  `web-s4`, `backend-s1`, `ai-s1`); `data-s1` chưa có bài nào dù bản đồ kiến trúc/module đã có
  sẵn từ đợt 13 hướng chuyên sâu (2026-08-27).
- Nguồn bằng chứng: hội thoại phiên này (tiếp nối yêu cầu "soạn thêm bài học... của hướng ai"
  sang hướng Dữ liệu, không có yêu cầu mới cụ thể hơn — chủ dự án nói "tiếp tục").

## 3. Nghiên cứu hiện trạng

- `packages/subject-programming/specializations/data.ts` — 4 module `data-s1`: SQL phân tích,
  Làm sạch dữ liệu, Thống kê đủ dùng, Trực quan hoá trung thực.
- `packages/subject-programming/lessons/p3u8.ts`/`p3u9.ts` — đã dạy SELECT/JOIN/GROUP BY/HAVING
  cơ bản trên cùng kho `sqlDataset.ts` (quán cà phê) — bài SQL phân tích của `data-s1` phải đi
  XA HƠN (hàm cửa sổ, CTE) để không dạy trùng.
- `packages/subject-programming/lessonsSql.test.ts` — cổng chấm SQL chạy `sql.js` (SQLite qua
  WASM) thật, CI và trình duyệt dùng chung một engine.
- `packages/subject-programming/specializations/stageUnits.ts` + `stageUnits.test.ts` — cầu
  nối chặng → unit, khuôn 3-unit mỗi chặng S1 đã áp dụng cho 4 hướng trước.
- Mã unit tự do gần nhất tại thời điểm soạn: `p6-u66…u93` (dải S1 của 11 hướng còn lại theo
  `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`) — `p6-u64`/`p6-u65` đã bị chặng
  `ai-s1` lấy trước cùng ngày.

## 4. Phương án và quyết định

3 unit, đúng khuôn "gộp module khi hợp lý" đã dùng ở `web-s1`:

- `p6-u66` (module m1 "SQL phân tích"): hàm cửa sổ (`RANK()`/`DENSE_RANK() OVER PARTITION BY`)
  - CTE (`WITH`) và tổng luỹ kế (`SUM() OVER`).
- `p6-u67` (module m2 "Làm sạch dữ liệu"): phát hiện thiếu/trùng/sai kiểu; chuẩn hoá ngày giờ +
  ghi log giả định làm sạch.
- `p6-u68` (gộp module m3 "Thống kê đủ dùng" + m4 "Trực quan hoá trung thực"): trung bình vs
  trung vị + tương quan không phải nhân quả; phát hiện trục Y không cắt gốc gây phóng đại.

**Phương án khác đã cân nhắc và loại:** 4 unit riêng (1:1 với 4 module) — loại vì đề bài m3/m4
đều ngắn, gộp vào 1 unit (2 bài) khớp đúng tiền lệ `web-s1` (5 module gộp vào 3 unit) hơn là ép
thêm một unit chỉ có 1-2 bài mỏng.

## 5. Phạm vi

### Trong phạm vi

- 3 unit mới trong `curriculum.ts` (`p6-u66…u68`) + 6 bài học 8 bước (`lessons/p6u66..68.ts`).
- Đăng ký `stageUnits.ts`: `'data-s1': ['p6-u66', 'p6-u67', 'p6-u68']`.
- Cập nhật `PROGRESS.md` mục "Tiếp theo" (số chặng đã có bài, dải mã unit tiếp theo còn trống).

### KHÔNG trong phạm vi

- KHÔNG đổi UI/route mới — dùng lại trang chặng hiện có (data-driven qua `stageUnits.ts`).
- KHÔNG đổi logic chấm điểm/tiến độ, không migration (tầng dữ liệu tĩnh không đụng DB/API).
- KHÔNG soạn bài cho 3 module còn lại của các hướng khác — nằm ngoài phạm vi đợt này.

## 6. Tiêu chí chấp nhận (đo được)

- `npm run typecheck` sạch.
- `npx vitest run packages/subject-programming` xanh 100%, bao gồm `lessonsSql.test.ts` (2 bài
  SQL chạy sql.js thật), `lessonsPython.test.ts` (4 bài Python chạy python3 thật),
  `specializations/stageUnits.test.ts` (xác nhận `data-s1` tra ra chặng thật).
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công, `npm run budget` vẫn trong hạn mức.

## 7. Rủi ro, rollout, rollback

- Rủi ro thấp: chỉ thêm dữ liệu hằng biên dịch, không đổi schema DB, không đổi API.
- Rollout: đi theo PR thường, không cần feature flag (nội dung học liệu tĩnh).
- Rollback: revert PR nếu cần — không có migration, không có dữ liệu người dùng bị ảnh hưởng.
