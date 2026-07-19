# Kế hoạch + đặc tả: Rời khỏi Supabase (Auth + DB + Storage)

> Trạng thái: **Giai đoạn A ĐÃ XONG 100%** — PostgreSQL 16 tự host đã cài trên VPS, database `english_tutor` + user `tutor_app` đã tạo (14 bảng xác nhận đủ), `postgres/schema.sql` đã áp thành công (`npm run migrate:pg`), cron backup `pg_dump` hàng ngày đã thiết lập + test thành công.
> **Giai đoạn B + C (lõi): ĐÃ CUTOVER THÀNH CÔNG trên production (2026-07-20).** Auth tự viết (Bearer token, không dùng `@auth/express`) đã thay Supabase Auth hoàn toàn — đăng ký, đăng nhập email, đăng nhập Google, đăng xuất đều đã smoke test qua trên `en-vi.donghanhcungban.com`. 2 lỗi phát hiện lúc smoke test đã fix (PR #270): màn hình tối khi đăng xuất (thiếu `refresh()` sau `logout()`), CSP chặn script Google Identity Services. Google OAuth Client ID ban đầu gõ nhầm domain (`en-vn` thay vì `en-vi`) — đã tự sửa. `profiles`/`daily_usage`/`learning_progress` đã chuyển sang Postgres tự host, xác nhận hoạt động đúng (học từ vựng + F5 giữ tiến độ).
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

### 3.2 Auth tự viết (Bearer token) — ĐÃ SỬA so với đặc tả gốc (research-first 2026-07-20)

**Quyết định đã đổi:** KHÔNG dùng `@auth/express`. Research (đọc tài liệu authjs.dev/reference/express + @auth/pg-adapter) cho thấy Auth.js xây quanh **cookie session**, còn app hiện dùng **100% Bearer token trong header** (`authHeader.ts` gắn `Authorization: Bearer` vào mọi request — khớp kiểu SPA gọi API rời, giống hệt cách Supabase Auth đang hoạt động). Ép sang cookie đòi hỏi: sửa lại MỌI nơi gọi API (10+ file), đổi CORS sang whitelist origin cụ thể, và tự viết CSRF protection cho các route `api/*.ts` (không chạy qua middleware Auth.js). Bearer token miễn nhiễm CSRF theo thiết kế (trình duyệt không tự gắn header tùy ý). → Tự viết auth tối giản, tái dùng đúng bảng `users`/`sessions` đã tạo ở GĐ A.

- Provider: **Credentials** (email/password, hash bằng `bcryptjs` 12 rounds) + **Google** (Google Identity Services — client nhận ID token trực tiếp trong popup, KHÔNG redirect rời trang; server verify bằng `google-auth-library`).
- Session: token ngẫu nhiên 32 byte (`crypto.randomBytes`), CHỈ lưu **hash SHA-256** của token trong bảng `sessions` (không lưu token gốc — lộ DB không đồng nghĩa lộ token dùng được), hạn 30 ngày, revoke được (đăng xuất xóa row).
- Server: `api/_lib/authService.ts` (logic auth thuần) + `api/auth.ts` (handler `POST /api/auth` action `register`/`login`/`google`/`logout`, `GET /api/auth?action=me`). `validateAuth()` trong `api/_lib/security.ts` đổi từ gọi Supabase sang tra bảng `sessions` qua `api/_lib/pgPool.ts` (Pool `pg` mới, dùng `DATABASE_URL`) — **chữ ký hàm giữ nguyên**, không phải sửa 10+ handler khác đang gọi `validateAuth()`.
- Client: viết lại `src/lib/auth.ts` + `src/lib/authHeader.ts` (token lưu `localStorage`, đồng bộ đa tab qua sự kiện `storage`) — giữ nguyên interface public (`register`, `login`, `loginWithGoogle`, `logout`, `getCurrentUser`) nên `AuthProvider.tsx`/`Login.tsx` chỉ sửa phần gọi Google (không còn redirect, trả `AppUser` trực tiếp).
- Test: `api/_lib/authService.test.ts` (7 test — hash/verify mật khẩu, session hết hạn, email trùng khi đăng ký).
- **Việc CÒN LẠI trước khi có thể deploy GĐ B lên production (đã gộp 1 phần GĐ C vào đây):** luồng đăng ký/đăng nhập cần tạo `profiles` — đã làm (`ensureProfileRow` trong `authService.ts`, dùng Postgres mới trực tiếp, không qua Supabase). Nhưng **toàn bộ query DB khác phía client** (`src/lib/cloud.ts`, `progressSync.ts`, `mistakes.ts`, `onboarding.ts`, `challengeCloud.ts`, `tutorFeedback.ts`) **vẫn đang gọi Supabase client dựa vào RLS `auth.uid()`** — một khi cutover, KHÔNG còn Supabase session nên các lời gọi này sẽ bị RLS chặn hết. Đây chính là phần lõi còn lại của GĐ C, PHẢI xong tối thiểu các route quan trọng nhất (`daily_usage`, `learning_progress`) trước khi cutover, nếu không người dùng đăng nhập được nhưng mất lịch sử/tiến độ ngay lập tức.

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
- **Rate-limit đăng nhập:** ĐÃ LÀM khác kế hoạch — tái dùng `checkRateLimit()` in-memory sẵn có trong `api/_lib/security.ts` (10 request/phút/IP cho toàn bộ `/api/auth`) thay vì thêm thư viện `express-rate-limit` mới — không cần thêm dependency, cùng cơ chế các route khác (`tts`, `leaderboard`...) đang dùng.
- **Google OAuth Client ID mới:** việc tay của bạn trên Google Cloud Console — nhưng **ĐÃ ĐỔI CÁCH LÀM** so với kế hoạch gốc: dùng **Google Identity Services** (client-side popup, KHÔNG redirect qua server) nên **KHÔNG cần khai báo Redirect URI** — chỉ cần khai **Authorized JavaScript origin** = domain app (`https://en-vi.donghanhcungban.com`). Xem hướng dẫn lấy Client ID ở mục 7 bên dưới.
- **Email xác nhận đăng ký / quên mật khẩu (Gmail SMTP): CHƯA LÀM trong GĐ B này** — code hiện tại đăng ký xong đăng nhập được NGAY, không gửi email xác thực, chưa có luồng "quên mật khẩu". Đây là thiếu sót cần bổ sung trước khi cutover production (không thể để người dùng thật không có cách khôi phục mật khẩu).

## 6. File đã tạo/sửa ở Giai đoạn B (2026-07-20, chưa deploy)

**Mới:** `api/_lib/pgPool.ts`, `api/_lib/authService.ts`, `api/_lib/authService.test.ts`, `api/auth.ts`.
**Sửa:** `api/_lib/security.ts` (`validateAuth`), `src/lib/auth.ts`, `src/lib/authHeader.ts`, `src/context/AuthProvider.tsx`, `src/pages/Login.tsx` (Google Sign-In), `server.ts` (đăng ký route `/api/auth`), `package.json` (thêm `bcryptjs`, `google-auth-library`; chuyển `pg` từ devDependencies sang dependencies), `.env.example` (`GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID`), `src/vite-env.d.ts`.
**Trạng thái kiểm tra:** build ✅ · typecheck ✅ · lint (0 cảnh báo) ✅ · test 574/574 ✅.

## 7. Việc tay bạn cần làm trước khi cutover Giai đoạn B

1. Tạo **Google OAuth Client ID** tại [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create Credentials → OAuth client ID → Application type **Web application** → Authorized JavaScript origins: `https://en-vi.donghanhcungban.com` (và `http://localhost:5173` nếu muốn test dev) → KHÔNG cần điền Redirect URI. Copy Client ID, điền **CẢ 2 biến** `GOOGLE_CLIENT_ID` và `VITE_GOOGLE_CLIENT_ID` trong `.env` trên VPS (cùng giá trị).
2. Xác nhận **chấp nhận reset toàn bộ tài khoản người dùng hiện có** khi cutover (đã xác nhận 2026-07-20) — không có bước nào khác cần làm thêm cho việc này vì app đang thử nghiệm.

## 8. Giai đoạn C (lõi tối thiểu): profiles + daily_usage + learning_progress — ĐÃ XONG (2026-07-20)

**Phạm vi đã làm** (đủ để không vỡ tính năng khi cutover Auth, KHÔNG phải toàn bộ GĐ C):

- `api/_lib/usage.ts`: đổi từ Supabase RPC (`consume_usage`/`refund_usage` qua PostgREST) sang gọi thẳng 2 hàm SQL cùng tên trên Postgres tự host qua `pg` — đã có sẵn từ `postgres/schema.sql` (Giai đoạn A). Bỏ luôn nhánh dự phòng "fallback non-atomic" (không cần nữa vì hàm SQL luôn tồn tại). Test viết lại toàn bộ (`api/_lib/usage.test.ts`, mock `pgPool` thay Supabase).
- `api/profile.ts` (route mới): `GET /api/profile` (đọc plan/onboarded/user_level/goal/daily_minutes, tự tạo profile nếu chưa có), `POST /api/profile` (lưu kết quả onboarding). Thay `ensureProfile()`/`saveOnboarding()`/`fetchOnboarding()` trong `src/lib/cloud.ts` + `src/lib/onboarding.ts` vốn gọi thẳng Supabase client qua RLS.
- `api/progress.ts` (route mới): `GET`/`POST /api/progress` — đọc/ghi toàn bộ `learning_progress` (learned/hard/srs/cefr_*/placement/weekly_goal/achievements). Thay `pushProgress()`/`pullProgress()` trong `src/lib/progressSync.ts`.
- Dọn dẹp: xóa hẳn `ensureProfile()` (không còn ai gọi sau khi `auth.ts` viết lại ở GĐ B), bỏ tham số `userId` thừa khỏi `saveOnboarding()` (2 nơi gọi `Onboarding.tsx`/`Placement.tsx` đã cập nhật theo).
- Test: viết lại `src/lib/onboarding.test.ts` (mock `fetch` thay Supabase client).
- **Kiểm tra:** build ✅ · typecheck ✅ · lint (0 cảnh báo) ✅ · test 571/571 ✅.

**CÒN LẠI ngoài phạm vi lõi tối thiểu** (chưa làm, liệt kê để không quên trước khi coi GĐ C xong hẳn):

- `src/lib/cloud.ts` — `pushChatSession`/`pushSpeakingSession`/`pushWritingSub`/`pullUserData` (lịch sử chat/viết/nói) vẫn gọi Supabase client trực tiếp.
- `api/leaderboard.ts` — đọc/ghi `profiles`(nickname, league_opt_in)/`daily_usage`/`challenge_entries` qua `getSupabaseAdmin()`, chưa đổi sang `pgPool`.
- `src/lib/challengeCloud.ts`, `src/lib/tutorFeedback.ts` — chưa đổi.
- `src/lib/mistakes.ts` — KHÔNG cần đổi (chủ động chỉ dùng localStorage, không đụng Supabase — xem comment đầu file).

## 9. Trạng thái tổng thể trước khi cutover thật (deploy `.env` production)

Sau mục 8, phần LÕI (đăng nhập + đếm lượt dùng AI + tiến độ học từ vựng) đã an toàn để cutover — đây là 3 tính năng quan trọng nhất. Phần CÒN LẠI ở mục 8 (lịch sử chat/viết/nói, bảng xếp hạng, thử thách, feedback AI) sẽ **mất đồng bộ cloud tạm thời** sau cutover cho tới khi làm nốt — dữ liệu vẫn còn ở localStorage từng máy, không mất hẳn, chỉ không đồng bộ đa thiết bị.

> **ĐÃ CUTOVER trên production 2026-07-20** — xác nhận qua smoke test thật: đăng ký, đăng nhập email, đăng nhập Google, đăng xuất, học từ vựng + F5 giữ tiến độ. 2 lỗi phát hiện lúc smoke test đã fix (PR #270): màn hình tối khi đăng xuất, CSP chặn Google Identity Services. Google OAuth Client ID gõ nhầm domain lúc đầu (`en-vn` → `en-vi`) — đã tự sửa trên Google Cloud Console. Lỗi Chat 502 phát hiện lúc test là do hết quota/billing API AI (không liên quan migration) — người dùng chủ động gác lại, không chặn cutover.

## 10. Giai đoạn D — Cloudflare R2 (code đã xong, chưa deploy)

Đã thêm driver `r2` vào `api/_lib/fileStorage.ts` (`STORAGE_DRIVER=r2`), dùng `@aws-sdk/client-s3` (R2 tương thích S3 API).

**Sửa 1 điểm so với đặc tả gốc (mục 3.3):** đọc kỹ `api/tts.ts`/`api/pronunciation.ts` mới phát hiện `audio_url` trả thẳng cho client và **trình duyệt fetch trực tiếp, không qua xác thực** — bảo mật thật nằm ở khóa giải mã AES-256-GCM (chỉ trả sau khi `validateAuth`), không nằm ở việc chặn tải file thô (file `pronunciations` còn không hề mã hóa, vốn thiết kế public-read từ đầu). Vì vậy **bucket R2 PHẢI để public-read** (bật "Public access" trên Cloudflare Dashboard) — khác với đặc tả gốc ghi "private" (sai, đã sửa).

- Key trong bucket = `{bucket cũ}/{fileName}` (vd `tts-cache/en-US/female/<hash>.mp3`) — dùng 1 bucket Cloudflare duy nhất, phân vùng bằng tiền tố, không cần tạo nhiều bucket.
- Biến môi trường mới: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` — xem `.env.example`.
- Test: `api/_lib/fileStorage.test.ts` (3 test — thiếu biến môi trường bắt buộc, upload đúng key + URL không lỗi dấu `/`).
- **Kiểm tra:** build ✅ · typecheck ✅ · lint (0 cảnh báo) ✅ · test 574/574 ✅.
- **CHƯA làm:** cơ chế LRU dọn cache khi gần ngưỡng 10GB (đã có cột `last_accessed_at` sẵn trong `postgres/schema.sql` từ trước, chưa viết cron dùng tới) — không bắt buộc ngay, làm khi thật sự cần theo dõi dung lượng.

### Việc tay cần làm trên VPS để bật Giai đoạn D

1. Tạo tài khoản Cloudflare (email riêng, không gắn GitHub/Google cá nhân — đã bàn ở phần trước).
2. Cloudflare Dashboard → R2 → tạo bucket (vd `english-tutor-audio`) → bật **Public access** (nhận domain dạng `pub-xxxxxxxx.r2.dev`, hoặc gắn domain riêng).
3. R2 → Manage R2 API Tokens → tạo token có quyền Object Read & Write cho đúng bucket → lấy `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
4. Điền 5 biến vào `.env` VPS (mẫu trong `.env.example`), đổi `STORAGE_DRIVER=local` → `STORAGE_DRIVER=r2`.
5. `git pull && npm ci && npm run build && pm2 restart english-tutor`.
6. Smoke test: mở 1 trang có audio (vd Từ điển tra 1 từ, hoặc trang Luyện nói), xác nhận nghe được — kiểm tra Cloudflare Dashboard → R2 → bucket thấy file mới xuất hiện.
