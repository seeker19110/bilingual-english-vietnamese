-- 0007_learning_progress_cefr.sql
-- Thêm 2 cột đồng bộ TIẾN ĐỘ LỘ TRÌNH CEFR vào bảng learning_progress:
--   cefr_grammar   — mảng id bài ngữ pháp đã bấm "Đã học xong bài này"
--   cefr_dialogues — mảng khóa hội thoại đã xem (dạng "<id unit/vòng>:<titleEn>")
--
-- VẤN ĐỀ: 2 dữ liệu này (PR #180) trước chỉ nằm localStorage (et_cefr_grammar_*,
-- et_cefr_dialogue_*) → đổi điện thoại/xóa cache là mất, trong khi từ đã thuộc /
-- từ khó / SRS đã đồng bộ qua learning_progress từ trước (src/lib/progressSync.ts).
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
  add column if not exists cefr_grammar jsonb not null default '[]';

alter table public.learning_progress
  add column if not exists cefr_dialogues jsonb not null default '[]';
