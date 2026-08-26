# feat(programming): PR-L6b — dự án trục chặng P2 (nhiều file) + nới ngân sách bundle (2026-08-25)

Đóng nốt phần cố ý để lại ở PR-L6. Dự án "Cửa hàng của tôi" nay đi được **hai chặng**:
P1 "Máy tính tiền" → P2 "Sổ sách tử tế".

- **Nới ngân sách trước khi viết code** (người dùng chốt): `.size-limit.json` JS **123 → 140
  kB**, CSS **16 → 18 kB**. Không phải nới cho vui: đo sau khi làm xong PR này là **123,4 kB**
  — với ngưỡng cũ thì CI đỏ. Ngưỡng coverage GIỮ NGUYÊN 90/90/90/90 (hạ sàn coverage là hạ
  chất lượng thật, khác với nới trần kích thước). Đã sửa cả `QUY-TRINH-AUDIT.md` và
  `PERFORMANCE_OPTIMIZATION.md` cho khớp số mới.
- **5 bước chặng P2** (`projectSteps.ts`, mỗi bước THÊM một khả năng chấm được, không phải
  đập đi viết lại): gọi món bằng TÊN qua dict + hàm `tinh_tien` → thêm món ngay lúc đang bán
  (dict sửa được lúc chạy) → ghi đơn ra `don_hang.csv` rồi ĐỌC LẠI file để chốt doanh thu →
  try/except chống nhập bậy → **milestone: tách 3 file** `cua_hang.py` / `logic.py` /
  `luu_tru.py`.
- **Ép tách file thật bằng `probeCode`** (điểm thiết kế đáng nhớ nhất): bước cuối KHÔNG chấm
  bằng cách chạy file chính — code gộp một file vẫn in ra output y hệt, chấm kiểu đó thì
  "tách vai trò" thành hình thức. Bộ chấm chạy một đoạn probe `from logic import tinh_tien`
  / `from luu_tru import ...` gọi thẳng hàm của học viên qua ranh giới module.
- **Workspace nhiều file chạy thật trong trình duyệt:** `pyodideWorker` nhận thêm `files`,
  ghi cây file vào FS bộ nhớ của Pyodide, `sys.path.insert` + `os.chdir` vào đó. Ba việc bắt
  buộc vì worker sống qua nhiều lượt chấm: xoá file lượt trước (không thì `don_hang.csv` cũ
  làm sai doanh thu), `sys.modules.pop` (không thì sửa `logic.py` không ăn), và **`os.chdir`
  ra ngoài TRƯỚC khi xoá thư mục** — lỗi `OSError: Resource busy` này chỉ xuất hiện trong
  Pyodide, python3 của CI không hề có; **e2e trình duyệt là thứ duy nhất bắt được nó**.
- **Client + API:** `loadProjectFiles`/`saveProjectFileAt` thay cặp hàm một-file cũ (đã xoá,
  không để hai đường song song); API `/api/programming/project` KHÔNG đổi — nó vốn đã là
  workspace nhiều file từ PR-L3b, chỉ client trước đây dùng có một file.
- **UI:** thanh chọn chặng (chặng sau khoá tới khi xong TRỌN chặng trước, trạng thái nằm
  trong query `?chang=` để chia sẻ/bookmark) + thanh file khi bước có nhiều file. Thanh file
  dựng bằng `nav` + `aria-current`, cố ý KHÔNG dùng `role="tablist"/"tab"` vì vai trò tab kéo
  theo hợp đồng bàn phím mũi tên mà ta chưa cài.
- **Sửa một lỗi hồi quy do chính đợt này gây ra:** effect đặt bước ban đầu ban đầu phụ thuộc
  `doneSteps`, nên vừa chấm đạt là nhảy bước ngay, cuốn mất bảng kết quả xanh + nút "Sang
  bước tiếp" (trái nhịp đã chốt ở PR-L3b). Đã chuyển sang `useRef` + cờ `loaded`; e2e P1 cũ
  chính là thứ bắt được.
- Kiểm chứng: typecheck ✅ · lint 0 cảnh báo ✅ · format ✅ · test **5406/5406** ✅ · coverage
  93,53/90,13/96,51/93,53 (sàn 90, không hạ) · build ✅ · size **123,4/140 kB** ·
  e2e dự án **3/3** (gồm ca P2 nhiều file chạy thật trong Pyodide) · a11y trang dự án **10/10**
  (5 theme × A/AA + AAA) · cổng python3 **71 test** (10/10 bước dự án của cả hai chặng).
- **Còn lại của môn:** chặng P3+ của dự án (cần sandbox JS + SQL WASM), thẻ SRS cho bài P2,
  và nội dung bậc P3 (PR-L7).
