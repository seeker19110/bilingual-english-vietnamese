-- 0027_payments_years.sql — Cho phép mua NHIỀU NĂM liền một lần ở chu kỳ 'year' (giảm giá luỹ
-- tiến theo số năm — xem multiYearDiscountPercent() ở api/_lib/prices.ts). Cột `years` ghi lại
-- SỐ NĂM ĐÃ MUA của đơn — cần lưu để api/payment-webhook.ts biết cấp bao nhiêu ngày (
-- CYCLE_DAYS['year'] * years), vì amount_vnd không đủ để suy ngược ra số năm (giá còn phụ
-- thuộc % khuyến mãi tại thời điểm mua).
--
-- Rollback: alter table public.payments drop column if exists years;
alter table public.payments
  add column if not exists years integer not null default 1 check (years >= 1 and years <= 5);
