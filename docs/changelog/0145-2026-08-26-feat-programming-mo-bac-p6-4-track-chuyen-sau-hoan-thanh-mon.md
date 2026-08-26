# feat(programming): MỞ BẬC P6 — 4 track chuyên sâu, HOÀN THÀNH MÔN LẬP TRÌNH P1→P6 (2026-08-26)

Bậc cuối. Từ đây môn Lập trình **không còn unit nào rỗng ở bất kỳ bậc nào** — cổng
`lessons.test.ts` nay kiểm điều đó cho cả sáu bậc, và mốc "nhánh rỗng" phải đổi sang một unit
không bao giờ tồn tại (`p1-u99`) vì không còn unit thật nào để làm mốc.

**Cảnh báo đã nêu, ghi lại để phiên sau không hiểu nhầm:** đặc tả gốc ghi bốn track P6 "soạn
sau khi P1–P5 chạy thật với người học". Bậc này soạn TRƯỚC mốc đó theo yêu cầu trực tiếp của
người dùng, nên nó là **bản mở đường**, chưa hiệu chỉnh theo dữ liệu người học thật, dễ phải
sửa hơn P1–P5.

- **Hiến chương bậc P6** — `docs/research/dac-ta-bac-p6-bon-track-va-ranh-gioi-ngon-ngu-2026-08-26.md`:
  - **KHÔNG dựng judge server, kể cả ở P6** — xét lại đúng ở chỗ đặc tả gốc dành cho nó và vẫn
    trả lời không, vì ba lý do có thật: VPS 3 vCPU/3GB đang chở web + Postgres + Redis + PM2
    cluster · chạy code người lạ trên máy chủ mình là bề mặt tấn công lớn nhất dự án tự tạo ra,
    cần đặc tả cô lập riêng · và cái người mới cần ở Go/Rust là CƠ CHẾ, không phải trình biên
    dịch nói câu gì. Tài liệu ghi rõ **ba điều kiện đồng thời** để mở lại câu hỏi này.
  - **Track Go và Rust dạy cơ chế bằng MÔ HÌNH chạy được, cú pháp thật ở làn C.** Học viên
    không "viết Go" — họ viết bộ mô phỏng xen kẽ luồng, hoặc bộ kiểm quyền sở hữu. Bài nói
    thẳng đó là mô hình và chỉ rõ chỗ mô hình khác thật; bước ⑦ là cài Go/Rust thật, đối chiếu
    `go run -race` và mã lỗi E0382 / E0505.
  - **Track AI: không proxy khoá LLM của học viên** (giữ luật P4 §5). Phần chấm được là TRUY
    HỒI — cũng chính là phần quyết định chất lượng một hệ RAG; gọi LLM là bước cuối và dễ nhất.

- **Phát hiện hạ tầng, đã KIỂM CHỨNG bằng cách chạy thật (không đoán):** trên Pyodide 314.0.5
  của repo, `import threading` **thành công** nhưng `Thread.start()` ném
  `RuntimeError: can't start new thread`. Nghĩa là bài dùng thread sẽ **XANH ở cổng CI** (python3
  trên runner có thread thật) và **RỚT trên máy học viên** — khe hở mà cổng không bắt được, vì
  cổng chạy đúng thứ bị hỏng ở nơi kia. **Luật mới của môn: nội dung không được dựa vào
  `threading`/`multiprocessing`.** Đồng thời dạy bằng mô hình xen kẽ tất định — vốn còn hơn chạy
  thật ở một điểm: cuộc đua TÁI LẬP ĐƯỢC, chỉ được vào đúng một lịch xen kẽ cụ thể.

**Nội dung 4 bài, mỗi track một bài, tất cả chạy làn `python` — KHÔNG thêm hạ tầng nào:**
U1 AI ứng dụng (RAG: cắt đoạn có chồng lấn · cosine · xếp hạng top-k; chấm điểm tới 3 chữ số
thập phân để buộc tính cosine thật thay vì đếm từ trùng) → U2 backend cloud/Go (mô hình xen kẽ:
`chung += 1` là ba vi-bước, lịch "AABABB" mất một lần tăng; kênh gom về một chủ sở hữu thì mọi
lịch đều đúng) → U3 hệ thống/C→Rust (bộ kiểm quyền sở hữu: chuyển quyền · mượn · dùng sau khi
chuyển; ca ẩn mượn hai lần trả một lần bắt lời giải dùng cờ thay vì bộ đếm) → U4 phỏng vấn
thuật toán (Kadane O(n) + năm bước trả lời phỏng vấn + bẫy kinh điển toàn số âm).

**Dự án trục KẾT THÚC Ở P5, không kéo sang P6** (§7 hiến chương) — `PROJECT_STAGES` dừng ở `p5`
đúng như đặc tả dự án xuyên suốt đã chốt "milestone P5 = hoàn thành môn". Ghi ra để phiên sau
không đi thêm `projectStepsP6.ts` cho đủ bộ.

**Một cổng phải sửa vì nội dung mới làm nó hết đúng:** `feedback.test.ts` dùng `p6-u1-l1` làm
mốc "mã bài đúng khuôn nhưng chưa soạn" — nay bài đó có thật nên cổng đo nhầm thứ. Đổi mốc sang
`p1-u99-l1` (khớp regex, không bao giờ tồn tại). Đây là loại nợ mà chỉ chạy TOÀN BỘ test mới
thấy, không phải chỉ test của gói đang sửa.

**Kiểm chứng (chạy thật):** 456 file / **6025 test xanh** · branches **90,12%** (sàn 90 — sát
sàn, xem nợ kỹ thuật #7) · typecheck · lint 0 cảnh báo · format · build. Cổng
`lessonsPython.test.ts` chạy python3 thật cho cả 4 bài P6 (157 test). Mọi con số kỳ vọng
(cosine 0.316 / 0.577 / 0.408, lịch xen kẽ, `Ket qua: 3/4`, Kadane −40) lấy từ lần chạy thật
lúc soạn.

**Nợ / việc còn lại của môn:** không còn bậc nào chưa mở. Còn lại là việc _sau khi có người học
thật_: hiệu chỉnh nội dung P6 theo chỗ họ vấp · hạ tầng làn C cho milestone P5 (kiểm URL sống
bằng fetch HEAD phía server, có rate-limit) · mở dự án trục T2/T3 (hiện chỉ T1 khả dụng).
