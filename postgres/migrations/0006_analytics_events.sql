-- 0006_analytics_events.sql — Bảng analytics tự viết (KHÔNG dùng script bên thứ 3),
-- đo hiệu quả kênh marketing (landing page, chia sẻ, mời bạn...). Ghi qua /api/analytics,
-- không auth bắt buộc (đo được cả khách chưa đăng nhập).

create table if not exists public.analytics_events (
  id         bigserial primary key,
  event      text not null,
  user_id    uuid references public.users(id) on delete set null,
  ref_code   text,
  utm_source text,
  path       text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_idx on public.analytics_events(event, created_at);
