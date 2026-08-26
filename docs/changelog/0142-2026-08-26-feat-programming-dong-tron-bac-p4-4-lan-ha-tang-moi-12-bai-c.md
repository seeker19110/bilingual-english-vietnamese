# feat(programming): ĐÓNG TRỌN BẬC P4 — 4 làn hạ tầng mới + 12 bài + chặng dự án (2026-08-26)

Tiếp ngay sau L12 trong cùng PR. Bậc P4 nay **đủ 12 unit, 12 bài học, 6 bước dự án trục** và
là bậc đầu tiên chạm tới thứ sandbox trình duyệt không mô phỏng nổi — nên mọi thứ ở đây được
đặt theo hiến chương ba làn đã chốt ở L12.

**Hạ tầng — bốn làn mới, ba trong số đó KHÔNG đẻ thêm engine nào:**

- **`pyLanes.ts` là chỗ khai báo DUY NHẤT** cho các làn Python mở rộng: `fileCuaLan()` (module
  ghi vào workspace) + `noiCodeTheoLan()` (phần nối cuối). Cổng CI (python3) và trình duyệt
  (Pyodide) cùng gọi hai hàm này — đúng bài học cũ của `jsPrelude`: định dạng/khuôn chạy chỉ
  được viết một lần, nếu không cổng xanh mà học viên vẫn rớt.
- **Luật đã rút ra khi làm:** KHÔNG chèn prelude vào ĐẦU code học viên. Làm vậy số dòng trong
  traceback lệch đi và người mới đi tìm lỗi ở một dòng không tồn tại. Prelude luôn là FILE
  riêng; code học viên giữ nguyên dòng 1.
- **`pytestPrelude`** (làn `pytest`) — bản rút gọn của pytest: `assert`, `pytest.raises`,
  `pytest.approx`, `@pytest.mark.parametrize`, báo cáo `=== N passed, M failed ===`. Không có
  assertion rewriting nên khi `assert` trần thất bại, bộ chạy in DÒNG CODE gây lỗi thay cho
  bảng so sánh giá trị. Tự khai `[GIA LAP]` ở dòng đầu.
- **`httpSimPrelude`** (làn `httpsim`) — module `requests` giả lập: mã trạng thái thật, 404 /
  422 / 500 và `ConnectionError` khi gọi ra ngoài API mẫu.
- **`apiSimPrelude`** (làn `apisim`) — gói `fastapi` giả lập: `@app.get/post/put/delete`, tham
  số đường dẫn có đổi kiểu, `HTTPException`, 404/405/422, `TestClient`, **SQLite thật**. Đây là
  làn buộc workspace (cả Pyodide lẫn cổng CI) phải **tạo được thư mục con**, vì
  `from fastapi.testclient import TestClient` đòi `fastapi` là một GÓI Python thật.
- **Làn `typescript`** — làn DUY NHẤT phải ra khỏi trình duyệt: `POST /api/programming/ts-check`
  chạy `tsc` thật (strict) rồi trả `{loi, js}`; còn lỗi kiểu thì client **KHÔNG chạy gì** (chủ
  ý sư phạm: giá trị của TypeScript nằm ở chỗ nó chặn TRƯỚC khi chạy), sạch kiểu thì JavaScript
  sinh ra chạy trong Worker JS đã có. **Server chỉ biên dịch, không bao giờ chạy code học
  viên** — không eval, không tiến trình con; rủi ro còn lại đúng bằng "tốn CPU", đã chặn bằng
  auth + rate-limit 30/phút + giới hạn 8.000 ký tự. `typescript` được **chuyển từ
  devDependencies sang dependencies** vì nay là import lúc chạy của server.

**Nội dung 12 bài (mỗi unit một bài):** U1–U4 OOP · kế thừa và khi nào ĐỪNG dùng OOP · refactor
có kỷ luật (composition) · lỗi nghiệp vụ + logging → U5–U6 pytest và "test giỏi là test LÀM ĐỎ
được code sai" → U7 HTTP/REST → U8–U9 backend CRUD và hợp đồng JSON + luật KHÔNG TIN CLIENT →
U10–U11 type/interface và generic → U12 milestone (API thư viện: ráp class + lỗi có mã + thứ
tự kiểm 422/404/409).

**Chặng P4 của dự án trục — 6 bước** (`projectStepsP4.ts`): class `Mon`/`Menu` → `HoaDon` bằng
kết hợp → lỗi nghiệp vụ + log → test pytest cho lõi tính tiền → API CRUD món → **milestone**
API đơn hàng đủ hợp đồng cho frontend. Bộ số tiền dùng lại đúng luật giảm giá chặng P1, có test
bất biến canh hai nơi không nói lệch nhau.

**Kiểm chứng (chạy thật, không suy đoán):** 452 file / **5865 test xanh**; coverage branches
90,24% (sàn 90) — biên độ vẫn mỏng, xem nợ kỹ thuật #7. Cổng
`lessonsPython.test.ts` chạy python3 thật cho cả ba làn Python (gồm 6 bước dự án chặng P4);
cổng mới `lessonsTs.test.ts` chạy **tsc thật** — mã lỗi TS trong test-case là mã có thật, không
phải đoán (nó đã bắt được một lần soạn nhầm `TS2345` thành `TS2322`). E2E Chromium chạy thật
bài `p4-u6-l1` (làn pytest) và `p4-u8-l1` (làn apisim — đường ghi gói vào thư mục con của
Pyodide). `tsRunner.test.ts` canh hợp đồng client: còn lỗi kiểu thì TUYỆT ĐỐI không chạy code.

**Một lỗi hiệu năng CI bắt được, đáng ghi lại:** mỗi lần `ts.createProgram` là một lần đọc và
phân tích lại toàn bộ `lib.es2020.d.ts` (~2–5 giây), nên cổng TS hết giờ 5 giây trên runner.
Sửa tận gốc bằng cách nhớ SourceFile của lib ở mức module (`tsPrelude.ts`): lượt đầu ~0,9 giây,
các lượt sau ~40ms. Việc này quan trọng hơn cả cổng CI — nó chính là CPU mà server tiêu cho
MỖI lần học viên bấm "Chấm bài".

**Nợ / việc còn lại của môn:** bậc P5–P6 (CTDL-GT, bảo mật, deploy thật, 4 track chuyên sâu) —
theo hiến chương, deploy và judge đa ngôn ngữ **không mô phỏng**, sẽ cần đặc tả riêng.
