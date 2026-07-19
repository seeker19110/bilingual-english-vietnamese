# Kế hoạch + đặc tả: Rời khỏi Supabase (Auth + DB + Storage)

> Trạng thái: **Giai đoạn A ĐÃ XONG 100% (2026-07-20)** — PostgreSQL 16 tự host đã cài trên VPS, database `english_tutor` + user `tutor_app` đã tạo (14 bảng xác nhận đủ), `postgres/schema.sql` đã áp thành công (`npm run migrate:pg`), cron backup `pg_dump` hàng ngày đã thiết lập + test thành công. Đang chờ duyệt để bắt đầu Giai đoạn B (Auth.js).
> Quyết định 2026-07-19: app đang thử nghiệm, **bỏ qua migrate dữ liệu người dùng cũ** — Postgres mới bắt đầu từ schema rỗng. Điều này bỏ hẳn phần script di trú dữ liệu, giảm rủi ro lớn nhất của việc đổi hạ tầng.

## 0. Phạm vi & công nghệ thay thế đã chốt

| Thành phần Supabase                  | Thay bằng                                                        | Lý do                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Auth (email/password + Google OAuth) | **Auth.js (NextAuth)** tự host trên Express (`server.ts`)        | Miễn phí, không giới hạn user, hỗ trợ đúng 2 phương thức đang dùng                                   |
| Postgres + RLS                       | **PostgreSQL tự host trên VPS** hiện có (cùng máy đang chạy app) | Giữ nguyên họ Postgres → schema gần như không đổi cú pháp; RLS thay bằng kiểm quyền tay trong `api/` |
| Storage (audio cache mã hóa)         | **Cloudflare R2** (10GB miễn phí, không phí egress)              | Đã có sẵn lớp trừu tượng `api/_lib/fileStorage.ts` — chỉ cần thêm driver mới                         |

**Không đổi:** logic mã hóa AES-256-GCM (`api/_lib/ttsCrypto.ts`), logic gating "phải đăng nhập mới lấy được key giải mã", cấu trúc bảng nghiệp vụ (tên cột, jsonb...).

## 1. Kiểm kê hiện trạng (đã khảo sát mã nguồn thật, không đoán)

### 1.1 Auth

- Client: `src/lib/auth.ts` — `signUp`, `signInWithPassword`, `signInWithOAuth('google')`, `signOut`, `getSession()`.
- `src/context/AuthProvider.tsx` — lắng nghe `supabase.auth.onAuthStateChange`.
- `src/lib/authHeader.ts`, `src/lib/challengeCloud.ts` — lấy JWT từ session để gắn header `Authorization: Bearer`.
- Server: `api/_lib/security.ts` hàm `validateAuth(req)` — verify JWT bằng cách gọi `supabase.auth.getUser(token)` (round-trip mạng tới Supabase). Có `SKIP_AUTH=true` cho dev.
- `api/_lib/supabaseAdmin.ts` — service-role client, dùng cho verify auth + mọi query/storage phía server (bypass RLS).

### 1.2 Database — `supabase/schema.sql` (383 dòng, 16 migration đã áp)

Bảng: `profiles`, `chat_sessions`, `writing_submissions`, `speaking_sessions`, `daily_usage`, `tts_cache`, `pronunciations`, `learning_progress`, `push_subscriptions`, `challenge_entries`, `tutor_feedback`, `_schema_migrations`.

- Trigger `handle_new_user()` tự tạo `profiles` khi có user mới trong `auth.users`.
- RLS: mọi bảng user-owned có policy `auth.uid() = user_id`; `tts_cache`/`pronunciations` public-read/server-write.
- 2 hàm RPC nguyên tử: `consume_usage()`, `refund_usage()` (row-lock + increment), gọi qua `supabase.rpc()` từ `api/_lib/usage.ts`.
- **Query phía client (dùng anon key, dựa vào RLS để an toàn):** `src/lib/cloud.ts`, `progressSync.ts`, `mistakes.ts`, `onboarding.ts`, `challengeCloud.ts`, `tutorFeedback.ts` — đây là **thay đổi kiến trúc lớn nhất**: không còn RLS thì client KHÔNG được query DB trực tiếp nữa, phải chuyển hết qua API route ở server.
- **Query phía server (service-role, bypass RLS):** `api/_lib/usage.ts`, `api/push.ts`, `api/tts.ts`, `api/pronunciation.ts`, `api/leaderboard.ts`.

