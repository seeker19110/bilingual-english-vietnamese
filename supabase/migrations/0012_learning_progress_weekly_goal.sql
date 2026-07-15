-- 0012_learning_progress_weekly_goal.sql
-- Thêm cột đồng bộ MỤC TIÊU TUẦN (weekly goal) vào learning_progress:
--   weekly_goal — { goal, updatedAt } (số NGÀY học/tuần người dùng tự chọn: 3/5/7)
--
-- BỐI CẢNH (docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md, mục ② M1):
-- mục tiêu tuần = số ngày có học trong tuần (Thứ 2 → CN, giờ VN), chọn ở /profile,
-- hiện vòng tiến độ ở Dashboard (xem src/lib/weeklyGoal.ts). Cần đồng bộ để đổi
-- máy không mất lựa chọn.
--
-- Cấu trúc (jsonb object, mặc định rỗng '{}' = chưa từng chỉnh → dùng mặc định 5):
--   { "goal": 5, "updatedAt": "2026-07-15T…" }
--
-- HỢP NHẤT (progressSync.ts): lấy bản ghi có updatedAt MỚI HƠN (đây là lựa chọn
-- cài đặt — không có khái niệm "tốt lên" như điểm thi; giống cột placement).
--
-- RLS: không cần policy mới — policy "own progress" áp theo DÒNG.
--
-- ⚠️ Chạy migration này TRƯỚC khi deploy code mới (giống các migration trước —
-- xem README.md cùng thư mục). An toàn chạy lại (idempotent).

alter table public.learning_progress
  add column if not exists weekly_goal jsonb not null default '{}';
