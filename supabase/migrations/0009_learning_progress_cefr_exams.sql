-- 0009_learning_progress_cefr_exams.sql
-- Thêm cột đồng bộ KẾT QUẢ BÀI THI CUỐI CẤP CEFR vào bảng learning_progress:
--   cefr_exams — map { levelId → { passed, bestPct, attempts, lastAt } }
--
-- BỐI CẢNH (PR bài kiểm tra cuối cấp): mỗi cấp CEFR (A1→C2) có 1 bài thi tổng hợp
-- (từ vựng + ngữ pháp + nghe + đọc). Đạt ≥70% mới "qua cấp" và mở khóa cấp tiếp theo.
-- Kết quả cần lưu để: (1) nhớ đã qua cấp nào (mở khóa + huy hiệu), (2) giữ điểm cao
-- nhất + số lần thi, (3) đồng bộ khi đổi máy.
--
-- Cấu trúc (jsonb object, mặc định rỗng '{}'):
--   { "A1": { "passed": true, "bestPct": 83, "attempts": 2, "lastAt": "2026-07-07T…" } }
--
-- HỢP NHẤT (progressSync.ts): dữ liệu chỉ "tốt lên" — giữ bestPct lớn hơn,
-- passed = OR, attempts = max, lastAt = mới hơn.
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
  add column if not exists cefr_exams jsonb not null default '{}';
