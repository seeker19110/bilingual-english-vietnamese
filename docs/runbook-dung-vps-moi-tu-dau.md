# Runbook: Dựng VPS mới hoàn toàn từ đầu + khôi phục dữ liệu

> Dùng khi: VPS cũ hỏng phần cứng vĩnh viễn, hoặc **diễn tập** (thực hành quy trình khi chưa có sự
> cố thật) để chắc chắn ai cũng làm được lúc cần. Gộp 2 quy trình đã có sẵn thành **1 checklist duy
> nhất chạy tuần tự**, không thay thế 2 file gốc:
>
> - `docs/deploy-vps-ubuntu.md` — chi tiết từng lệnh cài đặt (tham khảo khi cần giải thích thêm).
> - `docs/ke-hoach-khoi-phuc-su-co-server.md` — quy trình ứng phó khi server **đang chạy** bị sự cố
>   (khác với dựng **VPS mới hoàn toàn** ở đây).
> - `docs/ke-hoach-khoi-phuc-su-co.md` — kịch bản disaster recovery đầy đủ dùng **R2** làm nơi lưu
>   backup từ xa (`npm run restore:r2` cho database, `npm run restore:env` cho `.env`) — nguồn chính
>   cho mục 3/4 bên dưới, vì R2 độc lập với VPS nên vẫn dùng được kể cả khi mất luôn VPS cũ.
>
> ⚠️ Đây là thao tác thật trên hạ tầng — nếu VPS hiện tại (`160.30.172.203`,
> `en-vi.donghanhcungban.com`) **vẫn đang chạy bình thường**, KHÔNG chạy các lệnh xoá/ghi đè trong
> file này nhắm vào nó. Chỉ áp dụng cho **VPS mới, trống**.

---

## 0. Trước khi bắt đầu — thông tin cần có sẵn

Điền vào đây (hoặc tài liệu nội bộ riêng, không commit secret thật):

| Mục                                 | Giá trị                                                                                                                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nhà cung cấp VPS mới                | _(điền)_                                                                                                                                                                                                                                              |
| IP VPS mới                          | _(điền sau khi tạo máy)_                                                                                                                                                                                                                              |
| Domain sẽ trỏ vào                   | `en-vi.donghanhcungban.com` (đổi DNS A record sang IP mới)                                                                                                                                                                                            |
| Bản backup Postgres dùng để restore | ưu tiên lấy từ **R2** (`npm run restore:r2 -- --list`, bucket `R2_BACKUP_BUCKET`) — không cần còn giữ VPS cũ. Chỉ dùng `/var/backups/english_tutor_*.sql.gz` local nếu R2 cũng không truy cập được                                                    |
| `.env` cũ (chứa secret thật)        | ưu tiên khôi phục từ R2 (`npm run restore:env`, cần `ENV_BACKUP_PASSPHRASE` — xem mục 3a bên dưới). Nếu chưa từng bật cron `backup:env`/`backup:r2` (`docs/setup-postgresql-vps.md` mục 7.2-7.3) thì không có gì để khôi phục — phải tạo lại từng key |
| `ENV_BACKUP_PASSPHRASE`             | passphrase mã hoá `.env` khi backup lên R2 — **không nằm trong `.env`** (theo thiết kế), phải lấy từ nơi lưu riêng (password manager)                                                                                                                 |
| SSH key                             | dùng key cũ nếu còn giữ, hoặc tạo cặp key mới rồi cập nhật `~/.ssh/config`                                                                                                                                                                            |

> Nếu **mất luôn** cả `.env` lẫn không khôi phục được từ R2 (chưa bật cron `backup:env`, hoặc mất cả
> `ENV_BACKUP_PASSPHRASE`) → phải tạo lại **toàn bộ secret mới**: `TTS_ENCRYPTION_MASTER_KEY` mới
> nghĩa là **audio cache cũ không giải mã được nữa** (chấp nhận được — TTS tự tạo lại), nhưng
> `JWT`/password DB thì phải khớp với dữ liệu restore từ backup nếu muốn user cũ đăng nhập lại được
> bằng mật khẩu cũ (mật khẩu hash nằm trong DB, không phụ thuộc secret app — chỉ cần restore đúng DB
> là đăng nhập lại được, không cần khớp secret cũ).

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
- [ ] Bước 4 — Clone code, `npm install` **trước** để có `npm run restore:env` dùng được, rồi khôi
      phục `.env` (xem mục 3a bên dưới) thay vì gõ tay lại từng key, cuối cùng `npm run build`
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

## 3. Khôi phục `.env` + database từ R2 (theo `docs/ke-hoach-khoi-phuc-su-co.md`)

### 3a. Khôi phục `.env` (làm TRƯỚC — cần `DATABASE_URL`/`R2_*` để bước sau chạy được)

```bash
cd /var/www/english-tutor
ENV_BACKUP_PASSPHRASE="passphrase-that-cua-ban" npm run restore:env
# → ghi ra .env.restored, TỰ ĐỌC LẠI rồi mới đổi tên:
mv .env.restored .env
```

> Script cố tình KHÔNG ghi đè `.env` trực tiếp — đọc kỹ nội dung trước khi `mv`, tránh restore
> nhầm bản backup của môi trường khác.

- [ ] `.env` khôi phục xong, đủ key theo `.env.example` (kiểm tra nhanh:
      `diff <(grep -oP '^[A-Z_]+(?==)' .env.example) <(grep -oP '^[A-Z_]+(?==)' .env)`)

### 3b. Khôi phục database (dùng R2 — không cần VPS cũ còn sống)

```bash
cd /var/www/english-tutor

# Xem có bản backup nào trên R2, chọn bản cần dùng
RESTORE_PSQL_URL=postgresql://postgres:MAT-KHAU-SUPERUSER@localhost:5432/postgres \
  npm run restore:r2 -- --list

# Khôi phục thật — backup tự tạo lại toàn bộ schema, KHÔNG cần chạy migrate:pg trước
RESTORE_PSQL_URL=postgresql://postgres:MAT-KHAU-SUPERUSER@localhost:5432/postgres \
  npm run restore:r2 -- --restore-into english_tutor --yes
```

```bash
# Xác nhận dữ liệu thật, không phải bảng rỗng
sudo -u postgres psql english_tutor -c "select count(*) from public.users;"

# Chạy migration còn thiếu (backup có thể cũ hơn schema mới nhất)
npm run migrate:pg
```

- [ ] `restore:r2 --list` thấy đúng bản backup mong muốn
- [ ] `restore:r2 --restore-into` chạy xong, không lỗi
- [ ] `select count(*) from public.users` > 0 và hợp lý so với traffic gần đây
- [ ] `npm run migrate:pg` chạy xong, không lỗi

### 3c. Phương án dự phòng — không dùng được R2 (backup local trên VPS cũ vẫn còn truy cập được)

```bash
# 1. Copy file backup local từ VPS cũ lên VPS mới
scp /duong/dan/english_tutor_YYYYMMDD.sql.gz root@<ip-vps-moi>:/var/backups/

# 2. Verify backup không hỏng trước khi restore thật
bash /var/www/english-tutor/scripts/verify-pg-backup.sh /var/backups/english_tutor_YYYYMMDD.sql.gz

# 3. Nếu OK — restore vào DB thật (DB đang trống, không cần dropdb)
gunzip -c /var/backups/english_tutor_YYYYMMDD.sql.gz | sudo -u postgres psql english_tutor

# 4. Chạy migration còn thiếu
cd /var/www/english-tutor && npm run migrate:pg
```

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
