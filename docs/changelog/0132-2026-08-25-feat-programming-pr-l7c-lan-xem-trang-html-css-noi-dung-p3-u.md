# feat(programming): PR-L7c — làn xem trang HTML/CSS + nội dung P3-U4/U5 (2026-08-25)

Mảnh hạ tầng CUỐI của bậc P3. Môn Lập trình nay chạy được **4 ngôn ngữ**: Python, JavaScript,
SQL, HTML/CSS.

- **Khung xem trang = iframe `sandbox=""`** (`components/HtmlPreview.tsx`) — sandbox RỖNG thu
  hồi toàn bộ quyền: script không chạy, form không gửi, không đụng storage/cookie trang cha.
  **Không có script thì không có vòng lặp vô hạn**, nên rủi ro treo trang buộc bài JavaScript
  phải né bằng Worker ở đây KHÔNG tồn tại — đó là lý do tách U4–U5 khỏi U6.
- **Chấm bằng BẢN MÔ TẢ CÂY DOM** (`htmlPrelude.ts`), không so chuỗi HTML thô. So thô sẽ bắt
  học viên gõ trùng từng dấu cách — dạy sai. `grading.ts` dùng lại y nguyên, không phải đổi.
- **CSS chuẩn hoá trước khi chấm**: mỗi luật một dòng, khai báo sắp theo bảng chữ cái, bỏ chú
  thích/khoảng trắng thừa → thứ tự gõ không ảnh hưởng kết quả (và bài Predict dạy đúng điều đó).
- **`htmlRunner.ts` không dùng Worker** — có lý do: `DOMParser` không thực thi `<script>`, việc
  duy nhất là phân tích cú pháp, chạy tức thì. Dùng Worker ở đây chỉ là nghi thức thừa.
- **Nội dung P3-U4** (bộ khung chuẩn, `lang`/`charset`, thẻ theo NGHĨA chứ không theo hình
  dạng, không nhảy cóc tiêu đề, `alt` cho ảnh) và **P3-U5** (box model, flex, mobile-first,
  vùng chạm 44px, tương phản) — hai bài dạy đúng luật a11y bắt buộc của dự án ngay từ đầu.

**Khe hở CÒN LẠI, cần biết:** parser ở cổng CI là happy-dom, trong trình duyệt là `DOMParser`
thật — **hai engine phân tích cú pháp khác nhau** (bộ đi cây thì dùng chung). Đây là khe hở
duy nhất còn lại của môn sau khi mạch SQL đã khép được. Lưới bắt: E2E chạy code mẫu của cả hai
bài trong Chromium thật, cùng cách mạch Python đang bù cho khe `python3` vs Pyodide.

- **Kiểm chứng:** 439 file / 5455 test xanh; cổng HTML 8 test + `htmlPrelude` 8 test. E2E
  `programming-lesson` **14/14**, gồm 3 test mới: code mẫu U4/U5 đạt trong Chromium thật, và
  một test nhét `<script>` vào bài để chứng minh nó KHÔNG chạy trong khung xem trang.
  Cổng a11y 152/152 xanh. Ngân sách: Initial JS 88,1%.
- **Còn lại của môn:** U6 DOM/sự kiện (cần cơ chế riêng: iframe có script thì bài toán treo
  trang quay lại) · U7 fetch · U10–U12 (Git/công cụ/milestone) · chặng P3 dự án trục · thẻ SRS.
- **Tiếp theo:** U6 — bài DOM đầu tiên, phải chốt cách chạy JavaScript CÓ DOM mà không treo
  trang (hướng đang nghĩ: iframe `allow-scripts` + đồng hồ canh ở trang cha, cắt iframe khi
  quá giờ — iframe bị gỡ thì script trong đó chết theo).
