# ⚠️ Spec cũ — đã lỗi thời, chỉ giữ để tham khảo lịch sử

File này là **bản thiết kế ban đầu** (viết theo kiểu Next.js: `app/api/.../route.ts`,
biến `NEXT_PUBLIC_*`, component `WordCard.tsx`). Dự án thực tế dùng **Vite + Vercel
Edge Functions style** (giống `api/claude.ts`), không phải Next.js — code thật đã lệch
khỏi spec này khá nhiều (4 giọng thay vì 1, lưu file local VPS thay vì luôn Supabase
Storage, endpoint yêu cầu đăng nhập, v.v.).

**Đọc tài liệu còn đúng thay vì file này:**

- Hướng dẫn setup: `PRONUNCIATION_CACHE_SETUP.md`
- Code thật: `api/pronunciation.ts`, `api/_lib/googleTts.ts`, `api/_lib/fileStorage.ts`
- Bảng DB: `supabase/schema.sql` (mục "6a. pronunciations")
- UI: `src/components/PronounceButton.tsx`

## Ý tưởng cốt lõi (vẫn đúng)

1. User tra 1 từ → tìm cache theo `(word, voice)` trong bảng `pronunciations`.
2. Cache HIT → trả `audio_url` luôn.
3. Cache MISS → gọi Google Cloud TTS tạo mp3 → lưu file (local VPS hoặc Supabase
   Storage) → lưu `audio_url` vào bảng → trả về cho client.

Có thể xoá file này nếu không cần giữ lịch sử thiết kế.
