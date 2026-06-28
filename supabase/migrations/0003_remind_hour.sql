-- 0003_remind_hour.sql
-- Thêm cột remind_hour vào push_subscriptions: giờ UTC (0–23) người dùng muốn được
-- nhắc vào học mỗi ngày. null = dùng giờ mặc định (13 UTC = 20:00 giờ VN).
-- An toàn khi chạy lại (if not exists).

alter table public.push_subscriptions add column if not exists remind_hour smallint;
