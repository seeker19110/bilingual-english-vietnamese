# Admin — Kiểm tra trạng thái hoạt động các tính năng dùng API/không dùng API (2026-08-22)

PR: nhánh `claude/feature-status-check-admin-lgs3nl`. Thêm mục "Trạng thái tính năng" trong
`/admin` (tab "Sử dụng, chi phí & Vận hành"):

- **Backend**: `api/_lib/featureStatusChecks.ts` — kiểm tra nhẹ (endpoint metadata/list miễn
  phí, KHÔNG gọi chat/TTS/STT thật tốn tiền) cho: CSDL PostgreSQL, AI hội thoại (Anthropic /
  Gemini / Groq — bỏ qua nếu chưa cấu hình key), STT (Groq / OpenAI Whisper), TTS (Google
  Cloud), lưu trữ Cloudflare R2, thanh toán SePay (kiểm cấu hình + thời điểm giao dịch gần
  nhất). `api/admin-feature-status.ts`: `GET` (admin xem lượt gần nhất + lịch sử 30 lượt),
  `POST` chạy 1 lượt kiểm tra — hai đường vào: Bearer token admin (nút "Kiểm tra thủ công")
  hoặc header `x-cron-key` khớp `FEATURE_STATUS_CRON_KEY` (crontab VPS gọi tự động, không cần
  đăng nhập). Lưu bảng mới `feature_status_checks` (migration `0057`).
- **Lịch chạy**: KHÔNG dùng `setInterval` trong `server.ts` (tránh chạy trùng khi PM2 cluster
  nhiều instance) — dùng crontab VPS gọi `POST /api/admin-feature-status`, dòng mẫu 2 lần/ngày
  (0h + 12h UTC = 7h/19h giờ VN) đã thêm ở `docs/deploy-vps-ubuntu.md` mục "Kiểm tra trạng thái
  tính năng". **Việc tay còn lại**: đặt `FEATURE_STATUS_CRON_KEY` thật trong `.env` trên VPS
  (đã có mẫu ở `.env.example`) rồi thêm dòng crontab.
- **Frontend**: `apps/english/src/components/admin/AdminFeatureStatusPanel.tsx` — thẻ trạng
  thái tổng hợp (up/degraded/down) + lưới từng tính năng (icon, latency/lỗi) + lịch sử gập lại
  được, nút "Kiểm tra thủ công".
- Đã chạy đủ cổng commit: build ✅ · typecheck ✅ · lint (0 cảnh báo) ✅ · test (5040/5040,
  gồm `routes-registered.test.ts` xác nhận route đã đăng ký) ✅. Chưa chạm `eval:tutor` (không
  đổi prompt/model AI).
