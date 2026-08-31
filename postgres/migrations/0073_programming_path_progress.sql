-- Migration 0073: Tiến độ LỘ TRÌNH MỤC TIÊU môn Lập trình (nối tiếp PR #766 — đợt 2/4).
--
-- Đặc tả: docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md (đợt 2).
-- Đợt 1 (#766) mới có DỮ LIỆU lộ trình (packages/subject-programming/learningPaths/) và trang
-- đọc-suy-từ-tiến-độ-hướng; đợt này là chỗ lưu "chặng nào của LỘ TRÌNH đã được miễn/đang
-- học/đã xong" — tách khỏi programming.spec_stage_progress (0071) vì hai khái niệm khác nhau:
-- một chặng có thể vừa nằm trong tiến độ HƯỚNG (học trực tiếp từ trang hướng) vừa được LỘ TRÌNH
-- đánh dấu 'skipped' qua chẩn đoán mà người học chưa từng mở trang hướng đó.
--
-- Khoá tiến độ là (user_id, path_id, stage_id) — path_id để lọc/đếm theo lộ trình mà không
-- phải suy ngược từ stage_id (một stage_id có thể xuất hiện ở nhiều lộ trình trong tương lai).
-- Tầng service đối chiếu path_id/stage_id với getLearningPath()/getSpecStage() trước khi ghi —
-- DB chỉ chặn khuôn dạng thô để không ai ghi rác qua đường khác (cùng triết lý 0071).
--
-- Idempotent. Rollback:
--   drop table if exists programming.path_progress;

create schema if not exists programming;

create table if not exists programming.path_progress (
  user_id    uuid not null references public.users(id) on delete cascade,
  path_id    text not null check (path_id ~ '^[a-z-]+$' and char_length(path_id) <= 32),
  stage_id   text not null check (stage_id ~ '^[a-z]+-s[1-4]$'),
  status     text not null default 'in_progress'
    check (status in ('skipped', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  primary key (user_id, path_id, stage_id)
);

create index if not exists path_progress_user_idx
  on programming.path_progress (user_id, path_id);

comment on table programming.path_progress is
  'Tiến độ chặng theo LỘ TRÌNH MỤC TIÊU (skipped/in_progress/completed); khoá path_id + stage_id ổn định từ learningPaths/';
