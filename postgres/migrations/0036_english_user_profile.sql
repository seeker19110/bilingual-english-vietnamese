-- 0036_english_user_profile.sql — Bảng `english.user_profile`: tách dữ liệu ONBOARDING/HỌC
-- TIẾNG ANH ra khỏi `public.profiles` (Bước 4 kế hoạch quản lý user đa lĩnh vực —
-- docs/adr/0002-quan-ly-nguoi-dung.md, Lớp 3).
--
-- LÝ DO: `public.profiles` hiện gộp CẢ hồ sơ lõi (tên, gói cước, trạng thái tài khoản — dùng
-- chung mọi môn) LẪN dữ liệu CHỈ ĐÚNG VỚI VIỆC HỌC TIẾNG ANH (`user_level` kiểu trình độ CEFR
-- thô, `goal`, `daily_minutes`, `age_group` — xem api/profile.ts action 'onboarding'). Môn học
-- tiếp theo (Toán…) sẽ có onboarding hoàn toàn khác (không có "trình độ CEFR"), nhét chung vào
-- `profiles` sẽ thành bãi cột NULL cho mọi user không học tiếng Anh.
--
-- PHẠM VI BƯỚC NÀY: giống Bước 2 (entitlements) — CHỈ thêm bảng + backfill, KHÔNG đổi code đọc/
-- ghi nào. `api/profile.ts` (onboarding, đổi nhóm tuổi…) VẪN đọc/ghi 4 cột cũ trên
-- `public.profiles` y như trước — đây là bảng NGỦ, chưa ai dùng. Chuyển hẳn `api/profile.ts`
-- sang đọc/ghi bảng này (rồi mới xoá 4 cột cũ) là một bước RIÊNG, có kiểm thử kỹ vì đụng màn
-- onboarding của mọi người dùng đang hoạt động.
--
-- Idempotent. Rollback: drop table if exists english.user_profile;
-- (dữ liệu gốc vẫn còn nguyên ở 4 cột cũ trên public.profiles).

create table if not exists english.user_profile (
  user_id       uuid primary key references public.users(id) on delete cascade,
  user_level    text default 'beginner',
  goal          text default 'daily',
  daily_minutes integer default 10,
  age_group     text
);

-- ── Backfill từ public.profiles (nguồn sự thật hiện tại) ─────────────────────────────────
insert into english.user_profile (user_id, user_level, goal, daily_minutes, age_group)
select id, user_level, goal, daily_minutes, age_group
from public.profiles
on conflict (user_id) do nothing;
