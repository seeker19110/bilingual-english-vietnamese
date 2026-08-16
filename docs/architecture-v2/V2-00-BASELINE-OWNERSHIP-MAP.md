# V2-00 — Baseline and ownership map

Status: **first pass — inventory + ownership classification done; flow traces, risk register
owners, and production latency/cost evidence still open (see "Còn thiếu" ở cuối)**
Date: 2026-08-16

Theo `docs/architecture-v2/21-ROADMAP.md`: mục tiêu V2-00 là biết chính xác hệ thống hiện tại
đang sở hữu dữ liệu/luồng nào và phần nào đã triển khai từ v1, TRƯỚC khi refactor bất cứ gì. Tài
liệu này là bằng chứng đọc trực tiếp từ repo tại commit `203ad14` (không suy đoán) — mọi mục dưới
đây lấy từ `find`/`grep` thật trên cây thư mục hiện tại, không phải từ trí nhớ hay tài liệu cũ.

## 1. API routes (`api/*.ts`, gắn vào Express qua `server.ts`)

31 handler top-level (chưa tính `api/_lib/*` — 34 file hỗ trợ dùng chung, không phải route):

| Nhóm                    | File                                                             | Domain (v2)                                                                    |
| ----------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Auth/identity           | (nằm trong `packages/core-auth/`, không phải `api/` — xem mục 3) | platform                                                                       |
| Tiến độ học             | `progress.ts`                                                    | learning                                                                       |
| Luyện nói/phát âm       | `pronunciation.ts`, `pronounce-assess.ts`, `avatar-visemes.ts`   | learning                                                                       |
| SRS/luyện tập           | `challenge.ts`, `quests.ts`                                      | learning                                                                       |
| Từ điển                 | `dictionary.ts`                                                  | learning                                                                       |
| Thành tích/gamification | `achievements.ts`, `leaderboard.ts`                              | learning (điểm số gắn với learner), có thể tách platform nếu mở rộng đa domain |
| Lịch sử/feedback        | `history.ts`, `tutor-feedback.ts`                                | learning                                                                       |
| Lượt dùng               | `usage-summary.ts`                                               | platform (billing/entitlement, môn-độc-lập)                                    |
| Hồ sơ                   | `profile.ts`                                                     | platform                                                                       |
| Giới thiệu              | `referral.ts`                                                    | platform                                                                       |
| Thông báo               | `push.ts`                                                        | platform                                                                       |
| Phân tích               | `analytics.ts`, `analytics-summary.ts`                           | platform                                                                       |
| Cài đặt app             | `app-settings.ts`                                                | platform                                                                       |
| Thống kê hub đa môn     | `hub-stats.ts`                                                   | platform (đã có khái niệm đa môn — xem `apps/hub/`)                            |
| Admin (13 file)         | `admin-*.ts`                                                     | platform (vận hành/kiểm soát, không phải domain nghiệp vụ)                     |

Ghi chú quan trọng: **auth không nằm trong `api/`** — nó là `packages/core-auth/auth.ts` +
`authService.ts`, được `server.ts` require trực tiếp. STT/TTS cũng vậy (`sttHandler`,
`pronounceAssessHandler` compile từ `packages/core-ai`, gắn route thủ công ở `server.ts` dòng
~108-111 để chỉnh `express.json({ limit })` theo từng route trước khi tới handler chung).

## 2. Bảng dữ liệu Postgres (từ `postgres/schema.sql` + 42 file `postgres/migrations/*.sql`)

Base schema (`schema.sql`):

- `public.users`, `public.sessions`, `public.profiles` — **platform** (identity/session)
- `english.chat_sessions`, `english.writing_submissions`, `english.speaking_sessions`,
  `english.pronunciations`, `english.learning_progress`, `english.challenge_entries`,
  `english.tutor_feedback` — **learning**, và đã nằm trong schema riêng `english.*` (tách domain
  bằng Postgres schema, không chỉ bằng convention tên bảng — đây là ranh giới V2-01 cần biết đã
  có sẵn một phần)
