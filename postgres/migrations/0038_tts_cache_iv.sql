-- 0038_tts_cache_iv.sql — Lưu IV (nonce) THẬT của từng bản ghi audio TTS đã mã hoá.
--
-- VẤN ĐỀ (audit luồng dữ liệu 2026-08-12): api/_lib/ttsCrypto.ts suy ra CẢ khoá AES LẪN iv từ
-- cùng một giá trị `hash`. Khoá suy từ hash thì không sao (mỗi hash một khoá riêng), nhưng iv
-- suy từ hash nghĩa là NONCE CỐ ĐỊNH theo khoá. AES-GCM sụp đổ khi một cặp (khoá, nonce) mã hoá
-- hai bản rõ khác nhau: kẻ tấn công có 2 ciphertext đó suy ra được XOR của 2 bản rõ, và tệ hơn,
-- khôi phục được khoá xác thực GHASH để GIẢ MẠO dữ liệu đã ký.
--
-- Điều đó có thể xảy ra thật ở đây: nhà cung cấp TTS không trả về byte giống hệt nhau giữa các
-- lần gọi cùng một câu, trong khi bảng tts_cache có nhánh `on conflict (hash) do update` — tức
-- CÙNG một hash có thể được sinh lại ở hai thời điểm khác nhau (file lưu trữ mất, chạy lại seed
-- với --force, đổi provider...). Khoá "claim" (tts_cache_pending, migration 0031) chỉ chặn hai
-- request ĐỒNG THỜI, không chặn hai lần sinh cách nhau vài tháng.
--
-- CÁCH SỬA: mỗi lần mã hoá sinh iv NGẪU NHIÊN 12 byte và lưu vào cột này (base64).
--
-- TƯƠNG THÍCH NGƯỢC — cột để NULL được và mặc định là NULL: mọi bản ghi đã có từ trước migration
-- này vẫn giải mã đúng bằng iv suy ra từ hash như cũ (ttsCrypto.decryptAudio/getClientKeyMaterial
-- tự rơi về nhánh cũ khi iv null). KHÔNG cần sinh lại audio đã trả tiền, không cần downtime.
-- Rủi ro nonce reuse của các bản ghi CŨ vẫn còn cho tới khi chúng được sinh lại — chấp nhận,
-- vì sinh lại toàn bộ cache tốn tiền API và nội dung là bài học công khai, không phải bí mật.
--
-- Rollback: `alter table public.tts_cache drop column if exists iv;` — code cũ không đọc cột này.
-- Lưu ý: sau khi rollback, các bản ghi ĐÃ mã hoá bằng iv ngẫu nhiên sẽ KHÔNG giải mã được nữa
-- (mất iv). Muốn quay lui an toàn thì xoá luôn các bản ghi có iv khác null để chúng tự sinh lại.
alter table public.tts_cache add column if not exists iv text;

comment on column public.tts_cache.iv is
  'IV/nonce AES-256-GCM (base64, 12 byte) của chính bản ghi này. NULL = bản ghi cũ trước migration 0038, giải mã bằng iv suy ra từ hash (xem api/_lib/ttsCrypto.ts).';
