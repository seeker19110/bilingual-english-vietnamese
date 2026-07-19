# Cài PostgreSQL tự host trên VPS (Giai đoạn A)

> Việc TAY bạn cần tự chạy trên VPS (SSH vào `160.30.172.203`) — AI không có quyền
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
SQL
```

> Đổi `ĐẶT_MẬT_KHẨU_MẠNH_Ở_ĐÂY` thành mật khẩu thật — **không dùng lại** mật khẩu
> nào khác đang có (Supabase, Gmail...). Lưu vào trình quản lý mật khẩu của bạn.

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

## 8. Xác nhận hoàn tất Giai đoạn A

Báo lại kết quả các bước trên (đặc biệt bước 6 — `npm run migrate:pg` chạy thành
công) để chuyển sang Giai đoạn B (Auth.js). Giai đoạn A **chưa đổi code app đang
chạy** — Postgres mới chỉ tồn tại song song, chưa có gì đọc/ghi vào đó cho tới khi
Giai đoạn B/C nối vào.
