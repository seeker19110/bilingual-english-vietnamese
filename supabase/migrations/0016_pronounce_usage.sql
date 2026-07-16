-- 0016_pronounce_usage.sql
-- Đếm lượt chấm phát âm chi tiết qua Azure (① Giai đoạn 2, xem
-- docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md và api/pronounce-assess.ts).
--
-- Thêm cột pronounce_count vào daily_usage + mở rộng danh sách cột hợp lệ của
-- consume_usage/refund_usage (0001/0004) để chấp nhận 'pronounce_count'. An toàn khi chạy
-- lại (create or replace + add column if not exists).

alter table public.daily_usage add column if not exists pronounce_count integer not null default 0;

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
