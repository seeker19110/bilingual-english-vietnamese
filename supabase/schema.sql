-- ============================================================================
-- schema.sql — Tạo bảng + bảo mật (RLS) cho đồng bộ dữ liệu người dùng
-- ----------------------------------------------------------------------------
-- CÁCH DÙNG (1 lần duy nhất):
--   1. Mở Supabase Dashboard → SQL Editor → New query
--   2. Dán TOÀN BỘ file này vào, bấm "Run"
--   3. Xong: app sẽ tự đồng bộ chat/viết/nói/lượt dùng lên các bảng này.
--
-- An toàn khi chạy lại nhiều lần (dùng IF NOT EXISTS / OR REPLACE).
-- Mọi bảng đều bật Row Level Security: mỗi người CHỈ đọc/ghi được dữ liệu của
-- chính mình (auth.uid() = user_id). Không ai xem được dữ liệu người khác.
-- ============================================================================

-- ── 1. profiles: hồ sơ + gói (free/pro) ─────────────────────────────────────
-- id trùng với id tài khoản trong Supabase Auth (auth.users.id)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  plan       text not null default 'free',   -- 'free' | 'pro' (đổi tay ở đây để nâng cấp)
  created_at timestamptz not null default now()
);

-- ── 2. chat_sessions: lịch sử chế độ Chat ───────────────────────────────────
create table if not exists public.chat_sessions (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  situation  text,
  level      text,
  messages   jsonb not null default '[]',     -- mảng Message (lưu nguyên JSON)
  created_at bigint not null                   -- epoch milliseconds (khớp createdAt phía app)
);
create index if not exists chat_sessions_user_idx on public.chat_sessions(user_id, created_at desc);

-- ── 3. writing_submissions: lịch sử chấm bài viết ───────────────────────────
create table if not exists public.writing_submissions (
  id           uuid primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  essay_prompt text,
  essay        text,
  feedback     text,                            -- JSON chấm điểm (chuỗi) hoặc null
  submitted_at bigint not null
);
create index if not exists writing_subs_user_idx on public.writing_submissions(user_id, submitted_at desc);

-- ── 4. speaking_sessions: lịch sử luyện nói ─────────────────────────────────
create table if not exists public.speaking_sessions (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  situation  text,
  level      text,
  messages   jsonb not null default '[]',
  created_at bigint not null
);
create index if not exists speaking_sessions_user_idx on public.speaking_sessions(user_id, created_at desc);

-- ── 5. daily_usage: đếm lượt dùng theo ngày (giới hạn Free/Pro) ──────────────
create table if not exists public.daily_usage (
  user_id       uuid not null references auth.users(id) on delete cascade,
  day           text not null,                  -- 'YYYY-MM-DD'
  chat_count    integer not null default 0,
  writing_count integer not null default 0,
  speaking_count integer not null default 0,
  primary key (user_id, day)
);

-- ── 6. tts_cache: cache audio Google TTS dùng chung cho mọi user ─────────────
-- hash = SHA-256(text + lang + voice)[0:32] → key tìm nhanh, tên file trên Storage
-- Bảng này PUBLIC (không cần RLS bật user) — audio đã phát 1 lần thì ai cũng dùng được
create table if not exists public.tts_cache (
  hash       text primary key,              -- 32 ký tự hex
  lang       text not null,                 -- 'en-US' | 'vi-VN'
  voice      text not null default 'female',-- 'female' | 'male'
  audio_url  text not null,                 -- public URL trên Supabase Storage
  created_at timestamptz not null default now()
);
create index if not exists tts_cache_lang_idx on public.tts_cache(lang);

-- ── 7. Bật Row Level Security cho tất cả bảng ───────────────────────────────
alter table public.profiles            enable row level security;
alter table public.chat_sessions       enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.speaking_sessions   enable row level security;
alter table public.daily_usage         enable row level security;

-- ── 8. Policy: mỗi người chỉ thao tác dữ liệu của chính mình ─────────────────
-- (drop trước rồi tạo lại để chạy lại file không bị lỗi "đã tồn tại")

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own chat" on public.chat_sessions;
create policy "own chat" on public.chat_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own writing" on public.writing_submissions;
create policy "own writing" on public.writing_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own speaking" on public.speaking_sessions;
create policy "own speaking" on public.speaking_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own usage" on public.daily_usage;
create policy "own usage" on public.daily_usage
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- tts_cache: bất kỳ ai (kể cả chưa đăng nhập) đều đọc được audio public
alter table public.tts_cache enable row level security;
drop policy if exists "public read tts" on public.tts_cache;
create policy "public read tts" on public.tts_cache for select using (true);
-- Chỉ server (service role) mới được ghi — không cần policy insert/update cho anon

-- ── 9. Tự tạo profiles khi có người đăng ký mới ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
