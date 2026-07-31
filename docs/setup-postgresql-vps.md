# Cài PostgreSQL tự host trên VPS (Giai đoạn A)

> Việc TAY bạn cần tự chạy trên VPS (SSH vào `103.81.87.174`) — AI không có quyền
> SSH vào VPS production nên không tự chạy được các lệnh dưới đây. Xem bối cảnh đầy
> đủ ở `docs/migration-thoat-ly-supabase.md`.

## 1. Kiểm tra version PostgreSQL có sẵn trong kho Ubuntu 24.04

```bash
apt-cache policy postgresql
```

Ghi lại version hiển thị (đầu 2026 thường là PostgreSQL 16) — **dùng đúng bản kho
mặc định của Ubuntu**, không tự thêm kho ngoài (PGDG) trừ khi bản kho mặc định quá
cũ (< 14).

## 2. Cài đặt

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

## 3. Tạo database + user riêng cho app (không dùng superuser)

```bash
sudo -u postgres psql <<'SQL'
create user tutor_app with password 'ĐẶT_MẬT_KHẨU_MẠNH_Ở_ĐÂY';
create database english_tutor owner tutor_app;
\c english_tutor
grant all on schema public to tutor_app;
SQL
```

> Đổi `ĐẶT_MẬT_KHẨU_MẠNH_Ở_ĐÂY` thành mật khẩu thật — **không dùng lại** mật khẩu
> nào khác đang có (Supabase, Gmail...). Lưu vào trình quản lý mật khẩu của bạn.

> ⚠️ **Bẫy thật đã gặp (2026-07-30):** `create database ... owner tutor_app` chỉ đổi
> chủ **database**, KHÔNG tự đổi chủ **schema `public`** bên trong nó. Từ PostgreSQL 15
> trở đi, schema `public` không còn tự cấp quyền `CREATE` cho mọi role nữa — thiếu dòng
> `grant all on schema public to tutor_app;` ở trên thì `npm run migrate:pg` (hoặc
> deploy tự động) sẽ báo lỗi `permission denied for schema public` (mã lỗi `42501`).
> Nếu đã lỡ tạo database mà quên bước này, chạy bù lại bất kỳ lúc nào:
>
> ```bash
> sudo -u postgres psql -d english_tutor -c "grant all on schema public to tutor_app;"
> ```

## 4. Cho phép kết nối từ localhost (mặc định Postgres đã bind 127.0.0.1, kiểm tra lại)

```bash
sudo -u postgres psql -c "show listen_addresses;"
# Kỳ vọng: localhost (mặc định) — KHÔNG cần đổi thành '*' vì app chạy CÙNG VPS,
# không cần Postgres nghe cổng ra ngoài internet (giảm bề mặt tấn công).
```

Nếu muốn chắc chắn, kiểm tra `pg_hba.conf` (thường ở `/etc/postgresql/<version>/main/pg_hba.conf`)
có dòng `local all all peer` hoặc `host all all 127.0.0.1/32 scram-sha-256` — đây là
mặc định của gói Ubuntu, thường không cần sửa gì.

## 5. Ghi vào `.env` trên VPS

Thêm dòng sau vào file `.env` tại `/var/www/english-tutor/.env` (đường dẫn theo
`docs/deploy-vps-ubuntu.md`):

```
DATABASE_URL=postgresql://tutor_app:ĐẶT_MẬT_KHẨU_MẠNH_Ở_ĐÂY@localhost:5432/english_tutor
```

## 6. Áp schema

Từ thư mục app trên VPS:

```bash
cd /var/www/english-tutor
npm run migrate:pg
```

Kỳ vọng thấy `[migrate:pg] ✅ schema.sql xong.` — nếu lỗi, dán nguyên văn để debug
tiếp (không tự đoán nguyên nhân).

## 7. Backup hàng ngày (BẮT BUỘC — Postgres tự host không có backup tự động như Supabase)

Thêm cron `pg_dump` — ví dụ dọn giữ 7 bản gần nhất, lưu ra thư mục riêng ngoài repo
(sẽ chuyển sang ghi lên Cloudflare R2 ở Giai đoạn D để không chiếm dung lượng VPS
lâu dài):

```bash
sudo -u postgres crontab -e
# Thêm dòng (chạy 3h sáng mỗi ngày):
0 3 * * * pg_dump english_tutor | gzip > /var/backups/english_tutor_$(date +\%Y\%m\%d).sql.gz && find /var/backups -name 'english_tutor_*.sql.gz' -mtime +7 -delete
```

