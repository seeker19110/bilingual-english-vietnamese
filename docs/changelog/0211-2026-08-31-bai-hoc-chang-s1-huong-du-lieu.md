# 0211 — Bài học 8 bước thật cho chặng data-s1 (hướng Dữ liệu) (1 PR)

- **Ngày:** 2026-08-31
- **PR:** (điền khi tạo)

## Việc đã làm

Tiếp mạch "soạn bài học 8 bước cho stageUnits.ts" (sau `ai-s1`, nhật ký `0210`), khép chặng
`data-s1` (`specializations/data.ts`, 4 module) bằng 6 bài học 8 bước thật ở 3 unit mới, rồi
đăng ký cầu nối `data-s1` vào `specializations/stageUnits.ts`.

- `p6-u66` (`lessons/p6u66.ts`, module "SQL phân tích"): l1 `RANK()`/`DENSE_RANK() OVER
PARTITION BY` (xếp hạng từng dòng mà không gộp mất dòng, khác GROUP BY); l2 CTE (`WITH`) +
  `SUM() OVER` tính tổng luỹ kế. Đi XA HƠN `p3-u8`/`p3-u9` (đã dạy SELECT/JOIN/GROUP BY/HAVING
  cơ bản trên cùng kho `sqlDataset.ts`) — không dạy trùng.
- `p6-u67` (`lessons/p6u67.ts`, module "Làm sạch dữ liệu"): l1 phát hiện thiếu/trùng/sai kiểu
  (so trùng theo khoá tự nhiên, không so nguyên bản ghi); l2 chuẩn hoá nhiều định dạng ngày về
  ISO + nguyên tắc ghi log mọi quyết định làm sạch (không âm thầm sửa).
- `p6-u68` (`lessons/p6u68.ts`, gộp 2 module cuối "Thống kê đủ dùng" + "Trực quan hoá trung
  thực" — đúng tiền lệ `web-s1` gộp module khi hợp lý): l1 trung bình vs trung vị (ví dụ lương
  bị kéo lệch bởi ngoại lệ) + tương quan không phải nhân quả; l2 phát hiện trục Y không cắt gốc
  gây phóng đại chênh lệch + chọn đúng dạng biểu đồ theo câu hỏi.
- Đăng ký `stageUnits.ts`: `'data-s1': ['p6-u66', 'p6-u67', 'p6-u68']`.
- `p6-u66` dùng làn `sql` (chấm bằng sql.js — SQLite qua WASM, CI và trình duyệt chung một
  engine); `p6-u67`/`p6-u68` dùng làn `python` thuần, tất định, không thư viện ngoài.

## Quyết định kèm theo

- **Mã unit `p6-u64`/`p6-u65` đã bị chặng `ai-s1` lấy trước** (đợt vừa merge trước đó cùng
  ngày) — ghi chú cũ ở `PROGRESS.md` từng gợi ý `data-s1` dùng `p6-u64…u66`, nay đã cập nhật
  đúng dải thật `p6-u66…u68`. Không mã đã phát hành nào bị đổi (chỉ là dải dự kiến chưa dùng
  đổi trước khi có ai dùng), không ảnh hưởng tiến độ Postgres nào.
- Chia việc: unit `p6-u66` (SQL, cần kiểm bằng sql.js thật, tự làm để kiểm soát chất lượng
  window function/CTE) tự làm; hai unit `p6-u67`/`p6-u68` (Python, độc lập không phụ thuộc
  nhau) giao song song 2 subagent Sonnet theo đúng khuôn `p6u64.ts`/`p6u65.ts`.

## Bằng chứng kiểm chứng

- `npm run typecheck` sạch (cả `tsc -b packages/subject-programming` riêng).
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` (client + server + hub) thành công; `npm run budget` vẫn trong hạn mức
  (JS 127,30/140 kB, CSS 16,79/18 kB).
- `npx vitest run packages/subject-programming` — **48/48 file test, 2653/2653 test xanh**,
  bao gồm `lessonsSql.test.ts` (chạy sql.js thật cho cả 2 bài `p6-u66`, gồm ca đồng hạng
  RANK/DENSE_RANK), `lessonsPython.test.ts` (chạy python3 thật cho 4 bài `p6-u67`/`p6-u68`),
  và `specializations/stageUnits.test.ts` (xác nhận `data-s1` tra ra chặng thật, 3 unit đều có
  bài thật trong curriculum).
- Mọi truy vấn SQL (window function `RANK()`/`DENSE_RANK()`, CTE nhiều tầng, `SUM() OVER`) đã
  tự kiểm bằng `sql.js` thật trước khi soạn nội dung — không đoán kết quả tay.

## Việc tiếp theo (không nằm trong đợt này)

- 46/52 chặng còn lại của 13 hướng chuyên sâu vẫn chưa có bài học 8 bước thật. Mã unit tiếp
  theo còn trống: `p6-u69` trở đi.
