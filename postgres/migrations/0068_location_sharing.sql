-- Migration 0068: Chia sẻ vị trí thời gian thực khi đi chơi chung ("Đi chung — Live Location").
--
-- Nguyên tắc RIÊNG TƯ (xem docs/research/dac-ta-chia-se-vi-tri-2026-08-26.md):
--  1. Chia sẻ luôn có GIỚI HẠN THỜI GIAN (expires_at) — không có chế độ chia sẻ vĩnh viễn.
--  2. Chỉ lưu VỊ TRÍ MỚI NHẤT của mỗi người trong mỗi chuyến (1 dòng/thành viên), KHÔNG lưu
--     lịch sử hành trình → tắt chia sẻ là dữ liệu biến mất, không dựng lại được đường đi.
--  3. Tắt chia sẻ (sharing_enabled=false) XOÁ NGAY dòng vị trí, không chỉ ẩn đi.
--  4. Mọi lần bật/tắt/tham gia/rời đều ghi nhật ký đồng thuận (location.consent_log) để người
--     dùng tự kiểm tra được ai đã thấy mình khi nào.

create schema if not exists location;

-- Một "chuyến đi chung". Vào chuyến bằng mã mời (như friend_code) — người có mã mới thấy nhau.
create table if not exists location.sessions (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  invite_code text not null unique,
  -- Điểm hẹn (tuỳ chọn) — để mọi người dẫn đường về cùng một chỗ khi bị lạc.
  meet_lat    double precision check (meet_lat between -90 and 90),
  meet_lng    double precision check (meet_lng between -180 and 180),
  meet_label  text check (meet_label is null or char_length(meet_label) <= 120),
  -- Ngưỡng cảnh báo "đi lạc" tính bằng mét (khoảng cách tới điểm hẹn hoặc tới nhóm).
  alert_radius_m integer not null default 300 check (alert_radius_m between 50 and 5000),
  expires_at  timestamptz not null,
  ended_at    timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists location_sessions_owner_idx on location.sessions(owner_id);
create index if not exists location_sessions_expires_idx on location.sessions(expires_at);

create table if not exists location.session_members (
  session_id      uuid not null references location.sessions(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  -- Công tắc CHỦ ĐỘNG: false = vẫn ở trong chuyến, xem được người khác, nhưng KHÔNG phát vị trí.
  sharing_enabled boolean not null default false,
  -- 'exact' = toạ độ thật; 'approx' = làm tròn ~500m (chế độ kín đáo).
  precision_mode  text not null default 'exact' check (precision_mode in ('exact', 'approx')),
  joined_at       timestamptz not null default now(),
  left_at         timestamptz,
  primary key (session_id, user_id)
);
create index if not exists location_session_members_user_idx on location.session_members(user_id);

-- CHỈ vị trí mới nhất — mỗi thành viên đúng 1 dòng, ghi đè bằng upsert (không lưu lịch sử).
create table if not exists location.positions (
  session_id  uuid not null references location.sessions(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  lat         double precision not null check (lat between -90 and 90),
  lng         double precision not null check (lng between -180 and 180),
  accuracy_m  double precision check (accuracy_m >= 0),
  heading_deg double precision check (heading_deg between 0 and 360),
  speed_mps   double precision check (speed_mps >= 0),
  battery_pct integer check (battery_pct between 0 and 100),
  updated_at  timestamptz not null default now(),
  primary key (session_id, user_id)
);

-- Nhật ký đồng thuận — chỉ ghi HÀNH ĐỘNG (join/leave/enable/disable), KHÔNG ghi toạ độ.
create table if not exists location.consent_log (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references location.sessions(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  action     text not null check (action in ('join', 'leave', 'enable', 'disable', 'end')),
  created_at timestamptz not null default now()
);
create index if not exists location_consent_log_user_idx
  on location.consent_log(user_id, created_at desc);

-- View public.* theo quy ước dự án (giống public.chat_rooms ở migration 0054).
create or replace view public.location_sessions as select * from location.sessions;
create or replace view public.location_session_members as select * from location.session_members;
create or replace view public.location_positions as select * from location.positions;
create or replace view public.location_consent_log as select * from location.consent_log;
