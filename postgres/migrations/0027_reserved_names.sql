-- 0027_reserved_names.sql — Quản lý danh sách từ cấm / tên mạo danh ban quản trị.

create table if not exists public.reserved_names (
  id          uuid primary key default gen_random_uuid(),
  phrase      text not null unique,
  created_at  timestamptz not null default now()
);

-- Khởi tạo danh sách mặc định nếu chưa có
insert into public.reserved_names (phrase)
values
  ('admin'),
  ('administrator'),
  ('quan tri'),
  ('quan tri vien'),
  ('ban quan tri'),
  ('moderator'),
  ('mod'),
  ('cskh'),
  ('cham soc khach hang'),
  ('support'),
  ('ho tro'),
  ('official'),
  ('chinh thuc'),
  ('system'),
  ('he thong'),
  ('staff'),
  ('nhan vien'),
  ('donghanhcungban')
on conflict (phrase) do nothing;
