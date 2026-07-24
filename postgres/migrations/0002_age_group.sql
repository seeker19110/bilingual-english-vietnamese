-- 0002_age_group.sql — Nhóm tuổi người dùng (kế hoạch "giao diện + nội dung theo độ tuổi",
-- PROGRESS.md 2026-07-22, Giai đoạn 1). Người dùng TỰ CHỌN nhóm, KHÔNG hỏi ngày sinh thật
-- (tránh thu thập dữ liệu nhạy cảm trẻ em). NULL = chưa chọn (user cũ trước khi có tính năng
-- này) — code đọc cột này PHẢI coi NULL như 'nguoi_lon' (mặc định an toàn nhất, không ép
-- giao diện/giọng điệu trẻ em lên người chưa từng chọn).
--
-- Rollback: alter table public.profiles drop column if exists age_group;
alter table public.profiles add column if not exists age_group text;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_age_group_check'
  ) then
    alter table public.profiles
      add constraint profiles_age_group_check
      check (age_group is null or age_group in ('nhi_dong', 'thieu_nien', 'thanh_nien', 'nguoi_lon'));
  end if;
end $$;
