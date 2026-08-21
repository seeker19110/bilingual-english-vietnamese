# Kiểm thử nhánh `restore:r2 -- --restore-into` trên database staging

> Runbook thao tác tay — chạy TRÊN VPS THẬT (cần `psql`, `RESTORE_PSQL_URL`, quyền
> `DROP`/`CREATE DATABASE`). Không chạy được trong sandbox Claude Code web (không có mạng tới
> VPS/Postgres). Mục tiêu: xác nhận nhánh **phá huỷ dữ liệu** (`--restore-into <db> --yes`) của
> `scripts/restore-pg-from-r2.ts` (gọi qua `npm run restore:r2` hoặc gián tiếp qua
> `npm run restore:all -- --restore-into <db> --yes`) hoạt động đúng, TRƯỚC KHI phải dùng thật
> lúc sự cố. Xem bối cảnh nợ kỹ thuật ở `PROGRESS.md` mục "Nợ kỹ thuật còn mở".
>
> **Nguyên tắc an toàn:** toàn bộ quy trình dưới đây dùng tên database TẠM
> (`dhcb_restore_test`), khác hẳn `dhcb` (production). Script chỉ
> `DROP`/`CREATE` đúng tên database truyền vào `--restore-into`, không đụng database nào khác —
> chỉ cần gõ đúng tên là an toàn tuyệt đối cho dữ liệu thật.

## Bước 1 — Chuẩn bị

```bash
cd /path/to/bilingual-english-vietnamese   # thư mục deploy trên VPS
git pull origin main                        # đảm bảo có bản script mới nhất
```

Xác nhận biến môi trường đã có trong `.env` (không commit vào git):

- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BACKUP_BUCKET` — dùng chung
  với `backup:r2`.
- `RESTORE_PSQL_URL` — connection string **SUPERUSER** Postgres (khác `DATABASE_URL` của app),
  ví dụ `postgres://postgres:<mật khẩu>@localhost:5432/postgres`. Cần quyền `DROP`/`CREATE
DATABASE`.

## Bước 2 — Liệt kê backup có sẵn (không đụng gì)

```bash
npm run restore:r2 -- --list
```

Ghi lại tên file backup mới nhất (dạng `pg-backups/dhcb_YYYYMMDD.sql.gz`).

## Bước 3 — Ghi lại số liệu đối chiếu từ database THẬT (chỉ đọc, không sửa)

```bash
psql "$DATABASE_URL" -c "select count(*) from public.users;"
psql "$DATABASE_URL" -c "select count(*) from public.chat_messages;"
psql "$DATABASE_URL" -c "select count(*) from public.payments;"
# thêm bảng khác nếu muốn đối chiếu kỹ hơn — xem postgres/schema.sql để biết danh sách bảng
```

Lưu 3 con số này ra một chỗ (ghi tay hoặc `> /tmp/counts-before.txt`).

## Bước 4 — Chạy nhánh phá huỷ NHẮM VÀO DATABASE TẠM

```bash
npm run restore:r2 -- --restore-into dhcb_restore_test --yes
```

Kỳ vọng thấy log tuần tự: tải file `.sql.gz` về `.restore-*.sql.gz` → `drop database if exists
dhcb_restore_test` → `create database dhcb_restore_test` → `gunzip | psql`
chạy không lỗi → dòng `✅ Khôi phục xong vào database "dhcb_restore_test"`.

**Nếu lệnh báo lỗi** (thiếu quyền, sai connection string, gunzip lỗi định dạng…) — đây chính là
mục tiêu của bài test: phát hiện lỗi TRƯỚC lúc sự cố thật, không phải lúc server đang sập. Sửa
nguyên nhân rồi chạy lại bước 4.

## Bước 5 — Đối chiếu dữ liệu database tạm với số liệu đã ghi ở bước 3

```bash
RESTORE_TEST_URL=$(echo "$RESTORE_PSQL_URL" | sed 's#/[^/?]*\(?\|$\)#/dhcb_restore_test\1#')
psql "$RESTORE_TEST_URL" -c "select count(*) from public.users;"
psql "$RESTORE_TEST_URL" -c "select count(*) from public.chat_messages;"
psql "$RESTORE_TEST_URL" -c "select count(*) from public.payments;"
```

Số liệu phải **khớp hoặc gần khớp** (backup có thể cũ hơn vài giờ so với lúc bạn chạy bước 3 —
chênh lệch nhỏ do người dùng vẫn dùng app trong lúc test là bình thường; chênh lệch lớn/bảng
rỗng mới là dấu hiệu backup hỏng).

Kiểm thêm cấu trúc bảng không thiếu:

```bash
psql "$RESTORE_TEST_URL" -c "\dt public.*" | wc -l
psql "$DATABASE_URL" -c "\dt public.*" | wc -l
# 2 số này nên bằng nhau (cùng số bảng)
```

## Bước 6 — Dọn dẹp database tạm

```bash
psql "$RESTORE_PSQL_URL" -c "drop database if exists dhcb_restore_test;"
```

## Bước 7 — Ghi kết quả vào `PROGRESS.md`

Xoá dòng nợ kỹ thuật "nhánh `--restore-into` chưa test thật" ở mục "Nợ kỹ thuật còn mở", thay
bằng ngày xác nhận đã test thành công (hoặc ghi rõ lỗi phát hiện + đã sửa gì nếu có).

## Vì sao không tự động hoá bước này thành 1 script?

Cân nhắc rồi quyết định KHÔNG viết script tự động gộp 7 bước trên, vì:

- Bước 3/5 (đối chiếu số liệu) cần con người đọc và phán đoán "chênh lệch nhỏ do dùng app trong
  lúc test" vs "chênh lệch lớn do backup hỏng" — không phải so sánh số học đơn thuần nên khó viết
  điều kiện tự động đúng cho mọi trường hợp.
- Việc DROP/CREATE database, dù đã nhắm đúng tên tạm, vẫn nên có người xem log từng bước khi mới
  test lần đầu trên VPS thật — tự động hoá kín (không log ra màn hình) làm mất khả năng phát hiện
  sớm nếu gõ nhầm biến môi trường trỏ sai server.
- `scripts/restore-pg-from-r2.ts` đã đủ tham số CLI để chạy đúng ý mà không cần thêm code mới —
  thêm script bọc ngoài chỉ tăng bề mặt bảo trì cho một quy trình chỉ chạy vài lần/năm.
