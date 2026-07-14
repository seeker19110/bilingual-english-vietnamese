# Setup: Cache Phát Âm Từ Điển

Khi bấm nút loa ở trang Từ điển: lần đầu gọi Google Cloud TTS tạo audio + lưu cache,
lần sau đọc thẳng từ cache (nhanh, không tốn tiền). Code đã xong — phần dưới là việc
cần làm trên Supabase + Google Cloud.

## 1. Supabase

### 1a. Lấy URL + Service Role Key

**Project Settings → API**:

- **Project URL** → `SUPABASE_URL` trong `.env`
- **service_role key** (bấm "Reveal") → `SUPABASE_SERVICE_ROLE_KEY` trong `.env`

⚠️ service_role key có toàn quyền DB — không đưa cho ai, không commit Git (`.env` đã trong `.gitignore`).

### 1b. Tạo bảng

Bảng `pronunciations` nằm trong `supabase/schema.sql` (nguồn sự thật duy nhất của
schema, mục "6a. pronunciations") — copy toàn bộ file, chạy trong SQL Editor.
An toàn khi chạy lại nhiều lần.

Cột `voice` nhận 4 giá trị: `female` | `female2` | `male` | `male2` (giọng Google
Chirp 3 HD). Cột `voice_version` đánh dấu đời giọng — đổi giọng trong
`api/_lib/googleTts.ts` sẽ tự làm cache cũ hết hạn (tạo lại, không cần xoá tay).

### 1c. Storage bucket — chỉ cần nếu dùng `STORAGE_DRIVER=supabase`

Mặc định app lưu audio trên **ổ cứng VPS** (`STORAGE_DRIVER=local`, xem `.env.example`),
không cần bucket Supabase. Nếu muốn chuyển sang lưu ở Supabase Storage: tạo bucket
tên `pronunciations`, **Public: BẬT**, rồi đặt `STORAGE_DRIVER=supabase` (hoặc để trống).

## 2. Google Cloud Text-to-Speech

1. https://console.cloud.google.com → tạo/chọn project.
2. **APIs & Services → Library** → tìm "Cloud Text-to-Speech API" → **Enable**.
3. **APIs & Services → Credentials → Create Credentials → API key**.
4. Copy key → `GOOGLE_TTS_API_KEY` trong `.env`.

> Cần gắn billing nhưng có free tier hằng tháng. Nên giới hạn API key chỉ cho Cloud
> Text-to-Speech API (API restrictions).

## 3. Biến `.env` cần có

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_TTS_API_KEY=...
```

## 4. Chạy thử

```bash
npm run dev
```

Mở `/dictionary`, bấm nút loa cạnh 1 từ — có 4 nút nhỏ chọn giọng. Lần đầu chậm vài
giây (tạo audio mới), tra lại từ đó sẽ nhanh (đã cache).

Endpoint `GET /api/pronunciation?word=apple&voice=female` **yêu cầu đăng nhập**
(gửi kèm Bearer token Supabase) — không test được bằng cách dán thẳng URL vào
trình duyệt khi chưa đăng nhập.

## 5. (Tuỳ chọn) Tạo trước audio cho cả từ điển

Cách khuyên dùng — có báo cáo tiến độ + menu chọn việc, xem `docs/seed-guide.md`:

```bash
npm run seed:all
```

Hoặc chạy riêng script phát âm (chi tiết: `SEED_SCRIPT_SPEC.md`):

```bash
npm run seed:pronunciation
```

- Tạo 2 giọng cơ bản (`female`/`male`) cho mỗi từ trong `public/data/dictionary/chunk-*.json`.
  Tự bỏ qua (từ, giọng) đã có → chạy lại an toàn nếu bị dừng giữa chừng.
- Từ lỗi ghi vào `scripts/seed-errors.json`, retry bằng:
  ```bash
  WORDS_FILE=scripts/seed-errors.json npm run seed:pronunciation
  ```

## Ghi chú code

- `api/pronunciation.ts` — Edge Function chính (kiểm cache → gọi TTS → lưu file → lưu DB).
- `api/_lib/googleTts.ts` — gọi Google TTS, bảng `VOICE_MAP` (giọng Chirp 3 HD).
- `api/_lib/fileStorage.ts` — `saveAudio()`, tự chọn lưu local (VPS) hay Supabase Storage theo `STORAGE_DRIVER`.
- `api/_lib/supabaseAdmin.ts` — Supabase client phía server (service role key).
- `vite.config.ts` — middleware gọi thẳng `api/pronunciation.ts` lúc `npm run dev`.
- `src/components/PronounceButton.tsx` — nút loa (chọn giọng) trong `src/pages/Dictionary.tsx`.
- `scripts/seed-pronunciations.ts` — seed hàng loạt, tái dùng logic từ `api/_lib/`.

Deploy: dự án chạy trên **VPS** (không phải Vercel) — các biến trên khai trong file
`.env` cạnh `server.ts`, xem `docs/deploy-vps-ubuntu.md`.