> `/var/backups` cần tồn tại và ghi được bởi user `postgres`:
> `sudo mkdir -p /var/backups && sudo chown postgres:postgres /var/backups`.

### 7.1 Kiểm thử phục hồi (BẮT BUỘC — GĐ5 kế hoạch scale, xem PROGRESS.md)

Có backup KHÔNG có nghĩa là backup DÙNG ĐƯỢC — file có thể hỏng mà không ai biết cho tới lúc
thật sự cần khôi phục. Chạy `scripts/verify-pg-backup.sh` (restore vào database TẠM, kiểm tra
vài bảng cốt lõi có dữ liệu, rồi tự xoá database tạm — an toàn, không đụng dữ liệu thật):

```bash
bash scripts/verify-pg-backup.sh                              # tự tìm backup mới nhất
bash scripts/verify-pg-backup.sh /var/backups/english_tutor_20260725.sql.gz  # chỉ định file
```

Nên thêm vào cron chạy **hàng tuần** (không cần hàng ngày — tốn tài nguyên hơn `pg_dump` vì
phải restore thật), ghi log ra file để xem lại khi cần:

```bash
sudo -u postgres crontab -e
# Thêm dòng (chạy 4h sáng Chủ nhật, sau giờ backup hàng ngày):
0 4 * * 0 bash /var/www/english-tutor/scripts/verify-pg-backup.sh >> /var/log/pg-restore-test.log 2>&1
```

### 7.2 Đẩy backup lên Cloudflare R2 (BẮT BUỘC — backup không được nằm cùng ổ đĩa với DB gốc)

Cron `pg_dump` ở mục 7 chỉ ghi vào `/var/backups` **trên chính máy Postgres**. Ổ đĩa/VPS đó hỏng
→ mất CẢ database gốc LẪN toàn bộ backup cùng lúc — vi phạm nguyên tắc backup cơ bản (bản sao
phải nằm ở "vùng hỏng" khác với dữ liệu gốc). `scripts/backup-pg-to-r2.ts` đẩy các file `.sql.gz`
lên Cloudflare R2 (dùng lại tài khoản R2 đã có cho audio — xem `.env.example`), **bucket RIÊNG,
để PRIVATE** (khác hẳn bucket audio phải public-read).

```bash
# .env: thêm R2_BACKUP_BUCKET (bucket MỚI, KHÁC R2_BUCKET của audio), để PRIVATE trên
# Cloudflare Dashboard (KHÔNG bật Public access — file chứa toàn bộ dữ liệu người dùng).
npm run backup:r2 -- --dry-run   # xem trước
npm run backup:r2                 # chạy thật
```

Thêm vào cron, chạy NGAY SAU giờ `pg_dump` (mục 7) để backup mới nhất luôn được đẩy lên R2 kịp
thời:

```bash
sudo -u postgres crontab -e
# 3h05 sáng — 5 phút sau pg_dump (0 3 * * *) để chắc chắn file đã ghi xong local trước khi upload:
5 3 * * * cd /var/www/english-tutor && npm run backup:r2 >> /var/log/pg-backup-r2.log 2>&1
```

An toàn chạy lại nhiều lần — file đã có trên R2 (đúng kích thước) sẽ tự bỏ qua, nên nếu R2 lỗi
vài ngày, lần chạy kế tiếp tự bù các ngày còn thiếu. Mặc định giữ 30 ngày trên R2
(`BACKUP_KEEP_DAYS`), tự xoá bản cũ hơn.

### 7.3 Backup file `.env` (BẮT BUỘC — `pg_dump` KHÔNG backup secret/API key)

`pg_dump` chỉ backup **database**. File `.env` (API key AI/TTS/STT/R2, `SEPAY_WEBHOOK_API_KEY`,
`SENTRY_DSN`...) không nằm trong database, nên nếu VPS hỏng, khôi phục xong database app vẫn
không chạy được vì thiếu `.env`. `scripts/backup-env-to-r2.ts` mã hoá `.env` (AES-256-GCM) rồi
đẩy lên **cùng bucket R2 private** ở mục 7.2, dùng chung `R2_BACKUP_BUCKET`.

⚠️ **Passphrase mã hoá (`ENV_BACKUP_PASSPHRASE`) TUYỆT ĐỐI KHÔNG được đặt trong chính `.env`** —
nếu mất `.env` thì passphrase cũng mất theo, backup mã hoá sẽ vô dụng. Chọn 1 passphrase mạnh,
lưu ở nơi khác (password manager, hoặc ghi tay cất riêng), dùng lại cho mọi lần backup/khôi phục.

```bash
ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run backup:env -- --dry-run   # xem trước
ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run backup:env                 # chạy thật
```

