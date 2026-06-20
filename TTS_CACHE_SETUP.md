# Hướng dẫn setup: Cache TTS cho CÂU (giọng Google chất lượng cao)

Phần đọc **câu/hội thoại** giờ dùng Google TTS (giọng tự nhiên) thay cho giọng trình duyệt — giống phần phát âm từ điển đã có. Code đã viết xong; bạn chỉ cần **chạy thêm 1 đoạn SQL** trên Supabase để tạo bảng cache cho câu.

> Đã setup `PRONUNCIATION_CACHE_SETUP.md` rồi thì 3 biến `.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_TTS_API_KEY`) và bucket Storage `pronunciations` **dùng lại y nguyên** — không phải làm lại. Chỉ thiếu đúng 1 bảng mới.

---

## 1. Tạo bảng cache cho câu — vào Supabase → SQL Editor, dán đoạn này, bấm Run

```sql
create table tts_cache (
  id         uuid primary key default gen_random_uuid(),
  text_hash  text not null unique,            -- băm SHA-256 của (lang|voice|text)
  lang       text not null default 'en-US',   -- 'en-US' | 'vi-VN'
  voice      text not null default 'female',  -- 'female' | 'male'
  audio_url  text not null,
  text       text,                            -- lưu lại câu gốc để dễ kiểm tra/dọn dẹp
  created_at timestamp with time zone default now()
);
```

Vậy là xong. Bucket Storage thì dùng chung bucket `pronunciations` đã tạo trước đó (file câu được lưu trong thư mục con `sentences/`), không cần tạo bucket mới.

---

## ⚠️ Cập nhật: audio cache giờ được mã hóa AES-256-GCM — phải dọn cache cũ

Audio lưu trên Storage (thư mục `sentences/`) giờ được **mã hóa AES-256-GCM** trước khi upload —
ai có link Storage cũng không nghe được nếu không đăng nhập. Khoá giải mã được server suy ra từ
`text_hash` + 1 biến môi trường `TTS_ENCRYPTION_MASTER_KEY` (không lưu khoá riêng vào DB), và **chỉ
trả cho request có JWT Supabase hợp lệ** (tức là người đã đăng nhập thật qua `AUTH_SETUP.md`).

### Việc cần làm sau khi cập nhật

1. **Thêm biến `.env`** (đã có sẵn trong `.env` của máy này, cần thêm khi deploy):
   ```
   TTS_ENCRYPTION_MASTER_KEY=<base64, 32 byte>
   ```
   Tạo bằng lệnh: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   — xem thêm `.env.example`. Lúc `npm run dev`, `vite.config.ts` tự nạp biến này vào `process.env`.

2. **Dọn cache cũ (BẮT BUỘC)** — các file mp3 đã cache từ trước là **plaintext** (chưa mã hóa), client
   mới sẽ thử giải mã và thất bại → tự fallback giọng trình duyệt, không lỗi nhưng cũng không dùng
   được cache cũ. Chạy SQL này trên Supabase → SQL Editor để xóa hết, lần sau gọi sẽ tự tạo + mã hóa lại:
   ```sql
   delete from tts_cache;
   ```
   Có thể xóa thêm các file cũ trong Storage (bucket `pronunciations`, thư mục `sentences/`) cho gọn,
   nhưng không bắt buộc — file cũ chỉ tốn dung lượng, không gây lỗi (vì không còn dòng nào trong
   `tts_cache` trỏ tới chúng).

3. **Người dùng phải đăng nhập** để nghe được audio cache (câu ví dụ, cụm từ) — vì server chỉ trả
   khoá giải mã cho request có token. App đã bắt buộc đăng nhập ở mọi trang rồi (`AUTH_SETUP.md`)
   nên trong luồng dùng bình thường việc này vô hình; chỉ ảnh hưởng nếu có ai gọi `/api/tts` trực
   tiếp mà không qua app.

### Phạm vi (việc gì KHÔNG nằm trong lần đổi này)

- `api/pronunciation.ts` (cache phát âm **từng từ** trong từ điển — khác với cache **câu** ở
  `api/tts.ts`) hiện **chưa** được mã hóa. Có thể làm tương tự sau nếu cần.
- Audio ĐỘNG (`cache: false`, câu trả lời AI trong Chat/Speaking) không mã hóa — không cần, vì
  không được lưu lại (trả `audio_base64` rồi bỏ).

---

## 2. Chạy thử

```bash
npm run dev
```

