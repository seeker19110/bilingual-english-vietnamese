-- 0016_signup_trial.sql — Trial Pro TỰ ĐỘNG cho tài khoản MỚI đăng ký (chiến lược tăng
-- trưởng, quyết định 2026-07-27) — thay cho phương án mở khuyến mãi Pro cho TOÀN BỘ user
-- hiện có (tốn chi phí AI không kiểm soát cho người vốn đã ở lại mà không cần khuyến mãi).
--
-- TÁCH RIÊNG cột khỏi quà xác thực email đã có (`trial_granted_at`, xem
-- 0013_email_verify_trial.sql) — không đụng/gộp logic đó, hai quà CỘNG DỒN được (Pro ngay
-- lúc đăng ký + thêm ngày khi xác thực email sau đó). Xem api/_lib/trial.ts.
--
-- Rollback: alter table public.profiles drop column if exists signup_trial_granted_at;
alter table public.profiles add column if not exists signup_trial_granted_at timestamptz;
