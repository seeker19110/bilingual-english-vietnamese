# feat(programming): ĐÓNG TRỌN BẬC P5 — hiến chương "đo được thì mới dạy được" + 9 bài + chặng dự án cuối (2026-08-26)

Bậc P5 xong nghĩa là môn Lập trình có **trọn vẹn đường đi P1 → P5** — từ dòng `print` đầu tiên
tới một API có ràng buộc, có giao dịch, có chống injection và sẵn sàng ra Internet. **Không có
hạ tầng mới nào** ở PR này: bốn làn đã dựng ở P4 (`python` · `sql` · `apisim` · `pytest`) chở
đủ toàn bộ nội dung. Thứ phải chốt trước là CÁCH CHẤM, không phải engine.

- **Hiến chương bậc P5** — `docs/research/dac-ta-bac-p5-deploy-va-lan-c-2026-08-26.md`:
  - **Luật số 1: chấm bằng PHÉP ĐẾM, không bằng ĐỒNG HỒ.** Bài đầu bậc là big-O, và phản xạ tự
    nhiên là cho học viên bấm giờ rồi chấm "phải nhanh hơn X giây". Cấm — cùng một code chạy
    trên Pyodide điện thoại và trên runner CI lệch nhau cả chục lần (test flaky, Tầng 1b của
    `QUY-TRINH-AUDIT.md`), và big-O vốn nói về _tốc độ tăng_ chứ không nói về giây. Đồng hồ để
    NHÌN THẤY (bước ③ và ⑦), bộ đếm thao tác để CHẤM (bước ⑥).
  - **Deploy vẫn KHÔNG mô phỏng** (giữ nguyên quyết định của hiến chương P4 §5). Cách thi hành:
    tách phần đo được ra khỏi phần không đo được — U8 chấm thứ quyết định 90% ca deploy hỏng
    thật (ứng dụng đọc cấu hình từ `os.environ`, bí mật không nằm trong code), còn thao tác trên
    nền tảng + URL sống thuộc làn C, tự khai + bằng chứng, **không chấm hộ**.
  - **Kết luận đóng một câu hỏi để ngỏ từ đặc tả gốc:** KHÔNG cần judge server đa ngôn ngữ ở P5.
    Nó chỉ cần khi mở track Java/Go/C ở P6, và lúc đó phải có đặc tả riêng về cô lập tiến trình.
  - Bảo mật dạy bằng CHÍNH lỗi của mình: cho nổ trước, vá sau. XSS chỉ dạy nhận biết + về nhà,
    vì bộ chạy DOM của môn không dựng được ca nổ trung thực — không chấm thứ mình không kiểm
    chứng được.

**Nội dung 9 bài (mỗi unit một bài):** U1 big-O (đếm so sánh: tuyến tính 1.000 vs nhị phân 10)
→ U2 tìm kiếm & sắp xếp (sắp xếp CHÈN chứ không phải CHỌN — chọn luôn tốn đúng n(n-1)/2 nên học
viên tính nhẩm ra số mà không cần viết thuật toán) → U3 stack/queue/hash/đệ quy → U4 cây & đồ
thị (BFS tìm đường ngắn nhất trên bản đồ tuyến xe) → U5 thiết kế CSDL (`sql`: chuẩn hoá, khoá
ngoại, index, giao dịch) → U6 bảo mật (`python`: SQL injection + hash mật khẩu có muối) → U7
hiệu năng (O(n×m) → bảng băm trên 10.000 dòng) → U8 deploy (cấu hình từ môi trường, che bí mật
trong log) → U9 milestone (`apisim`: API đăng ký lớp — chỗ có hạn, ràng buộc ở tầng CSDL, giao
dịch, tham số `?`).

