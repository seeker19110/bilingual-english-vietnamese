# Bậc P4 — Mô phỏng tới đâu, làm thật từ đâu (quyết định 2026-08-26)

> Trả lời câu hỏi đặt ra trước khi soạn P4: "dạy backend bằng mô phỏng tới đâu, phần nào
> chuyển hẳn sang làm trên máy thật + nộp bằng chứng". Đây là **hiến chương của bậc P4** —
> mọi PR nội dung P4 phải theo.

## 1. Vì sao phải chốt trước

P1–P3 chạy trọn trong sandbox trình duyệt (Pyodide · Worker JS · SQLite-WASM · fetch giả lập
· gitSim). Từ P4 mô hình này bắt đầu đuối: HTTP thật, server thật, deploy thật không mô phỏng
được trung thực. Mà **luật "không giả vờ"** của môn (đã đặt từ P3-U10 Git) cấm bịa ra một
"server" rồi bảo học viên rằng họ vừa chạy backend.

## 2. Luật phân tuyến (bất biến của P4)

Mỗi bài P4 phải rơi vào ĐÚNG MỘT trong ba làn, và **giao diện phải nói rõ đang ở làn nào**:

| Làn   | Tên                                    | Chạy ở đâu                         | Dùng cho                                                                    | Chấm bằng                                    |
| ----- | -------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| **A** | **Chạy thật trong sandbox**            | Pyodide / Worker                   | OOP (U1–U3), lỗi & logging (U4), test tự động (U5–U6), TypeScript (U10–U11) | test-case như P1–P3                          |
| **B** | **Mô phỏng KHAI BÁO MINH BẠCH**        | Pyodide + thư viện giả lập của môn | HTTP client (U7), định tuyến backend (U8–U9)                                | test-case chạy trên vật giả lập              |
| **C** | **Làm trên MÁY THẬT + nộp bằng chứng** | máy học viên                       | dựng server thật, gọi API có key thật, milestone U12                        | học viên tự khai + Companion soát bằng chứng |

Luật kèm theo, không được vi phạm:

1. **Làn B phải tự khai.** Mọi vật giả lập in ra dòng đầu tiên có chữ `[GIẢ LẬP]` và bài học
   nói rõ: "cái này KHÔNG phải server thật; nó chỉ chạy đúng phần định tuyến/xử lý để bạn
   hiểu cơ chế". Cấm dùng chữ "server của bạn đang chạy tại http://…" khi không có server.
2. **Làn B luôn có làn C đi kèm.** Mỗi unit làn B bắt buộc có bước ⑦ (ứng dụng về nhà) là
   phiên bản THẬT của chính bài đó trên máy học viên (`uvicorn`, `pytest`, `curl`), kèm mô tả
   bằng chứng cần chụp/dán. Học được cơ chế trong 5 phút ở làn B, rồi chạm vào cái thật ở làn C.
3. **Không chấm điểm làn C bằng cách đoán.** Không có server để kiểm chứng thì hệ thống
   KHÔNG được đánh dấu "đạt" thay học viên. Làn C dùng cơ chế tự khai + bằng chứng (giống
   khuôn milestone dự án trục đã có), và Companion đối chiếu bằng chứng đó, có quyền nói
   "chưa đủ căn cứ".
4. **Không dựng judge server đa ngôn ngữ ở P4.** Đặc tả gốc (§ "Judge server") để việc đó cho
   P5+ và phải có đặc tả riêng. P4 không mở cửa này.

## 3. Áp vào từng unit P4

| Unit                | Làn | Hạ tầng cần thêm                                                                                                                                                                                                                                       |
| ------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| U1–U3 OOP, refactor | A   | không — Pyodide sẵn có                                                                                                                                                                                                                                 |
| U4 lỗi & logging    | A   | không (`logging` có trong Pyodide; output qua stderr → gộp vào stdout)                                                                                                                                                                                 |
| U5–U6 test tự động  | A   | **`pytestPrelude.ts`** — bộ chạy test tối giản tương thích cú pháp pytest (`assert`, `pytest.raises`, `pytest.approx`, `parametrize`), thu thập hàm `test_*` rồi in báo cáo kiểu pytest. Khai báo rõ là bản rút gọn của môn, không phải pytest đầy đủ. |
| U7 HTTP & REST      | B   | **`httpSimPrelude.ts`** — `requests.get/post` giả lập trỏ vào bộ dữ liệu tĩnh của môn (dùng lại `weatherData.ts`/`shopData.ts`), có status code + JSON + lỗi mạng để dạy xử lý lỗi                                                                     |
| U8–U9 backend nhỏ   | B   | **`apiSimPrelude.ts`** — object `app` có decorator `@app.get/post/put/delete`, một `client` gọi thẳng handler trong tiến trình + SQLite qua `sqlite3` của Pyodide. Chấm = so JSON trả về. Làn C: chạy FastAPI + uvicorn thật ở nhà.                    |
| U10–U11 TypeScript  | A   | **cổng type-check phía SERVER** (`/api/ts-check`) dùng `typescript` đã có sẵn trong repo — KHÔNG nhét compiler TS vào bundle trình duyệt (ngân sách bundle đang ở 99,7%, xem nợ kỹ thuật #7)                                                           |
| U12 milestone       | C   | dùng lại khuôn milestone tự khai của dự án trục                                                                                                                                                                                                        |

## 4. Thứ tự PR (chia nhỏ, mỗi PR chạy được)

- **PR-L12** — U1–U4 (OOP + lỗi/logging). Làn A thuần, KHÔNG hạ tầng mới. ← chặng này
- **PR-L13** — `pytestPrelude` + cổng CI + U5–U6
- **PR-L14** — `httpSimPrelude` + U7
- **PR-L15** — `apiSimPrelude` (định tuyến + SQLite) + U8–U9
- **PR-L16** — `/api/ts-check` + làn TypeScript + U10–U11
- **PR-L17** — bước dự án trục chặng P4 + U12 milestone

## 5. Điều KHÔNG làm ở P4 (ghi để phiên sau khỏi mở lại)

- Không cấp container/VM cho học viên (tốn tiền VPS, rủi ro bảo mật — đặc tả gốc đã loại).
- Không proxy API bên thứ ba có key qua server của mình (lộ hạn mức, dễ bị lạm dụng): U7 làn C
  yêu cầu học viên tự đăng ký free tier và chạy trên máy họ.
- Không mô phỏng deploy. Deploy là nội dung P5 và bắt buộc làn C.
