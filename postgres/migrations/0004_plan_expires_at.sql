-- 0004_plan_expires_at.sql — Hạn dùng cho gói Pro/VIP (chuẩn bị hạ tầng thanh toán, xem
-- PROGRESS.md mục "Thanh toán Pro"). NULL = không giới hạn thời gian (user free mặc định,
-- hoặc admin cấp VIP vĩnh viễn tay). Có giá trị = tự động coi như 'free' sau mốc này —
-- xem api/_lib/plan.ts (resolvePlan), áp dụng ngay tại nơi đọc plan, KHÔNG chờ job dọn
-- dữ liệu (api/_lib/planExpiry.ts) chạy.
--
-- Rollback: alter table public.profiles drop column if exists plan_expires_at;
alter table public.profiles add column if not exists plan_expires_at timestamptz;
