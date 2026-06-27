-- 0001_consume_usage.sql
-- Thêm hàm đếm lượt ATOMIC để chống race condition (2 request song song vượt giới hạn gói).
-- Chạy file này nếu DB của bạn đã tạo trước khi schema.sql có hàm consume_usage.
-- An toàn khi chạy lại (create or replace).

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
  if p_col not in ('chat_count', 'writing_count', 'speaking_count', 'stt_count') then
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
