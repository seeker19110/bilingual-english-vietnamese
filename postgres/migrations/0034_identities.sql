-- 0034_identities.sql — Bảng `identities`: tách kênh đăng nhập (Google/Facebook/Apple/Microsoft)
-- ra khỏi bảng lõi `users`, thay 4 cột `google_id`/`facebook_id`/`apple_id`/`microsoft_id`.
--
-- LÝ DO (Bước 1 kế hoạch quản lý user đa lĩnh vực — xem docs/adr/0002-quan-ly-nguoi-dung.md):
-- mỗi provider mới hiện đang tốn 1 migration ĐỔI BẢNG LÕI (0020 thêm facebook/apple, 0022 thêm
-- microsoft). Nền tảng sắp có nhiều app con (toán/lý/hoá/tài chính…) nên bảng `users` phải
-- ĐỨNG YÊN. Dạng dòng thì thêm kênh đăng nhập mới = 0 migration.
--
-- PHẠM VI: chỉ các kênh OAuth. Đăng nhập bằng email/mật khẩu vẫn nằm ở `users.password_hash`
-- (hỏi "tài khoản này có đặt mật khẩu chưa" = `password_hash is not null`), KHÔNG nhân bản
-- sang đây để tránh hai nguồn sự thật.
--
-- KHÔNG XOÁ 4 cột cũ ở bước này — code còn ghi song song (dual-write) để lỡ phải rollback bản
-- deploy thì dữ liệu ở cột cũ vẫn đúng. Việc xoá cột nằm ở Bước 6 của kế hoạch.
--
-- Idempotent: chạy lại nhiều lần không sao (if not exists + on conflict do nothing).
-- Rollback: drop table if exists public.identities;   (dữ liệu gốc vẫn còn ở 4 cột cũ)

create table if not exists public.identities (
  provider         text        not null,
  provider_user_id text        not null,
  user_id          uuid        not null references public.users(id) on delete cascade,
  email            text,       -- email do provider trả về LÚC LIÊN KẾT (có thể khác users.email)
  linked_at        timestamptz not null default now(),
  primary key (provider, provider_user_id)
);

-- Một user có nhiều identity → tra theo user_id (màn "các kênh đã liên kết").
create index if not exists identities_user_idx on public.identities(user_id);

-- Một user chỉ được liên kết TỐI ĐA 1 tài khoản trên mỗi provider (không thể gắn 2 tài khoản
-- Google khác nhau vào cùng 1 user) — đúng với hành vi cột unique cũ.
create unique index if not exists identities_user_provider_idx
  on public.identities(user_id, provider);

-- ── Backfill từ 4 cột cũ ─────────────────────────────────────────────────────────────────
-- `linked_at` lấy tạm `users.created_at` (không có mốc liên kết thật trong dữ liệu cũ).
insert into public.identities (provider, provider_user_id, user_id, email, linked_at)
select 'google', google_id, id, email, created_at from public.users where google_id is not null
on conflict do nothing;

insert into public.identities (provider, provider_user_id, user_id, email, linked_at)
select 'facebook', facebook_id, id, email, created_at from public.users where facebook_id is not null
on conflict do nothing;

insert into public.identities (provider, provider_user_id, user_id, email, linked_at)
select 'apple', apple_id, id, email, created_at from public.users where apple_id is not null
on conflict do nothing;

insert into public.identities (provider, provider_user_id, user_id, email, linked_at)
select 'microsoft', microsoft_id, id, email, created_at from public.users where microsoft_id is not null
on conflict do nothing;
