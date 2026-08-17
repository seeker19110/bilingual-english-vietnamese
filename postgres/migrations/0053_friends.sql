-- Migration 0053: Hệ thống kết bạn (nền tảng cho Real-time User-to-User Chat).
-- Kết bạn qua mã/URL/QR cá nhân — KHÔNG có luồng gửi/chấp nhận lời mời: người chia sẻ link/QR
-- đã là hành động đồng ý chủ động, người quét link xác nhận 1 lần là thành bạn ngay (2 chiều).

-- Mã kết bạn riêng của mỗi user, sinh lười (giống profiles.referral_code ở migration 0007) —
-- KHÁC referral_code: referral dùng để mời người MỚI đăng ký (thưởng ngày Pro), friend_code
-- dùng để 2 user ĐÃ có tài khoản kết bạn với nhau (không thưởng gì).
alter table public.profiles add column if not exists friend_code text unique;

-- Quan hệ bạn bè 2 chiều — LUÔN lưu 1 dòng duy nhất cho 1 cặp, thứ tự (user_id_a, user_id_b)
-- do TẦNG ỨNG DỤNG sắp xếp (so sánh chuỗi JS, xem api/_lib/friends.ts#orderPair) — KHÔNG dùng
-- CHECK ràng buộc thứ tự ở DB vì thứ tự so sánh chuỗi có thể khác nhau giữa collation của
-- Postgres và JS, dễ gây lệch. DB chỉ cần đảm bảo KHÔNG trùng cặp.
create table if not exists public.friendships (
  id         uuid primary key default gen_random_uuid(),
  user_id_a  uuid not null references public.users(id) on delete cascade,
  user_id_b  uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_not_self check (user_id_a <> user_id_b),
  constraint friendships_unique_pair unique (user_id_a, user_id_b)
);
create index if not exists friendships_a_idx on public.friendships(user_id_a);
create index if not exists friendships_b_idx on public.friendships(user_id_b);
