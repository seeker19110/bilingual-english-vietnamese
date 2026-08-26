# Bậc P5 — Đo được thì mới dạy được, deploy thì không mô phỏng (quyết định 2026-08-26)

> Hiến chương của bậc P5, nối tiếp `dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md`. Mọi PR nội
> dung P5 phải theo. Trả lời hai câu hỏi mà bậc này bắt buộc phải chốt trước khi soạn:
> (1) dạy hiệu năng/thuật toán mà không có đồng hồ đáng tin thì chấm bằng gì;
> (2) deploy — thứ hiến chương P4 đã cấm mô phỏng — thì dạy ra sao.

## 1. Bậc P5 khác các bậc trước ở đâu

P1–P4 dạy "viết được cho chạy đúng". P5 dạy thứ khác hẳn: **cùng một kết quả đúng, có cách rẻ
và có cách đắt** — và người kỹ sư là người phân biệt được. Kèm theo đó là ba mảng mà đến bậc
này mới đủ nền để chạm: thiết kế CSDL tử tế, bảo mật nhập môn, và đưa sản phẩm ra Internet.

Hệ quả: bậc này KHÔNG cần engine mới nào. Bốn làn đã có (`python` · `sql` · `apisim` · `pytest`)
đủ chở toàn bộ nội dung. Cái phải chốt là **cách chấm**, không phải hạ tầng.

## 2. Luật số 1 của bậc — CHẤM BẰNG PHÉP ĐẾM, KHÔNG CHẤM BẰNG ĐỒNG HỒ

Bài đầu tiên của P5 là big-O. Phản xạ tự nhiên là cho học viên đo `time.perf_counter()` rồi
chấm "phải nhanh hơn X giây". **Cấm làm vậy**, vì ba lý do đã lường trước:

1. **Không tái lập được.** Cùng một code chạy trên Pyodide (WASM, máy học viên, có thể là điện
   thoại) và trên runner CI khác nhau cả chục lần. Ngưỡng giây nào cũng sai ở một trong hai nơi.
2. **Dạy sai bản chất.** Big-O nói về _tốc độ tăng_, không nói về số giây. Học viên đo được
   0,8 giây rồi kết luận "thuật toán tốt" là đã hiểu ngược.
3. **Test theo thời gian là test flaky** — đúng thứ Tầng 1b của `QUY-TRINH-AUDIT.md` bắt.

Thay vào đó, luật của bậc:

- **Đo thời gian là để NHÌN THẤY, chấm điểm là ĐẾM THAO TÁC.** Bài học vẫn cho học viên chạy
  thí nghiệm đồng hồ thật (bước ③ ví dụ mẫu và bước ⑦ về nhà) — đó là chỗ trực giác hình
  thành. Nhưng bước ⑥ (Make, có test-case) luôn chấm trên một **bộ đếm xác định**: số lần so
  sánh, số vòng lặp, số lần đọc CSDL. Cùng một input thì mọi máy cho cùng một con số.
- **Test-case của bài hiệu năng phải phân biệt được hai lời giải cùng ra kết quả đúng.** Nếu
  bộ test cho lời giải O(n²) đi qua thì bài đó chưa dạy được gì: thêm ca ẩn dựng dữ liệu đủ
  lớn để chỉ lời giải đúng độ phức tạp mới trả lời nổi.

## 3. Làn C và deploy — không mô phỏng, không chấm hộ

Hiến chương P4 §5 đã chốt: "Không mô phỏng deploy. Deploy là nội dung P5 và bắt buộc làn C."
Giữ nguyên, và nói rõ thêm cách thi hành:

| Thứ                                | Làm ở đâu                                     | Hệ thống chấm thế nào                         |
| ---------------------------------- | --------------------------------------------- | --------------------------------------------- |
| Cấu hình bằng biến môi trường      | làn A (`python`, `os.environ` thật)           | test-case bình thường — đây là CODE, đo được  |
| Hash mật khẩu, chống SQL injection | làn A (`python` — `sqlite3` + `hashlib` thật) | test-case bình thường                         |
| Thiết kế schema, index, giao dịch  | làn A (`sql` — SQLite thật)                   | test-case bình thường                         |
| **Dựng máy chủ, deploy, HTTPS**    | **làn C — máy thật của học viên**             | **KHÔNG chấm tự động. Tự khai + bằng chứng.** |

Luật kèm theo:

1. **Tách phần đo được ra khỏi phần không đo được.** Unit deploy (U8) không dạy "bấm nút trên
   Render" như nội dung chính — nội dung chấm được của nó là thứ khiến deploy thành công hay
   thất bại trong 90% trường hợp thật: **ứng dụng đọc cấu hình từ môi trường, và bí mật không
   nằm trong code**. Phần thao tác nền tảng nằm ở bước ⑦, làn C.
