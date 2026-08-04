-- 0033_email_reminders.sql — Theo dõi thời gian gửi email nhắc học gần nhất (tránh gửi spam).

create table if not exists public.email_reminders (
  user_id       uuid primary key references public.users(id) on delete cascade,
  last_sent_at  timestamptz not null default now()
);
