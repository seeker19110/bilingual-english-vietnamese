-- 0002_learn_count.sql
-- Thêm cột learn_count vào daily_usage để ghi nhận "có học từ vựng hôm nay".
-- Dùng để tính chuỗi ngày liên tiếp (streak) — KHÔNG phải lượt tốn API, không giới hạn gói.
-- Client tự upsert cột này (RLS "own usage" cho phép), nên streak đồng bộ giữa các máy.
-- An toàn khi chạy lại (if not exists).

alter table public.daily_usage add column if not exists learn_count integer not null default 0;
