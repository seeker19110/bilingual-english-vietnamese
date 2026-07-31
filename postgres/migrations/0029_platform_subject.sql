-- 0029_platform_subject.sql — Thêm chiều `subject` (môn học) vào CẢ HAI cơ chế đếm lượt hiện
-- có, chuẩn bị cho nền tảng đa lĩnh vực (docs/adr/0001-nen-tang-da-linh-vuc.md).
--
-- Quyết định (ADR-0001 mục 8, chốt 2026-07-31): MỌI gói (Free lẫn Pro/VIP) đếm/trừ lượt
-- RIÊNG theo từng môn — hết lượt tiếng Anh trong ngày KHÔNG ảnh hưởng lượt Toán còn lại của
-- chính ngày đó — nhưng dùng CHUNG một con số hạn mức (không phải N hạn mức khác nhau).
--
-- Hai cơ chế đang chạy thật, PHẢI sửa cả hai (khác nhau hoàn toàn, không phải 1 bảng):
--   1. Gói Free  → bảng `free_daily_credit` (0017), cửa sổ trượt 7 ngày.
--   2. Pro/VIP   → bảng `daily_usage` (schema gốc) + `consume_usage_total` (0016).
--
-- Cách làm: thêm cột `subject`, đưa vào KHOÁ CHÍNH (mỗi môn một dòng riêng/ngày/user thay vì
-- gộp chung) — KHÔNG đổi kiểu cột đếm, KHÔNG copy dữ liệu, chỉ backfill dữ liệu cũ về
-- subject='english' (toàn bộ lịch sử trước đây đều là tiếng Anh). Idempotent: chạy lại
-- không sao (drop constraint if exists rồi add lại).
--
-- Rollback: xem cuối file.

-- ── 1. daily_usage (Pro/VIP) ─────────────────────────────────────────────────────────
alter table public.daily_usage add column if not exists subject text not null default 'english';
alter table public.daily_usage drop constraint if exists daily_usage_pkey;
alter table public.daily_usage add primary key (user_id, day, subject);

