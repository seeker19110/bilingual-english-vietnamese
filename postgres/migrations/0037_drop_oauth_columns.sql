-- 0037_drop_oauth_columns.sql — Xoá 4 cột định danh OAuth cũ trên `public.users`
-- (Bước 6 kế hoạch quản lý user đa lĩnh vực — docs/adr/0002-quan-ly-nguoi-dung.md).
--
-- ĐIỀU KIỆN TIÊN QUYẾT (đã đáp ứng trước khi viết migration này):
--   1. Bảng `identities` (0034) đã tồn tại và được dual-write từ mọi lượt đăng nhập OAuth kể
--      từ đó — coi như đã "đầy" cho tài khoản còn hoạt động.
--   2. `packages/core-auth/authService.ts#findOrCreateOAuthUser` đã đổi sang tra cứu qua bảng
--      `identities` THAY VÌ 4 cột này (đổi trong CÙNG PR với migration này — code mới và
--      migration này PHẢI cùng 1 lần deploy, không được lệch nhau).
--
-- Vì sao xoá được an toàn: `identities` là nguồn tra cứu MỚI, độc lập hoàn toàn với 4 cột này.
-- Backfill 1 lần lúc 0034 + dual-write liên tục từ đó tới nay đã đủ dữ liệu; users có
-- provider_id CŨ mà chưa từng đăng nhập lại sau 0034 KHÔNG có trong `identities` — chấp nhận
-- (rất hiếm, tài khoản OAuth không hoạt động từ trước khi tách bảng), họ vẫn đăng nhập lại
-- bình thường qua email trùng (nhánh "byEmail" trong findOrCreateOAuthUser).
--
-- Rollback: cột đã mất dữ liệu vĩnh viễn (không phải soft-drop) — muốn khôi phục phải backfill
-- LẠI từ `identities` trước khi thêm cột:
--   alter table public.users add column google_id text unique;
--   update public.users u set google_id = i.provider_user_id
--     from public.identities i where i.user_id = u.id and i.provider = 'google';
--   (lặp lại cho facebook_id/apple_id/microsoft_id)

alter table public.users drop column if exists google_id;
alter table public.users drop column if exists facebook_id;
alter table public.users drop column if exists apple_id;
alter table public.users drop column if exists microsoft_id;