2. **Không hứa hộ nền tảng.** Bài học KHÔNG ghi tên một nhà cung cấp free-tier cụ thể như thể
   nó sẽ còn miễn phí mãi (các nền tảng đổi chính sách liên tục). Bài dạy _tiêu chí chọn_ và
   _thứ phải chuẩn bị_; danh sách nền tảng cụ thể để ở phần về nhà, ghi rõ "kiểm lại chính
   sách hiện hành trước khi đăng ký".
3. **Milestone P5 = hoàn thành môn, nhưng vẫn không chấm hộ.** Học viên nộp URL sống + link
   repo; hệ thống kiểm URL có sống hay không (fetch HEAD, có rate-limit — hạ tầng của PR sau),
   Companion đối chiếu bằng chứng và **có quyền nói "chưa đủ căn cứ"**. Không có URL sống thì
   không có dấu hoàn thành — đúng luật "không giả vờ" đã theo từ P3-U10.

## 4. Bảo mật — dạy bằng CHÍNH lỗi của mình, không bằng danh sách

OWASP top 3 (injection · XSS · auth hỏng) rất dễ trượt thành bài học thuộc lòng. Luật của bậc:
mỗi lỗ hổng phải được **cho nổ trước, vá sau, trên chính code học viên vừa viết ở bậc trước**.

- **Injection:** dựng câu SQL bằng ghép chuỗi rồi cho một input "hiền lành" phá tan bảng —
  học viên tự thấy. Rồi vá bằng tham số `?`. Chấm được: ca ẩn đưa vào input hiểm.
- **Auth:** lưu mật khẩu thô rồi in bảng ra là hiểu ngay vấn đề. Vá bằng hash có muối
  (`hashlib.pbkdf2_hmac` — có thật trong Pyodide, không cần thư viện ngoài).
  Unit này chạy ở làn A chứ không phải làn B: `sqlite3` và `hashlib` là thật, còn bộ API giả
  lập của môn chưa có header nên kể chuyện `Authorization: Bearer …` trên nó sẽ là bịa —
  phần phiên đăng nhập qua header để ở bước ⑦, làn C.
- **XSS** dạy ở mức nhận biết trong phần lý thuyết + về nhà: bộ chạy DOM của môn không phải
  trình duyệt đầy đủ nên không dựng được ca nổ trung thực; **không giả vờ chấm** thứ mình
  không kiểm chứng được (đúng luật 3 của hiến chương P4).

## 5. Áp vào từng unit P5

| Unit                  | Làn | Ngôn ngữ | Ghi chú                                                                            |
| --------------------- | --- | -------- | ---------------------------------------------------------------------------------- |
| U1 Big-O trực quan    | A   | `python` | chấm bằng bộ đếm so sánh; đồng hồ chỉ để nhìn                                      |
| U2 Tìm kiếm & sắp xếp | A   | `python` | nhị phân + sort; ca ẩn đủ lớn để loại lời giải quét tuyến tính                     |
| U3 CTDL nền           | A   | `python` | stack/queue/dict/đệ quy — mỗi cấu trúc gắn một việc chỉ nó làm gọn                 |
| U4 Cây & đồ thị       | A   | `python` | BFS/DFS trên bản đồ có thật (tuyến xe buýt), không dùng thư viện                   |
| U5 Thiết kế CSDL      | A   | `sql`    | chuẩn hoá, khoá ngoại, index, giao dịch — SQLite thật                              |
| U6 Bảo mật nhập môn   | A   | `python` | injection + hash mật khẩu, nổ trước vá sau — `sqlite3` thật, không cần API giả lập |
| U7 Hiệu năng          | A   | `python` | O(n²) → tra bảng băm trên 10.000 đơn; ca ẩn loại lời giải chậm                     |
| U8 Deploy             | A+C | `python` | phần chấm: cấu hình bằng môi trường + không bí mật trong code                      |
| U9 Milestone P5       | B+C | `apisim` | ráp cả bậc; phần deploy thật nằm ở làn C, tự khai + bằng chứng                     |

## 6. Điều KHÔNG làm ở P5 (ghi để phiên sau khỏi mở lại)

- **Không dựng judge server đa ngôn ngữ.** Đặc tả gốc để ngỏ cho "P5–P6"; sau khi soạn xong P5
  bằng bốn làn sẵn có, kết luận là **không cần** — nó chỉ cần thiết khi mở track Java/Go/C ở
  P6, và lúc đó phải có đặc tả riêng về cô lập tiến trình.
- **Không tự động push/deploy hộ học viên**, không xin OAuth scope ghi lên GitHub của họ (giữ
  nguyên quyết định của đặc tả dự án trục §4.5).
- **Không đo thời gian để chấm điểm** (luật §2) — kể cả khi "chỉ một ca thôi".