### 1.3 Storage

- `api/_lib/fileStorage.ts` đã có driver pattern qua biến `STORAGE_DRIVER` (`local` | mặc định Supabase) — **điểm nối tự nhiên để thêm driver `r2`**.
- `api/tts.ts`: hash(text+lang+voice+version) → tra `tts_cache` → miss thì gọi Google TTS → mã hóa AES-256-GCM (`ttsCrypto.ts`) → lưu qua `saveAudio()` → upsert `tts_cache`. Bắt buộc `validateAuth` mới trả key giải mã.
- `api/_lib/ttsCrypto.ts`: key/IV suy ra tất định từ `TTS_ENCRYPTION_MASTER_KEY` + hash — **không đổi**, vì logic này độc lập với nhà cung cấp storage.
- `api/pronunciation.ts`: giống hệt nhưng không mã hóa, bucket `pronunciations`.
- **Lưu ý quan trọng:** production hiện tại đã dùng `STORAGE_DRIVER=local` (lưu trên VPS), KHÔNG dùng Supabase Storage thật. Vì vậy phần Storage thực chất là thêm driver R2 thay `local`/`supabase`, không phải "di trú" dữ liệu đang có trên Supabase Storage.

### 1.4 Biến môi trường sẽ bị loại bỏ

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_DB_SSL_INSECURE`.

### 1.5 Deploy

VPS Ubuntu 24.04 + PM2 + Nginx, Node 22.22.3 (ghi chú: yêu cầu Node 22 vì `@supabase/supabase-js` cần WebSocket gốc — **ràng buộc này biến mất sau khi bỏ Supabase**, nhưng không hạ cấp Node vì lý do khác vẫn có thể còn).

---

## 2. Kiến trúc mới (tổng quan)

```
Browser (React)
   │  fetch, gửi cookie session (Auth.js) hoặc Bearer JWT tự ký
   ▼
