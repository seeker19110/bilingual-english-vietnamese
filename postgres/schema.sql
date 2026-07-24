-- ============================================================================
-- postgres/schema.sql — Schema PostgreSQL TỰ HOST (thay thế supabase/schema.sql)
-- ----------------------------------------------------------------------------
-- Xem kế hoạch đầy đủ: docs/migration-thoat-ly-supabase.md (Giai đoạn A).
--
-- KHÁC BIỆT so với supabase/schema.sql:
--   1. Bảng `users` tự quản thay cho `auth.users` (Supabase Auth) — Giai đoạn B
--      (Auth.js) sẽ ghi/đọc bảng này trực tiếp.
--   2. KHÔNG có Row Level Security / policy — không còn client query trực tiếp
--      DB (không có PostgREST), mọi truy cập đi qua Express (api/) nên kiểm
--      quyền nằm ở code server (`requireUser()`), không nằm ở DB.
--   3. KHÔNG có trigger `handle_new_user` trên `auth.users` — tạo `profiles`
--      khi đăng ký được làm trong code server (cùng transaction), dễ debug hơn
--      trigger DB ẩn.
--   4. Hàm `consume_usage`/`refund_usage` giữ nguyên logic (không hề dùng
--      auth.uid(), chỉ nhận p_user_id làm tham số) — copy nguyên vẹn.
--
-- An toàn khi chạy lại nhiều lần (dùng IF NOT EXISTS / OR REPLACE), giống quy
-- ước file schema.sql cũ.
-- ============================================================================

create extension if not exists pgcrypto; -- cho gen_random_uuid()

-- ── 0. users: tài khoản (thay auth.users của Supabase) ───────────────────────
-- Auth.js (Giai đoạn B) sẽ đọc/ghi bảng này: đăng ký (email/password băm bằng
-- bcrypt/argon2) và đăng nhập Google OAuth (google_id lưu id tài khoản Google).
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text,                 -- null nếu tài khoản chỉ đăng nhập Google
  google_id     text unique,          -- null nếu tài khoản chỉ dùng email/password
  email_verified timestamptz,         -- null = chưa xác thực email
  created_at    timestamptz not null default now()
);

-- ── 0b. sessions: session Auth.js (database session, cho phép revoke) ────────
create table if not exists public.sessions (
  session_token text primary key,
  user_id       uuid not null references public.users(id) on delete cascade,
  expires       timestamptz not null
);
create index if not exists sessions_user_idx on public.sessions(user_id);

-- ── 1. profiles: hồ sơ + gói (free/pro) ───────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references public.users(id) on delete cascade,
  name       text,
  plan       text not null default 'free',   -- 'free' | 'pro' (đổi tay ở đây để nâng cấp)
  created_at timestamptz not null default now()
);

-- ── 2. chat_sessions: lịch sử chế độ Chat ────────────────────────────
create table if not exists public.chat_sessions (
  id         uuid primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  situation  text,
  level      text,
  messages   jsonb not null default '[]',
  created_at bigint not null
);
create index if not exists chat_sessions_user_idx on public.chat_sessions(user_id, created_at desc);

-- ── 3. writing_submissions: lịch sử chấm bài viết ──────────────────────
create table if not exists public.writing_submissions (
  id           uuid primary key,
  user_id      uuid not null references public.users(id) on delete cascade,
  essay_prompt text,
  essay        text,
  feedback     text,
  submitted_at bigint not null
);
create index if not exists writing_subs_user_idx on public.writing_submissions(user_id, submitted_at desc);

-- ── 4. speaking_sessions: lịch sử luyện nói ──────────────────────────
create table if not exists public.speaking_sessions (
  id         uuid primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  situation  text,
  level      text,
  messages   jsonb not null default '[]',
  created_at bigint not null
);
create index if not exists speaking_sessions_user_idx on public.speaking_sessions(user_id, created_at desc);

-- ── 5. daily_usage: đếm lượt dùng theo ngày (giới hạn Free/Pro) ─────────────
create table if not exists public.daily_usage (
  user_id        uuid not null references public.users(id) on delete cascade,
  day            text not null,                  -- 'YYYY-MM-DD'
  chat_count     integer not null default 0,
  writing_count  integer not null default 0,
  speaking_count integer not null default 0,
  stt_count      integer not null default 0,
  learn_count    integer not null default 0,
  pronounce_count integer not null default 0,
  primary key (user_id, day)
);

-- ── 6. tts_cache: cache audio TTS dùng chung cho mọi user ─────────────
create table if not exists public.tts_cache (
  hash       text primary key,
  lang       text not null,
  voice      text not null default 'female',
  audio_url  text not null,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now()  -- Giai đoạn D: LRU dọn cache R2
);
create index if not exists tts_cache_lang_idx on public.tts_cache(lang);

