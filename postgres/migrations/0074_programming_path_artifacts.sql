-- Migration 0074: Kho ARTIFACT CÁ NHÂN của LỘ TRÌNH MỤC TIÊU môn Lập trình (đợt 3/4).
--
-- Đặc tả: docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md (đợt 3). Cuối mỗi giai đoạn
-- P1–P4 của lộ trình, người học tự khai một artifact làm bằng chứng (link repo/bài viết/ảnh
-- chụp + mô tả ngắn) — KHÔNG chấm bằng AI (đợt này cố ý, chống phình phạm vi và chi phí).
--
-- Khoá là `id` tự tăng (không phải (user_id, path_id, phase_id)) vì một người có thể nộp
-- NHIỀU artifact cho cùng giai đoạn theo thời gian (sửa/nộp lại) — khác `path_progress`
-- (migration 0073) vốn là TRẠNG THÁI hiện tại nên khoá theo chặng. Ở đây là NHẬT KÝ nộp bài,
-- xoá được (chỉ của chính mình) nhưng không có "cập nhật tại chỗ".
--
-- Idempotent. Rollback:
--   drop table if exists programming.path_artifacts;

create schema if not exists programming;

create table if not exists programming.path_artifacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  path_id    text not null check (path_id ~ '^[a-z-]+$' and char_length(path_id) <= 32),
  phase_id   text not null check (phase_id ~ '^[a-z-]+-p[0-9]+$' and char_length(phase_id) <= 40),
  url        text not null check (char_length(url) <= 500),
  note       text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists path_artifacts_user_idx
  on programming.path_artifacts (user_id, path_id, phase_id);

comment on table programming.path_artifacts is
  'Nhật ký artifact người học tự khai làm bằng chứng cuối mỗi giai đoạn của lộ trình mục tiêu — không chấm bằng AI';
