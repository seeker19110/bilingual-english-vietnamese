-- 0007_referral.sql — Hệ thống mời bạn (referral): mỗi user có 1 mã mời cố định, người được
-- mời đăng ký qua link ?ref=MÃ; khi người được mời HOÀN THÀNH 1 phiên học thật (không phải chỉ
-- đăng ký) thì CẢ HAI được cộng ngày gói Pro. Xem api/referral.ts + api/_lib/planGrant.ts.
--
-- Vì sao thưởng chỉ sau phiên học thật: thưởng = tiền API thật, nếu thưởng ngay lúc đăng ký thì
-- tạo hàng loạt tài khoản ảo là ăn được ngay.
--
-- Rollback:
--   drop table if exists public.referrals;
--   alter table public.profiles drop column if exists referral_code;

-- Mã mời sinh LƯỜI (lúc user mở trang mời bạn lần đầu) để migration không phải chọn thuật toán
-- sinh mã duy nhất cho toàn bộ user cũ — xem ensureReferralCode() trong api/referral.ts.
alter table public.profiles add column if not exists referral_code text;

create unique index if not exists profiles_referral_code_idx
  on public.profiles(referral_code)
  where referral_code is not null;

create table if not exists public.referrals (
  id          bigserial primary key,
  referrer_id uuid not null references public.users(id) on delete cascade,
  -- unique: 1 người CHỈ được ghi nhận là "người được mời" đúng 1 lần, bởi đúng 1 người.
  referee_id  uuid not null unique references public.users(id) on delete cascade,
  -- null = đã ghi nhận lời mời nhưng CHƯA đủ điều kiện thưởng (chưa học phiên nào).
  rewarded_at timestamptz,
  created_at  timestamptz not null default now(),
  -- Chặn tự mời chính mình ở tầng DB, không chỉ dựa vào kiểm tra ở code.
  constraint referrals_no_self_invite check (referrer_id <> referee_id)
);

create index if not exists referrals_referrer_idx on public.referrals(referrer_id);
