-- 0016_daily_total_limit.sql — Hạn mức Pro/VIP đổi từ "5 cột riêng theo chế độ
-- (chat/writing/speaking/stt/pronounce)" sang MỘT con số TỔNG lượt/ngày mỗi gói.
--
-- Quyết định 2026-07-27: trước đó admin đặt "Pro 30, VIP 300" tưởng là mỗi chế độ (thực nhận
-- 30×5=150/ngày Pro), gây hiểu nhầm và khó kiểm soát chi phí. Đổi hẳn sang mô hình TỔNG — cùng
-- triết lý đã áp cho gói Free từ migration 0012 (kho lượt tuần chung mọi chế độ). Giờ cả 3 gói
-- đều dùng đúng 1 con số cho MỌI tính năng AI cộng lại — nhất quán, dễ đọc, dễ khống chế chi phí.
--
-- 10 cột pro_*_limit/vip_*_limit (0001_app_settings.sql) không còn ai đọc sau migration này —
-- xoá hẳn. 5 cột free_*_limit ĐÃ LÀ CỘT CHẾT từ trước (Free enforce qua weekly_ai_credit,
-- migration 0012), xoá luôn cho gọn — không mất chức năng nào (bảng admin không còn hiện gói
-- Free vì không có gì để hiện).
--
-- Rollback: xem cuối file (đưa lại đúng 15 cột cũ với giá trị mặc định, xoá 2 cột mới +
-- function consume_usage_total).
alter table public.app_settings
  drop column if exists free_chat_limit,
  drop column if exists free_writing_limit,
  drop column if exists free_speaking_limit,
  drop column if exists free_stt_limit,
  drop column if exists free_pronounce_limit,
  drop column if exists pro_chat_limit,
  drop column if exists pro_writing_limit,
  drop column if exists pro_speaking_limit,
  drop column if exists pro_stt_limit,
  drop column if exists pro_pronounce_limit,
  drop column if exists vip_chat_limit,
  drop column if exists vip_writing_limit,
  drop column if exists vip_speaking_limit,
  drop column if exists vip_stt_limit,
  drop column if exists vip_pronounce_limit;

-- Giá trị mặc định khớp quyết định 2026-07-27: Pro 30 lượt/ngày TỔNG, VIP 300 lượt/ngày TỔNG.
alter table public.app_settings add column if not exists pro_daily_limit int not null default 30;
alter table public.app_settings add column if not exists vip_daily_limit int not null default 300;

-- ── consume_usage_total: đếm lượt ATOMIC theo TỔNG cả 5 cột trong ngày ──────────────
-- Khác consume_usage (tính riêng p_col): hàm này SUM cả 5 cột daily_usage của ngày đó để so
-- với p_total_limit, nhưng vẫn TĂNG đúng cột p_col (giữ nguyên breakdown theo chế độ cho
-- thống kê/debug — chỉ đổi NGƯỠNG chặn, không đổi cách lưu).
create or replace function public.consume_usage_total(
  p_user_id     uuid,
  p_day         text,
  p_col         text,
  p_total_limit integer
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

  insert into public.daily_usage (user_id, day)
  values (p_user_id, p_day)
  on conflict (user_id, day) do nothing;

  select chat_count + writing_count + speaking_count + stt_count + pronounce_count
  into v_total
  from public.daily_usage
  where user_id = p_user_id and day = p_day
  for update;

  if coalesce(v_total, 0) >= p_total_limit then
    return false;
  end if;

  execute format(
    'update public.daily_usage set %I = %I + 1 where user_id = $1 and day = $2',
    p_col, p_col
  ) using p_user_id, p_day;

  return true;
end;
$$;

-- Rollback (chạy tay nếu cần lùi lại migration này):
--   drop function if exists public.consume_usage_total(uuid, text, text, integer);
--   alter table public.app_settings drop column if exists pro_daily_limit;
--   alter table public.app_settings drop column if exists vip_daily_limit;
--   alter table public.app_settings
--     add column free_chat_limit      int not null default 5,
--     add column free_writing_limit   int not null default 5,
--     add column free_speaking_limit  int not null default 5,
--     add column free_stt_limit       int not null default 5,
--     add column free_pronounce_limit int not null default 5,
--     add column pro_chat_limit       int not null default 100,
--     add column pro_writing_limit    int not null default 100,
--     add column pro_speaking_limit   int not null default 100,
--     add column pro_stt_limit        int not null default 100,
--     add column pro_pronounce_limit  int not null default 100,
--     add column vip_chat_limit       int not null default 1000000,
--     add column vip_writing_limit    int not null default 1000000,
--     add column vip_speaking_limit   int not null default 1000000,
--     add column vip_stt_limit        int not null default 1000000,
--     add column vip_pronounce_limit  int not null default 1000000;
