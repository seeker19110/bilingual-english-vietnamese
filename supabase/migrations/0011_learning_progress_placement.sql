-- 0011_learning_progress_placement.sql
-- Thêm cột đồng bộ KẾT QUẢ BÀI TEST XẾP LỚP (placement test) vào learning_progress:
--   placement — { cefr, appLevel, lastAt } của lần thi gần nhất
--
-- BỐI CẢNH (docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md, mục ④): thay vì
-- người dùng TỰ đoán trình độ ở Onboarding, có thể làm bài test thích ứng ngắn
-- (lib/placement.ts) để được đề xuất cấp CEFR nên bắt đầu học. Kết quả cần lưu để:
-- (1) hiện lại đề xuất ở /profile, (2) khóa thi lại trong PLACEMENT_RETRY_DAYS ngày
-- (canRetakePlacement), (3) đồng bộ khi đổi máy.
--
-- Cấu trúc (jsonb object, mặc định rỗng '{}' = chưa từng thi):
--   { "cefr": "B1", "appLevel": "intermediate", "lastAt": "2026-07-15T…" }
--
-- HỢP NHẤT (progressSync.ts): lấy bản ghi có lastAt MỚI HƠN (không có khái niệm
-- "tốt lên" như điểm thi — placement là 1 lần chụp trình độ tại thời điểm thi).
--
-- RLS: không cần policy mới — policy "own progress" áp theo DÒNG.
--
-- ⚠️ Chạy migration này TRƯỚC khi deploy code mới (giống các migration trước —
-- xem README.md cùng thư mục). An toàn chạy lại (idempotent).

alter table public.learning_progress
  add column if not exists placement jsonb not null default '{}';