Express server.ts + api/*  (Node 22, PM2, VPS)
   │  mọi query DB đi qua đây — không còn client query trực tiếp
   ▼
PostgreSQL tự host (cùng VPS, hoặc container riêng)   +   Cloudflare R2 (audio cache)
```

Nguyên tắc thay RLS: **mọi handler API tự kiểm `user_id` khớp với session trước khi query**, dùng một hàm helper dùng chung (`requireUser(req)` trả về `userId` đã xác thực) — thay cho `validateAuth` gọi Supabase.

---

## 3. Đặc tả chi tiết từng phần

### 3.1 PostgreSQL tự host

- Cài `postgresql` (bản ổn định mới nhất tại thời điểm làm — kiểm tra `apt-cache policy postgresql` trên VPS, không tự đoán version) qua `apt`, tạo DB `english_tutor`, user riêng (không dùng superuser cho app).
- Convert `supabase/schema.sql`:
  - Bỏ `auth.users` (Supabase-specific) → thêm bảng `users` tự quản (`id uuid pk`, `email unique`, `password_hash`, `name`, `created_at`).
  - Bỏ mọi `RLS POLICY` + `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
  - Bỏ trigger `handle_new_user()` trên `auth.users` → thay bằng: khi Auth.js tạo user mới, server tự `INSERT INTO profiles` trong cùng transaction (code, không phải DB trigger — dễ debug hơn).
  - Giữ nguyên toàn bộ bảng nghiệp vụ khác (tên cột, kiểu jsonb, index) — không có lý do đổi.
  - `consume_usage()`/`refund_usage()`: giữ làm Postgres function (Postgres thường vẫn hỗ trợ, không phải tính năng riêng của Supabase) — chỉ bỏ phần nào tham chiếu `auth.uid()`.
- `DATABASE_URL` thay cho `SUPABASE_DB_URL`, dùng thư viện `pg` (node-postgres) hoặc giữ Postgres.js nếu đang dùng — cần đọc `scripts/run-migrations.ts` để biết driver hiện tại và tái dùng.
- Backup: thêm cron `pg_dump` hàng ngày lên đúng chỗ lưu trữ đang có (hoặc R2!) — **DB tự host nghĩa là tự chịu trách nhiệm backup**, Supabase từng làm việc này miễn phí.

### 3.2 Auth.js (NextAuth) tự host trên Express

- App này là Vite SPA + Express, KHÔNG phải Next.js → dùng `@auth/express` (gói Auth.js chính thức cho Express, không phải bản Next-only) hoặc tự implement luồng OAuth/credentials tối giản nếu `@auth/express` chưa đủ ổn định — cần research-first (theo KHUNG 3) xác nhận version ổn định trước khi chọn.
- Provider cần: **Credentials** (email/password, tự hash bằng `bcrypt`/`argon2`, so khớp `password_hash`) + **Google OAuth**.
- Session: dùng **database session** (lưu bảng `sessions` trong Postgres cùng chỗ), KHÔNG dùng JWT-only, để có thể revoke (đăng xuất từ xa, khớp hành vi Supabase hiện tại).
- Server: thay `validateAuth()` trong `api/_lib/security.ts` — đọc cookie session (hoặc header) → tra bảng `sessions` → trả `userId`. Interface hàm giữ nguyên chữ ký để giảm chỗ phải sửa ở các handler gọi nó.
- Client: viết `src/lib/auth.ts` mới với cùng interface public (`register`, `login`, `loginWithGoogle`, `logout`, `getCurrentUser`) để `AuthProvider.tsx` và các nơi gọi không phải đổi nhiều — chỉ đổi bên trong triển khai.
- **Việc lớn nhất ở bước này:** chuyển toàn bộ query DB phía client (`src/lib/cloud.ts`, `progressSync.ts`, `mistakes.ts`, `onboarding.ts`, `challengeCloud.ts`, `tutorFeedback.ts`) thành gọi API route mới ở server (vì không còn RLS bảo vệ client query trực tiếp). Mỗi file này cần 1 route Express tương ứng, có `requireUser()` kiểm quyền tay.

### 3.3 Cloudflare R2

- **Quyết định 2026-07-19: chỉ dùng 1 tài khoản Cloudflare, 1 bucket R2** (không sharding nhiều tài khoản để né giới hạn free — vi phạm tinh thần ToS, không tương xứng công sức ở quy mô app hiện tại). Nếu sau này gần chạm 10GB, ưu tiên trả phí thêm dung lượng ($0.015/GB/tháng) hoặc bật LRU dọn cache cũ (xem dưới), không mở thêm tài khoản.
- Thêm driver `r2` vào `api/_lib/fileStorage.ts` cạnh `local`/`supabase` hiện có, dùng `@aws-sdk/client-s3` (R2 tương thích S3 API).
- Biến môi trường mới: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `STORAGE_DRIVER=r2`.
- Bucket **private** (không public read) — vì đã mã hóa AES-256-GCM ở tầng ứng dụng nên không bắt buộc private, nhưng vẫn nên để private làm lớp phòng thủ thứ hai (defense in depth).
- Logic `ttsCrypto.ts`, luồng `validateAuth` gate trước khi trả key giải mã: **giữ nguyên 100%**, không đổi.
- **Theo dõi dung lượng:** thêm mục nhỏ trong admin/log định kỳ (hoặc script tay chạy khi cần) đọc tổng dung lượng bucket qua R2 API, cảnh báo khi vượt ~8GB (80% ngưỡng free).
- **Cơ chế dọn cache (LRU) — làm ở GĐ D nếu còn thời gian, không bắt buộc ngay:** thêm cột `last_accessed_at` vào `tts_cache`/`pronunciations`, cập nhật mỗi lần cache hit; cron dọn định kỳ xóa entry lâu không dùng nhất khi tổng dung lượng gần ngưỡng. Đây là giải pháp bền vững thay vì mở thêm tài khoản.

---

## 4. Chia giai đoạn triển khai (mỗi giai đoạn = 1 PR riêng, có cổng duyệt)

1. ✅ **GĐ A — Hạ tầng nền (XONG 2026-07-19):** đã cài PostgreSQL 16 trên VPS, tạo database `english_tutor` + user riêng `tutor_app` (không dùng superuser), Postgres chỉ nghe `localhost` (không mở ra internet). `postgres/schema.sql` đã áp thành công qua `npm run migrate:pg`. Chưa đổi code app đang chạy — DB mới chạy song song, chưa có gì đọc/ghi vào đó. Cron backup `pg_dump` hàng ngày (3h sáng, giữ 7 bản gần nhất) đã thiết lập và test chạy tay thành công — **GĐ A hoàn tất 100%, không còn việc dang dở**.
2. **GĐ B — Auth.js thay Supabase Auth:** cài `@auth/express`, viết provider Credentials + Google, bảng `users`/`sessions`, viết lại `src/lib/auth.ts` + `api/_lib/security.ts`. App tạm thời vẫn dùng Supabase cho DB nghiệp vụ khác (auth tách biệt được vì code hiện đã module hóa qua `validateAuth`). _Kiểm tra:_ đăng ký/đăng nhập email + Google chạy được, JWT/session cũ Supabase không còn được chấp nhận.
3. **GĐ C — Chuyển toàn bộ bảng nghiệp vụ sang Postgres tự host + viết route API thay client-query:** từng bảng một (bắt đầu từ `daily_usage`/`profiles` vì nhiều nơi phụ thuộc nhất), thêm route Express + `requireUser()`, sửa `src/lib/cloud.ts` v.v. gọi API thay vì Supabase client trực tiếp. _Kiểm tra:_ mỗi bảng xong chạy được toàn bộ luồng liên quan (vd xong `daily_usage` → test đếm lượt đúng).
4. **GĐ D — Cloudflare R2 thay storage driver:** thêm driver `r2`, đổi `STORAGE_DRIVER=r2` trên `.env` VPS, test cache TTS + pronunciation qua R2.
5. **GĐ E — Dọn dẹp:** gỡ `@supabase/supabase-js` khỏi `package.json`, xóa toàn bộ biến `SUPABASE_*`, xóa `supabase/` (giữ lại schema cũ trong git history), cập nhật `docs/deploy-vps-ubuntu.md` + `CLAUDE.md` mục 6 (stack).

**Không làm gộp 1 PR** — mỗi giai đoạn deploy + xác nhận chạy ổn trên production trước khi sang giai đoạn kế, vì đây là hạ tầng lõi ảnh hưởng toàn app.

---

## 5. Các điểm đã chốt bổ sung (2026-07-19)

- **Email xác nhận đăng ký / quên mật khẩu: dùng Gmail SMTP** (`donghanhcungban.org@gmail.com`) qua `nodemailer` — cần tạo "Mật khẩu ứng dụng" (App Password) trong Google Account (bật 2FA trước), không dùng mật khẩu Gmail thường vì Google chặn SMTP login thường từ 2022. Biến môi trường mới: `GMAIL_USER`, `GMAIL_APP_PASSWORD`. Giới hạn ~500 email/ngày — đủ dư cho quy mô app hiện tại; nếu sau này tăng trưởng và chạm giới hạn/bị flag spam, chuyển sang Resend (đã đánh giá là phương án dự phòng).
- **Rate-limit đăng nhập:** thêm `express-rate-limit` trên route `/login`, `/register` (vd giới hạn 5 lần/15 phút/IP) ở GĐ B, mặc định không cần hỏi thêm.
- **Google OAuth Client ID/Secret mới:** việc tay của bạn trên Google Cloud Console (tạo OAuth Client mới, đổi callback URL từ domain Supabase sang `https://en-vi.donghanhcungban.com/api/auth/callback/google`) — AI sẽ nhắc cụ thể khi tới GĐ B, không tự làm được vì cần đăng nhập Google Console.
