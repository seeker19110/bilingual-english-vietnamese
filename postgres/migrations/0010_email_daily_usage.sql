-- 0010_email_daily_usage.sql — Đếm số mail đã gửi mỗi ngày, theo từng kênh gửi.
--
-- Vì sao cần: gói miễn phí của nhà cung cấp mail có hạn mức ngày (vd Brevo 300/ngày). Chạm trần
-- mà vẫn gửi tiếp thì nhà cung cấp có thể KHOÁ TÀI KHOẢN GỬI — lúc đó người dùng thật cũng không
-- nhận được mã. Đếm ở đây để biết khi nào phải chuyển sang kênh dự phòng (Amazon SES).
--
-- Đếm ở DB chứ không phải bộ nhớ tiến trình: số phải sống qua restart/deploy, và đúng cả khi
-- sau này chạy nhiều tiến trình.
--
-- Rollback: drop table if exists public.email_daily_usage;

create table if not exists public.email_daily_usage (
  -- Ngày theo giờ Việt Nam (YYYY-MM-DD) — cùng quy ước với daily_usage, xem api/_lib/date.ts.
  day           text primary key,
  -- Số thư đã gửi qua kênh CHÍNH (gói miễn phí có hạn mức).
  primary_sent  integer not null default 0,
  -- Số thư đã gửi qua kênh DỰ PHÒNG (trả tiền theo lượng, vd Amazon SES).
  fallback_sent integer not null default 0
);
