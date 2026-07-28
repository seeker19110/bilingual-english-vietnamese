-- 0022_microsoft_login.sql — Đăng nhập qua Microsoft (thêm vào Google/Facebook/Apple đã có).
--
-- Cùng khuôn mẫu google_id/facebook_id/apple_id — text, unique, null nếu không dùng kênh này.
-- Xem findOrCreateOAuthUser() generic ở api/_lib/authService.ts.
--
-- Rollback: alter table public.users drop column if exists microsoft_id;
alter table public.users add column if not exists microsoft_id text unique;
