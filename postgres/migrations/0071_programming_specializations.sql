-- Migration 0071: Tiến độ HƯỚNG CHUYÊN SÂU môn Lập trình (nối tiếp PR #712).
--
-- Đặc tả: docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md.
-- PR #712 mới có DỮ LIỆU 13 hướng (packages/subject-programming/specializations/) và hai trang
-- giới thiệu; chưa có chỗ nào lưu "tôi đang theo hướng nào, đã xong chặng nào". Đây là phần đó.
--
-- VÌ SAO HAI BẢNG chứ không nhét vào programming.learner_state:
--  · learner_state là 1 dòng/người cho XƯƠNG SỐNG P1–P6. Hướng chuyên sâu là quan hệ NHIỀU:
--    một hướng sản phẩm (chọn MỘT) + có thể song song hai hướng NỀN cắt ngang (kiến trúc,
--    thuật toán). Nhét vào thành cột thì mỗi lần đổi luật lại phải đổi schema.
--  · Tách tiến độ CHẶNG ra bảng riêng theo đúng khuôn programming.lesson_progress (khoá chính
--    (user_id, <id giáo trình>), status in_progress/completed, completed_at) để đọc/ghi cùng
--    một kiểu, không phát minh khuôn mới.
--
-- Khoá tiến độ là id ổn định từ dữ liệu giáo trình: spec_id ('web'), stage_id ('web-s1').
-- Tầng API đối chiếu với getSpecialization()/getSpecStage() trước khi ghi — DB chỉ chặn khuôn
-- dạng thô để không ai ghi rác qua đường khác.
--
-- Idempotent. Rollback:
--   drop table if exists programming.spec_stage_progress;
--   drop table if exists programming.spec_enrollment;

create schema if not exists programming;

-- Hướng học viên đang theo. role='primary' là hướng sản phẩm chính; role='cross' là hướng nền
-- (kiến trúc/thuật toán) học SONG SONG, không thay thế hướng chính.
create table if not exists programming.spec_enrollment (
  user_id    uuid not null references public.users(id) on delete cascade,
  spec_id    text not null check (spec_id ~ '^[a-z]+$' and char_length(spec_id) <= 32),
  role       text not null check (role in ('primary', 'cross')),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, spec_id)
);

-- Ràng buộc "chỉ MỘT hướng chính" đặt ở DB chứ không chỉ ở code: hai tab mở song song, hay một
-- client tự chế, đều không lách được (cùng cách làm với exam_plans_one_active của 0070).
create unique index if not exists spec_enrollment_one_primary
  on programming.spec_enrollment (user_id) where role = 'primary';

create index if not exists spec_enrollment_user_idx
  on programming.spec_enrollment (user_id);

-- Tiến độ từng CHẶNG (S1→S4) của hướng. stage_id đã gồm spec_id nên là khoá đủ; cột spec_id
-- giữ riêng để lọc/đếm theo hướng mà không phải cắt chuỗi trong SQL.
create table if not exists programming.spec_stage_progress (
  user_id      uuid not null references public.users(id) on delete cascade,
  spec_id      text not null check (spec_id ~ '^[a-z]+$' and char_length(spec_id) <= 32),
  stage_id     text not null check (stage_id ~ '^[a-z]+-s[1-4]$'),
  status       text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, stage_id)
);

create index if not exists spec_stage_progress_user_idx
  on programming.spec_stage_progress (user_id);

comment on table programming.spec_enrollment is
  'Hướng chuyên sâu đang theo — 1 hướng chính (primary) + các hướng nền cắt ngang (cross)';
comment on table programming.spec_stage_progress is
  'Tiến độ chặng S1–S4 của hướng chuyên sâu; khoá là stage_id ổn định từ specializations/';
