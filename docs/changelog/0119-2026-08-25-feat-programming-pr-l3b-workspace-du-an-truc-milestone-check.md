# feat(programming): PR-L3b — workspace dự án trục + milestone check chặng P1 (2026-08-25)

PR #659 (đặc tả + L1 + L2 + L3) đã MERGE (squash, auto-merge sau khi CI xanh) — nhánh khởi
động lại từ main. PR-L3b theo đặc tả xuyên suốt §4:

- **5 bước dự án chặng P1 "Máy tính tiền"** (`subject-programming/projectSteps.ts`, Zod):
  hợp đồng I/O rõ từng bước (menu 3 món cố định → tính tiền → giảm giá bậc → vòng lặp đơn →
  milestone tiền thừa/thiếu tiền), mỗi bước có ca ẩn + ca biên ranh giới; test số học đối
  chiếu độc lập (bài học từ PR-L3). Bước sau GIỮ dòng in bước trước — code tiến hoá.
- **Workspace bền server:** API `/api/programming/project` (GET cây file + snapshot; POST
  save có quota 2MB/50 file kiểm trước khi ghi, path chặn traversal; POST snapshot jsonb
  theo milestone) — 7 test handler. Client `lib/programmingProject.ts` cache lạc quan.
- **Trang `/lap-trinh/du-an`:** editor cua_hang.py, bước sau KHOÁ tới khi bước trước đạt
  hết check (chấm hành vi bằng Pyodide, luôn lưu trước khi chấm), gợi ý + phao từng bước,
  banner đạt bước (không tự nhảy — giữ ca xanh cho học viên thấy), bước 5 chốt snapshot P1.
- API tiến độ nhận thêm id bước (`p1-s1`…, cùng bảng lesson_progress); cổng
  routes-registered khai báo tiền tố `/api/programming/*` tường minh (test này từng bắt
  đúng route quên gắn — lần này bắt tiền tố lệch, khai vào CUSTOM_PATH).
- Kiểm chứng: e2e 2/2 (phao bước 1 → đạt hết → mở bước 2 · starter code → ca rớt hiện rõ,
  bước 2 vẫn khoá) + a11y 10/10 trang mới; test 5229/5229; size 122,61/123 kB (không pipe).
- **Tiếp theo:** PR-L4 — soạn nội dung P1 đầy đủ (~40 bài khuôn 8 bước cho 10 unit).
