-- 0014_plan_prices.sql — Bảng giá bán gói Pro/VIP, đọc bởi api/_lib/prices.ts.
--
-- Tách riêng khỏi app_settings (khác `admin-settings` hạn mức lượt dùng) vì đây là dữ liệu
-- khác concern: giá bán, không phải cấu hình vận hành AI. Giá KHÔNG hard-code trong code —
-- đổi giá dịp lễ/Tết chỉ là UPDATE dòng tương ứng, không cần deploy (xem
-- docs/research/dac-ta-thanh-toan-2026-07-25.md mục "Khuyến mãi dịp lễ").
--
-- 3 chu kỳ: '10day' (10 ngày, gói dùng thử rẻ), 'month' (30 ngày), 'year' (365 ngày) — xem
-- CYCLE_DAYS ở api/_lib/prices.ts, PHẢI khớp đúng 3 giá trị này.
--
-- sale_price_vnd/sale_until: nullable = không có khuyến mãi giá, áp price_vnd (niêm yết) ngay.
-- Đơn thanh toán (bảng `payments`, migration kế tiếp) LUÔN ghi lại amount_vnd THẬT tại lúc tạo
-- đơn — sửa bảng này KHÔNG ảnh hưởng đơn cũ.
create table if not exists public.plan_prices (
  plan           text not null check (plan in ('pro', 'vip')),
  cycle          text not null check (cycle in ('10day', 'month', 'year')),
  price_vnd      integer not null check (price_vnd > 0),
  sale_price_vnd integer check (sale_price_vnd is null or sale_price_vnd > 0),
  sale_until     timestamptz,
  updated_at     timestamptz not null default now(),
  primary key (plan, cycle)
);

-- Giá chốt 2026-07-27 (quyết định người dùng, thay bảng giá nháp 2026-07-25).
insert into public.plan_prices (plan, cycle, price_vnd) values
  ('pro', '10day', 20000),
  ('pro', 'month', 40000),
  ('pro', 'year', 360000),
  ('vip', '10day', 30000),
  ('vip', 'month', 75000),
  ('vip', 'year', 500000)
on conflict (plan, cycle) do nothing;
