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

-- ── 1. profiles: hồ sơ + gói (free/pro) ───────────────────────────────
-- id trùng với id tài khoản trong Supabase Auth (auth.users.id)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  plan       text not null default 'free',   -- 'free' | 'pro' (đổi tay ở đây để nâng cấp)
  created_at timestamptz not null default now()
);

-- ── 2. chat_sessions: lịch sử chế độ Chat ────────────────────────────
create table if not exists public.chat_sessions (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  situation  text,
  level      text,
  messages   jsonb not null default '[]',     -- mảng Message (lưu nguyên JSON)
  created_at bigint not null                   -- epoch milliseconds (khớp createdAt phía app)
);
create index if not exists chat_sessions_user_idx on public.chat_sessions(user_id, created_at desc);

-- ── 3. writing_submissions: lịch sử chấm bài viết ──────────────────────
create table if not exists public.writing_submissions (
  id           uuid primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  essay_prompt text,
  essay        text,
  feedback     text,                            -- JSON chấm điểm (chuỗi) hoặc null
  submitted_at bigint not null
);
create index if not exists writing_subs_user_idx on public.writing_submissions(user_id, submitted_at desc);

-- ── 4. speaking_sessions: lịch sử luyện nói ──────────────────────────
create table if not exists public.speaking_sessions (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  situation  text,
  level      text,
  messages   jsonb not null default '[]',
  created_at bigint not null
);
create index if not exists speaking_sessions_user_idx on public.speaking_sessions(user_id, created_at desc);

-- ── 5. daily_usage: đếm lượt dùng theo ngày (giới hạn Free/Pro) ─────────────
create table if not exists public.daily_usage (
  user_id       uuid not null references auth.users(id) on delete cascade,
  day           text not null,                  -- 'YYYY-MM-DD'
  chat_count    integer not null default 0,
  writing_count integer not null default 0,
  speaking_count integer not null default 0,
  stt_count     integer not null default 0,    -- lượt nhận diện giọng nói (STT), đếm riêng
  learn_count   integer not null default 0,    -- số từ vựng học trong ngày (để tính streak, KHÔNG giới hạn)
  primary key (user_id, day)
);
-- Bổ sung cột cho DB cũ đã tạo bảng trước khi có stt_count / learn_count (chạy lại an toàn).
alter table public.daily_usage add column if not exists stt_count   integer not null default 0;
alter table public.daily_usage add column if not exists learn_count integer not null default 0;

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

-- ── 6a. pronunciations: cache audio phát âm TỪ ĐƠN dùng chung cho mọi user ────
-- (Trước đây bảng này chỉ nằm trong hướng dẫn PRONUNCIATION_CACHE_SETUP.md — thêm vào
-- đây để schema.sql là nguồn sự thật DUY NHẤT của schema. Chạy lại an toàn.)
-- Mỗi (word, voice) 1 dòng; voice_version đánh dấu đời giọng — khác VOICE_VERSION hiện
-- tại (api/_lib/googleTts.ts) thì coi là MISS và tạo lại (xem api/pronunciation.ts).
create table if not exists public.pronunciations (
  id            uuid primary key default gen_random_uuid(),
  word          text not null,
  voice         text not null default 'female', -- 'female' | 'female2' | 'male' | 'male2'
  audio_url     text not null,
  lang          text not null default 'en-US',
  voice_version text,                            -- null = audio đời giọng cũ (sẽ tạo lại)
  created_at    timestamptz default now(),
  unique (word, voice)
);
create index if not exists idx_pronunciations_word on public.pronunciations(word);
-- Bổ sung cột cho DB cũ đã tạo bảng theo hướng dẫn trước khi có voice_version.
alter table public.pronunciations add column if not exists voice_version text;

-- ── 6b. learning_progress: tiến độ học (từ đã thuộc, từ khó, lịch ôn SRS) ─────
-- Mỗi user 1 dòng. Đồng bộ để đổi máy không mất tiến độ (xem src/lib/progressSync.ts).
create table if not exists public.learning_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  learned    jsonb not null default '[]',   -- mảng từ đã thuộc
  hard       jsonb not null default '[]',   -- mảng từ đánh dấu khó
  srs        jsonb not null default '{}',   -- map từ → thẻ SRS {interval,ease,due,reps}
  updated_at timestamptz not null default now()
);

-- Cột thêm sau (migration 0007): tiến độ lộ trình CEFR — bài ngữ pháp đã học xong
-- + hội thoại đã xem ("<id unit/vòng>:<titleEn>"). Đặt ngoài create table để DB cũ
-- (đã có bảng) chạy lại schema.sql vẫn nhận được cột mới.
alter table public.learning_progress
  add column if not exists cefr_grammar jsonb not null default '[]';
alter table public.learning_progress
  add column if not exists cefr_dialogues jsonb not null default '[]';

