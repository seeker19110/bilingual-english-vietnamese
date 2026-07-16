# supabase/migrations

Thư mục lưu các thay đổi schema theo thời gian (incremental), để DB cũ **chỉ cần
chạy phần thay đổi mới** thay vì chạy lại toàn bộ `schema.sql`.

## Cách dùng

- DB mới (lần đầu): chạy `../schema.sql` (đã gồm mọi thứ, idempotent).
- DB đã có sẵn (production): **tự động** khi deploy qua `bash deploy.sh` — xem mục
  "Chạy tự động khi deploy" bên dưới. Chỉ cần dán tay vào Dashboard khi KHÔNG dùng
  `deploy.sh` (ví dụ deploy thủ công/nơi khác) hoặc chưa điền `SUPABASE_DB_URL`.

Mỗi file đặt tên `NNNN_mo-ta-ngan.sql` (số thứ tự 4 chữ số + mô tả).
Tất cả phải viết idempotent (`create or replace`, `if not exists`) để chạy lại an toàn —
quy ước này BẮT BUỘC vì cơ chế tự động bên dưới có thể chạy lại 1 file nếu bước ghi
trạng thái "đã áp dụng" bị lỗi giữa chừng (xem `scripts/run-migrations.ts`).

## Chạy tự động khi deploy (khuyên dùng)

`deploy.sh` (bước 6/8) tự chạy `npm run migrate` (`scripts/run-migrations.ts`) — script
này kết nối THẲNG Postgres bằng connection string `SUPABASE_DB_URL` (biến MỚI, khác
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` — 2 biến đó là REST API, không chạy được
lệnh SQL DDL như tạo bảng/cột), tự tạo bảng theo dõi `_schema_migrations` ở lần chạy
đầu tiên (không cần bootstrap thủ công), rồi tìm mọi file `NNNN_*.sql` CHƯA có trong
bảng đó và áp dụng lần lượt — mỗi file chạy trong 1 transaction riêng (rollback nếu
lỗi, không đánh dấu "đã áp dụng"). Deploy dừng ngay nếu 1 migration lỗi.

**Cần làm 1 lần**: điền `SUPABASE_DB_URL` vào `.env` trên VPS (lấy ở Supabase
Dashboard → Project Settings → Database → Connection string → mục **"Direct
connection"**, không dùng "Transaction pooler") — xem `docs/deploy-vps-ubuntu.md`
Bước 0 mục 4 + Bước 4. Sau đó mọi migration mới tự chạy mỗi lần `bash deploy.sh`.

Vì `0001`–`0009` đều viết idempotent (đã chạy tay trên production từ trước), lần đầu
tiên chạy `npm run migrate` trên production sẽ áp lại chúng một cách an toàn (chỉ tốn
thêm vài trăm ms) rồi mới tới `0010` — không cần đánh dấu hay bỏ qua thủ công.

## Trạng thái trên Supabase production

| File                                       | Đã chạy trên production?                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `0001_consume_usage.sql`                   | ✅ Đã chạy (đếm lượt đang chạy thật trên production).                                                                                         |
| `0002_learn_count.sql`                     | ✅ Đã chạy (streak đang chạy thật).                                                                                                           |
| `0003_remind_hour.sql`                     | ✅ Đã chạy (nhắc học đẩy thông báo đang chạy thật).                                                                                           |
| `0004_refund_usage.sql`                    | ✅ Đã chạy (hoàn lượt khi provider lỗi đang chạy thật).                                                                                       |
| `0005_lockdown_cost_columns.sql`           | ✅ Đã chạy (người dùng xác nhận 2026-07-02).                                                                                                  |
| `0006_pronunciations_rls.sql`              | ✅ Đã chạy (người dùng xác nhận 2026-07-02).                                                                                                  |
| `0007_learning_progress_cefr.sql`          | ✅ Đã chạy (người dùng xác nhận 2026-07-11).                                                                                                  |
| `0008_learning_progress_cefr_unlocked.sql` | ✅ Đã chạy (người dùng xác nhận 2026-07-11).                                                                                                  |
| `0009_learning_progress_cefr_exams.sql`    | ✅ Đã chạy (người dùng xác nhận 2026-07-11).                                                                                                  |
| `0010_challenge_entries.sql`               | ❌ CHƯA CHẠY — bảng `challenge_entries` cho thử thách "Challenge 1 phút / 30 ngày". Tự áp khi deploy lần tới (cần `SUPABASE_DB_URL` đã điền). |
| `0011_learning_progress_placement.sql`     | ❌ CHƯA CHẠY — cột `placement` cho bài test xếp lớp đầu vào. Tự áp khi deploy lần tới (cần `SUPABASE_DB_URL` đã điền).                        |
| `0012_learning_progress_weekly_goal.sql`   | ❌ CHƯA CHẠY — cột `weekly_goal` cho mục tiêu tuần (② M1). Tự áp khi deploy lần tới (cần `SUPABASE_DB_URL` đã điền).                          |
| `0013_learning_progress_achievements.sql`  | ❌ CHƯA CHẠY — cột `achievements` cho huy hiệu & mốc (② M2). Tự áp khi deploy lần tới (cần `SUPABASE_DB_URL` đã điền).                        |
| `0014_tutor_feedback.sql`                  | ❌ CHƯA CHẠY — bảng `tutor_feedback` cho nút 👍/👎 (⑤ T3). Tự áp khi deploy lần tới (cần `SUPABASE_DB_URL` đã điền).                          |

> Sau khi `SUPABASE_DB_URL` đã điền, bảng này **không còn cần cập nhật tay** mỗi lần
> chạy migration — `deploy.sh` tự ghi vào `_schema_migrations` trên Supabase. Chỉ cần
> sửa bảng trên khi deploy KHÔNG qua `deploy.sh` (dán tay vào Dashboard).