- Mở trang **Cụm từ thông dụng** hoặc **Từ điển**, bấm nút loa cạnh 1 câu ví dụ → lần đầu chậm vài giây (đang tạo audio), bấm lại (load lại trang) sẽ nhanh ngay vì đã cache.
- Vào **Luyện nói** / **Chat**, câu trả lời của AI cũng được đọc bằng giọng Google (câu AI là nội dung động nên **không** lưu cache).

Test nhanh endpoint bằng tay (PowerShell / terminal):
```bash
curl -X POST http://localhost:5173/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"How are you today?","lang":"en-US","voice":"female","cache":true}'
```

---

## 3. Cách hoạt động (tóm tắt)

- **Nội dung tĩnh** (câu ví dụ từ điển, cụm từ, bài học) → gọi `/api/tts` với `cache: true`. Server tra bảng `tts_cache` theo băm nội dung; chưa có thì tạo bằng Google TTS, lưu file vào Storage + ghi bảng, trả về `audio_url`. Lần sau khỏi tạo lại → tiết kiệm tiền.
- **Nội dung động** (câu trả lời AI trong Chat/Speaking) → gọi với `cache: false`. Server chỉ tạo audio tạm, trả về `audio_base64`, **không** lưu (vì câu AI gần như không bao giờ trùng → tránh phình storage).
- **Lỗi Google** (mất mạng / chưa cấu hình key) → frontend tự động quay về **giọng trình duyệt** như cũ, app không bao giờ im tiếng.

## 4. Giọng đang dùng

| Ngôn ngữ | Nữ | Nam |
|----------|-----|-----|
| Tiếng Anh (`en-US`) | `en-US-Journey-F` | `en-US-Journey-D` |
| Tiếng Việt (`vi-VN`) | `vi-VN-Neural2-A` | `vi-VN-Neural2-D` |

Muốn đổi giọng khác: sửa bảng `VOICE_MAP` trong `api/_lib/googleTts.ts`.

---

## Đã đổi gì trong code

- `api/_lib/googleTts.ts` — `generateAudioFromGoogle()` nhận thêm tham số `lang` (`en-US`/`vi-VN`) + bảng giọng cho cả tiếng Việt (Neural2). Tương thích ngược với `api/pronunciation.ts`.
- `api/tts.ts` — **endpoint mới** đọc câu bất kỳ, 2 chế độ cache (tĩnh) / không cache (động).
- `src/lib/tts.ts` — `speak()` ưu tiên gọi `/api/tts`, lỗi thì fallback giọng trình duyệt; thêm `stopSpeaking` dừng được cả audio Google.
- `src/components/SpeakButton.tsx` — thêm prop `cache` + trạng thái loading (spinner khi đang tải audio).
- `src/pages/Chat.tsx` — nút loa cho câu AI truyền `cache={false}`.
- `src/pages/CommonPhrases.tsx` — chuyển từ giọng trình duyệt sang `speak()` của lib (cache tĩnh).
- `vite.config.ts` — dev middleware giờ phục vụ cả `/api/tts` (đọc được POST body) lẫn `/api/pronunciation`.

Khi deploy lên Vercel: không cần thêm biến môi trường mới (dùng lại 3 biến cũ), chỉ cần đảm bảo đã chạy SQL tạo bảng `tts_cache` ở bước 1.

### Cập nhật mã hóa AES-256-GCM (xem mục "⚠️ Cập nhật" ở trên)

- `api/_lib/ttsCrypto.ts` — **file mới**: suy ra khoá/iv AES-256 từ `text_hash` (HMAC-SHA256 +
  `TTS_ENCRYPTION_MASTER_KEY`), `encryptAudio()`, `getClientKeyMaterial()`, `isAuthenticatedRequest()`
  (kiểm tra JWT Supabase qua `getSupabaseAdmin().auth.getUser()`).
- `api/tts.ts` — nhánh `cache=true` giờ mã hóa audio trước khi upload; chỉ trả `key_b64`/`iv_b64`
  nếu request có Authorization hợp lệ.
- `src/lib/tts.ts` — gửi kèm `Authorization: Bearer <access_token>` khi gọi `/api/tts` với cache
  tĩnh; nhận `key_b64`/`iv_b64` thì tải ciphertext về và giải mã bằng `crypto.subtle` (Web Crypto)
  thành blob URL rồi mới phát; thiếu khoá hoặc giải mã lỗi → fallback giọng trình duyệt như cũ.
- `vite.config.ts` — thêm `TTS_ENCRYPTION_MASTER_KEY` vào danh sách biến nạp cho dev, và forward
  header `Authorization` vào Edge Function khi giả lập ở `npm run dev` (trước đây chỉ forward
  `content-type`).
