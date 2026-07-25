-- 0005_ai_circuit_breaker.sql — Cầu dao ngắt khẩn cấp cho lượt gọi AI (GĐ3 kế hoạch scale
-- 50k concurrent, xem docs/research/ke-hoach-scale-30k-concurrent.md mục "Cắt tải AI").
--
-- Đây là công tắc THỦ CÔNG (admin bật/tắt qua /api/admin-settings) — chưa phải tự động theo
-- ngưỡng chi phí/ngày thật (cần đo chi phí thật qua Sentry/metrics ở GĐ4 trước, hiện chưa có).
-- Khi bật, MỌI lượt gọi AI tính phí (chat/writing/speaking/stt/pronounce) bị chặn ngay lập
-- tức bất kể còn hạn mức hay không — dùng khi phát hiện chi phí bất thường (vd bug vòng lặp
-- gọi AI, tấn công spam) cần dừng khẩn cấp trong lúc điều tra, không phải xoá code/redeploy.
alter table public.app_settings
  add column if not exists ai_circuit_breaker boolean not null default false;