- `public.daily_usage`, `public.tts_cache`, `public.tts_cache_pending`,
  `public.push_subscriptions`, `public._schema_migrations` — **platform**

Thêm qua 42 migration (liệt kê theo tên bảng, không theo thứ tự thời gian):

- **platform/billing:** `entitlements`, `payments`, `plan_prices`, `plan_feature_flags`,
  `plan_marketing_bullets`, `plan_marketing_info`, `price_promo`, `subject_limits`,
  `free_daily_credit`, `weekly_ai_credit`, `email_daily_usage`
- **platform/identity:** `identities` (multi-provider OAuth), `password_resets`,
  `email_verifications`, `reserved_names`, `vip_whitelist`
- **platform/ops:** `app_settings`, `analytics_events`, `email_reminders`,
  `tts_cache_audit`, `tts_cache_stats`, `feature_catalog`
- **learning:** `english.user_profile` (đã tách riêng `user_profile` theo MÔN — bằng chứng V2-12
  "multi-subject learning" có tiền lệ kiến trúc thật, không phải ý tưởng suông), `achievement_claims`,
  `achievement_rewards`, `quest_claims`, `referrals` (referral gắn thưởng học tập nên tính learning
  dù có phần platform)

**Chưa có bảng nào thuộc `core-contracts` V2** (Person, PersonalFact, Goal, LifeGraphNode/Edge,
MemoryRecord, ConsentGrant, PersonalPolicy, DecisionRecord...) — những contract này hiện chỉ tồn
tại dưới dạng TypeScript type ở `packages/core-contracts/*.ts` (18 file, xem mục 4), CHƯA có bảng
Postgres/migration tương ứng. Đây đúng là điểm bắt đầu thật của V2-03 trở đi, không phải việc đã
làm rồi.

## 3. Providers (AI/TTS/STT/thanh toán)

- **AI chat:** `packages/core-ai/ai.ts` (gateway) + `chatProviders.ts` — hỗ trợ Groq (chính) +
  Anthropic/Gemini (dự phòng), theo audit đã xác nhận ở PR #543 review (refund đúng ngày, xem
  `docs/RECOVERY-V2-RECENT-BRANCHES.md`).
- **STT:** `packages/core-ai/stt.ts`, `openaiStt.ts` — Groq Whisper hoặc OpenAI tuỳ key.
- **TTS:** `packages/core-ai/tts.ts`, `geminiTts.ts`, `elevenLabsTts.ts`, `azurePronounce.ts`
  (chấm phát âm) — Google Cloud TTS chính, ElevenLabs cho giọng VIP, cache mã hoá AES-256-GCM
  (`fileStorage.ts`, `ttsCacheAudit.ts`, `ttsStats.ts`).
- **Thanh toán:** `packages/core-billing/{checkout,payment-history,payment-status,payment-webhook}.ts`
  — SePay (chuyển khoản, không cổng trung gian) theo `docs/research/dac-ta-thanh-toan-2026-07-25.md`.
- **Auth:** `packages/core-auth/{auth,authService,adminAuth,security,sessionCookie,changeEmail,emailVerification}.ts`
  — Bearer token tự viết (không còn Supabase), + Google Identity Services.

Tất cả đều **platform**, dùng chung cho mọi domain/môn học tương lai — không có logic riêng theo
môn nào ở tầng provider.

## 4. Lớp contract V2 đã tồn tại (`packages/core-contracts/`, 18 file)

`activity.ts` · `agentManifest.ts` · `aiRequest.ts` · `assessment.ts` · `errorRecord.ts` ·
`eventEnvelope.ts` · `evidence.ts` · `goal.ts` · `knowledge.ts` · `learner.ts` · `lesson.ts` ·
`mastery.ts` · `memory.ts` · `pipeline.ts` · `shared.ts` · `skill.ts` · `version.ts` · `workflow.ts`