-- ── 6a. pronunciations: cache audio phát âm TỪ ĐƠN dùng chung cho mọi user ────
create table if not exists public.pronunciations (
  id            uuid primary key default gen_random_uuid(),
  word          text not null,
  voice         text not null default 'female',
  audio_url     text not null,
  lang          text not null default 'en-US',
  voice_version text,
  created_at    timestamptz default now(),
  last_accessed_at timestamptz not null default now(), -- Giai đoạn D: LRU dọn cache R2
  unique (word, voice, lang) -- kèm lang: tránh 1 chữ trùng cả 2 ngôn ngữ đè cache lẫn nhau
);
create index if not exists idx_pronunciations_word on public.pronunciations(word);

-- ── 6b. learning_progress: tiến độ học ─────
create table if not exists public.learning_progress (
  user_id        uuid primary key references public.users(id) on delete cascade,
  learned        jsonb not null default '[]',
  hard           jsonb not null default '[]',
  srs            jsonb not null default '{}',
  cefr_grammar   jsonb not null default '[]',
  cefr_dialogues jsonb not null default '[]',
  cefr_unlocked  jsonb not null default '[]',
  cefr_exams     jsonb not null default '{}',
  placement      jsonb not null default '{}',
  weekly_goal    jsonb not null default '{}',
  achievements   jsonb not null default '[]',
  updated_at     timestamptz not null default now()
);

-- ── 7. profiles: cột onboarding + giải đấu tuần ───────────────
alter table public.profiles add column if not exists onboarded     boolean not null default false;
alter table public.profiles add column if not exists user_level    text             default 'beginner';
alter table public.profiles add column if not exists goal          text             default 'daily';
alter table public.profiles add column if not exists daily_minutes integer          default 10;
alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists league_opt_in boolean not null default false;
create unique index if not exists profiles_nickname_unique_idx
  on public.profiles (lower(nickname))
  where nickname is not null;
-- Không còn RLS/GRANT theo cột (mục 8b của schema Supabase cũ) — kiểm soát cột
-- "chỉ server ghi được" (plan, nickname, league_opt_in, *_count) giờ nằm ở code
-- server (route Express không cho client tự set các trường này qua body).

-- ── 8. push_subscriptions ───────────────
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth_key    text not null,
  remind_hour smallint,
  created_at  timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- ── 9. consume_usage: đếm lượt ATOMIC (chống race condition) ───────────────
-- Copy nguyên vẹn từ supabase/schema.sql — không hề tham chiếu auth.uid().
create or replace function public.consume_usage(
  p_user_id uuid,
  p_day     text,
  p_col     text,
  p_limit   integer
) returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_current integer;
begin
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count', 'pronounce_count') then
    raise exception 'cot dem khong hop le: %', p_col;
  end if;

  insert into public.daily_usage (user_id, day)
  values (p_user_id, p_day)
  on conflict (user_id, day) do nothing;

  execute format(
    'select %I from public.daily_usage where user_id = $1 and day = $2 for update',
    p_col
  ) into v_current using p_user_id, p_day;

  if coalesce(v_current, 0) >= p_limit then
    return false;
  end if;

  execute format(
    'update public.daily_usage set %I = %I + 1 where user_id = $1 and day = $2',
    p_col, p_col
  ) using p_user_id, p_day;

  return true;
end;
$$;

-- ── 10. refund_usage: hoàn lại 1 lượt khi provider lỗi ──────────────────────
create or replace function public.refund_usage(
  p_user_id uuid,
  p_day     text,
  p_col     text
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count', 'pronounce_count') then
    raise exception 'cot dem khong hop le: %', p_col;
  end if;

  execute format(
    'update public.daily_usage set %I = greatest(%I - 1, 0) where user_id = $1 and day = $2',
    p_col, p_col
  ) using p_user_id, p_day;
end;
$$;

-- ── 11. challenge_entries: thử thách "Challenge 1 phút / 30 ngày" ─────
create table if not exists public.challenge_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  day             date not null,
  challenge_round int not null default 1,
  challenge_day   int not null,
  topic_day       int not null,
  transcript      text not null,
  feedback        jsonb,
  duration_sec    int not null default 0,
  word_count      int not null default 0,
  created_at      timestamptz default now(),
  unique (user_id, day)
);

-- ── 12. tutor_feedback: người dùng báo AI sửa sai/bỏ sót ─────
create table if not exists public.tutor_feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  source      text not null,
  user_input  text not null,
  ai_feedback text not null,
  created_at  timestamptz not null default now()
);
create index if not exists tutor_feedback_user_idx on public.tutor_feedback(user_id, created_at desc);

-- ── 13. _schema_migrations: theo dõi migration đã áp dụng (scripts/run-pg-migrations.ts) ──
create table if not exists public._schema_migrations (
  filename   text primary key,
  applied_at timestamptz not null default now()
);
