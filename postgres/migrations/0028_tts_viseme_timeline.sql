-- 0028_tts_viseme_timeline.sql
-- Lưu timeline khẩu hình (viseme) THẬT kèm audio đã cache.
--
-- Vì sao: trước đây client tự ước lượng thời điểm từng viseme bằng cách CHIA ĐỀU thời lượng
-- audio theo số âm tiết (src/lib/viseme.ts) — miệng luôn "trôi" so với giọng thật. Giọng
-- ElevenLabs có endpoint /with-timestamps trả về mốc thời gian THẬT của từng ký tự, nên tính
-- timeline đúng ngay lúc tạo audio rồi lưu cùng cache: tính 1 lần, mọi người dùng sau dùng lại,
-- KHÔNG tốn thêm tiền API.
--
-- Kiểu dữ liệu: jsonb chứa mảng { viseme, startMs, endMs } — xem api/_lib/visemeTimeline.ts.
-- NULL = chưa có timing thật (audio cũ, hoặc giọng Google không hỗ trợ) → client tự ước lượng
-- như trước. Cột nullable nên KHÔNG phá dữ liệu cache sẵn có.
--
-- Rollback: alter table public.tts_cache drop column viseme_timeline;

alter table public.tts_cache
  add column if not exists viseme_timeline jsonb;

comment on column public.tts_cache.viseme_timeline is
  'Timeline khẩu hình thật [{viseme,startMs,endMs}] từ timestamp của TTS provider; NULL = client tự ước lượng';
