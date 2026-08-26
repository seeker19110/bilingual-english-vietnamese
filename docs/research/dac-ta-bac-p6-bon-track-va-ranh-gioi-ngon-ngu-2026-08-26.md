# Bậc P6 — Bốn track chuyên sâu và ranh giới "ngôn ngữ nào chạy được" (quyết định 2026-08-26)

> Hiến chương của bậc P6, nối tiếp `dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md` (luật ba làn)
> và `dac-ta-bac-p5-deploy-va-lan-c-2026-08-26.md` (chấm bằng phép đếm, deploy không mô phỏng).
> Mọi PR nội dung P6 phải theo.

## 0. Cảnh báo đã nêu với người dùng trước khi làm

Đặc tả gốc (`dac-ta-mon-lap-trinh-2026-08-24.md` §4) ghi rõ bốn track P6 **"soạn sau khi P1–P5
chạy thật"** — tức sau khi có người học đi hết P1–P5 và ta biết chỗ nào họ vấp. Bậc này được
soạn TRƯỚC mốc đó theo yêu cầu trực tiếp của người dùng. Hệ quả cần nhớ khi đọc lại: nội dung P6
chưa được hiệu chỉnh theo dữ liệu người học thật, nên nó là **bản mở đường**, dễ phải sửa hơn
P1–P5. Ghi ra đây để phiên sau không tưởng nhầm là đã kiểm chứng ngoài đời.

## 1. Vấn đề riêng của bậc này

P6 mở bốn track: **AI ứng dụng** (Python) · **Backend cloud** (Go) · **Hệ thống** (C → Rust) ·
**Luyện phỏng vấn thuật toán** (Python). Hai track giữa dùng ngôn ngữ mà **không engine nào của
môn chạy được** — Pyodide chạy Python, Worker chạy JavaScript, sql.js chạy SQLite, hết.

Nên câu phải trả lời trước khi soạn một chữ nào: dạy Go và Rust **bằng cách nào** mà không vi
phạm luật "không giả vờ" đã theo từ P3-U10?

## 2. Quyết định 1 — KHÔNG dựng judge server, kể cả ở P6

Đặc tả gốc (§ "Judge server") để ngỏ phương án B: Judge0/isolate tự host trên VPS để chấm
Java/Go/C. Hiến chương P5 §6 đã kết luận không cần ở P5. Nay xét lại đúng ở chỗ nó được dành
cho — P6 — và kết luận vẫn là **KHÔNG**, vì ba lý do có thật, không phải ngại việc:

1. **Tiền và máy.** VPS hiện tại 3 vCPU / 3GB RAM đang chạy web + Postgres + Redis + PM2
   cluster 3 instance. Một judge server đa ngôn ngữ cần RAM/CPU riêng và phải cô lập thật
   (container per-run, giới hạn thời gian/bộ nhớ/mạng). Đây là chi phí thường xuyên, trong khi
   nguyên tắc của dự án là 0đ hạ tầng thêm cho tới khi có doanh thu tương ứng.
2. **Bảo mật.** Chạy code người lạ trên máy chủ của mình là bề mặt tấn công lớn nhất mà dự án
   có thể tự tạo ra. Nó cần một đặc tả riêng về cô lập tiến trình, hạn mức, và quy trình sự cố —
   không phải một mục trong PR nội dung.
3. **Giá trị sư phạm thấp hơn tưởng.** Cái người mới cần ở track Go/Rust không phải là "trình
   biên dịch nói câu gì" — mà là **hiểu CƠ CHẾ**: vì sao chia sẻ bộ nhớ giữa hai luồng lại sinh
   lỗi, sở hữu và mượn nghĩa là gì. Cơ chế đó dạy được bằng thứ chạy được ngay.

Điều kiện để MỞ LẠI câu hỏi này (ghi để phiên sau khỏi bàn từ đầu): khi môn có người học thật
yêu cầu chấm cú pháp Go/Rust ở quy mô đủ lớn, VÀ dự án có ngân sách hạ tầng riêng, VÀ có đặc tả
cô lập được duyệt. Thiếu một trong ba thì câu trả lời vẫn là không.

## 3. Quyết định 2 — Track Go/Rust dạy CƠ CHẾ bằng mô hình chạy được, cú pháp thật ở làn C

Đây là cách duy nhất vừa trung thực vừa dạy được. Luật:

- **Bài xây một MÔ HÌNH của cơ chế, bằng Python, và nói thẳng đó là mô hình.** Học viên không
  "viết Go" — họ viết một bộ mô phỏng xen kẽ luồng, hoặc một bộ kiểm tra quyền sở hữu. Cái họ
  hiểu xong là thứ Go/Rust thật sự làm.
- **CẤM câu chữ ngụ ý đang chạy ngôn ngữ đó.** Không "chương trình Go của bạn chạy ra…". Bài
  phải nêu rõ chỗ mô hình khác thật.
- **Bước ⑦ (về nhà) luôn là làn C:** cài Go/Rust thật, chạy đúng kịch bản vừa mô hình hoá, đối
  chiếu. Với Rust, bài chỉ đích danh mã lỗi thật của trình biên dịch (E0382 dùng giá trị đã
  chuyển quyền · E0505 không thể chuyển khi đang bị mượn) để học viên biết mình phải thấy gì.
