# supabase/migrations

Thư mục lưu các thay đổi schema theo thời gian (incremental), để DB cũ **chỉ cần
chạy phần thay đổi mới** thay vì chạy lại toàn bộ `schema.sql`.

## Cách dùng
- DB mới (lần đầu): chạy `../schema.sql` (đã gồm mọi thứ, idempotent).
- DB đã có sẵn: vào Supabase Dashboard → SQL Editor → chạy lần lượt các file
  `NNNN_*.sql` theo thứ tự số tăng dần mà bạn CHƯA chạy.

Mỗi file đặt tên `NNNN_mo-ta-ngan.sql` (số thứ tự 4 chữ số + mô tả).
Tất cả phải viết idempotent (`create or replace`, `if not exists`) để chạy lại an toàn.
