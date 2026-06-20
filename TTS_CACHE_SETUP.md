# TTS_CACHE_SETUP.md — đã gộp vào tài liệu khác

> File này (hướng dẫn cache TTS cho câu) đã **lỗi thời** sau khi gộp nhánh chính
> (`origin/main`): tên cột DB đổi từ `text_hash` → `hash`, bucket Storage đổi từ
> `pronunciations`/`sentences/` → `tts-cache` riêng, và tham số `cache: true/false`
> không còn nữa — `/api/tts` giờ luôn cache + luôn mã hóa, không có chế độ "không
> cache" cho câu trả lời AI động như thiết kế cũ.

Thông tin còn đúng và cập nhật nằm ở:

- **Tạo bảng `tts_cache`**: `supabase/schema.sql` (mục 6) — chạy cùng lúc với các
  bảng khác, xem hướng dẫn ở `SUPABASE_SYNC_SETUP.md`.
- **Biến môi trường** (`GOOGLE_TTS_API_KEY`, `TTS_ENCRYPTION_MASTER_KEY`): `.env.example`.
- **Mã hóa AES-256-GCM**: `api/_lib/ttsCrypto.ts` (suy khoá), `api/tts.ts` (luồng
  cache + mã hóa), `src/lib/tts.ts` (gọi API + giải mã ở client).
- **Giọng đang dùng**: bảng `VOICE_MAP` trong `api/_lib/googleTts.ts`.

File này giữ lại chỉ để tránh broken link từ các ghi chú cũ; có thể xóa hẳn nếu muốn.