Đây là sản phẩm của Phase 02 "Contract OS" (PR #541, trước khi V2 chính thức hoá kiến trúc ở
PR #542). Roadmap V2-02 "Core contracts" liệt kê tối thiểu: Person, PersonalFact, Goal,
LifeGraphNode/Edge, MemoryRecord, ConsentGrant, PersonalPolicy, DecisionRecord, CapabilityManifest,
ToolManifest, ContextPackage, ProposedAction, DomainEvent. Đối chiếu:

- **Đã có tên tương đương:** `goal.ts` (Goal), `eventEnvelope.ts` (≈DomainEvent), `agentManifest.ts`
  (≈CapabilityManifest/ToolManifest — cần đọc kỹ để xác nhận khớp field), `memory.ts` (≈MemoryRecord).
- **Chưa thấy:** Person, PersonalFact, LifeGraphNode/Edge, ConsentGrant, PersonalPolicy,
  DecisionRecord, ContextPackage, ProposedAction — tên file không tồn tại trong thư mục.

Kết luận: Phase 02 (v1) đã dựng MỘT PHẦN contract mà V2-02 cần, nhưng phần lõi "Personal OS"
(Person/PersonalFact/ConsentGrant/PersonalPolicy/DecisionRecord/LifeGraph) hoàn toàn CHƯA có. V2-02
không phải viết lại từ đầu nhưng cũng không thể coi là "đã xong" — cần rà kỹ field-by-field trước
khi quyết định tái dùng hay viết mới (ngoài phạm vi tài liệu này).

## 5. `apps/` — biên giới UI đã có sẵn cho đa domain

- `apps/english/` — toàn bộ UI học tiếng Anh hiện tại (learning domain, production thật).
- `apps/hub/` — ứng dụng riêng đã tồn tại (`hub-stats.ts` ở mục 1 phục vụ nó), gợi ý đã có ý định
  tách "hub" (platform-level) khỏi từng môn học từ trước khi V2 chính thức hoá. Cần đọc
  `apps/hub/` kỹ hơn ở lượt sau để biết nó thuộc Wave nào.

## 6. Việc V1 (English Tutor OS 46-phase, `docs/phases/`) đã làm — không làm lại

Theo `docs/legacy/ENGLISH_TUTOR_OS_V1_FROZEN.md` (đã có, không nhắc lại nội dung ở đây) + xác nhận
chéo bằng inventory ở trên: `core-contracts` (mục 4), `core-errors/appError.ts`, `core-db/{logger,
metrics,requestId,transaction}.ts`, `core-config/{env,secrets}.ts` là sản phẩm Phase 01 "Foundation
OS" — đã tồn tại thật trong `packages/`, KHÔNG cần làm lại ở V2-01. V2-01 chỉ cần vẽ ADR biên giới
domain dựa trên những gì đã có, không phải xây observability/error-handling từ đầu.

## Còn thiếu (chưa đóng V2-00, để lượt sau)

1. **Trace 8 critical flows** (auth, chat, speaking, learning progress, SRS, payment/entitlement,
   admin mutation, notification) — tài liệu này mới liệt kê SỞ HỮU DỮ LIỆU (route → bảng), CHƯA
   vẽ luồng request đầy đủ qua các lớp (client → route → service → DB → response) cho từng flow.
2. **Risk register có owner** — chưa có.
3. **Baseline test/latency/cost có evidence sản xuất thật** — số liệu test hiện tại (3339/3339,
   xem `PROGRESS.md`) là bằng chứng CI, không phải latency/cost production. Cần đo trên VPS thật.
4. **`apps/hub/`** cần đọc kỹ hơn để xác định vai trò trong roadmap.
5. **Field-by-field đối chiếu contract** (mục 4) chưa làm — chỉ so tên file.

Không đóng gate V2-00 ở tài liệu này. Đây là lượt inventory đầu tiên để các lượt sau (bao gồm cả
V2-01 domain-boundary ADR) có nền để làm việc, thay vì đoán.
