# Hướng dẫn setup: Cache Phát Âm Từ Điển

Code đã viết xong (xem mục "Đã đổi gì" ở cuối file). Phần còn lại là **bạn tự làm trên 2 trang web** (Supabase, Google Cloud) — mình không đăng nhập hộ được vì cần tài khoản của bạn.

---

## 1. Supabase

### 1a. Lấy URL + Service Role Key

Nếu chưa có project Supabase: vào https://supabase.com → New Project (chọn tên, mật khẩu database, region gần VN như Singapore).

Project đã có rồi thì vào **Project Settings → API**, lấy 2 giá trị:

- **Project URL** → dán vào `SUPABASE_URL` trong file `.env`
- **service_role key** (mục "Project API keys", bấm "Reveal") → dán vào `SUPABASE_SERVICE_ROLE_KEY` trong `.env`

⚠️ service_role key có toàn quyền với database — không đưa cho ai, không commit lên Git (file `.env` đã có trong `.gitignore` nên an toàn).

### 1b. Tạo bảng — vào SQL Editor, dán đoạn này, bấm Run

```sql
create table pronunciations (
  id         uuid primary key default gen_random_uuid(),
  word       text not null,
  voice      text not null default 'female', -- 'female' | 'male'
  audio_url  text not null,
  lang       text not null default 'en-US',
  created_at timestamp with time zone default now(),
  unique (word, voice) -- 1 từ có thể có nhiều dòng, mỗi dòng 1 giọng khác nhau
);

create index idx_pronunciations_word on pronunciations(word);
```

> Đã tạo bảng theo hướng dẫn cũ (chỉ unique theo `word`, chưa có cột `voice`)? Chạy thêm đoạn
> này để nâng cấp bảng cũ lên hỗ trợ nhiều giọng, không mất dữ liệu đã cache:
>
> ```sql
> alter table pronunciations add column voice text not null default 'female';
> alter table pronunciations drop constraint pronunciations_word_key;
> alter table pronunciations add constraint pronunciations_word_voice_key unique (word, voice);
> ```

### 1c. Tạo Storage bucket

Vào **Storage → New bucket**:

- Name: `pronunciations` (phải gõ đúng tên này, code đang gọi đúng tên này)
- Public bucket: **BẬT** (để browser phát được audio trực tiếp từ URL)

---

## 2. Google Cloud Text-to-Speech

1. Vào https://console.cloud.google.com → tạo project mới (hoặc dùng project có sẵn).
2. Vào **APIs & Services → Library**, tìm "Cloud Text-to-Speech API" → bấm **Enable**.
3. Vào **APIs & Services → Credentials → Create Credentials → API key**.
4. Copy key → dán vào `GOOGLE_TTS_API_KEY` trong `.env`.

> Lưu ý: Google Cloud yêu cầu gắn thẻ thanh toán (billing) để dùng API, nhưng có hạn mức free hằng tháng (~4 triệu ký tự với giọng Standard, ít hơn với giọng Journey đang dùng trong code — xem mục Chi phí trong `PRONUNCIATION_CACHE_SPEC.md`). Nên giới hạn quyền của key (API restrictions) chỉ cho "Cloud Text-to-Speech API" để an toàn hơn.

---

## 3. Điền `.env`

File `.env` đã có sẵn 3 dòng trống, chỉ cần điền giá trị:

```env
SUPABASE_URL=https://imqkoedcottaanvrzldn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcWtvZWRjb3R0YWFudnJ6bGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDkyNjEsImV4cCI6MjA5NzQ4NTI2MX0.Hs_gvun-zDzBp1PqSxzDiQFN-A4z0SbKu4fLF4l8DJU
GOOGLE_TTS_API_KEY=AIza...
```

---

## 4. Chạy thử

```bash
npm run dev
```

Mở http://localhost:5173/dictionary, bấm nút loa cạnh 1 từ. Lần đầu sẽ chậm vài giây (đang tạo audio mới), bấm lại từ đó (load lại trang) sẽ nhanh ngay vì đã có cache trong Supabase. Mỗi từ có 2 nút nhỏ "Nữ"/"Nam" để chọn giọng trước khi bấm loa.

Test nhanh endpoint bằng tay (xem JSON trả về):

```
http://localhost:5173/api/pronunciation?word=apple
http://localhost:5173/api/pronunciation?word=apple&voice=male
```

---

