-- 0014_tutor_feedback.sql
-- Bảng mới `tutor_feedback` — người dùng báo AI sửa SAI/BỎ SÓT lỗi (mục ⑤ T3 trong
-- docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md, "Vòng phản hồi người dùng").
--
-- BỐI CẢNH: đây là bước đo lường để cải thiện chất lượng gia sư AI theo VÒNG KHÉP KÍN
-- — golden set (⑤ T1, migration không cần, chỉ là file JSON tĩnh trong scripts/) đo
-- baseline; bảng này thu thập ca THỰC TẾ người dùng gặp phải để định kỳ (thủ công, đọc
-- SQL trực tiếp — KHÔNG làm dashboard admin ở đợt này) bổ sung vào golden set.
--
-- CHỈ ghi khi người dùng CHỦ ĐỘNG bấm 👎 cạnh khối "✅ Nhận xét" ở Chat/Speaking — không
-- tự động thu thập gì khác (tôn trọng dữ liệu, đúng CLAUDE.md §4 không tin client nhưng
-- cũng không âm thầm theo dõi).
--
-- RLS: owner-only — user chỉ ghi/đọc phản hồi của chính mình (không có nhu cầu đọc từ
-- client thực tế — insert-only phía app — nhưng giữ "for all" để nhất quán các bảng khác).
--
-- An toàn chạy lại (idempotent). Chạy 1 lần trong Supabase Dashboard → SQL Editor, hoặc
-- tự động khi deploy qua `bash deploy.sh` (xem supabase/migrations/README.md).

create table if not exists public.tutor_feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source      text not null,              -- 'chat' | 'speaking'
  user_input  text not null,              -- câu học viên vừa nói/gõ ngay trước lượt AI này
  ai_feedback text not null,              -- nội dung khối "✅ Nhận xét" AI đã đưa ra
  created_at  timestamptz not null default now()
);
create index if not exists tutor_feedback_user_idx on public.tutor_feedback(user_id, created_at desc);

alter table public.tutor_feedback enable row level security;
drop policy if exists "own tutor feedback" on public.tutor_feedback;
create policy "own tutor feedback" on public.tutor_feedback
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
