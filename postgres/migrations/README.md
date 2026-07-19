# postgres/migrations

Thư mục lưu thay đổi schema PostgreSQL tự host theo thời gian (incremental), giống
cơ chế `supabase/migrations/` cũ nhưng cho DB tự host trên VPS.

- DB mới (lần đầu): `npm run migrate:pg` tự áp `../schema.sql` (đầy đủ, idempotent)
  RỒI mới áp các file lẻ trong thư mục này.
- Đặt tên file `NNNN_mo-ta-ngan.sql` (số thứ tự 4 chữ số + mô tả), viết idempotent
  (`create or replace`, `if not exists`).
- Hiện chưa có file migration lẻ nào — mọi thay đổi tính tới Giai đoạn A đã gộp vào
  `../schema.sql`. Bắt đầu đánh số từ `0001_` khi có thay đổi schema đầu tiên SAU khi
  Giai đoạn A hoàn tất.
