-- 0001_app_settings.sql — Bảng cấu hình toàn cục cho admin chỉnh qua /api/admin-settings
-- (thay vì hard-code trong api/_lib/usage.ts + api/_lib/promo.ts). 1 dòng duy nhất (id=1).
--
-- Giá trị mặc định khớp đúng quyết định người dùng chốt 2026-07-21:
--   Free 5 / Pro 100 / VIP không giới hạn (dùng số rất lớn thay Infinity — cột là integer)
--   lượt/tính năng/ngày; khuyến mãi ra mắt (mọi user = VIP) tới hết 31/12/2026 giờ VN.
create table if not exists public.app_settings (
  id                    int primary key default 1,
  free_chat_limit       int not null default 5,
  free_writing_limit    int not null default 5,
  free_speaking_limit   int not null default 5,
  free_stt_limit        int not null default 5,
  free_pronounce_limit  int not null default 5,
  pro_chat_limit        int not null default 100,
  pro_writing_limit     int not null default 100,
  pro_speaking_limit    int not null default 100,
  pro_stt_limit         int not null default 100,
  pro_pronounce_limit   int not null default 100,
  vip_chat_limit        int not null default 1000000,
  vip_writing_limit     int not null default 1000000,
  vip_speaking_limit    int not null default 1000000,
  vip_stt_limit         int not null default 1000000,
  vip_pronounce_limit   int not null default 1000000,
  -- NULL = không có khuyến mãi (áp hạn mức thật ngay). Có giá trị = mọi user được đối xử
  -- như VIP (đủ 14 giọng + không giới hạn lượt) tới thời điểm này.
  promo_until           timestamptz null default '2027-01-01T00:00:00+07:00',
  updated_at            timestamptz not null default now(),
  constraint app_settings_single_row check (id = 1)
);

insert into public.app_settings (id) values (1) on conflict (id) do nothing;
