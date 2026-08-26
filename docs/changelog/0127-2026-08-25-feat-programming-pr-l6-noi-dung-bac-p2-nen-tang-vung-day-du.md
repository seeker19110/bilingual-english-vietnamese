# feat(programming): PR-L6 — nội dung bậc P2 "Nền tảng vững" đầy đủ 10 unit (2026-08-25)

Tiếp nối MVP môn Lập trình (PR-L1..L5 đã xong). Bậc P2 nay **mở trọn**, học viên đi hết P1
là học tiếp được ngay, không gặp ô "Sắp mở" giữa đường.

- **10 bài học khuôn 8 bước** (`packages/subject-programming/lessons/p2u1..p2u10.ts`, mỗi
  unit một file đúng quy ước PR-L4): hàm · danh sách · chuỗi chuyên sâu · dict & tuple ·
  comprehension + sort · file & CSV · try/except · datetime & math · chia vai trò + `main()`
  · milestone ráp cả bậc (sổ bán hàng một phiên). Mỗi bài đủ ① móc thực tế → ② khái niệm →
  ③ ví dụ mẫu chú thích từng dòng → ④ Predict → ⑤ Parsons → ⑥ Make chấm test-case (có ca
  RANH GIỚI + ca ẩn) → ⑦ bài về nhà. Ngữ cảnh bám quán nước Việt Nam, nối thẳng vào dự án
  trục T1 "Cửa hàng của tôi".
- **Mỗi bài dạy đúng MỘT cái bẫy kinh điển** ở bước Predict, chọn theo lỗi người mới hay
  mắc thật: hàm sửa tham số không đổi biến ngoài · chỉ số list đếm từ 0 · `strip()` trả chuỗi
  mới chứ không sửa tại chỗ · gán đè khoá dict · `.sort()` trả về `None` · mở file chế độ
  `"w"` lần hai là xoá trắng · bắt được lỗi thì chương trình chạy tiếp · `ceil`/`floor`/
  `round` khác nhau · `def` mà không gọi thì không chạy · `continue` khác `break`.
- **Cổng nội dung chạy THẬT**: `lessonsPython.test.ts` nay 66 test — mọi `sampleSolution`,
  `workedExample`, `predict` của 20 bài (P1+P2) đều được thực thi bằng `python3` rồi chấm
  bằng ĐÚNG engine học viên gặp. Test `lessons.test.ts` đổi từ "mọi unit P1 có bài" thành
  `it.each(['p1','p2'])` — bậc nào tuyên bố mở thì không được hở unit nào.
- **Chốt khác biệt python3 ↔ Pyodide bằng e2e THẬT** (bài học lớn nhất của đợt này): cổng CI
  chấm bằng python3 của runner, còn học viên chạy CPython bản WASM trong trình duyệt. Hai bài
  rủi ro nhất — U6 (ghi/đọc FILE, Pyodide dùng FS trong bộ nhớ) và U8 (`datetime`/`math`) —
  được chạy nguyên code mẫu TRONG TRÌNH DUYỆT ở `e2e/programming-lesson.spec.ts`; nếu lệch
  thì đỏ ngay chứ không để "xanh ở CI, rớt ở người học".
- **Test python3 nay chạy trong thư mục TẠM** (`mkdtemp`) — bài U6 ghi file CSV thật, không
  được để nó rơi vào cây mã nguồn khi chạy test.
- Kiểm chứng: typecheck ✅ · lint 0 cảnh báo ✅ · format ✅ · test **5394/5394** ✅ · build ✅ ·
  size-limit **122,84/123 kB** (nội dung bài nằm trong chunk lười `dist/js/lessons-*.js`, KHÔNG
  vào bundle khởi động — phần tăng 0,19 kB là chi phí gián tiếp) · e2e bài học **6/6** (4 ca cũ
  - 2 ca Pyodide mới).
- **KHÔNG kèm trong PR này (cố ý, nói rõ để khỏi tưởng sót):** (1) 5 bước DỰ ÁN TRỤC chặng P2
  — `ProgrammingProjectPage` hiện gắn cứng `P1_PROJECT_STEPS`, mở chặng P2 cần thêm phần chọn
  chặng + workspace nhiều file, đủ lớn để làm một PR riêng (PR-L6b); (2) thẻ SRS cho bài P2.
- **Rủi ro cần biết:** biên độ bundle chỉ còn **0,16 kB** (nợ kỹ thuật số 7 đã ghi). PR tới
  chạm UI phải chạy `npm run budget` trước khi viết code, không phải sau.
- **Tiếp theo:** PR-L6b (dự án trục chặng P2) hoặc PR-L7 (nội dung P3 — cần thêm sandbox JS +
  SQL WASM). Vẫn còn treo: chạy `npm run eval:code-feedback` và `eval:tutor` với key thật.
