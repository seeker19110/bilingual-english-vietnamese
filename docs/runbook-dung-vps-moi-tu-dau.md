# Runbook: Dựng VPS mới hoàn toàn từ đầu + khôi phục dữ liệu

> Dùng khi: VPS cũ hỏng phần cứng vĩnh viễn, hoặc **diễn tập** (thực hành quy trình khi chưa có sự
> cố thật) để chắc chắn ai cũng làm được lúc cần. Gộp 2 quy trình đã có sẵn thành **1 checklist duy
> nhất chạy tuần tự**, không thay thế 2 file gốc:
>
> - `docs/deploy-vps-ubuntu.md` — chi tiết từng lệnh cài đặt (tham khảo khi cần giải thích thêm).
> - `docs/ke-hoach-khoi-phuc-su-co-server.md` — quy trình ứng phó khi server **đang chạy** bị sự cố
>   (khác với dựng **VPS mới hoàn toàn** ở đây).
>
> ⚠️ Đây là thao tác thật trên hạ tầng — nếu VPS hiện tại (`160.30.172.203`,
> `en-vi.donghanhcungban.com`) **vẫn đang chạy bình thường**, KHÔNG chạy các lệnh xoá/ghi đè trong
> file này nhắm vào nó. Chỉ áp dụng cho **VPS mới, trống**.

---

## 0. Trước khi bắt đầu — thông tin cần có sẵn

Điền vào đây (hoặc tài liệu nội bộ riêng, không commit secret thật):

| Mục | Giá trị |
| --- | --- |
| Nhà cung cấp VPS mới | _(điền)_ |
| IP VPS mới | _(điền sau khi tạo máy)_ |
| Domain sẽ trỏ vào | `en-vi.donghanhcungban.com` (đổi DNS A record sang IP mới) |
| Bản backup Postgres dùng để restore | bản mới nhất trong `/var/backups/english_tutor_*.sql.gz` lấy từ VPS cũ **trước khi** VPS cũ mất hẳn |
| `.env` cũ (chứa secret thật) | lấy bản sao lưu riêng (KHÔNG có trong git) — nếu mất, phải tạo lại từng key (xem mục 4 bên dưới) |
| SSH key | dùng key cũ nếu còn giữ, hoặc tạo cặp key mới rồi cập nhật `~/.ssh/config` |

> Nếu **mất luôn** cả `.env` cũ (không có bản sao lưu nào) → phải tạo lại **toàn bộ secret mới**:
> `TTS_ENCRYPTION_MASTER_KEY` mới nghĩa là **audio cache cũ không giải mã được nữa** (chấp nhận
> được — TTS tự tạo lại), nhưng `JWT`/password DB thì phải khớp với dữ liệu restore từ backup nếu
> muốn user cũ đăng nhập lại được bằng mật khẩu cũ (mật khẩu hash nằm trong DB, không phụ thuộc
> secret app — chỉ cần restore đúng DB là đăng nhập lại được, không cần khớp secret cũ).

---

## 1. Dựng máy + cài đặt nền (theo `docs/deploy-vps-ubuntu.md`)

Chạy tuần tự **Bước 0 → Bước 8** của `docs/deploy-vps-ubuntu.md` trên máy mới:

- [ ] Bước 0 — Cài PostgreSQL tự host + tạo user `tutor_app` (theo `docs/setup-postgresql-vps.md`)
      — **CHƯA chạy `migrate:pg` vội**, để trống DB, sẽ restore backup ở Bước 3 dưới đây rồi mới
      chạy migration (tránh tạo bảng trống rồi phải xoá lại).
- [ ] Bước 1 — Bật `ufw` (SSH + Nginx Full)
- [ ] Bước 2 — Cài Node.js 22
- [ ] Bước 3 — Cài Nginx + PM2 + log rotation
- [ ] Bước 3b — Cài Redis local (bắt buộc nếu dùng cluster mode)
- [ ] Bước 4 — Clone code, tạo `.env` (dùng lại secret cũ nếu có bản sao lưu; xem mục 4 nếu phải
      tạo mới), `npm install && npm run build`
- [ ] Bước 5 — Cấu hình `ecosystem.config.cjs` (đã có sẵn trong repo, kiểm tra `PORT` đúng 3001)
- [ ] Bước 7 — Nginx reverse proxy (chưa bật HTTPS vội — cần DNS trỏ đúng IP mới trước, xem mục 2)

**Chưa chạy Bước 6 (start PM2) và Bước 8 (pre-cache audio) vội** — làm sau khi đã restore DB xong
(mục 3), để tránh app chạy với DB trống rồi ghi dữ liệu rác đè lên trước khi restore.

---

## 2. Trỏ domain sang IP mới

- [ ] Đổi DNS A record của `en-vi.donghanhcungban.com` sang IP VPS mới (ở nhà cung cấp domain).
- [ ] Chờ DNS propagate (`dig en-vi.donghanhcungban.com` ra đúng IP mới) — có thể mất vài phút tới
      vài giờ tùy TTL cũ.
