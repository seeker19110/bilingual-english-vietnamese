-- 0064_programming_schema.sql — Khung dữ liệu môn LẬP TRÌNH (PR-L1).
-- Đặc tả: docs/research/dac-ta-mon-lap-trinh-2026-08-24.md (khuôn 5 mảnh, mảnh "dữ liệu bền")
-- + docs/research/dac-ta-du-an-xuyen-suot-mon-lap-trinh-2026-08-24.md §4 (workspace dự án).
--
-- PR-L1 chỉ tạo KHUNG bảng — endpoint đọc/ghi vào ở PR-L3/L3b. Tạo trước để migration đi cùng
-- khai báo môn (subjectRegistry) và để các PR sau không phải đổi schema giữa chừng.
--
-- Idempotent. Rollback: drop schema if exists programming cascade;

create schema if not exists programming;

-- Trạng thái học viên trong môn: bậc đang học + phương án dự án trục đã chọn.
create table if not exists programming.learner_state (
  user_id       uuid primary key references public.users(id) on delete cascade,
  -- Bậc hiện tại theo thang P1–P6 (id thường: 'p1'..'p6').
  current_level text not null default 'p1'
    check (current_level in ('p1', 'p2', 'p3', 'p4', 'p5', 'p6')),
  -- Dự án trục: T1 "Cửa hàng của tôi" (mặc định, MVP chỉ mở T1) · T2 quỹ lớp · T3 sổ học tập.
  project_track text not null default 'T1' check (project_track in ('T1', 'T2', 'T3')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Tiến độ từng bài/bước: lesson_id là khoá ổn định từ dữ liệu giáo trình
-- (packages/subject-programming/curriculum.ts — ví dụ 'p1-u4', sau này 'p1-u4-l2').
create table if not exists programming.lesson_progress (
  user_id      uuid not null references public.users(id) on delete cascade,
  lesson_id    text not null,
  status       text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Workspace dự án trục: cây file ảo per-user (đặc tả xuyên suốt §4.1). Quota ~2MB text/học
-- viên do tầng API kiểm; DB chỉ chặn kích thước một file để không ai ghi blob khổng lồ.
create table if not exists programming.project_files (
  user_id    uuid not null references public.users(id) on delete cascade,
  path       text not null check (char_length(path) between 1 and 300),
  content    text not null default '' check (octet_length(content) <= 262144), -- 256KB/file
  updated_at timestamptz not null default now(),
  primary key (user_id, path)
);

-- Snapshot workspace theo milestone chặng (đặc tả xuyên suốt §4.4): xem lại tiến bộ + khôi phục.
create table if not exists programming.project_snapshots (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  -- Milestone chặng: 'p1'..'p5' (chặng P6 theo track, đặt tên sau khi soạn P6).
  milestone  text not null check (char_length(milestone) between 1 and 50),
  -- Toàn bộ cây file tại thời điểm chốt: { "path": "content", ... }.
  files      jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists project_snapshots_user_idx
  on programming.project_snapshots (user_id, created_at desc);

comment on schema programming is 'Môn Lập trình — tiến độ P1–P6 + workspace dự án xuyên suốt';
comment on table programming.project_files is
  'Cây file ảo dự án trục per-user — nguồn sự thật server, client cache localStorage';
