# feat(programming): PR-L7d — bài DOM (Worker + linkedom) + P3-U6-L2 (2026-08-25)

Mạch Web của bậc P3 đã đủ: HTML tĩnh (U4–U5) → **JavaScript tác động lên trang (U6)**.

- **Chấm bài DOM chạy trong Web Worker với `linkedom`** — thư viện DOM chạy được cả ở Node lẫn
  trình duyệt. Cổng CI và Worker gọi **CÙNG hàm `chayBaiDom()`** với **CÙNG thư viện**, nên
  mạch DOM không có khe hở "xanh ở CI, rớt ở người học" (giống mạch SQL, khác mạch Python).
- **Vì sao Worker chứ không chấm trong iframe:** script học viên có thể lặp vô hạn; trong
  Worker thì `terminate()` được. Iframe **chỉ để XEM** trang chạy, không dính việc chấm.
- **Trường `domHtml`** trong `LessonSchema` — trang có sẵn mà script tác động lên. Có `refine`
  bắt buộc: bài `dom` phải có `domHtml`, ngôn ngữ khác thì cấm.
- **`stdinLines` mang chuỗi HÀNH ĐỘNG người dùng** (`click #nut`, `dien #o = giá trị`) thay vì
  dòng nhập — với bài DOM thì thao tác người dùng CHÍNH LÀ đầu vào, nên dùng lại đúng ô đó
  thay vì đẻ thêm kiểu test-case mới.
- **Khung xem trang chạy khi BẤM NÚT, không chạy theo từng phím gõ** — gõ dở `while (true)` mà
  khung tự chạy là tự bắn vào chân. Có E2E chốt khung chưa xuất hiện trước khi bấm.
- **Nội dung P3-U6-L2** — port bài tiền điện bậc thang từ P1 lên web (đúng dự án mini của đặc
  tả): tìm/sửa phần tử, `addEventListener`, và 4 cái bẫy (`value` luôn là chuỗi · script đặt
  trước nội dung · truyền hàm chứ không gọi hàm · hàm xử lý chạy lúc sau).

**Sửa kèm — `htmlPrelude` chuyển sang `hasAttribute`:** `linkedom` trả chuỗi rỗng cho
`getAttribute('class')` của thẻ không có class, nên kiểm bằng `null` đẻ ra `class=""` rác khắp
bản mô tả. `hasAttribute` đúng ở mọi engine và vẫn giữ được `alt=""` của ảnh trang trí.

- **Kiểm chứng:** 5465 test xanh; cổng DOM 10 test. E2E `programming-lesson` **17/17** và a11y
  **152/152**, chạy đúng cấu hình CI (`--workers=1`). Ngân sách: Initial JS 88,2% —
  `linkedom` (~94KB gzip) nằm ở chunk worker, không vào entry.
- **Ghi nhận:** lúc chạy E2E song song ở máy local (CI đặt `workers: 1`) có vài test rớt luân
  phiên do 17 test nặng WASM/Worker giành tài nguyên trên một dev server. Chạy đúng cấu hình
  CI thì 17/17 xanh. Đây là giới hạn của máy chạy thử, không phải bất ổn của bộ test trên CI.
- **Còn lại của môn:** U7 fetch · U10–U12 (Git/công cụ/milestone) · chặng P3 dự án trục · thẻ SRS.
- **Tiếp theo:** U7 (fetch + render danh sách) — cần quyết định cách chặn/giả lập mạng trong
  sandbox, vì sandbox không có mạng và cổng CI cũng không được gọi API thật.
