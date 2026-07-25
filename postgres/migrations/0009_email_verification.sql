-- 0009_email_verification.sql — Mã xác thực email (chống đăng ký bằng email giả để cày thưởng
-- mời bạn). Cột `users.email_verified` ĐÃ CÓ SẴN trong schema gốc (đăng nhập Google tự set),
-- migration này chỉ thêm bảng lưu mã đang chờ xác thực.
--
-- Thiết kế: PRIMARY KEY trên user_id → mỗi user chỉ có TỐI ĐA 1 mã còn hiệu lực. Gửi lại mã
-- mới sẽ ghi đè mã cũ (upsert), nên không tồn đọng hàng loạt mã cũ còn dùng được.
--
-- Chỉ lưu HASH của mã, không lưu mã gốc — cùng nguyên tắc với session token
-- (xem api/_lib/authService.ts): lộ DB không đồng nghĩa với lộ mã dùng được ngay.
--
-- Rollback: drop table if exists public.email_verifications;

create table if not exists public.email_verifications (
  user_id      uuid primary key references public.users(id) on delete cascade,
  code_hash    text        not null,
  expires_at   timestamptz not null,
  -- Số lần nhập sai — quá ngưỡng thì mã bị vô hiệu, phải gửi lại (chống dò 6 chữ số).
  attempts     integer     not null default 0,
  -- Mốc gửi gần nhất, dùng để chặn bấm "gửi lại" liên tục (tốn tiền mail + spam người dùng).
  last_sent_at timestamptz not null default now()
);

-- Dọn mã hết hạn định kỳ (không bắt buộc cho tính đúng đắn — mã hết hạn luôn bị từ chối ở code).
create index if not exists email_verifications_expires_idx
  on public.email_verifications(expires_at);
