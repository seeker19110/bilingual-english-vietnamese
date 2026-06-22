-- supabase/refresh-tts-voices.sql
-- Chạy file này TRONG Supabase SQL Editor MỘT LẦN sau khi đổi giọng TTS
-- (ví dụ khi nâng lên Chirp 3 HD: Kore/Puck).
--
-- Vì sao cần chạy:
--   Audio cũ (giọng Journey/Neural2) đã được CACHE trong DB + Supabase Storage.
--   Nếu không xóa, hệ thống vẫn phát lại audio giọng cũ cho tới khi cache hết hạn.
--   Xóa các dòng cache này → lần phát tiếp theo sẽ gọi Google tạo lại bằng GIỌNG MỚI.
--
-- An toàn: chỉ xóa CACHE (tạo lại được), KHÔNG đụng tới dữ liệu người dùng,
-- lịch sử học hay lượt dùng.

-- 1) Xóa cache phát âm từ điển (api/pronunciation.ts) — bảng này không có "version"
--    nên bắt buộc xóa thủ công thì giọng mới mới có hiệu lực.
DELETE FROM public.pronunciations;

-- 2) Xóa cache câu/đoạn (api/tts.ts).
--    Thực ra api/tts.ts đã tự đổi khóa cache theo VOICE_VERSION nên audio cũ sẽ
--    không bị phát lại; xóa ở đây chỉ để DỌN các dòng cũ không còn dùng, tiết kiệm
--    dung lượng. Có thể bỏ qua bước này nếu muốn giữ lại.
DELETE FROM public.tts_cache;

-- LƯU Ý về file audio trong Storage:
--   Lệnh trên chỉ xóa DÒNG trong DB, KHÔNG xóa file .mp3 cũ trong Supabase Storage
--   (bucket "pronunciations" và "tts-cache"). File cũ nằm lại đó vô hại (chỉ tốn ít
--   dung lượng) và sẽ không bao giờ được phát nữa. Nếu muốn dọn sạch hẳn, vào
--   Storage > chọn bucket > xóa thư mục/file thủ công.