create or replace function public.consume_usage(
  p_user_id uuid,
  p_day     text,
  p_col     text,
  p_limit   integer,
  p_subject text default 'english'
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

  insert into public.daily_usage (user_id, day, subject)
  values (p_user_id, p_day, p_subject)
  on conflict (user_id, day, subject) do nothing;

  execute format(
    'select %I from public.daily_usage where user_id = $1 and day = $2 and subject = $3 for update',
    p_col
  ) into v_current using p_user_id, p_day, p_subject;

  if coalesce(v_current, 0) >= p_limit then
    return false;
  end if;

  execute format(
    'update public.daily_usage set %I = %I + 1 where user_id = $1 and day = $2 and subject = $3',
    p_col, p_col
  ) using p_user_id, p_day, p_subject;

  return true;
end;
$$;

create or replace function public.refund_usage(
  p_user_id uuid,
  p_day     text,
  p_col     text,
  p_subject text default 'english'
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count', 'pronounce_count') then
    raise exception 'cot dem khong hop le: %', p_col;
  end if;

  execute format(
    'update public.daily_usage set %I = greatest(%I - 1, 0) where user_id = $1 and day = $2 and subject = $3',
    p_col, p_col
  ) using p_user_id, p_day, p_subject;
end;
$$;

create or replace function public.consume_usage_total(
  p_user_id     uuid,
  p_day         text,
  p_col         text,
  p_total_limit integer,
  p_subject     text default 'english'
) returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_total integer;
begin
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count', 'pronounce_count') then
    raise exception 'cot dem khong hop le: %', p_col;
  end if;

  insert into public.daily_usage (user_id, day, subject)
  values (p_user_id, p_day, p_subject)
  on conflict (user_id, day, subject) do nothing;

  select chat_count + writing_count + speaking_count + stt_count + pronounce_count
  into v_total
  from public.daily_usage
  where user_id = p_user_id and day = p_day and subject = p_subject
  for update;

  if coalesce(v_total, 0) >= p_total_limit then
    return false;
  end if;

  execute format(
    'update public.daily_usage set %I = %I + 1 where user_id = $1 and day = $2 and subject = $3',
    p_col, p_col
  ) using p_user_id, p_day, p_subject;

  return true;
end;
$$;

-- ── 2. free_daily_credit (Free — cửa sổ trượt) ──────────────────────────────────────
alter table public.free_daily_credit add column if not exists subject text not null default 'english';
alter table public.free_daily_credit drop constraint if exists free_daily_credit_pkey;
alter table public.free_daily_credit add primary key (user_id, day, subject);

create or replace function public.grant_daily_bonus_rolling(
  p_user_id uuid,
  p_day     date,
  p_bonus   integer,
  p_subject text default 'english'
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.free_daily_credit (user_id, day, subject, bonus_earned)
  values (p_user_id, p_day, p_subject, p_bonus)
  on conflict (user_id, day, subject) do update
    set bonus_earned = greatest(free_daily_credit.bonus_earned, excluded.bonus_earned);
end;
$$;

create or replace function public.consume_rolling_credit(
  p_user_id     uuid,
  p_day         date,
  p_window_days integer,
  p_subject     text default 'english'
) returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_available integer;
begin
  insert into public.free_daily_credit (user_id, day, subject)
  values (p_user_id, p_day, p_subject)
  on conflict (user_id, day, subject) do nothing;

  perform 1 from public.free_daily_credit
  where user_id = p_user_id
    and subject = p_subject
    and day > p_day - p_window_days
    and day <= p_day
  for update;

  select coalesce(sum(bonus_earned), 0) - coalesce(sum(credits_spent), 0)
  into v_available
  from public.free_daily_credit
  where user_id = p_user_id
    and subject = p_subject
    and day > p_day - p_window_days
    and day <= p_day;

  if coalesce(v_available, 0) <= 0 then
    return false;
  end if;

  update public.free_daily_credit
  set credits_spent = credits_spent + 1
  where user_id = p_user_id and day = p_day and subject = p_subject;

  return true;
end;
$$;

create or replace function public.refund_rolling_credit(
  p_user_id uuid,
  p_day     date,
  p_subject text default 'english'
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.free_daily_credit
  set credits_spent = greatest(credits_spent - 1, 0)
  where user_id = p_user_id and day = p_day and subject = p_subject;
end;
$$;

-- ── 3. subject_limits: phanh tay — bật/tắt enforce hạn mức theo môn ─────────────────
-- Mặc định enforced=true cho MỌI môn (kể cả môn mới thêm sau này qua insert riêng) —
-- hạn mức áp dụng như nhau, không có "môn mở miễn phí" ngầm định. Dùng làm phanh tay: admin
-- tắt tạm cho một môn cụ thể qua trang quản trị khi cần (vd giai đoạn ra mắt), không cần deploy.
create table if not exists public.subject_limits (
  subject    text primary key,
  enforced   boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.subject_limits (subject, enforced) values ('english', true)
on conflict (subject) do nothing;

-- Rollback (chạy tay nếu cần lùi lại migration này — mất khả năng phân biệt theo môn,
-- nhưng KHÔNG mất dữ liệu vì subject='english' cho toàn bộ dòng hiện có):
--   drop table if exists public.subject_limits;
--   drop function if exists public.refund_rolling_credit(uuid, date, text);
--   drop function if exists public.consume_rolling_credit(uuid, date, integer, text);
--   drop function if exists public.grant_daily_bonus_rolling(uuid, date, integer, text);
--   alter table public.free_daily_credit drop constraint if exists free_daily_credit_pkey;
--   alter table public.free_daily_credit add primary key (user_id, day);
--   alter table public.free_daily_credit drop column if exists subject;
--   drop function if exists public.consume_usage_total(uuid, text, text, integer, text);
--   drop function if exists public.refund_usage(uuid, text, text, text);
--   drop function if exists public.consume_usage(uuid, text, text, integer, text);
--   alter table public.daily_usage drop constraint if exists daily_usage_pkey;
--   alter table public.daily_usage add primary key (user_id, day);
--   alter table public.daily_usage drop column if exists subject;
--   (Sau đó tạo lại 3 hàm cũ không tham số p_subject như trước migration này.)
