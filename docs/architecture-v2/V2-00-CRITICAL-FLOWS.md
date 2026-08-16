# V2-00 (tiếp) — Trace 8 critical flows + risk register + apps/hub

Status: lượt 2 — đóng M1/S2, M1/S3, phần lớn M1/S4 (mục "chưa đóng" bên dưới), đọc `apps/hub/`.
Date: 2026-08-16. Nguồn: đọc trực tiếp `server.ts`, `api/*.ts`, `packages/core-*/*.ts` tại commit
`c0fabd1` — mọi đường dẫn/tên hàm dưới đây lấy từ `grep`/`Read` thật, không suy đoán.

Tài liệu này bổ sung cho `V2-00-BASELINE-OWNERSHIP-MAP.md` (lượt 1, giữ nguyên không sửa) — gộp
cả hai mới coi là V2-00 đầy đủ.

## 1. Trace 8 critical flows

Định dạng mỗi luồng: `client → route (server.ts) → handler (api/*) → service/DB → response`.
Tất cả handler đều là `export default async function handler(req: Request): Promise<Response>`
kiểu edge-style, được bọc bởi `wrapEdge()` trong `server.ts` để chạy trên Express.

### 1.1 Auth (đăng nhập/đăng ký)

`apps/english/src/lib/auth.ts` (client) → `POST/GET /api/auth` (`server.ts:191`) →
`api/auth.ts` `handler()` → theo `action` trong body, gọi 1 trong các hàm
`packages/core-auth/authService.ts` (`createUserWithPassword` / `verifyUserPassword` /
`verifyGoogleIdToken`+`findOrCreateGoogleUser` / tương tự Facebook/Apple/Microsoft) →
`createSession()` ghi `public.sessions` + set cookie `session_token`
(`packages/core-auth/sessionCookie.ts`) → `ensureProfileRow()` ghi/đọc `public.profiles` →
response JSON `{ user }`. Đăng ký mới còn gọi `grantSignupTrial()` (`api/_lib/trial.ts`, ghi
`entitlements`) và `isEmailVerified()`/`sendVerificationCode()` (`packages/core-auth/
emailVerification.ts`, bảng `email_verifications`). Rate limit qua `checkRateLimit()`
(`security.ts`, in-memory theo IP — **không có Redis khi chạy nhiều tiến trình**, đúng nợ kỹ
thuật đã ghi ở CLAUDE.md mục 13 việc-dở-2).
**Bảng chạm:** `public.users`, `public.sessions`, `public.profiles`, `public.identities`,
`public.email_verifications`, `public.entitlements`.
**Không có business logic ở client** — mọi verify token/password đều server-side, đúng nguyên
tắc bất biến #2 CLAUDE.md.

### 1.2 Chat (chế độ 1 — chat tổng hợp)

Client gửi tin nhắn → `POST /api/agent` (`server.ts:187`) → `packages/core-ai/ai.ts`
`handler()` → `validateAuth()` lấy `user_id` từ cookie (không tin client) →
`checkAndConsumeUsage()` (`core-billing/usage.ts`, đọc/ghi `public.daily_usage` — đếm lượt
TRƯỚC khi gọi AI) → gọi provider theo thứ tự fallback: `callGroqChat()` → nếu lỗi
`callAnthropicChat()` → nếu lỗi `callGemini()` (`chatProviders.ts` + `api/_lib/geminiApi.ts`) →
nếu cả 3 lỗi, `refundUsage()` hoàn lượt vừa trừ → response stream/JSON. Có
`createRequestId()`/`createRequestLogger()`/`incrementCounter()`/`recordLatency()`
(`core-db/{requestId,logger,metrics}.ts`) gắn vào mọi log/metric của request này (Phase 01,
đã có sẵn — xem mục 6 tài liệu lượt 1). `withConcurrencyLimit()` giới hạn số request AI đồng
thời (bảo vệ chi phí/rate limit provider).
**Bảng chạm:** `public.daily_usage` (đếm lượt), `english.chat_sessions` (lưu lịch sử — qua
`history.ts`/client gọi riêng, không trong cùng request `/api/agent`).
**Điểm rủi ro:** logic hoàn lượt khi provider lỗi (35 test ghim hành vi ở `ai.test.ts`, xem
`PROGRESS.md`) — bất kỳ refactor AIProvider gateway thống nhất (Phase 01 mục 3) đụng vào đây
đều phải giữ nguyên hành vi refund, đã ghi rõ ở tài liệu lượt 1.

