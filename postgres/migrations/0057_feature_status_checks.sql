-- 0057_feature_status_checks.sql — Bảng lưu lịch sử kiểm tra trạng thái hoạt động các tính
-- năng dùng API bên thứ ba (AI chat, STT, TTS, R2 storage, SePay) và không dùng API
-- (Postgres) của dự án, phục vụ trang Admin (mục "Trạng thái hệ thống"). Xem
-- api/admin-feature-status.ts + api/_lib/featureStatusChecks.ts.

create table if not exists public.feature_status_checks (
  id bigserial primary key,
  run_at timestamptz not null default now(),
  -- 'cron' = tự động (crontab VPS gọi 2 lần/ngày) · 'manual' = admin bấm nút kiểm tra thủ công.
  triggered_by text not null check (triggered_by in ('cron', 'manual')),
  triggered_by_email text,
  -- Tổng hợp cả lượt chạy: 'up' mọi tính năng OK · 'degraded' có tính năng lỗi nhưng còn
  -- tính năng khác chạy được · 'down' tất cả tính năng cốt lõi đều lỗi.
  overall_status text not null check (overall_status in ('up', 'degraded', 'down')),
  -- Mảng JSON từng tính năng: [{ key, label, usesApi, status, latencyMs?, message? }, ...]
  results jsonb not null
);

create index if not exists idx_feature_status_checks_run_at
  on public.feature_status_checks (run_at desc);
