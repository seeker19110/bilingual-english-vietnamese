# feat(programming): PR-L7b1 — hạ tầng chạy JavaScript + trường `language` (2026-08-25)

Mở đường cho mạch Web của bậc P3 (U4–U7). Trước PR này môn Lập trình chỉ chạy được Python.

- **`LessonSchema` thêm trường `language`** (`python` | `javascript` | `sql`) — **bắt buộc,
  KHÔNG có mặc định ngầm**: chọn sai ngôn ngữ nghĩa là bài không được cổng nào chấm, nên người
  soạn phải ghi rõ. 23 bài Python cũ đã gắn nhãn `'python'`.
- **Bộ chạy JavaScript** — `apps/dhcb/src/workers/jsWorker.ts` + `lib/jsRunner.ts`, song sinh
  với `pythonRunner.ts` (cùng hình dạng kết quả, cùng cách ngắt cứng khi quá giờ).
- **`lib/codeRunner.ts` — điểm vào DUY NHẤT**: trang bài học gọi `runLessonCode(language, ...)`,
  không tự chọn bộ chạy. Thêm SQL ở PR-L7b2 = thêm một nhánh ở đây, không rải if/else ra trang.
- **Cổng nội dung `lessonsJs.test.ts`** — song sinh với cổng Python: chạy code THẬT bằng
  `node:vm` (context rỗng: không `require`/`process`/`fetch`, có test chứng minh) rồi chấm bằng
  đúng `grading.ts` học viên gặp. Điểm này TỐT HƠN cổng Python: bài JS chạy cùng một ngôn ngữ ở
  cả hai nơi và dùng chung `jsPrelude.ts`, không có rủi ro "python3 khác Pyodide".
- **Bài mẫu P3-U6-L1 "JavaScript cho người đã biết Python"** — chứng minh đường đi thông từ nội
  dung → cổng CI → trình duyệt. Dạy bảng đối chiếu Python↔JS, `let/const`, và cái bẫy số một:
  `"5" + 3` ra `"53"` chứ không báo lỗi; luật luôn dùng `===`.

**Quyết định kỹ thuật: Worker chứ KHÔNG phải iframe** (đảo lại ý định ban đầu ghi ở PR-L7).
Script trong iframe chạy **cùng luồng với trang**, nên vòng lặp vô hạn — lỗi kinh điển của
người mới, bậc P1 dạy `while` — sẽ treo cứng cả app và không ngắt được. Worker `terminate()`
được, đúng lý do `pythonRunner.ts` chọn Worker. Có E2E chạy `while (true) {}` thật để chốt trang
không treo. Iframe vẫn sẽ cần cho **làn XEM TRANG HTML/CSS/DOM** (U4–U5) — bài toán khác, PR sau.

- **Kiểm chứng:** 436 file / 5428 test xanh; cổng JS 7 test + `jsPrelude` 6 test (có ca dữ liệu
  nhập chứa ký tự nguy hiểm vẫn là DỮ LIỆU, không chạy thành code). E2E `programming-lesson`
  8/8 xanh, gồm 2 test mới chạy THẬT trong trình duyệt: code mẫu bài JS đạt hết test-case, và
  vòng lặp vô hạn bị ngắt sau 5 giây mà trang vẫn phản hồi. Ngân sách: Initial JS 88,1%.
  Ghi nhận: lượt chạy E2E đầu tiên có 1 flake ở bài P1-U4 (chạy song song lúc khởi động nguội);
  chạy lại cả file 8/8 xanh, chạy riêng bài đó cũng xanh.
- **Còn lại của môn:** PR-L7b2 (sql.js + cổng SQL, mở U8–U9) · làn xem trang HTML/CSS/DOM cho
  U4–U6 · U7 fetch · U10–U12 (Git/công cụ/milestone) · chặng P3 của dự án trục · thẻ SRS P2/P3.
- **Tiếp theo:** PR-L7b2 — SQLite WASM (`sql.js`) tự host + cổng chấm SQL dùng CHUNG engine với
  trình duyệt.
