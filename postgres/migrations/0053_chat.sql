-- Migration 0053: Chat schema — user-to-user real-time messaging
-- Applies: 2026-08-18
-- Rollback: Xóa schema chat thủ công nếu cần (xem docs trước khi rollback)

CREATE SCHEMA IF NOT EXISTS chat;

-- ── Rooms (DM hoặc group, scalable) ─────────────────────────────────────────
-- is_group = false → DM (2 thành viên cố định)
-- is_group = true  → Group (nhiều thành viên, tính năng tương lai)
CREATE TABLE chat.rooms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text,                                           -- null = DM
  is_group    boolean NOT NULL DEFAULT false,
  created_by  uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Thành viên phòng ─────────────────────────────────────────────────────────
CREATE TABLE chat.room_members (
  room_id      uuid NOT NULL REFERENCES chat.rooms(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at    timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz NOT NULL DEFAULT now(),
  is_muted     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX idx_room_members_user ON chat.room_members(user_id);

-- ── Messages ─────────────────────────────────────────────────────────────────
CREATE TABLE chat.messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          uuid NOT NULL REFERENCES chat.rooms(id) ON DELETE CASCADE,
  sender_id        uuid REFERENCES public.users(id) ON DELETE SET NULL,
  content          text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  -- content_clean: text sau khi filter bad words (null = không cần filter / bị block)
  content_clean    text,
  -- moderation_flags: { severity: 'low'|'medium'|'high', matches: string[] }
  moderation_flags jsonb,
  -- is_blocked: true = message bị chặn hoàn toàn, không hiện cho người nhận
  is_blocked       boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  edited_at        timestamptz,
  deleted_at       timestamptz    -- soft delete
);

-- Index chính cho việc load history một room (newest first)
CREATE INDEX idx_messages_room_created
  ON chat.messages(room_id, created_at DESC)
  WHERE deleted_at IS NULL AND is_blocked = false;

-- ── Vi phạm nội dung ─────────────────────────────────────────────────────────
-- Lưu vết để tính số lần vi phạm, quyết định cảnh báo / suspend
CREATE TABLE chat.moderation_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_id uuid REFERENCES chat.messages(id) ON DELETE SET NULL,
  severity   text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  matched    text[] NOT NULL,
  action     text NOT NULL CHECK (action IN ('filtered', 'blocked', 'warned', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mod_events_user_recent
  ON chat.moderation_events(user_id, created_at DESC);

-- ── Chat suspension (cấm chat tạm thời) ─────────────────────────────────────
CREATE TABLE chat.suspensions (
  user_id    uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  reason     text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