### 1.3 Speaking (chế độ 3 — luyện nói song ngữ, TTS 2 giọng + STT)

Client ghi âm (`MediaRecorder`) → base64 → `POST /api/stt` (`server.ts:108`, route riêng NGOÀI
danh sách `app.all` vì cần `express.json({ limit: '10mb' })` khác mặc định `64kb`) →
`packages/core-ai/stt.ts` `sttHandler` → Groq Whisper (`GROQ_API_KEY` có) hoặc OpenAI
(`openaiStt.ts`) → trả text. Sau đó client gọi AI (luồng 1.2) lấy câu trả lời + giải thích →
`POST /api/tts` (`server.ts:186`) → `packages/core-ai/tts.ts` `ttsHandler` → kiểm cache
`public.tts_cache` (khoá theo text+voice+lang) → cache hit: giải mã AES-256-GCM
(`fileStorage.ts`) trả file → cache miss: gọi Google Cloud TTS (chính) hoặc ElevenLabs (giọng
VIP, `elevenLabsTts.ts`) hoặc Gemini TTS dự phòng (`geminiTts.ts`) → mã hoá + lưu
`fileStorage` (local hoặc R2 tuỳ `STORAGE_DRIVER`) + ghi `public.tts_cache` +
`public.tts_cache_stats`/`tts_cache_audit` → trả audio. Route riêng
`/api/pronounce-assess` (`server.ts:111`, limit `5mb`) chấm phát âm qua
`packages/core-ai/azurePronounce.ts`.
**Bảng chạm:** `public.tts_cache`, `tts_cache_pending`, `tts_cache_stats`, `tts_cache_audit`,
`public.daily_usage` (mode `stt`/`speaking` đếm riêng — xem CLAUDE.md mục 13 việc-dở-1).
**Đây là luồng phức tạp nhất** — 2 giọng riêng (đích + giải thích), 3 provider TTS dự phòng, mã
hoá cache. Bất kỳ domain-boundary ADR (V2-01) nào tách "Learning" khỏi "platform" đều cần quyết
định TTS/STT thuộc platform (dùng chung mọi môn) hay có phần learning-specific (giọng theo
domain ngôn ngữ) — **đây là câu hỏi mở cho V2-01, không tự trả lời ở tài liệu này**.

### 1.4 Learning progress (đồng bộ tiến độ học)

Client → `POST/GET /api/progress` (`server.ts:190`) → `api/progress.ts` `handler()` →
`validateAuth()` → theo action, đọc/ghi `english.learning_progress` qua `getPgPool()`
(`packages/core-db/pgPool.ts`) trực tiếp bằng SQL trong file (không qua ORM) — merge kiểu
union-only (`mergeArrayUnion`/`mergeByTimestamp`, xác nhận ở `docs/RECOVERY-V2-RECENT-BRANCHES.md`
lượt trước) để tiến độ nhiều thiết bị không đè nhau. Cũng đọc `FREE_WEEKLY_BONUS_PER_DAY`
(`core-billing/usage.ts`) để tính lượt thưởng theo streak.
**Bảng chạm:** `english.learning_progress`, `public.daily_usage` (đọc, không ghi trực tiếp ở
route này).
**Rõ ràng thuộc `learning`** theo V2-00 lượt 1 — không có phần platform lẫn vào ngoài việc đọc
usage.

### 1.5 SRS/luyện tập (ôn tập ngắt quãng)

