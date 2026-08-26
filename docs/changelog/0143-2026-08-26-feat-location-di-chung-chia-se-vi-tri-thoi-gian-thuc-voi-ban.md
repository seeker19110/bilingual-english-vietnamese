# feat(location): "Đi chung" — chia sẻ vị trí thời gian thực với bạn bè (2026-08-26)

Tính năng mới cho trụ nền tảng: nhóm bạn đi chơi chung thấy nhau trên bản đồ Google Maps để
không bị lạc, **bật/tắt chủ động**, và **tự tắt khi hết giờ**. Đặc tả đầy đủ:
`docs/research/dac-ta-chia-se-vi-tri-2026-08-26.md`.

- **Dùng lại hạ tầng sẵn có thay vì dựng mới:** WebSocket `/ws/location` đi đúng khuôn của chat
  (auth qua cookie lúc upgrade, fan-out qua Redis pub/sub của `core-chat` nên chạy đúng với PM2
  cluster 3 instance). Kênh theo CHUYẾN (`loc:session:<id>`) chứ không theo user.
- **Luôn có đường lui:** mạng chặn WebSocket → client tự quay về polling REST 8 giây/lần; thiếu
  `VITE_GOOGLE_MAPS_API_KEY` → vẫn còn danh sách khoảng cách + nút "Chỉ đường" mở Google Maps
  (URL công khai, không cần key). Bản đồ nạp bằng thẻ script LƯỜI nên **không tốn ngân sách
  bundle** (Initial JS 123,68 kB / 140 kB).
- **Riêng tư là ràng buộc kỹ thuật, không phải lời hứa suông:** không có chế độ vĩnh viễn
  (bắt buộc 1/4/8 giờ) · chỉ lưu vị trí MỚI NHẤT, không lưu lịch sử hành trình · tắt chia sẻ là
  **xoá** dòng vị trí (không phải ẩn) + dừng GPS · mặc định TẮT · chế độ "gần đúng ~500m" làm
  tròn Ở SERVER · nhật ký đồng thuận `consent_log` · job nền 15 phút dọn chuyến hết hạn.
- **Chống lạc:** cảnh báo khi ai đó cách điểm hẹn (hoặc tâm nhóm) quá bán kính đặt trước, khoảng
  cách tới từng người tính ngay trên máy, hiển thị mức pin của bạn bè, nút chỉ đường.
- **Tiết kiệm pin:** chỉ gửi vị trí khi đã đi ≥ 20m hoặc quá 30 giây (`shouldSendUpdate`).
- **Kiểm chứng:** 454 file / **5820 test xanh**, branches 90,12% · typecheck/lint sạch ·
  `node dist-server/server.js` + `/api/health` → 200 với WS mới đã gắn.
- **Còn để lại (ghi trong đặc tả mục 8):** chạy nền khi tắt màn hình (giới hạn của trình duyệt),
  thông báo đẩy khi có người tụt lại, gộp nhịp cho nhóm > ~20 người.
