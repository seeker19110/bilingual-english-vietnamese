-- 0005_lockdown_cost_columns.sql
-- KHÓA QUYỀN GHI CỦA CLIENT lên các cột "kiểm soát chi phí" — vá 2 lỗ bypass giới hạn.
--
-- VẤN ĐỀ: RLS là quyền theo DÒNG (row-level), KHÔNG giới hạn theo CỘT. Policy cũ
-- "own profile"/"own usage" cho phép người dùng đã đăng nhập ghi MỌI cột trong dòng
-- của chính họ. Vì server đọc `profiles.plan` (giới hạn gói) và `daily_usage.*_count`
-- (đếm lượt) làm NGUỒN SỰ THẬT để chặn chi phí, người dùng có thể tự ghi đè từ trình
-- duyệt để vượt giới hạn:
--   supabase.from('profiles').update({ plan: 'pro' })            → nhảy lên hạn mức Pro
--   supabase.from('daily_usage').upsert({ chat_count: 0, ... })  → reset đếm lượt về 0
-- ⇒ gọi API vô hạn, tốn tiền không kiểm soát (vô hiệu toàn bộ cơ chế đếm-lượt-server).
--
-- CÁCH VÁ: dùng quyền THEO CỘT (column-level GRANT/REVOKE) của Postgres — thu hồi
-- quyền ghi các cột nhạy cảm khỏi vai trò client (`authenticated`/`anon`). Server dùng
-- `service_role` nên BỎ QUA cả RLS lẫn quyền cột → vẫn ghi bình thường qua RPC.
-- Các cột KHÔNG nhạy cảm (onboarding, learn_count cho streak) vẫn cho client ghi.
--
-- An toàn khi chạy lại (REVOKE/GRANT là idempotent). Chạy 1 lần trong Supabase SQL Editor.

-- ── profiles: cấm client sửa cột `plan` (chỉ server đổi gói) ────────────────────
-- `saveOnboarding` (src/lib/cloud.ts) chỉ update user_level/goal/daily_minutes/onboarded
-- và `ensureProfile` chỉ insert id/name — KHÔNG đụng `plan`, nên thu hồi cột này không
-- ảnh hưởng luồng client hợp lệ.
revoke update (plan) on public.profiles from authenticated, anon;

-- ── daily_usage: client CHỈ được ghi cột learn_count (đếm streak, không tốn API) ──
-- Thu hồi toàn bộ INSERT/UPDATE rồi cấp lại đúng các cột cần cho `pushLearnDay`
-- (upsert user_id/day/learn_count). 4 cột đếm lượt tốn tiền (chat/writing/speaking/stt)
-- từ đây chỉ SERVER ghi được (qua RPC consume_usage/refund_usage — security definer).
-- Quyền SELECT giữ nguyên để `pullUserData` vẫn kéo dữ liệu về máy.
revoke insert, update on public.daily_usage from authenticated, anon;
grant  insert (user_id, day, learn_count) on public.daily_usage to authenticated;
grant  update (learn_count)               on public.daily_usage to authenticated;