Client → `POST/GET /api/challenge` (`server.ts:196`) → `api/challenge.ts` `handler()` →
`validateAuth()` → ghi/đọc `english.challenge_entries` qua `getPgPool()` — logic chọn từ ôn tập
nằm phía CLIENT (`apps/english/src/lib/curriculum.ts`, thuật toán SRS chọn từ không lặp trong 1
vòng), server chỉ lưu kết quả lượt ôn + đồng bộ streak. `quests.ts` (bảng `quest_claims`) là
lớp gamification riêng chồng lên SRS, không phải cùng 1 route.
**Bảng chạm:** `english.challenge_entries`, `public.achievement_claims`/`quest_claims` (khi
hoàn thành mốc). **Lưu ý kiến trúc:** thuật toán SRS chạy CLIENT-SIDE — nếu V2 sau này cần SRS
dùng chung nhiều môn (Wave D, V2-12 "multi-subject learning"), thuật toán này phải chuyển lên
server hoặc tách thành package dùng chung, KHÔNG thể copy-paste sang môn mới. Ghi vào risk
register mục 2 bên dưới.

### 1.6 Payment/entitlement (mua Pro/VIP qua SePay)

Client bấm mua gói → `POST /api/checkout` (`server.ts:222`) → `packages/core-billing/
checkout.ts` `handler()` → `validateAuth()` → đọc giá từ `public.plan_prices` +
`getPricePromo()` (`plan_prices`/`price_promo`) → `generatePaymentCode()` +
`buildSepayQrUrl()` (`api/_lib/sepay.ts`) → ghi `public.payments` (trạng thái `pending`) →
trả QR code. SePay gọi webhook ngân hàng thật → `POST /api/payment-webhook` (`server.ts:223`,
**không cần cookie đăng nhập** — xác thực bằng `verifySepayApiKey()` thay vì `validateAuth()`,
đúng vì đây là server-to-server) → `packages/core-billing/payment-webhook.ts` `handler()` →
`extractPaymentCode()` khớp với `payments.code` → **atomicity**: cập nhật `payments.status` +
`grantPlanDays()` (`api/_lib/planGrant.ts`, ghi `public.entitlements`) phải cùng 1 transaction
(đây chính là việc "sửa atomicity payment" mà `OS_COMPLETE_IMPLEMENTATION_PLAN.md` nêu là PR đầu
tiên đề xuất — **cần đọc lại `payment-webhook.ts` để xác nhận đã có transaction thật hay chưa,
CHƯA xác nhận ở tài liệu này** vì đây là câu hỏi thuộc phạm vi code review, không phải inventory).
`logSecurityEvent()` ghi lại mọi lần webhook gọi (chống giả mạo).
**Bảng chạm:** `public.payments`, `public.entitlements`, `public.plan_prices`, `price_promo`.
**Rủi ro cao nhất trong 8 luồng** vì liên quan tiền thật — xem risk register mục 1.

### 1.7 Admin mutation (ví dụ: admin cấp gói cho user)

Admin UI → `POST /api/admin-users` (`server.ts:212`) hoặc `/api/admin-grant-plan`
(`server.ts:200`) → handler tương ứng (`api/admin-users.ts`, `api/admin-grant-plan.ts`) →
`isAdminEmail()` (`core-auth/adminAuth.ts` — allowlist email admin, không phải role trong DB) →
`validateAuth()` xác nhận cookie khớp email admin → thao tác trực tiếp `getPgPool()` lên bảng
mục tiêu (vd `public.entitlements` cho grant-plan, `public.users`/`profiles` cho admin-users).
13 file `admin-*.ts` đều theo mẫu này — **không có audit log tập trung cho mọi admin mutation**,
mỗi handler tự quyết có ghi log hay không (vd `payment-webhook.ts` có `logSecurityEvent`, nhưng
không rõ toàn bộ 13 route admin có đồng nhất — **cần rà lại, chưa xác nhận ở đây**, ghi vào risk
register mục 3).
**Bảng chạm:** tuỳ route — `entitlements`, `users`, `profiles`, `vip_whitelist`,
`reserved_names`, `plan_feature_flags`, `tts_cache` (dọn cache), v.v.
**Rõ ràng thuộc platform/ops** theo phân loại lượt 1.

### 1.8 Notification (nhắc học qua Web Push)

