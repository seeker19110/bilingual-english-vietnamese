-- 0032_listening_feature.sql — Thêm khoá tính năng "listening" (trang /listening, thư viện
-- Nghe) vào ma trận feature_catalog/plan_feature_flags (xem 0024_plan_features.sql). Mở BẬT
-- cho cả 3 gói Free/Pro/VIP ngay từ đầu — không khoá nhầm người dùng free.
--
-- Rollback: delete from public.plan_feature_flags where feature_key = 'listening';
--           delete from public.feature_catalog where key = 'listening';
insert into public.feature_catalog (key, label, description, sort_order) values
  ('listening', 'Thư viện Nghe', 'Câu thông dụng, hội thoại, truyện cổ tích & ngụ ngôn — chế độ nghe hiểu', 65)
on conflict (key) do nothing;

insert into public.plan_feature_flags (feature_key, plan, enabled)
select 'listening', p.plan, true
from (values ('free'), ('pro'), ('vip')) as p(plan)
on conflict (feature_key, plan) do nothing;
