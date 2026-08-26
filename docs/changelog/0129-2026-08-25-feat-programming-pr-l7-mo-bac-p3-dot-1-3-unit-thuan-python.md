# feat(programming): PR-L7 — mở bậc P3, đợt 1: 3 unit thuần Python (2026-08-25)

Bắt đầu bậc **P3 "Làm được việc thật"**. Đợt này soạn 3 unit KHÔNG cần hạ tầng mới, để có giá
trị học ngay mà chưa phải dựng sandbox JS / SQLite WASM:

- **P3-U1 "Thư viện ngoài"** (`lessons/p3u1.ts`) — thư viện chuẩn vs thư viện ngoài, `pip
install` + `requirements.txt`, 3 cách import, và kỹ năng lõi của unit: **đọc tài liệu một
  thư viện lạ** qua 4 câu hỏi (nhận gì / trả gì / lỗi khi nào / ví dụ ở đâu), `help()`/`dir()`.
- **P3-U2 "JSON"** (`lessons/p3u2.ts`) — `dumps/loads/dump/load` (mẹo "có s = String, không s =
  File"), bảng đổi kiểu, dữ liệu lồng nhau, 3 cái bẫy thật (chỉ nháy kép · khoá luôn thành
  chuỗi · `ensure_ascii=False` cho tiếng Việt). Bài Predict chính là bẫy khoá số → chuỗi.
- **P3-U3 "Dữ liệu bảng"** (`lessons/p3u3.ts`) — khuôn 3 bước ĐỌC → TỔNG HỢP → TRÌNH BÀY:
  `csv.reader`/`DictReader` (và **vì sao không được dùng `split(",")`** — ô có dấu phẩy bọc nháy
  kép), khuôn gộp nhóm bằng `dict.get(k, 0)`, sắp xếp `key=lambda`, biểu đồ cột bằng ký tự `#`.

**Quyết định phạm vi (chốt cùng người dùng 2026-08-25).** PR-L7 gốc định soạn cả bậc P3, nhưng
P3 gồm 3 mạch cần hạ tầng chưa có: Web (U4–U7, cần sandbox JS trong iframe), SQL (U8–U9, cần
SQLite WASM), Git/GitHub (U10–U11, về bản chất không chạy được trong sandbox). Chọn làm phần
Python trước vì có giá trị học ngay và không đụng hạ tầng.

**Ràng buộc người soạn phải nhớ (đã ghi comment đầu 2 file):** bài Make chỉ được dùng **thư viện
chuẩn**. Cổng `lessonsPython.test.ts` chạy `python3` trần trên runner CI và sandbox Pyodide
trong trình duyệt **không có mạng** → `requests`, `pandas`, `matplotlib` không import được. Ba
thư viện đó vẫn được dạy đầy đủ ở phần lý thuyết + giao ở **bài về nhà làm trên máy thật**.

- **Kiểm chứng:** cổng nội dung mạnh nhất của môn chạy qua — 80 test `lessonsPython.test.ts`
  (23 bài × 3 loại + 11 bước dự án) chạy `python3` THẬT: code mẫu đạt hết test-case, ví dụ mẫu
  chạy không lỗi, đáp án Predict khớp output thật. Toàn bộ: 434 file / 5415 test xanh.
  Ngân sách bundle vẫn thoáng (Initial JS 88,1%) vì bài học nằm ở chunk tách, không vào entry.
- **Sửa kèm:** `lessons.test.ts` đang lấy `p3-u1` làm mốc "unit chưa mở" → đổi sang `p4-u1`.
- **Còn lại của môn:** P3-U4→U12 (web/SQL/Git — cần PR hạ tầng riêng: sandbox JS + sql.js),
  chặng P3 của dự án trục, và thẻ SRS cho bài P2/P3.
- **Tiếp theo:** PR-L7b hạ tầng sandbox JS + SQLite WASM (mở đường cho U4–U9), hoặc dọn nợ kỹ
  thuật 🔴 số 5 (`eval:tutor --write-baseline` với key thật — việc tay của người dùng).
