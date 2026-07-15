-- 0013_learning_progress_achievements.sql
-- Thêm cột đồng bộ HUY HIỆU ĐÃ ĐẠT (achievements) vào learning_progress:
--   achievements — mảng id huy hiệu đã đạt, vd ["streak_7", "vocab_100", "cefr_a1"]
--
-- BỐI CẢNH (docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md, mục ② M2):
-- ~19 huy hiệu tĩnh khai báo ở src/data/achievements.ts, điều kiện đạt so với dữ
-- liệu ĐÃ CÓ SẴN (streak, từ vựng, thi cuối cấp, phiên nói/viết, challenge) — xem
-- src/lib/achievements.ts. checkNewAchievements() chạy sau vài mốc hành động, lưu
-- kết quả vào cột này để đổi máy không mất huy hiệu.
--
-- HỢP NHẤT (progressSync.ts): lấy HỢP (union) của local và cloud — dữ liệu chỉ
-- "tốt lên" (huy hiệu không bao giờ bị thu hồi), giống learned/hard/cefr_grammar.
--
-- RLS: không cần policy mới — policy "own progress" áp theo DÒNG.
--
-- ⚠️ Chạy migration này TRƯỚC khi deploy code mới (giống các migration trước —
-- xem README.md cùng thư mục). An toàn chạy lại (idempotent).

alter table public.learning_progress
  add column if not exists achievements jsonb not null default '[]';
