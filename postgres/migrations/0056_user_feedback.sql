-- 0056_user_feedback.sql — Tiếp nhận ý kiến đóng góp, phản hồi và báo lỗi từ người dùng.
-- Bảng public.user_feedback hỗ trợ cả người dùng đăng nhập lẫn khách.

create table if not exists public.user_feedback (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id) on delete set null,
  category      text not null check (category in ('bug', 'feature', 'content', 'ui_ux', 'other')),
  rating        integer check (rating is null or (rating >= 1 and rating <= 5)),
  title         text,
  message       text not null check (length(trim(message)) >= 3 and length(message) <= 10000),
  contact_email text check (contact_email is null or length(contact_email) <= 255),
  context_info  jsonb not null default '{}'::jsonb,
  status        text not null default 'new' check (status in ('new', 'reviewed', 'in_progress', 'resolved', 'closed')),
  admin_notes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_user_feedback_user_id on public.user_feedback(user_id);
create index if not exists idx_user_feedback_category on public.user_feedback(category);
create index if not exists idx_user_feedback_status on public.user_feedback(status);
create index if not exists idx_user_feedback_created_at on public.user_feedback(created_at desc);
