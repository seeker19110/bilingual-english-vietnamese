-- 0006_pronunciations_rls.sql
-- BẬT RLS cho bảng `pronunciations` — vá lỗ ghi tự do vào cache phát âm dùng chung.
--
-- VẤN ĐỀ: bảng này được tạo tay theo PRONUNCIATION_CACHE_SETUP.md (không nằm trong
-- schema.sql cho tới đợt rà 2026-07-02) và hướng dẫn cũ KHÔNG bật RLS. Trên Supabase,
-- bảng trong schema public mặc định được GRANT cho vai trò client (anon/authenticated),
-- nên khi RLS tắt, BẤT KỲ người dùng đăng nhập nào (thậm chí anon key) cũng có thể
-- insert/update/delete thẳng vào bảng qua REST API — ví dụ ghi đè `audio_url` của một
-- từ sang URL độc hại, ảnh hưởng MỌI người dùng (cache dùng chung).
--
-- CÁCH VÁ: bật RLS + chỉ tạo policy SELECT công khai (giống bảng tts_cache).
-- Không có policy insert/update/delete → client bị chặn ghi; server dùng service_role
-- (bỏ qua RLS) nên api/pronunciation.ts vẫn ghi cache bình thường.
--
-- An toàn chạy lại (idempotent). Chạy 1 lần trong Supabase SQL Editor.

-- Tạo bảng nếu DB mới chưa có (DB production đã có sẵn — bỏ qua)
create table if not exists public.pronunciations (
  id            uuid primary key default gen_random_uuid(),
  word          text not null,
  voice         text not null default 'female', -- 'female' | 'female2' | 'male' | 'male2'
  audio_url     text not null,
  lang          text not null default 'en-US',
  voice_version text,
  created_at    timestamptz default now(),
  unique (word, voice)
);
create index if not exists idx_pronunciations_word on public.pronunciations(word);
alter table public.pronunciations add column if not exists voice_version text;

-- Bật RLS + chỉ cho đọc công khai (ghi = chỉ service_role của server)
alter table public.pronunciations enable row level security;
drop policy if exists "public read pronunciations" on public.pronunciations;
create policy "public read pronunciations" on public.pronunciations for select using (true);
