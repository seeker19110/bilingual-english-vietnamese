-- 0010_vlog_entries.sql
-- Bảng mới `vlog_entries` — lưu TRANSCRIPT + PHẢN HỒI AI của thử thách
-- "Vlog 1 phút / 30 ngày" (xem docs/research/thu-thach-vlog-30-ngay.md mục 4.2).
--
-- BỐI CẢNH: video KHÔNG upload lên server (chỉ nằm trên máy người dùng — IndexedDB).
-- Bảng này chỉ lưu phần TEXT (vài KB/ngày): transcript từ Whisper, phản hồi AI (jsonb),
-- vị trí trong thử thách (vòng/ngày/chủ đề) + số liệu (thời lượng, số từ) để:
--   (1) hiện bảng 30 ô + huy hiệu mốc trên mọi thiết bị,
--   (2) đổi máy/xóa cache không mất tiến độ thử thách,
--   (3) màn tổng kết ngày 30 (biểu đồ nhịp nói, tổng lỗi đã sửa).
--
-- UNIQUE (user_id, day): mỗi ngày 1 dòng — nộp lại trong ngày = upsert ghi đè
-- (idempotent, chống lạm dụng gọi AI nhiều lần/ngày).
--
-- RLS: owner-only — policy "for all" (gồm cả select/insert/update/delete) chỉ cho
-- chính chủ (auth.uid() = user_id), giống các bảng chat/writing/speaking sẵn có.
--
-- ⚠️ THỨ TỰ TRIỂN KHAI: chạy migration này TRƯỚC khi deploy code mới lên VPS.
-- Nếu deploy code trước, upsert của vlogCloud.ts sẽ lỗi "relation does not exist"
-- (đồng bộ vlog tạm ngưng — local vẫn hiển thị được, nhưng đừng để trôi lâu).
--
-- An toàn chạy lại (idempotent). Chạy 1 lần trong Supabase Dashboard → SQL Editor.

create table if not exists public.vlog_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  day             date not null,                 -- ngày nộp vlog (múi giờ VN, 'YYYY-MM-DD')
  challenge_round int not null default 1,        -- vòng thử thách thứ mấy (sau ngày 30 mời vòng mới)
  challenge_day   int not null,                  -- ngày thứ mấy trong thử thách (1..30)
  topic_day       int not null,                  -- chủ đề gợi ý của ngày (index trong src/data/vlogTopics.ts)
  transcript      text not null,                 -- transcript từ Whisper (/api/stt)
  feedback        jsonb,                         -- phản hồi AI có cấu trúc (null = chưa/lỗi feedback)
  duration_sec    int not null default 0,        -- thời lượng nói (giây, client tự tính)
  word_count      int not null default 0,        -- số từ trong transcript (tính nhịp nói từ/phút)
  created_at      timestamptz default now(),
  unique (user_id, day)                          -- mỗi ngày 1 vlog; nộp lại = ghi đè (upsert)
);
-- Không cần index riêng: unique (user_id, day) đã tạo sẵn index phục vụ truy vấn theo user.

-- Bật RLS + policy owner-only: mỗi người CHỈ đọc/ghi vlog của chính mình.
alter table public.vlog_entries enable row level security;
drop policy if exists "own vlog" on public.vlog_entries;
create policy "own vlog" on public.vlog_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
