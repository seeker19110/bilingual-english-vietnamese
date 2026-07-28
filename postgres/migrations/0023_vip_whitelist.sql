-- 0023_vip_whitelist.sql — Danh sách email được cấp VIP vĩnh viễn thủ công (người quen biết,
-- có công lớn với dự án...), quản lý qua trang /admin (api/admin-vip-whitelist.ts). Khác với
-- api/admin-grant-plan.ts (cấp 1 lần, có thể có hạn) — whitelist là danh sách SỐNG: có mặt
-- trong bảng này thì user (hiện tại hoặc đăng ký sau này) tự động là VIP vĩnh viễn; admin xoá
-- khỏi bảng thì hạ về free (xem api/admin-vip-whitelist.ts).
--
-- Rollback: drop table if exists public.vip_whitelist;
create table if not exists public.vip_whitelist (
  email      text primary key,
  note       text,           -- lý do cấp (vd "bạn thân", "đóng góp code"...), tuỳ chọn
  created_at timestamptz not null default now()
);
