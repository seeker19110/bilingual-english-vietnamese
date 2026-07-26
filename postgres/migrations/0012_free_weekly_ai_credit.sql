-- 0012_free_weekly_ai_credit.sql — Kho lượt AI tích luỹ theo tuần cho gói Free.
--
-- Quyết định 2026-07-26: gói Free đổi từ "5 lượt/tính năng/ngày" (5 cột riêng
-- chat/writing/speaking/stt/pronounce trong daily_usage) sang 1 KHO LƯỢT CHUNG
-- cho MỌI tính năng AI, tích luỹ theo tuần:
--   - Mỗi ngày người dùng THỰC SỰ học (học ≥1 từ mới / hoàn thành 1 bài hội
--     thoại/ngữ pháp — không bắt buộc phải dùng lượt AI) → +5 lượt vào kho.
--   - Chỉ cộng 1 lần/ngày (idempotent — gọi lại nhiều lần trong cùng ngày không
--     cộng thêm), xem api/progress.ts.
--   - Tối đa cộng dồn 35 lượt/tuần (7 ngày × 5).
--   - Kho reset về 0 mỗi thứ Hai (giờ Việt Nam) — xem weekStartOf() ở api/_lib/date.ts.
-- Gói Pro/VIP KHÔNG đổi — vẫn dùng consume_usage/refund_usage theo cột riêng
-- trong daily_usage như cũ (xem api/_lib/usage.ts).
create table if not exists public.weekly_ai_credit (
  user_id         uuid primary key references public.users(id) on delete cascade,
  week_start      date not null,    -- Thứ Hai (giờ VN) của tuần đang tính kho này
  credit          integer not null default 0,
  last_bonus_day  date              -- ngày (giờ VN) gần nhất đã được cộng +5 — chống cộng 2 lần/ngày
);

-- Cộng +5 lượt nếu HÔM NAY (p_today) chưa được cộng trong TUẦN HIỆN TẠI (p_week_start).
-- Tự phát hiện sang tuần mới (week_start lưu khác p_week_start) → reset kho về 0 trước khi cộng.
create or replace function public.grant_weekly_ai_bonus(
  p_user_id    uuid,
  p_today      date,
  p_week_start date,
  p_bonus      integer,
  p_cap        integer
) returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_credit integer;
  v_week   date;
  v_last   date;
begin
  insert into public.weekly_ai_credit (user_id, week_start, credit, last_bonus_day)
  values (p_user_id, p_week_start, 0, null)
  on conflict (user_id) do nothing;

  select credit, week_start, last_bonus_day into v_credit, v_week, v_last
  from public.weekly_ai_credit where user_id = p_user_id for update;

  -- Sang tuần mới: kho tính lại từ đầu, coi như chưa được thưởng ngày nào.
  if v_week <> p_week_start then
    v_credit := 0;
    v_last := null;
  end if;

  -- Đã thưởng đúng hôm nay rồi (trong tuần hiện tại) → không cộng thêm, chỉ đồng bộ week_start.
  if v_last = p_today then
    update public.weekly_ai_credit
    set week_start = p_week_start, credit = v_credit, last_bonus_day = v_last
    where user_id = p_user_id;
    return;
  end if;

  update public.weekly_ai_credit
  set week_start = p_week_start,
      credit = least(v_credit + p_bonus, p_cap),
      last_bonus_day = p_today
  where user_id = p_user_id;
end;
$$;

-- Tiêu 1 lượt từ kho tuần (ATOMIC, chống race condition 2 request song song) — thay
-- consume_usage cho gói Free. Tự reset kho nếu đã sang tuần mới trước khi kiểm tra.
create or replace function public.consume_weekly_ai_credit(
  p_user_id    uuid,
  p_week_start date
) returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_credit integer;
  v_week   date;
begin
  insert into public.weekly_ai_credit (user_id, week_start, credit, last_bonus_day)
  values (p_user_id, p_week_start, 0, null)
  on conflict (user_id) do nothing;

  select credit, week_start into v_credit, v_week
  from public.weekly_ai_credit where user_id = p_user_id for update;

  if v_week <> p_week_start then
    v_credit := 0;
  end if;

  if v_credit <= 0 then
    update public.weekly_ai_credit
    set week_start = p_week_start, credit = v_credit
    where user_id = p_user_id;
    return false;
  end if;

  update public.weekly_ai_credit
  set week_start = p_week_start, credit = v_credit - 1
  where user_id = p_user_id;
  return true;
end;
$$;

-- Hoàn lại 1 lượt khi provider AI lỗi (người dùng không nhận được kết quả). Chỉ hoàn
-- trong ĐÚNG tuần đã tiêu (p_week_start) — nếu đã sang tuần mới thì bỏ qua (tránh cộng
-- nhầm vào kho của tuần mới, vốn đã reset về 0).
create or replace function public.refund_weekly_ai_credit(
  p_user_id    uuid,
  p_week_start date,
  p_cap        integer
) returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.weekly_ai_credit
  set credit = least(credit + 1, p_cap)
  where user_id = p_user_id and week_start = p_week_start;
end;
$$;
