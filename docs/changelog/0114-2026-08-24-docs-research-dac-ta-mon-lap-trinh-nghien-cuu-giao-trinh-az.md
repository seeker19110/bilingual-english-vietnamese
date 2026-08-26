# docs(research): Đặc tả môn LẬP TRÌNH — nghiên cứu giáo trình A→Z (2026-08-24)

Theo yêu cầu người dùng, soạn `docs/research/dac-ta-mon-lap-trinh-2026-08-24.md` — đặc tả
research-first cho môn học mới **Lập trình** (trụ Learning), bám khuôn 5 mảnh "thêm môn học
mới" của đặc tả kiến trúc platform. Điểm chốt đề xuất (CHỜ NGƯỜI DÙNG DUYỆT, chưa code):

- **Ngôn ngữ bền ≥10 năm, 3 tầng:** lõi = Python + JS/TypeScript + SQL (MVP chỉ 3 ngôn ngữ
  này); tầng nghề = Java/C#/Go (chọn nhánh); nâng cao = C/C++/Rust. Không dạy framework làm lõi.
- **Thang bậc P1→P6** (tương tự CEFR A1–C2, ánh xạ CS2023/K-12 CS Framework/SFIA), tái dùng
  khuôn trang `CefrLevelPage`; đề cương chi tiết P1–P5 (~250 bài, unit + dự án mini thực tế VN).
- **Khuôn bài học 8 bước chuẩn** (PRIMM + worked example + Parsons + chấm test-case + SRS).
- **Sandbox chạy code TRONG TRÌNH DUYỆT** (Pyodide WASM/Web Worker, sql.js) — 0đ hạ tầng;
  AI chỉ dùng cho feedback với mode đếm lượt mới `code_feedback`.
- Phân đợt PR-L0..L6 + DoD + rủi ro. Việc tiếp theo: người dùng duyệt đặc tả (hoặc yêu cầu
  soạn mẫu trọn 1 unit P1-U4 "Tính tiền điện EVN" để duyệt khuôn trước).
