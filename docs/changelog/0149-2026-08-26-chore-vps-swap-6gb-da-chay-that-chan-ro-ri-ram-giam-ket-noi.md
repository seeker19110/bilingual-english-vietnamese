# chore(vps): swap 6GB (đã chạy thật) + chặn rò rỉ RAM + giảm kết nối Postgres (2026-08-26)

**Cập nhật cuối ngày — swap ĐÃ CHẠY trên VPS thật**, và ba việc vận hành còn lại đã vá:

- **`max_memory_restart: '400M'`** trong `ecosystem.config.cjs`. Trước đây thiếu hẳn, nên
  instance rò rỉ bộ nhớ sẽ phình tới khi kernel gọi OOM killer — mà OOM killer không chọn tiến
  trình đáng chết, nó có thể giết PostgreSQL. Chọn 400M vì đo thật mỗi instance dùng ~218–231 MB:
  đủ xa để không restart oan lúc tải cao, đủ gần để bắt được bất thường.
- **`PG_POOL_MAX` mặc định 10 → 5** (`packages/core-db/pgPool.ts`). Chỗ dễ tính nhầm: con số
  này là MỖI TIẾN TRÌNH, mà PM2 chạy `instances:'max'` trên 3 core ⇒ default cũ thành **30 kết
  nối Postgres thật** cho một máy đo được CPU 0,5%. Mỗi backend Postgres tốn vài MB trên máy chỉ
  có 2,9 GB. 3 × 5 = 15 vẫn thừa. Đã ghi rõ "mỗi tiến trình, không phải tổng" vào `.env.example`.
- **↺ 64 lần restart: đã kết luận KHÔNG phải crash** — đọc 200 dòng log lỗi gần nhất, không có
  một stack trace crash nào. Là cộng dồn qua các lần `pm2 reload` khi deploy.

**Nhưng chính lần đọc log đó lộ ra một nợ 🔴 mới, nghiêm trọng hơn cả ba việc trên: Redis rớt
kết nối 7 lần trong 8 giờ**, mỗi lần rate limit tụt về `Map` in-memory của từng instance ⇒ một
IP gọi được gấp 3 lần hạn mức, kể cả hạn mức AI trả phí. Code không sai; kết nối TCP bị đóng.
Chi tiết + bước chẩn đoán trước khi vá: xem mục "Nợ kỹ thuật còn mở" đầu danh sách. **Chưa vá
vì chưa xác nhận nguyên nhân** — đụng đường rate limit thì không đoán.
