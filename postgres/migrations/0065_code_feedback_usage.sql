-- 0065_code_feedback_usage.sql — Mode đếm lượt MỚI `code_feedback` (PR-L5, môn Lập trình).
-- Đặc tả: docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §6.3 ("AI chỉ cho phản hồi chất
-- lượng … mode đếm lượt mới `code_feedback`, thêm cột usage").
--
-- Vì sao phải sửa CẢ 3 hàm SQL: chúng whitelist tên cột đếm bằng danh sách cứng (chống SQL
-- injection qua p_col) và `consume_usage_total` cộng TAY từng cột để ra tổng ngày. Chỉ thêm
-- cột mà quên hàm thì: (a) mọi lời gọi code_feedback bị raise exception → fail-open cho qua
-- KHÔNG đếm gì (AI miễn phí không giới hạn — đúng thứ CLAUDE.md §7 cấm), (b) lượt
-- code_feedback không vào tổng ngày của Pro/VIP nên hạn mức tổng bị nới ngầm.
--
-- Idempotent (add column if not exists + create or replace). Rollback:
--   alter table public.daily_usage drop column if exists code_feedback_count;
--   rồi chạy lại 0029_platform_subject.sql để trả 3 hàm về bản cũ.

alter table public.daily_usage
  add column if not exists code_feedback_count integer not null default 0;

-- ── 1. consume_usage — đếm theo TỪNG cột (gói Free dùng làm thống kê, hạn mức = vô cực) ──
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
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count',
                   'pronounce_count', 'code_feedback_count') then
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

-- ── 2. refund_usage — hoàn 1 lượt khi nhà cung cấp AI lỗi ────────────────────────────────
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
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count',
                   'pronounce_count', 'code_feedback_count') then
    raise exception 'cot dem khong hop le: %', p_col;
  end if;

  execute format(
    'update public.daily_usage set %I = greatest(%I - 1, 0) where user_id = $1 and day = $2 and subject = $3',
    p_col, p_col
  ) using p_user_id, p_day, p_subject;
end;
$$;

-- ── 3. consume_usage_total — hạn mức TỔNG/ngày của Pro/VIP (mọi mode cộng lại) ───────────
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
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count',
                   'pronounce_count', 'code_feedback_count') then
    raise exception 'cot dem khong hop le: %', p_col;
  end if;

  insert into public.daily_usage (user_id, day, subject)
  values (p_user_id, p_day, p_subject)
  on conflict (user_id, day, subject) do nothing;

  select chat_count + writing_count + speaking_count + stt_count + pronounce_count
       + code_feedback_count
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