- [ ] Sau khi DNS đã trỏ đúng: chạy Bước 7b (Let's Encrypt) trong `docs/deploy-vps-ubuntu.md`.

> Nếu cần app chạy tạm qua HTTP/IP thẳng trong lúc chờ DNS (test nội bộ) — bỏ qua bước HTTPS,
> `curl http://<ip-moi>/api/health` sau khi Nginx + PM2 đã lên.

---

## 3. Restore dữ liệu Postgres từ backup (theo mục 3.5 của `docs/ke-hoach-khoi-phuc-su-co-server.md`)

```bash
# 1. Copy file backup từ VPS cũ (hoặc nơi lưu trữ ngoài) lên VPS mới, ví dụ:
scp /duong/dan/english_tutor_YYYYMMDD.sql.gz root@<ip-vps-moi>:/var/backups/

# 2. Trên VPS mới — verify backup không hỏng trước khi restore thật
bash /var/www/english-tutor/scripts/verify-pg-backup.sh /var/backups/english_tutor_YYYYMMDD.sql.gz

# 3. Nếu OK — restore vào DB thật (DB đang trống, không cần dropdb)
gunzip -c /var/backups/english_tutor_YYYYMMDD.sql.gz | sudo -u postgres psql english_tutor

# 4. Chạy migration còn thiếu (backup cũ có thể thiếu bảng/cột mới nhất)
cd /var/www/english-tutor && npm run migrate:pg
```

- [ ] Backup verify OK (bước 2 không báo lỗi)
- [ ] Restore xong, không có lỗi SQL
- [ ] `npm run migrate:pg` chạy xong, không lỗi

---

## 4. Bật app + xác minh (Bước 6 + 8 của `docs/deploy-vps-ubuntu.md`)

```bash
cd /var/www/english-tutor
pm2 start ecosystem.config.cjs
pm2 status                       # phải "online"
pm2 startup && pm2 save          # tự khởi động lại khi VPS reboot
curl http://localhost:3001/api/health
```

- [ ] Pre-cache audio (Bước 8) — tùy chọn, chạy sau nếu muốn giảm độ trễ lần đầu:
  ```bash
  npm run seed:pronunciation
  BASE_URL=https://en-vi.donghanhcungban.com npm run prefetch:tts-patterns
  ```

---

## 5. Checklist xác minh cuối (dùng chung với Phần 4 của `docs/ke-hoach-khoi-phuc-su-co-server.md`)

- [ ] `curl https://en-vi.donghanhcungban.com/api/health` → `{"status":"ok",...}`
- [ ] Đăng nhập được bằng tài khoản thật đã có từ trước khi restore (xác nhận dữ liệu restore đúng)
- [ ] Thử 1 luồng mỗi loại: chat AI, tra từ điển, ghi âm luyện nói
- [ ] `pm2 status` ổn định, không restart loop
- [ ] SSL hợp lệ (`sudo certbot certificates`)
- [ ] `df -h /` còn nhiều dung lượng trống
- [ ] Cron backup Postgres đã thiết lập lại trên máy mới (`docs/setup-postgresql-vps.md` mục 7 —
      máy mới KHÔNG tự có cron này, phải tạo lại)
- [ ] Nếu dùng `STORAGE_DRIVER=r2`: xác nhận `.env` máy mới vẫn trỏ đúng R2 bucket cũ (audio cache
      không mất, vì R2 độc lập với VPS)

---

## 6. Ghi lại sau khi hoàn tất (post-mortem / nhật ký diễn tập)

Dù là diễn tập hay sự cố thật, ghi lại vào `PROGRESS.md`:

```
Loại: [Diễn tập / Sự cố thật]
Thời gian dựng lại: [bắt đầu] → [xong], tổng thời gian: [X phút/giờ]
Vướng mắc gặp phải: [bước nào chậm/khó, thiếu thông tin gì ở Phần 0]
Cải tiến runbook: [cập nhật gì vào file này hoặc 2 file gốc cho lần sau nhanh hơn]
```

---

## 7. Việc CHƯA thể tự động hoá (cần bạn quyết định/thực hiện tay)

1. Phần 0 (thông tin nhà cung cấp VPS, người liên hệ khẩn) trong
   `docs/ke-hoach-khoi-phuc-su-co-server.md` vẫn còn để trống — **nên điền trước khi cần dùng thật**,
   không phải lúc đang sập.
2. Bản sao lưu `.env` thật (ngoài git) — tự bạn giữ ở nơi an toàn (password manager/không lưu plain
   text) vì đây là secret, AI không được lưu hộ.
3. Uptime monitoring tự động (mục 6.1 của `docs/ke-hoach-khoi-phuc-su-co-server.md`) vẫn chưa có —
   nếu VPS mất, hiện tại chỉ phát hiện khi có người kiểm tra thủ công hoặc user báo lỗi.
