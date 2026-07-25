-- 0008_referral_device.sql — Dấu vân tay thiết bị cho lượt mời, chống 1 người tạo hàng loạt
-- tài khoản trên cùng máy để tự thưởng cho mình. Xem src/lib/deviceId.ts + api/_lib/referral.ts.
--
-- ⚠️ Mã thiết bị là BEST-EFFORT (trình duyệt không có ID phần cứng cố định): xoá dữ liệu duyệt
-- web hoặc dùng ẩn danh là ra mã khác, và 2 máy giống cấu hình có thể trùng mã. Vì vậy cột này
-- CHỈ dùng để TỪ CHỐI THƯỞNG, KHÔNG dùng để chặn đăng ký/khoá tài khoản — máy dùng chung
-- (gia đình, phòng máy trường, quán net) là chuyện rất phổ biến với nhóm người dùng học sinh.
--
-- Rollback: alter table public.referrals drop column if exists device_hash;

alter table public.referrals add column if not exists device_hash text;

-- Tra "thiết bị này đã được thưởng lượt mời nào chưa" — chỉ quan tâm dòng ĐÃ thưởng.
create index if not exists referrals_device_hash_idx
  on public.referrals(device_hash)
  where device_hash is not null and rewarded_at is not null;
