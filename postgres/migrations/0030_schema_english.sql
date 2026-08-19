-- 0030_schema_english.sql — PR-5b (GĐ1 tách lõi): chuyển các bảng dữ liệu HỌC TIẾNG ANH
-- (không phải hạ tầng dùng chung) sang schema Postgres riêng `english`, chuẩn bị cho môn
-- thứ 2 (Toán, GĐ2) có schema riêng của nó mà không đụng bảng của tiếng Anh.
--
-- Chỉ ĐỔI CHỖ (alter table set schema) — KHÔNG copy dữ liệu, không có rủi ro lệch bản sao,
-- chạy tức thời (thao tác catalog, không quét bảng).
--
-- tts_cache Ở LẠI public — cache audio TTS dùng chung mọi môn (không phải dữ liệu học riêng
-- tiếng Anh). daily_usage/free_daily_credit cũng ở lại public — đã có cột `subject` riêng
-- từ migration 0029_platform_subject.sql, dùng chung hạ tầng đếm lượt cho mọi môn.
--
-- Cầu tương thích: tạo view `public.<ten_bang>` trỏ sang `english.<ten_bang>` để mã nào lỡ
-- chưa sửa (hoặc bản build cũ đang chạy trong lúc deploy) vẫn đọc/ghi đúng dữ liệu. Xoá view
-- này ở PR sau, khi đã xác nhận (grep toàn repo + theo dõi log) không còn truy vấn nào dùng
-- tên bảng không gắn schema.

create schema if not exists english;

do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'chat_sessions')
     and not exists (select 1 from pg_tables where schemaname = 'english' and tablename = 'chat_sessions') then
    alter table public.chat_sessions set schema english;
  end if;

  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'writing_submissions')
     and not exists (select 1 from pg_tables where schemaname = 'english' and tablename = 'writing_submissions') then
    alter table public.writing_submissions set schema english;
  end if;

  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'speaking_sessions')
     and not exists (select 1 from pg_tables where schemaname = 'english' and tablename = 'speaking_sessions') then
    alter table public.speaking_sessions set schema english;
  end if;

  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'learning_progress')
     and not exists (select 1 from pg_tables where schemaname = 'english' and tablename = 'learning_progress') then
    alter table public.learning_progress set schema english;
  end if;

  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'pronunciations')
     and not exists (select 1 from pg_tables where schemaname = 'english' and tablename = 'pronunciations') then
    alter table public.pronunciations set schema english;
  end if;

  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'challenge_entries')
     and not exists (select 1 from pg_tables where schemaname = 'english' and tablename = 'challenge_entries') then
    alter table public.challenge_entries set schema english;
  end if;

  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'tutor_feedback')
     and not exists (select 1 from pg_tables where schemaname = 'english' and tablename = 'tutor_feedback') then
    alter table public.tutor_feedback set schema english;
  end if;
end $$;

create or replace view public.chat_sessions       as select * from english.chat_sessions;
create or replace view public.writing_submissions as select * from english.writing_submissions;
create or replace view public.speaking_sessions   as select * from english.speaking_sessions;
create or replace view public.learning_progress   as select * from english.learning_progress;
create or replace view public.pronunciations       as select * from english.pronunciations;
create or replace view public.challenge_entries    as select * from english.challenge_entries;
create or replace view public.tutor_feedback       as select * from english.tutor_feedback;

-- ============================================================================
-- ROLLBACK (chạy tay nếu cần lùi lại — theo thứ tự: xoá view trước, rồi trả bảng về public):
--
-- drop view if exists public.chat_sessions;
-- drop view if exists public.writing_submissions;
-- drop view if exists public.speaking_sessions;
-- drop view if exists public.learning_progress;
-- drop view if exists public.pronunciations;
-- drop view if exists public.challenge_entries;
-- drop view if exists public.tutor_feedback;
--
-- alter table if exists english.chat_sessions       set schema public;
-- alter table if exists english.writing_submissions set schema public;
-- alter table if exists english.speaking_sessions   set schema public;
-- alter table if exists english.learning_progress   set schema public;
-- alter table if exists english.pronunciations       set schema public;
-- alter table if exists english.challenge_entries    set schema public;
-- alter table if exists english.tutor_feedback       set schema public;
--
-- drop schema if exists english;
-- ============================================================================
