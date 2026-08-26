# docs(vps): cất secret cho cron đúng chỗ + chẩn đoán xong vụ Redis rớt (2026-08-26)

**Lỗ hổng thật, do CHÍNH TÀI LIỆU của dự án dạy sai.** `runbook-dung-vps-moi-tu-dau.md` và
`setup-postgresql-vps.md` đều hướng dẫn viết `ENV_BACKUP_PASSPHRASE="..."` **thẳng vào dòng
crontab**, và VPS đã làm đúng theo đó. Hậu quả: `crontab -l` — lệnh người ta chạy hằng ngày để
xem lịch — in ra passphrase giải mã được **toàn bộ `.env`** từ bản backup trên R2
(`DATABASE_URL`, khoá AI, khoá SePay). Lộ ra khi đọc crontab để chẩn đoán việc khác; người dùng
đã xoay vòng secret ngay.

- **Bước 2b mới** trong `docs/deploy-vps-ubuntu.md`: cất secret cron vào `/root/.dhcb-cron-env`
  (`chmod 600`), crontab nạp bằng `. /root/.dhcb-cron-env &&` thay vì viết giá trị ra. Kèm cách
  sinh khoá mới và **nhắc điều dễ quên: đổi passphrase KHÔNG cứu được các bản backup cũ trên
  R2** — chúng vẫn mã hoá bằng passphrase cũ, phải xoá và tạo lại.
- Sửa 3 dòng cron mẫu ở 2 file còn lại; các lệnh chạy TAY giữ nguyên (chạy một lần, không nằm
  lại trên đĩa).

**Vụ Redis rớt kết nối: chẩn đoán xong, HẠ 🔴 → 🟡 — và ghi nhận tôi đã đánh giá quá nặng.**
Hai dòng log của mỗi lần rớt có **cùng dấu thời gian đến giây**, tức gián đoạn dưới 1 giây,
7 lần/ngày. Lần ghi đầu gắn 🔴 dựa trên giả định ngầm rằng gián đoạn kéo dài, **không kiểm dấu
thời gian trước khi gắn nhãn**. Bốn giả thuyết đều bị số đo bác bỏ (`timeout 0` · uptime Redis
2,7 ngày · `rejected_connections: 0` · `REDIS_URL` đúng chuẩn) — chi tiết + mốc theo dõi ở mục
"Nợ kỹ thuật còn mở". **Không vá vì chưa biết nguyên nhân:** nếu lúc đầu vá `keepAlive` theo
linh cảm thì giờ đã có một bản vá vô dụng trông như đã xong việc.

**Xác nhận hai vá hôm nay ĐANG CHẠY THẬT trên production** (không chỉ nằm trong repo):
`pm2 describe dhcb` → `max memory restart 419430400` (=400 MB) ở cả 3 instance;
`grep -c POOL_MAX_MAC_DINH packages/core-db/dist/pgPool.js` → 2, tức `PG_POOL_MAX=5` đã biên
dịch và reload. Swap 6 GB cũng đã chạy (`Swap: 6.0Gi`).

### fix(core-ui): toast từng bị 12 modal che khuất — và test chặn cho glob Tailwind (2026-08-26)
