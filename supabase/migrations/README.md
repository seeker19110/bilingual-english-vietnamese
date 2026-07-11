# supabase/migrations

Thư mục lưu các thay đổi schema theo thời gian (incremental), để DB cũ **chỉ cần
chạy phần thay đổi mới** thay vì chạy lại toàn bộ `schema.sql`.

## Cách dùng

- DB mới (lần đầu): chạy `../schema.sql` (đã gồm mọi thứ, idempotent).
- DB đã có sẵn: vào Supabase Dashboard → SQL Editor → chạy lần lượt các file
  `NNNN_*.sql` theo thứ tự số tăng dần mà bạn CHƯA chạy.

Mỗi file đặt tên `NNNN_mo-ta-ngan.sql` (số thứ tự 4 chữ số + mô tả).
Tất cả phải viết idempotent (`create or replace`, `if not exists`) để chạy lại an toàn.

## Trạng thái trên Supabase production

> Cập nhật mục này mỗi khi chạy 1 migration mới trên Dashboard production — đây là nơi DUY NHẤT
> cần xem trước khi deploy (thay vì phải lục lại lịch sử `PROGRESS.md`). Xem thêm cảnh báo ở
> `docs/deploy-vps-ubuntu.md` mục "Cập nhật code mới (deploy lại)".

| File                                       | Đã chạy trên production?                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `0001_consume_usage.sql`                   | Có từ trước quy ước theo dõi này — chưa có ghi chú xác nhận riêng, suy ra ĐÃ CHẠY vì tính năng đếm lượt đang chạy thật trên production. |
| `0002_learn_count.sql`                     | (như trên) — streak đang chạy thật trên production.                                                                                     |
| `0003_remind_hour.sql`                     | (như trên) — nhắc học đẩy thông báo đang chạy thật.                                                                                     |
| `0004_refund_usage.sql`                    | (như trên) — hoàn lượt khi provider lỗi đang chạy thật.                                                                                 |
| `0005_lockdown_cost_columns.sql`           | ✅ Đã chạy (người dùng xác nhận 2026-07-02).                                                                                            |
| `0006_pronunciations_rls.sql`              | ✅ Đã chạy (người dùng xác nhận 2026-07-02).                                                                                            |
| `0007_learning_progress_cefr.sql`          | ✅ Đã chạy (người dùng xác nhận 2026-07-11).                                                                                            |
| `0008_learning_progress_cefr_unlocked.sql` | ✅ Đã chạy (người dùng xác nhận 2026-07-11).                                                                                            |
| `0009_learning_progress_cefr_exams.sql`    | ✅ Đã chạy (người dùng xác nhận 2026-07-11).                                                                                            |
| `0010_vlog_entries.sql`                    | ❌ CHƯA CHẠY — bảng `vlog_entries` cho thử thách "Vlog 1 phút / 30 ngày". Chạy TRƯỚC khi deploy code vlog lên VPS.                      |

Nếu bạn (người vận hành) chạy migration mới, cập nhật dòng tương ứng thành
✅ kèm ngày chạy — đừng để trạng thái cũ trôi nổi qua nhiều phiên làm việc.
