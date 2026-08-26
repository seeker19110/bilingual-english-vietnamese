# feat(programming): PR-L3 — engine bài học 8 bước + fix vỡ size budget (2026-08-24, cùng PR #659)

- **Khuôn dữ liệu bài học** (`subject-programming/lessonTypes.ts`, Zod chặn CI khi soạn sai) +
  **engine chấm THUẦN** (`grading.ts`: chuẩn hoá output, chấm contains/exact, ca ẩn không lộ
  chi tiết, kiểm Parsons, xáo trộn deterministic theo seed) — 20 test ca biên; test số học
  bài mẫu bắt được 1 lỗi tính tay khi soạn (150 kWh: 305.850 → 306.000đ).
- **Bài học mẫu trọn khuôn 8 bước**: P1-U4 "Rẽ nhánh if — tiền điện bậc thang EVN" (đúng bài
  đặc tả chỉ định làm mẫu): móc thực tế → khái niệm → ví dụ mẫu chạy được (gửi xe bậc thang)
  → Predict 4 lựa chọn → Parsons 7 dòng → Make 5 test-case (3 hiện + 2 ẩn, có ca biên ranh
  giới bậc và 0 kWh) + gợi ý bậc thang 3 mức + phao "Xem code mẫu" → bài về nhà hoá đơn thật.
- **Trang bài học** `/lap-trinh/bai-hoc/:lessonId` (6 màn phủ 8 bước, thanh bước, chấm từng
  ca hiện dần); trang bậc hiện nút "Học bài" + badge hoàn thành theo tiến độ server.
- **API tiến độ** `/api/programming/progress` (GET/POST, validateAuth + rate-limit, kiểm bài
  tồn tại thật, bất biến completed-không-kéo-lùi cả server lẫn client) — 6 test handler;
  client `lib/programmingProgress.ts` cache localStorage + lạc quan, server là nguồn sự thật.
- **Fix CI quality đỏ (bài học thật):** CodeMirror rơi vào `vendor-misc` (chunk tải eager) →
  Initial JS 250,6 kB vượt trần 123 kB. Local từng "xanh giả" vì `npm run size | tail` nuốt
  exit code — từ nay chạy size KHÔNG pipe. Vá: tách nhóm `vendor-codemirror` trong
  manualChunks (chỉ trang /lap-trinh/\* kéo) → 122,59/123 kB.
- Kiểm chứng: e2e luồng 1 bài end-to-end 2/2 (predict → parsons xếp đúng/sai → make chấm
  Pyodide thật đạt/rớt) + sandbox 3/3 + a11y 20/20 trang bài học; test 5217/5217.
- **Tiếp theo:** PR-L3b (workspace dự án + milestone check) → PR-L4 (nội dung P1 đầy đủ).
