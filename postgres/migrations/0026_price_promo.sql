-- 0026_price_promo.sql — Khuyến mãi % ÁP DỤNG CHO TOÀN BỘ gói/chu kỳ cùng lúc (khác
-- plan_prices.sale_price_vnd — giá tuyệt đối riêng từng dòng, không có ngày bắt đầu, chưa có
-- admin API nào dùng tới). Quản lý qua /admin (api/admin-price-promo.ts): admin nhập % (0-100)
-- + ngày bắt đầu + ngày kết thúc, áp dụng ngay không cần deploy.
--
-- 1 dòng duy nhất (id=1) — giống app_settings. percent=0 hoặc now() ngoài
-- [starts_at, ends_at] = không có khuyến mãi đang chạy, giá niêm yết áp nguyên.
--
-- Rollback: drop table if exists public.price_promo;
create table if not exists public.price_promo (
  id         smallint primary key default 1 check (id = 1),
  percent    integer not null default 0 check (percent >= 0 and percent <= 100),
  starts_at  timestamptz,
  ends_at    timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.price_promo (id, percent, starts_at, ends_at)
values (1, 0, null, null)
on conflict (id) do nothing;