Thêm vào cron (chạy cùng giờ với `backup:r2`, đặt passphrase trực tiếp trong dòng cron vì cron
không đọc `.env` của shell tương tác):

```bash
sudo -u postgres crontab -e
10 3 * * * cd /var/www/english-tutor && ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run backup:env >> /var/log/env-backup-r2.log 2>&1
```

**Khôi phục** khi cần (tải bản mới nhất, giải mã, ghi ra `.env.restored` để tự kiểm tra trước khi
đổi tên thành `.env`):

```bash
ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run restore:env
```

### 7.4 Backup cấu hình hệ thống: Nginx + crontab + PM2 dump (BẮT BUỘC — phát hiện 2026-07-31)

`pg_dump` chỉ backup database, `backup:env` chỉ backup `.env` — cả hai đều KHÔNG backup cấu hình
Nginx (`/etc/nginx/`: routing theo domain, redirect, SSL), crontab (chính các dòng lệnh khiến
backup này TỰ CHẠY — mất cái này thì có cơ chế backup nhưng không có gì backup nữa), và PM2 dump
(`~/.pm2/dump.pm2`, để `pm2 resurrect` tự khởi động lại đúng tiến trình sau khi VPS hỏng/dựng
lại). `scripts/backup-system-to-r2.ts` đóng gói cả 3 thành 1 tarball, mã hoá AES-256-GCM (dùng lại
cơ chế của `backup:env`), đẩy lên **cùng bucket R2 private** ở mục 7.2.

```bash
sudo pm2 save   # BẮT BUỘC chạy trước, tạo/cập nhật ~/.pm2/dump.pm2 — nếu chưa từng chạy thì
                 # backup sẽ bỏ qua phần PM2 (script tự báo "không thấy PM2 dump")

ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run backup:system -- --dry-run   # xem trước
ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run backup:system                # chạy thật
```

Thêm vào cron (chạy cùng giờ với `backup:env`, cần quyền `root` để đọc `/etc/nginx` + crontab của
user khác — khác `backup:r2`/`backup:env` chạy bằng user `postgres`):

```bash
sudo crontab -e
15 3 * * * cd /var/www/english-tutor && ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run backup:system >> /var/log/system-backup-r2.log 2>&1
```

**Khôi phục** khi cần (tải bản mới nhất, giải mã, ghi ra `system-restored.tar.gz` — KHÔNG tự giải
nén/ghi đè gì, tự kiểm tra rồi khôi phục TỪNG PHẦN theo nhu cầu thật):

```bash
ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run restore:system
tar -tzf system-restored.tar.gz                          # xem cấu trúc bên trong trước
sudo tar -xzf system-restored.tar.gz -C /tmp/restored     # giải nén ra chỗ tạm để xem
sudo cp -a /tmp/restored/nginx/. /etc/nginx/              # khôi phục riêng Nginx (nếu cần)
sudo crontab -u postgres /tmp/restored/crontab/postgres.txt  # khôi phục riêng crontab (nếu cần)
```

### 7.5 Khôi phục TẤT CẢ cùng lúc (VPS mới dựng lại từ đầu)

`scripts/restore-all-from-r2.ts` (`npm run restore:all`) gọi tuần tự cả 3 lệnh trên (không viết lại
logic, chỉ gộp lời gọi) — dùng khi VPS hỏng hẳn, cần khôi phục nhanh thay vì gõ tay 3 lệnh riêng.

```bash
# An toàn — chỉ TẢI VỀ, không đụng database/Nginx/crontab nào:
ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run restore:all

# Kèm khôi phục THẬT Postgres (DROP + tạo lại database đích — cần RESTORE_PSQL_URL trong .env):
ENV_BACKUP_PASSPHRASE="passphrase-cua-ban" npm run restore:all -- --restore-into english_tutor --yes
```

Dù chạy gộp, phần Nginx/crontab vẫn phải tự khôi phục TỪNG PHẦN theo hướng dẫn mục 7.4 (script chỉ
tải về + giải mã, không tự ghi đè `/etc/nginx` hay crontab — tránh phá cấu hình đang chạy nếu chỉ
cần khôi phục 1 phần).

## 8. Xác nhận hoàn tất Giai đoạn A

Báo lại kết quả các bước trên (đặc biệt bước 6 — `npm run migrate:pg` chạy thành
công) để chuyển sang Giai đoạn B (Auth.js). Giai đoạn A **chưa đổi code app đang
chạy** — Postgres mới chỉ tồn tại song song, chưa có gì đọc/ghi vào đó cho tới khi
Giai đoạn B/C nối vào.