-- Cột thêm sau (migration 0008): các cấp CEFR ĐÃ TỪNG mở khóa (grandfather) — chặn
-- việc tăng từ vựng sau này (PR #185-187) làm % cấp trước tụt dưới ngưỡng và khóa
-- lại cấp người dùng đang học dở (xem lib/cefrProgress.ts computeLockedMapPersisted).
alter table public.learning_progress
  add column if not exists cefr_unlocked jsonb not null default '[]';

-- Cột thêm sau (migration 0009): kết quả bài thi cuối cấp CEFR — map
-- { levelId → { passed, bestPct, attempts, lastAt } } (xem lib/cefrExam.ts).
-- (Bổ sung vào đây 2026-07-11 khi rà soát: schema.sql từng thiếu dòng này dù
-- migration 0009 đã chạy production — DB mới tạo từ schema.sql sẽ gãy progressSync.)
alter table public.learning_progress
  add column if not exists cefr_exams jsonb not null default '{}';

-- Cột thêm sau (migration 0011): kết quả bài test xếp lớp gần nhất — { cefr,
-- appLevel, lastAt } (xem lib/placement.ts, lib/placementResult.ts).
alter table public.learning_progress
  add column if not exists placement jsonb not null default '{}';

-- Cột thêm sau (migration 0012): mục tiêu tuần — { goal, updatedAt } (số ngày
-- học/tuần người dùng chọn: 3/5/7 — xem lib/weeklyGoal.ts).
alter table public.learning_progress
  add column if not exists weekly_goal jsonb not null default '{}';

-- ── 7. Bật Row Level Security cho tất cả bảng ─────────────────────────
alter table public.profiles            enable row level security;
alter table public.chat_sessions       enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.speaking_sessions   enable row level security;
alter table public.daily_usage         enable row level security;

-- ── 8. Policy: mỗi người chỉ thao tác dữ liệu của chính mình ───────────────
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

-- ── 8b. Khóa quyền ghi cột KIỂM SOÁT CHI PHÍ (quyền theo CỘT, xem migration 0005) ──
-- RLS chỉ chặn theo DÒNG, không theo cột → nếu không có phần này, người dùng có thể tự
-- ghi profiles.plan='pro' hoặc reset daily_usage.*_count để vượt giới hạn gói (tốn tiền
-- API). Server dùng service_role nên bỏ qua các hạn chế này, vẫn ghi bình thường.
revoke update (plan) on public.profiles from authenticated, anon;
revoke insert, update on public.daily_usage from authenticated, anon;
grant  insert (user_id, day, learn_count) on public.daily_usage to authenticated; -- streak
grant  update (learn_count)               on public.daily_usage to authenticated; -- streak

alter table public.learning_progress enable row level security;
drop policy if exists "own progress" on public.learning_progress;
create policy "own progress" on public.learning_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- tts_cache: bất kỳ ai (kể cả chưa đăng nhập) đều đọc được audio public
alter table public.tts_cache enable row level security;
drop policy if exists "public read tts" on public.tts_cache;
create policy "public read tts" on public.tts_cache for select using (true);
-- Chỉ server (service role) mới được ghi — không cần policy insert/update cho anon

-- pronunciations: giống tts_cache — cache dùng chung, chỉ server ghi (service role)
alter table public.pronunciations enable row level security;
drop policy if exists "public read pronunciations" on public.pronunciations;
create policy "public read pronunciations" on public.pronunciations for select using (true);

-- ── 9b. Thêm cột onboarding vào profiles (chạy lại an toàn) ───────────────
alter table public.profiles add column if not exists onboarded     boolean not null default false;
alter table public.profiles add column if not exists user_level    text             default 'beginner';
alter table public.profiles add column if not exists goal          text             default 'daily';
alter table public.profiles add column if not exists daily_minutes integer          default 10;

-- ── 10. Bảng lưu push subscription để gửi thông báo nhắc học ───────────────
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth_key    text not null,
  remind_hour smallint,                          -- giờ UTC (0–23) muốn được nhắc học; null = giờ mặc định
  created_at  timestamptz not null default now(),
  unique (user_id, endpoint)
);
-- Bổ sung cột cho DB cũ đã tạo bảng trước khi có remind_hour (chạy lại an toàn).
alter table public.push_subscriptions add column if not exists remind_hour smallint;
alter table public.push_subscriptions enable row level security;
drop policy if exists "own push sub" on public.push_subscriptions;
create policy "own push sub" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 9. Tự tạo profiles khi có người đăng ký mới ──────────────────────
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

