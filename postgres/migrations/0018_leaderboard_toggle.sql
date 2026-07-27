-- 0018_leaderboard_toggle.sql — Cầu dao bật/tắt bảng xếp hạng (Challenge.tsx → LeagueSection),
-- admin chỉnh qua /api/admin-settings, KHÔNG cần deploy.
--
-- Quyết định 2026-07-27: TẮT MẶC ĐỊNH — ở quy mô ít người dùng, bảng gần như trống/chỉ vài
-- người sẽ khiến người mới thấy app "vắng vẻ" và bỏ đi, phản tác dụng với mục tiêu giữ chân.
-- Component + API (LeagueSection.tsx, api/leaderboard.ts) GIỮ NGUYÊN không xoá — chỉ chờ admin
-- bật lại đúng lúc số người dùng hoạt động/tuần đủ đông (đề xuất mốc tham khảo ~200).
alter table public.app_settings
  add column if not exists leaderboard_enabled boolean not null default false;
