# feat(programming): PR-L4 — nội dung bậc P1 đầy đủ + cổng chấm nội dung bằng python3 (2026-08-25)

**10/10 unit của bậc P1 nay đều có bài học trọn khuôn 8 bước** (trước chỉ có 1 bài mẫu U4):

- Tách `lessons.ts` thành registry + `lessons/p1u<N>.ts` (mỗi unit một file) để soạn song
  song không đụng nhau — 9 bài mới do 3 subagent soạn theo brief (đúng luật phân việc
  CLAUDE.md mục 3), phiên chính duyệt nội dung + chạy cổng.
- Nội dung: U1 print/chương trình là gì · U2 biến & phép toán (tính tiền quán) · U3
  input/f-string (tiền photocopy) · U4 if bậc thang (tiền điện EVN, có từ PR-L3) · U5 while
  (tiết kiệm, đoán số) · U6 for/range (cộng dồn điểm) · U7 if lồng trong lặp (đếm đậu/rớt) ·
  U8 đọc code & sửa 3 lỗi kinh điển · U9 import/random + `random.seed()` để tất định ·
  U10 milestone ráp máy bán nước tự động (đề KHÁC dự án trục, tránh trùng).
- **Cổng nội dung mạnh nhất của môn — `lessonsPython.test.ts`:** chạy code THẬT bằng
  `python3` rồi chấm bằng ĐÚNG engine học viên gặp (`grading.ts`), phủ: code mẫu phải đạt
  hết test-case · ví dụ mẫu chạy không lỗi · đáp án Predict khớp output thật VÀ các lựa
  chọn sai không được khớp · code tham chiếu mỗi bước dự án đạt hết milestone check.
  Prelude `input()` giữ khớp với worker Pyodide (lệch = xanh giả). Thiếu python3 → tự skip.
- **Kiểm chứng chéo hai môi trường:** thêm e2e chạy code mẫu bài U9 (random) TRONG TRÌNH
  DUYỆT — chốt Pyodide (CPython WASM) và python3 của CI sinh cùng dãy số với cùng seed,
  nếu lệch thì bài sẽ "xanh ở CI, rớt ở người học".
- Test bất biến mới: mọi unit P1 phải có ≥1 bài học (chặn sót khi soạn tiếp P2…).
- UI: trang bậc thêm thanh tiến độ "đã hoàn thành X/N bài" (role=progressbar, a11y).
- **Vá CI đỏ của PR #660** (commit riêng, đã push): coverage BRANCHES 89,99% < 90% do 2 lib
  client của PR-L3b chưa có test → viết 16 test phủ nhánh thật (ngoại tuyến/lỗi HTTP/cache
  hỏng/quota bị từ chối/bất biến completed) → branches 90,02%. KHÔNG hạ ngưỡng.
- Cổng: typecheck · lint 0 cảnh báo · format · test 5282/5282 · build · size 122,6/123 kB ·
  e2e chọn lọc: bài học 3/3 (gồm ca Pyodide-vs-python3) + a11y 50/50 (5 trang × 5 theme × 2 mức).
- **Tiếp theo:** PR-L5 (AI feedback + Socratic hints qua mode đếm lượt `code_feedback`) hoặc
  soạn tiếp bậc P2 — theo thứ tự phân đợt trong đặc tả. → **PR-L5 đã làm, xem mục trên.**
