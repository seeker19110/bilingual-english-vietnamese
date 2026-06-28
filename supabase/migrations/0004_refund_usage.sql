-- 0004_refund_usage.sql
-- Hoàn lại 1 lượt đã trừ khi nhà cung cấp AI/STT lỗi (người dùng không nhận được kết quả).
-- Cặp với consume_usage (0001): consume TRƯỚC khi gọi provider (chống race), refund khi provider lỗi.
-- Giảm 1 nhưng KHÔNG bao giờ xuống dưới 0 (greatest). An toàn khi chạy lại (create or replace).

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
