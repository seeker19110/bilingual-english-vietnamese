# Setup: Đồng bộ Supabase (chat / viết / nói / lượt dùng)

> Mục tiêu: đăng nhập một lần, mọi máy/trình duyệt đều thấy cùng lịch sử học và
> số lượt còn lại. Trước đây dữ liệu chỉ nằm trong trình duyệt (localStorage) nên
> đổi máy là mất.

## Bước 1 — Tạo bảng trong Supabase (1 lần duy nhất)

1. **Supabase Dashboard** → chọn project → **SQL Editor** → **New query**.
2. Mở `supabase/schema.sql`, copy toàn bộ, dán vào ô query, bấm **Run**.

> File này tạo các bảng chính (`profiles`, `chat_sessions`, `writing_submissions`,
> `speaking_sessions`, `daily_usage`, `tts_cache`, `pronunciations`, `learning_progress`,
> `push_subscriptions`, `challenge_entries`...) và bật **Row Level Security**: mỗi
> người chỉ đọc/ghi được dữ liệu của chính mình (`tts_cache`/`pronunciations` cho đọc
> công khai — audio dùng chung). An toàn khi chạy lại nhiều lần.

Có migration mới hơn (`supabase/migrations/NNNN_*.sql`)? Chạy `npm run migrate`
(cần biến `SUPABASE_DB_URL`, xem `.env.example`) hoặc dán tay từng file vào SQL Editor —
xem `supabase/migrations/README.md`.

## Bước 2 — Đặt biến môi trường

Trên VPS: file `.env` cạnh `server.ts` (xem `docs/deploy-vps-ubuntu.md`). Lúc dev:
file `.env` ở gốc dự án.

| Biến | Dùng ở đâu | Lấy ở đâu |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Frontend (login + đồng bộ) | Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Project Settings → API → `anon`/`public` key |
| `GEMINI_API_KEY` / `GROQ_API_KEY` / `ANTHROPIC_API_KEY` | Server (gọi AI) — cần ít nhất 1 trong 3 | xem `.env.example` |

⚠️ Hai biến `VITE_*` **bắt buộc có tiền tố `VITE_`** thì frontend mới đọc được. Thiếu
thì đăng nhập luôn báo sai dù mật khẩu đúng. Sau khi thêm biến, khởi động lại app
(VPS: `pm2 restart english-tutor --update-env`; dev: tắt/chạy lại `npm run dev`).

(Tuỳ chọn — cache phát âm từ điển: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`GOOGLE_TTS_API_KEY`, xem `PRONUNCIATION_CACHE_SETUP.md`. Cache câu/hội thoại
(`tts_cache`) dùng chung các biến này + `TTS_ENCRYPTION_MASTER_KEY` để mã hoá —
xem `.env.example`.)

## Bước 3 — Kiểm tra

1. Mở app, **đăng ký** một tài khoản mới.
2. **Supabase → Table Editor → `profiles`**: phải thấy 1 dòng mới.
3. Chat vài câu → **Table Editor → `chat_sessions`**: thấy phiên chat vừa tạo.
4. Đăng nhập cùng tài khoản trên máy/trình duyệt khác: lịch sử + lượt dùng hiện lại
   y hệt → đồng bộ thành công.

## Cách hoạt động (cho người mới)

- `localStorage` vẫn là bộ nhớ đệm để app chạy nhanh/offline.
- Mỗi lần lưu (chat/viết/nói/lượt), app đẩy bản ghi lên Supabase ngầm — `src/lib/cloud.ts`.
- Khi mở trang, app kéo dữ liệu mới nhất từ Supabase về — `src/lib/useCloudSync.ts`.
- Mọi dữ liệu gắn với `user_id` = id tài khoản Supabase, được RLS bảo vệ.

## Nâng cấp Pro

**Table Editor → `profiles`**, sửa cột `plan` từ `free` thành `pro`. App tự nới giới
hạn lượt khi người đó đăng nhập lại. (Dự án hiện đang miễn phí cho cộng đồng, chưa
làm thanh toán tự động — xem `CLAUDE.md` mục 13.)
