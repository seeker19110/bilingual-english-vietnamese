# feat(programming): PR-L9 — Git/GitHub + dòng lệnh (U10–U11) qua BỘ MÔ PHỎNG (2026-08-25)

Hai unit cuối bậc P3 từng bị hoãn với lý do "về bản chất không chạy được trong sandbox" —
nay mở được bằng cách **mô phỏng**, không phải bằng cách hạ chuẩn xuống đọc-hiểu.

- **`gitSim.ts` — terminal giả lập thuần TypeScript**: giữ đúng ba khái niệm lõi (THƯ MỤC
  LÀM VIỆC · VÙNG CHỜ · LỊCH SỬ COMMIT), chạy `init/status/add/commit/log/branch/switch/merge`
  - shell tối giản (`pwd/ls/cat/echo>/rm`). Học viên **gõ lệnh thật**, thấy output như
    terminal, bài Make chấm bằng trạng thái kho cuối. **Tất định tuyệt đối** (mã commit `c1,
c2…`, không `Date.now()`, không random) — không tất định thì không làm cổng chấm được.
- **Mô phỏng đúng cả những chỗ hay làm người mới hoảng:** đổi nhánh thì file "biến mất"
  (thư mục làm việc = ảnh chụp nhánh đang đứng) · phân biệt **tua nhanh** với **commit gộp** ·
  `git add` chụp NỘI DUNG nên sửa sau khi add phải add lại · lỗi có thông điệp tiếng Việt
  nói rõ cách sửa thay vì thông điệp git thật khó hiểu.
- **Luật "không giả vờ":** thứ mô phỏng không làm được (`push/pull/clone` cần mạng, xung đột
  thật, venv) thì **nói thẳng** khi học viên gõ vào, và bài dạy chúng bằng lý thuyết + việc
  về nhà trên máy thật. Cổng CI có test canh: các lệnh đó **cấm** xuất hiện trong code CHẠY
  của bài (ví dụ mẫu/Predict/Parsons/code mẫu).
- **Không có khe hở CI ↔ trình duyệt:** engine là TypeScript thuần, cổng và app gọi CHUNG hàm
  `chayLenh()` — không hai bản cài đặt như mạch Python (python3 vs Pyodide) hay HTML
  (happy-dom vs DOMParser). `gitRunner` chạy thẳng main thread, không cần worker (lệnh hữu
  hạn, không thực thi code học viên nên không thể treo).
- **Nội dung 3 bài:** U10-L1 vòng lặp hằng ngày add/commit/log + vì sao có vùng chờ ·
  U10-L2 nhánh & gộp (kèm cái bẫy "file biến mất") · U11-L1 dòng lệnh + cấu trúc dự án
  chuẩn (README/.gitignore, nhấn mạnh tai nạn commit nhầm `.env`).
- **Kiểm chứng:** 443 file / 5527 unit test xanh; cổng mới `lessonsGit.test.ts` **31 test**
  (15 test riêng cho engine: tất định, kho mới mỗi lượt, ba nhóm của `status`, tua nhanh vs
  commit gộp, cảnh báo xung đột, lệnh cần mạng…). E2E `programming-lesson` **22/22** (2 test
  mới: bài Git chấm thật trong trình duyệt, và "quên `git add`" hiện lỗi dạy được).
  a11y **257/257**. Ngân sách Initial JS 88,1%.
- **Sửa kèm (lỗi của PR-L8, CI bắt được):** cổng `codemap -- cycles` đỏ vì
  `projectSteps.ts ↔ projectStepsP3.ts` tạo **chu trình import**. Đã tách schema/kiểu/helper
  của một bước sang `projectStepTypes.ts` — hai file nội dung cùng import xuống đó, phụ thuộc
  chỉ còn một chiều.
- **Nợ kỹ thuật #7 đã thành sự cố thật (và đã trả):** cổng `quality` đỏ lần hai vì coverage
  **branches tụt xuống 89,86%** (ngưỡng 90%) — engine `gitSim` mới có nhiều lối rẽ chưa được
  chạy lần nào. Đã bổ sung 16 ca cho `gitSim` + 4 ca cho `gitRunner`: gitSim từ 88,1%/75,2%
  lên **100% dòng / 95,7% nhánh**, branches toàn dự án **90,23%**. Bài học: biên độ coverage
  mỏng (0,1–0,3 điểm) nghĩa là **mỗi file lớn thêm vào đều phải kèm test phủ nhánh ngay trong
  cùng PR**, không để dồn.
- **Còn lại của môn:** thẻ SRS cho bậc P2/P3 · U12 milestone chặng P3 · chặng P4–P5 của dự án
  trục (thuộc bậc sau).
- **Tiếp theo:** thẻ SRS P2/P3 (nối vào SRS chung đã có của môn English), hoặc U12.
