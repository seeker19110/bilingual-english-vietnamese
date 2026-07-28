-- 0020_facebook_apple_login.sql — Đăng nhập qua Facebook + Apple (thêm vào Google đã có).
--
-- Cùng khuôn mẫu `google_id` (text, unique, null nếu tài khoản không dùng kênh đó) — 1 user có
-- thể có cả 3 (đăng nhập lần đầu bằng Google, sau đó liên kết Facebook/Apple qua email trùng,
-- xem findOrCreateFacebookUser/findOrCreateAppleUser ở api/_lib/authService.ts).
--
-- Rollback: alter table public.users drop column if exists facebook_id;
--           alter table public.users drop column if exists apple_id;
alter table public.users add column if not exists facebook_id text unique;
alter table public.users add column if not exists apple_id text unique;