**Chặng P5 của dự án trục — 5 bước** (`projectStepsP5.ts`), là chặng CUỐI của môn: dựng lại CSDL
quán có khoá ngoại/CHECK/khoá chính ghép + giao dịch → đăng nhập chủ quán (pbkdf2 có muối) → đo
và sửa điểm chậm của báo cáo 10.000 đơn (300.000 → 10.000 thao tác) → cấu hình sẵn sàng deploy →
**milestone**: API cửa hàng đặt món/trừ kho/báo cáo, kèm yêu cầu làn C (URL https sống + bảng
biến môi trường + log khởi động). Luật tiền của quán giữ nguyên từ chặng P1.

**Quyết định soạn đáng ghi lại (đều rút từ thứ suýt sai khi làm):**

- **Bộ đếm dùng để chấm phải PHỤ THUỘC DỮ LIỆU.** Bản nháp U2 dùng sắp xếp chọn — số so sánh
  luôn là n(n-1)/2, tức học viên đoán ra đáp án mà không cần viết thuật toán. Đổi sang sắp xếp
  chèn thì số đếm chỉ ra đúng khi thật sự chạy đúng thuật toán.
- **Đồ thị của U4 dựng để mỗi cặp trạm có ĐÚNG MỘT đường ngắn nhất** — đã vét cạn mọi đường đi
  khi soạn. Có hai đường cùng độ dài thì kết quả phụ thuộc thứ tự duyệt hàng xóm và test-case
  so chuỗi trở thành test flaky theo cách soạn. Thứ tự hàng xóm cũng cố tình đặt đường DÀI
  trước, để lời giải đi theo chiều sâu bị bắt.
- **Danh sách in trong ngoặc vuông** (`Hang cho: [ca phe]`) ở U3: chấm "contains" trên chuỗi
  trần thì lời giải thừa phần tử vẫn đạt.
- **Test-case bảo mật phải TÁCH ĐƯỢC hai lời giải cùng "chạy đúng".** Ca `chu_quan' --` cho lời
  giải ghép chuỗi đăng nhập thành công không cần mật khẩu, lời giải dùng tham số `?` thì từ
  chối — đã chạy thật cả hai bản khi soạn để chắc ca này thật sự phân biệt được.
- **U6 chuyển từ làn `apisim` (dự kiến trong hiến chương) sang làn `python`** khi thi hành: bộ
  API giả lập của môn chưa có header, nên kể chuyện `Authorization: Bearer …` trên nó là bịa,
  vi phạm luật 1 của hiến chương P4. Phần phiên đăng nhập qua header để ở bước ⑦, làn C. Hiến
  chương đã sửa lại cho khớp thực tế thi hành.

**Kiểm chứng (chạy thật, không suy đoán):** trên nhánh trước khi gộp — 452 file / 5936 test
xanh, branches 90,27%. **Sau khi gộp `main` (đã có #691 chia sẻ vị trí): 456 file / 5996 test
xanh, branches 90,13%** (sàn 90 — biên độ mỏng đi vì #691, xem nợ kỹ thuật #7). Cổng
`lessonsPython.test.ts` chạy python3 thật cho
8 bài Python/apisim + cả 5 bước dự án chặng P5; `lessonsSql.test.ts` chạy SQLite thật cho bài
U5. Mọi con số kỳ vọng trong test-case (1.005.000 thao tác · 63.112 phép so sánh · mã băm
`114eaa6eba7a4653` · doanh thu 134.000) đều lấy từ lần chạy thật lúc soạn, không tính tay.
Initial JS 123,39kB/140kB (88,1%) — nội dung bài học nạp trễ nên không đụng ngân sách gói đầu.

**Nợ / việc còn lại của môn:** bậc P6 (4 track chuyên sâu: AI ứng dụng · backend cloud Go · hệ
thống C/Rust · luyện phỏng vấn thuật toán) — theo đặc tả gốc, chỉ soạn sau khi P1–P5 chạy thật
với người học. Hạ tầng làn C cho milestone (kiểm URL sống bằng fetch HEAD phía server, có
rate-limit) chưa dựng — hiện phần này là tự khai + Companion soát bằng chứng.
