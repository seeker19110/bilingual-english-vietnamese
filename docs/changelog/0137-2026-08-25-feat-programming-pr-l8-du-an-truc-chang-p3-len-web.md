# feat(programming): PR-L8 — DỰ ÁN TRỤC chặng P3 "Lên web" (2026-08-25)

Cửa hàng của học viên **lên web**: máy tính tiền chạy chữ (P1) → sổ sách có file dữ liệu (P2)
→ **trang web + kho dữ liệu SQL (P3)**. Đây là chặng đầu tiên mà dự án dùng nhiều ngôn ngữ.

- **`ProjectStep` thêm `language`** (`python` | `html` | `dom` | `sql` | `fetch`) — **bỏ trống
  = python** (đọc qua `getStepLanguage()`, cùng khuôn `getStepFiles()`): 23 bước cũ của P1/P2
  không phải sửa một dòng nào. Thêm `domHtml` cho bước dom/fetch, kèm 2 refine chặn soạn sai
  (bước dom/fetch phải có trang; `probeCode` chỉ có nghĩa với bước Python).
- **Trang dự án chấm qua `runLessonCode()`** thay vì gọi thẳng `runPython` — cùng điểm vào với
  trang bài học, nên bước dự án và bài học KHÔNG THỂ chấm lệch nhau; thêm khung "Xem trang
  chạy" cho bước web (bước HTML xem theo từng lần gõ, bước dom/fetch chỉ chạy khi bấm).
- **Fetch giả tổng quát hoá** (`taoFetchBang`): một hàm tự chứa phục vụ CẢ API thời tiết của
  bài học P3-U7 lẫn **API menu cửa hàng** `/api/menu` của dự án (`shopData.ts` — giữ đúng
  3 món/giá của chặng P1/P2 để dự án là một sản phẩm tiến hoá). `chayBaiFetch()` nhận thêm
  tham số chọn API, truyền xuống worker qua trường `extra` của khuôn `pageWorkerRunner`.
- **5 bước P3** (`projectStepsP3.ts`): s1 trang giới thiệu HTML đúng chuẩn (lang + charset) ·
  s2 CSS mobile-first (có luật vùng chạm 44px — dạy đúng thứ dự án bắt buộc) · s3 trang đặt
  hàng chạy JS, giỏ **cộng dồn** · s4 báo cáo doanh thu SQL (JOIN + GROUP BY, **có tie-break**)
  · s5 milestone: menu lấy từ API thay vì gõ cứng.
- **Bài học rút ra khi soạn s4:** đề ban đầu "top 3 doanh thu" KHÔNG TẤT ĐỊNH — dữ liệu quán có
  hai món cùng 30.000đ, SQLite trả món nào trước cũng được. Đã đổi đề thành có `ORDER BY
doanh_thu DESC, ten ASC` và dạy luôn vì sao phải chỉ định cách xử hoà.
- **Cổng CI mới `projectStepsP3.test.ts`** — chạy code mẫu cả 5 bước bằng ĐÚNG engine học viên
  gặp (happy-dom · linkedom · sql.js), cộng **5 test "chống test dễ dãi"**: bỏ meta charset ·
  bỏ luật 44px · giỏ không cộng dồn · quên GROUP BY · gõ cứng bảng giá thay vì gọi API — mỗi
  ca phải làm milestone check RỚT. Cổng Python cũ nay lọc theo `language` (đưa HTML/SQL vào
  `python3` chỉ nhận về SyntaxError vô nghĩa).
- **Kiểm chứng:** 442 file / 5496 unit test xanh; E2E `programming-project` **5/5** (2 test mới:
  cả 5 bước P3 chấm thật trong Chromium qua 4 worker khác nhau, và khung xem trang bước HTML);
  cổng a11y **257/257**. Ngân sách: Initial JS 88,1% (linkedom vẫn nằm ngoài bundle chính).
- **Còn lại của môn:** U10–U12 (Git/công cụ/milestone — không chạy được trong sandbox, cần chốt
  cách tiếp cận) · thẻ SRS cho bậc P2/P3 · chặng P4–P5 của dự án trục (thuộc bậc sau).
- **Tiếp theo:** cần người dùng chốt hướng — U10–U11 Git/GitHub (đề xuất: dạng đọc-hiểu +
  Predict trên transcript lệnh Git thật, không chạy lệnh) hoặc thẻ SRS P2/P3.
