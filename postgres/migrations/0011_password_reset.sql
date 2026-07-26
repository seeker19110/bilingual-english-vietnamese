-- 0011_password_reset.sql — Quên mật khẩu: gửi link reset qua email, người dùng tự điền mật
-- khẩu mới. Cùng khuôn với email_verifications (migration 0009): chỉ lưu HASH của token, không
-- lưu token gốc — lộ DB không đồng nghĩa với lộ token dùng được ngay.
--
-- KHÁC email_verifications ở chỗ token này là ĐƯỜNG CHIẾM QUYỀN TÀI KHOẢN (ai có token coi như
-- có mật khẩu mới), nên PHẢI dùng token ngẫu nhiên dài (32 byte, xem api/_lib/passwordReset.ts),
-- KHÔNG dùng mã 6 chữ số ngắn như xác thực email — 6 chữ số dò được trong thời gian hợp lý nếu
-- không giới hạn số lần thử; token dài không dò được.
--
-- Cho phép NHIỀU yêu cầu reset cùng lúc còn hiệu lực (không unique theo user_id) — người dùng có
-- thể bấm "quên mật khẩu" nhiều lần (email cũ vào spam, thử lại...), token cũ vẫn dùng được tới
-- khi hết hạn hoặc đã dùng, không cần logic huỷ token cũ phức tạp.
--
-- Rollback: drop table if exists public.password_resets;

create table if not exists public.password_resets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_resets_user_idx on public.password_resets(user_id);
-- Dọn token hết hạn định kỳ (không bắt buộc cho tính đúng đắn — token hết hạn luôn bị từ chối
-- ở code dù chưa xoá khỏi bảng).
create index if not exists password_resets_expires_idx on public.password_resets(expires_at);
