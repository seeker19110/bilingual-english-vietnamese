-- 0060_two_factor_auth.sql — Xác thực hai bước (TOTP, RFC 6238).
-- Đặc tả: docs/research/dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md mục 4.
--
-- Vì sao TOTP mà không phải SMS: miễn phí (SMS tốn tiền mỗi tin), không phụ thuộc nhà mạng, và
-- an toàn hơn (SMS bị đánh cắp qua đổi SIM). Hợp chủ trương vốn tối thiểu của dự án.
--
-- QUAN TRỌNG — 2FA là TUỲ CHỌN, không bắt buộc: bắt buộc sẽ chặn phần lớn học sinh 10–18 chưa có
-- điện thoại riêng, vốn là nhóm người dùng trọng tâm. 2FA chỉ gác các thao tác NHẠY CẢM (xem hồ
-- sơ năng lực ẩn, đổi mật khẩu/email, tắt 2FA). Học/chat bình thường KHÔNG cần.
--
-- Idempotent. Rollback:
--   alter table public.sessions drop column if exists stepup_until;
--   drop table if exists public.user_2fa_recovery_codes;
--   drop table if exists public.user_2fa;

-- ── 1. Thiết lập 2FA của từng người dùng ─────────────────────────────────────
create table if not exists public.user_2fa (
  user_id        uuid primary key references public.users(id) on delete cascade,
  -- Secret TOTP — ĐÃ MÃ HOÁ (AES-256-GCM, packages/core-config/userDataCrypto.ts), lưu dạng
  -- `v<n>:<iv>:<cipher>`. Đây là thứ nhạy cảm nhất bảng này: ai đọc được secret thì sinh mã 2FA
  -- hợp lệ vô hạn, tức lớp bảo vệ coi như không tồn tại — nên nó không được phép nằm plaintext
  -- trong DB hay trong bản backup. Cần biến môi trường USER_DATA_MASTER_KEY (xem .env.example).
  secret         text        not null,
  -- null = ĐANG thiết lập, chưa nhập mã xác nhận lần đầu ⇒ 2FA CHƯA có hiệu lực.
  -- Tách 2 bước là bắt buộc: nếu bật ngay lúc sinh secret, người quét QR hỏng sẽ tự khoá mình
  -- ra khỏi tài khoản mà không hề biết.
  enabled_at     timestamptz,
  -- Bước thời gian của lần xác thực THÀNH CÔNG gần nhất — chặn dùng lại đúng mã đó trong 30 giây
  -- còn lại của chu kỳ (kẻ nhìn trộm màn hình/vai).
  last_used_step bigint,
  created_at     timestamptz not null default now()
);

-- ── 2. Mã khôi phục (dùng khi mất thiết bị) ──────────────────────────────────
-- Bắt buộc phải có: không có nó, mất điện thoại = mất tài khoản vĩnh viễn. In ra giấy được —
-- hợp với học sinh không có thiết bị riêng.
create table if not exists public.user_2fa_recovery_codes (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.users(id) on delete cascade,
  -- Băm SHA-256, KHÔNG lưu mã gốc: lộ DB thì cũng không dùng được mã để vào tài khoản.
  -- Vì sao SHA-256 mà không bcrypt: mã khôi phục là 64 bit HOÀN TOÀN ngẫu nhiên, không có gì để
  -- "đoán" nên hàm băm chậm chẳng thêm an toàn — mà lại tốn ~3 giây để phát 10 mã. Băm tất định
  -- còn cho phép tra THẲNG theo code_hash thay vì duyệt so từng mã. Cùng lý do repo đang băm
  -- session token bằng SHA-256.
  code_hash text not null,
  used_at   timestamptz          -- null = chưa dùng. Mỗi mã chỉ dùng ĐƯỢC MỘT LẦN.
);
-- Chỉ index phần chưa dùng — truy vấn lúc đăng nhập luôn lọc `used_at is null`.
-- Tra cứu lúc đăng nhập luôn là (user_id, code_hash) và chỉ quan tâm mã chưa dùng.
create index if not exists user_2fa_recovery_unused_idx
  on public.user_2fa_recovery_codes(user_id, code_hash) where used_at is null;

-- ── 3. Cửa sổ nâng quyền, gắn theo TỪNG SESSION ──────────────────────────────
-- Nhập đúng 2FA một lần thì mở cửa sổ ngắn (15 phút) cho các thao tác nhạy cảm, không bắt nhập
-- lại mỗi lần bấm. Cố ý gắn vào `sessions` chứ KHÔNG vào `user_2fa`: nếu gắn theo người dùng,
-- xác thực trên điện thoại sẽ vô tình mở luôn cửa sổ cho phiên đang mở trên máy khác.
alter table public.sessions add column if not exists stepup_until timestamptz;