- **Không chấm hộ làn C** — giữ nguyên luật 3 của hiến chương P4.

Đổi lại, mô hình có một ưu điểm mà chạy thật KHÔNG có: **cuộc đua trở nên tái lập được.** Chạy
hai luồng thật thì lỗi mất cập nhật xuất hiện lúc có lúc không, và người mới kết luận "code em
chạy đúng mà". Mô hình xen kẽ tất định cho phép chỉ thẳng vào MỘT lịch xen kẽ cụ thể và nói:
đây, chính chỗ này.

## 4. Quyết định 3 (hạ tầng, đã KIỂM CHỨNG) — không bài nào của môn được dùng `threading`

Đã chạy thử thật trên Pyodide 314.0.5 của repo khi soạn bậc này:

```
import threading            -> OK
threading.Thread(...).start() -> RuntimeError: can't start new thread
```

Nghĩa là: bài dùng thread sẽ **XANH ở cổng CI** (python3 trên runner chạy thread bình thường)
và **RỚT trên máy học viên**. Đây đúng loại khe hở mà `lessonsPython.test.ts` đã cảnh báo từ
đầu môn, chỉ khác là lần này cổng không bắt được vì cổng chạy đúng thứ bị hỏng ở nơi kia.

**Luật:** nội dung môn Lập trình không được dựa vào `threading`, `multiprocessing`, hay bất cứ
thứ gì cần luồng thật. Đồng thời (concurrency) dạy bằng mô hình xen kẽ tất định (§3). Nếu sau
này có bài cần thread, phải kiểm lại Pyodide TRƯỚC, và nếu vẫn không chạy thì cổng CI phải mọc
thêm một bước chặn — không để nó lọt qua bằng niềm tin.

## 5. Quyết định 4 — Track AI: không proxy khoá LLM của học viên

Giữ nguyên luật của hiến chương P4 §5 (không proxy API bên thứ ba có key qua server của mình:
lộ hạn mức, dễ bị lạm dụng). Hệ quả cho track AI ứng dụng:

- Phần **chấm được** là phần có thật và không cần khoá: **truy hồi** — cắt đoạn, vector hoá, đo
  tương đồng, xếp hạng. Đây cũng là phần quyết định chất lượng một hệ RAG; gọi LLM chỉ là bước
  cuối cùng và là bước dễ nhất.
- Phần **gọi LLM thật** (có khoá riêng của học viên, tự đăng ký free tier) nằm ở bước ⑦, làn C.
- Chấm điểm tương đồng tới 3 chữ số thập phân là **có chủ đích**: nó buộc học viên tính cosine
  thật chứ không đếm từ trùng cho qua. Phép toán chỉ gồm `+`, `*`, `/`, `sqrt` trên IEEE754 nên
  cùng thứ tự cộng sẽ cho cùng kết quả ở cả python3 lẫn Pyodide.

## 6. Áp vào từng unit P6

| Unit                          | Làn | Ngôn ngữ | Dạy cái gì (phần CHẤM ĐƯỢC)                                      | Làn C ở bước ⑦                    |
| ----------------------------- | --- | -------- | ---------------------------------------------------------------- | --------------------------------- |
| U1 Track AI ứng dụng          | A   | `python` | RAG: cắt đoạn có chồng lấn · cosine · xếp hạng top-k             | Gọi LLM thật bằng khoá riêng      |
| U2 Track backend cloud (Go)   | A   | `python` | Mô hình xen kẽ tất định: mất cập nhật · kênh gom về một chủ      | Cài Go, chạy `go run -race`       |
| U3 Track hệ thống (C → Rust)  | A   | `python` | Bộ kiểm quyền sở hữu: chuyển quyền · mượn · dùng sau khi chuyển  | Cài Rust, đối chiếu E0382 / E0505 |
| U4 Track phỏng vấn thuật toán | A   | `python` | Kadane O(n) + ca biên toàn số âm + phương pháp trả lời phỏng vấn | Luyện đề, nói to cách nghĩ        |

**Bốn track = bốn bài, mỗi unit một bài** — đúng khung `curriculum.ts` đã có, không đổi khung.
Track là hướng đi tự chọn, không phải chuỗi tuần tự: học viên chọn track, bài của track là cửa
vào, phần đi sâu nằm ở làn C và ở việc tự luyện.

## 7. Dự án trục KẾT THÚC Ở P5, không kéo sang P6

`dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md` §3 chốt "Milestone P5 = HOÀN THÀNH MÔN".
Nên P6 **không có chặng dự án trục** (`PROJECT_STAGES` dừng ở `p5`), và `projectMilestone` của
P6 — "sản phẩm thứ hai theo track tự chọn" — là đề mở của riêng học viên, không phải bước có
milestone check. Ghi ra để phiên sau không đi thêm `projectStepsP6.ts` cho đủ bộ.

## 8. Điều KHÔNG làm ở P6 (ghi để phiên sau khỏi mở lại)

- Không dựng judge server (§2), không cấp container/VM cho học viên.
- Không dùng `threading`/`multiprocessing` trong nội dung (§4, đã kiểm chứng).
- Không proxy khoá LLM (§5).
- Không mô phỏng Docker/CI-CD. Chúng là thao tác trên máy thật, thuộc làn C — cùng lý do deploy
  không mô phỏng ở P5.
- Không thêm chặng dự án trục cho P6 (§7).
