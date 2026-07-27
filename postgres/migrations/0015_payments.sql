-- 0015_payments.sql — Đơn thanh toán Pro/VIP qua SePay (theo dõi sao kê ngân hàng + webhook).
-- Xem đặc tả đầy đủ: docs/research/dac-ta-thanh-toan-2026-07-25.md.
--
-- SePay KHÔNG phải cổng trung gian — không có mã đơn do cổng cấp, không redirect. Khớp đơn
-- bằng `payment_code` TA TỰ SINH, in vào nội dung chuyển khoản (xem api/_lib/sepay.ts).
create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  plan             text not null check (plan in ('pro', 'vip')),
  cycle            text not null check (cycle in ('10day', 'month', 'year')),
  amount_vnd       integer not null,       -- số tiền THẬT lúc tạo đơn — không đọc lại
                                            -- plan_prices sau này, giá có thể đã đổi.
  provider         text not null default 'sepay',
  payment_code     text not null,          -- mã TA tự sinh, khoá khớp đơn duy nhất.
  provider_txn_id  text,                   -- trường `id` của SePay — khoá chống trùng webhook.
  status           text not null default 'pending'
                     check (status in ('pending', 'paid', 'failed', 'expired')),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null,   -- đơn quá hạn: UI ngừng poll, mã QR coi như bỏ.
                                            -- KHÔNG phải lý do từ chối tiền nếu vẫn về sau đó.
  paid_at          timestamptz
);

create index if not exists payments_user_idx on public.payments(user_id, created_at desc);

-- Mã thanh toán PHẢI duy nhất tuyệt đối: hai đơn trùng mã = không biết tiền trả cho đơn nào.
create unique index if not exists payments_code_idx on public.payments(payment_code);

-- Chống trùng webhook ở TẦNG DB — SePay có thể retry tới 7 lần trong 5 giờ cho cùng 1 giao dịch.
create unique index if not exists payments_provider_txn_idx on public.payments(provider_txn_id)
  where provider_txn_id is not null;
