-- 0031_tts_cache_pending.sql
-- Bảng khoá "claim" chống race condition khi nhiều request cùng cache-miss 1 câu giống nhau.
--
-- Vì sao cần: trước đây mỗi request cache-miss tự gọi Google TTS + mã hoá + lưu độc lập,
-- không có gì ngăn N request đồng thời cùng làm việc này cho CÙNG 1 hash → vừa tốn tiền API
-- N lần, vừa (nghiêm trọng hơn) khiến cùng 1 (khoá, iv) suy ra từ hash bị dùng để mã hoá
-- N audio bytes có thể khác nhau — tái sử dụng nonce là lỗi bảo mật với AES-GCM (xem
-- api/_lib/ttsCrypto.ts). Bảng này để 1 request duy nhất "giành quyền" sinh audio cho 1 hash,
-- các request khác chờ rồi đọc lại cache — an toàn qua PgBouncer transaction pooling (không
-- cần giữ 1 connection mở như pg_advisory_lock).
--
-- Cách dùng: insert ... on conflict (hash) do nothing returning hash — thắng thì là "leader"
-- (đi sinh audio), thua thì là "follower" (chờ rồi đọc tts_cache). Leader xoá dòng của mình khi
-- xong (thành công hay lỗi đều xoá, tránh khoá treo vĩnh viễn). Dòng quá cũ (leader crash giữa
-- chừng, không kịp xoá) được coi là "hết hạn" và bị dọn/ghi đè ở tts.ts (không cần cron riêng).
--
-- Rollback: drop table if exists public.tts_cache_pending;

create table if not exists public.tts_cache_pending (
  hash       text primary key,
  created_at timestamptz not null default now()
);
