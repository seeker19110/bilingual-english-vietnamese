-- 0017_free_rolling_credit.sql — Kho lượt AI của gói Free đổi từ "tuần LỊCH" (reset cứng về 0
-- mỗi thứ Hai) sang CỬA SỔ TRƯỢT 7 NGÀY LIỀN KỀ thật.
--
-- Quyết định 2026-07-27: mô hình cũ (migration 0012, bảng weekly_ai_credit) có nhược điểm —
-- người học dồn vào cuối tuần (thứ Bảy/Chủ nhật) rồi kho reset đúng lúc đó, mất công tích luỹ.
-- Cửa sổ trượt công bằng hơn: "còn bao nhiêu lượt hôm nay" luôn = tổng +5 đã nhận trong 7 ngày
-- gần nhất (kể cả hôm nay) trừ đi lượt đã dùng trong chính 7 ngày đó — không phụ thuộc thứ
-- trong tuần. Trần tự nhiên vẫn là 35 (7 ngày × 5/ngày), không cần cột "cap" riêng vì không có
-- cơ chế dồn bù ngày bỏ lỡ.
--
-- Bảng `weekly_ai_credit` (0012) KHÔNG bị xoá ở đây (dữ liệu cũ giữ nguyên, code đã ngừng đọc/
-- ghi) — dọn ở migration sau khi đã xác nhận mô hình mới chạy ổn trên production. Rollback
-- migration này: đổi code quay lại gọi grant_weekly_ai_bonus/consume_weekly_ai_credit/
-- refund_weekly_ai_credit như cũ (không cần xoá bảng/hàm mới, chúng vô hại nếu không ai gọi).
create table if not exists public.free_daily_credit (
  user_id       uuid not null references public.users(id) on delete cascade,
  day           date not null,
  bonus_earned  int not null default 0,  -- +5 nếu NGÀY ĐÓ có học thật (idempotent, xem hàm dưới)
  credits_spent int not null default 0,  -- số lượt AI đã tiêu, GHI VÀO ĐÚNG NGÀY tiêu (không
                                          -- phải ngày kiếm được) — đơn giản hoá: không cần biết
                                          -- "tiêu từ lượt của ngày nào", chỉ cần tổng cửa sổ đúng.
  primary key (user_id, day)
);
create index if not exists free_daily_credit_user_day_idx on public.free_daily_credit(user_id, day desc);

-- Cộng +5 cho NGÀY p_day nếu hôm đó có học thật — idempotent (gọi lại nhiều lần trong cùng
-- ngày không cộng thêm, vì luôn ghi ĐÚNG p_bonus chứ không cộng dồn +=).
create or replace function public.grant_daily_bonus_rolling(
  p_user_id uuid,
  p_day     date,
  p_bonus   integer
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.free_daily_credit (user_id, day, bonus_earned)
  values (p_user_id, p_day, p_bonus)
  on conflict (user_id, day) do update
    set bonus_earned = greatest(free_daily_credit.bonus_earned, excluded.bonus_earned);
end;
$$;

-- Tiêu 1 lượt nếu còn "khả dụng" trong cửa sổ [p_day - p_window_days + 1, p_day].
-- KHOÁ CÁC DÒNG trong cửa sổ TRƯỚC bằng SELECT ... FOR UPDATE (không aggregate — Postgres
-- không cho FOR UPDATE cùng SUM), rồi mới tính tổng — chống 2 request song song cùng đọc thấy
-- "còn lượt" rồi cùng trừ, vượt quá số thật.
create or replace function public.consume_rolling_credit(
  p_user_id     uuid,
  p_day         date,
  p_window_days integer
) returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_available integer;
begin
  insert into public.free_daily_credit (user_id, day)
  values (p_user_id, p_day)
  on conflict (user_id, day) do nothing;

  perform 1 from public.free_daily_credit
  where user_id = p_user_id
    and day > p_day - p_window_days
    and day <= p_day
  for update;

  select coalesce(sum(bonus_earned), 0) - coalesce(sum(credits_spent), 0)
  into v_available
  from public.free_daily_credit
  where user_id = p_user_id
    and day > p_day - p_window_days
    and day <= p_day;

  if coalesce(v_available, 0) <= 0 then
    return false;
  end if;

  update public.free_daily_credit
  set credits_spent = credits_spent + 1
  where user_id = p_user_id and day = p_day;

  return true;
end;
$$;

-- Hoàn 1 lượt đã tiêu TRONG NGÀY p_day (provider AI lỗi) — chỉ hoàn trong đúng ngày đã tiêu,
-- giống nguyên tắc refund_weekly_ai_credit cũ (không hoàn nhầm sang cửa sổ khác).
create or replace function public.refund_rolling_credit(
  p_user_id uuid,
  p_day     date
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.free_daily_credit
  set credits_spent = greatest(credits_spent - 1, 0)
  where user_id = p_user_id and day = p_day;
end;
$$;
