-- 0008_learning_progress_cefr_unlocked.sql
-- Thêm cột đồng bộ CÁC CẤP CEFR ĐÃ TỪNG MỞ KHÓA vào bảng learning_progress:
--   cefr_unlocked — mảng id cấp (A1/A2/B1/B2) đã từng đủ điều kiện mở khóa
--
-- VẤN ĐỀ (audit 2026-07-03): computeLockedMap (src/lib/cefrProgress.ts) tính %
-- "đủ điều kiện mở khóa cấp sau" SỐNG trên tổng từ vựng HIỆN TẠI của cấp trước.
-- Khi tăng từ vựng (PR #185, #186, #187 — tăng tổng lộ trình từ ~771 lên ~1500 từ),
-- tổng đó tăng lên → % của người dùng ĐÃ từng đạt ngưỡng 70% tụt xuống dưới ngưỡng
-- → cấp sau bị KHÓA LẠI dù người dùng đang học dở, dù họ không "quên" từ nào cả.
--
-- Cột này ghi nhớ lại: 1 khi cấp đã từng đủ điều kiện mở khóa thì không bao giờ
-- khóa lại nữa, kể cả khi tổng từ vựng cấp trước tăng thêm sau này.
--
-- RLS: không cần policy mới — policy "own progress" (for all) áp theo DÒNG,
-- cột mới nằm trong dòng của chính user nên tự được bảo vệ.
--
-- ⚠️ THỨ TỰ TRIỂN KHAI: chạy migration này TRƯỚC khi deploy code mới lên VPS.
-- Nếu deploy code trước, upsert của progressSync sẽ lỗi "column does not exist"
-- → toàn bộ đồng bộ tiến độ (kể cả từ vựng/SRS) tạm ngưng cho tới khi chạy migration.
--
-- An toàn chạy lại (idempotent). Chạy 1 lần trong Supabase Dashboard → SQL Editor.

alter table public.learning_progress
  add column if not exists cefr_unlocked jsonb not null default '[]';