2 nhánh: (a) đăng ký — client → `POST /api/push` (`server.ts:189`) → `api/push.ts` `handler()`
→ `validateAuth()` → lưu subscription vào `public.push_subscriptions`. (b) gửi nhắc —
`sendReminders()` (`api/push.ts:95`, hàm export riêng KHÔNG phải route — gọi từ cron/scheduled
job ngoài Express, cần xác nhận cơ chế trigger thật: cron VPS hay trong-process — **chưa xác
nhận cơ chế lịch chạy thật, ghi vào risk register mục 4**) → đọc `email_reminders` +
`push_subscriptions`, dùng `vnDateStr()`/`addDays()` (`core-db/date.ts`, xử lý múi giờ VN đúng
nguyên tắc bất biến #9) → gửi qua `web-push` npm package (VAPID keys) → không qua provider AI
nào, không tốn lượt.
**Bảng chạm:** `public.push_subscriptions`, `public.email_reminders`.
**Thuộc platform** — không có logic riêng theo môn học.

## 2. Risk register (có owner)

| #   | Risk                                                                                                                                                                                                                                                                                                                                                                                                                                   | Trigger/guardrail                                              | Mitigation/rollback                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Owner                              | State                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | -------------------- |
| 1   | Payment webhook (1.6) — **ĐÃ FIX (2026-08-16, cùng vòng này, owner duyệt sửa ngay ngoài scope Wave A):** `payment-webhook.ts` trước đó KHÔNG dùng transaction Postgres giữa `UPDATE payments SET status='paid'` và `grantPlanDays()` — nếu `grantPlanDays()` lỗi sau khi đã set `status='paid'`, user mất tiền nhưng chưa được cấp gói, và webhook retry sau đó bị chặn bởi nhánh idempotent `status==='paid'`, không tự phục hồi được | Bất kỳ lỗi DB thoáng qua đúng lúc `grantPlanDays()` chạy       | Đã bọc `UPDATE payments` + `grantPlanDays()` + `UPDATE users.email_verified` trong 1 `withTransaction()` (`core-db/transaction.ts`, có sẵn từ Phase 01) — `grantPlanDays()` nhận thêm tham số `runner` (Pool hoặc PoolClient) để chạy trong cùng transaction, mặc định vẫn dùng pool chung nên 6 nơi gọi khác (referral/admin-grant-plan/quests/trial/achievement rewards) không đổi hành vi. Test: cập nhật mock `pool.connect()` trong `payment-webhook.test.ts`, 13/13 test xanh; `planGrant.test.ts` 18/18 xanh; toàn bộ 3339 unit test xanh | seeker19110 (đã duyệt fix ngay)    | FIXED                |
| 2   | SRS (1.5) thuật toán chọn từ chạy client-side — không tái dùng được cho multi-subject (V2-12) nếu không refactor lên server/package dùng chung                                                                                                                                                                                                                                                                                         | Khi Wave D (V2-11/V2-12) bắt đầu thêm môn thứ 2                | Ghi nhận nợ kiến trúc ngay từ V2-01 ADR — domain boundary cho "SRS engine" nên là platform hay learning-specific-nhưng-portable                                                                                                                                                                                                                                                                                                                                                                                                                  | chưa gán (cần owner)               | OPEN                 |
| 3   | 13 route `admin-*.ts` (1.7) không có audit log tập trung, mỗi handler tự quyết ghi log hay không                                                                                                                                                                                                                                                                                                                                       | Khi có sự cố cần truy vết admin đã sửa gì                      | Rà lại toàn bộ 13 file, thống nhất gọi `logSecurityEvent()` hoặc tương đương ở mọi mutation — việc riêng, KHÔNG thuộc scope Wave A (không sửa `api/` trong goal này)                                                                                                                                                                                                                                                                                                                                                                             | chưa gán                           | OPEN                 |
| 4   | Cơ chế trigger `sendReminders()` (1.8) chưa xác nhận — cron hệ thống hay job nội bộ Express                                                                                                                                                                                                                                                                                                                                            | Khi đổi lịch nhắc học hoặc debug tại sao không gửi             | Đọc `crontab`/PM2 config trên VPS thật hoặc grep gọi `sendReminders` trong repo để xác nhận                                                                                                                                                                                                                                                                                                                                                                                                                                                      | chưa gán                           | OPEN                 |
| 5   | STT/TTS (1.3) chưa quyết định platform hay learning trong domain-boundary ADR sắp tới                                                                                                                                                                                                                                                                                                                                                  | V2-01 bắt đầu                                                  | Đưa câu hỏi này làm mục cụ thể trong V2-01 ADR, không tự quyết ở V2-00                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | seeker19110 (quyết định kiến trúc) | OPEN                 |
| 6   | Rate limit `checkRateLimit()` (1.1) in-memory, không dùng Redis — sai khi chạy nhiều tiến trình PM2 cluster thật                                                                                                                                                                                                                                                                                                                       | Khi thêm VPS/nhiều core (GĐ2 scale, đã ghi ở CLAUDE.md mục 13) | Đặt `REDIS_URL` trước khi bật nhiều tiến trình thật — đã ghi nhận từ trước, chỉ liệt kê lại ở đây cho đủ risk register V2-00                                                                                                                                                                                                                                                                                                                                                                                                                     | seeker19110 (đã biết, chờ hạ tầng) | OPEN (đã biết trước) |
| 7   | Goal/tài liệu V2-00 trôi khỏi trạng thái thật của `main`                                                                                                                                                                                                                                                                                                                                                                               | Mỗi vòng không reload trước khi ghi                            | Bước 1 thuật toán `AI_DELIVERY_LOOP.md` bắt buộc reload (đã ghi ở goal file, liệt kê lại vì đây cũng là risk của chính V2-00)                                                                                                                                                                                                                                                                                                                                                                                                                    | AI                                 | OPEN                 |

## 3. Baseline latency/cost sản xuất thật — CHƯA làm được ở lượt này

Không có quyền/khả năng đọc số liệu production thật (PM2 logs, Sentry, DB metrics trên VPS)
trong phiên làm việc từ xa này — AI không truy cập VPS trực tiếp. `packages/core-db/metrics.ts`
(Phase 01, xem mục 6 lượt 1) đếm trong bộ nhớ và **reset khi PM2 restart**, nên số hiện tại
trong process (nếu đọc được) không đại diện cho baseline dài hạn. Việc này cần **owner** chạy
lệnh trên VPS thật (vd đọc PM2 logs, Sentry dashboard đã bật từ 2026-07-27) hoặc cấp quyền SSH
cho một phiên có thể truy cập — **KHÔNG tự bịa số liệu**. Đánh dấu mục này vẫn mở, không phải
lỗi bỏ sót.

## 4. `apps/hub/` — đã đọc kỹ hơn

`apps/hub/src/App.tsx` (212 dòng) — trang chủ 1 trang: (1) mục tiêu tổng thể, (2) số liệu hoạt
động thật qua `/api/hub-stats`, (3) tab từng môn (`SUBJECTS` array — hiện `english: live`,
`math`/`physics`/`chemistry`: `coming-soon`), (4) bảng giá + CTA đăng nhập/đăng ký **điều hướng
thẳng sang app tiếng Anh** (`ENGLISH_APP_URL`), CHƯA có SSO cookie dùng chung — ghi rõ trong
comment đầu file là phạm vi PR-7 đã CHỦ ĐỘNG THU HẸP. Kết luận vai trò trong roadmap: `apps/hub/`
là **UI platform-level cho Wave D (V2-11/V2-12 multi-subject)**, hiện tại chỉ code khung + 1
route thật (`hub-stats.ts`), không có logic Personal OS/Companion nào — không thuộc Wave A/B/C.
Không cần đụng tới trong Wave A.

## Còn thiếu (để M1/S4 đóng hẳn)

- Số liệu latency/cost production thật (mục 3) — cần owner hoặc quyền truy cập VPS.
- Field-by-field đối chiếu contract (V2-00 lượt 1 mục "còn thiếu" #5) — vẫn chưa làm, thuộc
  M3/S1 theo goal `docs/goals/v2-wave-a-architecture-boundaries.md`, không phải M1.

Với 2 mục trên đã đóng (flows + risk register + apps/hub), **M1/S2 và M1/S3 coi là DONE**;
M1/S4 DONE MỘT PHẦN (baseline test/CI có, latency/cost production còn mở — cần owner). Đề xuất
owner xác nhận: có coi M1 đã đủ để chuyển sang M2 (V2-01 ADR) hay bắt buộc phải có số liệu VPS
thật trước — đây là quyết định phạm vi, không tự chọn ở tài liệu này.
