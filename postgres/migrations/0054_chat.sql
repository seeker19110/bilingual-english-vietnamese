-- Migration 0054: Real-time User-to-User Chat (DM 1-1, chỉ giữa bạn bè — xem migration 0053).
-- Giai đoạn 1: chỉ DM, schema chừa chỗ group (is_group) nhưng KHÔNG dùng ở giai đoạn này.

create schema if not exists chat;

-- Phòng hội thoại. DM: is_group = false, tên tự suy ra từ thành viên (không lưu name).
create table if not exists chat.rooms (
  id         uuid primary key default gen_random_uuid(),
  is_group   boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists chat.room_members (
  room_id      uuid not null references chat.rooms(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  joined_at    timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create index if not exists room_members_user_idx on chat.room_members(user_id);

-- Tin nhắn — content_clean/moderation_flags/is_blocked ghi bởi packages/core-chat/moderator.ts.
create table if not exists chat.messages (
  id               uuid primary key default gen_random_uuid(),
  room_id          uuid not null references chat.rooms(id) on delete cascade,
  sender_id        uuid references public.users(id) on delete set null,
  content          text not null check (char_length(content) between 1 and 4000),
  content_clean    text,
  moderation_flags jsonb,
  is_blocked       boolean not null default false,
  created_at       timestamptz not null default now(),
  deleted_at       timestamptz
);
create index if not exists messages_room_created_idx
  on chat.messages(room_id, created_at desc) where deleted_at is null;

-- Ghi nhận vi phạm nội dung — dùng để cảnh báo/khoá chat khi vi phạm nhiều lần
-- (xem packages/core-chat/moderator.ts).
create table if not exists chat.moderation_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  message_id uuid references chat.messages(id) on delete set null,
  severity   text not null,      -- 'low' | 'medium' | 'high'
  matched    text[] not null,
  action     text not null,      -- 'filtered' | 'blocked'
  created_at timestamptz not null default now()
);
create index if not exists moderation_events_user_idx
  on chat.moderation_events(user_id, created_at desc);

-- View public.* để đồng bộ quy ước "view public cho bảng ở schema riêng" của dự án (xem
-- english.chat_sessions ở schema.sql) — cho phép các script/tool đọc qua public không cần biết
-- tên schema.
create or replace view public.chat_rooms as select * from chat.rooms;
create or replace view public.chat_room_members as select * from chat.room_members;
create or replace view public.chat_messages as select * from chat.messages;
create or replace view public.chat_moderation_events as select * from chat.moderation_events;
