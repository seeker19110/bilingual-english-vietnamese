-- 0003_pronunciation_lang_key.sql — Cache phát âm từ vựng (bảng pronunciations) trước đây
-- khoá duy nhất chỉ theo (word, voice), ngầm định LUÔN là tiếng Anh (cột lang có sẵn nhưng
-- ghi cứng 'en-US', không dùng để phân biệt). Chiều B (học tiếng Việt) cần đọc TỪ TIẾNG VIỆT
-- (card.vi) — nếu chỉ khoá theo (word, voice) thì 1 chữ tiếng Việt trùng chữ tiếng Anh (hiếm
-- nhưng có thể, vd "la", "co") sẽ bị cache đè nhầm giọng/ngôn ngữ. Thêm lang vào khoá duy nhất
-- để 2 ngôn ngữ không đụng cache của nhau.
--
-- Rollback:
--   alter table public.pronunciations drop constraint if exists pronunciations_word_voice_lang_key;
--   alter table public.pronunciations add constraint pronunciations_word_voice_key unique (word, voice);
do $$ begin
  if exists (
    select 1 from pg_constraint where conname = 'pronunciations_word_voice_key'
  ) then
    alter table public.pronunciations drop constraint pronunciations_word_voice_key;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'pronunciations_word_voice_lang_key'
  ) then
    alter table public.pronunciations
      add constraint pronunciations_word_voice_lang_key unique (word, voice, lang);
  end if;
end $$;