## 5. (Tùy chọn) Tạo trước âm thanh cho cả từ điển — `npm run seed:pronunciation`

Bình thường audio chỉ được tạo khi có người bấm nút loa lần đầu (chậm vài giây). Nếu muốn tạo trước cho TOÀN BỘ ~8800 từ trong `src/data/dictionary.json` (để ai bấm cũng nhanh ngay từ đầu), chạy script này 1 lần — xem chi tiết trong `SEED_SCRIPT_SPEC.md`.

```bash
npm run seed:pronunciation
```

- Script tạo **cả 2 giọng (nữ + nam)** cho mỗi từ, vì nút loa trong app cho học viên chọn giọng. Tự bỏ qua (từ, giọng) đã có trong DB → **chạy lại bình thường nếu bị dừng giữa chừng (Ctrl+C, mất mạng...), không bị tạo trùng**.
- Hiện thanh tiến độ ngay trong terminal. ~8800 từ × 2 giọng ước tính khoảng 70–90 phút (gấp đôi mục Ước tính thời gian trong `SEED_SCRIPT_SPEC.md`, vì spec gốc chỉ tính 1 giọng).
- Từ bị lỗi (nếu có) được ghi vào `scripts/seed-errors.json`, retry bằng:
  ```bash
  WORDS_FILE=scripts/seed-errors.json npm run seed:pronunciation
  ```
- ⚠️ Lưu ý chi phí/hạn mức: xem mục 8 trong `SEED_SCRIPT_SPEC.md` — với ~8800 từ thì vẫn nằm trong free tier của cả Google TTS và Supabase Storage. **Lưu ý: giờ seed 2 giọng nên tốn gấp đôi số lượt gọi TTS/dung lượng Storage so với khi tính toán ban đầu (1 giọng) — kiểm tra lại hạn mức nếu thấy sát ngưỡng free tier.**

---

## Đã đổi gì trong code

File `PRONUNCIATION_CACHE_SPEC.md` viết theo kiểu Next.js (`app/api/.../route.ts`), nhưng project này là **Vite + Vercel Functions** (giống `api/claude.ts` đã có), nên đã chuyển thành:

- `api/pronunciation.ts` — Vercel Edge Function chính (gộp logic, theo phong cách `api/claude.ts`)
- `api/_lib/googleTts.ts` — gọi Google TTS (tiền tố `_` để Vercel không coi là 1 route riêng)
- `api/_lib/supabaseAdmin.ts` — Supabase client phía server (service role key)
- `vite.config.ts` — thêm middleware để `/api/pronunciation` chạy được luôn lúc `npm run dev`, không cần deploy lên Vercel mới test được
- `src/components/PronounceButton.tsx` — nút loa (thay cho `WordCard.tsx` trong spec, vì trang Từ điển đã có layout riêng)
- `src/pages/Dictionary.tsx` — gắn nút loa vào mỗi từ
- Cài thêm package `@supabase/supabase-js` và `@types/node` (devDependency, cho TypeScript hiểu code server)
- `.env` / `.env.example` — thêm 3 biến `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_TTS_API_KEY`
- `scripts/seed-pronunciations.ts` — script tạo trước âm thanh cho cả từ điển (theo `SEED_SCRIPT_SPEC.md`), tái dùng lại `api/_lib/googleTts.ts` + `api/_lib/supabaseAdmin.ts` (không viết lại logic TTS/Supabase lần 2)
- Cài thêm package `tsx`, `dotenv`, `cli-progress`, `@types/cli-progress` (devDependency, chỉ phục vụ script seed, không ảnh hưởng app)
- Thêm lệnh `npm run seed:pronunciation` trong `package.json`
- **Hỗ trợ nhiều giọng (nữ/nam):** `api/_lib/googleTts.ts` có bảng `VOICE_MAP` (nữ = `en-US-Journey-F`, nam = `en-US-Journey-D`), bảng `pronunciations` đổi unique key từ `word` sang `(word, voice)`, `api/pronunciation.ts` nhận thêm `?voice=female|male`, `PronounceButton.tsx` có 2 nút nhỏ để chọn giọng, `scripts/seed-pronunciations.ts` tạo trước cả 2 giọng cho mỗi từ.

Khi deploy lên Vercel: vào Project Settings → Environment Variables, thêm 3 biến trên (giống cách bạn đã làm với `ANTHROPIC_API_KEY`).