-- ── 11. consume_usage: đếm lượt ATOMIC (chống race condition) ───────────────
-- Trước đây server đọc số lượt rồi mới +1 (2 query tách rời) → 2 request song song
-- cùng đọc giá trị cũ rồi cùng ghi, khiến người dùng vượt giới hạn gói Free.
-- Hàm này gói "kiểm tra + tăng" vào MỘT giao dịch, dùng SELECT ... FOR UPDATE để
-- khoá dòng → tuần tự hoá 2 request, không thể vượt giới hạn.
--   Trả về TRUE  nếu còn lượt (đã tăng 1)
--   Trả về FALSE nếu hết lượt (không tăng)
-- Gọi từ server bằng service role: supabase.rpc('consume_usage', {...}) — xem api/_lib/usage.ts
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
  -- Chỉ chấp nhận đúng 4 cột đếm hợp lệ (an toàn dù %I đã quote định danh)
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count') then
    raise exception 'cot dem khong hop le: %', p_col;
  end if;

  -- Đảm bảo có dòng cho (user, ngày)
  insert into public.daily_usage (user_id, day)
  values (p_user_id, p_day)
  on conflict (user_id, day) do nothing;

  -- Khoá dòng + đọc giá trị hiện tại của cột tương ứng (atomic nhờ FOR UPDATE)
  execute format(
    'select %I from public.daily_usage where user_id = $1 and day = $2 for update',
    p_col
  ) into v_current using p_user_id, p_day;

  if coalesce(v_current, 0) >= p_limit then
    return false;  -- hết lượt
  end if;

  -- Tăng 1 (atomic trong cùng giao dịch đang giữ khoá dòng)
  execute format(
    'update public.daily_usage set %I = %I + 1 where user_id = $1 and day = $2',
    p_col, p_col
  ) using p_user_id, p_day;

  return true;
end;
$$;

-- ── 12. refund_usage: hoàn lại 1 lượt khi provider lỗi ──────────────────────
-- Cặp với consume_usage: ta TRỪ lượt TRƯỚC khi gọi AI/STT (để chống race condition),
-- nên khi nhà cung cấp lỗi/timeout (người dùng không nhận được kết quả) phải HOÀN lại
-- để không tính oan. Giảm 1 nhưng không xuống dưới 0 (greatest). Xem api/_lib/usage.ts.
create or replace function public.refund_usage(
  p_user_id uuid,
  p_day     text,
  p_col     text
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count') then
    raise exception 'cot dem khong hop le: %', p_col;
  end if;

  execute format(
    'update public.daily_usage set %I = greatest(%I - 1, 0) where user_id = $1 and day = $2',
    p_col, p_col
  ) using p_user_id, p_day;
end;
$$;

-- ── 13. challenge_entries: thử thách "Challenge 1 phút / 30 ngày" (migration 0010) ─────
-- Chỉ lưu TEXT (transcript + phản hồi AI + vị trí trong thử thách) — video KHÔNG
-- upload, chỉ nằm trên máy người dùng (IndexedDB). Mỗi ngày 1 dòng (unique user_id+day),
-- nộp lại trong ngày = upsert ghi đè. Xem docs/research/thu-thach-vlog-30-ngay.md mục 4.2.
create table if not exists public.challenge_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  day             date not null,                 -- ngày nộp challenge (múi giờ VN, 'YYYY-MM-DD')
  challenge_round int not null default 1,        -- vòng thử thách thứ mấy (sau ngày 30 mời vòng mới)
  challenge_day   int not null,                  -- ngày thứ mấy trong thử thách (1..30)
  topic_day       int not null,                  -- chủ đề gợi ý của ngày (index trong src/data/challengeTopics.ts)
  transcript      text not null,                 -- transcript từ Whisper (/api/stt)
  feedback        jsonb,                         -- phản hồi AI có cấu trúc (null = chưa/lỗi feedback)
  duration_sec    int not null default 0,        -- thời lượng nói (giây, client tự tính)
  word_count      int not null default 0,        -- số từ trong transcript (tính nhịp nói từ/phút)
  created_at      timestamptz default now(),
  unique (user_id, day)                          -- mỗi ngày 1 challenge; nộp lại = ghi đè (upsert)
);
alter table public.challenge_entries enable row level security;
drop policy if exists "own challenge" on public.challenge_entries;
create policy "own challenge" on public.challenge_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 14. _schema_migrations: bảng theo dõi migration đã áp dụng, cho phép deploy.sh
-- TỰ ĐỘNG chạy các file supabase/migrations/NNNN_*.sql còn thiếu mỗi lần deploy, không
-- cần dán tay vào SQL Editor nữa (xem scripts/run-migrations.ts, kết nối THẲNG Postgres
-- bằng SUPABASE_DB_URL — không qua RPC/PostgREST, không hàm/quyền đặc biệt nào ở đây).
-- Script cũng tự tạo bảng này ở lần chạy đầu nếu chưa có — dòng dưới chỉ để DB mới tạo
-- từ schema.sql có sẵn luôn, không bắt buộc.
create table if not exists public._schema_migrations (
  filename   text primary key,
  applied_at timestamptz not null default now()
);
