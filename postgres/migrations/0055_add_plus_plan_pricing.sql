-- 0055_add_plus_plan_pricing.sql — Mở rộng hệ thống 4 gói: Free, Plus, Pro, VIP.
-- Thêm bảng giá và cờ tính năng cho gói Plus (migration additive, tương thích ngược).

-- 1. Cập nhật check constraint của public.plan_prices để hỗ trợ 'plus'
alter table public.plan_prices drop constraint if exists plan_prices_plan_check;
alter table public.plan_prices add constraint plan_prices_plan_check check (plan in ('plus', 'pro', 'vip'));

-- 2. Cập nhật check constraint của public.plan_feature_flags để hỗ trợ 'plus'
alter table public.plan_feature_flags drop constraint if exists plan_feature_flags_plan_check;
alter table public.plan_feature_flags add constraint plan_feature_flags_plan_check check (plan in ('free', 'plus', 'pro', 'vip'));

-- 3. Nạp giá niêm yết cho gói Plus (chu kỳ 10day, month, year)
insert into public.plan_prices (plan, cycle, price_vnd) values
  ('plus', '10day', 15000),
  ('plus', 'month', 29000),
  ('plus', 'year', 249000)
on conflict (plan, cycle) do nothing;

-- 4. Nạp cờ tính năng cho gói Plus (bật mặc định các tính năng học tập cơ bản, trừ dialogue_roleplay)
insert into public.plan_feature_flags (feature_key, plan, enabled)
select c.key, 'plus', (c.key != 'dialogue_roleplay')
from public.feature_catalog c
on conflict (feature_key, plan) do nothing;
