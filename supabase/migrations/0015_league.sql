-- 0015_league.sql
-- Giải đấu tuần (② M5, docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md) — PR đầu tiên
-- trong 3 PR: migration + tính điểm tuần + /api/leaderboard (UI trang giải đấu + form chọn
-- nickname là PR sau, sẽ gọi API này).
--
-- 2 cột mới trên `profiles`:
--   nickname       — biệt danh HIỂN THỊ công khai trên bảng xếp hạng (KHÔNG phải tên thật/email).
--   league_opt_in  — mặc định false: KHÔNG tự động vào giải, người dùng phải chủ động bật.
--
-- BẢO MẬT (giống migration 0005): nickname phải qua kiểm tra server (3-20 ký tự, lọc từ bậy
-- cơ bản, không trùng — xem api/_lib/leaderboard.ts + api/leaderboard.ts) nên KHÔNG cho client
-- ghi trực tiếp 2 cột này qua Supabase client như các cột onboarding khác — chỉ server (service
-- role, bỏ qua RLS/quyền cột) mới ghi được, qua action 'set-nickname'/'opt-out' của /api/leaderboard.
--
-- Unique theo nickname KHÔNG PHÂN BIỆT HOA THƯỜNG (lower()), bỏ qua NULL (nhiều người chưa đặt
-- nickname vẫn được — partial index `where nickname is not null`).
--
-- An toàn khi chạy lại (idempotent).

alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists league_opt_in boolean not null default false;

create unique index if not exists profiles_nickname_unique_idx
  on public.profiles (lower(nickname))
  where nickname is not null;

revoke update (nickname, league_opt_in) on public.profiles from authenticated, anon;
