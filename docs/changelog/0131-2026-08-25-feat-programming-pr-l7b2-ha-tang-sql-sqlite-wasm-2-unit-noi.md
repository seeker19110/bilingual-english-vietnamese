# feat(programming): PR-L7b2 — hạ tầng SQL (SQLite WASM) + 2 unit nội dung (2026-08-25)

Đóng nốt hạ tầng bậc P3 và mở luôn 2 unit SQL. Môn Lập trình nay chạy được **3 ngôn ngữ**.

- **`sql.js` (SQLite biên dịch WASM) tự host** — copy `sql-wasm.wasm` (648KB) vào
  `dist/sqljs/` qua plugin trong `apps/dhcb/vite.config.ts`, y hệt cách Pyodide đang làm.
  **Không CDN ngoài**, chạy được offline. E2E chặn MỌI request ra khỏi origin để chứng minh.
- **`sqlWorker.ts` + `lib/sqlRunner.ts`** — bộ chạy thứ ba, cùng giao thức message và cùng
  cách ngắt cứng như hai bộ trước. `codeRunner.ts` chỉ thêm một nhánh.
- **CSDL dựng LẠI TỪ ĐẦU mỗi lượt chạy** — học viên `DELETE`/`DROP` thoải mái để học, lượt
  sau vẫn có dữ liệu sạch; hoàn toàn tách biệt CSDL thật của app. Có test cả ở cổng lẫn E2E.
- **`sqlDataset.ts` + `sqlPrelude.ts`** — kho dữ liệu mẫu (3 bảng: `mon`, `don_hang`,
  `chi_tiet`, bối cảnh quán cà phê của dự án trục) và cách hiển thị kết quả, dùng chung cho
  cổng CI lẫn trình duyệt. Dữ liệu cố ý NHỎ và ĐOÁN ĐƯỢC để học viên tự nhẩm ra đáp án.
- **Cổng `lessonsSql.test.ts`** — chạy truy vấn thật rồi chấm bằng `grading.ts`. **Mạch SQL
  không có khe hở "xanh ở CI, rớt ở người học"**: cả hai nơi dùng CHUNG một engine (sql.js),
  chung dataset, chung bộ định dạng — khác hẳn mạch Python (CI `python3` vs học viên Pyodide).
- **Nội dung P3-U8** (SELECT/WHERE/ORDER BY/LIMIT — 4 bẫy: nháy đơn cho chuỗi, một dấu `=`,
  dấu chấm phẩy, `NULL` không phải 0) và **P3-U9** (JOIN + GROUP BY — 2 bẫy: JOIN nhân dòng
  nên `COUNT(*)` không phải số đơn, và hoà điểm thì thứ tự không xác định nếu thiếu tiêu chí phụ).

- **Kiểm chứng:** 437 file / 5439 test xanh; cổng SQL 11 test. E2E `programming-lesson`
  **11/11** xanh, gồm 3 test SQL mới chạy thật trong Chromium.
- **Ghi nhận quá trình:** 3 test E2E đầu tiên đỏ do LỖI TEST của tôi, không phải sản phẩm —
  bộ chặn mạng lấy `page.url()` lúc trang còn `about:blank` (chặn luôn điều hướng vào app), và
  dùng `route.continue()` thay vì `route.fallback()` nên giành mất route `/api/*` của
  `mockLogin`. Đã sửa cả hai, ghi comment tại chỗ để không ai vấp lại.
- **Còn lại của môn:** làn XEM TRANG HTML/CSS/DOM (U4–U6, cần iframe — hạ tầng cuối còn
  thiếu) · U7 fetch · U10–U12 (Git/công cụ/milestone) · chặng P3 dự án trục · thẻ SRS P2/P3.
- **Tiếp theo:** làn xem trang HTML/CSS (U4–U5) — iframe preview, là mảnh hạ tầng cuối của P3.
