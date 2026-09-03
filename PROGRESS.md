# PROGRESS.md — Trạng thái dự án

> AI đọc file này để biết đang ở đâu. Chi tiết tính năng: `PROJECT.md`. Lịch sử đầy đủ từng PR:
> `git log`/PR đã merge trên GitHub — file này chỉ giữ **tóm tắt** + việc còn mở + quyết định lớn.
>
> **Nhịp làm việc theo giới hạn giờ (CLAUDE.md mục 3):** ≥ 70% usage → hoàn tất việc đang làm, tạo
> PR rồi DỪNG chờ duyệt. < 70% → sau khi PR merge, tự động tiếp tục mục kế tiếp.

## Giai đoạn hiện tại

**Nhật ký từng đợt việc nay nằm ở `docs/changelog/` — mỗi đợt MỘT FILE riêng.**

Xem nhanh: `npm run changelog` (in 10 đợt gần nhất) · `npm run changelog -- 30` (30 đợt) ·
`npm run changelog -- --all`. Hoặc mở thẳng `docs/changelog/`, file có SỐ LỚN NHẤT là mới nhất.

**Vì sao tách ra (quyết định 2026-08-26).** Trước đây mọi đợt việc đều chèn thêm một mục vào ĐẦU
mục này. Hệ quả: PR nào cũng sửa cùng một chỗ của cùng một file, nên cứ hai PR chạy song song là
xung đột — riêng ngày 2026-08-26 đã xung đột **bốn lần liên tiếp** (PR #693, #695, #696, #697),
lần nào cũng cùng một kiểu "cả hai bên cùng thêm mục ở đầu file" và phải giải tay. Tách mỗi đợt
thành một file riêng thì hai PR ghi hai file khác nhau, git không có gì để xung đột.

Cố ý **KHÔNG** commit file index sinh tự động: chính cái index đó sẽ lại thành một file mà mọi PR
cùng sửa, tức là dựng lại đúng vấn đề vừa bỏ. Thay vào đó `npm run changelog` đọc thẳng thư mục.

**File này giữ lại phần thật sự là TRẠNG THÁI HIỆN TẠI** — thứ được sửa tại chỗ chứ không chồng
thêm: nợ kỹ thuật còn mở, quyết định quan trọng, việc tiếp theo, việc cần làm tay. Đó là lý do
những mục đó vẫn nằm nguyên ở đây.

## Lộ trình mới: English Tutor OS (đặc tả 2026-08-15)

**Hợp nhất tại đây (2026-08-15).** Nhánh `spec/english-tutor-os-v1` (merge `61ee30e`) từng tạo
`docs/OS_PROGRESS.md` riêng để không đụng lịch sử phía dưới. Nay gộp về ĐÚNG MỘT nguồn theo dõi
tiến độ (đúng vai trò của `PROGRESS.md` ở mục 2 `CLAUDE.md`) — tránh 2 file tự trôi lệch nhau.
`docs/OS_PROGRESS.md` đã xoá, nội dung dồn vào mục này.

**Kế hoạch:** `docs/MASTER_SPEC.md` (10 nguyên tắc kiến trúc bất biến + 10 layer mục tiêu) + 46 file
đặc tả `docs/phases/00-research-baseline.md` → `45-final-audit.md` (mục lục: `docs/phases/README.md`).
Mục tiêu dài hạn: đưa app từ "web app học tiếng AI" hiện tại lên kiến trúc "Adaptive AI English
Tutor OS" (learner model → diagnostic → adaptive curriculum → tutor → assessment → evidence →
mastery → memory/SRS → next plan), làm DẦN từng phase — mỗi phase có DoD/test/commit riêng, KHÔNG
viết lại app một lần. Đây là kế hoạch nhiều tháng, cần xin xác nhận người dùng ở mỗi cổng chuyển
giai đoạn (đúng mục 3 `CLAUDE.md`), không tự ý chạy một mạch.

**Tiến độ thực thi:** **Phase 00 — Research & Baseline** `in_progress` (2026-08-15, rà lại sau
pull 2026-08-15) — baseline cũ tại `docs/research/baseline.md` là snapshot 3132 test; lượt rà
hiện tại chạy được unit test **3212/3212** · lint 0 cảnh báo · audit production dependency 0 lỗ
hổng. Typecheck đã được gọi lại; E2E local đã khởi chạy nhưng chưa là bằng chứng integration đáng
tin vì test server thiếu Postgres thật và các worker cùng bị rate-limit dưới `ip=unknown`.
Phase 00 vẫn thiếu trace 8 critical flows, AI latency/token/cost production sample, E2E với DB test
và risk register có owner. **CHƯA đóng Phase 00**. Chuẩn thực thi/DoD bổ sung nằm ở
`docs/OS_EXECUTION_GUIDE.md`, backlog và cổng từng phase ở `docs/OS_PHASE_BACKLOG.md`.
Đặc tả chi tiết toàn bộ công việc, contract, test, rollout và exit gate từ Phase 00 đến Phase 45
nằm ở `docs/OS_COMPLETE_IMPLEMENTATION_PLAN.md`; thứ tự PR gần nhất bắt đầu bằng sửa atomicity
payment, dựng test environment thật và hoàn tất baseline — chưa mở Phase 02.

**Đối chiếu nhanh với hiện trạng thật** (để Phase 00/01 không làm lại việc đã có — tra nhanh bằng
Grep, chưa phải audit đầy đủ của Phase 00):

- Storage abstraction cho audio (Phase 01 mục 5) — **ĐÃ CÓ**: `packages/core-ai/fileStorage.ts`
  (driver local/R2 qua `STORAGE_DRIVER`, đã dùng thật trong production).
- Structured logging (Phase 01 mục 6) — **CÓ MỘT PHẦN**: `packages/core-db/logger.ts` (log theo
  cấp độ `LOG_LEVEL` + tiền tố module), nhưng CHƯA có correlation ID / request ID / metrics.
- `AIProvider.generate()` gateway thống nhất (Phase 01 mục 3) — **ĐÃ LÀM MỘT PHẦN (2026-08-15)**,
  phạm vi CỐ Ý thu hẹp vì đây là chỗ rủi ro nhất (đụng trực tiếp đếm lượt/tiền, `ai.ts` có 34 test
  ghim chặt hành vi fallback Groq→Anthropic→Gemini + hoàn lượt). Đã tách:
  `packages/core-ai/chatProviders.ts` — `callGroqChat()`/`callAnthropicChat()`, MỖI hàm CHỈ gọi
  HTTP tới 1 provider rồi trả kết quả dạng discriminated union (`success`/`network_error`/
  `http_error`/`malformed_body`; Anthropic trả `response{status,bodyText}` NGUYÊN VĂN để giữ đúng
  hành vi forward-thẳng cho client). Gemini đã có sẵn dạng này từ trước (`api/_lib/geminiApi.ts`).
  `ai.ts` chuyển sang gọi 3 hàm này thay vì `fetch` thẳng — **logic quyết định (thứ tự fallback,
  khi nào hoàn lượt, status trả về) giữ NGUYÊN 100%, không rút gọn**. Xác minh: toàn bộ
  `ai.test.ts` (35 test) xanh SAU KHI refactor mà KHÔNG sửa 1 dòng test nào — bằng chứng hành vi
  quan sát được không đổi. 12 test mới cho `chatProviders.ts`.
  **Còn để ngỏ, không làm ở đợt này**: `tts.ts`/`stt.ts` mỗi cái đã tự có lớp chọn provider nội bộ
  riêng (không dùng chung interface `chatProviders.ts`) — hợp nhất thật sự thành 1
  `AIProvider.generate()` cho cả chat/TTS/STT là việc lớn hơn, để dành cho phase sau khi cần thêm
  provider mới, tránh đổi 3 luồng đang chạy thật cùng lúc.
- Chuẩn hoá lỗi domain/application (Phase 01 mục 4) — **ĐÃ LÀM MỘT PHẦN (2026-08-15)**:
  `packages/core-errors/appError.ts` — `AppError` + 6 lớp con (`ValidationError`/
  `UnauthorizedError`/`ForbiddenError`/`NotFoundError`/`ConflictError`/`RateLimitError`), mỗi lớp
  tự mang `status` HTTP + `code` ổn định; `isAppError()`/`toErrorBody()` để handler chuyển thành
  JSON. **CỐ Ý CHỈ THÊM, không retrofit** — hiện có **257 chỗ** trong `api/`/`packages/` tự viết
  tay `jsonResponse({error:...}, status)` với 2 hình dạng khác nhau (`{error:'chuỗi'}` ở đa số
  handler cũ, `{error:{message}}` ở `ai.ts`); sửa hết 257 chỗ cùng lúc là breaking-change phạm vi
  rộng, đúng loại việc CLAUDE.md mục 12 yêu cầu dừng hỏi trước — không tự làm. Module mới là nền
  để domain engine của phase OS sau (Evidence/Mastery/Diagnostic...) dùng ngay từ đầu, và để handler
  cũ chuyển dần khi có PR đụng tới, không phải retrofit hàng loạt. 11 test, coverage 100%.
- Correlation ID / request ID / metrics cơ bản (Phase 01 mục 6) — **ĐÃ LÀM (2026-08-15)**:
  `packages/core-db/requestId.ts` (`createRequestId()` — 8 ký tự đầu UUID v4, không phải khoá bảo
  mật, chỉ để lọc log 1 request) + `packages/core-db/logger.ts` thêm `createRequestLogger(prefix,
requestId)` (tương thích ngược, không đổi `createLogger()` cũ) + `packages/core-db/metrics.ts`
  (`incrementCounter`/`recordLatency`/`getMetricsSnapshot` — đếm trong bộ nhớ, KHÔNG phải
  observability thật, reset khi restart PM2; export/dashboard thật là việc Phase 35). Đã áp dụng
  THẬT vào `packages/core-ai/ai.ts` (mỗi request `/api/agent` có `requestId` riêng gắn vào mọi
  dòng log dạng `[agent#a1b2c3d4]`, và đếm `ai_groq_ms`/`ai_groq_<kind>`/`ai_anthropic_ms`/
  `ai_anthropic_status_<code>`/`ai_gemini_ms`/`ai_gemini_success`/`ai_gemini_error`) — CHỈ đổi nội
  dung log/số liệu nội bộ, KHÔNG đổi response trả client, nên vẫn an toàn với 35 test đã ghim hành
  vi (chạy lại `ai.test.ts` không sửa 1 dòng, vẫn xanh). 24 test mới (`requestId.test.ts` 4 ·
  `metrics.test.ts` 9 · thêm 2 vào `logger.test.ts` cho `createRequestLogger`, dư ra từ đợt trước
  còn `chatProviders.test.ts` 12 + `appError.test.ts` 11), coverage 3 file mới 100%.

**Phase 01 "Foundation OS" là `in_progress` (foundation introduced, CHƯA accepted).** Các mục đều
đã có ít nhất một phần triển khai thật + test (mục 1/2/6/7 xong cho phạm vi đã chọn; mục 3/4 cố ý
thu hẹp vì đụng 71–257 điểm gọi; mục 5 vốn có sẵn). Nhưng DoD yêu cầu critical code thật dùng các
abstraction: AI gateway chưa thống nhất chat/TTS/STT, error/env chưa migrate dần hết, và transaction
helper chưa bảo vệ đủ luồng payment/entitlement. Không được mở Phase 02 hay gọi Phase 01 “hoàn tất”
cho đến khi các cổng `OS_PHASE_BACKLOG.md` có bằng chứng.

**Phase 02 — Contract OS (2026-08-15).** Trước khi code, hỏi người dùng chọn giữa 2 hướng: (a) chỉ
validate các ranh giới AI-output CÓ THẬT hiện nay, để schema Learner/Skill/Evidence/... viết CÙNG
LÚC với engine thật của Phase 03+; hay (b) viết đủ 13 schema theo đúng chữ nghĩa đặc tả ngay bây
giờ dù chưa có engine dùng. **Người dùng chọn (b).** Đã làm trọn `docs/phases/02-contract-os.md`:

- **13 entity + AIRequest/AIResponse**, mỗi entity 1 file trong `packages/core-contracts/`:
  `learner.ts` · `goal.ts` · `skill.ts` · `knowledge.ts` · `evidence.ts` · `errorRecord.ts`
  (đặt tên khác `Error` để không đụng `AppError` của Phase 01) · `mastery.ts` · `assessment.ts`
  (schema NÀY bám sát dữ liệu THẬT — gộp hình dạng `FeedbackData`/`EvaluationResult`/
  `ChallengeFeedback` đang được `apps/english/src/lib/ai.ts#parseJson()` parse KHÔNG kiểm tra
  runtime, đúng "critical AI output" mà Phase 02 nhắm tới) · `lesson.ts` · `activity.ts` ·
  `memory.ts` · `workflow.ts` · `agentManifest.ts` · `aiRequest.ts` (hình thức hoá contract đã mô
  tả bằng lời ở Phase 01, khớp `chatProviders.ts`/`requestId.ts` đã xây thật).
- **Versioning + tương thích** (`version.ts`): mọi entity có `schemaVersion` bắt buộc qua
  `versionedObject()` dùng chung; `.strict()` khắp nơi — field lạ (AI hallucination hoặc client
  gửi thừa) bị TỪ CHỐI thay vì âm thầm bỏ qua, đúng Acceptance của phase ("no business-critical AI
  output reaches persistence without validation").
- **Pipeline validate LLM output** (`pipeline.ts#validateAiOutput()`): PARSE → SCHEMA → DOMAIN
  RULES → POLICY, trả `PipelineResult` gắn kèm `stage` lỗi cụ thể; KHÔNG tự commit (nơi gọi tự
  quyết ghi đâu). Domain rules/policy là callback tuỳ chọn nhận dữ liệu ĐÃ CÓ KIỂU sau schema.
- **Event/idempotency** (`eventEnvelope.ts`): `EventEnvelopeSchema` + `createIdempotencyTracker()`
  — bộ nhớ đệm CHỐNG XỬ LÝ TRÙNG tối giản (trong bộ nhớ, chưa bền vững — Phase 29 Event OS sẽ thay
  bằng bản lưu Postgres/Redis khi có event bus thật). Hợp đồng lỗi API tái dùng `AppError` của
  Phase 01, không định nghĩa lại.
- **CỐ Ý CHƯA migrate 10 điểm gọi `parseJson()` hiện có** (Writing/Speaking/Chat/Practice/Lessons/
  Challenge/History) sang dùng `AssessmentSchema` — đó là các trang UI sống, MỘT SỐ không có test
  (`Writing.tsx` không có file test), rủi ro cao hơn lợi ích của việc "migrate cho xong" ở phase
  này. Để dành khi có PR đụng tới từng trang, giống cách Phase 01 xử lý 71 điểm đọc env / 257 điểm
  trả lỗi thủ công.
- 99+10+9 = **118 test mới**, coverage `packages/core-contracts/` **100%** cả 4 chỉ số.

Cổng: build ✅ typecheck ✅ lint 0 cảnh báo ✅ test 3330/3330 ✅.

**Phase 03 — Learner OS (2026-08-15, cùng nhánh/PR #541 — quyết định gom nhiều phase 1 PR).**
Đặc tả gốc đòi bảng Postgres mới `learner_profiles`/`learner_goals`/`learner_preferences` +
migrate/backfill dữ liệu người dùng thật. Đã hỏi trước — người dùng chọn "chỉ code + migration
file, KHÔNG tự backfill". Trước khi viết migration, đọc `docs/adr/0002-quan-ly-nguoi-dung.md` thì
phát hiện: kế hoạch đa lĩnh vực **ĐÃ CÓ** `english.user_profile` (migration `0036`) đóng đúng vai
"learner profile" — nhưng bảng đó "NGỦ" (backfill 1 lần, code thật vẫn đọc/ghi `public.profiles`,
LỆCH DẦN vì không dual-write). Tạo thêm `learner_profiles` sẽ là bảng ngủ THỨ HAI cho cùng 1 khái
niệm — đúng kiểu trùng nguồn sự thật mà ADR-0002 đang tránh. **Đổi hướng sang phương án AN TOÀN
HƠN cả mức đã duyệt**: `LearnerStateService` là ADAPTER thuần — đọc trực tiếp, luôn mới nhất, từ
2 bảng nguồn sự thật THẬT đang chạy (`public.profiles`: onboarded/goal/daily_minutes,
`english.learning_progress`: settings.direction/placement.cefr) — **0 migration, 0 bảng mới, 0
rủi ro production**, và không có vấn đề "lệch dần" vì không có bản sao nào để lệch.

- `packages/core-learner/learnerState.ts` — `getLearnerState(userId)`: trả `LearnerState` gồm
  `direction`/`currentLevel`/`onboarded`/`goal` đọc từ dữ liệu thật (mặc định đúng hành vi client
  hiện có: direction mặc định 'A' khớp `storage.ts#getDirection()`, currentLevel `null` khi chưa
  làm bài test xếp lớp — không bịa cấp mặc định), cộng `skills`/`knowledge`/`errors`/
  `recentEvidence`/`risks` LUÔN RỖNG (đúng kiểu `Skill[]`/`Knowledge[]`/`ErrorRecord[]`/
  `Evidence[]` của Phase 02 — Phase 04/05/06/07/09 chưa xây engine).
- Authorization (Acceptance "no cross-user leakage"): hàm nhận `userId` đã xác thực từ nơi gọi
  (đúng quy ước `validateAuth()` hiện có toàn dự án), cả 2 câu SQL lọc CHÍNH XÁC theo `userId`
  đó — test xác minh tường minh (`params` truyền cho `pool.query` luôn đúng userId).
- **CHƯA có API endpoint** gọi hàm này — đúng tinh thần ADR-0002 Bước 5 (không dựng hạ tầng cho
  tính năng UI chưa tồn tại). Nối 1 endpoint thật là việc khi có UI cần tới.
- 9 test mới, coverage `packages/core-learner/` **100%**.

Cổng: build ✅ typecheck ✅ lint 0 cảnh báo ✅ test 3339/3339 ✅.

- Config/env validate tập trung bằng Zod (Phase 01 mục 1, nguyên tắc 5 `MASTER_SPEC.md`) — **ĐÃ
  LÀM (2026-08-15)**: `packages/core-config/env.ts` (`EnvSchema` Zod cho ~25 biến hay dùng nhất,
  `getEnv()`/`parseEnv()`/`describeEnv()`) + `packages/core-config/secrets.ts`
  (`isSecretEnvKey`/`redactSecrets` — nhận theo GIÁ TRỊ khớp env thật, không đoán theo mẫu chuỗi).
  **Cố ý KHÔNG bắt buộc** (mọi trường optional/có `.catch()` mặc định, sao y hệt mặc định cũ trong
  code) — không được để thiếu 1 biến làm sập cả server đang chạy thật. Chưa migrate các chỗ đọc
  `process.env.X` trực tiếp sang dùng `getEnv()` — module mới chỉ THÊM lối đi có kiểm, chưa thay
  thế; làm dần ở PR sau, không đổi 71 lượt đọc cùng lúc (rủi ro cao, khó review).
  `redactSecrets()` đã nối vào `packages/core-db/logger.ts` (mọi log qua `createLogger()` giờ tự
  che secret nếu lỡ lọt vào message) — đóng luôn Phase 01 mục 7. 42 test mới (`secrets.test.ts` 20
  · `env.test.ts` 14 · thêm 2 vào `logger.test.ts`), coverage 2 file mới 100%.
- DB transaction helper dùng chung (Phase 01 mục 2) — **ĐÃ LÀM (2026-08-15)**:
  `packages/core-db/transaction.ts` — `withTransaction(pool, fn)` bọc đúng trình tự
  `connect → begin → fn → commit`, tự `rollback` khi `fn` ném lỗi (rollback tự nó lỗi thì KHÔNG
  che mất lỗi nghiệp vụ gốc), luôn `release()` ở `finally`. Trước đó cả repo chỉ có ĐÚNG 1 chỗ
  dùng transaction thật (`api/admin-plan-features.ts` PUT — thêm tính năng mới + gán mặc định 3
  gói) — đã chuyển sang dùng helper, đổi từ "rollback tay khi key trùng" sang "trả cờ rồi để
  transaction tự commit" (hành vi giống hệt: 0 dòng bị đổi trong cả 2 cách vì `ON CONFLICT DO
NOTHING`). 6 test cho `withTransaction` (thành công, `fn` lỗi → rollback, luôn release kể cả
  lỗi, rollback tự nó lỗi vẫn giữ đúng lỗi gốc, trả đúng kiểu, dùng đúng client được cấp) + sửa 1
  test cũ ở `admin-plan-features.test.ts` cho khớp hành vi mới (assert không có insert vào
  `plan_feature_flags`, thay vì assert gọi `rollback`). `codemap -- impact` xác nhận sửa
  `admin-plan-features.ts` chỉ ảnh hưởng đúng file test của nó + `server.ts`.
- Monorepo đã tách một phần (`packages/core-db`, `packages/core-ai`, `packages/core-auth`,
  `packages/core-billing`) — tiến xa hơn baseline mà đặc tả OS giả định, xem ADR-0001 +
  `docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md`.

**Việc còn lại của Phase 00** (theo `docs/phases/00-research-baseline.md`): làm mới snapshot
build/typecheck/lint/test/E2E có môi trường tái lập, trace 8 luồng critical UI → API → DB/provider,
đo latency/token/cost AI thật, hoàn tất architecture map và gán owner/next phase cho từng risk.
Dependency graph đã có nhưng cần cập nhật cùng snapshot hiện hành.

### Seed phát âm TIẾNG VIỆT (chiều B) + nới luật input cho nghĩa nhiều vế (2026-08-13, nhánh `claude/tts-cache-voice-i1plxb-2`)

Người dùng đính chính (đúng): **cả 16 giọng đã seed đủ** — 12.168 từ × 16 giọng (14 Chirp3-HD +
2 Studio) = **194.688** khớp chính xác số dòng DB. Trước đó mình đọc nhầm sang script cũ
`seed-pronunciations.ts` (chỉ 8 giọng) và bị con số trùng khớp 8×2 đánh lừa; `seed-all.ts` mới là
script đang dùng.

Rà tiếp thì lộ chỗ trống thật: **toàn bộ 194.688 dòng đều là `lang='en-US'`** (seed ghi cứng
`values (…, 'en-US', …)`), trong khi chiều B (`WordCard.tsx`) đọc **`card.vi`** với `lang='vi-VN'`.
Nặng hơn: allowlist `WORD_SAFE_PATTERN` cũ chỉ nhận **5.565/11.572** nghĩa tiếng Việt — nghĩa nhiều
vế ("bỏ rơi, từ bỏ", "trên (tàu, xe)") có dấu phẩy/ngoặc/gạch chéo đều bị **400** rồi rơi về Web
Speech, đúng hiện tượng "chữ Việt đọc giọng Anh" mà chính `PronounceButton.tsx` đã ghi chú.

Đã làm:

1. **Nới `WORD_SAFE_PATTERN`** (`api/pronunciation.ts`) thêm `, ; : ( ) / "` → phủ **11.572/11.572**
   nghĩa. Vẫn chặn `<>{}[]\|&#$%*+=~^` và ký tự điều khiển; trần 100 ký tự giữ nguyên nên chi phí
   mỗi request không đổi. Giá trị chỉ dùng làm cache key + text gửi Google TTS (SQL parameterized,
   tên file qua `encodeURIComponent`).
2. **`seed-all.ts` seed được vi-VN**: `PronTask` có thêm `lang`; nguồn là chuỗi `vi` của cùng từ
   điển (khử trùng còn 11.572), 14 giọng Chirp3-HD (KHÔNG Studio — Google không có Studio cho
   vi-VN). Quy mô mới: **162.008 dòng** (11.572 × 14), ~~2,72 triệu ký tự → sau 1 triệu miễn phí là
   \*\*~~$3,4\*\* ở mức $2/1M. Tiếng Việt xếp SAU tiếng Anh để dừng giữa chừng vẫn xong phần chính.
3. **Thread `lang` qua TOÀN BỘ đường đi** — đây là phần nguy hiểm nhất: khoá `word:voice` cũ thiếu
   `lang` sẽ khiến `verifyDb` coi 162.008 dòng vi-VN là "orphan" và `--clean-orphans --yes` **xoá
   thật**. Nay dùng chung `pronKey(word, voice, lang)` ở dedupe/audit/verify/orphan; keyset
   pagination đổi sang `['word','voice','lang']` (đúng unique thật của bảng); mọi câu SQL
   select/insert/delete đều có `lang`; parser tên file R2 hiểu hậu tố `-vi-VN`. Thêm **hàng rào**:
   `--pron-lang` giới hạn cả phạm vi soát orphan, nên lượt chạy hẹp không bao giờ xoá dữ liệu ngôn
   ngữ khác.
4. Tên file en-US **giữ nguyên dạng cũ** (`<word>-<voice>.mp3`) để 194.688 file đã có không bị đổi
   tên/tải lại; chỉ ngôn ngữ mới gắn hậu tố lang.
5. `seed-pronunciations.ts` (script cũ, chỉ tiếng Anh) nay lọc `where lang='en-US'` khi dựng tập
   "đã có" — không thì chuỗi trùng nhau giữa 2 ngôn ngữ bị coi nhầm là đã seed.
6. **Test mới** `scripts/seed-all.test.ts` (12 ca): để test được, `main()` chỉ chạy khi gọi trực
   tiếp (`isDirectRun`) — import không còn kích hoạt cả quy trình seed. Xác minh bằng số thật:
   en vẫn đúng **194.688** (không hồi quy), vi = **162.008**, không trùng khoá, mọi chuỗi vi đều
   qua luật của API. Thêm 3 ca cho `api/pronunciation.test.ts` (nghĩa nhiều vế → 200, từ quá dài
   → 400, ký tự thật sự cấm → 400).

Cổng: build ✅ · typecheck ✅ · lint 0 cảnh báo ✅ · format ✅ · test **3132/3132** xanh ✅.

⚠️ **Việc tay sau khi merge:** chạy `npm run seed:all -- --all` (hoặc `--pron-lang=vi-VN`) trên VPS
để tạo 162.008 audio tiếng Việt. Chưa chạy thì chiều B vẫn hoạt động, chỉ là tạo động từng từ ở
lần bấm đầu.

### Fix (GỐC RỄ): `/api/pronunciation` từ chối MỌI giọng client gửi lên → luôn nghe 1 giọng (2026-08-13, nhánh `claude/tts-cache-voice-i1plxb`)

Người dùng báo tiếp: "cài đặt riêng thế nào cũng chỉ trả về 1 giọng". Truy đến nơi:
`api/pronunciation.ts` đọc tham số `voice` bằng `.toLowerCase()` **trước** khi kiểm hợp lệ, trong
khi tên giọng Chirp3-HD/Studio PHÂN BIỆT hoa-thường (`Aoede`, `Studio-O` — xem
`api/_lib/googleTts.ts`). Hệ quả: mọi request có `?voice=...` (client luôn gửi PascalCase) đều
rớt `isValidVoice()` → **400** → `PronounceButton`/`WordVoiceCycleButton` nuốt lỗi và fallback
Web Speech API, tức luôn phát MỘT giọng mặc định của trình duyệt. Chỉ request KHÔNG kèm `voice`
(dùng `DEFAULT_VOICE = 'Kore'`) mới chạy được — nên đổi giọng ở Cài đặt trông như vô tác dụng.
Đường `/api/tts` (câu/đoạn) không dính lỗi này; cache theo `voice` ở cả 2 endpoint vốn đã đúng.

Sửa: thêm `canonicalizeVoiceId()` trong `api/_lib/googleTts.ts` (chuẩn hoá không phân biệt
hoa-thường về đúng tên chuẩn, giữ tương thích link cũ dạng chữ thường), `api/pronunciation.ts`
dùng nó thay cho `.toLowerCase()`.

**Vì sao test cũ không bắt được:** `api/pronunciation.test.ts` mock `isValidVoice` bằng danh sách
CHỮ THƯỜNG (`['kore','puck']`) — mock sai lệch với module thật nên che đúng con bug. Đã sửa mock
về PascalCase như thật + thêm test hồi quy "voice PascalCase từ client → 200 và giữ đúng giọng",
kèm test cho `canonicalizeVoiceId`. Bài học: mock phải khớp hành vi thật của module bị mock.

Cổng: build ✅ · typecheck ✅ · lint 0 cảnh báo ✅ · format ✅ · test 3118/3118 xanh ✅.

**Tiếp theo (cùng ngày, PR sau):** siết luôn gốc rễ khiến bug lọt lưới — `api/pronunciation.test.ts`
nay dùng `importOriginal` để lấy HÀM THẬT cho phần kiểm tra/chuẩn hoá tên giọng, chỉ còn mock 2 hàm
gọi ra ngoài (`generateAudioFromGoogle`, `generateStudioAudioFromGoogle`) + `VOICE_VERSION`. Đã
kiểm chứng bộ test mới thật sự bắt lỗi: tạm khôi phục dòng `.toLowerCase()` cũ → **10/18 test đỏ**
(trước đây xanh hết). Nguyên tắc rút ra: mock KHÔNG được tự viết lại logic của chính module bị mock.

### Fix: nút loa thẻ từ mới/SRS/Hôm nay bỏ qua giọng đã chọn ở Cài đặt (2026-08-13, nhánh `claude/fix-word-voice-cycle-l1n2e4`)

Người dùng báo: đổi giọng đọc ở Cài đặt (VoicePicker, 14 giọng) không có tác dụng khi học từ
mới/ôn SRS/tab Hôm nay — "chỉ đổi được nam/nữ". Điều tra (Explore agent) xác định:
`WordVoiceCycleButton.tsx` (nút loa DUY NHẤT ở `WordCard.tsx`, dùng khắp `StudyTabs.tsx`) từ
quyết định 2026-07-29 CỐ Ý bốc random 1 giọng mỗi lần bấm (`pickRandomAllowedVoice`), bỏ qua
hoàn toàn `getVoicePref()` (giọng đã lưu ở Cài đặt) — chỉ dùng nó làm nhãn khởi tạo ban đầu.
`KaraokeText`/`StudyTabs` (gọi `speak()` mặc định) và `tts.ts#getVoicePref` đều đúng, không có
bug.

Đã hỏi và người dùng xác nhận: bỏ hành vi random-mỗi-lần-bấm, đổi sang luôn dùng
`getVoicePref()` — hàm này đã tự xử lý đúng cả 2 trường hợp (giọng cố định khi tắt "Giọng
ngẫu nhiên" ở Cài đặt, hoặc giọng ngẫu nhiên GIỮ NGUYÊN trong phiên khi bật) nên khớp hành vi
với phần còn lại của app. Sửa: bỏ `pickRandomAllowedVoice`/tham số `exclude`, gọi thẳng
`getVoicePref()` trong `handleClick()`; giữ nguyên cơ chế cache theo giọng thật +
`resolveActualVoice` (server có thể hạ gói).

**Cùng ngày, tiếp theo:** người dùng hỏi thêm về Từ điển ("fix từ điển đúng random, không
được thì theo giọng cài đặt") — xác nhận ý: `PronounceButton.tsx` (Từ điển/`WordFormsBlock`)
trước đây LUÔN random mỗi lần bấm BẤT KỂ công tắc "Giọng ngẫu nhiên" ở Cài đặt (quyết định
2026-07-29, coi random là hành vi toàn cục không tắt được ở đây) — khiến tắt công tắc đó
tưởng vô tác dụng ở Từ điển, không đồng nhất với `WordVoiceCycleButton` vừa sửa ở trên. Sửa
`pickVoice()`: chỉ random khi PROP `random` (mặc định true) VÀ `getVoiceRandomPref()` (công
tắc Cài đặt) đều bật; tắt công tắc → luôn dùng `getVoicePref()` (giọng cố định đã chọn).

Cổng (cả 2 lượt sửa): build ✅ · typecheck ✅ · lint 0 cảnh báo ✅ · format ✅ · test 3115/3115
xanh ✅. Không có test riêng cho 2 component này (UI thuần, không test unit từ trước).

### Tiến độ học chỉ TĂNG, không bao giờ GIẢM dù đổi máy/nhiều thiết bị (2026-08-13, PR đang mở, nhánh `claude/learning-progress-persistence-l1n2e4`)

Người dùng yêu cầu: tiến độ học tập chỉ được cập nhật thêm, không được giảm đi dù đổi máy hay
dùng nhiều thiết bị cùng lúc. Rà `apps/english/src/lib/progressSync.ts` +
`api/progress.ts`: SRS/điểm thi CEFR/placement/mục tiêu tuần đã hợp nhất kiểu "chỉ tốt lên" từ
trước, nhưng `learned`/`cefrGrammar`/`cefrDialogues`/`cefrUnlocked`/`achievements` server
**GHI ĐÈ** theo đúng mảng client gửi — chỉ chống mất dữ liệu trong CÙNG 1 tab/máy (chờ pull
xong mới push), CHƯA chống được 2 thiết bị học song song rồi đồng bộ gần như đồng thời (máy A
học từ mới → chưa kịp đẩy lên thì máy B, đang mở từ trước chưa thấy dữ liệu mới của A, đẩy bản
cũ của B lên → đè mất phần A vừa học).

**Đã hỏi người dùng** đánh đổi (union sẽ làm mất tác dụng lâu dài của các thao tác "bỏ đánh
dấu") — người dùng chọn: `learned`/`cefrGrammar`/`cefrDialogues` → **union tuyệt đối**;
`achievements`/`cefrUnlocked` → **union** (vốn không có thao tác bỏ đánh dấu, không đánh đổi
gì); `hard` (nhãn từ khó) → **giữ ghi đè** (chỉ là lọc hiển thị, không phải tiến độ học).

Đã sửa: `api/_lib/progressMerge.ts` thêm `mergeArrayUnion()`; `api/progress.ts` áp dụng cho 5
trường trên (trừ `hard`). Hệ quả đã ghi rõ trong comment code: `unmarkLearned` (không có nút UI
gọi, chỉ còn trong test) và `unmarkGrammarDone` (CÓ dùng ở `CefrLessonViews.tsx`) từ nay chỉ có
tác dụng TẠM trên 1 máy — máy khác đồng bộ lại sẽ tự thêm lại mục vừa bỏ. Test:
`api/_lib/progressMerge.test.ts` (thêm `mergeArrayUnion`) + `api/progress.test.ts` (sửa lại ca
biên `learned`, thêm ca biên `hard`). Cổng: build ✅ · typecheck ✅ · lint 0 cảnh báo ✅ ·
format ✅ · test 3113/3113 xanh ✅.

### Đồng bộ đa thiết bị cho cài đặt cá nhân + vé nghỉ streak (2026-08-13, nhánh `claude/learning-progress-persistence-l1n2e4`)

Người dùng hỏi tiếp "đồng bộ tất cả" sau việc trên — khảo sát lại toàn bộ cơ chế đồng bộ
(dùng Explore agent) thấy: lịch sử Chat/Viết/Nói + tiến độ học + streak/lượt dùng hàng ngày
ĐÃ đồng bộ đầy đủ; onboarding đã có cả push (`saveOnboarding`) lẫn pull (`fetchOnboarding`,
`lib/onboarding.ts`) — không cần sửa. Riêng **5 mục cài đặt cá nhân chỉ lưu localStorage**
(đổi máy là mất): ngôn ngữ giao diện (`ui_lang`), chiều học Anh⇄Việt (`et_direction`), âm
thanh (`ui_sound_enabled`), giọng đọc TTS (`tts_voice`/`tts_voice_random`/`tts_voice_native`/
`tts_voice_native_on`), và vé nghỉ streak (`et_streak_freeze_<uid>`, trước đây CỐ Ý chưa làm
theo comment cũ trong `storage.ts`).

Đã hỏi phạm vi cụ thể + xác nhận với người dùng trước khi sửa (đúng mục 7 CLAUDE.md — đụng
nhiều file). Thêm migration `0040_sync_user_settings.sql`: 2 cột mới trên
`english.learning_progress` —

- `settings` (jsonb): gộp `{uiLang, direction, soundEnabled, voicePref, voiceRandomPref,
nativeVoiceOn, nativeVoicePref, updatedAt}`. Đây là **"lựa chọn hiện tại"**, không phải tiến
  độ chỉ tăng → hợp nhất theo `updatedAt` MỚI HƠN thắng (giống `placement`/`weeklyGoal` đã có
  từ trước), KHÔNG union như `learned`. Mọi setter cài đặt (`setUiLang`, `setDirection`,
  `setSoundEnabled`, `setVoicePref`, `setVoiceRandomPref`, `setNativeVoiceSeparate`,
  `setNativeVoicePref`) giờ gọi `touchSettingsUpdated()` (mới, `lib/storage.ts`) để ghi mốc
  thời gian — nếu quên gọi ở setter mới thêm sau này, cài đặt đó sẽ không đồng bộ đúng (thua
  trong merge vì `updatedAt` không đổi).
- `streak_freeze_dates` (jsonb mảng "yyyy-mm-dd"): vé nghỉ ĐÃ DÙNG là sự kiện đã xảy ra → hợp
  nhất UNION như `learned`/`achievements`, không phải last-write-wins.

Sửa: `api/progress.ts` (schema + SELECT/INSERT/merge 2 cột mới), `lib/progressSync.ts` (đọc/
ghi `settings` blob + `streakFreezeDates`, thêm `readSettingsBlob`/`applySettingsBlob`),
`lib/storage.ts` (thêm `touchSettingsUpdated`/`getSettingsUpdatedAt`/`setSettingsUpdatedAt`
dùng chung, sửa `setDirection`; export `getStreakFreezeDatesForSync`/
`setStreakFreezeDatesFromSync` để `progressSync.ts` gọi), `lib/uiLang.ts`, `lib/sound.ts`,
`lib/tts.ts` (gọi `touchSettingsUpdated()` ở từng setter). Test mới trong
`api/progress.test.ts` (2 ca biên: `settings` giữ bản mới hơn, `streakFreezeDates` union).

Cổng: build ✅ · typecheck ✅ · lint 0 cảnh báo ✅ · format ✅ · test 3115/3115 xanh ✅. Chưa
chạy migration `0040` trên VPS production — cần `npm run migrate:pg` sau khi PR này deploy
(`scripts/deploy.sh` tự chạy migration khi deploy, xem `docs/deploy-vps-ubuntu.md`).

### Sàn coverage chung 90% cho cả 4 chỉ số (2026-08-13, cùng PR)

Người dùng yêu cầu "set toàn bộ coverage 90%". Đã **cảnh báo trước** rằng ngưỡng cũ là
93/89/96/93 nên đặt phẳng 90 sẽ NỚI statements (93→90) và functions (96→90), chỉ SIẾT branches
(89→90); người dùng xác nhận giữ nguyên quyết định và làm rõ: _"cao thì mặc kệ, miễn từ 90 trở
lên là được"_ — tức 90 là **sàn tối thiểu**, không phải mục tiêu để rút test xuống.

`vitest.config.ts` → `thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 }`.

**Trước khi đổi được ngưỡng phải vá branches** (đang 89,06% < 90). Đã viết thêm **51 test**,
branches **89,06 → 90,32%**; toàn bộ: 94,36 / 90,32 / 96,33 / 94,36 · **3109 test xanh**.

Các file được nâng (chọn theo "thiếu nhiều nhánh nhất / rẻ nhất"), mỗi test kiểm một bất biến
thật chứ không phải chạy cho đủ số:

| File                              | Branches trước → sau | Bất biến đáng chú ý được thêm                                                                                             |
| --------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `packages/core-ai/fileStorage.ts` | 90,9 → 97,4          | `listR2Objects` tự phân trang; **`IsTruncated=true` mà thiếu token → dừng, không lặp vô hạn**; nhánh ghi local            |
| `api/progress.ts`                 | 50 → 91,3            | Cột DB trả NULL → trả mảng/đối tượng rỗng (client `cloud.ts` ghi thẳng vào localStorage, `null` sẽ vỡ chỗ dùng `.length`) |
| `api/history.ts`                  | 56 → 83,9            | Ngưỡng chống cày thưởng mời bạn: phiên 1 tin nhắn / bài viết < 40 ký tự **sau trim** → KHÔNG thưởng                       |
| `api/admin-tts-cache.ts`          | 71 → 92,7            | Quét nền ghi `status=done`/`error` đúng; rate limit chặn TRƯỚC xác thực                                                   |
| `api/admin-reserved-names.ts`     | 41,7 → cao           | Thêm từ cấm phải chuẩn hoá lowercase + trim (không thì "ADMIN" và "admin" thành 2 dòng, lọc tên hụt)                      |
| `api/leaderboard.ts`              | 86,2 → cao           | Lần gọi thứ 2 trong 5 phút dùng cache, không quét lại `daily_usage` cả tuần                                               |
| `api/_lib/achievementRewards.ts`  | 82,1 → cao           | Cache cấu hình thưởng + `invalidate` hoạt động; cột `learned` hỏng (không phải mảng) → tính 0, không nổ                   |
| `api/admin-payments.ts`           | 60 → cao             | OPTIONS/rate-limit/405                                                                                                    |

**Bẫy đã gặp:** mock `rewardReferralIfEligible` trong `api/history.test.ts` không được reset ở
`beforeEach` nên số lần gọi cộng dồn qua các test → 2 test đỏ oan. Thêm `mockClear()`.

**Lưu ý cho phiên sau:** biên độ branches chỉ còn **0,32 điểm** trên sàn. Thêm code có nhánh mà
quên test là CI đỏ ngay. Đừng hạ sàn để chữa — viết test.

### Cache TTS: sửa "cache HIT giả" + tab admin "Cache TTS & R2" (2026-08-13, PR mới)

**Bối cảnh:** người dùng nghi TTS cache hoạt động sai. Đã test THẬT credentials R2 (`STORAGE_DRIVER`,
`R2_ACCOUNT_ID/ACCESS_KEY/SECRET/BUCKET/PUBLIC_BASE_URL`) bằng đúng config `saveR2()`:
**cả 6 biến đều ĐÚNG** — xác thực OK, bucket `english-tutor` tồn tại, quyền đọc + ghi OK, public
read qua `pub-8fa372ee….r2.dev` trả HTTP 200 khớp byte-for-byte, domain trỏ đúng bucket. Trên R2
đang có `tts-cache/` (≥ 8.000 file, ≥ 82 MB, thư mục con `en-US/` + `vi-VN/`) và `pronunciations/`
(≥ 12.000 file, ≥ 60 MB). **Vấn đề KHÔNG nằm ở cấu hình R2.**

**Lỗi thật đã tìm ra — "cache HIT giả":** luồng tra cache không hề hỏi R2, nó tra bảng Postgres
`tts_cache`/`pronunciations` theo hash rồi trả thẳng `audio_url`. Dòng nào còn trỏ `/uploads/...`
(ghi từ thời `STORAGE_DRIVER=local`, hoặc từ nhánh fallback local khi R2 lỗi) vẫn bị coi là cache
HIT → client fetch ra 404 → và vì đã "HIT" nên câu đó **không bao giờ được sinh lại**: hỏng vĩnh
viễn, im lặng, không tự khỏi.

Đã sửa:

1. **`isServableUrl()` (`packages/core-ai/fileStorage.ts`)** — ở chế độ r2 chỉ chấp nhận URL thuộc
   `R2_PUBLIC_BASE_URL`. `/api/tts` (cả đường đọc thẳng lẫn đường claim chống race) và
   `/api/pronunciation` coi URL không phục vụ được là MISS → gọi API sinh lại, ghi đè bằng URL R2
   thật. **Ca biên tốn tiền đã chặn:** thiếu `R2_PUBLIC_BASE_URL` thì GIỮ NGUYÊN cache, không để
   một biến môi trường thiếu kích hoạt sinh lại toàn bộ.
2. **Bỏ fallback ghi local khi `STORAGE_DRIVER=r2`** — chính nhánh đó sinh ra URL hỏng. Nay ném lỗi
   (quyết định của người dùng: "báo lỗi luôn, không ghi local"). Kiểm bằng codemap: trong 4 script
   seed, `saveAudio` nằm TRƯỚC lệnh ghi DB trong cùng `try` ⇒ ném lỗi thì không dòng DB hỏng nào
   được tạo, item bị đếm lỗi và báo ra.
3. **Dữ liệu cũ KHÔNG dọn tay** (người dùng chọn): dòng hỏng gặp tới đâu tự sinh lại tới đó —
   không đụng DB production, không sinh lại đồng loạt gây dồn cục tiền API.

**Tab admin mới "Cache TTS & R2"** (`api/admin-tts-cache.ts` + `AdminTtsCachePanel.tsx`), vì trước
đây KHÔNG có chỗ nào ghi lại /api/tts đã hit hay miss nên không trả lời được "cache hit bao nhiêu %":

- Migration `0039_tts_cache_stats.sql`: bảng `tts_cache_stats` (đếm hit/miss theo ngày+lang+voice,
  upsert bắn-rồi-quên, ngày theo giờ VN cho khớp `daily_usage`) và `tts_cache_audit` (kết quả quét
  nền). Cả 2 chỉ là số liệu — xoá đi không mất audio.
- Trang hiện: tỉ lệ hit 30 ngày + biểu đồ theo ngày + bảng theo giọng; đếm nhanh thuần SQL bao
  nhiêu dòng trỏ đúng R2 / trỏ sai chỗ; và nút "Quét lại" chạy NỀN đối chiếu DB ↔ R2 để ra số
  **thiếu trên R2** và **orphan trên R2** (bucket hàng chục nghìn file nên không quét đồng bộ được).
- Chống quét chồng, kèm mốc 30 phút coi lượt quét treo là hỏng để một lần `pm2 reload` đúng lúc
  không khoá cứng tính năng vĩnh viễn.

**Giới hạn phải biết:** số liệu hit/miss **không hồi tố** — chỉ tính từ lúc deploy bản này.
Và **% cache hit chưa đo được ở phiên này** vì sandbox không có DB production; phải bấm "Quét lại"
trên VPS mới có số thật.

### Xử lý nốt 5 việc để ngỏ của audit (2026-08-12, cùng PR) — người dùng duyệt "làm tất cả"

Cả 5 việc trước đó chỉ CẢNH BÁO (vì đều làm đổi con số/hành vi thật) nay đã làm, mỗi việc có test:

1. **`subject_limits` thôi là bảng chết.** Migration 0029 tạo bảng + cờ `enforced` mô tả là phanh
   tay admin tắt enforce hạn mức theo môn, nhưng không code nào đọc. Đã nối vào
   `checkAndConsumeUsage` qua `isSubjectEnforced()` (`packages/core-db/settings.ts`, cache 30s
   dùng chung TTL với app_settings). Tắt phanh → KHÔNG chặn theo hạn mức nhưng VẪN ghi thống kê
   để còn theo dõi chi phí. **Mặc định mọi nhánh không chắc chắn đều là ENFORCE** (chưa có dòng
   cấu hình, DB lỗi, giá trị null) — ngược với fail-open thường thấy, vì đoán nhầm sang "không
   enforce" là mở toang lượt gọi AI cho toàn bộ người dùng.
2. **Hoàn lượt qua nửa đêm không còn bốc hơi.** `checkAndConsumeUsage` nay trả kèm `day` đã trừ,
   `refundUsage(userId, mode, day)` hoàn đúng dòng ngày đó. Trước đây mỗi bên tự gọi `today()`:
   lượt trừ 23:59 giờ VN, provider lỗi, hoàn lúc 00:01 → `greatest(0-1, 0) = 0`, mất trắng 1 lượt.
   Cập nhật 8 nơi gọi refund (`ai.ts` ×6, `stt.ts`, `pronounce-assess.ts`).
3. **Không còn cộng +5 lượt khi chỉ đánh dấu "từ khó".** Bỏ `hard.length` khỏi `grewLearning`
   (`api/progress.ts`) — gắn nhãn từ khó là một cú bấm, không phải học. Ba tín hiệu còn lại
   (thuộc thêm từ / xong bài ngữ pháp / xong hội thoại) đều là học thật.
4. **IV AES-GCM nay NGẪU NHIÊN, không suy từ hash** — migration `0038_tts_cache_iv.sql` thêm cột
   `tts_cache.iv`. `encryptAudio()` đổi chữ ký trả `{ cipher, iv_b64 }`, mọi nơi ghi phải lưu iv
   (tts.ts + 3 script seed), mọi nơi đọc truyền iv vào (`decryptAudio`/`getClientKeyMaterial`).
   **Tương thích ngược**: cột để NULL được, bản ghi cũ rơi về iv suy từ hash → audio đã trả tiền
   vẫn nghe được, không cần sinh lại, không downtime. Rủi ro nonce reuse của bản ghi CŨ vẫn còn
   cho tới khi chúng được sinh lại — chấp nhận, vì nội dung là bài học công khai.
5. **Generator không còn ghi JSON nén.** `scripts/lib/writeJson.ts` (dùng API Prettier) cho 2
   script ghi vào `apps/english/src/data/`. Trước đây chạy lại generator tạo diff ~44.000 dòng
   THUẦN ĐỊNH DẠNG, đủ để che một thay đổi dữ liệu thật. Đã kiểm chứng: chạy lại cả 2 generator
   giờ cho **diff RỖNG**. Các script ghi vào `public/data/` GIỮ NGUYÊN JSON nén — thư mục đó nằm
   trong `.prettierignore` có chủ ý (tài sản client tải về lúc chạy, nén cho nhẹ).

Bài học đáng ghi: đổi câu SQL `select audio_url, viseme_timeline` (thêm `, iv`) làm mock trong
`tts.test.ts` không khớp chuỗi nữa → vòng `for(;;)` của `claimTtsGeneration` quay vô hạn → test
runner OOM 8GB. Mock phân nhánh theo chuỗi SQL rất giòn; sửa SQL thì phải soát lại mock.

### Audit luồng 2 (từ điển/CEFR) + luồng 3 (audio TTS-STT) (2026-08-12, cùng PR với luồng 1)

**Luồng 2 — dữ liệu SẠCH, chạy kiểm trên dữ liệu THẬT trong repo (12.168 từ, 10 chunk, 3,3MB).**
Kết quả đo: 100% có nhãn CEFR hợp lệ (0 thiếu, 0 sai giá trị) · 0 từ trùng giữa các chunk ·
0 từ dư khoảng trắng · `cefrC1C2Vocab.json` (236 vòng/3.548 từ) và `cefrA1B2ExtraVocab.json`
(374 vòng/6.845 từ) đều 100% tồn tại trong từ điển, đúng cấp mong đợi, không trùng nội bộ và
không chồng lấn nhau. Chạy lại `gen-cefr-c1c2-vocab.ts` → nội dung JSON **giống hệt bit-for-bit**
bản đã commit (bất biến lũy đẳng ✅).

Đã sửa ở luồng 2 (đều là số liệu/ghi chú sai, không đụng dữ liệu):

- `CLAUDE.md` ghi "10.746 từ · 97% có freq · 12.073 từ" — số thật là **12.168 từ · 94,9% có freq**
  (619 từ chưa có). Đã ghi số đo lại kèm phân bố từng cấp.
- `scripts/gen-cefr-c1c2-vocab.ts`: comment nói ngưỡng `MIN_FREQ_RANK=2000` "chỉ bỏ ~9 từ" —
  đo thật thì nay loại **0 từ** (các từ gắn nhầm đã được sửa nhãn ở đợt sau). Giữ ngưỡng làm
  lưới an toàn, sửa lại comment cho đúng.

**Luồng 3 — 1 lỗi đã sửa, 1 rủi ro mật mã để ngỏ.**

Đã sửa: `scripts/seed-all.ts --verify --clean-orphans` **xoá nhầm cache giọng ElevenLabs**.
Script chỉ sinh tác vụ cho giọng Google/Gemini nên mọi dòng `tts_cache` giọng ElevenLabs đều
nằm ngoài "tập kỳ vọng" → bị xếp orphan → `--yes` xoá thật. Nhưng Rachel là giọng người dùng
**chọn tay được** ở Cài đặt (chỉ bị loại khỏi bể random, `RANDOM_EXCLUDED_VOICES`), `/api/tts`
vẫn phục vụ bình thường — tức KHÔNG "mất khỏi dữ liệu app". Xoá đi là vi phạm chính sách cache
(CLAUDE.md mục 6) và phải trả tiền sinh lại. Đã thêm bảo vệ cùng tinh thần với phần bảo vệ câu
pattern ngoài seed-index đã có sẵn, kèm test đối chiếu danh sách giọng ElevenLabs client ↔ server
(`api/_lib/voiceTierParity.test.ts`) — thêm giọng mới ở 1 phía mà quên phía kia sẽ đỏ test.

Để ngỏ, cần quyết: **IV tất định trong AES-GCM**. `ttsCrypto.ts` suy ra cả khoá lẫn IV từ `hash`,
nên nếu cùng một hash từng mã hoá HAI nội dung audio khác nhau thì đó là **dùng lại nonce** —
lỗi mật mã nghiêm trọng (hai ciphertext cùng khoá+IV làm lộ XOR bản rõ và có thể lộ khoá xác
thực GCM). Provider TTS không trả byte giống hệt nhau giữa các lần gọi, mà `tts_cache` có nhánh
`on conflict (hash) do update`. Dự án đã lường phần nào bằng khoá "claim" chống 2 request đồng
thời, nhưng chưa chặn trường hợp sinh lại cùng hash ở hai thời điểm khác nhau. Sửa đúng cách là
IV ngẫu nhiên lưu kèm bản ghi (thêm cột + migration + tương thích ngược cache cũ) — quá lớn để
tự quyết. Round-trip mã hoá/giải mã thì đã có test đầy đủ, không có lỗi.

Đã rà và KHÔNG có lỗi ở luồng 3: round-trip `encryptAudio`/`decryptAudio` · khoá suy ra tất định
theo hash · 3 script seed (`seed-all`, `prefetch-tts-patterns`, `seed-stories-gemini-tts`) tính
hash `text+lang+voice+VOICE_VERSION` khớp nhau và khớp server cho MỌI giọng Google/Gemini (server
chỉ bỏ `lang` với giọng ElevenLabs, mà seed không bao giờ dùng giọng đó → không lệch thật).

### Audit luồng SRS + đếm lượt dùng — 2 lỗi tiềm ẩn đã sửa, 3 việc để ngỏ (2026-08-12)

Người dùng yêu cầu rà triệt để nguồn sai lệch từ đầu vào tới đầu ra, chọn 3 luồng (1 SRS+đếm
lượt · 2 từ điển/nhãn CEFR · 3 audio TTS/STT). **Đợt này mới xong LUỒNG 1**; luồng 2–3 chưa làm.

Đã sửa (mỗi lỗi có test tái hiện FAIL trước / PASS sau):

1. **Khoá SRS bài ngữ pháp lệch chữ hoa/thường** (`apps/english/src/lib/srs.ts`). `addToSRS()`
   hạ chữ thường TOÀN BỘ khoá khi GHI, nhưng `getDueGrammarLessonIds()` đọc bằng
   `grammar:${lessonId}` giữ nguyên dạng. LessonId có chữ hoa → ghi một khoá, đọc một khoá
   khác → bài đó KHÔNG BAO GIỜ đến hạn ôn, hỏng im lặng. Đã kiểm bằng thực nghiệm: cả **78
   lessonId hiện tại đều chữ thường** nên chưa ai gặp và **dữ liệu đã lưu không đổi** — sửa là
   chặn sẵn cho lessonId thêm về sau.
2. **Truy vấn hiển thị lượt Free không lọc `subject`** (`api/usage-summary.ts`). Hàm SQL
   enforce `consume_rolling_credit` lọc `subject = p_subject` (migration 0029) nhưng truy vấn
   hiển thị cộng MỌI subject → khi có môn thứ 2 (ADR-0001), UI báo còn nhiều lượt hơn số
   server thật sự cho phép. Hiện chỉ có môn `english` nên **số hiển thị hôm nay không đổi**.

Để ngỏ, cần người dùng quyết (KHÔNG tự sửa vì đều làm ĐỔI CON SỐ thật):

- **`subject_limits` là bảng chết**: migration 0029 tạo bảng + cờ `enforced` mô tả là "phanh
  tay admin tắt enforce hạn mức theo môn", nhưng **không dòng code nào đọc nó**. Hành vi hiện
  tại = luôn enforce (trùng mặc định `enforced=true`), nên vô hại, nhưng tính năng quảng cáo
  trong tài liệu thì chưa tồn tại.
- **Hoàn lượt qua nửa đêm bị mất**: `checkAndConsumeUsage` và `refundUsage` mỗi bên tự gọi
  `today()`. Lượt tiêu lúc 23:59 giờ VN mà provider AI lỗi và hoàn lúc 00:01 → hoàn vào dòng
  ngày MỚI (`credits_spent = greatest(0-1, 0) = 0`) → người dùng mất 1 lượt. Hiếm nhưng thật.
  Sửa được sạch bằng cách cho `checkAndConsumeUsage` trả về `day` đã tiêu để `refundUsage`
  dùng lại — đụng 3 file gọi, nên chờ duyệt.
- **`grewLearning` cộng +5 lượt khi chỉ đánh dấu "từ khó"** (`api/progress.ts`): `hard.length`
  dài ra cũng tính là "học thật". Bật/tắt 1 từ khó là lấy được +5 của ngày mà không học. Trần
  vẫn là 5/ngày (idempotent) nên thiệt hại có chặn trên.

Bổ sung quy trình: thêm **mục 5 "Audit LUỒNG DỮ LIỆU"** vào `docs/framework/QUY-TRINH-AUDIT.md` —
prompt 4 giai đoạn dùng lại được (lập ma trận A×B trước khi rà · kiểm chứng bằng test bất biến ·
sửa phải có test FAIL trước/PASS sau · điều kiện dừng theo bằng chứng), kèm bảng luồng của dự án
và các cặp đường song song hay lệch nhau. Audit 7 tầng cũ quét theo TẦNG CÔNG CỤ nên không bắt
được loại lỗi này — mọi cổng vẫn xanh trong khi con số hiển thị cho người học vẫn sai.

Đã rà và KHÔNG có lỗi (khỏi rà lại): chữ ký 7 hàm SQL khớp 100% lời gọi TS · công thức cửa sổ
trượt `day > d - 7 and day <= d` giống hệt giữa hàm enforce và truy vấn hiển thị · hướng ưu
tiên khi hoà `reps` nhất quán giữa merge client (`progressSync.ts`) và merge server
(`progressMerge.ts`) · `vnDateStr` client và server cùng công thức UTC+7.

### Rà soát tính năng chuyển đổi giọng đọc — 5 lỗi + 5 cải tiến (2026-08-10, PR #526)

Người dùng yêu cầu "kiểm tra cấu trúc, tính năng, đặc biệt tính năng chuyển đổi giọng đọc". Rà toàn
bộ đường giọng đọc (`apps/english/src/lib/tts.ts` · `voiceTiers.ts` · `packages/core-ai/tts.ts` ·
`api/_lib/voiceAccess.ts`). Kết quả: phần lớn ĐÚNG thiết kế (chiều A/B truyền đúng lang ở cả 3 chỗ
gọi trong `Speaking.tsx`; server là nguồn sự thật; các bug cũ đều còn hàng rào chống), nhưng tìm ra
**5 vấn đề thật**, đã sửa hết:

1. 🔴 **Phần sửa lỗi/giải thích KHÔNG BAO GIỜ được đọc** — hồi quy từ PR #476 (2026-08-04), tức là
   điểm khác biệt cốt lõi của app im tiếng suốt ~6 ngày trên production mà không ai phát hiện.
   `speakBilingual()` chốt "vé" `playToken` TRƯỚC khi phát, nhưng PR #476 thêm `playToken++` vào
   `speakViaGoogle()` (để giải phóng lượt phát trước còn treo) → chính câu thoại của nó cũng làm vé
   lệch → luôn `return` trước phần feedback. Nay `speak()/speakViaGoogle()` **trả về đúng số vé của
   lượt phát vừa rồi** để nơi gọi so lại; huỷ khi bấm Tắt tiếng vẫn chạy đúng như cũ. Có test hồi quy
   khẳng định câu thoại VÀ phần sửa lỗi đều được phát.
2. 🔴 **Sai mimeType khi server hạ giọng** — gói Free mở trang đọc truyện: client xin giọng Gemini
   (WAV), server hạ về Chirp3-HD (mp3), nhưng client vẫn gắn nhãn `audio/wav` cho Blob → Safari/iOS
   có thể không phát. Nay `/api/tts` **trả kèm `voice` thật sự đã dùng** (giống `/api/pronunciation`
   vốn đã có), client bám theo nó để chọn mimeType + lưu vào IndexedDB (entry cũ thiếu trường này vẫn
   đọc được, không cần nâng version cache). Thêm `getStoryVoice(kind, plan)` tự hạ giọng ngay ở client.
3. 🟡 **Hạ gói làm đổi luôn giới tính giọng** — mọi nhánh hạ giọng đều rơi về `Kore` (nữ), nên user
   đang dùng giọng nam mà hết hạn gói bị đổi phắt sang giọng nữ. Nay hạ giọng **giữ nguyên giới tính**
   (`defaultVoiceForGender`, khớp tay cả 2 phía); riêng giọng Gemini ưu tiên giọng Chirp3-HD cùng tên
   (`Gemini-Leda → Leda`) trước khi rơi về mặc định.
4. 🟡 **Random có thể trúng giọng Studio** — Studio giá $24/1 triệu ký tự, KHÔNG có hạn mức miễn phí
   (đắt gấp 12 lần Chirp3-HD), nghĩa là user VIP vô tình đẩy chi phí lên gấp 12 mà không hề chọn. Nay
   Studio/ElevenLabs **không bao giờ tự nhảy vào bể random** (`RANDOM_EXCLUDED_VOICES`) và cũng không
   bị nạp trước hàng loạt — vẫn dùng đầy đủ khi người dùng CHỦ ĐỘNG chọn ở Cài đặt.
5. 🟡 **Không có gì chặn khi 2 bảng phân quyền giọng lệch nhau** — cả 2 file chỉ ghi "PHẢI khớp tay".
   Thêm `api/_lib/voiceTierParity.test.ts` đối chiếu tự động client ↔ server (chạy trong `npm test`,
   chặn CI). Nhân đó đưa giọng Gemini vào bảng tier phía client cho khớp hẳn bảng server.

Ngoài ra, **tách giọng giải thích khỏi giọng hội thoại** (đúng mô tả "TTS hai giọng riêng" ở
`CLAUDE.md` mục 1): trước đây cả hai dùng chung một giọng, chỉ khác locale
(`en-US-Chirp3-HD-Kore` → `vi-VN-Chirp3-HD-Kore`) nên người học nghe ra vẫn là MỘT người. Nay phần sửa
lỗi mặc định đọc bằng **giọng khác giới tính** với giọng hội thoại — không cần cấu hình gì. Có công
tắc + bộ chọn riêng ở Cài đặt (`VoicePicker`) để tắt (về hành vi cũ) hoặc chọn giọng khác;
`speakBilingual()` nhận thêm tham số `feedbackVoice` (mặc định `getNativeVoicePref()`).

Cổng: build ✅ · typecheck ✅ · lint ✅ (0 cảnh báo) · format ✅ · test ✅ 3013/3013.

### Quy ước mới: tạo PR = coi như đã xong, ghi tài liệu ngay trong PR đó (2026-08-09)

Người dùng chốt: **không chờ merge mới ghi nhận**. Mỗi PR phải tự mang theo phần cập nhật `*.md`
liên quan — `PROGRESS.md` là bắt buộc, thêm `CLAUDE.md`/`PROJECT.md`/`docs/*` nếu thay đổi chạm tới —
ghi rõ số PR, ngày, việc đã làm và quyết định kèm theo. Đã thêm vào `CLAUDE.md` mục 3 để mọi phiên sau
đọc được. Lý do: phiên sau đọc `PROGRESS.md` là đủ, không phải lần lại `git log` hay hỏi lại người
dùng, và tránh cảnh dồn một loạt PR đã merge rồi mới ngồi ghi bù (đúng tình huống của PR docs này).

### Sửa & nâng cấp chế độ tải trước SRS Offline (2026-08-08→09, PR #521 · #522 · #524)

Người dùng báo "chế độ tải trước có hiển thị nhưng thấy không hoạt động". Điều tra ra **4 lỗi cùng
lúc** khiến thanh "Tải trước SRS Offline" gần như vô dụng — mỗi lỗi một mình đã đủ làm hỏng tính năng:

1. **Chỉ nạp ĐÚNG 1 giọng** (`getVoicePref()`). Khoá cache audio có chứa tên giọng, mà chế độ
   "giọng ngẫu nhiên" bốc giọng mới mỗi phiên/tab → mở lại app là trượt cache, offline không nghe
   được gì. Nay nạp **TẤT CẢ giọng gói cho phép** (Free 4 · Pro 8 · VIP 17) qua `getPreloadVoices()`
   mới trong `voiceTiers.ts` (loại Studio khi đọc không phải tiếng Anh; **giữ** ElevenLabs vì
   `/api/tts` có hỗ trợ — khác `pickRandomAllowedVoice()` vốn dành cho `/api/pronunciation`).
2. **Khoá kiểm tra lệch khoá thật.** Bộ đếm tự ghép `audioCacheKey(word,'en-US',voice)`, còn bộ phát
   bỏ `lang` với giọng ElevenLabs và hạ Studio→Chirp3-HD khi đọc tiếng Việt → **luôn báo "chưa có"
   dù đã tải xong**. Nay tách `speechCacheKey()` xuất từ `lib/tts.ts`, cả hai bên dùng chung.
3. **Bộ đếm và bộ tải nhìn hai danh sách khác nhau.** Chưa có thẻ đến hạn thì bộ đếm trả
   `0/0 → isFullyPrepared: true`, trong khi bộ tải lại tải 20 từ đầu pool → bấm "Tải ngay" xong
   thanh **vẫn 0/0**, y như không chạy. Nay dùng chung `getPreloadTargets()` + cờ `isLookahead`.
4. **Vượt hạn mức server + đếm thiếu.** Bộ tải tải cả câu ví dụ nhưng bộ đếm chỉ đếm từ; nhịp
   `sleep(60ms)` ≈ 1000 request/phút trong khi `/api/tts` giới hạn **60/phút mỗi IP** → 429 hàng loạt,
   phần lớn file tải hụt trong im lặng.

Sau khi sửa 4 lỗi (PR #521), nâng cấp tiếp:

- **Nhịp gọi API theo ngân sách trượt 60 giây** (PR #522), thay cho nghỉ cố định 1250ms. Server có
  **2 bộ đếm, đều 60/phút mỗi IP** (một cho toàn bộ `/api/tts`, một riêng cho đường tạo audio mới) →
  ngân sách client đặt **50/cửa sổ** nằm dưới cả hai, chừa ~10 lượt cho người dùng bấm nghe song song.
  Bộ đếm ở **cấp module** (không phải mỗi lượt tải một bộ) — bấm Dừng rồi Tải lại ngay không được cấp
  thêm ngân sách, vì hạn mức server tính theo IP chứ không theo lượt bấm.
- **Phạm vi gộp thêm từ mới của tab "Hôm nay"** (PR #524) — trước chỉ có thẻ SRS đến hạn, nên mất
  mạng giữa buổi là học tiếp không có audio dù thanh báo đã xong. Khử trùng từ nằm ở cả hai nhóm.
- **Mục phải gọi API nạp SAU CÙNG** (PR #524): tách 2 lượt — lượt 1 rà IndexedDB đánh dấu xong ngay
  phần đã có (không request, không chờ), lượt 2 mới tải phần thiếu. Trước đây hai loại xen kẽ nên mục
  đã có sẵn nằm sau một mục đang chờ ngân sách cũng bị kẹt theo dù chẳng tốn gì; nay bấm Dừng giữa
  chừng vẫn giữ trọn phần miễn phí.
- **UI**: thanh tiến độ, nút **Dừng**, dòng giải thích phạm vi (N từ × M giọng, gồm cả câu ví dụ).

Ghi chú chi phí: gói VIP (17 giọng) lần tải đầu ≈ 680 mục ≈ 14 phút. Là hành động người dùng **chủ
động bấm**, có tiến độ + nút Dừng, và cache TTS dùng chung toàn hệ thống (`tts_cache`) nên người dùng
sau hưởng luôn cache đã tạo. Mục đã có sẵn không tốn request nào.

### Gom cài giọng đọc & tốc độ phát về trang Cài đặt (2026-08-08, PR #522)

`VoiceMenu` + `RateToggle` nằm rải rác trên header và trong nội dung của Từ điển, Cụm từ, Nghe,
Luyện nói, tab Học. Cả hai vốn **đã lưu localStorage và áp dụng toàn cục**, nên đặt ở từng trang chỉ
gây rối và khiến người dùng tưởng mỗi trang một giọng/tốc độ riêng.

- Gỡ khỏi mọi trang; **xoá hẳn `VoiceMenu.tsx`** (không còn nơi dùng).
- Trang Cài đặt giữ `VoicePicker` sẵn có, **thêm mục "Tốc độ phát"** — nếu không thì sau khi gỡ hết,
  tốc độ phát sẽ không còn chỗ nào chỉnh được.
- Dọn prop `plan` đã thành thừa dọc chuỗi `StudyPanel → TodayLesson → BatchDoneView` (chỉ tồn tại để
  truyền xuống `VoiceMenu`).

### Nhãn "Sắp ra mắt" cho tính năng đối thoại với AI (2026-08-09, PR #524)

Thêm `components/ComingSoonBanner.tsx` dùng chung, đặt ở **Luyện nói song ngữ** (`/luyen-noi`) và
**Avatar AI nói chuyện** (`/avatar-demo`). Kiểu hiển thị chốt với người dùng: **vẫn vào được và dùng
bình thường**, chỉ thêm banner báo bản đang hoàn thiện — không chặn route, không ẩn khỏi menu, nên khi
xong chỉ cần gỡ 1 dòng. Màu chữ dùng đúng bộ class của `RewardTipBanner` (`text-white` /
`text-zinc-400`) vốn đã qua cả 2 cổng a11y (AA mọi thành phần + AAA cho nội dung/tiêu đề).

### Đợt trả nợ kỹ thuật 2026-08-08 (PR #520)

Trả 4/5 món trong mục "Nợ kỹ thuật còn mở". Món react-router giữ nguyên theo quyết định đã chốt
(app dùng BrowserRouter thuần, không chạy RSC; bản vá đòi React 19).

1. **Chu trình import: 5 → 0.** Ghi nhận cũ là 3 (trong `data/`), thực tế `npm run codemap -- cycles`
   báo **5** — có thêm `srs ↔ offlineSrsStore` và `srs → progressSync → offlineSrsStore → srs`, tức
   đã lan sang `lib/` (logic chạy thật, không chỉ dữ liệu tĩnh). Cả 5 đều cùng một dạng: cạnh quay
   lại chỉ là `import type`. Gỡ bằng 3 file **chỉ-chứa-kiểu**: `lib/srsTypes.ts`, `data/cefrTypes.ts`,
   `data/curriculumTypes.ts`; file gốc `export type` lại nên **không nơi nào phải đổi đường dẫn
   import**. Tiện thể dời 2 import bị đặt lạc giữa file (một cái cắt đôi khối comment ở
   `progressSync.ts`) lên đầu file.
2. **`.tap-44` từ no-op thành vùng chạm thật.** Đo bằng Playwright trên 9 trang, khung 390×844:
   **9 phần tử < 44px** (nhỏ nhất: nút "Ẩn gợi ý huy hiệu" 16×16, avatar header 28×28). Nay
   `.tap-44` đặt `min-height/min-width: 44px` thật → **0 phần tử < 44px**. Thêm biến thể
   **`.tap-44-y`** (chỉ ép chiều cao) cho control vốn đã rộng — ép cả `min-width` lên từng phân đoạn
   của thanh gạt `Nữ|Nam`, `0.75×|1×|1.25×` làm **header trang Luyện nói tràn, đẩy nút avatar khỏi
   màn hình** (bắt được nhờ chụp ảnh trước/sau, không phải suy đoán). Công tắc 44×24 ở `VoicePicker`
   bỏ hẳn `.tap-44` (ép cao 44 làm hỏng hình viên thuốc; rộng 44 + đứng riêng hàng vẫn đạt WCAG 2.2
   AA 2.5.8).
3. **Token `--z-500` đạt AA ở cả 5 theme.** Giá trị mới tính bằng script (giữ sắc thái, chỉ đổi độ
   sáng), đo trên 3 bề mặt thật z-950/900/800: dark-blue 6.09/5.59/4.58 · blue-sky 5.42/5.17/4.59 ·
   pink 5.42/5.22/4.65 · vibrant 5.81/5.37/4.59 · kid 5.33/5.08/4.62 — vẫn mờ rõ so với z-400
   (6.4–9.2) nên **không mất phân cấp chữ chính/chữ phụ**. `KNOWN_LOW` 17 cặp → 5.
   **Nhóm nền `z-700` giữ lại CÓ CHỦ Ý:** đo thực tế cho thấy ép z-500 đạt AA cả trên z-700 thì nó
   phải sáng **ngang z-400** (8.59 so với 8.51) — tức xoá luôn khái niệm "chữ mờ". Ghi chú cũ
   "z-700 chỉ dùng làm hover" nay đã **lỗi thời**: `ShareProgress`/`Login` dùng nó làm nền nút gạt
   thật, nhưng chữ đặt lên là `text-white` (đạt AA), không chỗ nào đặt chữ mờ lên z-700.
4. **Nhánh phá huỷ `restore:r2 --restore-into` đã kiểm chứng THẬT.** Dựng cụm Postgres 16 nháp, nạp
   `schema.sql` + toàn bộ migration (**47 bảng** `public` + `english`) + 1 user thật, `pg_dump | gzip`
   đúng định dạng cron, rồi restore vào một database **đã có sẵn dữ liệu rác**: rác bị xoá sạch,
   danh sách 47 bảng **giống hệt** nguồn, hàng dữ liệu về đủ. 3 hàng rào an toàn đều chặn đúng
   (thiếu `--yes` / thiếu `RESTORE_PSQL_URL` / `--from-file` trỏ file không tồn tại).
   Thêm tuỳ chọn **`--from-file`** cho `scripts/restore-pg-from-r2.ts` — vừa là cách chạy thử được
   nhánh này mà không cần khoá R2, vừa có ích thật trong sự cố: restore hỏng giữa chừng thì dùng lại
   file đã tải, không tải lại bản dump vài GB trong lúc dịch vụ đang sập (file của người dùng
   **không bị tự xoá**, khác file tạm tự tải).

### ADR-0002 — Quản lý người dùng đa lĩnh vực: Bước 1–4 + 6 XONG (2026-08-08, PR #517 · #518)

Chuẩn bị nền tảng tài khoản dùng chung cho các môn tiếp theo (ADR `docs/adr/0002-quan-ly-nguoi-dung.md`).
Bước 5 **bỏ qua có chủ ý** (roles/audit_log/registry xoá tài khoản chưa có tính năng thật để gắn vào —
admin hiện là whitelist email trong `.env`).

- **Bước 1 — `identities`** (migration `0034`): tách 4 cột OAuth cứng (Google/Facebook/Apple/Microsoft)
  trên `users` ra bảng riêng, dual-write để không hồi quy; thêm provider mới không phải `ALTER` bảng lõi.
- **Bước 2 — `entitlements`** (migration `0035`): quyền lợi theo **sản phẩm** (`user_id, product, tier,
source, granted_at, expires_at`), backfill từ `profiles.plan`. CHƯA đổi code đọc/ghi gói cước —
  bảng sẽ lệch dần cho tới bước rewiring, đã ghi rõ trong ADR.
- **Bước 3 — cookie SSO**: `packages/core-auth/sessionCookie.ts` (mới) — cookie HttpOnly/SameSite=Lax
  (Secure + `Domain=.donghanhcungban.org` chỉ ở production) dùng CHUNG `session_token` đã có.
- **Bước 4 — `english.user_profile`** (migration `0036`): tách 4 cột onboarding chỉ đúng với tiếng Anh
  (`user_level`, `goal`, `daily_minutes`, `age_group`); `api/profile.ts` tạm thời vẫn đọc/ghi cột cũ.
- **Bước 6 — bỏ Bearer, chỉ còn cookie** (migration `0037` xoá 4 cột OAuth cũ): `validateAuth()` đọc
  cookie; đọc kênh OAuth từ `identities`. ⚠️ **Đánh đổi người dùng đã chấp nhận:** mọi phiên tạo
  TRƯỚC khi Bước 3 lên production đều chỉ có Bearer → sẽ nhận 401 và phải **đăng nhập lại một lần**.
- ⚠️ **Việc tay trước khi deploy:** chạy `npm run migrate:pg` trên VPS (4 migration mới `0034`–`0037`).
  Deploy Bước 6 phải đi SAU khi Bước 3 đã chạy thật ít nhất một nhịp, nếu không mọi phiên đều đứt.

### Sửa lỗi trang Nghe/Truyện + nút phát âm (2026-08-08, PR #516 · #519)

- **`/truyen-song-ngu`** (PR #516): chặn bấm loa câu lẻ trong lúc "Phát tất cả" chạy (chồng tiếng);
  `data/stories/loader.ts` không còn cache VĨNH VIỄN lỗi mạng (tự thử lại lần sau); thêm chip lọc theo
  cấp CEFR (A2/B1/B2); thêm `aria-live` báo câu đang đọc + `aria-label` tường minh cho nút loa.
- **Nút phát âm** (PR #519): bể random giờ nhận `{ lang, exclude }` — không bốc lại giọng vừa nghe
  (Free chỉ 4 giọng nên ~25% lần bấm bị lặp) và bỏ giọng Studio khi đọc tiếng Việt (Google không có
  Studio cho `vi-VN`, server hạ về Kore/Puck → 2 giọng đó trúng gấp đôi + tốn 1 lượt gọi API vô ích).
  Nhãn giới tính đổi theo chiều học (`isA`) cho khớp `VoiceMenu`/`VoicePicker`. +9 ca test `voiceTiers`.

### Gợi ý "cách kiếm huy hiệu & thưởng hiệu quả" cho người dùng (2026-08-07)

- **Trang Giới thiệu** (`/gioi-thieu`, `About.tsx`): mục nhắc huy hiệu bổ sung chiến lược cụ thể
  — ưu tiên giữ streak + làm challenge 1 phút mỗi ngày (2 việc tốn ít thời gian nhất nhưng lên
  huy hiệu nhanh nhất), từ vựng/CEFR tự cộng dồn theo lộ trình học bình thường.
- **Banner tự hiện rồi tự ẩn** (`components/RewardTipBanner.tsx` + `lib/rewardTip.ts`), gắn ở
  Home — trang vào đầu tiên, dễ tiếp cận nhất: hiện 1 LẦN cho mỗi user (khác `comeback.ts` là
  tắt lại theo ngày), tự ẩn sau 12s hoặc đóng tay, nhớ "đã xem" vĩnh viễn qua
  `localStorage` (`et_reward_tip_seen_<uid>`) nên không hiện lại nữa — tránh làm phiền.

### Gợi ý email từ danh sách người dùng khi cấp gói tay (2026-08-07, PR #512)

- Tab admin "Người dùng, Thanh toán & Từ cấm" → bấm 1 dòng ở bảng "Người dùng"
  (`AdminUsersPanel`) giờ tự điền email của user đó vào form "Cấp gói Pro/VIP thủ công"
  (`AdminGrantPlanPanel`) ngay bên dưới, thay vì phải gõ tay/copy-paste.
- Ô nhập email trong form cấp gói có thêm gợi ý autocomplete (thẻ HTML `<datalist>`) lấy từ
  đúng danh sách email đã tải ở bảng "Người dùng" (không gọi API riêng, không lộ thêm dữ liệu
  ngoài phạm vi admin đã thấy trên cùng trang).
- Kỹ thuật: tách state dùng chung (`prefillEmail`, `emailSuggestions`) ra component bọc mới
  `AdminGrantPlanSection` (`apps/english/src/pages/AdminDashboard.tsx`), truyền xuống qua props
  mới `onSelectEmail`/`onEmailsChange` (`AdminUsersPanel.tsx`) và `prefillEmail`/
  `emailSuggestions` (`AdminGrantPlanPanel.tsx`). Không đổi API/schema.

### Gemini TTS cho trang đọc truyện + đổi thứ tự ưu tiên AI chat (2026-08-06)

- **Giọng Gemini TTS riêng cho truyện cổ tích/ngụ ngôn** (`/stories`, `/stories/:id`): thêm
  provider mới `packages/core-ai/geminiTts.ts` (khác hẳn Google Cloud TTS Chirp3-HD đang dùng
  cho phần còn lại của app) — dùng `GEMINI_API_KEY` đã có sẵn, model TTS chuyên dụng cấu hình
  qua `GEMINI_TTS_MODEL` (mặc định `gemini-2.5-flash-preview-tts`, KHÔNG dùng chung
  `GEMINI_MODEL` của chat vì model chat thường không hỗ trợ audio). Điều khiển phong cách đọc
  bằng câu lệnh tự nhiên ngay trong prompt (mỗi thể loại 1 giọng + 1 phong cách cố định, dặn
  model tự biến hoá cảm xúc theo nội dung từng câu) — đọc truyền cảm hơn Chirp3-HD. Gemini trả
  PCM thô → tự đóng gói WAV (`geminiTts.ts`), client phát đúng qua `blobMimeTypeForVoice()`
  (`apps/english/src/lib/tts.ts`). `STORY_KIND_VOICE` (`apps/english/src/lib/stories.ts`) đổi
  từ giọng Chirp3-HD sang 6 giọng Gemini theo thể loại. Gắn đầy đủ vào `/api/tts` (như
  ElevenLabs) nên vẫn tự tạo audio động nếu chưa seed. Seed trước: `npm run
seed:stories:gemini` (script riêng `scripts/seed-stories-gemini-tts.ts` — tách khỏi
  `seed-all.ts` vì lược đồ Google-only ở đó không áp dụng). Gói Free tạm không có giọng Gemini
  riêng cho truyện (clamp về `DEFAULT_VOICE` như các giọng "cao cấp" khác — hành vi có sẵn từ
  trước, không phải thay đổi mới).
- **Đổi thứ tự ưu tiên provider AI chat** (`packages/core-ai/ai.ts`, `/api/agent`): từ
  Gemini → Groq → Anthropic thành **Groq → Anthropic → Gemini** (Gemini xuống cuối). Giữ
  nguyên cơ chế fallback (lỗi ở 1 nhánh mà còn provider dự phòng thì tự chuyển tiếp, chỉ hoàn
  lượt dùng khi KHÔNG còn provider nào khác) và giữ nguyên status/hành vi gốc của từng
  provider khi nó là nhánh cuối cùng (vd Anthropic forward thẳng status/body, không bọc JSON).

### Nâng cấp Hệ thống & Tích hợp AgentMemory (2026-08-04 → 2026-08-05)

1. **Email Nhắc học Thông minh & Preconnect Domains (2026-08-04)**:
   - Thêm migration `postgres/migrations/0033_email_reminders.sql` cho bảng `public.email_reminders` quản lý cooldown 3 ngày.
   - Thêm service `api/_lib/emailReminders.ts` tự động chọn mẫu thư nhắc học theo ngữ cảnh (chuỗi ngày 🔥, SRS 🧠, mục tiêu 🎯), chạy hàng ngày lúc 13h UTC trong `server.ts`.
   - Bổ sung `<link rel="preconnect">` trong `index.html` tới Groq, OpenAI, Anthropic, Sentry để giảm ~150ms latency.

2. **Sửa lỗi Schema Cầu dao AI Admin Dashboard (2026-08-04)**:
   - Sửa truy vấn SQL trong `api/admin-system-control.ts` nhầm lẫn giữa key-value pair và cột boolean `ai_circuit_breaker` của dòng duy nhất `id = 1` trong bảng `public.app_settings`.

3. **Tùy chỉnh Cử chỉ Kéo 1 tay (Reachability) & UI Chevron (2026-08-05)**:
   - Nâng giới hạn tự thu lại từ 3s lên 10s (`apps/english/src/lib/useOneHandedDrag.ts`).
   - Mở rộng dải trigger từ 2.375rem lên 3.5rem (rộng hơn ~47%), hiển thị mũi tên chevron animate bounce (▼ khi tắt, ▲ khi bật) trên `BottomNav.tsx`.
   - Cập nhật biến CSS `--bnav-h` tương ứng trong `index.css`.

4. **Nâng Coverage Branch vượt Cổng CI & Fix Auto Deploy (2026-08-05)**:
   - Bổ sung 24 unit test cho các handler API (`emailReminders`, `progress`, `admin-payments`, `admin-system-control`, `admin-feedback`, `checkout`, `payment-history`, `payment-status`, `plan-prices`).
   - Nâng Branch Coverage từ **88.57%** lên **89.05%** (vượt mốc 89% của Vitest).
   - Sửa lỗi TypeScript `TS18048` `sqlCall is possibly undefined` ở `admin-payments.test.ts` giúp Auto Deploy xanh 100%.

5. **Tích hợp Bộ nhớ Dài hạn AgentMemory (`rohitg00/agentmemory`) (2026-08-05)**:
   - Cài đặt `@agentmemory/agentmemory` v0.9.28 toàn cục.
   - Cấu hình chạy chế độ Standalone Local SQLite (`STANDALONE_MCP=1`) với DB path `C:/Users/liend/.agentmemory/local.db`.
   - Đăng ký MCP Server toàn cục trong `C:\Users\liend\.gemini\config\mcp_config.json`, cấp dự án `.agents/mcp_config.json`, và `C:\Users\liend\.claude\mcp_config.json`.

### Sửa mất dữ liệu học tập (2026-08-04, điều tra "admin mất hết dữ liệu")

**Nguyên nhân:** `pushProgress()`/`pushProgressAsync()` (`lib/progressSync.ts`) mỗi lần gọi đều
đọc TOÀN BỘ localStorage (learned/hard/srs/cefr\_\*/placement/weeklyGoal/achievements) rồi gửi lên
`POST /api/progress`, và server GHI ĐÈ THẲNG (`on conflict do update set x = excluded.x`) — không
hợp nhất như phía client (`pullProgress()`) vẫn làm. Nếu máy/tab VỪA mở app (localStorage rỗng/cũ,
vd trình duyệt mới, xoá cache, ẩn danh — admin hay làm khi test) và người dùng bấm học 1 từ NGAY
trước khi `pullProgress()` (chạy tự động lúc mở app, `lib/useCloudSync.ts`) kéo + hợp nhất dữ liệu
thật về xong, `pushProgress()` gửi lên bản RỖNG/CŨ → server ghi đè, xoá mất TOÀN BỘ tiến độ đã lưu.

**Đã sửa 2 lớp:**

1. **Client (lớp chính):** mọi lượt gọi `pushProgress()`/`pushProgressAsync()` giờ CHỜ lượt
   `pullProgress()` đang chạy (nếu có) xong rồi mới đọc localStorage để gửi — đảm bảo luôn gửi bản
   đã hợp nhất đầy đủ, không bao giờ gửi bản rỗng do race. Xem đầu file `lib/progressSync.ts`.
2. **Server (lớp phòng thủ, chỉ cho trường KHÔNG có thao tác "bỏ đánh dấu" thật):** `POST
/api/progress` hợp nhất `srs`/`cefrExams`/`placement`/`weeklyGoal` với dữ liệu đã có trên server
   trước khi lưu (`api/_lib/progressMerge.ts`) — an toàn vì không hành động nào của người dùng làm
   các trường này nhỏ lại. **CHỦ Ý KHÔNG** hợp union cho `learned`/`hard`/`cefrGrammar`/
   `cefrDialogues`/`cefrUnlocked`/`achievements` vì có thao tác bỏ đánh dấu thật
   (`unmarkLearned`/`toggleDifficult` tắt/`unmarkGrammarDone` — `lib/vocab.ts`/`lib/cefrProgress.ts`)
   — hợp union sẽ làm việc bỏ đánh dấu không bao giờ có hiệu lực.

Test mới: `api/_lib/progressMerge.test.ts` (hàm hợp nhất thuần), `api/progress.test.ts` (2 test
merge + xác nhận KHÔNG hợp union mảng), `apps/english/src/lib/progressSync.test.ts` (test race
push-chờ-pull). Toàn bộ cổng CLAUDE.md mục 8 xanh (typecheck/lint/format/2579 test/build).

### Nâng coverage 2026-08-03

Theo yêu cầu người dùng "nâng hạn mức coverage lên 90" — thay vì đặt số cứng ngay (sẽ làm CI đỏ vì
chưa có test tương ứng), đã: (1) loại khỏi phép đo các file mà unit test không mang giá trị thật
(vỏ bọc API trình duyệt/nền tảng — MediaRecorder/IndexedDB/Web Speech/vibrate/service worker, hook
React, gửi-rồi-quên/khởi tạo SDK ngoài — xem danh sách `exclude` trong `vitest.config.ts` kèm lý do
từng nhóm); (2) viết mới ~70 file test cho toàn bộ handler API + `api/_lib` + lib logic thuần +
lib client gọi API + `core-auth`/`core-ai` còn thiếu (giao 9 việc song song cho subagent, mỗi việc
yêu cầu ≥90% statements/branches cho phạm vi được giao); (3) đo lại và chốt ngưỡng theo SỐ THẬT đo
được, không đặt số mong muốn. Kết quả: stmts/lines 55.9→93.71 · branches 87.67→89.69 · funcs
82.46→96.27 (2286 test, 145 file, tất cả xanh; lint/typecheck sạch). Nhân tiện phát hiện + sửa 2
lỗi thật trong test có sẵn (không đụng code nguồn): `sharedAudio` singleton trong `tts.ts` khiến
test mới `speakBilingual` treo mãi vì audio giả không tự bắn `onended`; `vi.restoreAllMocks()` ở
`tts.test.ts` xoá nhầm implementation của `getAccessToken` (vi.mock factory) khiến các test SAU đó
trong cùng file bị lỗi "Chưa đăng nhập" dây chuyền.

**Nợ còn mở, chưa sửa (nằm ngoài phạm vi việc này):** `api/pronunciation.ts` gọi `.toLowerCase()`
lên tham số `voice` trước khi so khớp `VOICE_IDS`/`STUDIO_VOICE_IDS` (vốn viết hoa như `Kore`,
`Studio-O`) — `?voice=Kore` từ client luôn bị coi là không hợp lệ, rơi về `DEFAULT_VOICE`. Cần rà
lại có phải bug thật không rồi sửa riêng.

## GĐ2 (nền tảng đa môn) — đang chuẩn bị nội dung & engine

**[2026-08-01] Đặc tả GĐ2 + kho kiến thức 4 môn + ENGINE CHẤM đã có code chạy.**

- **Phạm vi GĐ2 mở rộng theo yêu cầu người dùng:** không chỉ lớp 6-9 mà đủ **mầm non → cấp 3**.
  Vì đây đúng rủi ro 🔴 cao nhất của kế hoạch tổng ("phình phạm vi"), chia **4 đợt có cổng ra
  riêng**: 2a cấp 2 → 2b cấp 1 → 2c mầm non → 2d cấp 3. Đợt sau chỉ mở khi đợt trước đạt cổng.
  Đặc tả: `docs/research/dac-ta-gd2-mon-toan-2026-08-01.md` (9 PR cho đợt 2a).
- **Kho kiến thức 4 môn** (bám GDPT 2018, chưa duyệt chuyên môn — **cổng bắt buộc trước khi đưa
  vào `data/`**): `kho-kien-thuc-{toan,ly,hoa,sinh}-gdpt2018.md`.
- **SGK thống nhất toàn quốc từ năm học 2026-2027** — bộ "Kết nối tri thức với cuộc sống". Đổi
  giả định theo hướng TỐT hơn: trước phải viết trung lập giữa 3 bộ sách, nay bám được đúng thứ tự
  bài học sinh học trên lớp. AI **không tải được SGK** (proxy sandbox chặn `taphuan.nxbgd.vn` —
  `CONNECT tunnel failed 403`). Đối chiếu thực hiện ở **PHIÊN LOCAL** — PDF chép vào `tai-lieu-sgk/`
  (đã có trong `.gitignore`, không lọt lên GitHub). Quy trình: `docs/research/huong-dan-doi-chieu-sgk.md`.
  **✅ [2026-08-01] Đã đối chiếu xong Toán lớp 6-9 (PR #411, merged)** — PDF là ảnh scan không có
  text layer nên phải OCR (`tesseract-ocr` + gói tiếng Việt, script tái dùng ở `scripts/ocr-sgk.py`).
  Kết quả: mục lục thật 4 lớp ở `docs/research/muc-luc-sgk/toan-{6,7,8,9}.md`; đối chiếu với
  `kho-kien-thuc-toan-gdpt2018.md` phát hiện **24 mục lệch** (21 thiếu `[+]`, 2 sai vị trí `[≠]`,
  1 nghi vấn `[−]`, ghi ở §8 Nhật ký đối chiếu của file đó) — đáng chú ý nhất: thiếu hẳn chương
  bất đẳng thức/bất phương trình bậc nhất lớp 9, căn bậc hai dạy từ lớp 7 (không phải lớp 9), thiếu
  chương tam giác đồng dạng (L8) và đường tròn nội/ngoại tiếp (L9). 12 chủ đề đợt 2a đã chốt lại
  theo mục lục thật ở `dac-ta-gd2-mon-toan-2026-08-01.md` §2.1a (trước đó là phỏng đoán).
  **✅ [2026-08-01, đợt đối chiếu LẠI] Người dùng thay bộ PDF cũ bằng bộ ẢNH SCAN ấn bản CHÍNH
  THỨC** (8 thư mục PNG `tai-lieu-sgk/SGK-Toan/Toan 6-1/` … `Toan 9-2/`, OCR bằng script mới
  `scripts/ocr-images.py`). Kết quả: **cả 4 lớp 6-9 KHÔNG đổi cấu trúc chương/bài** — 4 file mục
  lục giữ nguyên bảng, chỉ thêm ghi chú xác nhận. **Bản Toán 9 KHÔNG còn là bản mẫu thẩm định**
  (bìa không còn watermark "Bản mẫu"; Toán 6 ghi "Tái bản lần thứ năm") và 32 bài trùng khít bản
  mẫu cũ ⇒ nghi ngờ "bản mẫu có thể khác bản in chính thức" **đã loại trừ**. Số mục lệch: **24 →
  25** (thêm `[+]` hệ thức cạnh–góc lớp 9). Điểm cần giáo viên duyệt: **5 → 4** — điểm về **hệ
  thức lượng tam giác vuông** đã giải quyết dứt điểm: chương IV Toán 9 KNTT chỉ dạy tỉ số lượng
  giác + hệ thức cạnh–góc, **không dạy** `h² = b'·c'`, `b² = a·b'`, `a·h = b·c` (đã bỏ khỏi kho
  kiến thức). Còn treo: ảnh hưởng TT 17/2025, thứ tự dạy mạch TK lớp 8, độ sâu căn bậc hai lớp 7,
  việc loại các bài chứng minh hình học khỏi MVP.
  **✅ [2026-08-01] Đã đối chiếu xong KHTN 6-9** (ảnh scan `tai-lieu-sgk/SGK-KHTN/6..9/`, OCR bằng
  `scripts/ocr-images.py`; mục lục 2 cột đọc thêm bằng script mới `scripts/ocr-crop.py`). Mục lục
  thật ở `docs/research/muc-luc-sgk/khtn-{6,7,8,9}.md` — **có thêm cột `Branch`** (LÝ/HOÁ/SINH/
  chung) so với mẫu Toán, vì KHTN là **một sách tích hợp**. Quy mô: L6 10 chương/55 bài · L7 10
  chương/42 bài · L8 8 chương/47 bài · L9 14 chương/51 bài.
  **Số mục lệch phát hiện:** Hoá **15** (`[+]`5 `[≠]`7 `[−]`3) · Lý **18** (`[+]`8 `[≠]`6 `[−]`4)
  · Sinh **15** (`[+]`10 `[≠]`5 `[−]`0) — ghi ở mục "Nhật ký đối chiếu" cuối mỗi file kho kiến thức.
  **Hai điểm nghi ngờ then chốt đều đã XÁC MINH trên nội dung bài học (không chỉ mục lục):**
  - 🔴 **`n = V/24` là SAI, `n = V/22,4` cũng sai — SGK KHTN 8 dùng `n = V(L)/24,79 (L/mol)`**
    ở điều kiện chuẩn **1 bar, 25 °C** (khung Mục tiêu Bài 3, `SGK-KHTN/8/page_0017.png`). Dùng 24
    lệch **≈3,3%**, **vượt ngưỡng dung sai 1% thật của môn Hoá** (`chemistry: 1%` trong
    `DEFAULT_TOLERANCE_BY_SUBJECT`, không phải 3% — đó là ngưỡng riêng của Lý) ⇒ đã xử lý:
    **✅ [2026-08-01] `STANDARD_MOLAR_VOLUME_L_PER_MOL = 24.79` đã thêm vào
    `packages/core-grading/chemistry.ts`** kèm test canh gác (`grading.test.ts`) chứng minh dùng
    nhầm 24 hoặc 22,4 sẽ bị chấm sai (lệch 3,3%/10,7%, vượt dung sai 1%). Chưa có logic mol↔thể
    tích khí thật trong engine — hằng số này chỉ chờ sẵn cho khi PR-1 GĐ3 Hoá viết dạng bài đó.
  - **`g = 10` hay `9,8`: SGK dùng CẢ HAI, hai vai trò khác nhau** — Bảng 43.1 KHTN 6 nêu 1 kg có
    trọng lượng **9,8 N** (giá trị vật lí thật, để so Mặt Trăng/Hoả tinh), còn kết luận tính toán
    của Bài 43 ghi `P` (N) **gần bằng 10 lần** `m` (kg) ⇒ công thức làm bài là **`P ≈ 10·m`**.
    Ngưỡng dung sai 3% hiện có **vừa đủ nhưng sát mép**; khuyến nghị ghi rõ `g` trong đề.
  - **Bonus, xác nhận PA C là đúng:** KHTN 9 vẫn là MỘT cuốn tích hợp nhưng 14 chương gom thành 3
    khối liền mạch theo phân môn (I-V Lý → VI-X Hoá → XI-XIV Sinh) ⇒ môn cha `khtn` + cột `branch`
    diễn tả đủ, **không cần tách 3 môn riêng ở THCS**.
    **Lệch đáng chú ý khác:** Lý — **công & công suất KHÔNG dạy ở lớp 8** mà ở lớp 9 (Bài 4), kho cũ
    xếp nhầm; thiếu hẳn chương "Năng lượng cơ học" L9 và chương "Trái Đất và bầu trời" L6; bỏ lực
    điện từ/quy tắc bàn tay trái/máy ảnh-mắt (không có ở KNTT L9). Hoá — thiếu hẳn chương II lớp 7
    (phân tử, liên kết, **hoá trị & CTHH** — phần tính toán hoá học đầu tiên) và chương X lớp 9
    (khai thác tài nguyên vỏ Trái Đất, chu trình carbon); bỏ acetylene. Sinh — **0 mục `[−]`**, mọi
    nội dung đã ghi đều có thật, chỉ ghi quá sơ lược; đổi thuật ngữ **ADN/ARN → DNA/RNA**, `G = X`
    → `G = C`; **di truyền liên kết dạy ngay lớp 9** (kho cũ xếp lớp 12).
    **Điểm cần giáo viên chuyên môn duyệt:** Hoá 4 · Lý 6 · Sinh 4 (chi tiết ở §6.3 / §6.3 / §5.3
    của từng file). Đáng chú ý: lực đẩy Archimedes & moment lực L8 định tính hay định lượng; công
    thức thấu kính `1/f = 1/d + 1/d'` L9; Joule–Lenz L9; ăn mòn kim loại L9 (Hoá).
    **Còn thiếu:** Toán 10-12 (đợt 2d), **THPT của Hoá và Sinh** (§3 của 2 file
    kho kiến thức vẫn là bản thảo chưa kiểm chứng) — sách CHƯA có trong `tai-lieu-sgk/`, chờ người
    dùng bổ sung. **Vật lí THPT và Toán 1-5 đã xong — xem hai mục ngay dưới.**
    **✅ [2026-08-01] Đã đối chiếu xong TOÁN 1-5 (TIỂU HỌC) — đợt 2b** — phần §3 của
    `kho-kien-thuc-toan-gdpt2018.md` trước đây chưa từng đối chiếu (đợt 2a chỉ làm lớp 6-9), nay đã
    kiểm chứng bằng ảnh scan `tai-lieu-sgk/SGK-Toan/1-1/ … 5-2/`. Mục lục thật ở
    `docs/research/muc-luc-sgk/toan-{1,2,3,4,5}.md`. SGK tiểu học tổ chức theo **chủ đề** (không
    dùng "chương"). Quy mô: **L1 10 chủ đề/41 bài · L2 14/75 · L3 16/81 · L4 13/73 · L5 12/75**
    (tổng 65 chủ đề / 345 bài).
    **Số mục lệch phần tiểu học: 54** (`[+]`42 · `[≠]`9 · `[−]`3) — ghi ở §8.4 của file kho kiến
    thức Toán, tách rõ khỏi 25 mục của cấp 2 (§8.1). Tổng toàn file: **79 mục lệch**.
    **Bốn phát hiện quan trọng (kho kiến thức trước đây ghi sai):**
  - 🔴 **Dấu hiệu chia hết cho 2, 3, 5, 9 KHÔNG dạy ở lớp 4** (Toán 4 KNTT chỉ có "Số chẵn, số lẻ")
    — nội dung này ở **lớp 6** (Toán 6 Bài 9). Đã bỏ khỏi §3 lớp 4.
  - 🔴 **Diện tích hình bình hành `S = a×h` và hình thoi `S = (d₁×d₂)/2` KHÔNG dạy ở lớp 4** — Bài 31
    chỉ nhận dạng hình; hai công thức ở **lớp 6** (Toán 6 Bài 20). Đã bỏ khỏi §3 lớp 4.
  - **Mạch TK bắt đầu từ LỚP 2, và có yếu tố XÁC SUẤT ngay từ lớp 2** ("chắc chắn – có thể – không
    thể"), rồi liên tục L3 (khả năng xảy ra), L4 (số lần xuất hiện), L5 (tỉ số số lần lặp lại →
    tiền đề xác suất thực nghiệm L6). Lớp 1 không có. Kho cũ bỏ sót hoàn toàn nhánh xác suất tiểu học.
  - **Bảng nhân/chia: lớp 2 CHỈ có bảng 2 và 5**; bảng 3, 4 nằm ở **lớp 3** cùng 6, 7, 8, 9 (kho cũ
    ghi "2-5" ở lớp 2 và "6-9" ở lớp 3 — sai cả hai).
    Lệch đáng chú ý khác: lớp 1 đã có hình khối + xem giờ/lịch; lớp 3 đã có làm tròn số, chữ số La
    Mã, biểu thức số, trung điểm đoạn thẳng, cm², nhiệt độ °C; lớp 4 đã có góc & đơn vị đo góc và
    các tính chất giao hoán/kết hợp/phân phối; lớp 5 có thêm hỗn số, phân số thập phân, diện tích
    xung quanh/toàn phần hình khối, số đo thời gian, máy tính cầm tay; **biểu đồ tranh chỉ ở lớp 2**
    (kho cũ ghi cả lớp 3); **số trung bình cộng thuộc mạch SO** chứ không phải TK.
    **Điểm cần giáo viên Toán duyệt — thêm 5 mục cho tiểu học** (§8.4.3): hai kết luận `[−]` ở trên
    rút từ **mục lục**, chưa đọc hết nội dung bài; ảnh hưởng TT 17/2025; cách phân mạch các bài đo
    lường (HINH hay SO); và việc loại toàn bộ bài "Thực hành và trải nghiệm" khỏi MVP.
    **✅ [2026-08-01] Đã đối chiếu xong VẬT LÍ 10-12 (THPT)** — phần §3 của
    `kho-kien-thuc-ly-gdpt2018.md` trước đây chưa từng đối chiếu, nay đã kiểm chứng bằng ảnh scan
    `tai-lieu-sgk/SGK-Ly/10..12/` (mục lục 2 cột, OCR bằng `scripts/ocr-crop.py`). Mục lục thật ở
    `docs/research/muc-luc-sgk/ly-{10,11,12}.md`. Quy mô: **L10 7 chương/34 bài · L11 4 chương/26 bài
    · L12 4 chương/25 bài** (tổng 15 chương / 85 bài).
    **Số mục lệch phần THPT: 17** (`[+]`13 · `[≠]`2 · `[−]`2) — ghi ở §6.4 của file kho kiến thức Lý,
    tách rõ khỏi 18 mục của cấp 2 (§6.1). Tổng toàn file: **35 mục lệch**.
    **Bốn kết luận cấu trúc quan trọng (khác chương trình cũ):**
  - **Nhiệt học + khí lí tưởng nằm ở LỚP 12**, Vật lí 10 hoàn toàn không có nhiệt học.
  - **Từ trường + cảm ứng điện từ nằm ở LỚP 12**, không phải lớp 11.
  - **Đã bỏ hẳn:** dòng điện xoay chiều/mạch RLC, sóng ánh sáng, lượng tử ánh sáng, mẫu Bohr,
    thuyết tương đối; quang hình đã chuyển xuống KHTN 9.
  - **Công/công suất/cơ năng dạy ở CẢ hai cấp** (KHTN 9 và Vật lí 10 chương IV), khác độ sâu:
    lớp 10 thêm `cos α` trong `A = F·s·cos α`, thêm dạng `P = F·v`, và có **bài riêng** cho định
    luật bảo toàn cơ năng (Bài 26) lẫn **hiệu suất** (Bài 27). ⇒ **Không xoá nội dung cấp 2**, ghi
    rõ 2 layer. Điều này cũng chốt được nghi vấn "hiệu suất dạy ở đâu" còn treo từ đợt cấp 2.
  - **Định luật bảo toàn động lượng chỉ có ở Vật lí 10** (chương V), không có ở cấp 2.
    **Điểm cần giáo viên Lý duyệt — thêm 9 mục cho cấp 3** (§6.5). Đáng chú ý: giá trị `g` dùng
    trong bài tập cấp 3 (`9,8` hay `10` — ảnh hưởng trực tiếp ngưỡng dung sai 3% của engine chấm);
    **lực Lorentz** có còn trong chương trình không (mục lục Vật lí 12 không có bài nào); con lắc lò
    xo/con lắc đơn ở lớp 11 (chương I không có bài riêng); và **bảng đơn vị hệ SI đầu SGK Vật lí 10**
    cần bản đầy đủ chính xác để chuẩn hoá danh mục đơn vị hợp lệ của engine chấm (OCR bảng bị vỡ,
    chưa đủ tin cậy — **không đoán, không chép vào kho**).
- **Căn cứ pháp lý đã tra được (2026-08-01):** TT 32/2018 → sửa bởi TT 20/2021, TT 13/2022 và
  **TT 17/2025/TT-BGDĐT** (mới nhất); **QĐ 3588/QĐ-BGDĐT** (26/12/2025) chọn bộ "Kết nối tri thức
  với cuộc sống" dùng chung toàn quốc; SGK chỉnh sửa áp dụng từ năm học 2026-2027.
  ⚠️ **AI CHƯA đọc được nội dung chi tiết TT 17/2025** (`vanban.chinhphu.vn` cũng trả 403) nên
  **chưa biết môn Toán/KHTN bị sửa cụ thể những gì**. Bộ SGK Toán trong tay nay đã là **ấn bản
  chính thức** (không còn bản mẫu 2023), nhưng vẫn chưa có bản đối chứng của SGK chỉnh sửa theo
  TT 17/2025 — xem điểm cần giáo viên duyệt ở trên.
- ⚠️ **[Sửa lại 2026-08-26] `packages/core-grading` KHÔNG CÒN TRONG REPO** — đã bị xoá ở đợt
  cải tổ cấu trúc 2026-08-23 vì "mồ côi" (không gói nào import). Code còn nguyên trong lịch
  sử git: 9 file tại commit `9fa6f59`, khôi phục bằng `git checkout 9fa6f59 -- packages/core-grading`
  rồi gắn lại `package.json`/`tsconfig.json` composite + project reference. Phần mô tả ngay dưới
  đây viết ở thì hiện tại là mô tả **code trong lịch sử**, không phải code đang có.
- **✅ `packages/core-grading` — ENGINE CHẤM DÙNG CHUNG, ĐÃ VIẾT XONG + 74 test** (99% câu lệnh,
  90,6% nhánh — cao hơn ngưỡng chung của repo vì chấm sai làm mất niềm tin người học ngay).
  Đặc tả: `docs/research/dac-ta-engine-cham-dung-chung.md`. Không có AI trong luồng chấm; hàm
  thuần, tất định, dùng chung cả client lẫn server.
  - Đơn vị mô hình hoá bằng **vector thứ nguyên SI** → phân biệt được `WRONG_UNIT` (tính đúng, ghi
    nhầm đơn vị) với `WRONG_DIMENSION` (hiểu sai đại lượng). Nhiệt độ có **độ lệch gốc** (°C→K).
  - Chuẩn hoá số **theo lối viết Việt Nam**: `0,5`, `1.000` = một nghìn, `1,5.10^3`.
  - So khớp biểu thức bằng **thăm dò số ngẫu nhiên seed cố định** thay vì CAS — nhẹ bundle, tất định.
  - **Cân bằng PTHH** kiểm bằng vector nguyên tố + điện tích + tối giản, nêu đích danh nguyên tố lệch.
  - **Bài học đo được bằng số:** ngưỡng dung sai môn Lý đặt 2% ở bản đặc tả đầu là SAI —
    `10/9,8 − 1 = 2,04%` nên sẽ chấm oan học sinh dùng `g = 10`. Đã nâng lên **3%**, có test canh
    gác chống đặt lại. Đúng lý do đặc tả bắt "đo bằng test thật, không đoán".
- **3 quyết định kiến trúc đã chốt (người dùng duyệt 2026-08-01):**
  1. **Mô hình `subject` cho KHTN: PA C** — môn cha `khtn` + cột `branch`
     (`physics`/`chemistry`/`biology`). Lý/Hoá/Sinh KHÔNG là môn riêng ở THCS mà nằm trong môn tích
     hợp KHTN, chỉ tách ở THPT → `subject` phẳng hiện tại không diễn tả được. **Thi hành khi bắt
     đầu GĐ3**, không migration sớm.
  2. **Thứ tự GĐ3: Hoá → Lý → Sinh** (không phải "Lý–Hoá" theo thói quen) — Hoá trước vì cân bằng
     PTHH chấm chính xác tuyệt đối, tạo giá trị thấy ngay.
  3. **Môn Sinh: PA B** — trắc nghiệm + SRS, KHÔNG xây engine chấm mới. Sinh chỉ ~15% dạng bài chấm
     tự động được (Toán ~95%); bản chất gần với học từ vựng hơn là với Toán → tái dùng engine SRS
     đã chạy tốt cho tiếng Anh.
  4. **[2026-08-01, người dùng chốt] Hình minh hoạ bài học — kết hợp 2 nguồn theo môn:**
     **SVG tự vẽ bằng code** cho Toán/Lý/Hoá (hình học, sơ đồ mạch điện, ống nghiệm/phản ứng —
     miễn phí, nhẹ, sắc nét mọi kích thước, đổi theo theme sáng/tối); **AI sinh ảnh** cho Sinh
     (động vật, tế bào, hệ sinh thái — cần tả thực, SVG không hợp). ⚠️ **KHÔNG chép hình vẽ từ
     SGK** — chỉ dùng SGK để biết "minh hoạ ý gì" (đúng ranh giới bản quyền §0.1
     `huong-dan-doi-chieu-sgk.md`), hình phải tự vẽ/tự sinh mới hoàn toàn. Ảnh AI cần duyệt thủ
     công tránh sai kiến thức khoa học + tốn phí API (nên cache lại, không sinh lại mỗi lần xem
     — có thể theo mô hình cache TTS mã hoá đã có ở `packages/core-ai/fileStorage.ts`).
     **Áp dụng khi viết PR-1** (bài học mẫu), chưa làm ngay — ghi lại quyết định trước để không
     quên khi tới lúc.
- **Việc kế tiếp:** 12 chủ đề đợt 2a đã chốt theo SGK thật → PR-1 (soạn 1 bài học mẫu, có áp dụng
  quyết định hình minh hoạ ở trên, để duyệt định dạng) → PR-2 scaffold `apps/math`. Các điểm cần
  giáo viên duyệt (§8.3 kho-kien-thuc-toan) nên xử lý trước hoặc song song, không chặn PR-1.

## Đã xong — tóm tắt theo mảng

**Lõi sản phẩm (MVP → v2):** đăng nhập Supabase Auth · 3 chế độ Chat/Viết/Nói song ngữ (STT
Groq-OpenAI + TTS Google Cloud 2 giọng, cache mã hoá AES-256-GCM) · đếm lượt/ngày atomic
(RPC `consume_usage`/`refund_usage`) tách riêng theo mode (chat/writing/speaking/stt) · mở
chiều B (dạy Việt qua Anh) · deploy VPS (PM2 + Nginx + Let's Encrypt) sau Cloudflare · nút
"Kết thúc & chấm điểm" cuối phiên Chat/Speaking · trang cá nhân `/profile`.

**Lộ trình học:** vòng từ vựng nền tảng theo chủ đề, tốc độ 5/10/20 từ/ngày tự chọn · lộ trình
chuẩn CEFR **A1→C2 đầy đủ 6 cấp** (mỗi cấp 1 trang riêng, thứ tự Từ vựng→Ngữ pháp→Hội thoại,
4 tab Hôm nay/Ôn SRS/Từ khó/Kiểm tra lọc theo cấp) · bài thi cuối cấp chặn lên cấp (≥70%) ·
SRS toàn cục (cap phiên, leech, vé nghỉ streak) · xen kẽ từ vựng↔ngữ pháp · quiz ngữ pháp ·
Sổ lỗi cá nhân (Mistake Bank, `/mistakes`) · gamification (flashcard lật 3D, màn ăn mừng
streak/confetti, vòng cung phiên học nối lộ trình↔Chat/Speaking qua `targetWords`).

**Từ điển & dữ liệu:** 12.073 mục, **100% đã gắn nhãn CEFR** (A1-C2, qua CEFR-J/Octanove/
Words-CEFR-Dataset + AI cho phần còn thiếu) · dạng biến thể từ (`WordForms`, 8.740 từ, 200 bất
quy tắc) kèm ví dụ song ngữ cho ~391 ô bất quy tắc · tần suất từ thật (SUBTLEX-US, 9.540/10.006
từ) dùng để sắp "Mở rộng" theo độ thông dụng thay vì alphabet.

**Hạ tầng/chất lượng:** CI gate (lint/typecheck/test/build/format/E2E) trên mọi PR · coverage
ratchet + bundle-size budget (`size-limit`, thay Lighthouse CI) · a11y AA toàn site qua axe
(kể cả màn kết quả AI, 4 theme) — **đã đóng nợ a11y** · Zod validate input toàn bộ `api/*.ts` ·
Sentry error tracking (**đã bật thật trên VPS, 2026-07-27** — DSN đã điền, đã xác nhận lỗi test
ghi nhận được) · CI/CD tự deploy + tự chạy migration Postgres khi merge vào `main`
(`npm run migrate:pg` trong pipeline deploy, không cần chạy tay) · audit bảo mật/logic nhiều đợt
(RLS theo cột chặn tự nâng Pro/bypass lượt, timeout fetch, refund lượt khi provider lỗi, ranh
giới ngày theo giờ VN — chi tiết `AUDIT.md`) · **deploy zero-downtime (2026-07-20)**: PM2
chuyển cluster mode (1 instance) + `wait_ready` (`server.ts` gửi `process.send('ready')` sau
`app.listen` + graceful shutdown SIGINT/SIGTERM) — trước đó fork mode `pm2 reload` = tắt cũ
rồi mới bật mới → app chết ~10s mỗi lần deploy (thấy trong log deploy: 9 lần curl
"Couldn't connect"); logic reload + health check gom về `scripts/pm2-reload.sh` (cả
`deploy.yml`/`deploy.sh`/`scripts/deploy.sh` cùng gọi, tự phát hiện fork mode cũ để
delete+start MỘT lần vì PM2 không đổi được exec_mode qua reload) — đã kiểm chứng bằng PM2
thật trong sandbox: 3.766 request liên tục xuyên 2 lần reload, 0 request rớt.

**Tính năng mới:** Thử thách "Challenge 1 phút/ngày" (`/challenge`) — từ 2026-07-15 chạy
**CHU KỲ TUẦN** Thứ 2→CN (bảng 7 ô, tổng kết tuần vào CN, ăn mừng 7/7; bỏ vòng 30 ngày/vé
nghỉ/mốc — huy hiệu sẽ quay lại ở M2). ~~Migration `0010_challenge_entries.sql` chưa chạy trên
production~~ **hết hiệu lực (2026-07-20)** — ghi chú từ thời Supabase; sau khi rời hẳn sang
Postgres tự host, bảng `challenge_entries` đã có sẵn trong `postgres/schema.sql` (baseline khi
khởi tạo DB mới) nên tự động có qua `npm run migrate:pg`, không cần chạy riêng.

**i18n/UX:** song ngữ toàn site kể cả `/login` · bottom-nav mobile (Trang chủ/Lộ trình/Luyện
tập/Tiến độ) · thẻ "Học tiếp" ở Home · karaoke (sáng chữ theo giọng đọc) áp dụng mọi TTS >1 từ ·
chuẩn hoá vị trí nút loa/micro + vùng chạm ≥44px.

**Giọng TTS 14 giọng + gói VIP + admin cấu hình (2026-07-21, nhánh
`claude/chirp-3-hd-voice-upgrade-c06eds`, CHƯA MERGE — xem "Cần làm tay"):** mở rộng từ 4 → 14
giọng Chirp3-HD thật (7 nữ/7 nam, xác minh qua Google TTS `voices.list`) cho cả en-US/vi-VN ·
mọi user tự chọn giọng ở trang Hồ sơ (`VoicePicker`), lưu toàn cục áp dụng mọi trang · thêm gói
`vip` (bên cạnh free/pro) · **quyết định người dùng 2026-07-21:** hạn mức free=5/pro=100/
vip=không giới hạn (lượt/tính năng/ngày), khuyến mãi ra mắt hiện đang bật (mọi user = VIP tới
hết 31/12/2026, cấu hình được) · trang `/admin-settings` (admin xác thực qua `ADMIN_EMAILS`
trong `.env`) cho chỉnh 15 hạn mức + bật/tắt khuyến mãi lưu trong bảng `app_settings` — server
(`usage.ts`/`voiceAccess.ts`, cache 30s) và client (`src/lib/appSettings.ts`, đồng bộ lúc mở
app qua ETag/If-None-Match, không fetch thừa khi chưa đổi gì) đều đọc từ đây, không còn hard-
code trong nhiều file rời rạc.

**Quản trị VIP/gói (2026-07-28):** Danh sách VIP whitelist (thêm/xoá email → tự cấp/hạ VIP vĩnh
viễn, kể cả người chưa đăng ký) + Ma trận tính năng theo gói Free/Pro/VIP (admin bật/tắt từng
tính năng, thêm/xoá tính năng mới) — 2 tab mới trong `/admin`, xem chi tiết trong "Tiếp theo" và
`docs/` liên quan nếu cần đào sâu.

**Trang Nghe `/listening` — thư viện nghe song ngữ (2026-08-01, PR #434, đang bổ sung nội dung
theo đợt):** trang mới gom 4 mục để NGHE (không chấm điểm, khác `/phrases` và tab "Nghe" trong
`/practice`): câu thông dụng + hội thoại (tái dùng dữ liệu sẵn có, đổi cách trình bày) và **truyện
song ngữ MỚI** (`ft-*`/`fb-*`/... theo 6 thể loại `fairy-tale`/`fable`/`vn-folk`/`myth`/`humor`/
`children`, xem `docs/research/danh-muc-truyen-nghe-2026-08-01.md` — chốt 120 truyện, làm dần mỗi
đợt ~10 truyện/PR). Hạ tầng: `data/stories/{index.ts,loader.ts,raw/*.json}` +
`scripts/gen-stories-json.mjs` (`npm run gen:stories`, nối vào `build`) sinh
`public/data/stories/`; UI `pages/Listening.tsx` (tab đồng bộ URL) + `pages/StoryReader.tsx` (đọc
truyện, tự cuộn theo câu, ghi nguồn bắt buộc) + `components/StoryCard.tsx`. Bản tiếng Anh **bắt
buộc tải thật từ Project Gutenberg** (không gõ từ trí nhớ — CLAUDE.md §5), tiếng Việt Opus dịch
tay chất lượng văn học. Migration `0032` bật feature `listening` cho mọi gói.
**Tiến độ nội dung [cập nhật 2026-08-03, đếm file thật]:** ✅ **`fairy-tale` XONG 20/20** · ✅
**`vn-folk` XONG 20/20** · ✅ **`fable` XONG 20/20** — ba thể loại đã hoàn tất trọn vẹn.
🔵 **`myth` 24/25** (Kingsley 8 + Bulfinch 12 + Colum Bắc Âu 4; chỉ còn Cupid và Psyche).
🔓 **`vn-folk` 24 truyện — thể loại KHÔNG CÒN TRẦN** (chủ dự án chốt 2026-08-03: cứ còn truyện
dân gian Việt Nam hay và chưa có thì bổ sung tiếp). Vì thế `vn-folk` ghi số tuyệt đối, KHÔNG ghi
dạng `n/20` nữa, và tổng danh mục 125 giờ chỉ là **sàn**, không phải đích.
`humor` 0/20 · `children` 0/20. **Tổng 88 truyện.**
🚨 **Sự cố trùng lặp 2026-08-03 (đã xử lý):** đã soạn `vn-tam-cam` rồi mới thấy `ft-tam-cam` ĐÃ
CÓ SẴN ở thể loại `fairy-tale` (bản dài gấp đôi) — đã xoá bản trùng. Nguyên nhân: kiểm "truyện VN
đã có" bằng `ls raw/vn-*.json`, tức lọc theo TIỀN TỐ THỂ LOẠI, trong khi truyện Việt Nam nằm rải
cả ở `fairy-tale` và `humor`. **Thể loại KHÔNG suy ra được quốc gia.** Quy tắc mới đã ghi vào
danh mục §5: trước khi soạn truyện mới phải rà TOÀN BỘ `raw/*.json` không lọc tiền tố.
✅ **Rào cản mạng ĐÃ GỠ (2026-08-03):** `gutenberg.org` giờ truy cập được từ môi trường Claude
Code web (`curl` PG 3327 trả HTTP 200) — ghi chú cũ ngày 2026-08-02 nói `fable`/`myth`/`humor`/
`children` "bị chặn cứng" đã hết hiệu lực, 4 thể loại phụ thuộc Gutenberg làm tiếp được bình thường.
⚠️ Cách cập nhật con số này: **đếm file thật** (`ls apps/english/src/data/stories/raw/ft-*.json |
wc -l`), đừng cộng nhẩm — ghi chú trước đó từng ghi `fairy-tale` "12/20" trong khi thực tế mới có
11 file, và ghi `myth` "chưa bắt đầu" trong khi thực tế đã có 16 file.

## Tiếp theo

> Mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (CLAUDE.md mục 3).

- **[2026-08-31] ✅ HAI KHOÁ NGẮN "TÁC TỬ AI" — HERMES + OPENCLAW, ĐÃ XONG TRỌN VẸN.** Tầng
  khoá ngắn (`packages/subject-programming/courses/`, cắt ngang bậc P1–P6, đúng khuôn khoá Git)
  có thêm hai khoá mới, mỗi khoá dạy qua bộ mô phỏng CLI tất định riêng (khuôn `gitSim`) —
  KHÔNG gọi AI/mạng/Docker thật khi chấm bài, dòng tự khai `[GIA LAP]` mỗi lượt chạy.
  1. **"Hermes Agent — trợ lý AI cho người đi làm"** (`/lap-trinh/khoa-hoc/hermes`, 22 bài / 4
     chương) — 3 PR: đặc tả (`#751`, `docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md`) →
     hạ tầng `hermesSim.ts` + chương C1 (`#752`, `docs/changelog/0202-*.md`) → chương C2–C4
     (`docs/changelog/0203-2026-08-31-hermes-c2-c4.md`). Dạy cài đặt/cấu hình/giao việc/điều
     phối tác tử Hermes — góc nhìn nhân viên văn phòng + người điều phối dev.
  2. **"OpenClaw — dựng trợ lý AI của riêng bạn"** (`/lap-trinh/khoa-hoc/openclaw`, 20 bài / 4
     chương) — 3 PR: đặc tả (`#753`, `docs/specs/2026-08-31-khoa-openclaw.md`) → hạ tầng
     `openclawSim.ts` + chương C1 (`#759`, `docs/changelog/0204-*.md`) → chương C2–C4 (`#761`,
     `docs/changelog/0205-*.md`). Dạy tự cài đặt/vận hành trợ lý AI TỰ HOST — trọng tâm sư phạm
     riêng là AN TOÀN từ bài nối kênh đầu tiên (kênh mới luôn mặc định chặn người lạ, lệnh chạm
     máy thật luôn cần NGƯỜI duyệt).
     **Cùng nhịp đổi route:** trang khoá ngắn dời tiền tố từ `/lap-trinh/khoa/` sang
     `/lap-trinh/khoa-hoc/` (`#755`, `docs/changelog/0204-2026-08-31-doi-route-khoa-hoc.md`) —
     URL cũ vẫn hoạt động qua redirect giữ nguyên mã khoá.
     **Việc để ngỏ (cố ý, ghi trong đặc tả):** câu hỏi mở về cách xử lý nội dung khi hai công cụ
     đổi phiên bản nhanh — chưa chốt, không chặn hai khoá đã dùng được ngay hôm nay.

- **[2026-08-31] ✅ KHOÁ HỌC "KỸ SƯ TRƯỞNG AI" — lộ trình mục tiêu môn Lập trình, ĐÃ XONG TRỌN
  VẸN CẢ 4 ĐỢT.** Đặc tả `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` +
  `docs/specs/2026-08-31-dot-4-p5-tam-truong.md` (đặc tả con đợt 4), người dùng đã duyệt thi
  hành ("theo phương án tốt nhất": P5 hiện ngay từ đợt 1 ở trạng thái "đang soạn" tới khi đợt 4
  xong; Companion đợt 3 dùng chung lượt `chat`).
  - **Đợt 1/4 — ✅ (`#766`, nhật ký `docs/changelog/0207-*.md`):** tầng
    `packages/subject-programming/learningPaths/` (khuôn giống `specializations/`) + manifest
    `principal-ai` (5 giai đoạn, 22 chặng lắp từ 8 hướng có sẵn) + trang
    `/lap-trinh/lo-trinh/:pathId`. Thuần dữ liệu + UI đọc, không migration, không AI.
  - **Đợt 2/4 — ✅ (`#769`, nhật ký `docs/changelog/0209-*.md`):** chẩn đoán chọn
    điểm vào (`suggestEntry`, hàm thuần tất định, không AI) + tiến độ riêng của lộ trình
    (`programming.path_progress`, migration `0073`, trạng thái chỉ tốt lên).
  - **Đợt 3/4 — ✅ (nhật ký `docs/changelog/0210-*.md`):** quiz sau chặng (chấm ở
    server, đạt ≥ 4/5 mới ghi `completed`; đã soạn 4/22 chặng của P1–P4, còn lại "chưa có bài
    kiểm" có ghi chú) + kho artifact cá nhân (`programming.path_artifacts`, migration `0074`,
    không chấm bằng AI) + Companion kiểm hiểu tuỳ chọn (`pathCheckPrompt.ts`, dùng chung lượt
    `chat`, không lưu lại nội dung hội thoại).
  - **Đợt 4/4 — ✅ ĐÃ XONG (nhật ký `docs/changelog/0211-*.md`):** nội dung P5 "Tầm trưởng" —
    4 chặng RIÊNG của lộ trình `principal-s1…s4` (KHÔNG phải hướng chuyên sâu thứ 15; khai qua
    `learningPaths/pathStages.ts`, tra bằng `resolveStage()`), 16 bài học 8 bước thật
    (`p6-u94…p6-u101`) + 20 câu quiz mới, trang chặng riêng
    `/lap-trinh/lo-trinh/:pathId/chang/:stageId`. `agentSim` hoá ra KHÔNG cần — vòng lặp agent
    dạy và chấm được bằng code Python/JavaScript thuần. **Lộ trình "Kỹ Sư Trưởng AI" nay ĐẦY
    ĐỦ P1→P5, không còn phần "đang soạn".**
  - **[2026-08-31] Soạn nốt quiz 18/22 chặng còn lại — ✅ ĐÃ XONG (nhật ký
    `docs/changelog/0212-*.md`).** Đợt 3 cố ý chỉ soạn 4/22 chặng P1–P4; đợt bổ sung này soạn
    90 câu hỏi cho 18 chặng còn lại (4 agent song song, mỗi agent bám sát `topics` thật của
    `specializations/<hướng>.ts` trước khi viết). **Toàn bộ 26/26 chặng của lộ trình
    `principal-ai` nay đều có quiz** (22 P1–P4 + 4 P5) — không còn chặng nào "chưa có bài kiểm".

- **[2026-08-31] ✅ THIẾT KẾ LẠI WEB CHO DESKTOP — 4 PR, ĐÃ XONG TRỌN VẸN.** Trước đó web là
  "app mobile phóng to" ở mọi kích thước màn hình (BottomNav cố định đáy, dropdown Studio,
  `max-w-3xl` bất kể chiều ngang). Người dùng chốt phạm vi qua `AskUserQuestion` rồi yêu cầu làm
  tiếp từng PR — không có PR nào phải sửa lại sau khi merge.
  1. **PR 1+2 — sidebar + Chat hai cột** (`#743`, đặc tả
     `docs/specs/2026-08-30-thiet-ke-lai-web-desktop.md`, nhật ký `docs/changelog/0199-*.md`):
     sidebar trái cố định `≥1024px` (thu gọn được icon-only, nhớ `localStorage`), ẩn BottomNav
     ở ngưỡng đó, nới `max-w` header; trang Chat thêm cột "Sửa lỗi & giải thích" ghim phải, gom
     lời sửa cả phiên kèm câu gốc.
  2. **PR 3 — CefrLevelPage master–detail** (`#750`, đặc tả
     `docs/specs/2026-08-31-cefr-master-detail-desktop.md`, nhật ký `docs/changelog/0201-*.md`):
     mở 1 bài học/từ vựng/hội thoại ở desktop hiện thêm cột trái danh sách unit rút gọn (dùng
     lại nguyên `UnitSection`), bấm mục khác đổi thẳng cột phải không rời trang. Màn thi cuối
     cấp cố ý giữ toàn màn hình mọi kích thước.
  3. **PR 4 — cột ngữ cảnh Dashboard + phím tắt** (`#756`, đặc tả
     `docs/specs/2026-08-31-dashboard-context-rail-phim-tat.md`, nhật ký
     `docs/changelog/0203-*.md`): trang Tiến độ (`/tien-do`) ở desktop dời Streak/Mục tiêu
     tuần/QuickActions sang cột phải cố định (`sticky`); toàn site có `⌘K`/`Ctrl+K` mở Studio
     switcher và `/` focus ô nhập đầu tiên (bỏ qua khi đang gõ sẵn trong ô nhập khác).

  **Bài học kỹ thuật quan trọng nhất (rút ra ở PR 1+2, áp dụng lại cho PR 3+4):** ẩn nội dung
  theo breakpoint bằng CSS (`lg:hidden`/`hidden lg:flex`) vẫn để nguyên phần tử đó TRONG DOM ở
  cả hai nơi — nếu cùng nội dung xuất hiện ở cả bản mobile và bản desktop thì bị TRÙNG, không
  chỉ là vấn đề thẩm mỹ: trình đọc màn hình đọc lặp 2 lần, và Playwright `getByText` báo
  strict-mode violation (bắt được thật ở `e2e/a11y.spec.ts` "Chat (kết quả AI)" ×5 theme). Sửa
  bằng gate JS (`apps/dhcb/src/lib/useIsDesktopViewport.ts`, `matchMedia`) — đảm bảo đúng MỘT
  bản tồn tại trong DOM tại một thời điểm, không phải ẩn-nhưng-vẫn-còn. Ba PR sau tái dùng đúng
  hook này, không lặp lại lỗi.

  **Đã thử trên trình duyệt thật sau khi cả 4 PR merge (2026-08-31, dev server + Playwright thủ
  công, có ảnh chụp màn hình):** sidebar mở rộng/thu gọn, Chat hai cột + vote 👍👎, CEFR
  master-detail, Dashboard cột ngữ cảnh, `⌘K` mở Studio switcher, mobile 390px giữ nguyên 1 cột
  — tất cả đúng thiết kế, 0 lỗi console thật (chỉ 401 do chưa mock API từ điển/âm thanh khi thử
  thủ công, không phải do code đã đổi).

  **Việc để ngỏ (cố ý, nêu rõ trong spec mục "KHÔNG LÀM"):** cột ngữ cảnh cho Kanban/LifeGraph,
  command palette tìm kiếm mờ đầy đủ (hiện `⌘K` chỉ mở lại Studio switcher có sẵn).

- **[2026-09-02] ✅ ĐỢT 2 THIẾT KẾ LẠI DESKTOP — HỆ THỐNG THIẾT KẾ + BREADCRUMB TOÀN SITE, ĐÃ
  XONG TRỌN VẸN 5 PR.** Loạt 2026-08-31 ở trên mới sửa 4 trang tiêu biểu; loạt này phủ toàn bộ
  và chốt nền hệ thống thiết kế.
  1. **Đợt 1 — nền hệ thống** (`#815`, nhật ký `docs/changelog/0232-*.md`): thang chữ, token bề
     mặt, khung trang chung `PageShell`.
  2. **Đợt 2 — bề rộng chuẩn** (`#816`, `0233-*.md`): chốt `max-w-6xl` (1152px) là bề rộng chuẩn
     của app, gom bố cục 2 cột của Trang chủ/Tiến độ; header đổi `5xl → 6xl` cho KHỚP MÉP với
     nội dung (trước đó nội dung thò ra 48px mỗi bên, nhìn như hai lớp lệch nhau).
  3. **Đợt 3 — gom nốt 2 cột** (`#817`, `0234-*.md`): Luyện viết + `CefrLevelPage`.
  4. **Đợt 4 — phủ 45 trang còn lại** (`#818`, `0235-*.md`).
  5. **Breadcrumb: phủ nốt môn Lập trình và các trụ** (`#819`, `0236-*.md`) — hai vùng trắng
     cuối cùng của breadcrumb desktop:
     - **Lập trình:** thêm tầng tĩnh (`huong`/`du-an`/`on-tap`/`chay-thu`/`gioi-thieu`) và cơ chế
       **đốt cha ĐỘNG** — tham số `extra` của `buildCrumbs` + prop `crumbs` của
       `Breadcrumb`/`Layout` — để trang chặng, chẩn đoán và bài học tự cấp tên hướng/lộ
       trình/bậc mà cây route TĨNH không thể biết.
     - **Các trụ:** trang công cụ của trụ trước đây không có tầng cha nào nên breadcrumb **tự ẩn
       hẳn**. Nay `/career/interview`, `/startup/canvas`, `/work/kanban`, `/life/wheel`,
       `/action-canvas`, `/life-graph`, `/ung-dung-thuc-te` đều lồng dưới đúng studio; đốt tab
       của hai studio gộp giữ tham số `?muc=` nên bấm vào rơi đúng tab.

  **Hai quyết định giữ lại cho lần sau:** (a) KHÔNG đưa các trụ vào `navTree.ts` — sidebar chưa
  có nhóm con cho hai studio trụ, thêm dữ liệu chỉ để breadcrumb dùng là dựng sẵn một nguồn dễ
  lệch; (b) KHÔNG đặt nút breadcrumb cho đường dẫn không có trang thật — một đốt bấm vào rơi vào
  route `*` (về Trang chủ) còn tệ hơn là không có đốt.

  **Việc để ngỏ:** breadcrumb chỉ hiện trên desktop (`hidden lg:block`) và là phần BỔ SUNG bên
  cạnh nút Back, không thay thế — mobile vẫn chỉ có Back. Cột ngữ cảnh cho Kanban/LifeGraph và
  command palette tìm kiếm mờ vẫn để ngỏ như loạt trước.

- **[2026-08-26] ✅ HAI TÍNH NĂNG GIỮ CHÂN ĐÃ LÀM XONG (đặc tả + code + test + cổng a11y).**
  Đợt research-first 2026-08-26 (`docs/changelog/0168-*.md`) rồi thi hành trọn vẹn cùng ngày
  (`0169-*.md` và `0170-*.md`):
  1. **Chế độ ôn thi có hạn chót** — ✅ **XONG E1–E4 (2026-08-26)**, xem
     `docs/changelog/0170-*.md`. Gói mới `packages/core-examplan` (lập lịch ngược, hàm thuần),
     migration `0070_exam_plans.sql`, API `/api/exam-plan`, trang `/on-thi`
     (`apps/dhcb/src/pages/learning/ExamPlan.tsx`), FSRS nhận `request_retention` theo giai đoạn
     (`apps/dhcb/src/lib/srs.ts`, có cờ tắt `localStorage.srs_retention_off = '1'`), cổng a11y
     `e2e/a11y-exam-plan.spec.ts`. Phạm vi đợt 1: **một kỳ thi duy nhất** — vào lớp 10, Tiếng Anh,
     phạm vi từ vựng A1→B1. ⚠️ **Việc tay:** `npm run migrate:pg` trên VPS.
     Việc để lại: thi thử full-length (chặn bởi ngân hàng đề + `core-grading` đã bị xoá khỏi
     repo, xem mục GĐ2); kỳ thi thứ hai; ghép "còn N ngày" vào báo cáo tuần.
  2. **Người thân theo dõi (báo cáo tuần cho phụ huynh)** — ✅ **XONG C1–C4 (2026-08-26)**,
     xem `docs/changelog/0169-*.md`. Migration `0069_companion_links.sql`, service
     `packages/core-personal/companionLinkService.ts`, nội dung thư
     `apps/server/src/api/_lib/weeklyReport.ts`, gửi `weeklyReportService.ts` (bộ hẹn giờ chủ
     nhật 19h VN trong `server.ts`), API `/api/companion-link`, giao diện
     `CompanionLinkSection.tsx` trong Hồ sơ, cổng a11y riêng `e2e/a11y-companion-link.spec.ts`.
     ⚠️ **Việc tay:** `npm run migrate:pg` trên VPS (hoặc để deploy tự chạy khi merge).
     Việc để lại: bản chiều B — **nợ có chủ đích, người dùng chốt 2026-08-26**, xem mục "Nợ kỹ
     thuật còn mở"; thêm dòng "còn N ngày đến kỳ thi" khi chế độ ôn thi xong.
     **Kỳ thi đợt 1 đã chốt:** "vào lớp 10 — Tiếng Anh" (người dùng xác nhận 2026-08-26). Đổi kỳ
     thi chỉ cần sửa `ExamKindSchema` + phạm vi từ vựng ở `apps/dhcb/src/lib/examPlan.ts`.
- **[2026-08-27] Môn Lập trình — 13 HƯỚNG CHUYÊN SÂU + BẢN ĐỒ KIẾN TRÚC (bản đồ sau P5) — ✅ XONG.** Đặc tả:
  `docs/research/dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md`; nhật ký:
  `docs/changelog/0175-2026-08-27-feat-huong-chuyen-sau-mon-lap-trinh.md`. Dữ liệu ở
  `packages/subject-programming/specializations/` (13 hướng × 4 chặng S1→S4 = 52 chặng, 211
  module học, 65 dự án), giao diện `/lap-trinh/huong` + `/lap-trinh/huong/:specId`.
  **MỌI hướng có lát cắt KIẾN TRÚC bắt buộc** (`SpecArchitecture`, 5 ô: module + trách nhiệm ·
  hợp đồng qua ranh giới · quyết định phải chốt sớm · NFR thành số · checklist đặc tả) — tổng
  263 mục, 72 module. Hướng thứ 13 `architecture` ("Kiến trúc hệ thống & Đặc tả cho AI thi
  hành") dạy chính kỹ năng viết đặc tả kín và nghiệm thu code mình không tự gõ; `architecture`
  và `algo` mang cờ `crossCutting` (học SONG SONG, không thay hướng chính).
  **Khuôn dùng ngay:** `docs/templates/dac-ta-tinh-nang.md` (6 ô bắt buộc + ô nghiệm thu) và
  `docs/templates/adr.md` — copy ra dùng khi giao việc cho AI.
  **Quan hệ với CHƯƠNG TRÌNH M:** hai việc KHÔNG đè nhau — M thêm _unit dạy học_ vào P6
  (`p6-u5…u15`), còn tầng này là _bản đồ nghề_ nằm ngoài dòng unit. Bốn unit `p6-u1…u4` nay đặt
  tên là "Dẫn nhập hướng …" cho khớp.
  **Tiến độ hướng đã LƯU XUỐNG POSTGRES (2026-08-27, nhật ký `docs/changelog/0178-*.md`)** —
  migration `0071_programming_specializations.sql` (bảng `programming.spec_enrollment` với
  partial unique index "một hướng chính mỗi người" + `programming.spec_stage_progress`), service
  `packages/subject-programming/specProgressService.ts`, API `/api/programming/specialization`,
  client `apps/dhcb/src/lib/programmingSpecProgress.ts`; hai trang hướng nay hiện "bạn đang theo
  hướng này" + đánh dấu chặng đã xong. ⚠️ **Việc tay:** `npm run migrate:pg` trên VPS (hoặc để
  deploy tự chạy khi merge).
  **[Đợt 0179, cùng ngày] CHẶNG S2 của cả 13 hướng đã có CHI TIẾT THI HÀNH ĐƯỢC** — tầng khác
  với hai mục trên, không đè nhau: mỗi module S2 (53 module) có mục tiêu · bài luyện tay · câu
  tự kiểm · dấu hiệu đã nắm; mỗi chặng có rubric nghiệm thu (65 tiêu chí, mỗi tiêu chí kèm CÁCH
  CHỨNG MINH) và một **đặc tả mẫu 6 ô**. Dữ liệu `specializations/details/<hướng>-s2.ts` +
  `stageDetails.ts`; trang chặng `/lap-trinh/huong/:specId/:stageId`. Tiến độ ở **mức MỤC**
  (module/tiêu chí) lưu qua `/api/programming/progress`, dùng chung `programming.lesson_progress`
  — không cần migration; tiến độ **mức CHẶNG** vẫn là cơ chế `spec_stage_progress` ở trên. Nhật
  ký: `docs/changelog/0179-2026-08-27-chang-s2-huong-chuyen-sau.md`.
  **[Đợt 0183, 2026-08-27] CHI TIẾT CHẶNG NAY ĐỦ 4/4 CHẶNG × 13 HƯỚNG (52 chặng) — mảng này
  ĐÓNG.** S1 soạn ở đợt này (53 module, 58 tiêu chí; nhật ký
  `docs/changelog/0183-2026-08-27-chi-tiet-chang-s1-13-huong.md`), S2 ở đợt 0179, S3 ở 0180, S4 ở 0182. Cổng `specStageDetails.test.ts` nay có ca quét thẳng bản đồ: **thêm chặng mới mà quên
  soạn chi tiết là CI đỏ**, không phải trang thiếu nội dung.
  **[Đợt 0185, 2026-08-27] Chặng `backend-s1` ĐÃ có bài 8 bước** (6 bài, `p6-u61…u63`, phủ đủ
  4/4 module; nhật ký `docs/changelog/0185-2026-08-27-bai-hoc-chang-s1-huong-backend.md`).
  ⚠️ **Phát sinh đã vá:** bảng "CHỐT CỨNG" của đặc tả S4 chia hết dải mã unit mà QUÊN chỗ cho
  S1 của 11 hướng còn lại. Nay `p6-u61…u93` là S1 của 11 hướng đó, **S2/S3 dời xuống `p6-u94`**
  — xem `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`. Không mã đã phát hành nào
  bị đổi nên không khoá tiến độ Postgres nào bị ảnh hưởng.
  **Việc để ngỏ (cố ý):** ~~chưa soạn bài 8 bước cho hướng nào~~ → **sáu chặng `web-s1`,
  `architecture-s1`, `web-s4`, `backend-s1`, `ai-s1` và `data-s1` ĐÃ có bài 8 bước** (`ai-s1`
  và `data-s1` soạn 2026-08-31, nhật ký `docs/changelog/0210-2026-08-31-bai-hoc-huong-ai.md`
  - `docs/changelog/0211-2026-08-31-bai-hoc-chang-s1-huong-du-lieu.md` — lưu ý số `0210`/`0211`
    TRÙNG với hai đợt việc khác không liên quan (lộ trình "Kỹ Sư Trưởng AI" đợt 3/4), trùng số là
    chuyện bình thường theo `docs/changelog/README.md`; `data-s1` dùng dải `p6-u66…u68` — dải
    `p6-u64…u66` từng ghi ở đây ĐÃ ĐỔI vì `p6-u64`/`p6-u65` bị `ai-s1` lấy trước); **46/52 chặng
    còn lại chưa có** (tầng khác với chi tiết chặng, `stageUnits.ts`). Mã unit TIẾP THEO còn
    trống bắt đầu từ `p6-u69` (dải `p6-u94…u101` đã bị lộ trình "Kỹ Sư Trưởng AI" lấy riêng).
    **[2026-08-31] Chặng `backend-s2` (KHÔNG tính vào 52 chặng S1 ở trên — đây là chặng S2 đầu
    tiên có bài) cũng ĐÃ có bài 8 bước** (6 bài, `p6-u102…u104`, phủ đủ 4/4 module — dùng lại
    dải mã unit tiếp theo còn trống vì `p6-u94…u101` đã bị lộ trình "Kỹ Sư Trưởng AI" chiếm
    trước, khác dải `p6-u94` mà kế hoạch cũ dự kiến cho S2/S3; nhật ký
    `docs/changelog/0212-2026-08-31-bai-hoc-chang-s2-huong-backend.md`).
    **[2026-08-31] Chặng `backend-s3` cũng ĐÃ có bài 8 bước** (6 bài, `p6-u105…u107`, phủ đủ
    4/4 module — sharding & timeout-là-KHÔNG-BIẾT, outbox & saga, circuit breaker & error
    budget; nối lại khái niệm idempotent đã dạy ở `backend-s2`; nhật ký
    `docs/changelog/0213-2026-08-31-bai-hoc-chang-s3-huong-backend.md`).
    **[2026-08-31] Chặng `backend-s4` (chặng CUỐI của hướng Backend) cũng ĐÃ có bài 8 bước**
    (6 bài, `p6-u108…u110`, phủ đủ 4/4 module — ước lượng dung lượng QPS/dung lượng lưu, độ trễ
    đa vùng địa lý (RTT ánh sáng trong sợi quang); chọn kho lưu trữ chuyên biệt, LSM tree vs
    B-tree; phân quyền đặc quyền tối thiểu, phân loại mức độ sự cố + leo thang; nối lại nhất
    quán cuối cùng đã dạy ở `backend-s3`; nhật ký
    `docs/changelog/0214-2026-08-31-bai-hoc-chang-s4-huong-backend.md`). **Hướng Backend nay đã
    có bài 8 bước ĐỦ CẢ 4 CHẶNG S1→S4.**
    **[2026-08-31] Chặng `web-s2` cũng ĐÃ có bài 8 bước** (6 bài, `p6-u111…u113`, phủ đủ 5/5
    module — chọn mã trạng thái HTTP + phân trang + Idempotency-Key; toàn vẹn tham chiếu khoá
    ngoại (góc khác `backend-s2`) + so mật khẩu đã băm + chọn session-cookie/JWT; huỷ phản hồi cũ
    khi gõ tìm kiếm (race condition) + kiểm biến môi trường/thứ tự migration; nhật ký
    `docs/changelog/0215-2026-08-31-bai-hoc-chang-s2-huong-web.md`).
    **[2026-08-31] Chặng `web-s3` cũng ĐÃ có bài 8 bước** (6 bài, `p6-u114…u116`, phủ đủ 5/5
    module — phân loại LCP/INP/CLS theo ngưỡng CLAUDE.md + ngân sách bundle chặn CI; chọn chiến
    lược render SSG/SSR/CSR + kiểm luật phụ thuộc module; tỉ lệ kim tự tháp test khoẻ mạnh +
    phân loại lỗ hổng XSS/CSRF/SSRF + rate limit. **Sự cố CI ở PR #780 (web-s2) do một test
    app-level `ProgrammingSpecializationPage.test.tsx` hardcode số chặng web đã có bài — đã sửa
    kèm bài học: `npm test` toàn monorepo mới bắt được lớp lỗi này, `stageUnits.test.ts` xanh
    không đủ.** Nhật ký `docs/changelog/0216-2026-08-31-bai-hoc-chang-s3-huong-web.md`.
    **Hướng Web nay có bài 8 bước ĐỦ CẢ 4 CHẶNG S1→S4.** Mã unit TIẾP THEO còn trống bắt đầu từ
    `p6-u117`.
    Bốn hướng `game`, `embedded`, `desktop` và phần lớn `systems` KHÔNG có bộ
    chạy trong trình duyệt — cần quyết định riêng về làn trước khi soạn. **Cố ý KHÔNG làm bài học 8 bước cho cả 13 hướng** — 9/13
    hướng không có bộ chạy trong trình duyệt, ép khuôn sẽ đẻ nội dung giả. Chưa nối tiến độ chặng
    với tiến độ bài học (đánh dấu chặng vẫn là thao tác tay); chưa gợi ý hướng theo hồ sơ người học.
    **Bài học kỹ thuật (đợt 0183):** một test dùng "thứ chưa làm" làm ví dụ phản chứng sẽ tự hết
    hạn đúng vào ngày thứ đó được làm — `progress.test.ts` từng lấy `web-s1-r1` làm khoá "không
    tồn tại" và đỏ ngay khi S1 được soạn. Phản chứng phải chọn thứ **không bao giờ tồn tại**
    (`-r99`, `-s5`), đừng chọn thứ đang trống trong kế hoạch.
    **Bài học kỹ thuật:** trong `packages/` **không đặt tên file là `index.ts`** khi file có thể
    vào chunk riêng — Rollup đặt tên chunk theo tên file, `index-*.js` trùng glob "Initial JS" của
    `.size-limit.json` và làm ngân sách đội 27 kB (đã dính thật, đổi thành `registry.ts` là hết).

- **[2026-08-27] Môn Lập trình — NỘI DUNG CHẶNG S1 HƯỚNG WEB — ✅ XONG.** Nhật ký:
  `docs/changelog/0176-2026-08-27-feat-noi-dung-chang-s1-huong-web.md`. **7 bài học 8 bước** phủ
  đủ 5 module của `web-s1`, đặt trong 3 unit mới của P6: `p6-u16` (event loop · Grid/Flex ·
  mobile-first · design token), `p6-u17` (UI là hàm của state · union phân biệt 4 trạng thái ·
  không tin `as`), `p6-u18` (bàn phím & focus · 4 trạng thái màn hình + `aria-live`).
  **Mã unit của nội dung hướng chuyên sâu bắt đầu từ `p6-u16`** — dải `p6-u5…u15` vẫn thuộc
  CHƯƠNG TRÌNH M, không được lấn (mã unit là khoá tiến độ Postgres).
  Cầu nối chặng ↔ bài: `specializations/stageUnits.ts` + cổng `stageUnits.test.ts`; trang chi
  tiết hướng hiện khối "Vào học chặng này" CHỈ ở chặng đã có bài.
  **Bài học kỹ thuật:** cổng nội dung yêu cầu **đáp án bước ④ Predict phải là output THẬT** của
  đoạn code (lựa chọn sai không được khớp) — soạn Predict kiểu "chọn câu giải thích đúng" là CI
  đỏ. Cả 7 bài dính lỗi này ở bản đầu.
  **Việc tiếp theo của mạch này:** ~~chặng S1 hướng `architecture`~~ → **đã xong, xem mục ngay
  dưới**; rồi lưu tiến độ hướng xuống Postgres.

- **[2026-08-27] Môn Lập trình — NỘI DUNG CHẶNG S1 HƯỚNG KIẾN TRÚC — ✅ XONG.** Nhật ký:
  `docs/changelog/0177-2026-08-27-feat-noi-dung-chang-s1-huong-kien-truc.md`. **6 bài học 8
  bước** phủ đủ 4 module của `architecture-s1`, đặt trong 3 unit mới của P6: `p6-u19` (trách
  nhiệm duy nhất đo được · luật phụ thuộc một chiều + đảo phụ thuộc), `p6-u20` (bản đồ C4 kiểm
  được bằng máy · điểm nóng fan-in + dò vòng bằng bóc lá), `p6-u21` (đặc tả kín sáu ô · ADR có
  ô "vì sao loại" và điều kiện xem lại). Nối tiếp dải unit của hướng Web: `p6-u16…u18` là Web,
  `p6-u19…u21` là Kiến trúc.
  **Quyết định nội dung đáng ghi:** hướng này dạy KỸ NĂNG ĐẶC TẢ chứ không dạy cú pháp, mà bài
  Make thì phải chấm được bằng test-case. Cách giải: mỗi luật kiến trúc được biến thành MỘT HÀM
  THUẦN đọc bản mô tả hệ thống rồi trả báo cáo vi phạm — đúng loại máy kiểm mà dự án thật đặt
  trong CI (`npm run codemap`, lint luật phụ thuộc). Học viên ra khỏi chặng là có công cụ dùng
  được, không phải chỉ có ý thức. Cả 6 bài dùng `language: 'typescript'` nên đi qua cổng tsc
  thật (`lessonsTs.test.ts`).
  Hai khuôn `docs/templates/dac-ta-tinh-nang.md` và `docs/templates/adr.md` được dạy ở `p6-u21`
  ở đúng phần KIỂM ĐƯỢC BẰNG MÁY (đủ ô · tiêu chí có ngưỡng số · ADR có ≥ 2 phương án); phần
  nội dung sâu vẫn để dành cho chặng S3.
  **Việc tiếp theo của mạch này:** lưu tiến độ hướng xuống Postgres; sau đó chọn chặng S1 của
  một hướng sản phẩm khác (gợi ý: `backend` hoặc `data`).

- **[2026-08-26] Môn Lập trình — CHƯƠNG TRÌNH M (mở rộng ngôn ngữ & tư duy), 12 PR.** Hiến
  chương: `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md` (PR-M0 ✅ xong).
  Người dùng chốt mở cả ba tầng: tầng 1 thêm **`bash`**, tầng 2 thêm **Kotlin + Swift**, tầng 3
  thêm **PARADIGM** (không thêm ngôn ngữ). Quyết định trụ cột: **bộ chạy TẬP CON viết bằng
  TypeScript chạy trong Worker** — học viên gõ cú pháp Swift/Kotlin thật và được chấm bằng
  test-case, không dựng judge server (bác lần thứ ba), không dựng hệ bậc song song S1–S5.
  Xếp chỗ: `bash` mở rộng `p3-u11` · Kotlin `p6-u5…u7` · Swift `p6-u8…u12` · Paradigm
  `p6-u13…u15` (P6 giãn 4 → 15 unit). Thứ tự: **M1 `bashSim` → M2 nội dung bash → M3
  `swiftsim` → M4–M6 nội dung Swift → M7 `kotlinsim` → M8–M9 Kotlin → M10–M11 Paradigm → M12
  giao diện P6**. ⚠️ **Cổng cứng giữa M3 và M4:** interpreter Swift phải qua bộ test đối chiếu
  TRƯỚC khi soạn bài nội dung nào.
  **Tiến độ:** PR-M0 ✅ · PR-M1 ✅ · PR-M2 ✅ · PR-M3 ✅ · **PR-M7 ✅ (2026-08-27, LÀM SỚM —
  xem ngay dưới) + cổng §3.4 ĐÃ MỞ (2026-09-03)** · **PR-M8 ✅ (2026-09-03) — unit Kotlin ĐẦU
  TIÊN `p6-u5` "Kotlin nhập môn — model dữ liệu", 3 bài đủ 8 bước, mini-project "Sổ chi tiêu"
  bản đầu; kèm 2 test TRÌNH DUYỆT cho mạch Kotlin (đã chạy xanh). Nhật ký
  `docs/changelog/0249-*.md`.** · **PR-M9 ✅ (2026-09-03) — `p6-u6` (null safety + collections)
  và `p6-u7` (sealed class + trạng thái), 4 bài, dự án khép track "Sổ chi tiêu". **TRACK KOTLIN
  NAY XONG TRỌN VẸN `p6-u5…u7`.** Đợt này còn PHÁT HIỆN một khác biệt chưa có trong bảng —
  `when` biểu thức không khớp nhánh nào thì bộ chạy trả `kotlin.Unit` còn Kotlin thật không dịch
  nổi — đã bổ sung vào hằng `KHAC_BIET` và nói ra trong bài `u7-l1`. Nhật ký
  `docs/changelog/0250-*.md`. ** · **PR-M10 ✅ (2026-09-03) — Paradigm trụ F
  (`p6-u13` lập trình hàm, dự án tách lõi thuần khỏi vỏ hiệu ứng) và trụ C (`p6-u14` đồng thời &
  phân tán, dự án webhook idempotent), 4 bài bằng Python (tầng 3 không thêm ngôn ngữ). Trụ C kế
  thừa mô hình `chay_xen_ke` của `p6-u2`, không viết lại. Nhật ký `docs/changelog/0251-*.md`.
  ** · **PR-M11 ✅ (2026-09-03) — Paradigm trụ S (`p6-u15`
  thiết kế hệ thống & tư duy kỹ sư), 2 bài; dự án dùng SỰ CỐ CÓ THẬT 30/07/2026 của chính dự án
  (ba lỗi độc lập xếp chồng) + công cụ soát post-mortem sáu ô. **PHẦN NỘI DUNG CHƯƠNG TRÌNH M
  NAY XONG**, trừ mạch Swift. Nhật ký `docs/changelog/0252-*.md`. ** · **PR-M12 ✅ (2026-09-03) — gom nhóm unit P6 theo
  mạch. Đo lại: P6 có **65 unit** chứ không phải 15 như hiến chương viết (tầng hướng chuyên sâu
  `u16+` ra đời sau). Thêm trường `track` + `UNIT_TRACKS` + `nhomUnitTheoTrack()`; nhóm mặc định
  KHAI RÕ nên 55 unit hướng chuyên sâu không phải sửa từng cái. P1–P5 giữ nguyên danh sách phẳng.
  Thêm `/lap-trinh/p6` vào CẢ HAI cổng a11y (chú thích cũ "6 bậc dùng chung layout" nay đã sai).
  Nhật ký `docs/changelog/0253-*.md`.**

  **CHƯƠNG TRÌNH M XONG 11/12 PR.** Việc còn lại DUY NHẤT: **M4–M6 (nội dung Swift `p6-u8…u12`)**,
  và nó không phải việc soạn nội dung mà là **việc TAY** — chạy `npm run swift:conformance` trên
  máy có Swift toolchain để mở cổng cứng §8. Môi trường dựng không tải được Swift (thử lại
  2026-09-03: `download.swift.org` mã 000, GitHub swiftlang 403). **ĐÃ ĐẢO THỨ TỰ M7 lên trước M4–M6, người dùng duyệt 2026-08-27:** M4 bị
  cổng cứng §8 chặn tới khi có người chạy `npm run swift:conformance` trên máy có Xcode, còn M7
  là bộ chạy KHÁC không đi qua cổng đó (`conformance.test.ts` của Swift chỉ đỏ khi có bài
  `language: 'swift'`). Cổng cứng M3→M4 **vẫn nguyên vẹn**, PR-M7 không chạm vào.
  **PR-M7 chi tiết** — hạ tầng `kotlinSim` xong (5.972 dòng, nhật ký
  `docs/changelog/0184-2026-08-27-pr-m7-ha-tang-kotlinsim.md`): trình thông dịch tập con Kotlin,
  **tính-null theo KHAI BÁO + smart cast** (trụ cột, đối ứng với "Optional bọc tường minh" của
  Swift), 347 ca trong 4 cổng, runner + đăng ký ngôn ngữ `kotlin`, `npm run kotlin:conformance`.
  Đặc tả bộ chạy: `docs/research/dac-ta-bo-chay-kotlin-2026-08-27.md`.
  ✅ **CỔNG §3.4 ĐÃ MỞ (2026-09-03):** 48/48 ca đã chạy trên `kotlinc 2.0.21` thật (JRE 21.0.10)
  và KHỚP hết — mọi ca nay `daDoiChieu: true`. **PR-M8/M9 (nội dung Kotlin) được phép bắt đầu.**
  Hoá ra không cần máy riêng: proxy tải được `kotlin-compiler-2.0.21.zip` từ GitHub releases và
  môi trường dựng đã có sẵn `java`. Lần chạy thật đầu tiên làm lộ 2 lỗi của KHUNG ĐO (không phải
  lỗi bộ chạy) đã sửa trong `scripts/kotlin-conformance.ts` — xem `docs/changelog/0248-*.md`.
  PR-M3 chi tiết — hạ tầng `swiftsim`
  xong: trình thông dịch tập con Swift (~2.900 dòng, 4 file trong
  `packages/subject-programming/swiftSim/`), Optional bọc tường minh, 41 ca đối chiếu + cổng
  "lỗi phải nói được", runner + đăng ký ngôn ngữ `swift`. Đặc tả bộ chạy:
  `docs/research/dac-ta-bo-chay-swift-2026-08-27.md`.
  ⚠️ **CỔNG CỨNG §8 VẪN CHƯA MỞ:** 41 ca chưa chạy trên `swift` thật. **PR-M4 chưa được bắt
  đầu** — `conformance.test.ts` tự chặn CI nếu có bài `language: 'swift'` khi ca còn
  `daDoiChieu: false`. **Đã thử lại 2026-09-03 (cùng lượt mở cổng Kotlin) và VẪN chặn:**
  `download.swift.org` không tới được (mã 000), `github.com/swiftlang/swift/releases` trả 403 —
  khác Kotlin ở chỗ Kotlin tải được từ GitHub releases. Swift vì vậy vẫn cần máy có toolchain
  thật. Việc tay: xem mục "Cần làm tay".
  **PR-M2 chi tiết (2026-08-27)** — nội dung `p3-u11` nay có 4 bài
  (l2 đi trong cây thư mục · l3 ống lọc dữ liệu · l4 mini-project viết `bao_cao.sh`), +9 thẻ SRS
  (195 → 204), kèm 2 test trình duyệt cho mạch bash. **Đợt này sửa một lỗi thiết kế của PR-M1**:
  `error` từng được đặt cho mã thoát khác 0 khiến giao diện tô đỏ "lỗi hệ thống" và GIẤU output —
  nơi chứa câu tiếng Việt chỉ cách sửa; nay `error` chỉ mang lỗi động cơ, và cổng nội dung canh
  riêng "code mẫu phải kết thúc mã thoát 0". Bài học: cổng CI xanh KHÔNG chứng minh đường đi
  trong trình duyệt đúng — PR hạ tầng M3/M7 phải kèm test trình duyệt.
  **Việc tiếp theo: PR-M3** — hạ tầng `swiftsim` (đắt nhất; cổng cứng: bộ test đối chiếu phải
  xanh TRƯỚC khi soạn nội dung).
  PR-M1 chi tiết — hạ tầng `bash` xong:
  `packages/subject-programming/bashSim.ts` (máy ảo shell thuần TS, đủ tập lệnh hiến chương §4,
  tất định, 2 trần cứng chống treo) + `apps/dhcb/src/lib/bashRunner.ts` + đăng ký ngôn ngữ
  `bash` (schema · codeRunner · LangBadge · trang bài học) + 56 test engine + cổng nội dung
  `lessonsBash.test.ts` dựng sẵn cho PR-M2.

- **[2026-08-03] Thưởng cho Huy hiệu & mốc (migration 0026) — ✅ XONG, admin cấu hình được.**
  Mỗi huy hiệu/mốc (19 huy hiệu hiện có, `src/data/achievements.ts`) tặng thêm N ngày gói
  Pro/VIP khi đạt được, nhận **1 lần duy nhất/tài khoản** (khác nhiệm vụ lặp cooldown ở
  `quests.ts`). Quyết định thiết kế: (1) thưởng = ngày Pro/VIP, tái dùng `grantPlanDays()` có
  sẵn; (2) **xác minh lại "đã đạt" Ở SERVER** trước khi cấp (không tin danh sách huy hiệu
  localStorage gửi lên) — server tự tính lại streak (`free_daily_credit`, tái dùng
  `getCurrentStreak()` của quests.ts), số từ đã thuộc + cấp CEFR đã thi đạt
  (`learning_progress`), số phiên nói/bài viết (`speaking_sessions`/`writing_submissions`), số
  challenge đã nộp + tuần trọn vẹn 7/7 (`challenge_entries`); (3) admin cấu hình **TỪNG huy
  hiệu 1 dòng riêng** (bật/tắt + gói + số ngày) ở tab mới "Thưởng huy hiệu" trong `/admin-s` —
  gom hết vào 1 chỗ theo yêu cầu, không rải rác nhiều nơi.
  Migration `postgres/migrations/0026_achievement_rewards.sql` (bảng `achievement_rewards` +
  `achievement_claims`, seed sẵn giá trị mặc định cho 19 huy hiệu). Backend:
  `api/_lib/achievementRewards.ts` (tính điểm + cache cấu hình TTL 30s), `api/achievements.ts`
  (GET trạng thái + POST nhận thưởng, rate-limit chặt như `api/quests.ts`),
  `api/admin-achievement-rewards.ts` (admin GET/PUT). Frontend:
  `src/lib/achievementRewards.ts` (gọi API), khối "Nhận thưởng" mới trong Hồ sơ
  (`Profile.tsx`, chỉ hiện huy hiệu đã đạt + có thưởng + chưa nhận),
  `AdminAchievementRewardsPanel.tsx`. ⚠️ **Việc tay trước khi dùng thật:** chạy
  `npm run migrate:pg` trên VPS để tạo 2 bảng mới.

- **[2026-08-02] Trang Nghe — ✅ ĐÓNG THỂ LOẠI `fable` 20/20 (14 truyện Jataka).** Soạn nốt toàn
  bộ phần còn lại của thể loại ngụ ngôn từ **Jataka Tales** (PG 62514, Babbitt 1912) và **More
  Jataka Tales** (PG 7518, Babbitt 1922): Rùa tự cứu mình · Rùa nói nhiều · Con ngỗng vàng · Con
  Bò thắng cược · Cái cày bị mất trộm · Chim gõ kiến, Rùa và Hươu · Con đường cát · Cuộc cãi vã
  của bầy chim cút · Chú Thỏ nhút nhát dại dột · Vua Hươu cây Đa · Cua và Sếu · Ba con Cá · Con
  Khỉ tham lam · Hoàng tử Độc Ác và những con vật biết ơn.
  **Thay 4 mục trong danh mục** (đã cập nhật `docs/research/danh-muc-truyen-nghe-2026-08-01.md`):
  3 truyện Aesop quá ngắn (`fb-boys-frogs`/`fb-walnut-tree`/`fb-charcoal-fuller`, đều < 200 từ)
  đổi sang Jataka ≥ 489 từ; và **`fb-cruel-crane` bị loại vì TRÙNG NỘI DUNG với `fb-crab-crane`**
  — "The Cruel Crane Outwitted" (Jacobs, PG 7128) và "The Crab and the Crane" (Babbitt, PG 62514)
  là **cùng một tích Jataka**, chỉ khác người kể lại. Thay bằng `fb-prince-wicked` (1.692 từ).
  ⚠️ **Bài học cho các thể loại sau:** khi lấy truyện từ nhiều tuyển tập cùng một truyền thống
  (Jataka, Grimm/Lang, Andersen nhiều bản dịch) phải **đối chiếu NỘI DUNG, không chỉ đối chiếu
  tên** — tên khác nhau vẫn có thể là cùng một truyện.
  Độ dài thể loại: 9.789 từ EN, trung bình 489 từ/truyện (bản Aesop cũ chỉ ~94 từ/truyện, quá
  ngắn cho thư viện nghe). `fb-prince-wicked` có cảnh đám đông giết vua bằng tên và đá — nguyên
  văn public domain, giữ nguyên, nhưng nên lưu ý khi gắn nhãn độ tuổi.
- **[2026-08-02] Trang Nghe — ✅ ĐÓNG THỂ LOẠI `vn-folk` 20/20 (đợt 2, 7 truyện cuối).** Soạn nốt
  #14–20: Lưu Bình — Dương Lễ · Sự tích con muỗi · Người con gái Nam Xương · Sự tích cây vú sữa ·
  Sự tích chim quốc · Ba điều ước · Trí khôn của ta đây. Cả 20 truyện `vn-folk` đạt 497–709 từ EN,
  22–37 câu. Người con gái Nam Xương (B2) là truyện dài nhất và khó nhất thể loại — giữ trọn chi
  tiết cái bóng trên vách và đoạn kết trên bến Hoàng Giang.
  **Sửa thêm 2 mã id sai trong danh mục:** #15 `vn-tam-that-quy` (vô nghĩa so với nội dung) →
  `vn-su-tich-con-muoi`; #17 `vn-hai-chi-em-cay-vu-sua` ("hai chị em" — truyện thực ra là mẹ và
  con trai, không có chị em nào) → `vn-su-tich-cay-vu-sua`.
  **Còn lại 4 thể loại (`fable` 14 truyện, `myth`/`humor`/`children` mỗi thứ 20) đều PHỤ THUỘC
  Project Gutenberg** → không làm được cho tới khi network policy mở `gutenberg.org`.

- **[2026-08-02] Trang Nghe — đợt `vn-folk` #4–13 (10 truyện, `vn-folk` lên 13/20).** Soạn: Sự
  tích quả dưa hấu · Ăn khế trả vàng · Cây tre trăm đốt · Thạch Sanh · Sự tích Hồ Gươm · Chú Cuội
  cung trăng · Sọ Dừa · Con Rồng cháu Tiên · Sự tích trầu cau · Trạng Quỳnh. Mỗi truyện 497–689
  từ EN (đều vượt ngưỡng ≥400 từ đã chốt), 27–37 câu song ngữ, Opus tự kể + tự dịch theo nguyên
  tắc §1.3 của danh mục (truyện dân gian VN không có bản PD tiếng Anh).
  **⚠️ Vì sao KHÔNG làm `fable` như kế hoạch đã ghi:** 14 truyện `fable` còn lại đều cần nguyên
  văn Project Gutenberg, nhưng **network policy của phiên chặn `gutenberg.org`** (CONNECT trả
  403; đã thử cả `aleph.gutenberg.org`, `gutenberg.pglaf.org`, archive.org, wikisource — hỏng
  hết). CLAUDE.md §5 cấm gõ từ trí nhớ nên `fable`/`myth`/`humor`/`children` **bị chặn cứng**,
  chỉ `vn-folk` làm được. **Việc cho chủ dự án:** nếu muốn tiếp 4 thể loại kia thì cần mở network
  policy cho `gutenberg.org` ở môi trường Claude Code web.
  **Sửa lỗi danh mục:** mục #10 cũ `vn-mai-an-tiem` **trùng nội dung** với #4 `vn-su-tich-dua-hau`
  (Mai An Tiêm chính là nhân vật sự tích dưa hấu) → đã thay #10 bằng `vn-so-dua` (Sọ Dừa), giữ
  nguyên tổng 20. Xem `docs/research/danh-muc-truyen-nghe-2026-08-01.md` §5.
  Đã rút kinh nghiệm đợt trước: chạy script kiểm chỉ số `p` **ngay sau khi viết file**, trước khi
  chạy test — cả 10 file đạt ngay từ lần đầu.

- **[2026-08-02] Trang Nghe — ✅ ĐÓNG THỂ LOẠI `fairy-tale` 20/20.** Phiên này thêm 6 truyện cuối:
  Jacobs PG 7439 (Jack và cây đậu thần 96 câu · Ba chú lợn con 57 câu · Ba chú gấu 64 câu) +
  Ozaki PG 4018 (Chim sẻ bị cắt lưỡi 115 câu · Urashima Taro 148 câu · Momotaro 174 câu) — nguyên
  văn đã `curl` về thật, dịch tay đầy đủ từng câu. Trước đó cùng ngày đã merge 3 truyện Perrault
  (PR #441).
  **Bẫy kỹ thuật gặp phải, ghi lại để đợt sau tránh:** hai truyện Ozaki có **chú thích cuối trang**
  xen giữa các đoạn (`[1] An alcove where…`, `[2] "All right"…`). Khi bỏ đoạn chú thích ra khỏi
  bản dịch, chỉ số `p` bị **nhảy cóc**, vi phạm ràng buộc "p tăng dần không nhảy cóc" ở
  `stories.test.ts` — lỗi này KHÔNG lộ ra khi đọc file bằng mắt, chỉ script kiểm mới bắt được.
  Đã sửa bằng cách đánh số lại `p` tuần tự. Đợt sau soạn nguồn có chú thích (Ozaki, Bulfinch) phải
  chạy script kiểm `p` ngay sau khi viết file, đừng đợi tới lúc chạy test.
  Cũng như lô Perrault, các bản Jacobs này là **bản gốc chưa làm mềm**: hai chú lợn đầu bị sói ăn
  thịt, con sói bị luộc chín; Ba chú gấu kết bằng việc bà lão nhảy khỏi cửa sổ, người kể bỏ ngỏ
  chuyện bà có gãy cổ hay không. Cấp CEFR gán theo **độ khó ngôn ngữ**, không phải độ tuổi phù hợp
  — nếu sau này muốn lọc theo tuổi thì phải thêm trường riêng, đừng dùng lại cấp CEFR.
  **Đợt kế tiếp:** `fable` (14 truyện còn lại, ưu tiên nguồn dài ≥400 từ theo nguyên tắc đã chốt ở
  §4 của `docs/research/danh-muc-truyen-nghe-2026-08-01.md`).
  **Lưu ý phối hợp:** `vn-folk` do phiên khác làm (PR #440) — tránh trùng. Ghi chú trong file chỉ
  có tác dụng nếu phiên kia đọc trước khi bắt đầu; nếu chạy song song, nên chốt trước ai giữ
  thể loại nào (PR #440 đã phải huỷ bỏ 2 truyện Andersen vì soạn trùng PR #437).

- **[2026-07-31] Backup cấu hình hệ thống (Nginx + crontab + PM2 dump) lên R2 — ĐÃ THÊM.** Phát
  hiện lỗ hổng khi chỉnh tay Nginx nhiều lần lúc chuyển domain `.org`: `pg_dump`/`backup:env` chỉ
  backup DB/`.env`, không backup Nginx/crontab/PM2 dump — VPS hỏng thì khôi phục xong DB+`.env`
  vẫn phải cấu hình lại Nginx từ đầu bằng trí nhớ, và mất luôn crontab (chính là các dòng lệnh
  khiến backup TỰ CHẠY). Thêm `scripts/backup-system-to-r2.ts`/`restore-system-from-r2.ts` (lệnh
  `npm run backup:system`/`restore:system`) — đóng gói tar + mã hoá AES-256-GCM (dùng lại
  `encryptEnv`/`decryptEnv` của `backup:env`, không lặp logic), đẩy cùng bucket R2 private. Chi
  tiết cron + cách khôi phục từng phần: `docs/setup-postgresql-vps.md` mục 7.4. **ĐÃ XÁC NHẬN
  chạy thật trên VPS 2026-07-31**: `backup:system --dry-run` rồi chạy thật đều thành công (upload
  `system-backups/system_20260731.tar.gz.enc`). **[Cập nhật cùng ngày]** Đã gộp cron: thay vì 3
  dòng cron riêng ở 2 user (`postgres`: `backup:r2`; `root`: `backup:system`; `backup:env` từng bị
  bỏ sót, chưa có cron) → tạo `/root/backup-all.sh` (root-only, `chmod 700`, chứa passphrase tạo
  bằng `openssl rand -base64 32`) gọi cả `backup:r2`+`backup:env`+`pm2 save`+`backup:system` trong
  1 lệnh, 1 dòng cron `root` duy nhất (`10 3 * * *`, sau `pg_dump` của `postgres` lúc `0 3 * * *`).
  Đã xoá dòng `backup:r2` trùng lặp khỏi crontab `postgres` (giữ lại `pg_dump` + `verify-pg-backup`
  chủ nhật). Chi tiết: `docs/setup-postgresql-vps.md` mục 7.6. Thêm `scripts/restore-all-from-r2.ts`
  (`npm run restore:all`) gộp cả 3 lệnh khôi
  phục (Postgres/`.env`/hệ thống) thành 1 lệnh cho tình huống dựng lại VPS từ đầu — mặc định chỉ
  TẢI VỀ (an toàn), chỉ thực sự ghi đè Postgres khi truyền `--restore-into <db> --yes`. **[Cập
  nhật 2026-08-01] ĐÃ XÁC NHẬN chạy thật `restore:all` (chế độ tải về, không ghi đè gì) trên VPS**:
  `.env.restored` khớp 100% với `.env` thật (`diff` không lệch dòng nào), `system-restored.tar.gz`
  đủ cấu trúc `nginx/` (gồm `sites-available/default`+`en-vi`) + `crontab/root.txt`+`postgres.txt`
  - `pm2/dump.pm2`, file `.sql.gz` Postgres tải về nguyên vẹn (`gunzip -t` qua). Lưu ý khi test:
    chạy qua `npm --prefix <dir> run restore:all` thì file tải về nằm trong `<dir>` (theo cwd của
    script con), KHÔNG phải thư mục đang đứng — muốn cô lập file test phải `cd` vào thư mục đó rồi
    chạy `npm run` thường, không dùng `--prefix`. Bộ 3 backup + restore giờ đã kiểm chứng đầy đủ cả
    2 chiều.

- **[2026-07-31] Đổi domain chính sang `.org` — ĐÃ HOÀN TẤT.** `en-vi.donghanhcungban.org` giờ là
  domain mặc định (biến `SITE_URL`/`VITE_SITE_URL`/`EN_VI_HOSTNAME`/`VITE_ENGLISH_APP_URL` trên
  VPS đã trỏ `.org`); `.com`/`www.donghanhcungban.com` 301 redirect sang `www.donghanhcungban.org`
  (Nginx, việc tay). Đã xác nhận thật: đăng nhập Google + 1 giao dịch SePay (tiền tố mới `DHCB`)
  chạy đúng trên `.org`. **Quyết định đi kèm:** tạm hoãn thêm domain `.org` vào Facebook Developer/
  Apple Developer (Services ID)/Microsoft Azure — 3 nền tảng này tạm báo lỗi khi đăng nhập trên
  `.org` cho tới khi làm sau; Google + email/password vẫn dùng bình thường. Chi tiết + lịch sử đầy
  đủ: `docs/doi-ten-mien-chinh-org.md`. Trong lúc thi hành phát hiện + sửa 2 lỗi thật (đã merge,
  xem PR #403/#404): (1) `apps/hub/vite.config.ts` thiếu `envDir` nên Vite đọc nhầm `.env` ở
  `apps/hub/` thay vì gốc repo → nút "Đăng nhập"/"Học ngay" của hub luôn rơi về `.com` dù đã đặt
  đúng `VITE_ENGLISH_APP_URL`; (2) `server.ts` (`distDirForHost`) chỉ khớp đúng 1 hostname với
  `EN_VI_HOSTNAME` nên trong lúc chạy song song 2 domain, mọi request tới `.org` (kể cả `/login`)
  bị phục vụ nhầm bằng `apps/hub/dist` — nay `EN_VI_HOSTNAME` nhận danh sách nhiều host phân cách
  dấu phẩy.

- **[2026-07-31] Kế hoạch nền tảng đa lĩnh vực — ĐÃ CHỐT, CHƯA THI HÀNH.** Chủ dự án muốn
  `donghanhcungban.com` thành nền tảng đồng hành đa lĩnh vực (học hành trước: Anh → Toán → Lý →
  Hoá; sau đó nuôi dạy con, nghề nghiệp). Toàn bộ quyết định kiến trúc đã chốt và ghi tại
  `docs/adr/0001-nen-tang-da-linh-vuc.md` (ADR, có lịch sử các lần đổi ý trong ngày — đọc kỹ trước
  khi động vào hạn mức/schema) + đặc tả thi hành đầy đủ tại
  `docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md` (8 PR) và bản kế hoạch tổng
  `docs/research/ke-hoach-nen-tang-donghanhcungban-2026-07-31.md`. Tóm tắt các điểm dễ quên:
  - Subdomain mỗi môn (`en-vi.`/`math.`/…), **CHỈ MỘT tiến trình PM2** dùng chung cho tới khi chạm
    ngưỡng nâng cấp (một môn > 50% CPU · cần deploy độc lập · lên VPS nhiều core).
  - Monorepo npm workspaces: `packages/core-*` + `apps/english|hub|math`.
  - Dữ liệu học tách theo **schema riêng từng môn** (`english`, `math`…); `core` chỉ giữ
    users/payments/usage — không phải bảng học nào.
  - Cơ chế ôn tập/SRS **tách riêng từng môn**, không đưa vào lõi (chấp nhận nhân bản có chủ đích).
  - Tiền tố SePay đổi sang `DHCB` dùng chung mọi môn — **webhook phải chấp nhận cả `DHCB` và
    `ENVI` vĩnh viễn**, không được bỏ tiền tố cũ.
  - Hạn mức lượt AI: **mỗi môn đếm/trừ riêng** (không cộng gộp), nhưng **cùng một con số** hạn
    mức/ngày với tiếng Anh — hết lượt Anh không ảnh hưởng lượt Toán trong cùng ngày.
  - Trang chủ hub: mục tiêu chung → hoạt động dự án (số thật) → tab riêng từng môn → giá chung;
    lần đầu chọn một môn thì hỏi onboarding y như app tiếng Anh, lưu riêng theo `(user_id, subject)`.
  - **Việc kế tiếp trước khi mở PR-1:** ~~ghi mốc `npm run test:e2e` đang xanh~~ **ĐÃ XONG
    (2026-07-31).** · ~~bổ sung E2E (hoặc danh sách kiểm tra tay) cho thanh toán + đăng nhập
    Google~~ **ĐÃ XONG (2026-07-31).** · ~~backup DB và xác minh restore chạy được~~ **ĐÃ XONG
    (2026-07-31).** → **CẢ 3 VIỆC CHUẨN BỊ ĐÃ XONG, có thể mở PR-1 (alias đường dẫn).**
  - **[2026-07-31] Vá lỗ hổng test: `api/auth.ts` (417 dòng, xử lý đăng ký/đăng nhập/OAuth
    Google-Facebook-Apple-Microsoft/logout) CHƯA TỪNG có file test.** Đã thêm `api/auth.test.ts`
    (10 test, tập trung đăng nhập Google `action: 'google'`/`'google-token'` — luồng GĐ1 sẽ đụng
    khi tách `packages/core-auth`), mock `authService`/`security`/`emailVerification`/`trial` theo
    đúng pattern `checkout.test.ts`. Phần không tự động hoá an toàn được (chuyển khoản SePay thật,
    popup Google OAuth thật) chuyển thành danh sách kiểm tra tay:
    `docs/kiem-tra-tay-thanh-toan-google-login.md` — chạy trước mỗi lần deploy PR-4/PR-5 của GĐ1.
  - **[2026-07-31] PR-1 (GĐ1, alias đường dẫn) — XONG.** Sửa phạm vi lúc thi hành: alias **chỉ áp
    dụng cho `src/`** — `api/` được `tsc` biên dịch thành JS thật chạy trực tiếp bằng `node`
    (không qua bundler), `tsc` không tự rewrite alias lúc build nên sẽ crash production; khi
    `api/_lib/*` chuyển sang `packages/core-*` (PR-3/4/5) sẽ dùng import package thật qua npm
    workspaces, không cần alias trung gian. Đã thêm `resolve.alias` (`vite.config.ts`) +
    `paths` (`tsconfig.json`): `@core/*`/`@english/*` tạm thời cùng trỏ `src/*`. Quét thấy chỉ
    **10 file** có import sâu ≥2 cấp trong `src/` (nhỏ hơn nhiều so với ước lượng ban đầu do cấu
    trúc `src/` khá phẳng) — làm trực tiếp thay vì giao subagent (không đáng chi phí điều phối).
    Build + `build:server` + typecheck + lint + 947 unit test đều xanh, `git diff` chỉ có dòng
    import.
  - **[2026-07-31] PR-2 (GĐ1, bật npm workspaces + dời `src/` vào `apps/english/src/`) — XONG.**
    Chỉ dời `src/` (224 file, `git mv` giữ lịch sử) — **`api/` KHÔNG dời** ở bước này (đợi
    PR-3/4/5 tách thẳng vào `packages/core-*` qua workspace thật). `package.json` thêm
    `"workspaces": ["packages/*", "apps/*"]`. Sửa đường dẫn: `index.html`, `vite.config.ts`
    (alias trỏ `apps/english/src`), `tsconfig.json`, `vitest.config.ts`, `tailwind.config.js`.
    **Phát hiện ngoài phạm vi đặc tả ban đầu:** 19 file trong `scripts/` (data-gen tooling:
    dictionary/lessons/curriculum/cefr/prompts…) import trực tiếp từ `src/` — đặc tả gốc chỉ
    liệt kê `vite.config.ts`/`tsconfig*`/`vitest.config.ts`/`playwright.config.ts`/`size-limit`/
    `gen-data-manifest.mjs`, thiếu cụm này. Đã sửa cả 19 file, xác nhận bằng typecheck
    (`tsconfig.api.json` bao `scripts/`). **Phát hiện thứ hai:** `.lintstagedrc.json` pattern
    `{src,api}/**/*.{ts,tsx}` khớp 0 file sau khi dời — lint-staged **âm thầm ngừng lint/format**
    phần lớn codebase mỗi lần commit (khớp 0 file không phải lỗi, không ai biết trừ khi để ý kỹ
    log `[SKIPPED]`). Đã sửa thành `{apps/english/src,api}/**/*.{ts,tsx}`, xác minh bằng
    `micromatch` + `npx lint-staged --debug`.
    **Nghiệm thu:** `npm ci` sạch từ đầu · tsc (3 project) + eslint sạch · build + `build:server`
    - 947 unit test xanh · dev server khởi động thật, `/apps/english/src/main.tsx` trả về HTTP 200
      (xác nhận alias hoạt động thật, không chỉ qua typecheck).
    - **[2026-07-31] PR-3 (GĐ1, tách `packages/core-db` + `packages/core-ai`) — XONG.** 21 file
      dời (giữ lịch sử): `core-db` = `pgPool`/`date`/`base64`/`concurrencyLimiter`/`settings`;
      `core-ai` = `tts`/`stt`/`ai` (**route handler thật**, mounted `/api/tts`·`/api/stt`·`/api/agent`
      — tính năng trả phí) + `aiConfig`/`aiCost`/`openaiStt`/`elevenLabsTts`/`azurePronounce`/
      `fileStorage`. Sửa import ở ~50 file `api/`+`api/_lib/`+`scripts/` (độ sâu khác nhau tuỳ vị
      trí file — không phải sed một mẫu chung được, phải soát từng file) + `server.ts` (route
      registration) + `vite.config.ts` (bảng `API_ROUTES` dev middleware). Mở rộng include:
      `tsconfig.server.json`/`tsconfig.api.json` (`packages/`), `vitest.config.ts`,
      `.lintstagedrc.json` (tránh lặp lỗ hổng "khớp 0 file" đã gặp ở PR-2). Cập nhật `CLAUDE.md` §6
      — vài đường dẫn (`api/_lib/pgPool.ts`, `api/_lib/aiConfig.ts`, `src/prompts/*`) đã lạc hậu sau
      PR-2/3, có thể khiến phiên AI sau tìm nhầm chỗ.
      **Nghiệm thu cao hơn PR-1/2** (đụng route trả phí, rút kinh nghiệm bài học alias ở PR-1 —
      không tin typecheck không thôi): tsc (3 project) + eslint sạch · build + `build:server` +
      947 unit test xanh · `node --check dist-server/server.js` + import trực tiếp cả 2 package đã
      biên dịch (xác nhận resolve runtime thật) · dev server thật: `OPTIONS /api/tts`↦204,
      `POST /api/agent` không auth ↦ 401 đúng logic (KHÔNG phải 500 "cannot find module").
  - **[2026-07-31] PR-4 (GĐ1, tách `packages/core-auth`) — XONG. ⚠️ PR nhạy cảm nhất.** 12 file
    dời (giữ lịch sử): `auth.ts` (**route handler thật**, mounted `/api/auth`) + `authService`,
    `adminAuth`, `security` (**34 file phụ thuộc — blast radius lớn nhất từ đầu GĐ1**),
    `emailVerification`, `changeEmail` + 6 file test.
    **Bài học quan trọng cho PR-5 trở đi:** các file đã sửa đường dẫn liên-package ở PR-3 (khi
    còn ở `api/_lib/`, trỏ `core-db` bằng `../../packages/core-db/...`) giờ CHÍNH BẢN THÂN CŨNG
    dời sang `packages/core-auth/` — độ sâu tới `packages/core-db` đổi (từ xuyên qua `api/` thành
    anh em cùng cấp `packages/`). Phát hiện 9 chỗ `../../packages/` sai, phải sửa thành
    `../core-db/`. **Mỗi lần một package tiếp tục dời tiếp, PHẢI rà lại toàn bộ path liên-package
    của nó, không chỉ path trỏ ra `api/`.** Sửa import ở ~33 file `api/*.ts` + 2 `api/_lib/*.ts` +
    3 `packages/core-ai/*.ts` (vì `ai`/`stt`/`tts` đều cần `security.ts`) + hàng loạt `vi.mock()`
    trong test (phải khớp CHÍNH XÁC specifier, không chỉ sửa import thật) + `server.ts` (route
    `/api/auth` + `warnIfClusterWithoutRedis`) + `vite.config.ts` (`API_ROUTES`).
    **Nghiệm thu:** tsc (3 project) + eslint sạch **ngay lần đầu chạy** (nhờ rà kỹ trước, không
    phải sửa-chạy-sửa lặp lại) · build + `build:server` + 947 unit test xanh · `node --check` +
    import trực tiếp cả 6 module core-auth đã biên dịch · dev server thật: `OPTIONS /api/auth`↦204,
    `GET ?action=me` không token↦401, `POST register` thiếu field↦400 Zod, `POST google` idToken
    rác chạy sâu tới `verifyGoogleIdToken` thật (báo thiếu `GOOGLE_CLIENT_ID` trong sandbox — đúng
    hành vi, không phải lỗi module).
  - **[2026-07-31] PR #395 mở trên GitHub cho nhánh này** — xung đột với `main` (4 PR mới merge:
    #391 admin-users panel, #392 gộp trang Luyện tập, #393 fix route admin-users, #394 avatar
    viseme timeline thật) đã xử lý bằng merge commit. 2 conflict rõ (git tự báo): `Practice.tsx`
    (file mới của main, git tự đặt đúng `apps/english/src/pages/` nhờ rename-detection, chỉ cần
    xác nhận) và `packages/core-ai/tts.ts` (gộp import `visemeTimeline` mới của main với đường dẫn
    package đã đổi ở PR-3). **Quan trọng hơn — lỗi ÂM THẦM git không báo conflict:**
    `api/_lib/visemeTimeline.ts`/`.test.ts` (file MỚI của main) import `elevenLabsTts.js` bằng
    đường dẫn cũ (file đó đã dời sang `packages/core-ai/` ở PR-3) — build vẫn "thành công" về mặt
    git merge nhưng sẽ vỡ ở typecheck. **Bài học: sau mỗi merge từ `main` trong lúc làm GĐ1, PHẢI
    tsc toàn bộ 3 project, không chỉ tin git báo hết conflict.** Cũng vá `api/routes-registered.test.ts`
    (test canh gác "mọi handler phải có route" — chỉ quét thư mục `api/`, sau PR-3/4 không còn thấy
    `tts`/`stt`/`ai`/`auth` vì đã dời sang `packages/`) để tiếp tục canh đúng 4 route đó, không chỉ
    merge cho qua. Nghiệm thu: tsc (3 project) + eslint sạch · build + `build:server` xanh ·
    92 file/1029 test xanh (bao gồm 73 test route-gate).
  - **[2026-07-31] CI đỏ trên PR #395 do TỰ MÌNH sai quy trình — đã sửa.** Sau khi phát hiện lỗi
    độ sâu đường dẫn (`'../packages/'` sai → `'../../packages/'` đúng), sửa bằng `sed` NHƯNG
    file đã `git add` từ TRƯỚC lần sửa đó — quên `git add` lại sau khi sửa. Hook `lint-staged`
    lúc commit stash/restore unstaged changes nên `tsc` chạy sau đó vẫn "sạch" (đọc working tree),
    khiến tưởng nhầm đã đúng, nhưng bản **đã commit** (git index lúc đó) vẫn là bản sai — CI bắt
    đúng lỗi này. **Bài học ghi nhớ: sau khi sửa file bằng sed/Edit RỒI `git add` sớm, phải chạy
    lại `git diff --cached` đối chiếu working tree trước khi commit — `tsc` chạy sau luôn đọc
    working tree, KHÔNG phải staged index, nên không đủ để xác nhận commit đúng.** Đã sửa bằng
    `git add` lại + `git diff --cached` xác nhận khớp working tree trước khi commit (thay vì chỉ
    tin `tsc` chạy sau).
  - **[2026-07-31] PR-5 Part A (tách `packages/core-billing`) — XONG.** 18 file di dời
    (`checkout.ts`, `payment-webhook.ts`, `payment-status.ts`, `payment-history.ts`,
    `plan-prices.ts`, `plan-features.ts`, `plan-marketing.ts`, `promo.ts`, `usage.ts`, `plan.ts` +
    test đi kèm). Sửa gap sweep `vi.mock('./promo', ...)` trong `api/_lib/voiceAccess.test.ts` (mock
    kiểu sibling-path bị sweep regex trước đó bỏ sót). 1015 test pass.
  - **[2026-07-31] PR-5 Part B (migration `subject` cho quota + đổi tiền tố SePay) — XONG.**
    Migration `postgres/migrations/0029_platform_subject.sql`: thêm cột `subject` (mặc định
    `'english'`) vào `daily_usage` + `free_daily_credit`, đổi khoá chính sang
    `(user_id, day, subject)`, cập nhật các hàm `consume_usage`/`refund_usage`/
    `consume_usage_total`/`grant_daily_bonus_rolling`/`consume_rolling_credit`/
    `refund_rolling_credit` nhận thêm `p_subject` (default `'english'`), thêm bảng
    `subject_limits`. Theo ADR-0001 mục 8: mỗi môn đếm lượt riêng, hạn mức bằng nhau.
    `packages/core-billing/usage.ts` + `api/progress.ts` truyền `DEFAULT_SUBJECT='english'` vào
    SQL — CHƯA đổi chữ ký hàm export để tránh đụng ~15 file gọi (Toán/GĐ2 sẽ cần luồng subject
    tường minh hơn — nợ kỹ thuật, ghi ở mục "Nợ kỹ thuật còn mở"). `api/_lib/sepay.ts`: đổi
    `PAYMENT_CODE_PREFIX` → `'DHCB'`, thêm `ACCEPTED_PAYMENT_PREFIXES = ['DHCB', 'ENVI']` — giữ
    `'ENVI'` VĨNH VIỄN để giao dịch/nội dung chuyển khoản cũ vẫn khớp. Nợ kỹ thuật CHƯA xử lý (chỉ
    1 môn nên chưa ảnh hưởng hành vi thật): `api/usage-summary.ts`, `api/admin-usage-stats.ts` cần
    lọc theo `subject` khi có môn thứ 2; UI admin bật/tắt `subject_limits.enforced` chưa xây. Xác
    thực: `tsc --noEmit` + `tsc -p tsconfig.api.json` sạch, `npm run build` + `build:server` sạch,
    `node --check` các file compile qua, `vitest run` 92 file/1017 test pass. Commit `6f37f38`.
    **Việc tay còn nợ: chạy `docs/kiem-tra-tay-thanh-toan-google-login.md` mục B (đặc biệt B6/B7 —
    test giao dịch ENVI cũ vẫn khớp + bật thêm bộ lọc DHCB trên dashboard SePay) sau khi deploy
    thật lên VPS. Mục A (Google login) cũng nên chạy vì PR-4 vừa đụng `core-auth`.**
  - **[2026-07-31] PR-5b (chuyển bảng dữ liệu học tiếng Anh sang schema `english`) — XONG.**
    Migration `postgres/migrations/0030_schema_english.sql`: `alter table ... set schema english`
    cho 7 bảng (`chat_sessions`, `writing_submissions`, `speaking_sessions`, `learning_progress`,
    `pronunciations`, `challenge_entries`, `tutor_feedback`) + view compat `public.<bảng>` trỏ
    sang `english.<bảng>` (xoá ở PR sau khi xác nhận hết truy vấn dùng tên không gắn schema).
    `tts_cache`/`daily_usage`/`free_daily_credit` ở lại `public` — hạ tầng dùng chung mọi môn.
    Sửa 8 file gọi SQL (`api/history.ts`, `_lib/quests.ts`, `push.ts`, `progress.ts`,
    `pronunciation.ts`, `challenge.ts`, `leaderboard.ts`, `tutor-feedback.ts` + test) sang gọi
    thẳng `english.<bảng>`. `schema.sql` giữ nguyên (baseline tạo ở `public`, migration set schema
    sau — đúng quy ước mọi migration trước). Commit `9e45145`, merge PR #395.
  - **[2026-07-31] PR-6 (tách `packages/core-ui`) — XONG, phạm vi ĐÃ THU HẸP so với đặc tả gốc,
    lý do phát hiện lúc thi hành.** Chuyển được ngay (thuần, không phụ thuộc gì đặc thù app):
    `theme.ts`, `themeContext.ts`, `useTheme.ts`, `ThemeProvider.tsx`, `authHeader.ts`,
    `ToastProvider.tsx`. **Phát hiện:** `ThemeProvider.tsx` bản gốc tự gọi `useAuth()` +
    `useOnboarding()` để tính `locked` (khoá cứng theme cho nhóm tuổi Nhi đồng) — phụ thuộc
    ngược vào nghiệp vụ app tiếng Anh, không tách nguyên trạng được như đặc tả giả định. Đã viết
    lại `ThemeProvider` (core-ui) nhận `locked`/`settled` qua PROP thuần; tạo
    `apps/english/src/context/AppThemeProvider.tsx` làm lớp bọc tự tính `locked` từ
    auth/onboarding riêng app rồi truyền xuống — giữ nguyên hành vi cũ kể cả ca biên "đang tải
    onboarding thì chưa ép đổi theme" (thêm cờ `settled`). **CHƯA tách** (khác đặc tả gốc,
    quyết định tại chỗ theo nguyên tắc "không trừu tượng hoá sớm"):
    `ThemeToggle.tsx`/`LangProvider`/`useLang` — phụ thuộc thẳng từ điển dịch `i18n.ts` riêng nội
    dung app tiếng Anh, chỉ tách khi Toán thật cần và thiết kế được cách truyền nhãn dịch;
    `types.ts` — giữ nguyên ở app (chứa nhiều type nghiệp vụ: `DictEntry`, `ChatSession`, …),
    riêng `Plan` (3 panel admin dùng) trỏ thẳng sang `packages/core-billing/plan.ts` có sẵn thay
    vì tạo bản sao. Alias `@core/*` (vite.config.ts/tsconfig.json/vitest.config.ts) đổi từ trỏ
    tạm vào `apps/english/src` sang trỏ THẬT vào `packages/core-ui`; `tsconfig.api.json`/
    `tsconfig.server.json` loại trừ `packages/core-ui` (component React/JSX, không chạy Node).
    Xác thực: tsc sạch (frontend+api+e2e), build+build:server sạch (`dist-server` không chứa
    `core-ui`), lint 0 cảnh báo, vitest 92 file/1017 test pass, `npm run dev` khởi động + serve
    200 OK. Commit `d355f98`.
  - **[2026-07-31] PR-7 (scaffold `apps/hub` + server.ts phục vụ đa app theo Host) — XONG,
    phạm vi ĐÃ THU HẸP so với đặc tả gốc.** Hỏi người dùng chọn mức độ (chỉ scaffold / làm trọn
    SSO+onboarding_profiles / dừng hẳn) — không có phản hồi, chọn nhánh rủi ro thấp nhất theo
    quy tắc mặc định an toàn. **Đã làm:** `apps/hub/` — Vite app độc lập (workspace mới, không
    dùng chung `vite.config.ts` gốc), trang 1 màn hình đúng §7.1: mở đầu → hoạt động chung (số
    liệu THẬT qua `/api/hub-stats` mới, không bịa) → tab từng môn (tiếng Anh dùng dữ liệu thật,
    Toán/Lý/Hoá "sắp ra mắt" có nội dung thật, không tab rỗng) → bảng giá chung + nút đăng
    nhập/đăng ký. `api/hub-stats.ts`: endpoint công khai, cache 5 phút trong process, tổng
    `public.users` + tổng `english.chat_sessions/writing_submissions/speaking_sessions` — không
    PII, 3 test. `server.ts`: thay đường dẫn tĩnh cứng `dist/` bằng bảng chọn theo
    `req.hostname` (`EN_VI_HOSTNAME`, mặc định đúng domain production hiện tại nên KHÔNG đổi
    hành vi nếu không đặt biến môi trường mới) — smoke test bằng `node dist-server/server.js`
    thật + `curl -H "Host: ..."` khác nhau, xác nhận đúng 2 app khác nhau được phục vụ.
    **CHƯA làm** (đụng phiên đăng nhập thật đang chạy, để dành PR sau khi có môn thứ hai):
    cookie domain chung `.donghanhcungban.com` (SSO thật giữa hub và subdomain), bảng
    `onboarding_profiles(user_id, subject, ...)` hỏi trình độ riêng theo môn. Nút "Học
    ngay"/"Đăng nhập" ở hub tạm điều hướng thẳng sang `en-vi.donghanhcungban.com`, người dùng
    đăng nhập lại ở đó. Theme hub đơn giản hoá (Tailwind zinc/emerald mặc định), chưa nối vào
    hệ token `--a-*` của app tiếng Anh (ghi nợ kỹ thuật trong `apps/hub/tailwind.config.js`).
    Hạ tầng thật CHƯA làm — `docs/nginx-hub-apex.md` (mới) ghi rõ việc tay cần làm: trỏ DNS
    apex/www, thêm Nginx server block, `certbot --expand`. `package.json`: `build` gộp thêm
    `npm run build --workspace=hub`, `typecheck` gộp thêm `apps/hub/tsconfig.json`.
    `.lintstagedrc.json`: thêm `apps/hub/src` vào glob (bài học từ PR-2 — glob thiếu khiến
    lint/format-on-commit im lặng bỏ qua thư mục mới). Xác thực: tsc sạch (frontend+api+e2e+hub),
    build sạch (`dist/`+`dist-server/`+`apps/hub/dist/`), lint 0 cảnh báo, vitest 93 file/1022
    test pass. Commit `bbab7e5`. **2 lần sửa CI sau khi mở PR #399:** `d688c62` — thiếu
    `npm install` sau khi thêm `apps/hub/package.json` khiến `package-lock.json` không đồng bộ
    (`npm ci` fail EUSAGE) + `prettier --write server.ts` (format:check fail, quên chạy
    `npm run format` trước khi commit, chỉ chạy `lint`); `8dbfde1` — coverage ratchet tụt
    (branches 86.9% < sàn 87%) vì `packages/core-ui/{theme,themeContext,useTheme}.ts` dời từ
    PR-6 chưa có test nào (0% coverage) — sửa bằng THÊM TEST (`theme.test.ts`,
    `useTheme.test.tsx` dùng `renderToStaticMarkup`, đúng nguyên tắc ratchet — không hạ ngưỡng).
    **Đã merge PR #399 (squash `6f9e40d`).**
  - **GĐ1 (tách lõi monorepo) coi như HOÀN TẤT ở mức phạm vi đã thu hẹp qua PR-1..7** (còn nợ kỹ
    thuật đã liệt kê rõ ở từng mục trên: PR-5b view compat chưa xoá, PR-6 theme/LangProvider
    chưa tách, PR-7 SSO/onboarding_profiles/hạ tầng Nginx thật chưa làm). Việc tiếp theo hợp lý:
    chờ môn Toán (GĐ2) THẬT SỰ bắt đầu rồi mới quay lại xử lý các nợ kỹ thuật này theo nhu cầu
    thật, tránh trừu tượng hoá sớm dựa trên phỏng đoán (nguyên tắc đã chốt trong đặc tả GĐ1).
  - **[2026-07-31] Hub ĐÃ LÊN PRODUCTION THẬT.** Người dùng tự làm việc tay trên VPS (DNS, SSL,
    Nginx), Claude hướng dẫn từng bước qua chat + chẩn đoán khi gặp sự cố. Đã xong: DNS A record
    cho `donghanhcungban.com`/`www`/`donghanhcungban.org`/`www.org` → VPS `103.81.87.174`; SSL mở
    rộng (`certbot --expand`) phủ cả 6 domain (`en-vi.com`, apex `.com`, `www.com`, `en-vi.org`,
    apex `.org`, `www.org`) trong CÙNG 1 cert; build `apps/hub` trên VPS
    (`npm run build` đã tự gồm `--workspace=hub` từ PR-7); sửa Nginx để 4 domain
    (`donghanhcungban.com`/`.org` + `www.` cả hai) proxy đúng vào Express (port 3001),
    `en-vi.donghanhcungban.com` giữ nguyên không đổi. **Xác nhận qua 3 lớp:** gọi thẳng Express
    (Host header) → đúng; gọi thẳng IP VPS bỏ qua Cloudflare (`--resolve`) → đúng; qua Cloudflare
    thật → 200 OK, đúng trang hub.
    **Sự cố thật gặp phải + đã xử lý** (chi tiết đầy đủ, bẫy cụ thể ở `docs/nginx-hub-apex.md`
    mục "⚠️ Bẫy thật đã gặp"): (1) thiếu DNS `www.` ban đầu → certbot NXDOMAIN, phải thêm DNS
    trước; (2) **Certbot không tạo vhost riêng cho domain chưa có server block khớp — tự chèn
    thẳng vào `/etc/nginx/sites-available/default`**, tạo ra file có **2 block `location /`
    giống hệt nhau về text** (1 ở `server_name _;` gốc vô hại, 1 ở block Certbot vừa chèn —
    block THẬT SỰ phục vụ HTTPS domain mới); tìm bằng `nano` + `Ctrl+W` search text bị nhảy
    nhầm vào bản sao đầu (sai), khiến domain vẫn ra "Welcome to nginx!" dù `nginx -t` xanh và
    gọi thẳng Express đã đúng — **dễ nhầm tưởng lỗi Cloudflare cache**. Chẩn đoán đúng bằng
    `cat -n` toàn bộ file thay vì tìm text, xác định đúng block theo `server_name` + `listen 443
ssl`, sửa bằng `perl -0777 -pi -e 's/.../.../ '` một dòng duy nhất (tránh lỗi dán nhiều dòng —
    xem bài học paste bên dưới) áp đúng vào block còn lại (lúc này pattern cũ chỉ còn 1 chỗ vì
    block kia đã sửa trước đó). (3) File `donghanhcungban-hub` riêng ban đầu tạo ra bị
    "conflicting server name" vì trùng domain với block Certbot đã chèn — xoá file đó, sửa
    thẳng trong `default` thay vì tạo file mới.
    **Bài học paste qua chat:** terminal của người dùng chèn thêm ký tự `$ ` lạ vào đầu heredoc/
    khối nhiều dòng khi dán (không rõ do client SSH/clipboard nào), khiến `bash` chạy từng dòng
    riêng lẻ thay vì nhận cả khối — chuyển hẳn sang lệnh MỘT DÒNG DUY NHẤT (kể cả sed/perl phức
    tạp) cho mọi thao tác từ xa qua chat, tránh hẳn heredoc/nano-paste nhiều dòng.
    `docs/nginx-hub-apex.md` đã viết lại đầy đủ từ "bản nháp" thành "đã triển khai thật", ghi rõ
    bẫy + cách chẩn đoán 3 lớp (Express trực tiếp / bỏ qua Cloudflare / qua Cloudflare thật) để
    dùng lại khi dựng VPS khác hoặc thêm domain mới.
  - **[2026-07-31] Mốc E2E trước GĐ1 — 111/119 passed trên VPS (~15 phút, sau khi cài
    `npx playwright install chromium` + `install-deps` lần đầu, cả hai đều chưa từng chạy trên VPS
    trước đó).** 8 fail đều timeout `toBeVisible 5000ms` (tab Nghe "Chọn nghĩa" ×6, banner comeback
    ×2) — nhiều khả năng do VPS **1 vCPU** chạy `npm run dev` + Chromium headless cùng lúc, tranh
    nhau 1 core, không phải hồi quy thật (CI GitHub Actions nhiều core hơn nên bình thường xanh cả
    119). **Dùng CI (GitHub Actions) làm mốc đối chiếu chính thức cho GĐ1, không dùng số chạy trên
    VPS** — VPS chỉ để xác nhận suite chạy được, không đại diện cho baseline chuẩn.
  - **[2026-07-31] Backup DB — PHÁT HIỆN VÀ VÁ: chưa từng có backup tự động nào chạy.**
    `sudo -u postgres crontab -l` trống trơn (chỉ có template mặc định) — cả 3 cron job ở
    `docs/setup-postgresql-vps.md` §7 (dump local · đẩy R2 · test restore hàng tuần) **chưa từng
    được thêm vào crontab từ trước tới giờ**, dù tài liệu đánh dấu "BẮT BUỘC". Đã thêm đủ 3 dòng
    cron cho user `postgres` (xác nhận qua `crontab -l`). Backup tay đầu tiên: `pg_dump` **phải
    chạy bằng quyền `postgres`** (chạy bằng `root` báo lỗi `role "root" does not exist` và tạo ra
    file `.sql.gz` gần như rỗng — 20 byte — mà `backup:r2` vẫn coi là "thành công" vì chỉ kiểm tra
    upload xong, không kiểm nội dung; đã xoá bản rỗng, dump lại đúng quyền ra 30.2 MB, xác minh
    bằng `scripts/verify-pg-backup.sh` đọc được dữ liệu thật (`users` 5 dòng, `profiles` 5,
    `app_settings` 1), rồi mới upload R2). **Rủi ro đã tồn tại từ trước, không phải mới phát sinh
    hôm nay** — nên rà lại các dự án tương tự khác (nếu có) đã setup theo cùng runbook.
  - **[2026-07-31] Cảnh giác:** chạy `npm run backup:r2` in ra dòng quảng cáo xoay vòng của gói
    `dotenv` (`// tip: … for agents […]`), một lần trỏ domain lạ `vestauth.com` chưa xác minh, lần
    khác trỏ `dotenvx.com` (domain chính chủ). Gói này tự chèn quảng cáo bên thứ ba vào output —
    không phải lỗi, nhưng nên tắt bằng `DOTENV_CONFIG_QUIET=true` trong `.env` (VIỆC TAY, chưa
    làm) để tránh nhiễu log/nhầm lẫn với mã độc thật về sau.

- **[2026-07-28] Danh sách VIP whitelist + Ma trận tính năng theo gói (Free/Pro/VIP) trong
  `/admin` — ĐÃ XONG, ĐÃ MERGE (PR #357).** 2 tính năng quản trị mới, tự chạy migration qua CI/CD
  (`npm run migrate:pg` trong pipeline deploy, không cần chạy tay):
  - **Danh sách VIP** (tab "Danh sách VIP") — bảng `vip_whitelist` (migration `0023`), admin
    thêm/xoá email. Thêm email → cấp VIP vĩnh viễn ngay nếu user đã có tài khoản, hoặc tự cấp lúc
    người đó đăng ký sau này (`ensureProfileRow`, `api/_lib/authService.ts`). Xoá → hạ về Free
    ngay (chỉ áp dụng cho VIP vĩnh viễn do whitelist cấp, không đụng VIP đã mua qua thanh toán có
    hạn). API: `api/admin-vip-whitelist.ts`.
  - **Ma trận tính năng theo gói** (tab "Tính năng theo gói") — 2 bảng mới `feature_catalog` +
    `plan_feature_flags` (migration `0024`): danh mục tính năng × 3 gói, mỗi ô bật/tắt độc lập,
    admin thêm/xoá tính năng được. Seed mặc định khớp đúng hành vi cũ (không đổi trải nghiệm ai):
    10 tính năng bật cho cả 3 gói (chat/writing/speaking/learning_path/dictionary/lessons/
    phrases/mistake_bank/challenge/quests) + `dialogue_roleplay` chỉ Pro/VIP (khớp gate `isPro`
    cũ ở `CefrLessonViews.tsx`, nay đọc động từ ma trận). API: `api/plan-features.ts` (public,
    ETag, cùng pattern `app-settings.ts`) + `api/admin-plan-features.ts` (admin). Client:
    `src/lib/planFeatures.ts` (đồng bộ cùng nhịp `app-settings`) + `FeatureGate.tsx` bọc quanh
    route — khoá + hiện màn "Nâng cấp gói" nếu admin tắt tính năng đó cho gói của user. Đây là
    khoá phía UI/trải nghiệm (giống voice tiers/role-play cũ) — KHÔNG phải chống gian lận; hạn
    mức lượt AI/ngày vẫn enforce riêng ở `api/_lib/usage.ts`, không đổi.
  - Ẩn link "Cấu hình hệ thống (Admin)" khỏi trang Hồ sơ với user thường — chỉ hiện khi
    `user.isAdmin` (cờ mới, server tính từ `ADMIN_EMAILS`, trả qua `/api/auth?action=me`). Chỉ ẩn
    UI; mọi API admin vẫn tự kiểm quyền phía server như cũ (`isAdminEmail`).
  - CI ban đầu đỏ 3 lần (typecheck 2 lỗi kiểu, format Prettier 2 file, CSS bundle vượt ngân sách
    10kB đúng 31 byte do class `accent-accent-500` mới chưa dùng ở đâu khác) — đã sửa cả 3, CI
    xanh (quality + e2e) trước khi merge.

- **[2026-07-28] FIX: streak/từ đã thuộc hiện 0 trên thiết bị mới dù đã đồng bộ server — ĐÃ
  XONG.** Người dùng báo Dashboard hiện "0 ngày liên tiếp"/"0 từ đã thuộc" dù đã học trên máy
  khác. Điều tra qua đọc code (không đoán): luồng kéo dữ liệu server→localStorage
  (`useCloudSync` → `pullUserData`/`pullProgress`, `src/lib/cloud.ts`/`progressSync.ts`) HOÀN
  TOÀN ĐÚNG — server trả đủ `daily_usage`/`learning_progress`, merge đúng. **Lỗi thật nằm ở
  RENDER**: `useCloudSync(user?.id)` được gọi mà bỏ qua giá trị trả về (`version`, tăng lên
  sau khi kéo dữ liệu xong) ở `Dashboard.tsx` và `Home.tsx` — các `useMemo` đọc localStorage
  (`stats`, `examMap`, `learned`, `doneGrammar`, `examPassed`...) có mảng deps KHÔNG chứa
  `version`, nên dù component re-render sau khi đồng bộ xong, `useMemo` vẫn trả về giá trị đã
  cache TỪ TRƯỚC lúc kéo dữ liệu (0/rỗng trên thiết bị mới) — không bao giờ tính lại cho tới
  khi có lý do khác khiến deps đổi.
  - `src/lib/useCloudSync.ts` — viết lại chú thích, cảnh báo RÕ RÀNG: bắt buộc dùng giá trị
    trả về (`const version = useCloudSync(...)`) và thêm vào deps của MỌI `useMemo` đọc dữ
    liệu qua localStorage, nếu không tái diễn đúng lỗi này ở trang khác sau này.
  - `Dashboard.tsx` — `examMap`, `stats`, và effect nạp lại tiến độ CEFR nay có `syncVersion`
    trong deps.
  - `Home.tsx` — `learned`/`doneGrammar`/`examPassed` (từ đó kéo theo `lockedMap`/
    `continueLevel` đúng dây chuyền) nay có `syncVersion` trong deps.
  - Đã rà toàn bộ 7 trang gọi `useCloudSync` (`Home`/`Dashboard`/`Chat`/`Writing`/`Speaking`/
    `Profile`/`History`) — CHỈ 2 trang trên có `useMemo` bị ảnh hưởng; các trang còn lại đọc
    localStorage trực tiếp trong thân hàm render (không `useMemo`) nên tự làm mới đúng khi
    component re-render sau đồng bộ, không cần sửa.
  - **Chưa test được trên trình duyệt thật** (cần tài khoản + Postgres thật để tái hiện đúng
    kịch bản "thiết bị mới") — đã xác minh chắc chắn qua đọc code (cơ chế `useMemo` deps của
    React), cổng build/type/lint/test đều xanh.

- **[2026-07-27] Dashboard "Sử dụng & chi phí" trong /admin — ĐÃ XONG (nhánh
  `claude/feature-usage-dashboard-378z5q`).** Tab mới (mặc định) ở `/admin` trả lời 3 câu hỏi
  vận hành: tính năng nào đáng giữ · chi phí AI bao nhiêu · doanh thu có bù nổi không.
  - `api/admin-usage-stats.ts` (mới) — 11 truy vấn gộp: người dùng (tổng/mới/DAU/WAU/MAU/quay
    lại/phân bổ gói hiệu lực) · lượt dùng + số người dùng THẬT của từng tính năng · lượt dùng
    chia theo gói · doanh thu `payments` theo trạng thái/gói/chu kỳ/ngày · sức khoẻ kho lượt
    tuần gói Free · top 10 người dùng nhiều nhất. Chỉ admin (`ADMIN_EMAILS`).
  - `api/_lib/aiCost.ts` (mới) — đơn giá ƯỚC TÍNH USD/lượt cho từng chế độ, ghi đè được bằng
    biến môi trường `AI_COST_*_USD` + `USD_VND_RATE` (đổi đơn giá KHÔNG cần deploy). Giá trị
    rác/≤0 → giữ mặc định, KHÔNG rơi về 0 (số 0 trông như "miễn phí" → quyết định sai).
  - **Vá lỗ hổng dữ liệu quan trọng:** gói Free tiêu lượt qua kho tuần (`weekly_ai_credit`) nên
    trước đây KHÔNG hề ghi vào `daily_usage` → thống kê theo tính năng mù phần lớn người dùng.
    `api/_lib/usage.ts` giờ ghi thêm vào `daily_usage` CHỈ ĐỂ THỐNG KÊ (hạn mức int4 max, không
    bao giờ chặn; refund cũng trừ lại). Không đổi hành vi chặn lượt của bất kỳ gói nào.
  - Khác `/api/analytics-summary` (phễu marketing từ `analytics_events`) — file mới đọc dữ liệu
    vận hành thật. Lỗi DB → trả 500, KHÔNG fail-open thành số 0.
  - **Còn mở:** đơn giá hiện là ước tính theo độ dài prompt điển hình. Khi có hoá đơn thật từ
    Anthropic/Groq/Google, chia (tiền tháng ÷ lượt tháng) rồi điền vào `.env` trên VPS. Chi phí
    TTS chưa tính (theo ký tự + có cache dùng chung, không tỉ lệ với số lượt).

- **[2026-07-27, CHỐT LẠI 2026-07-28 — lần 3] Trial Pro 14 ngày (cùng nhánh
  `claude/feature-usage-dashboard-378z5q`).** Thay cho phương án mở khuyến mãi Pro cho TOÀN
  BỘ user hiện có (rủi ro: chi phí AI tăng ~x20 cho cả user cũ vốn không cần khuyến mãi mới ở
  lại). Lịch sử quyết định (đổi 3 lần trong cùng ngày 2026-07-28, chốt bản CUỐI): (1) cấp ngay
  lúc đăng ký → (2) đổi sang chỉ cấp sau khi xác thực email cho MỌI kênh → (3) **CHỐT: tách
  theo kênh** — 4 kênh OAuth (Google/Facebook/Apple/Microsoft) coi như đã xác thực nên cấp
  NGAY ở lần đăng nhập đầu tiên; riêng email/password PHẢI xác thực mã 6 số trước mới được
  cấp (chống lạm dụng email rác tạo hàng loạt để cày trial — OAuth không cày kiểu này được vì
  cần tài khoản Google/Facebook/Apple/Microsoft thật).
  - `postgres/migrations/0019_signup_trial.sql` — cột `profiles.signup_trial_granted_at`.
    `trial_granted_at` (0013, quà xác thực email 5 ngày cũ) giữ nguyên không xoá (dữ liệu lịch
    sử), chỉ ngừng ghi — hàm `grantEmailVerifyTrial()` cũ đã XOÁ khỏi `api/_lib/trial.ts`.
  - `api/_lib/trial.ts` — chỉ còn 1 hàm `grantSignupTrial()` (`SIGNUP_TRIAL_DAYS = 14`), cơ chế
    "giành quyền nhận 1 lần" atomic, dùng lại `grantPlanDays()`.
  - `api/auth.ts` — `register` (email/password) KHÔNG cấp ngay, chỉ gửi mã xác thực;
    `verify-email` gọi `grantSignupTrial()` sau khi xác thực đúng mã (response
    `trialGranted`/`trialDays`, `EmailVerifySection.tsx` hiện lại đúng số ngày 14 — sửa luôn
    dòng copy tĩnh "5 ngày" sót lại từ bản rất cũ). 4 kênh OAuth cấp NGAY khi `isNew` qua hàm
    dùng chung `oauthLoginResponse()`.
  - ~~Còn mở: UI nhắc "còn X ngày dùng thử"~~ **ĐÃ LÀM (2026-07-28)** — xem mục "Banner còn X
    ngày dùng gói Pro/VIP" ngay dưới.

- **[2026-07-28] Banner "còn X ngày dùng gói Pro/VIP" (cùng nhánh trên).** Cùng khuôn mẫu
  `PromoEndingBanner.tsx` đã có (hàm thuần tách riêng để test ca biên ngày tháng, component chỉ
  lo hiển thị) — nhưng đọc HẠN GÓI CỦA TỪNG USER (`profiles.plan_expires_at`) thay vì mốc
  khuyến mãi toàn site. Dùng chung cho CẢ 2 trường hợp (cùng 1 cột DB): trial 14 ngày mới cấp
  lẫn gói trả phí sắp hết hạn — không phân biệt được nguồn gốc (trial hay gia hạn) vì
  `grantPlanDays()` gộp chung, nhưng banner "còn X ngày, gia hạn ngay" đúng cho cả 2 trường hợp.
  - **Vá lỗ hổng dữ liệu:** `plan_expires_at` trước đây được server QUERY nhưng KHÔNG BAO GIỜ
    trả ra ngoài — `api/_lib/authService.ts` (`ProfileInfo`/`ensureProfileRow()`) và
    `api/auth.ts` (`authResponse()` + `GET ?action=me`) nay trả thêm `planExpiresAt` (null nếu
    Free hoặc gói vĩnh viễn — tránh hiểu nhầm "Free sắp hết hạn" từ giá trị cột cũ sót lại).
  - `src/lib/planExpiryBanner.ts` (mới, hàm thuần + test) + `src/components/PlanExpiryBanner.tsx`
    (mới) — cửa sổ cảnh báo 5 ngày, đóng thì ẩn hết ngày hôm đó (giờ VN), hôm sau hiện lại nếu
    vẫn còn hạn. Bấm "Gia hạn ngay" điều hướng tới `/profile` (nơi có `UpgradeSection`).
  - Gắn vào `RequireAuth` trong `App.tsx` (cạnh `PromoEndingBanner`) — hiện ở MỌI trang đã đăng
    nhập + đã onboard (rộng hơn yêu cầu ban đầu "Dashboard/Profile", nhất quán với cách
    `PromoEndingBanner` đã làm).

- **[2026-07-28] Đăng nhập Facebook + Apple + Microsoft (cùng nhánh trên).** Thêm 3 kênh OAuth
  mới cạnh Google đã có, dùng chung hạ tầng `findOrCreateOAuthUser()` (refactor
  `findOrCreateGoogleUser` thành hàm generic theo cột `google_id`/`facebook_id`/`apple_id`/
  `microsoft_id`).
  - `postgres/migrations/0020_facebook_apple_login.sql` — cột `users.facebook_id`/`apple_id`;
    `0022_microsoft_login.sql` — cột `users.microsoft_id` (cùng khuôn mẫu `google_id`).
  - `api/_lib/authService.ts` — `verifyFacebookAccessToken()` (verify qua Graph API
    `debug_token` + `/me`, cần `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET`); `verifyAppleIdToken()`
    và `verifyMicrosoftIdToken()` (verify chữ ký JWT qua JWKS công khai bằng thư viện `jose`
    mới thêm — KHÔNG cần Client Secret/private key vì không dùng luồng đổi authorization code
    phía server). Microsoft dùng authority `common` (chấp nhận cả tài khoản công ty/trường lẫn
    cá nhân outlook.com/hotmail.com) nên issuer chứa tenant id động — verify bằng REGEX thay vì
    so khớp chuỗi cố định như Apple/Google.
  - `src/lib/auth.ts` — `loginWithFacebook()`/`loginWithApple()`/`loginWithMicrosoft()` (tải SDK
    động — Facebook JS SDK, Sign in with Apple JS, MSAL.js — mở popup, gửi token về
    `/api/auth`). `src/pages/Login.tsx` — 3 nút mới cạnh nút Google.
  - `server.ts` — CSP `script-src` thêm `connect.facebook.net`, `appleid.cdn-apple.com`,
    `alcdn.msauth.net`.
  - **Lưu ý Apple:** email/tên CHỈ được gửi ở LẦN ĐẦU người dùng đồng ý chia sẻ — client PHẢI
    gửi kèm ngay lúc đó (đã làm), các lần đăng nhập sau id_token vẫn có email (kể cả địa chỉ
    ẩn danh `@privaterelay.appleid.com`) nhưng không có tên.
  - **VIỆC TAY BẮT BUỘC (ngoài khả năng AI) trước khi 3 nút này hoạt động:** tạo Facebook App
    tại developers.facebook.com (lấy `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET`) + tạo Apple
    Services ID tại developer.apple.com (cần tài khoản Apple Developer Program TRẢ PHÍ, lấy
    `APPLE_CLIENT_ID`) + tạo App registration tại portal.azure.com (lấy `MICROSOFT_CLIENT_ID`,
    chọn loại "any organizational directory and personal Microsoft accounts") — điền vào
    `.env` trên VPS. Xem `.env.example` để biết chi tiết từng bước. Chưa điền thì nút vẫn hiện
    nhưng bấm vào sẽ báo lỗi kết nối (fail rõ ràng, không vỡ trang).
  - **Chưa chạy migration `npm run migrate:pg`** — cần chạy trước khi deploy (gồm cả `0019`-
    `0022` — xem mục nhiệm vụ ngay dưới).

- **[2026-07-28] Nhiệm vụ (quest) cho user — mở đầu bằng "Chia sẻ công khai" (cùng nhánh
  trên).** Nghiên cứu hạ tầng sẵn có (challenge/referral/weekly credit) rồi dựng bảng generic
  `quest_claims` (khoá theo `user_id` + `quest_key` + thời gian hồi) để MỞ THÊM nhiệm vụ mới
  sau này chỉ cần thêm hằng số, không cần migration mới — xem `api/_lib/quests.ts`.
  - `postgres/migrations/0021_quest_claims.sql` — bảng `quest_claims` + hàm SQL atomic
    `claim_quest_if_ready(user_id, quest_key, cooldown_days)`.
  - Nhiệm vụ đầu tiên: **"Chia sẻ công khai"** — bấm "Chia sẻ kết quả" (màn chấm điểm Chat/
    Challenge, `ShareResultCard.tsx`) và Web Share API xác nhận đã chọn nơi chia sẻ (không huỷ)
    → thưởng **+1 ngày gói Pro**, hồi sau **7 ngày** (khớp cửa sổ trượt gói Free) — API
    `POST /api/quests { action: 'claim-share' }`.
  - ⚠️ **CẢNH BÁO ĐÃ CHỦ ĐỘNG NÊU (chưa xin thêm xác nhận, đã triển khai với rate-limit là lớp
    phòng thủ duy nhất):** Web Share API KHÔNG cho server biết người dùng có thật sự đăng công
    khai hay không — chỉ biết họ đã mở hộp thoại chia sẻ hệ điều hành và không bấm huỷ. Về mặt
    lý thuyết một tài khoản có thể tự thưởng cho mình 1 ngày Pro mỗi 7 ngày mà không cần chia
    sẻ thật (mở hộp thoại rồi chọn "Sao chép liên kết" gửi cho chính mình). Đã chấp nhận rủi ro
    này ở QUY MÔ HIỆN TẠI (giá trị thấp — 1 ngày Pro/7 ngày, không đáng để cày công phu). Nếu
    sau này phát hiện lạm dụng thật: cân nhắc thêm `device_hash` như referral (migration 0008)
    hoặc đổi thưởng sang phi tiền tệ (huy hiệu...).
- **[2026-07-28] 3 nhiệm vụ verify server-side ĐÃ LÀM (tiếp Phần 4 ở trên, cùng nhánh).** Cả 3
  đều tính lại TỪ DB, không tin số liệu client gửi lên trực tiếp.
  1. **"Học liên tiếp 5 ngày"** (`streak_5`) — `getCurrentStreak()` đếm streak NGAY TỪ SERVER
     dựa trên `free_daily_credit.bonus_earned` (bảng này được `api/progress.ts` ghi mỗi khi
     phát hiện tiến độ học TĂNG THẬT — learned/hard/cefrGrammar/cefrDialogues dài ra so với
     bản lưu trước — áp dụng cho MỌI gói, không riêng Free). Thưởng +1 ngày Pro, hồi sau 7
     ngày. `POST /api/quests { action: 'claim-streak' }`.
  2. **"Thi đạt cấp CEFR"** (`cefr_exam_<LEVEL>`) — đọc `learning_progress.cefr_exams[level].
passed` (đã có sẵn từ trước, đồng bộ qua `/api/progress` khi thi). Cùng MỨC TIN CẬY với
     luật mở khoá cấp tiếp theo app đã dùng từ trước — không phải lỗ hổng mới do nhiệm vụ này
     tạo ra. Thưởng +1 ngày Pro/cấp, một lần duy nhất mãi mãi mỗi cấp (mô phỏng bằng cooldown
     36.500 ngày, tái dùng đúng 1 cơ chế `claim_quest_if_ready`, không thêm bảng riêng).
     `POST /api/quests { action: 'claim-cefr-exam', level }`. `src/components/CefrExam.tsx`
     tự động gọi ngay sau khi thi đạt (chờ `pushProgressAsync()` đẩy xong lên server TRƯỚC —
     hàm mới thêm vào `progressSync.ts`, bản awaitable của `pushProgress()` fire-and-forget cũ
     — để tránh claim đọc phải dữ liệu cũ chưa kịp đồng bộ).
  3. **"Mời bạn xác thực"** — gộp số liệu vào `GET /api/quests` để hiện chung 1 nơi.
  - **Trang mới `/quests`** (`src/pages/Quests.tsx`) — hub duy nhất liệt kê cả 4 nhiệm vụ
    (gồm cả "Chia sẻ công khai" ở Phần 4), đọc `GET /api/quests` (`getQuestsStatus()`). Link
    vào từ Hồ sơ (`Profile.tsx`, thẻ "Nhiệm vụ" trước mục Nâng cấp Pro).
  - `postgres/migrations` — KHÔNG cần thêm migration mới (tái dùng bảng `quest_claims` của
    Phần 4, đúng mục tiêu thiết kế generic ban đầu).
  - **[Chỉnh 2026-07-28] Thang thưởng chốt theo yêu cầu người dùng:** Chia sẻ công khai = 1
    ngày Pro · Học liên tiếp 5 ngày = 1 ngày Pro (2 mục này giữ nguyên) · **Thi đạt cấp CEFR
    tăng từ 1 → 3 ngày Pro** (`CEFR_EXAM_QUEST_REWARD_DAYS`, `api/_lib/quests.ts`) · **Mời bạn
    xác thực giảm từ 7 → 3 ngày Pro/bên** (`REFERRAL_REWARD_DAYS`, `api/_lib/referral.ts`) —
    UI (`Quests.tsx`, `ReferralSection.tsx`) đọc số ngày động từ API, không cần sửa thêm.

- **[Kế hoạch 2026-07-22] Giao diện + nội dung theo độ tuổi** — nhánh
  `claude/ui-redesign-age-groups-rk71g8`. Ý tưởng: app đổi giao diện thị giác và giọng điệu nội
  dung theo nhóm tuổi người dùng, đặc biệt nhóm Nhi đồng cần giao diện vui nhộn hơn hẳn. Đã
  nghiên cứu code thật (`src/lib/theme.ts`, `postgres/schema.sql`, `src/pages/Onboarding.tsx`,
  `src/pages/Profile.tsx`, `api/auth.ts`, `api/profile.ts`, `src/prompts/index.ts`) và **chốt
  cùng người dùng** các quyết định sau:
  - **4 nhóm tuổi:** Nhi đồng (<10) · Thiếu niên (10–15) · Thanh niên (16–22) · Người lớn (23+).
  - **Cả giao diện lẫn nội dung** đổi theo tuổi (không chỉ 1 trong 2).
  - **Lấy nhóm tuổi bằng cách hỏi lúc đăng ký/hồ sơ** — cột `age_group` trong `profiles`, KHÔNG
    hỏi ngày sinh thật, chỉ cho chọn thẳng nhóm (tránh thu thập dữ liệu nhạy cảm trẻ em).
  - **Nhóm Nhi đồng sẽ bị khoá cứng vào theme vui nhộn riêng** (GĐ 2, chưa làm) — không cho tự
    đổi sang 4 theme người lớn hiện có.
  - **4 giai đoạn nhỏ, mỗi giai đoạn 1 PR, dừng xin duyệt ở mỗi cổng.**

  **GĐ 1 (nền tảng thu thập nhóm tuổi) — CODE XONG, cổng commit đã đạt (build/typecheck/lint/
  format/test 613/613/size xanh — người dùng cần chạy migration thật để dùng được):**
  - `postgres/migrations/0002_age_group.sql` (mới) — cột `profiles.age_group` (text, check 4
    giá trị, cho phép NULL — user cũ chưa chọn tự fallback `'nguoi_lon'` ở code, KHÔNG ép migrate
    ngược). Rollback: `alter table profiles drop column if exists age_group`.
  - `api/profile.ts` — `GET` trả thêm `ageGroup` (NULL → `'nguoi_lon'`); `POST` mở rộng 2 action:
    `onboarding` (nhận thêm `ageGroup` optional, giữ nguyên giá trị cũ nếu không gửi — dùng
    `coalesce`) và action MỚI **`set-age-group`** (chỉ đổi đúng 1 cột — quyết định người dùng:
    tách riêng khỏi action `onboarding` thay vì tái dùng, giống pattern `setDailySpeed`/
    `setWeeklyGoal` chỉ đổi 1 giá trị). **Xác nhận sửa lại so với đề xuất ban đầu:** KHÔNG đụng
    `api/auth.ts` action `register` — level/goal/dailyMinutes vốn không lưu lúc đăng ký mà lưu
    sau đó qua `POST /api/profile` (từ bước cuối Onboarding), nhóm tuổi theo đúng luồng này.
  - `src/types.ts` — thêm `export type AgeGroup`.
  - `src/lib/onboarding.ts` — mở rộng `OnboardingData`/cache/`fetchOnboarding` theo đúng pattern
    2 tầng (cache localStorage → server) đã có; thêm `pushAgeGroup()` (bắn-rồi-quên, dùng cho
    Profile.tsx) + `isValidAgeGroup()`.
  - `src/pages/Onboarding.tsx` — **thêm bước chọn nhóm tuổi làm BƯỚC ĐẦU TIÊN** (quyết định người
    dùng: trước bước Trình độ, vì nhóm tuổi có thể ảnh hưởng giọng điệu các bước sau) — luồng
    onboarding từ 3 → 4 bước, progress bar + số thứ tự các bước sau đã dịch lại đúng.
  - `src/pages/Placement.tsx` — hàm `applyResultNow` (đổi trình độ từ trang Hồ sơ) giữ nguyên
    `ageGroup` đã có khi ghi đè lại profile (không vô tình xoá về mặc định).
  - `src/pages/Profile.tsx` — section mới "Nhóm tuổi" (pattern giống section tốc độ học/mục
    tiêu tuần đã có), gọi action `set-age-group` riêng qua `pushAgeGroup()`.
  - `src/lib/onboarding.test.ts` — cập nhật 3 test cũ theo field mới + 3 test mới (ageGroup lạ
    → fallback, server trả ageGroup hợp lệ → giữ đúng giá trị).
  - **Việc người dùng cần làm:** `npm run migrate:pg` trên VPS (hoặc máy dev) để tạo cột
    `age_group` trước khi deploy — thiếu cột này thì `api/profile.ts` sẽ lỗi SQL ngay.
    **GĐ 2 (theme "Nhi đồng" vui nhộn) — CODE XONG, cổng commit đã đạt (build/typecheck/lint/
    format/test 613/613/size xanh):**
  - `src/lib/theme.ts` — thêm `Theme = 'kid'` + hằng `KID_THEME` **tách riêng khỏi mảng
    `THEMES`** (không lọt vào vòng lặp cycle của `ThemeToggle` — theme này bị khoá, không phải
    lựa chọn tự do).
  - `src/index.css` — bảng màu `[data-theme='kid']` (nền kem ấm `#FFFBEB`-ish + nhấn cam chuẩn
    Tailwind orange-50..900). **Đã kiểm tương phản WCAG AA bằng tính toán thực tế** (script Node
    dùng đúng công thức luminance/contrast ratio W3C, không đoán): text chính (`--c-white`)
    ~16:1, text phụ (`--z-400`) ~6:1 trên nền thẻ/trang, nút `accent-500` nền cam + chữ đen
    ~7.5:1, `accent-800` (dùng cho `theme-light:text-accent-800`) ~6.7-7:1 — đều vượt xa ngưỡng
    AA 4.5:1 cho chữ thường.
  - `tailwind.config.js` — thêm `[data-theme="kid"] &` vào biến thể `theme-light:` (trước chỉ
    Blue sky/Pink) — **bắt buộc**, nếu không mọi chỗ đã sửa AA cho 2 theme sáng cũ sẽ KHÔNG áp
    dụng cho theme mới (mù màu cố định amber/rose/sky/teal... trên nền sáng).
  - `src/context/ThemeProvider.tsx` — đọc `age_group` qua `useOnboarding()` (đã có từ GĐ 1), tự
    áp theme `kid` khi `ageGroup==='nhi_dong'` và chặn `setTheme()` (khoá cứng). **Chủ ý dùng
    `applyTheme()` (chỉ đổi DOM hiển thị) thay vì `setTheme()`/`persistTheme()` khi khoá** —
    KHÔNG ghi đè `localStorage(ui_theme)` để giữ nguyên lựa chọn theme thật của user; đổi nhóm
    tuổi sau này (ra khỏi Nhi đồng) tự quay lại đúng theme đã chọn trước, không bị mất. Trong
    lúc `useOnboarding` đang tải (chưa biết chắc `ageGroup`) KHÔNG ép đổi theme — tránh giật
    theme mỗi lần load trang trước khi dữ liệu về.
  - `src/components/ThemeToggle.tsx` — ẩn hẳn nút đổi giao diện khi `locked` (không hiện dạng
    disabled, đơn giản hơn vì không có gì để đổi).
  - `.size-limit.json` — CSS budget 9.5→9.7kB (đo thật: thêm theme thứ 5 tốn +0.08kB brotli,
    ngân sách cũ chỉ còn dư 0.07kB nên chắc chắn vượt dù tối ưu).
  - `e2e/a11y.spec.ts` + `e2e/helpers/auth.ts` — thêm 2 test a11y riêng cho theme `kid` (Home +
    Profile, seed thẳng `localStorage.ui_theme='kid'` qua `mockLogin()` vì E2E không mock được
    `/api/profile` để giả lập `age_group` thật — theme vẫn render y hệt, chỉ khác cách được áp).
    **Phát hiện qua chạy E2E thật nhiều lần (không chỉ soát code), tìm đúng gốc rễ sau khi loại
    trừ các nghi ngờ sai:** ban đầu nghi "flaky do timing" (banner tĩnh "Xin chào" hiện gần như
    ngay lập tức nên `expect().toBeVisible()`/`waitForTimeout` ngắn không đủ chờ thẻ "Học tiếp"
    tính từ curriculum OFFLINE phía client render xong) — đã thử tăng chờ lên 1000ms/2000ms, dời
    vị trí test ra sau (tránh lúc dev server "nguội"), thêm tự-retry trong test: **vẫn fail y hệt
    1 lần trong mỗi lần chạy đủ 97 test**, chứng tỏ KHÔNG PHẢI flaky. Thêm log debug in chi tiết
    node/màu vi phạm khi fail → lộ đúng gốc rễ: `theme-light:text-accent-700` (badge "4 cách
    học"/"Nói" ở Home, dùng chung code cho cả Blue sky/Pink/kid) chỉ đạt **4.17:1** trên nền
    `bg-accent-500/15` của theme kid — THIẾU đúng 0.33 so với ngưỡng AA 4.5:1, một lỗi CONTRAST
    THẬT (không phải trạng thái thoáng qua) mà bước tính tay ban đầu bỏ sót vì không kiểm hết
    MỌI tổ hợp text/nền dùng `theme-light:`. Sửa bằng cách đổi `--a-700` (kid) sang giá trị
    orange-800 (154 52 18) → đạt ~5.9:1. Xác nhận: **97/97 test a11y xanh** sau khi sửa (trước
    đó luôn có đúng 1 fail, dù thử đủ cách chờ/retry). Bài học: KHÔNG vội kết luận "flaky do
    timing" khi 1 test fail lặp lại nhiều lần với cùng 1 nội dung lỗi giống hệt nhau — phải in
    chi tiết vi phạm ra để xác nhận trước khi chọn hướng sửa.
  - **Đã KHÔNG làm ở GĐ 2 này** (đúng phạm vi đã chốt, tránh phình việc): không thêm component
    đặc thù (nút to tròn, hiệu ứng confetti) hay theme riêng cho 3 nhóm tuổi còn lại — chỉ
    Nhi đồng có theme riêng, phần UI component lớn hơn để ngỏ nếu người dùng muốn làm thêm sau.
    **GĐ 3 (giọng điệu AI theo tuổi) — CODE XONG, cổng commit đã đạt (build/typecheck/lint/
    format/test 618/618/size xanh):**
  - `src/prompts/index.ts` — hàm mới `ageGroupToneBlock(ageGroup, dir)`: **CHỈ đổi giọng
    điệu/ví dụ minh hoạ, KHÔNG lọc lại kho từ vựng/chủ đề** (chủ đề hội thoại vẫn theo
    `situation` học viên tự chọn, đúng phạm vi đã chốt). Trả về khối hướng dẫn riêng cho
    `nhi_dong` (câu ngắn, nhiều emoji, ví dụ trường học/gia đình/thú cưng/trò chơi, tránh ví dụ
    người lớn) và `thieu_nien` (giọng trẻ trung ngang hàng, ví dụ bạn bè/học tập/sở thích/mạng
    xã hội) — mỗi nhóm 1 đoạn riêng bằng cả tiếng Việt (chiều A) lẫn tiếng Anh (chiều B).
    **`thanh_nien`/`nguoi_lon`/`undefined` (fallback mặc định của user cũ chưa từng chọn nhóm
    tuổi) trả về CHUỖI RỖNG — giữ NGUYÊN 100% hành vi prompt hiện có**, không đổi baseline eval
    cho phần lớn người dùng hiện tại (có test xác nhận `prompt(undefined) === prompt('nguoi_lon')
=== prompt('thanh_nien')`).
  - Thêm tham số `ageGroup?: AgeGroup` (optional, cuối danh sách tham số — không phá chữ ký cũ)
    vào `chatSystemPrompt`, `speakingSystemPrompt`, `writingSystemPrompt`; chèn `${tone}` ngay
    sau đoạn tình huống/giọng điệu sẵn có ở cả 2 chiều A/B của mỗi hàm.
  - `src/pages/Chat.tsx`/`Speaking.tsx` — tái dùng `onboarding` (hook `useOnboarding(user.id)`
    đã có sẵn từ trước, dùng để lấy trình độ mặc định) truyền thêm `onboarding?.ageGroup` vào cả
    2 điểm gọi (bắt đầu phiên + gửi tin nhắn) mỗi trang.
  - `src/pages/Writing.tsx` — **thêm mới** `useOnboarding(user.id)` (trang này trước đó chưa
    dùng hook này) để lấy `ageGroup`, truyền vào `writingSystemPrompt`.
  - `src/prompts/index.test.ts` (mới) — 5 test: mặc định không đổi (undefined/nguoi_lon/
    thanh_nien cho ra prompt GIỐNG HỆT nhau), nhi_dong/thieu_nien thêm đúng khối riêng (không
    lẫn nội dung 2 khối), cả speaking lẫn writing đều nhận đúng tham số.
  - **⚠️ CẦN NGƯỜI CÓ KEY AI CHẠY (sandbox không có key):** theo CLAUDE.md §8, mọi PR sửa
    `src/prompts/*` PHẢI chạy lại `npm run eval:tutor` và dán bảng so sánh với
    `docs/research/eval-tutor-baseline.md` vào mô tả PR trước khi merge. Vì `thanh_nien`/
    `nguoi_lon`/`undefined` cho prompt Y HỆT trước đây (đã có test xác nhận), **baseline không
    nên đổi cho các nhóm này** — nhưng vẫn cần chạy để xác nhận đúng theo quy trình đã định,
    và để có số liệu cho 2 nhóm mới (nhi_dong/thieu_nien) nếu muốn đánh giá riêng.
    **GĐ 4 (ẩn vòng không phù hợp trẻ em khỏi luồng học) — CODE XONG, cổng commit đã đạt
    (build/typecheck/lint/format/test 628/628/size/E2E a11y 97/97 xanh):**
  - **Phát hiện qua nghiên cứu (trước khi code, đã báo lại người dùng và xác nhận vẫn làm):**
    `lib/curriculum.ts` cache TOÀN CỤC (`_circlesCache`/`_pathCache`, không tham số) dùng
    CHUNG cho mọi người dùng — để lọc theo nhóm tuổi phải đổi cache sang **Map theo nhóm
    tuổi** (chỉ 2 khoá thực tế: `'nhi_dong'` và `'default'` — mọi nhóm khác hành xử y hệt
    trước đây) và nối tham số `ageGroup` xuyên suốt **6 file tiêu thụ**: `CefrExam.tsx`,
    `StudyPanel.tsx`, `CefrLevelPage.tsx`, `Placement.tsx`, `Dashboard.tsx`, `preloader.ts`
    (+ `Learn.tsx`/`Dictionary.tsx` truyền prop xuống `StudyPanel`). `StudyTabs.tsx` **KHÔNG
    cần sửa** — chỉ tiêu thụ `pool: DictEntry[]` đã được lọc sẵn từ trang cha, và
    `findCircleOfWord`/`getCircleProgress` tra cứu metadata của 1 từ ĐÃ CÓ trong pool nên
    dùng danh sách đầy đủ (mặc định) để tra là an toàn, không ảnh hưởng nội dung hiển thị.
  - `src/data/curriculum.ts` — thêm `Circle.notForKids?: boolean`; gắn `true` cho **12 vòng**
    chủ đề không phù hợp trẻ em (rà tay theo tiêu đề, không đoán): `business`, `workplace`,
    `money-finance`, `business-extended` (kinh doanh/công sở/tài chính) · `medical-advanced`,
    `mental-health` (y tế nâng cao/sức khỏe tinh thần) · `social-issues`, `law-justice`,
    `politics-government`, `economy-global` (vấn đề xã hội/luật pháp/chính trị/kinh tế) ·
    `abstract-concepts` (khái niệm trừu tượng) · `relationships-b1` (có từ "breakup" — chủ đề
    tình cảm). **KHÔNG gắn cờ** cho các vòng auto-sinh C1/C2 (`cefrC1C2Vocab.ts`) — không ai
    ở tốc độ học của trẻ em chạm mức C1/C2 trong thời gian ngắn, và các vòng đó không có tên
    chủ đề thủ công để phân loại đáng tin cậy.
  - `src/lib/curriculum.ts` — `getCircles(ageGroup?)`/`getLearningPath(ageGroup?)` lọc bỏ
    vòng `notForKids` khi `ageGroup==='nhi_dong'`; nối `ageGroup?` (optional, mặc định
    undefined = y hệt hành vi cũ) qua `getLevelWords`/`getBeyondCefrWords`/`getTodayBatch`/
    `getPathProgress`/`collectPathWords`. Từ của vòng bị ẩn **CHỦ Ý** không lọt sang phần
    "Mở rộng" (dùng `FOUNDATION` đầy đủ — không phải bản đã lọc — để tính tập từ cần loại
    khỏi "Mở rộng", đúng ý định "ẩn hẳn" chứ không phải "chuyển chỗ").
  - **⚠️ Phát hiện quan trọng khi test:** `FOUNDATION` trong `src/data/curriculum.ts` (TypeScript
    nguồn) KHÔNG được dùng trực tiếp lúc chạy — `lib/curriculumLoader.ts` nạp từ file JSON
    tĩnh đã sinh sẵn `public/data/curriculum.json` (qua `scripts/gen-curriculum-json.ts`, vì
    lý do hiệu năng — Vite tách thành chunk riêng, không cần bundle 9000+ dòng TS). Sửa
    `notForKids` trong file nguồn KHÔNG tự động phản ánh ra JSON — phải chạy lại
    `npx tsx scripts/gen-curriculum-json.ts` (an toàn chạy lại, ghi đè) để đồng bộ. **Việc
    người dùng cần làm khi deploy:** đảm bảo bước build/deploy có chạy lại script này (kiểm
    tra `scripts/deploy.sh`/`package.json` xem đã tự động hay chưa — nếu chưa, chạy tay 1 lần
    trước khi deploy nhánh này; nếu quên, `notForKids` sẽ không có tác dụng trên production
    dù code đã đúng).
  - `src/lib/curriculum.test.ts` — 11 test mới: xác nhận có ≥1 vòng gắn `notForKids` trong dữ
    liệu thật (không phải test rỗng), mặc định/`thanh_nien`/`nguoi_lon` không lọc gì,
    `nhi_dong` ẩn đúng và đủ 12 vòng, từ vòng ẩn không lọt qua cả lộ trình lẫn phần "Mở rộng",
    `getPathProgress`/`getTodayBatch`/`getLevelWords` phản ánh đúng số liệu đã lọc (dùng
    'workplace' — vòng thật nằm trong lộ trình CEFR chính thức qua `cefr.ts` — để xác nhận
    cấp chứa nó có ít từ hơn cho nhi_dong), cache theo nhóm tuổi vẫn giữ đúng tham chiếu.
  - Đã chạy lại `npx tsx scripts/gen-curriculum-json.ts` để đồng bộ JSON — diff chỉ thêm đúng
    12 field `"notForKids":true` (216 byte), không đổi/mất dữ liệu khác (đã xác nhận qua
    `git diff --stat`, kích thước gzip build không đổi vì file này tải lazy, không nằm trong
    bundle chính).

- **Rời Supabase (2026-07-19→20, xem `docs/migration-thoat-ly-supabase.md`)**: GĐ A (Postgres 16
  tự host trên VPS) + GĐ B (auth tự viết Bearer token thay Supabase Auth) + GĐ C lõi
  (profiles/daily_usage/learning_progress qua `/api/profile`/`/api/progress`) + GĐ D (Cloudflare
  R2 thay storage) **ĐÃ CUTOVER + XÁC NHẬN trên production**. **GĐ C phần còn lại ĐÃ CODE XONG
  (2026-07-19, 2 nhánh):** (1) PR #274 — `tts_cache`/`pronunciations`/`push_subscriptions` sang
  `pgPool`; (2) nhánh `claude/dong-bo-tiep-tuc-rr5ghs` (đã merge nhánh #274 vào cho đồng bộ) —
  route mới `/api/history` (lịch sử chat/viết/nói + learn_count, thay `cloud.ts` query Supabase),
  `/api/challenge` (thay `challengeCloud.ts`), `/api/tutor-feedback` (thay `tutorFeedback.ts`),
  `api/leaderboard.ts` sang `pgPool`, XÓA `src/lib/supabase.ts` (client hết sạch Supabase),
  thêm 6 route mới vào dev proxy `vite.config.ts`. **GĐ E (dọn dẹp) ĐÃ XONG (2026-07-20,
  cùng phiên):** gỡ `@supabase/supabase-js` khỏi `package.json`, xóa `api/_lib/supabaseAdmin.ts`
  - nhánh driver `supabase` trong `fileStorage.ts` (mặc định còn `local`/`r2`), xóa biến
    `SUPABASE_*`/`VITE_SUPABASE_*` khỏi `.env.example`/`vite-env.d.ts`/`vitest.setup.ts`/
    `playwright.config.ts`, xóa thư mục `supabase/` (schema cũ còn trong git history) — sửa
    3 script seed còn gọi Supabase trực tiếp sang `pgPool`+`saveAudio()`
    (`scripts/seed-pronunciations.ts`, `scripts/prefetch-tts-patterns.ts`, `scripts/seed-all.ts`),
    xóa 2 công cụ di trú 1 lần đã hết tác dụng sau GĐ D
    (`scripts/check-supabase-audio.ts`, `scripts/sync-storage-to-vps.ts`) + script migration
    Supabase cũ (`scripts/run-migrations.ts`, đã có `run-pg-migrations.ts` thay thế). **Phát
    hiện + vá 1 lỗi nghiêm trọng lúc dọn dẹp:** `deploy.sh`, `scripts/deploy.sh` (2 script deploy
    khác nhau, xem ghi chú dưới) và `.github/workflows/deploy.yml` đều gọi `npm run migrate`
    (script Supabase cũ vừa xóa) — nếu không sửa thì **deploy tiếp theo sẽ crash ngay bước
    migration** (`set -e`). Đã đổi cả 3 chỗ sang `npm run migrate:pg`. Cập nhật
    `CLAUDE.md` mục 4+6, `docs/deploy-vps-ubuntu.md` (viết lại Bước 0 + khối `.env` mẫu +
    troubleshooting), `docs/DEPLOY.md`, `docs/seed-guide.md`, `DEPLOY_QUICK_GUIDE.md`,
    `DEPLOY_STEPS.md`, `BILINGUAL_SYSTEM.md`. Xóa 4 doc gốc đã hoàn toàn lỗi thời
    (`SUPABASE_SYNC_SETUP.md`, `AUTH_SETUP.md`, `PRONUNCIATION_CACHE_SETUP.md`,
    `TTS_CACHE_SETUP.md`, `PRONUNCIATION_CACHE_SPEC.md` — 2 file cuối tự ghi "có thể xóa" sẵn
    trong nội dung). Build/typecheck/lint/format/size/test xanh trước khi commit (xem PR).
    **Bổ sung cùng PR (2026-07-20, theo yêu cầu "copy hết dữ liệu TTS từ VPS, cache qua R2"):**
    `scripts/sync-storage-to-r2.ts` (`npm run sync:r2`) — đẩy audio ĐÃ CACHE TRƯỚC KHI bật R2
    lên Cloudflare R2 qua `saveAudio()` rồi cập nhật `audio_url`; an toàn chạy lại, có
    `--dry-run`/`--force`/`BUCKET`/`LIMIT`. **Bản đầu SAI — đã sửa (2026-07-20, người dùng chạy
    thử trên VPS thật báo "0 dòng" ở cả 2 bucket):** bản đầu đọc danh sách file cần đồng bộ TỪ
    DB (`select ... from tts_cache`), nhưng quyết định 2026-07-19 "bỏ qua migrate dữ liệu người
    dùng cũ" khiến Postgres tự host khởi động RỖNG — DB không có dòng nào dù `uploads/` trên VPS
    vẫn còn hàng nghìn file audio cache từ trước cutover, nên script cũ luôn thấy "0 dòng" và
    không đẩy được gì (bug thật, không phải môi trường thiếu dữ liệu). **Đã viết lại:** quét
    THẲNG ổ đĩa (`uploads/tts-cache/**/*.mp3`, `uploads/pronunciations/*.mp3`), suy
    hash/lang/voice (tts-cache) hoặc word/voice (pronunciations) từ TÊN FILE, upload lên R2 rồi
    `INSERT ... ON CONFLICT` tái tạo dòng DB — không cần dòng DB có sẵn. An toàn 100% cho
    tts-cache (VOICE_VERSION nằm trong hash, hash cũ tự động không khớp nếu giọng đã đổi); với
    pronunciations phải GIẢ ĐỊNH `voice_version = VOICE_VERSION hiện tại` (không suy được từ tên
    file, ghi rõ trong code — rủi ro thấp vì hằng số này chưa từng đổi). **Bug thứ 2 phát hiện
    khi chạy thật trên VPS (2026-07-20, sau khi merge bản quét ổ đĩa):** bucket `tts-cache` có
    quá nhiều file (bằng chứng thật — VPS báo lỗi) khiến `walkMp3()` crash
    `RangeError: Maximum call stack size exceeded` — nguyên nhân: `out.push(...(await
walkMp3(...)))` dùng spread để gộp mảng con vào `out`, mà spread truyền MỖI phần tử thành 1
    đối số riêng cho `.push()` → tràn giới hạn số đối số của V8 khi thư mục có hàng chục nghìn
    file. Sửa: đổi `walkMp3` sang nhận `out` làm tham số TRUYỀN QUA THAM CHIẾU (gom bằng
    `out.push(rel)` từng phần tử, không spread mảng con) — đã tự kiểm bằng cách tạo 150.000 file
    giả trong sandbox và chạy hàm mới, xác nhận không lỗi (bản cũ chắc chắn crash ở quy mô này).
    **VẪN CHƯA CHẠY THẬT TRÊN VPS SAU BẢN VÁ NÀY** (chỉ soát code + tự kiểm hàm quét file,
    build/typecheck/lint/test xanh) — việc người dùng cần làm: SSH vào VPS, `git pull`,
    `STORAGE_DRIVER=r2 npm run sync:r2 -- --dry-run` xem trước → bỏ `--dry-run` chạy thật — xem
    `docs/migration-thoat-ly-supabase.md` mục 10 bước 7.

- **Nâng cấp 5 hạng mục sư phạm còn thua app lớn** — ĐẶC TẢ ĐÃ VIẾT + người dùng ĐÃ CHỐT cả 4
  quyết định (2026-07-15: theo thứ tự ưu tiên · LÀM Azure · LÀM giải đấu tuần M5 · THAY Challenge
  bằng giải đấu tuần M5b) → theo bảng ưu tiên 17 PR mà làm:
  `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md` (① chấm phát âm 2 giai đoạn · ② động
  lực duy trì (kể cả giải đấu tuần) · ③ nghe đa dạng · ④ placement test · ⑤ eval độ tin cậy AI).
  Tài liệu này KẾ THỪA các đề xuất D/H và V-4/V-5 bên dưới — khi làm theo nó thì đánh dấu mục
  trùng ở dưới. **Đã xong:** PR #1 (`lib/placement.ts` thuật toán bậc thang), PR #2 (trang
  `/placement` + nối onboarding) — PR #239, đã merge 2026-07-15. PR #3 (tốc độ phát TTS, ③ N1)
  — `RateToggle` toàn cục + `getRatePref`/`setRatePref` (`lib/tts.ts`) + `preservesPitch` +
  nối vào CefrLessonViews/Lessons/KaraokeText/Speaking/CommonPhrases/Dictionary — PR #240, đã
  merge 2026-07-15. PR #4 (xoay giọng nghe, ③ N2) — random giọng câu Nghe bài thi/placement
  (`ExamQuestion.audioVoice`) + `WordVoiceCycleButton` ở flashcard (xoay 4 giọng); hội thoại
  CEFR đã tự khác giọng theo vai A/B từ trước, không cần sửa — PR #241, đã merge 2026-07-15.
  PR #5 (golden set + eval baseline, ⑤ T1) — `scripts/eval-tutor-fixtures.json` (~60 câu),
  `scripts/eval-tutor.ts` (`npm run eval:tutor`, gọi đúng prompt+model+guardrail production qua
  `api/_lib/aiConfig.ts` mới tách), logic chấm thuần `scripts/lib/evalScoring.ts` + test (vào CI),
  luật eval khi đổi prompt/model ghi ở CLAUDE.md §8 — ĐÃ MERGE (PR #242, 2026-07-15). ⚠️ Số baseline
  (`docs/research/eval-tutor-baseline.md`) CẦN NGƯỜI CÓ KEY chạy `npm run eval:tutor -- --write-baseline`
  (sandbox Claude không có key AI). PR #6 (trap phát âm Việt + coach tip, ① G1) — đã merge
  (PR #244, 2026-07-15). PR #7 (mục tiêu tuần, ② M1) — `lib/weeklyGoal.ts` (3/5/7 ngày/tuần,
  tuần từ Thứ 2 giờ VN, cùng luật "ngày có học" với streak) + chọn ở `/profile` + vòng tiến độ
  `GoalRing` ở Dashboard + màn ăn mừng 1 lần/tuần (`WeeklyGoalCelebration`, nối sau màn streak
  trong StudyTabs) + đồng bộ cột `weekly_goal` (migration `0012`, hợp nhất updatedAt mới hơn
  thắng) — ĐÃ MERGE (PR #246, 2026-07-15), CÙNG PR đó: Challenge chuyển CHU KỲ TUẦN (xem quyết
  định mới bên dưới). PR #8 (huy hiệu, ② M2) — `src/data/achievements.ts` (~19 huy hiệu tĩnh,
  5 nhóm: streak 7/30/100/365 · từ vựng 100/500/1000 · qua cấp CEFR A1-C2 (6) · kỹ năng 10 phiên
  nói/10 bài viết đã chấm · challenge 10/30/100 bài + tuần trọn vẹn 7/7) + `src/lib/achievements.ts`
  (`checkNewAchievements` — CHỈ so dữ liệu ĐÃ CÓ SẴN, không thêm tracking mới; "chỉ cộng thêm",
  không thu hồi) — gọi ở 5 điểm chạm (học từ mới StudyTabs, nộp challenge, chấm bài viết, luyện
  nói, thi cuối cấp) + toast khi vừa đạt + lưới huy hiệu ở `/profile` (backfill huy hiệu cũ khi
  mở trang). ⚠️ KHÔNG làm "điểm phát âm ≥90 lần đầu" như đặc tả gốc — `pronounceScore.ts` chưa
  lưu lịch sử điểm, thêm tracking mới sẽ vượt phạm vi 1 PR nhỏ; thay bằng nhóm kỹ năng/challenge
  hiện có. Đồng bộ cột `achievements` (migration `0013`, hợp union) — ĐÃ MERGE (PR #247,
  2026-07-16). PR #9 (bài luyện nghe dictation, ③ N3) — tab thứ 6 "Nghe" ở trang cấp CEFR
  (`components/StudyTabs.tsx` `ListeningTab`, `pages/CefrLevelPage.tsx`), 2 chế độ: "Chọn nghĩa"
  (tái dùng `buildListeningQuestions` của `cefrExam.ts` — xuất khẩu thêm, cùng engine phần Nghe
  đề thi cuối cấp, tái dùng `ExamQuestionCard`) + "Gõ lại" (dictation — `lib/listening.ts` dựng
  câu từ hội thoại/ví dụ từ điển của cấp, chấm bằng `scorePronunciation`/`scoreWords` đã có).
  Tốc độ mặc định theo cấp (A1-A2 0.9× · B1-B2 1× · C1-C2 1.1×, `LISTENING_RATE_BY_LEVEL`) —
  nới kiểu `rate` của `speak()`/`speakBilingual()` từ `Rate` (0.75/1/1.25) sang `number` để nhận
  giá trị này (RateToggle không đổi) — ĐÃ MERGE (PR #248, 2026-07-16). PR #10 (vá prompt theo
  eval, ⑤ T2) BỊ CHẶN — cần baseline T1 trước (`npm run eval:tutor -- --write-baseline`, cần
  người có key AI, sandbox không có) → **bỏ qua tạm, làm PR #11 (comeback + Home "Hôm nay", ② M4)
  trước**. PR #11 — `lib/comeback.ts` (bỏ ≥3 ngày → banner "Mừng bạn quay lại" + phiên rút gọn
  5 thẻ SRS/3 từ mới qua `?tab=srs&cap=5`/`?tab=today&cap=3` mới thêm ở `TodayLesson`/`SRSReview`
  — CHỈ giới hạn batch/due list phiên đó, KHÔNG đổi tốc độ đã lưu) + `storage.daysSinceLastActivity`
  (mới) + `vocab.getRecentlyLearnedWords` (mới, cho gợi ý "Luyện nói với từ vừa học" ở Home —
  nối đề xuất B đã có CTA sẵn ở StudyTabs, đây là lối vào từ Home cho người không đang giữa
  phiên học) — ĐÃ MERGE (PR #249, 2026-07-16). PR #12 (nhắc thông minh, ② M3) — **PHẠM VI ĐÃ
  CHỐT VỚI NGƯỜI DÙNG (2026-07-16): chỉ làm phần NỘI DUNG xoay theo ngữ cảnh, KHÔNG làm "giờ
  nhắc thông minh"** (server tự chọn giờ gửi cần thêm tracking GIỜ hoạt động — `daily_usage`
  hiện chỉ có NGÀY — là đổi schema/thêm theo dõi, người dùng chọn không làm). Đã làm:
  `api/_lib/reminderContent.ts` (mới, hàm thuần) — `pickReminderMessage()` chọn 1 trong 5 mức
  ưu tiên: streak sắp mất (loss-aversion mạnh nhất) → SRS đến hạn → gần đạt mục tiêu tuần (còn
  đúng 1 ngày) → đang tham gia challenge (giữ nguyên) → chung chung (fallback cũ); `computeStreakAtRisk`/
  `computeWeeklyDaysDone` tính từ `daily_usage` 14 ngày gần nhất (không vé nghỉ streak — ước
  lượng nới tay chỉ để chọn nội dung, không phải số hiển thị chính thức). `api/push.ts`
  `sendReminders()` gọi các hàm này (Supabase query mới: `daily_usage` mở rộng 14 ngày +
  `learning_progress.srs`/`weekly_goal`), fail-open nếu lỗi. `api/_lib/date.ts` thêm
  `addDays`/`weekStartOf` (mirror `src/lib/date.ts`, đúng quy ước "api/\_lib không import từ
  src/lib" đã có từ trước). Giờ nhắc vẫn do người dùng tự chọn như cũ (`remind_hour`) — ĐÃ
  MERGE (PR #250, 2026-07-16). PR #13 (nút 👍/👎 + bảng `tutor_feedback`, ⑤ T3) — migration
  `0014` + `lib/tutorFeedback.ts` + nút vote cạnh mỗi khối "✅ Nhận xét" ở Chat.tsx/Speaking.tsx
  (👎 lưu `{userInput, aiFeedback}`, 👍 chỉ đổi UI không ghi DB, vote 1 lần/tin nhắn) — ĐÃ MERGE
  (PR #252, 2026-07-16). PR #14 (giải đấu tuần: migration + tính điểm tuần + `/api/leaderboard`,
  ② M5 phần 1/3) — migration `0015_league.sql` (cột `profiles.nickname`/`league_opt_in`,
  unique index không phân biệt hoa thường, khoá quyền ghi client như cột `plan` — chỉ server
  ghi được qua API mới); `api/_lib/leaderboard.ts` (hàm thuần: `currentWeekRange` tái dùng
  `weekStartOf` của `api/_lib/date.ts`, tính điểm tuần **1 điểm/lượt học từ-ôn SRS
  (`daily_usage.learn_count` — gộp chung vì app không tách 2 việc này thành 2 cột riêng) · 5
  điểm/phiên Chat-Viết-Nói · 15 điểm/challenge nộp**, `rankEntries` dense-rank, validate
  nickname 3-20 ký tự + lọc từ bậy cơ bản CHECK THEO TỪ NGUYÊN VẸN — tránh dương tính giả kiểu
  "Adam"/"Vladimir" chứa chuỗi con "dm"/"vl") + 24 unit test ca biên (tuần Thứ2/CN, cột null,
  đồng điểm, dương tính giả từ bậy). `api/leaderboard.ts` (mới, đăng ký ở `server.ts`): `GET`
  trả `{week, me, top}` (cache in-memory 5 phút theo tuần, chỉ tính điểm cho user đã opt-in);
  `POST {action:'set-nickname'|'opt-out'}` — trùng tên dựa vào unique index DB (bắt lỗi
  Postgres `23505` trả 409 thân thiện) thay vì tự query kiểm tra trước (tránh race condition).
  Điểm tính HOÀN TOÀN ở server từ dữ liệu server-side sẵn có (daily_usage/challenge_entries),
  client không gửi điểm lên (CLAUDE.md §4.2) — ĐÃ MERGE (PR #253, 2026-07-16). PR #15 (trang
  Giải đấu tuần + opt-in nickname, ② M5 phần 2/3) — thêm `LeagueSection` (mới,
  `src/components/LeagueSection.tsx`) vào NGAY trang `/challenge` hiện có thay vì tách route
  riêng (challenge = hoạt động ghi điểm cao nhất của giải, gộp chung 1 trang hợp lý hơn tách
  đôi — giữ đúng tinh thần "quay challenge vẫn dùng được không cần vào giải" của đặc tả): gọi
  `/api/leaderboard` qua `src/lib/leaderboardApi.ts` (mới) — chưa opt-in thì hiện ô nhập
  nickname + nút "Tham gia"; đã opt-in thì hiện hạng/điểm của mình + nút "Rời giải"; luôn hiện
  top bảng xếp hạng (kể cả chưa tham gia, để tạo động lực). Phát hiện qua E2E: nút "Thử lại"
  thiếu biến thể `theme-light:text-accent-800` → contrast 1.97 trên nền sáng (theme Blue
  sky/Pink), đã vá — bài học: MỌI màu `accent-400`/`red-400`... đặt trực tiếp trên nền
  `zinc-900` (tự đổi sáng/tối theo theme) đều phải kèm `theme-light:` tương ứng, không suy đoán
  từ các đoạn code khác trông giống — phải tự chạy `npx playwright test e2e/a11y.spec.ts` để
  bắt được lỗi này (không thấy qua build/lint/unit test). `vite.config.ts` thêm
  `/api/leaderboard` vào `API_ROUTES` (dev server proxy — thiếu dòng này thì trang gọi API mới
  sẽ 404 im lặng lúc `npm run dev`/E2E). ĐÃ MERGE (PR #254, 2026-07-16). **PR #16 KHÔNG CÒN VIỆC
  GÌ ĐỂ LÀM** (rà lại đặc tả sau khi #14+#15 merge, 2026-07-16): "gọn logic 30 ngày → chu kỳ
  tuần" đã xong ở PR #246, "huy hiệu M2" đã xong ở PR #247, và trang giải đấu ở PR #15 KHÔNG
  tách route riêng (gộp vào `/challenge` có sẵn) nên không có "đường cũ" nào cần redirect →
  ② M5/M5b (Giải đấu tuần) coi như ĐÃ XONG HẲN sau PR #14+#15, bỏ qua PR #16. **Tiếp theo:**
  PR #17 (Azure Pronunciation Assessment, ① G2 — người dùng đã chốt làm 2026-07-15) hoặc quay
  lại PR #10 (vá prompt theo eval) nếu có người chạy được baseline T1
  (`npm run eval:tutor -- --write-baseline`, cần key AI thật, sandbox không có). Cả 2 việc còn
  lại trong bảng ưu tiên đều cần MỘT bước của người dùng trước khi làm tiếp: PR #17 cần tự tạo
  `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` (chỉ cần lúc DEPLOY THẬT, code viết được ngay không
  cần key) — sandbox vẫn research pricing/API hiện hành trước khi code theo đúng KHUNG 3; PR
  #10 cần người có key AI chạy baseline trước.
- PR #17 (Azure Pronunciation Assessment — SERVER, ① Giai đoạn 2 phần 1/2): research-first
  (KHUNG 3) trước khi code — xác nhận lại free tier F0 (5h audio/tháng), REST API
  "recognition/conversation" (KHÔNG SDK), header `Pronunciation-Assessment` base64 JSON
  (`ReferenceText`/`GradingSystem`/`Granularity`/`Dimension`/`PhonemeAlphabet`), response
  `NBest[].PronunciationAssessment`/`Words[].Phonemes[]` — nguồn: Microsoft Learn + Q&A
  (link trong lịch sử chat phiên này). Migration `0016_pronounce_usage.sql` — cột
  `daily_usage.pronounce_count` + mở rộng danh sách cột hợp lệ của RPC
  `consume_usage`/`refund_usage` (0001/0004) — free 10/ngày, pro 100/ngày
  (`api/_lib/usage.ts` thêm mode `'pronounce'`, `src/types.ts` LIMITS đồng bộ). Thư viện mới
  `api/_lib/azurePronounce.ts`: hàm THUẦN `parseAzurePronounceResponse` (parse response Azure
  → shape rút gọn `{overall,accuracy,fluency,completeness,words:[{word,score,errorType,
phonemes:[{phoneme,score}]}]}` — chọn `PhonemeAlphabet:'IPA'` thay mặc định SAPI để khớp ký
  hiệu IPA đã có sẵn trong `src/data/pronunciationTraps.ts`, PR client sau map thẳng không cần
  bảng chuyển đổi) tách riêng khỏi `assessPronunciation` (gọi mạng) để test bằng fixture, không
  cần key thật — 12 test. Handler `api/pronounce-assess.ts` (đăng ký `server.ts` + parser JSON
  riêng 5MB do audio base64 lớn hơn giới hạn mặc định 64kb, giống `/api/stt`; `vite.config.ts`
  API_ROUTES cho dev) — chưa cấu hình `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` → 503
  `{fallback:true}` NGAY, KHÔNG trừ lượt (client PR sau tự rơi về Giai đoạn 1 miễn phí); lỗi
  Azure sau khi đã trừ lượt → hoàn lượt (đúng nguyên tắc "đường đi của tiền" của `/api/agent`)
  — 9 test. **Tác dụng phụ phát hiện được khi làm việc này:** `isUsageMode()` (dùng để validate
  `mode` gửi lên `/api/agent`) trước đó chấp nhận CẢ `'stt'` (và giờ sẽ chấp nhận cả
  `'pronounce'` nếu không sửa) — cho phép client gửi `mode:'stt'`/`'pronounce'` lên
  `/api/agent` để đếm nhầm sang cột khác, né giới hạn chat. Đã vá: `api/ai.ts` giờ dùng
  `CHAT_ENDPOINT_MODES` riêng (chỉ `chat`/`writing`/`speaking`) thay vì tái dùng `isUsageMode`
  dùng chung — thêm 5 test ca biên (`mode` lạ/số/null đều rơi về `'chat'`). **Chưa làm ở PR
  này (để PR sau):** client WAV convert (`src/lib/wav.ts`) + UI điểm âm vị chi tiết + fallback
  Giai đoạn 1 khi hết lượt/lỗi/chiều B. ĐÃ MERGE (PR #255, 2026-07-16). PR #17 phần 2/2
  (client): `src/lib/wav.ts` — hàm THUẦN `toMonoPcm16kHz` (downmix nhiều kênh + resample nội
  suy tuyến tính) + `encodeWavPcm16` (đóng gói header RIFF/WAVE/fmt/data 44 byte + PCM16) tách
  khỏi `blobToWav16kMono` (wrapper gọi `AudioContext.decodeAudioData` — CHỈ chạy được ở trình
  duyệt thật, không test bằng vitest/jsdom) — 10 test cho 2 hàm thuần (mono passthrough,
  downmix stereo, upsample/downsample đúng tỉ lệ, clamp biên độ, lượng tử hoá đúng int16).
  `src/lib/audioRecorder.ts` (mới, KHÔNG dùng lại `challengeRecorder.ts` — module đó gắn chặt
  hằng số/luồng dành cho Challenge quay video 180s, dùng chung sẽ lẫn ngữ nghĩa): ghi âm
  NGẮN chỉ-âm-thanh, trần mặc định 15s, cùng kiểu mã lỗi permission/unsupported như
  `challengeRecorder.ts` để nhất quán. `src/lib/pronounceAssessApi.ts`: convert WAV rồi gọi
  `/api/pronounce-assess`, phân biệt `fallback:true` (chưa cấu hình/hết lượt → nên rơi về
  Giai đoạn 1) với lỗi cứng (audio hỏng/mạng lỗi → báo thử lại) — 6 test (mock `blobToWav16kMono`
  - `fetch`). UI: `src/components/DetailedPronunciationCheck.tsx` (mới) — nút "Chấm chi tiết
    bằng AI (beta)" ghi âm → chấm → hiện overall/accuracy/fluency/completeness + chip màu theo
    điểm từng từ (bấm để xem từng âm vị, cùng ngưỡng màu 85/65/40 với `pronounceFeedback` của
    Giai đoạn 1 cho nhất quán cảm nhận) — nối vào `PronunciationCheck.tsx`, CHỈ hiện khi
    `lang==='en'` (Azure chưa hỗ trợ vi-VN). **Phát hiện qua E2E a11y (đã vá TRƯỚC KHI commit):**
    nút "Chấm chi tiết..." dùng `text-violet-300` không kèm `theme-light:` → lặp đúng lỗi contrast
    đã gặp ở PR #254 — lần này áp `theme-light:` cho MỌI màu cố định (violet/emerald/lime/amber/
    rose) ngay từ đầu thay vì để a11y test bắt sau. Đã tự xác nhận nút thực sự render trong DOM
    lúc quét (không phải quét "trúng" 1 trang không hiện component) trước khi tin cậy kết quả
    xanh. **Không tự map phoneme → tip tiếng Việt của bảng trap Giai đoạn 1** như đặc tả gốc dự
    kiến — Azure chấm theo `referenceText` mình cung cấp (không phải transcript độc lập như STT),
    nên logic "spoken khác target → tra bảng trap" của Giai đoạn 1 không áp dụng trực tiếp được;
    UI Giai đoạn 2 hiện điểm âm vị trực tiếp, việc map tip cụ thể để ngỏ cho đợt sau nếu cần. Code
    xong (build/typecheck/lint/size xanh, test 534/534, E2E 117/117 gồm quét a11y `/dictionary`
    xác nhận nút mới không vỡ contrast), chờ merge.
- **Quy tắc phân việc theo độ phức tạp** (CLAUDE.md mục 3, quyết định 2026-07-15): đọc đặc tả
  trước khi giao việc; việc phức tạp Opus tự làm, việc vừa giao subagent Sonnet, việc cơ học
  giao subagent Haiku — áp dụng cho mọi PR tiếp theo của mục trên.
- **Cải tiến sư phạm** (`docs/research/danh-gia-tien-trien-hoc-2026-07-07.md`, đề xuất A→H —
  bảng trạng thái trong tài liệu đó đã CŨ, rà lại 2026-07-16 theo việc thực đã merge): A (Sổ
  lỗi cá nhân) đã xong. B đã xong — nút "Luyện ngay N từ này bằng hội thoại" có sẵn ở màn
  batch-done (`StudyTabs.tsx`, `?words=`) TỪ TRƯỚC; PR #11 (M4) bổ sung lối vào từ Home. **C
  (sản xuất chủ động, gõ chính tả) + D (nghe hiểu) đã xong** — PR #248 (③ N3, tab "Nghe" ở
  trang cấp CEFR) làm đúng cả 2: "Chọn nghĩa" (D) + "Gõ lại"/dictation (C). **G (chấm phát âm
  cấp âm vị) đã xong** — PR #255/#256 (Azure Pronunciation Assessment, ① Giai đoạn 2). **E (ngữ
  pháp có vòng ôn lặp theo mastery) ĐÃ XONG (2026-07-16, "thêm tất cả" — người dùng chọn trộn
  vào tab Kiểm tra sẵn có thay vì làm màn ôn riêng)**: tận dụng LẠI engine SM-2 có sẵn
  (`src/lib/srs.ts`) thay vì viết engine mới — thêm 3 hàm mỏng `addGrammarToSRS`/
  `reviewGrammar`/`getDueGrammarLessonIds`, dùng tiền tố khoá `grammar:<lessonId>` để chia sẻ
  chung kho `srs_${uid}` với thẻ từ vựng mà KHÔNG đụng namespace (có test xác nhận 1 lessonId
  trùng tên 1 từ tiếng Anh vẫn tách biệt hoàn toàn 2 lịch ôn). `cefrProgress.ts`
  `markGrammarDone()` tự vào vòng ôn khi đánh dấu "đã học xong". `StudyTabs.tsx` `buildQuiz()`
  (tab Kiểm tra) nay ưu tiên chọn bài ngữ pháp ĐẾN HẠN trước (hết bài due mới rơi về ngẫu
  nhiên như cũ); trả lời đúng/sai tự suy ra đánh giá 'good'/'again' cập nhật lịch ôn tiếp theo
  (không hỏi người dùng tự chấm như thẻ từ vựng). `CefrLevelPage.tsx` thêm badge số đỏ trên
  tab "Kiểm tra" hiện số bài ngữ pháp đến hạn (cùng kiểu badge với tab "Ôn SRS"). Không cần
  bảng Supabase mới (đồng bộ qua `pushProgress` như mọi state SRS/grammar khác). 5 test mới
  (`srs.test.ts`), build/typecheck/lint/size xanh, test 551/551. **H (SM-2 → FSRS) ĐÃ XONG
  (2026-07-16, research-first theo KHUNG 3 trước — xem
  `docs/research/sm2-den-fsrs-2026-07-16.md`)**: thay ruột `src/lib/srs.ts` dùng thư viện
  `ts-fsrs@5.4.1` (FSRS-6, MIT, xác nhận field thật qua `node_modules/ts-fsrs/dist/index.d.ts`
  thay vì đoán) với `enable_short_term: false` (bỏ bước học theo PHÚT kiểu Anki mặc định, giữ
  đúng nhịp học theo NGÀY của app) — giữ NGUYÊN mọi chữ ký hàm public
  (`addToSRS`/`reviewWord`/`getDueWords`/`getSRSStats`/`getNextReview`/`getLeechWords`/
  `addToSRSKnown` + 3 hàm ngữ pháp ở trên) nên KHÔNG phải sửa `StudyTabs.tsx`/`Flashcard.tsx`/
  `Challenge.tsx`/`cefrProgress.ts`, áp dụng tự động cho CẢ từ vựng lẫn ngữ pháp (dùng chung 1
  engine từ đề xuất E). **Quyết định người dùng (2 điểm hỏi trước khi code):** làm NGAY + hướng
  chuyển đổi **"cắt hẳn, đặt lại từ New"** (khác khuyến nghị "chuyển dần" của tôi) — mọi thẻ SRS
  cũ (từ vựng + ngữ pháp) coi như học lại từ đầu, thực hiện tự nhiên qua đổi shape lưu
  `localStorage` (dữ liệu SM-2 cũ không còn khớp field mới). **Phát hiện qua test thật (không
  suy đoán công thức, chạy `node --input-type=module` trực tiếp `ts-fsrs` trước khi viết
  assertion):** `lapses` (leech/tab Từ khó) giờ chỉ tăng khi trượt SAU KHI đã học được — không
  tính lần trượt đầu tiên lúc thẻ còn mới (ngữ nghĩa hợp lý hơn SM-2 cũ); tie-break độ ưu tiên ôn
  đổi "ease thấp nhất" → "difficulty cao nhất" trước (cùng ý định: thẻ khó hơn ôn trước).
  **Bundle vượt ngân sách 5.71kB (116→121.71kB brotli, đo thật bằng `npm run size`)** — người
  dùng chọn nâng `.size-limit.json` lên 123kB thay vì huỷ, chấp nhận đổi ~5% bundle đầu lấy lợi
  ích giảm 20-30% lượt ôn. Build/typecheck/lint/format/size xanh, test 551/551. **F** (giữ
  chân) — streak freeze đã có từ trước; "tổng kết tuần" nay có thể coi là đã phủ một phần qua
  mục tiêu tuần (`weeklyGoal.ts`, PR #246) + màn ăn mừng, dù không phải 1 màn "tổng kết" riêng.
- **Gộp thẻ Home (2026-07-16, theo yêu cầu người dùng)**: 2 thẻ riêng "Các bài hội thoại mẫu"
  (`/lessons`) + "Các câu thông dụng" (`/phrases`) gộp thành 1 thẻ "Hội thoại và các câu thông
  dụng" (`src/pages/Home.tsx`), dùng lại đúng kiểu thẻ "group" đã có sẵn cho thẻ gia sư AI (1
  header + nút con) — sửa `ModeCard` type + render để chấp nhận lưới 2 HOẶC 3 nút con (trước
  chỉ cứng `grid-cols-3`). Khối "💡 Mẹo" (gợi ý bắt đầu từ Câu thông dụng rồi sang Luyện nói)
  chuyển từ đứng riêng ở CUỐI trang Home vào NGAY trong thẻ gộp này (field `showTip` mới trên
  kiểu `group`). Thêm i18n `dialoguesPhrasesTitleA/B`, `dialoguesPhrasesDescA/B`,
  `tagDialoguesPhrases` (cả 2 ngôn ngữ giao diện, giữ nguyên các key cũ vì `Lessons.tsx`/
  `CommonPhrases.tsx` không đổi, 2 trang đó vẫn còn nguyên). Build/typecheck/lint/size xanh,
  test 551/551, E2E 117/117 (a11y Home cả 4 theme).
- **Gộp tiếp thành nút "Nghe" trong thẻ gia sư AI (2026-07-16, theo yêu cầu người dùng)**: thẻ
  "Hội thoại và các câu thông dụng" ở trên bị XÓA hẳn — gộp thành 1 nút con "Nghe" (icon
  `Headphones`) NGAY trong thẻ "Học cùng gia sư AI" (nay 4 nút: Nghe · Chat · Nói · Viết, lưới
  2×2). **Quyết định người dùng khi hỏi trước khi code:** bấm "Nghe" mở 1 màn chọn nhỏ (modal,
  style giống hộp chọn giờ nhắc học ở `QuickActions.tsx`) cho chọn tiếp "Các bài hội thoại mẫu"
  (`/lessons`) hay "Các câu thông dụng" (`/phrases`), KHÔNG vào thẳng 1 trang cố định. State
  `showListenPicker` mới trong `Home.tsx`; sub-item "Nghe" dùng path giả `LISTEN_PICKER_PATH`
  để phân biệt với nav() bình thường trong `onClick` chung của mọi nút con nhóm. Khối "💡 Mẹo"
  đổi chữ tham chiếu "Câu thông dụng" → "Nghe" cho khớp nút mới (`tipPhrases`). Xóa hẳn các key
  i18n `dialoguesPhrasesTitleA/B`/`dialoguesPhrasesDescA/B`/`tagDialoguesPhrases` (không còn
  dùng ở đâu, xác nhận bằng grep trước khi xóa) — thêm `listen`/`listenDescA/B`/
  `listenPickerTitle`. Đã tự xác nhận bằng Playwright chụp ảnh thật (không chỉ đọc code): thẻ
  gộp hiện đúng 4 nút, bấm "Nghe" mở đúng modal 2 lựa chọn. Build/typecheck/lint/format/size
  xanh, test 551/551, E2E a11y Home 8/8 (cả 4 theme, không lỗi mới).
- **Bổ sung dạng biến thể từ điển** (`docs/research/bo-sung-dang-bien-the-tu-dien.md`) — **Bước
  2 + Bước 4 ĐÃ XONG (2026-07-16, "thêm tất cả")**:
  - **Bước 2 (gắn `base`)**: rà toàn bộ `IRREGULAR_VERBS`/`IRREGULAR_PLURALS`/
    `IRREGULAR_COMPARATIVES` (`src/data/irregularForms.ts`) so với từ điển, có kiểm tra **khớp
    pos** trước khi động vào (phát hiện vài từ đồng âm khác nghĩa mà từ điển chỉ lưu 1 nghĩa —
    vd "bear" chỉ có nghĩa danh từ "con gấu" dù bảng động từ bất quy tắc có "bear→borne"; tương
    tự "ring/spring/speed/dream/mistake" chỉ có nghĩa danh từ, "echo" chỉ có nghĩa động từ dù
    bảng số nhiều bất quy tắc kỳ vọng danh từ — **14 dạng bị BỎ QUA có chủ đích** vì lệch pos,
    không tự suy đoán/gộp nghĩa). 138 entry ĐÃ CÓ trong từ điển được gắn thêm `base` (vd
    went/gone→go, children→child, better/best→good). 95 entry CÒN THIẾU hẳn (64 dạng động từ +
    31 số nhiều bất quy tắc, vd hid/geese/appendices) được soạn tay theo đúng quy ước có sẵn
    (`vi`: "đã... (quá khứ/phân từ của X)" hoặc "những... (số nhiều của X)") và thêm vào 10 file
    `public/data/dictionary/chunk-*.json` (round-robin, tổng 12.073→12.168 từ) — `pos`/`level`
    lấy nguyên từ entry gốc, `ipa_vi` KHÔNG tự bịa mà tái dùng đúng phiên âm đã xác minh của
    "đã"/"những" (mọi `vi` mới đều cố tình bắt đầu bằng 1 trong 2 từ này). **7 dạng bị bỏ qua**
    vì từ gốc còn thiếu hẳn trong từ điển (louse/elf/parenthesis/fungus/memorandum/vertex/
    torpedo) — để dành đợt bổ sung từ điển sau. ~~**Nợ kỹ thuật MỚI phát hiện (chưa sửa)**:
    entry "played" có trường `forms` tự tham chiếu vô nghĩa~~ **ĐÃ TRẢ XONG (2026-07-17, xem
    mục "Dọn forms rác từ điển" bên dưới)**.
  - **Bước 4 (search hiểu biến thể)**: `src/lib/dictionaryApi.ts` xây `formsIndexCache` (dạng
    biến thể QUY TẮC từ trường `forms` đã tính sẵn → từ gốc) 1 lần rồi tái dùng; `searchDictionary`
    trả thêm `matchedForm` khi query khớp đúng 1 dạng KHÔNG có entry riêng (vd "books"/"played")
    và bản thân query đó CHƯA PHẢI 1 headword thật (tránh gợi ý nhầm khi 1 dạng biến thể trùng
    với 1 từ độc lập khác, có test riêng cho ca này). `src/pages/Dictionary.tsx` hiện dòng gợi ý
    `"books" là 1 dạng của "book"` ngay trên dải chip lọc loại từ. 7 test mới
    (`src/lib/dictionaryApi.test.ts`, mock `loadDictionary`). Build/typecheck/lint/size xanh,
    test 546/546. **Chưa xác nhận được qua trình duyệt thật** (môi trường phiên này không có
    `.env`/khoá Supabase nên `/dictionary` không load được để chạy Playwright sống) — đã bù bằng
    kiểm tra JSON hợp lệ + đếm entry đúng 12.168 bằng script + 7 unit test bao phủ đủ ca biên.
- **Dọn forms rác từ điển (2026-07-17, trả nợ kỹ thuật "played" ở trên — rà TOÀN BỘ 12.168
  entry)**: 3 lớp rác cùng gốc rễ (script `gen-word-forms.ts` tin quy tắc mù quáng):
  - **194 entry là dạng chia QUY TẮC của từ khác** (played/buying/goes/has/is/causes… + danh từ
    gentlemen/pajamas) từng bị coi như từ gốc → sinh forms chồng đuôi ("playedded"). Sửa TRONG
    generator (idempotent, chạy lại không tái nhiễm): thêm lượt 1 lập chỉ mục "dạng chia → từ
    gốc" (kể cả dạng chia ĐỘNG TỪ GIẢ ĐỊNH cho danh từ/tính từ gốc — bắt "displayed" dù
    "display" mang pos n; ưu tiên từ gốc là động từ thật nên "does"→do chứ không →doe); lượt 2
    bỏ forms + gắn `base` trỏ về từ gốc cho các entry này (194 base mới — search/UI "Xem từ
    gốc" dùng được ngay). Guard chống bắt oan: không đụng động từ bất quy tắc GỐC (feed ← fee),
    không tính khoá comparative ("flatter" động từ ≠ so sánh của flat), danh từ gerund
    (building/meeting) giữ nguyên số nhiều hợp lệ.
  - **Tính từ phân từ đuôi -ied** (fried/dried) bị sinh "frieder/friedest" → chặn trong
    `comparativeForms` ("red" 1 âm tiết thật vẫn có redder/reddest).
  - **Số nhiều vô nghĩa/SAI NGHĨA cho danh từ đặc biệt** — nặng nhất `corps→"corpses"` (= xác
    chết!), axis→"axises", oasis→"oasises", alumnus→"alumnuses", tennis→"tennises",
    sunglasses→"sunglasseses", jesus→"jesuses"… Bổ sung danh sách ngoại lệ ở
    `src/data/irregularForms.ts`: 10 bất quy tắc Hy Lạp/Latin (axes/oases/emphases/alumni/
    genera…), 8 bất biến (corps/chassis/headquarters/offspring…), 16 không đếm được (bệnh/môn
    chơi: diabetes/tennis/chess…), 29 chỉ-có-số-nhiều (sunglasses/amenities + số nhiều mà SỐ ÍT
    chưa có entry: cubs/lads/babes…), và set MỚI `NO_PLURAL_NOUNS` (danh từ riêng/ký hiệu:
    jesus/gps/les… — không chia, không hiện gì).
  - **Quyết định kèm theo**: entry biến thể (có `base`) bị LOẠI khỏi bộ chọn từ của vòng học
    (`gen-cefr-c1c2-vocab.ts` + `gen-a1b2-extra-vocab.ts` thêm filter `!e.base`) — biến thể để
    TRA CỨU, không thành thẻ học riêng (tránh trùng thẻ "played"/"goes" với thẻ play/go trong
    SRS; ~324 thẻ biến thể rút khỏi vòng A1-B2, 5 khỏi C1/C2). Tiến độ người học KHÔNG mất —
    lưu theo TỪ (`et_learned_`), vòng chỉ là suy diễn. Đã tái sinh chuỗi dữ liệu đủ thứ tự:
    dictionary → cefrC1C2Vocab → cefrA1B2ExtraVocab → curriculum.json → learn → form-examples.
  - Xác minh: quét script không còn chuỗi rác ở MỌI file data; Playwright sống trên
    `/dictionary` (5 kịch bản: "played" hiện nút Xem từ gốc, "books" gợi ý dạng của book,
    "playeds" hết gợi ý rác, "corps" hiện "corps (không đổi)", "axis"→axes + "sunglasses" không
    chip số nhiều). 9 unit test mới (`wordForms.test.ts`). ~~**Nợ nhỏ còn lại**: số nhiều kiểu
    "smokings/computings" của gerund không đếm được~~ **ĐÃ TRẢ (2026-07-17, xem mục ngay dưới)**.
- **Dọn nợ gerund plural (2026-07-17, tiếp nối mục "Dọn forms rác từ điển" ở trên)**: rà tay 206
  ứng viên danh từ đuôi "-ing" có `forms.plural` — LOẠI các từ không thật sự là gerund (king,
  ring, spring, thing, morning, darling, duckling, pudding… trùng đuôi ngẫu nhiên, không liên
  quan động từ, số nhiều vốn đúng) và các gerund CÓ số nhiều hợp lệ theo ngữ cảnh riêng
  (findings/warnings/meetings/buildings/trainings/hostings/mailings/sailings/bearings… — CỐ Ý
  không đụng, tiếng Anh thật sự dùng số nhiều những từ này). Chỉ chặn **62 từ có độ tin cậy
  cao**: thể thao/sở thích/lĩnh vực hoạt động thuần túy KHÔNG BAO GIỜ chia số nhiều trong tiếng
  Anh chuẩn (smoking, computing, swimming, boxing, camping, jogging, hiking, cycling, gambling,
  gardening, marketing, parking, shopping, wrestling… đủ 62 từ, xem `src/data/irregularForms.ts`
  → `UNCOUNTABLE_NOUNS`). Thêm vào set có sẵn (không tạo type mới) — tái sinh đủ chuỗi dữ liệu.
  Xác minh diff: ĐÚNG 62 entry đổi `forms` (plural→uncountable), không tác dụng phụ. 3 unit test
  mới (`wordForms.test.ts`) + Playwright sống trên `/dictionary` (smoking/computing/swimming
  hiện "không đếm được"; meeting/building VẪN giữ số nhiều — xác nhận không chặn oan). Build/
  typecheck/lint/format/size xanh, test 556/556, E2E 117/117.
- Gamification: **V-4 (mốc + huy hiệu) đã xong** (PR #8/#247, `src/data/achievements.ts`) và
  **V-5 (Home "Hôm nay") đã xong** (PR #11/#249, comeback + gợi ý luyện nói) — dòng cũ ghi
  "chưa làm" đã LỖI THỜI. **V-6 (âm UI) ĐÃ XONG (2026-07-16, người dùng chọn "thêm tất cả"
  3 việc còn lại):** `src/lib/sound.ts` (mới) — tổng hợp beep bằng Web Audio API (oscillator),
  KHÔNG tải file audio nào ($0 chi phí); `sound.correct()`/`sound.wrong()` (nốt cao/trầm ngắn)
  gọi cặp với `haptics.success()`/nhánh rung sai đã có sẵn ở mọi nơi chấm đúng/sai (quiz trắc
  nghiệm × 3 chỗ trong `StudyTabs.tsx`, dictation, đánh giá SRS, `Flashcard.tsx`, nộp
  `Challenge.tsx`); `sound.milestone()` (hợp âm 3 nốt tăng dần) gọi trong `Celebration.tsx`
  (dùng chung cho màn ăn mừng streak/mục tiêu tuần/huy hiệu/tuần trọn vẹn — không cần sửa
  từng nơi gọi `<Celebration>`). Toggle bật/tắt ở `/profile` (`isSoundEnabled`/
  `setSoundEnabled`, mặc định BẬT, tự phát thử 1 tiếng khi bật) — 5 test cho phần thuần
  (bật/tắt + xác nhận không bao giờ throw kể cả khi jsdom không có `AudioContext`, đúng nhánh
  "trình duyệt không hỗ trợ" thật). E2E a11y `/profile` + `/learning-path/a1` (nơi
  `StudyTabs`/`Flashcard` render) đều xanh ở cả 4 theme.
- **Hạ tầng hạn dùng gói Pro/VIP (2026-07-24)** — chuẩn bị kỹ thuật cho thanh toán, CHƯA nối
  cổng thanh toán thật/CHƯA chốt giá (xem "Quyết định quan trọng"): migration
  `0004_plan_expires_at.sql` (cột `profiles.plan_expires_at`, nullable = vĩnh viễn) ·
  `resolvePlan()` (`api/_lib/plan.ts`) coi Pro/VIP hết hạn là Free NGAY LÚC ĐỌC (áp ở
  `usage.ts`/`authService.ts`/`api/profile.ts`, không phụ thuộc job chạy đúng giờ) · job dọn
  dữ liệu `downgradeExpiredPlans()` (`api/_lib/planExpiry.ts`) chạy 1 lần/ngày trong
  `server.ts` (theo mẫu `startReminderScheduler` có sẵn) · endpoint
  `POST/GET /api/admin-grant-plan` (admin cấp/gia hạn Pro/VIP thủ công theo email + số ngày —
  dùng tạm trong lúc chưa có cổng thanh toán tự động, admin xác nhận chuyển khoản tay rồi gọi
  endpoint này).
- **Dùng thử Pro 5 ngày khi xác thực email (2026-07-27)** — hạ rào quyết định mua trước khi
  có cổng thanh toán thật: migration `0013_email_verify_trial.sql` (cột
  `profiles.trial_granted_at`) · `grantEmailVerifyTrial()` (`api/_lib/trial.ts`) cấp 5 ngày Pro
  qua `grantPlanDays()` dùng chung, **mỗi tài khoản đúng 1 lần vĩnh viễn** · nối vào nhánh
  `verify-email` của `api/auth.ts`, trả `{ trialGranted, trialDays }` cho UI
  (`EmailVerifySection.tsx`) khoe quà. **Vì sao cần cột riêng:** `changeEmail()` đặt lại
  `users.email_verified = null`, nếu chỉ dựa vào cờ đó thì đổi email → xác thực lại → nhận thêm
  quà, lặp vô hạn. Lỗi cấp quà bị nuốt có chủ đích — không được làm hỏng việc xác thực email.
  **Deploy kế tiếp cần `npm run migrate:pg`** (tự chạy trong `scripts/deploy.sh`).

> ~~🔴 KHẨN CẤP — Auto deploy lỗi liên tục (thiếu `SUPABASE_DB_URL`, phát hiện 2026-07-15)~~
> **ĐÃ HẾT HIỆU LỰC (2026-07-20)** — production đã rời hẳn Supabase (Giai đoạn A→E), deploy
> giờ dùng `DATABASE_URL` (Postgres tự host) + `npm run migrate:pg`, không còn phụ thuộc
> `SUPABASE_DB_URL`. Xem `docs/migration-thoat-ly-supabase.md`.

## ⚠️ Cần làm tay (không cần PR)

- **[2026-08-27] Đối chiếu bộ chạy Swift với `swift` THẬT — CHẶN cả chương trình M từ PR-M4.**
  Chạy trên máy có Xcode hoặc Swift toolchain:
  `npm run swift:conformance`
  Script sinh một file `.swift` gồm đúng 41 ca đối chiếu, chạy bằng `swift`, so từng ca với kết
  quả kỳ vọng **và** với output của bộ chạy DHCB, rồi in ca nào lệch. Xong thì đặt
  `daDoiChieu: true` cho các ca đã khớp trong
  `packages/subject-programming/swiftSim/conformance.ts`, ghi phiên bản `swift --version` vào
  `docs/research/dac-ta-bo-chay-swift-2026-08-27.md` mục 4, rồi commit.
  **Vì sao AI không tự làm được:** máy dựng PR-M3 không có Swift và proxy chặn tải từ swift.org
  (đã thử, trả 403). Hiến chương chương trình M §3.4 cấm suy đoán kết quả từ trí nhớ.
  **Hệ quả nếu bỏ qua:** PR-M4 (nội dung Swift) không được bắt đầu — `conformance.test.ts` tự
  làm CI đỏ nếu có bài `language: 'swift'` khi ca còn chưa đối chiếu.

- **[2026-08-27] Đối chiếu bộ chạy Kotlin với `kotlinc` THẬT — CHẶN PR-M8 (nội dung Kotlin).**
  Chạy trên máy có Kotlin toolchain:
  `npm run kotlin:conformance`
  Script sinh một file `.kt` gồm đúng 48 ca đối chiếu, chạy bằng `kotlin` (hoặc `kotlinc` +
  `java`), so từng ca với kết quả kỳ vọng **và** với output của bộ chạy DHCB, rồi in ca nào lệch.
  Xong thì đặt `daDoiChieu: true` cho các ca đã khớp trong
  `packages/subject-programming/kotlinSim/conformance.ts`, ghi phiên bản `kotlin -version` vào
  `docs/research/dac-ta-bo-chay-kotlin-2026-08-27.md` mục 4, rồi commit.
  **Vì sao AI không tự làm được:** máy dựng PR-M7 không có Kotlin và proxy chặn tải.
  **Hệ quả nếu bỏ qua:** PR-M8 (nội dung Kotlin) không được bắt đầu — `conformance.test.ts` tự
  làm CI đỏ nếu có bài `language: 'kotlin'` khi ca còn chưa đối chiếu.

- **Migration `0034`–`0037` (ADR-0002) — CHẠY TRƯỚC KHI DEPLOY.** `npm run migrate:pg` trên VPS
  (`identities`, `entitlements`, `english.user_profile`, xoá 4 cột OAuth cũ trên `users`).
  Sau khi deploy Bước 6, mọi người dùng đang đăng nhập bằng phiên Bearer cũ **phải đăng nhập lại
  một lần** — đây là đánh đổi đã được xác nhận, không phải lỗi.

- **Migration `0028_tts_viseme_timeline.sql` — CHẠY TRƯỚC KHI DEPLOY đợt avatar timing.**
  Thêm cột `viseme_timeline jsonb` vào `tts_cache` (nullable, không phá dữ liệu cache cũ).
  Lệnh: `npm run migrate:pg` (đã nằm trong `scripts/deploy.sh`). Rollback nếu cần:
  `alter table public.tts_cache drop column viseme_timeline;`
  Muốn thấy hiệu quả thật cần `ELEVENLABS_API_KEY` trên VPS + chọn giọng VIP "Rachel";
  giọng Google Chirp3-HD không có timestamp nên vẫn chạy đường ước lượng như cũ.

- ~~Backup R2~~ **ĐÃ XONG (2026-07-29, người dùng xác nhận).** Phát hiện qua báo cáo "backup tự
  động lên R2 có nhưng không thấy chạy": cron `backup:r2` (Postgres → R2) chưa từng được thêm dù
  code/docs mục 7.2 đã có từ trước (chỉ có cron `pg_dump` local). Đã sửa: cấp quyền bucket
  `english-tutor-pg-backups` cho token R2, thêm `R2_BACKUP_BUCKET` vào `.env` VPS, upload 9 file
  backup tồn đọng, thêm cron `backup:r2`. Trong lúc rà soát phát hiện thêm lỗ hổng: `.env`
  (API key/secret) trước giờ KHÔNG được backup ở đâu cả — thêm mới `scripts/backup-env-to-r2.ts`
  - `scripts/restore-env-from-r2.ts` (mã hoá AES-256-GCM, dùng chung `R2_BACKUP_BUCKET`, xem
    `docs/setup-postgresql-vps.md` mục 7.3, PR #369 đã merge). VPS hiện có đủ **3 dòng cron**
    (`pg_dump` 5h03, `backup:r2` 3h10, `backup:env` 3h10) chạy hàng ngày, đã xác nhận upload thành
    công cả 2 loại. `ENV_BACKUP_PASSPHRASE` đã tạo mạnh (qua `openssl rand -base64 24`), lưu ở
    password manager, KHÔNG đặt trong `.env`.
- **Kế hoạch scale 50k concurrent (2026-07-25) — GĐ1-5 phần code/config/docs ĐÃ XONG
  (PR #321-#326), còn lại là việc hạ tầng thật cần người dùng tự làm:**
  1. **Mua thêm VPS** (khuyến nghị: tách Postgres/Redis ra 1 VPS riêng 6-8 vCPU trước tiên —
     xem runbook `docs/deploy-vps-ubuntu.md` mục "GĐ2"), sau đó thêm 2-3 VPS app khi k6 xác
     nhận cần (đo trước, đừng mua hết 1 lần).
  2. **Chạy `bash scripts/verify-pg-backup.sh`** trên VPS ít nhất 1 lần để xác nhận backup
     cron hiện có thật sự restore được (chưa từng kiểm chứng).
  3. **Cài k6 + chạy `npm run loadtest:k6`** (`BASE_URL=... VU_TARGET=... k6 run
scripts/load-test/k6-baseline.js`) nhắm staging/production — tăng dần VU_TARGET, KHÔNG
     nhảy thẳng lên 50k. Đây là bước đo THẬT còn thiếu — mọi con số vCPU trong kế hoạch hiện
     vẫn là ước lượng lý thuyết.
  4. Xem `docs/rollback-runbook.md` nếu có sự cố khi triển khai các bước trên.
  5. Xem `docs/research/ke-hoach-scale-30k-concurrent.md` (tên file cũ, nội dung đã cập nhật
     mục tiêu 50k) để biết đầy đủ bối cảnh/ngân sách/quyết định đã chốt.
- **Hạ tầng hạn dùng gói Pro/VIP (2026-07-24):** deploy kế tiếp cần `npm run migrate:pg` trên
  VPS để áp `postgres/migrations/0004_plan_expires_at.sql` (script deploy tự chạy, không cần
  làm tay riêng nếu deploy qua `scripts/deploy.sh` như bình thường). Cách cấp Pro/VIP thủ công
  (trong lúc chưa có cổng thanh toán thật): admin gọi
  `POST /api/admin-grant-plan` body `{ "email": "...", "plan": "pro", "days": 30 }` (Bearer
  token của admin, `days: null` = vĩnh viễn).
- **Nâng cấp giọng TTS 14 giọng + gói VIP + admin cấu hình (nhánh
  `claude/chirp-3-hd-voice-upgrade-c06eds`, chưa merge — 2026-07-21):**
  1. `npm run migrate:pg` trên VPS để tạo bảng `app_settings`
     (`postgres/migrations/0001_app_settings.sql`).
  2. Thêm `ADMIN_EMAILS=donghanhcungban.org@gmail.com` vào `.env` VPS (xác thực trang
     `/admin-settings`, xem `api/_lib/adminAuth.ts`).
  3. **QUAN TRỌNG:** toàn bộ code nhánh này viết trong sandbox KHÔNG có `node_modules`
     cài sẵn nên CHƯA từng chạy `npm run build`/`typecheck`/`lint`/`test`/`test:e2e` thật —
     PHẢI chạy đủ cổng mục 8 CLAUDE.md trước khi merge/deploy, đừng tin chỉ vì đã review
     code bằng mắt.
- ~~`SENTRY_DSN`/`VITE_SENTRY_DSN`~~ **ĐÃ XONG (2026-07-27, người dùng xác nhận)** — đã điền
  trên VPS, đã thấy lỗi test được ghi nhận trên Sentry. Không còn no-op.
- `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`) trên VPS nếu chưa có — cần cho STT.
- `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` — TÙY CHỌN, chỉ cần khi muốn bật chấm phát âm chi
  tiết qua Azure (① Giai đoạn 2, PR #17). Tạo resource "Speech service" (free tier F0, 5h
  audio/tháng) ở Azure Portal → Keys and Endpoint, điền vào `.env` VPS. Thiếu 2 biến này thì
  `/api/pronounce-assess` tự trả lỗi "chưa cấu hình" (client rơi về Giai đoạn 1 miễn phí),
  KHÔNG làm vỡ app — không bắt buộc phải làm ngay.

## Quyết định quan trọng

- **[2026-08-04] Tự viết "bản đồ code" thay GitNexus.** `npm run codemap` — dùng TypeScript
  compiler API (đã có sẵn, KHÔNG thêm dependency) dựng đồ thị import + đồ thị lời gọi hàm, lưu
  `.codemap/graph.json` (gitignore, dựng lại được). Đo thật: 480 file · 1364 cạnh import · 4341
  cạnh lời gọi trong ~9 giây. Lệnh tra cứu: `impact` (sửa file này gãy chỗ nào), `callers` (ai gọi
  hàm này), `hotspots`, `cycles`, `orphans`. Logic thuần tách ở `scripts/lib/codemap.ts` (18 test).
  Phát hiện ngay khi chạy thử: 3 chu trình import trong `apps/english/src/data/` (cefr.ts ↔
  cefrAdvanced.ts, curriculum.ts ↔ cefrC1C2Vocab.ts, curriculum.ts ↔ cefrA1B2ExtraVocab.ts) —
  chưa gây lỗi nhưng nên gỡ, đã ghi vào "Nợ kỹ thuật còn mở".

- **[2026-08-04] Không cài `obra/superpowers` và `GitNexus` — chỉ dung hợp ý hay vào khung sẵn có.**
  Đã rà cả 14 skill của `obra/superpowers` (MIT). 10/14 skill (brainstorming, writing-plans,
  executing-plans, subagent-driven-development, dispatching-parallel-agents, using-git-worktrees,
  requesting/receiving-code-review, using-superpowers, writing-skills) **đã có tương đương** trong
  `docs/framework/KIEN-TRUC-DIEU-PHOI-3-TANG.md` — cài plugin sẽ tạo nguồn luật thứ hai song song
  với `CLAUDE.md`, dễ khiến agent hành xử không nhất quán. 4 skill còn thiếu đã được viết lại bằng
  tiếng Việt và nhúng thẳng vào khung: TDD RED-GREEN-REFACTOR + debug 5 bước (KHUNG 1, GĐ5),
  bằng chứng-trước-khi-báo-xong + hoàn tất nhánh an toàn (KHUNG 2, Phần A).
  **GitNexus bị loại** vì license PolyForm Noncommercial 1.0.0 xung đột với việc dự án đã thu phí
  Pro/VIP qua SePay — không đưa vào quy trình chính thức của repo.

- **[2026-07-31] Mở rộng thành nền tảng đa lĩnh vực — ĐÃ CHỐT.** Xem mục "Tiếp theo" ở trên +
  `docs/adr/0001-nen-tang-da-linh-vuc.md` (nguồn sự thật, đừng chép lại chi tiết ra đây kẻo lệch
  khi ADR được bổ sung sau này).

- **Bảng xếp hạng (LeagueSection trong `/challenge`) TẠM TẮT (2026-07-27).** Lý do: ở quy mô
  ít người dùng, bảng gần trống/chỉ vài người khiến người mới thấy app "vắng vẻ" và bỏ đi —
  phản tác dụng với mục tiêu giữ chân. Làm thành **cầu dao trong `app_settings`**
  (`leaderboardEnabled`, migration `0018_leaderboard_toggle.sql`) thay vì comment code, để admin
  tự bật lại qua `/admin-settings` KHÔNG cần deploy khi đủ đông người dùng hoạt động/tuần (đề
  xuất mốc tham khảo ~200). Component `LeagueSection.tsx` + `api/leaderboard.ts` giữ nguyên
  không xoá. Client đọc qua `isLeaderboardEnabled()` (`src/lib/appSettings.ts`), dùng ở
  `Challenge.tsx` giống cách `getLimits()` đã dùng (đọc trực tiếp lúc render, không qua context).
- **Challenge 30 ngày → nhập vào Giải đấu tuần (2026-07-15, quyết định người dùng).** Khi làm
  M5/M5b của `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md`: route `/challenge` thành
  trang Giải đấu tuần (redirect giữ link cũ), quay challenge = hoạt động ghi điểm (+15/ngày),
  bỏ khung 30 ngày chuyển chu kỳ tuần; dữ liệu `challenge_entries` + huy hiệu cũ giữ nguyên.
  **[Bổ sung 2026-07-15, làm cùng PR #7]** Người dùng yêu cầu "Challenge tính theo tuần luôn
  cho đồng bộ" (với mục tiêu tuần vừa làm) → phần "gọn challenge → chu kỳ tuần" (mục 16 bảng
  ưu tiên) ĐÃ LÀM NGAY, không đợi tới giải đấu (mục 14–15): bảng 7 ô Thứ 2→CN thay bảng 30 ô
  (dùng chung luật tuần `weekStartOf` của `lib/date.ts` với mục tiêu tuần), bỏ vé nghỉ/resume/
  restart/mốc 30 ngày, chủ đề xoay vòng theo tổng số bài đã nộp, tổng kết TUẦN vào Chủ nhật
  (so video đầu↔cuối tuần), ăn mừng "tuần trọn vẹn 7/7". Schema `challenge_entries` GIỮ NGUYÊN
  (cột `challenge_day`/`round` để nguyên — dữ liệu cũ không mất; prompt AI KHÔNG sửa để khỏi
  phải chạy lại eval). Phần bảng xếp hạng/điểm giải vẫn ở mục 14–15 như cũ.

- **Thanh toán Pro: KHÔNG làm (2026-07-11)** → **[Cập nhật 2026-07-24]** người dùng chủ động
  yêu cầu chuẩn bị TRƯỚC phần hạ tầng kỹ thuật (hạn dùng gói + cấp Pro thủ công qua admin —
  xem mục "Đã xong"), **CHƯA quyết định giá/cổng thanh toán/có siết hạn mức Free hay không**.
  App vẫn miễn phí như cũ, chưa có trang giá nào hiển thị cho người dùng thường. Việc còn lại
  khi quyết định thu phí thật: chọn cổng (khuyến nghị Casso/SePay — chỉ cần tài khoản ngân
  hàng cá nhân, KHÔNG cần hộ kinh doanh/MST như PayOS), chốt mức giá, trang `/upgrade` +
  webhook thanh toán thật gọi `admin-grant-plan` (hoặc endpoint tương đương) tự động thay vì
  admin gõ tay.
- **Giá gói ĐÃ CHỐT LẦN CUỐI (2026-07-27, thay bảng giá nháp cùng ngày):** Pro **20.000đ/10
  ngày · 40.000đ/tháng · 360.000đ/năm**; VIP **30.000đ/10 ngày · 75.000đ/tháng · 500.000đ/năm**.
  Đây là giá NIÊM YẾT — **dịp lễ/Tết sẽ giảm thêm**, mức và thời điểm quyết định sau từng đợt.
- **M2 Thanh toán Pro/VIP qua SePay: CODE ĐÃ XONG (2026-07-27)** — thay PayOS (PayOS đòi tư
  cách hộ kinh doanh/MST, SePay chỉ cần tài khoản ngân hàng cá nhân). **SePay KHÁC PayOS về bản
  chất:** không phải cổng trung gian, không giữ tiền, không có `checkoutUrl`, không redirect —
  chỉ theo dõi tài khoản ngân hàng và bắn webhook khi tiền về. Đã triển khai đúng mô hình đó:
  - **Schema:** migration `0014_plan_prices.sql` (bảng `plan_prices` — 3 chu kỳ `10day`/`month`/
    `year`, có `sale_price_vnd`/`sale_until` cho khuyến mãi dịp lễ sau này, ĐỘC LẬP với
    `promoUntil` sẵn có trong `app_settings` — trường đó là hạn mức lượt dùng, khác hẳn giá bán)
    · `0015_payments.sql` (bảng `payments`, UNIQUE `payment_code` + UNIQUE `provider_txn_id`
    chống trùng webhook ở TẦNG DB).
  - **Lib thuần (test kỹ, không đụng DB):** `api/_lib/prices.ts` (đọc giá + cache 30s + tính giá
    hiệu lực khi có khuyến mãi) · `api/_lib/sepay.ts` (sinh mã `ENVI` + 8 ký tự tránh nhầm
    0/O/1/I/L, dựng URL ảnh QR không gọi API ngoài, dò mã trong nội dung chuyển khoản không
    phân biệt hoa/thường, xác thực API Key bằng `timingSafeEqual`).
  - **API:** `GET /api/plan-prices` (công khai) · `POST /api/checkout` (tạo đơn, tự sinh mã, tự
    retry nếu trùng) · `POST /api/payment-webhook` (SePay gọi — chống trùng bằng
    `UPDATE ... WHERE status='pending'` + bắt lỗi `23505` cho ca hiếm hơn, kiểm tra đủ tiền mới
    cấp gói qua `grantPlanDays()` dùng chung, luôn trả `{"success":true}` khi đã xử lý xong để
    SePay không retry vô ích) · `GET /api/payment-status` (UI poll vì SePay không redirect) ·
    `GET /api/payment-history`.
  - **UI:** `UpgradeSection.tsx` trong `/profile` — chọn gói/chu kỳ → hiện QR + số tài khoản +
    nội dung chuyển khoản (nút sao chép) + đếm ngược 30 phút, tự poll tới khi `paid`. Ẩn hẳn nếu
    đã VIP.
  - **Test:** 40 test mới (unit thuần cho sepay/prices + handler-level cho 5 API), phủ đủ ca
    biên: sai khoá, tiền ra không liên quan, không khớp mã, thiếu tiền, webhook lặp, 2 webhook
    song song, UNIQUE violation, đúng số ngày theo từng chu kỳ.
  - **Còn lại là VIỆC TAY** (không phải code): đăng ký SePay + liên kết ngân hàng, điền
    `SEPAY_WEBHOOK_API_KEY`/`SEPAY_BANK_ACCOUNT`/`SEPAY_BANK_CODE` trên VPS, tạo webhook trỏ
    `/api/payment-webhook` + BẬT lọc tiền tố "ENVI", chạy `npm run migrate:pg` trước khi deploy,
    và nên chạy thử chuyển khoản thật số tiền nhỏ trước khi công bố rộng rãi.
  - Có đường xử lý tay cho ca người dùng gõ sai nội dung chuyển khoản (tiền vào nhưng không
    khớp đơn nào) — dùng `/api/admin-grant-plan` sẵn có, xem mục "Ca lệch" trong đặc tả.
  - Chi tiết đầy đủ: `docs/research/dac-ta-thanh-toan-2026-07-25.md`.
- **Đánh giá lại chi phí/hạn mức sau khi có giá bán thật (2026-07-27)** — phát hiện qua đọc
  code (không đoán): (1) `app_settings.promo_until` mặc định 2027-01-01 khiến `effectivePlan()`
  nâng MỌI gói lên 1 bậc — trong lúc bật, Pro/VIP nhận y hệt hạn mức + giọng, và Free được nâng
  lên hạn mức Pro. **Phải tắt khuyến mãi trong `/admin-settings` để giá bán mới có ý nghĩa.**
  (2) Giọng "Studio" ($24/1 triệu ký tự, KHÔNG có hạn mức miễn phí — đắt gấp 12 lần Chirp3-HD
  $2/1 triệu ký tự có 1 triệu miễn phí/tháng) đã **rút khỏi Pro, chỉ còn VIP**
  (`api/_lib/voiceAccess.ts`, `src/lib/voiceTiers.ts` — 2 nơi phải khớp tay, không share code
  api/↔src/). (3) Gói Free giới hạn còn 4 giọng (2 nữ Kore/Aoede + 2 nam Puck/Charon, đều đã
  seed sẵn nên phát ngay). Giá Google Cloud TTS xác nhận qua tài liệu thật, không suy đoán.
- **Hạn mức Pro/VIP đổi sang 1 số TỔNG lượt/ngày (2026-07-27, thay "5 số riêng theo chế độ")**
  — migration `0016_daily_total_limit.sql`: cột `app_settings.pro_daily_limit`/`vip_daily_limit`
  (mặc định Pro 30, VIP 300 — ĐÂY LÀ TỔNG, không nhân theo 5 chế độ) + hàm SQL
  `consume_usage_total` (SUM cả 5 cột `daily_usage` so với hạn mức, vẫn tăng đúng cột theo mode
  để giữ breakdown thống kê). Xoá 15 cột cũ (5 free đã CHẾT từ trước + 5 pro + 5 vip theo chế
  độ). `AdminLimitsPanel.tsx` viết lại: mỗi gói Pro/VIP chỉ còn 1 ô nhập, không còn hàng Free
  (Free không đọc `app_settings`, hiện ô đó chỉ gây hiểu nhầm).
- **Hạn mức Free đổi từ "tuần lịch" sang CỬA SỔ TRƯỢT 7 ngày liền kề thật (2026-07-27)** — quyết
  định chủ động để công bằng hơn với người học dồn cuối tuần (mô hình cũ 0012 reset cứng về 0
  mỗi thứ Hai, mất công tích luỹ nếu học nhiều vào thứ Bảy/Chủ nhật). Migration
  `0017_free_rolling_credit.sql`: bảng `free_daily_credit` (1 dòng/ngày/user, `bonus_earned` +
  `credits_spent`) + hàm `grant_daily_bonus_rolling`/`consume_rolling_credit`/
  `refund_rolling_credit` — "còn bao nhiêu lượt hôm nay" = tổng +5 nhận trong 7 ngày gần nhất
  trừ lượt đã dùng trong chính 7 ngày đó, trần tự nhiên vẫn 35 (không có cơ chế dồn bù ngày bỏ
  lỡ nên không cần cột cap riêng). `consume_rolling_credit` KHOÁ CÁC DÒNG trong cửa sổ bằng
  `SELECT ... FOR UPDATE` TRƯỚC rồi mới SUM (Postgres không cho `FOR UPDATE` cùng hàm gộp) —
  chống 2 request song song cùng đọc "còn lượt" rồi cùng trừ vượt quá số thật. Bảng
  `weekly_ai_credit` (0012) GIỮ NGUYÊN, không xoá — code đã ngừng đọc/ghi, dọn ở migration sau
  khi xác nhận mô hình mới chạy ổn trên production.
- **Giữ nguyên phiên bản:** Tailwind 3, ESLint 8 (`.eslintrc.cjs`) — không nâng v4/flat config.
- **Bundle-size budget (`size-limit`) thay Lighthouse CI** — Lighthouse không đo được trong môi
  trường sandbox/CI hiện có (`NO_FCP` ở mọi cấu hình). Cân nhắc lại nếu có runner thật sau này.
- **Zod validate input** đã rollout xong toàn bộ `api/*.ts` (đợt cuối `ai.ts`, dùng Zod v4).
- **Nhiều phiên làm việc có thể chạy song song** trên cùng repo — kiểm tra PR đang mở trên
  GitHub trước khi bắt đầu 1 kế hoạch lớn đã có sẵn trong `docs/research/`, tránh trùng công sức.
- **Gộp mọi script audio cache về 1 file `scripts/seed-all.ts` (2026-07-20, theo yêu cầu người
  dùng).** Trước đó có 3 script rời: `seed-all.ts` (seed nội dung), `sync-storage-to-r2.ts`
  (đẩy audio local → R2), `verify-r2-sync.ts` (đối chiếu R2 thật + xoá local an toàn). Đã gộp
  2 script sau vào `seed-all.ts` dưới dạng menu "s"/"v" (tương tác) hoặc cờ
  `--sync-r2`/`--verify-r2` (CI/cron) — xóa hẳn 2 file cũ + 2 dòng `package.json`
  (`sync:r2`/`verify:r2`). Không đổi logic bên trong (copy nguyên hàm, chỉ đổi tên biến/hàm
  tránh trùng namespace) — chưa tự chạy được trong sandbox này (không cài `node_modules`) nên
  CHỈ xác nhận bằng: không trùng định danh (grep), ngoặc cân bằng toàn file, và `prettier
--write` parse thành công không lỗi cú pháp. Cập nhật `docs/seed-guide.md` mục 5+7 +
  `docs/migration-thoat-ly-supabase.md` bước 7 theo lệnh mới. **Việc người dùng cần làm:** SSH
  VPS, `git pull`, thử `STORAGE_DRIVER=r2 npm run seed:all -- --sync-r2 --dry-run` xác nhận
  chạy đúng trước khi tin tưởng hoàn toàn (chưa test bằng máy thật).

- **Đợt tối ưu `scripts/seed-all.ts` — remap/verify/dọn orphan (2026-07-23→24, PR #308–#315,
  đã merge hết).** Từ thực tế chạy thật trên VPS (bảng `tts_cache` phình tới ~1,25 triệu dòng
  sau đợt mở rộng 14 giọng Chirp3-HD), phát hiện + sửa liền một mạch:
  - #308: `verifyDb()` từng coi câu pattern hợp lệ (đúng giọng/version, chỉ đơn giản ngoài
    top-N `seed-index.json`) là "orphan" → xoá nhầm cache còn dùng được; remap-only ("m")
    trước đó chỉ quét top-N nên cache giọng cũ của các câu ngoài top-N không bao giờ được
    remap. Sửa: bảo vệ hash pattern hợp lệ khỏi bị tính orphan + remap-only quét ĐỦ 100/100
    câu/chủ thể (remap không tốn API nên quét hết không sao) — seed thật (tốn phí) vẫn giữ
    nguyên top-N (mặc định 20/100, `TOP_N` khi chạy `npm run rank:patterns`).
  - #310: nhánh remap gọi `verifyDb()` quét lặp lại 2 lần tập hash pattern đầy đủ (~1,6
    triệu) → OOM. Thêm cờ `patternsAreFull` để bỏ bước quét dư thừa.
  - #311: log Postgres xác nhận VPS bị **restart ngoài ý muốn** (nghi cập nhật hệ điều hành
    tự động) giữa lúc script chạy hàng giờ → lỗi `57P01` làm crash toàn bộ tiến trình. Thêm
    `withDbRetry()` (backoff 1s/3s/8s) cho các vòng đọc/xoá dài.
  - #312: `cleanOrphans()` chạy im lặng suốt vòng xoá (có thể hàng trăm nghìn dòng) — thêm
    progress bar (`cli-progress`).
  - #313: vòng xoá orphan vốn TUẦN TỰ (1 dòng/lần, mỗi dòng 1 round-trip network) — đổi
    sang chạy song song có giới hạn (`DELETE_CONCURRENCY = 12`, khớp pool DB `max: 10`).
  - #314: `getR2Client()` tạo `S3Client` MỚI mỗi lần gọi (rò rỉ handle/socket) — cache lại 1
    instance dùng chung, sửa OOM khi xoá nhiều orphan liên tục.
  - #315: `fetchAllRows()` dùng LIMIT/OFFSET — mỗi trang phải quét & bỏ qua toàn bộ dòng
    trước đó (O(n²)), ở bảng >1 triệu dòng thành "treo" thật sự. Đổi sang **keyset
    pagination** (`where (khóa) > khóa_cuối`, dùng index). Đồng thời `verifyDb()` từng gom
    CẢ bảng `tts_cache` (kèm `audio_url`) vào 1 mảng trong RAM cùng lúc với nhiều Set lớn —
    đổi sang **stream từng trang** (`streamRows()`), bỏ hẳn mảng đầy đủ.
  - Kết quả người dùng xác nhận: hết treo, hết OOM, tốc độ xoá orphan "cải thiện rất nhanh".

## Sự cố hạ tầng đã xử lý (post-mortem ngắn)

- 🟢 **[2026-08-30 16:20 UTC → 2026-09-02 ~03:00 UTC, ĐÃ XỬ LÝ] VPS mất kết nối outbound tới
  GitHub — auto-deploy fail liên tục ~34 giờ, production đứng ở code cũ.**

  **Phát hiện:** kiểm tra thủ công workflow `Deploy to VPS` (`.github/workflows/deploy.yml`)
  thấy **toàn bộ ≥30 lần chạy liên tiếp** đều `failure`/`cancelled` kể từ lần thành công gần
  nhất (`2026-08-30T16:20:50Z`) — bao gồm cả lần chạy ngay sau khi merge PR #807. App (`pm2`/
  `/api/health`) không bị ảnh hưởng vì runtime không cần gọi GitHub — chỉ đường **deploy** đứt.

  **Log lỗi thấy được (2 dạng xen kẽ, cùng gốc mạng phía VPS):**
  - `dial tcp <VPS_IP>:22: i/o timeout` — Actions không SSH vào được VPS.
  - `fatal: unable to access 'https://github.com/...': Failed to connect to github.com port 443
... Couldn't connect to server` — SSH vào được nhưng VPS không ra được Internet để
    `git fetch`.

  **Nguyên nhân gốc:** sự cố mạng phía **nhà cung cấp VPS** (không phải do cấu hình DNS/
  firewall/iptables trên VPS — đã loại trừ qua checklist chẩn đoán SSH). Tự phục hồi/được xử lý
  ở tầng hạ tầng, không cần đổi code hay cấu hình trong repo.

  **Xác minh đã khôi phục:** run deploy `33584562143` (commit `4551ba6c` = PR #807) chuyển từ
  `failure` sang `success` sau khi người dùng chạy lại; các lần deploy kế tiếp lên xanh bình
  thường.

  **Bài học:** `deploy.yml` hiện KHÔNG có cảnh báo khi fail liên tiếp nhiều lần — sự cố này bị
  phát hiện muộn (thủ công, không phải qua thông báo tự động). Cân nhắc thêm bước báo (ví dụ
  comment/issue tự động) khi 2-3 lần deploy liên tiếp fail, để không phải chờ ai đó chủ động rà
  Actions mới biết production bị "đứng" so với `main`. Chưa làm — để mở nếu thấy cần.

## Nợ kỹ thuật còn mở

> Mục này CHỈ giữ nợ **đang mở** (🟡/🔴). Nợ đã đóng (🟢) được dời sang
> `docs/legacy/no-ky-thuat-da-dong.md` (2026-09-01) để file này chỉ nói trạng thái hiện tại —
> đúng vai trò ở mục 2 `CLAUDE.md`. Đóng một món nợ = cắt khối đó dán sang file kia, kèm ngày.

- 🟡 **[2026-08-28] Repo có HAI file cấu hình Nginx mô tả cùng một server.** `nginx/dhcb.conf`
  tự nhận là "cấu hình ĐANG CHẠY THẬT trên VPS", trong khi `docs/cloudflare-setup.md` và
  `docs/runbook-dung-vps-moi-tu-dau.md` lại hướng dẫn copy `nginx/en-vi.conf`. Không biết bản
  nào mới là bản trên VPS thì mọi thay đổi Nginx đều là đoán. Đợt thêm `hub.donghanhcungban.org`
  (changelog 0191) đã sửa CẢ HAI cho khớp, nhưng đó là chữa triệu chứng. Việc cần làm: SSH lên
  VPS đọc `/etc/nginx/sites-enabled/`, giữ đúng một file trong repo, xoá file kia và sửa tài
  liệu trỏ theo.
- 🟡 **[2026-08-28 — rà UI/UX 5 trang trụ cột, xem `docs/changelog/0186-*.md`] Ba việc còn để
  ngỏ, cần người dùng quyết hoặc tách đợt riêng.**

  1. **`Career.tsx` vẫn hỏi "Số năm kinh nghiệm"** — mâu thuẫn với
     `docs/research/dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md`, vốn chốt thay thước đo
     đó bằng **thang 5 bậc thành thạo**; chính trang này đã có `PROFICIENCY_BAND` rồi, nên hai
     thước đo mâu thuẫn đang sống song song. **Cần người dùng xác nhận** là cố ý hay sót —
     đổi thước đo là quyết định sản phẩm, không phải việc dọn UI.
  2. ~~**`Work.tsx`/`Life.tsx` đặt `<Layout>` ở CUỐI JSX** (Career/Startup đặt ở đầu)~~ — ✅
     **KHÔNG CÒN, đo lại 2026-09-03:** cả bốn file nay đều đặt `<Layout>` ở CUỐI, đã nhất quán
     (Career 966/970 · Startup 973/977 · Work 997/1001 · Life 992/996 — dòng/tổng dòng).
  3. ~~**`components/FeedbackModal.tsx` thiếu Escape + bẫy tiêu điểm**~~ — ✅ **ĐÃ XONG, đo lại
     2026-09-03:** file nay dùng hook `useDialogBehavior` (đủ 6 hành vi hộp thoại: Escape, bẫy
     tiêu điểm, trả tiêu điểm khi đóng, khoá cuộn nền…), giữ nguyên bố cục riêng đúng như lo
     ngại ban đầu. Hook đó trước đây **không có test nào**; PR đợt này bổ sung 11 test canh cả
     6 hành vi (`useDialogBehavior.test.tsx`) — xem `docs/changelog/0254-*.md`.

  Ngoài ra: **4 trang trụ Career/Work/Startup/Life vẫn chưa có bản chiều B** (0/4 file dùng
  `direction`, toàn bộ chuỗi hardcode tiếng Việt) — cùng loại nợ với mục ngay dưới đây.

- 🟡 **[2026-08-26 — NỢ CÓ CHỦ ĐÍCH, người dùng chốt] Hai tính năng mới CHƯA có bản chiều B**
  (người nước ngoài học tiếng Việt). Người dùng xác nhận: "chiều A là ok rồi, chiều B nợ".

  **Đang thiếu gì.** Cả hai tính năng ra mắt 2026-08-26 mới có tiếng Việt:

  | Tính năng                 | Trạng thái chiều B                                                                                                  |
  | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
  | Người thân theo dõi       | Khối trong Hồ sơ **ẩn hẳn** khi `isA === false` (`Profile.tsx`); nội dung thư chỉ có tiếng Việt (`weeklyReport.ts`) |
  | Chế độ ôn thi (`/on-thi`) | Trang **hiện nhưng toàn chữ tiếng Việt**; kỳ thi "vào lớp 10 — Tiếng Anh" cũng không hợp với người học chiều B      |

  **Vì sao chọn nợ thay vì làm dở.** Hiện chuỗi ở chiều B sẽ cho ra màn hình nửa Việt nửa Anh —
  tệ hơn là chưa có. Riêng chế độ ôn thi còn cần một **kỳ thi khác** (người nước ngoài học tiếng
  Việt thi VSTEP/chứng chỉ tiếng Việt, không thi vào lớp 10), tức là việc nội dung chứ không chỉ
  việc dịch.

  **Việc phải làm khi trả nợ:**

  1. `apps/server/src/api/_lib/weeklyReport.ts` — tách chuỗi theo `direction`, thêm bộ câu gợi ý
     tiếng Anh; contract `WeeklyReportData` phải thêm `direction` để `weeklyReportService.ts`
     biết chọn bản nào (hiện chưa có trường này).
  2. `apps/dhcb/src/components/CompanionLinkSection.tsx` — thêm prop `isA` như `ReferralSection`,
     bỏ điều kiện `{isA && ...}` ở `Profile.tsx`.
  3. `apps/dhcb/src/pages/learning/ExamPlan.tsx` + `apps/dhcb/src/lib/examPlan.ts` — chuỗi song
     ngữ, và mở `ExamKindSchema` (`packages/core-contracts/examPlan.ts`) cho kỳ thi của chiều B
     kèm phạm vi từ vựng tương ứng.
  4. Nới hai cổng a11y (`e2e/a11y-companion-link.spec.ts`, `e2e/a11y-exam-plan.spec.ts`) sang
     `uiLang: 'en'` — `mockLogin` đã nhận tham số này sẵn.

  **Điều kiện gỡ nợ:** cả hai tính năng chạy được ở `direction === 'B'` với 0 chuỗi tiếng Việt
  lọt ra, và hai cổng a11y xanh ở cả hai ngôn ngữ giao diện.

- 🟡 **[2026-08-26 — HẠ MỨC sau khi chẩn đoán; ban đầu ghi 🔴 là ĐÁNH GIÁ QUÁ NẶNG] Redis rớt
  kết nối 7 lần/ngày, mỗi lần DƯỚI MỘT GIÂY.** `pm2 logs dhcb --err` cho thấy 7 cặp log
  (00:03 · 00:27 · 02:50 · 03:41 · 04:37 · 05:28 · 08:03), mỗi cặp là "Redis lỗi (Stream isn't
  writeable…)" rồi "Redis đã hoạt động trở lại".

  **Vì sao hạ từ 🔴 xuống 🟡:** hai dòng của mỗi cặp có **CÙNG dấu thời gian đến giây**
  (`00:03:51` cho cả hai). Gián đoạn dưới 1 giây, 7 lần/ngày ⇒ cửa sổ rate limit lỏng chỉ vài
  mili giây, không ai khai thác được. Lần ghi đầu gắn 🔴 dựa trên giả định ngầm rằng gián đoạn
  kéo dài — **không kiểm dấu thời gian trước khi gắn nhãn**. Ghi lại lỗi suy luận này vì nó
  đúng loại sai mà quy trình audit sinh ra để bắt.

  **BỐN giả thuyết đã bị bác bỏ bằng số đo thật — đừng đi lại đường cũ:**

  | Giả thuyết                 | Số đo                                          | Kết luận                            |
  | -------------------------- | ---------------------------------------------- | ----------------------------------- |
  | Redis đóng client nhàn rỗi | `timeout 0`                                    | ❌ Redis không bao giờ đóng vì idle |
  | Redis bị khởi động lại     | `uptime_in_seconds: 232420` (2,7 ngày)         | ❌ không restart                    |
  | Chạm `maxclients`          | `rejected_connections: 0`, `maxclients: 10000` | ❌                                  |
  | `REDIS_URL` sai định dạng  | có dấu hai chấm, đúng chuẩn `redis://:pass@`   | ❌                                  |
  | Trùng job cron             | cron chạy 3:05/3:10/3:15 + 0:00/12:00          | ❌ chỉ 1/7 mốc gần trùng            |

  **Manh mối còn lại, chưa đủ kết luận:** `connected_clients: 2` trong khi có 3 instance PM2
  (kết nối tạo lazy nên có thể chỉ phản ánh lúc vừa reload); và khoảng cách giữa các lần rớt có
  nhịp 51 → 56 → 51 phút không thuộc cron nào.

  **Mốc theo dõi, KHÔNG vá vội:** VPS mới có swap từ 2026-08-26. Giả thuyết còn sống là máy bị
  áp lực bộ nhớ khiến tiến trình đình trệ, không đáp TCP keepalive (`tcp-keepalive 300`) nên
  Redis ngắt. Nếu vậy thì swap đã xử lý gián tiếp. **Đọc lại `pm2 logs dhcb --err` sau vài
  ngày:** còn đúng ~7 lần/ngày ⇒ nguyên nhân nằm chỗ khác, đào tiếp; giảm hẳn ⇒ đóng nợ.

  **Nếu phải vá:** KHÔNG đảo `enableOfflineQueue: false` (đặt có chủ đích để rate limit không
  treo request khi Redis chết). Ứng viên hợp lý là nới `connectTimeout` (đang 2000ms) — nhưng
  chỉ khi có bằng chứng, không theo linh cảm.

- 🟡 **[ĐO LẠI 2026-08-26 — nợ này ĐÃ THU HẸP, không còn đúng như mô tả cũ] Chỉ COVERAGE còn
  mỏng; ngân sách BUNDLE nay rộng.**

  **[Đo lại 2026-09-01, đợt tối ưu dự án]** Trước đợt: JS 127,36 / 140 kB · CSS **17,00 / 18 kB
  (còn đúng 1 kB — PR #797 thêm keyframes/utility)** · branches **90,19%** (còn 0,19 điểm).
  Sau đợt: JS 127,26 kB (chunk `lessons` 3 MB của môn Lập trình đã tách thành 153 chunk theo
  unit, nạp lười; `programmingRoutes` 48 kB gzip → 0,5 kB) · branches **90,67%** (còn 0,67 điểm) nhờ test
  `progressSync.ts` (74 → 92%) + `co-learning-audio.ts`. CSS KHÔNG đổi — vẫn là biên độ mỏng nhất, thêm animation/theme
  mới là phải rà `tailwind.config.js` trước. Chạy `npm run budget` để xem số hiện tại. Số đo thật hôm nay trên `main` (chạy `npm ci` sạch rồi
  `npm run build`):

  | Ngân sách            | Số thật   | Ngưỡng | Biên độ          |
  | -------------------- | --------- | ------ | ---------------- |
  | Initial JS (brotli)  | 124,83 kB | 140 kB | dư **~10,8%**    |
  | Initial CSS (brotli) | 16,23 kB  | 18 kB  | dư **~9,8%**     |
  | Coverage branches    | 90,54%    | 90%    | dư **0,54 điểm** |

  **[Đo lại 2026-09-02] CSS đã hết mỏng — NỚI ngưỡng 18→20 kB, phần bundle của nợ này ĐÓNG.**
  Rà lại: `dist/assets/index-*.css` đã qua Tailwind v3 JIT purge đúng (không safelist thừa,
  không class chết) — không có "rác" thật để cắt mà không đụng nhiều file UI (đổi số class dùng
  trong component, rủi ro phá giao diện). Ngưỡng 18 kB là tự đặt, không phải giới hạn kỹ thuật,
  nên chọn nới thay vì cắt CSS đang dùng. Sửa `.size-limit.json` (CSS 18→20 kB). Số đo lại trên
  `main` sau khi sửa (`npm ci && npm run build && npm run budget`):

  | Ngân sách            | Số thật   | Ngưỡng | Biên độ      |
  | -------------------- | --------- | ------ | ------------ |
  | Initial JS (brotli)  | 127,26 kB | 140 kB | dư **~9,1%** |
  | Initial CSS (brotli) | 17,00 kB  | 20 kB  | dư **~15%**  |

  Coverage branches (90,67% / dư 0,67 điểm) vẫn mỏng, chưa đóng — xem khối riêng phía trên.

  **[Đo lại 2026-08-27, sau PR-M7]** Ba con số trên là bản mới nhất. Đợt PR-M7 là ca thực tế
  đầu tiên nợ này bật ra: bộ chạy Kotlin (~4.000 dòng nguồn) làm branches tụt xuống **88,75%**
  — CI sẽ đỏ. Đã trả bằng cách **viết thêm test chứ không nâng ngưỡng** (hai file mới phủ bề
  mặt thư viện và đường lỗi), kéo lên 90,29%. Bài học: PR nào thêm một khối mã lớn thì phải
  **đo coverage TRƯỚC khi mở PR**, đừng đợi CI báo.

  **Phần bundle của nợ này coi như đóng.** Con số "99,7%" ghi ngày 2026-08-25 đã lạc hậu: ngưỡng
  JS được nới 123 → 140 kB và CSS 16 → 18 kB ở các PR sau đó, mà mục nợ không ai cập nhật. Đây
  đúng loại lệch mà Tầng 6b của quy trình audit sinh ra để bắt — tài liệu điều hành nói một
  đằng, số thật một nẻo — nên ghi lại để lần sau đo trước khi tin.

  **[Đo lại 2026-08-28] Phần coverage đã NỚI GẤP ĐÔI, chưa đóng.** Biên độ branches từ 0,27 lên
  **0,54 điểm** (90,27 → 90,54%) nhờ 90 test bù cho `kotlinSim`/`swiftSim`/`mistakes.ts` —
  xem `docs/changelog/0187-2026-08-28-super-kotlin-va-bien-do-coverage.md`. Đợt đó cũng bắt ra
  một lỗi thật nhờ đi tìm nhánh thiếu test (`super.f()` gọi vòng vô tận làm sập bộ chạy Kotlin),
  tức bản thân việc vá coverage có giá trị chứ không chỉ là làm đẹp con số. Vẫn còn mỏng: nửa
  điểm là đủ để một PR thêm khối mã lớn mà quên test làm CI đỏ.

  **[Đo lại 2026-08-31, sau loạt "thiết kế lại web cho desktop" PR #743/#750/#756] Bundle ăn
  bớt biên độ, coverage chưa đo lại.** `npm run build && npm run budget` trên `main` sau khi cả
  3 PR merge:

  | Ngân sách            | Số thật   | Ngưỡng | Biên độ      |
  | -------------------- | --------- | ------ | ------------ |
  | Initial JS (brotli)  | 126,60 kB | 140 kB | dư **~9,6%** |
  | Initial CSS (brotli) | 16,53 kB  | 18 kB  | dư **~8,2%** |

  So với lượt đo 2026-08-28 (JS dư ~10,8%, CSS dư ~9,8%), cả hai đều hẹp lại — sidebar desktop
  thu gọn được + cột "Sửa lỗi & giải thích" ở Chat + `useIsDesktopViewport` là phần thêm mới ăn
  vào biên độ. Vẫn còn dư, không chặn CI, nhưng CSS chỉ còn dư dưới 10% — PR sau thêm CSS diện
  rộng (nhiều `lg:`/`xl:` mới) nên đo `npm run budget` TRƯỚC khi mở PR, đừng đợi CI báo. Chưa
  chạy lại `npm run test:coverage` trong đợt này (đổi UI, không đổi nhánh logic mới).

  **Đo lại bất cứ lúc nào:** `npm run build && npm run test:coverage && npm run budget`
  (`scripts/check-budget-margin.ts`, thêm ở PR #664 — in biên độ còn lại thành số, cảnh báo khi
  bundle ≥95% ngân sách hoặc coverage dư <1 điểm).

  **Điều kiện gỡ nợ — chọn một, KHÔNG lặng lẽ nâng ngưỡng:** (a) giảm bundle thật
  (code-splitting thêm, bỏ dependency eager) và bổ sung test cho các file nhánh phủ thấp
  (`geminiLiveService.ts` 14 nhánh thiếu · `co-learning-audio.ts` 12 · `neuroAffectiveService.ts`
  8 · `redisChat.ts` 8); hoặc (b) nâng ngưỡng CÓ CHỦ ĐÍCH kèm lý do ghi vào chính mục này.

- 🟡 **[2026-08-25] Tầng 8 (Core Web Vitals) và Tầng 9 (vận hành production) CHƯA kiểm được
  trong lượt audit toàn diện 2026-08-25.** Proxy của container chặn
  `en-vi.donghanhcungban.org` (403 CONNECT tunnel). Hai tầng này được ghi **TRỐNG**, không chấm
  đạt — một lượt audit thiếu 2/13 tầng thì không được coi là đã phủ hết.

  **Điều kiện gỡ nợ:** từ máy có mạng tới server — chạy Lighthouse trên trang chủ + Dictionary +
  1 trang CEFR (ngân sách LCP ≤ 2,5s · INP ≤ 200ms · CLS ≤ 0,1), và đọc Sentry (lỗi mới chưa
  xem xét) + `pm2 logs`/số lần restart + dung lượng ổ đĩa.

- 🟡 **[2026-08-26] Dải nhiễu của eval rộng hơn mức một PR có thể phân biệt được.** Hai lượt
  chạy liên tiếp, cùng prompt · model · bộ đề · `--delay`, cách nhau vài phút: FP-rate 0% →
  5,6%, specificity 100% → 94,4%, Type-hit 86,0% → 76,7%. Chỉ MỘT câu đổi phán đoán
  (`edge-05`: TN → FP) đã làm FP-rate nhảy 5,6 điểm, vì mẫu số chỉ có 18 câu đúng/ca biên.

  Hệ quả: luật "recall/precision không được tụt" ở `CLAUDE.md` mục 8 hiện **không phân biệt
  được** một prompt tệ đi 5 điểm với nhiễu lấy mẫu — cả hai trông giống hệt nhau. Dải nhiễu và
  cách đọc đã ghi vào cuối `docs/research/eval-tutor-baseline.md` (chênh ≤ 1 câu không phải
  bằng chứng; nghi ngờ thì chạy ≥ 3 lượt so trung bình; Type-hit không dùng pass/fail; chỉ số
  đáng tin nhất là recall theo từng nhóm lỗi).

  **Cách chữa thật** là mở rộng golden set — nhất là nhóm câu đúng/ca biên, hiện chỉ 18 câu —
  chứ không phải chạy đi chạy lại cùng 62 câu. Chưa làm vì cần soạn fixture mới có đối chiếu.

  **Rủi ro nếu để lâu:** Gemini là fallback THỨ 3 trong chat (sau Groq, Anthropic) — sự cố chỉ lộ
  ra khi cả hai provider chính cùng lúc gặp vấn đề, tức âm thầm mất một lớp dự phòng mà không ai
  biết cho tới khi cần đến nó.

- 🟡 **[2026-08-23] MÃ HOÁ DỮ LIỆU NGƯỜI DÙNG — ĐÃ BẬT cho dữ liệu MỚI; còn nợ dữ liệu CŨ.**
  _(Cập nhật cùng ngày: người dùng đảo quyết định — "phải mã hoá dữ liệu người dùng". Secret 2FA
  đã mã hoá thật ngay từ bản đầu, không có giai đoạn plaintext. Phần còn nợ là **viết lại dữ liệu
  CŨ đang có** — tên, email, tiến độ — vốn rủi ro cao vì đụng dữ liệu thật; và **người dùng vẫn
  cần chốt nơi cất khoá gốc**, hướng dẫn ở `docs/van-hanh-khoa-ma-hoa.md`.)_ Hạ tầng
  **đã dựng xong và có test** (`packages/core-config/userDataCrypto.ts`, 18 test: AES-256-GCM,
  khoá mỗi người suy ra bằng `HMAC(USER_DATA_MASTER_KEY, user_id)`, chuỗi tự mô tả
  `v<n>:<iv>:<cipher>`, IV luôn ngẫu nhiên, `keyVersion` sẵn từ bản đầu, `isEncryptedField()` cho
  phép chuyển đổi dần, `hashLookupValue()` cho cột cần tra cứu). **Nhưng CHƯA nối vào bất kỳ dữ
  liệu nào** — module hiện đang NGỦ, không chỗ nào gọi, không ảnh hưởng gì đang chạy.

  **Việc còn lại + câu hỏi chưa có đáp án — **cất khoá gốc `USER_DATA_MASTER_KEY` ở đâu?** Khoá phải nằm KHÁC chỗ với backup DB (cất chung thì mã hoá vô
  nghĩa: ai lấy được backup lấy luôn khoá), mà **mất khoá = mất vĩnh viễn toàn bộ dữ liệu đã mã
  hoá, không có đường khôi phục\*\*. Bật mã hoá khi chưa chốt chỗ cất khoá là tự tạo rủi ro mất dữ
  liệu lớn hơn rủi ro nó định phòng.

  **Điều kiện gỡ nợ:** người dùng chốt nơi cất + cách sao lưu khoá gốc. Xong việc đó thì làm theo
  thứ tự ở `docs/research/dac-ta-ma-hoa-du-lieu-va-2fa-2026-08-23.md` mục 6:
  **S-3 trước** (mã hoá dữ liệu MỚI — gần như miễn phí vì dữ liệu chưa tồn tại), **S-4 sau và
  cân nhắc kỹ** (mã hoá dữ liệu CŨ — đụng dữ liệu thật của người dùng đang hoạt động, rủi ro cao).

  **Rủi ro đang chấp nhận trong lúc ghi nợ:** bản dump PostgreSQL và file backup trên Cloudflare R2
  vẫn là **plaintext** — lộ khoá R2 là lộ dữ liệu người dùng. Đây là lý do món nợ này không nên để
  quá lâu. Giảm nhẹ tạm thời: siết quyền truy cập khoá R2 và rà lại ai đang giữ nó.

  **Hệ quả cần biết khi làm tiếp tính năng:** hồ sơ năng lực ẩn và câu trả lời tự do (câu 3–4 của
  luồng người mới) là dữ liệu tầng T2 — theo đặc tả thì phải mã hoá. Nếu làm **C1b-2** (màn 5 câu)
  trước khi gỡ nợ này, dữ liệu đó sẽ nằm plaintext. Hai lựa chọn khi tới đó: ① chấp nhận plaintext
  tạm rồi mã hoá sau (module đã sẵn, chỉ cần thêm 1 biến môi trường + viết lại dữ liệu), hoặc
  ② hoãn C1b-2, làm **S-1 (2FA TOTP)** trước — 2FA độc lập hoàn toàn với mã hoá và không bị chặn
  bởi câu hỏi khoá gốc.

- 🟡 **[2026-08-21] Gemini Live — đã thay code GIẢ bằng kết nối WebSocket THẬT, nhưng CHƯA test
  với API key thật.** Nhánh `claude/gemini-live-integration-xo175x` trước đó (commit `cf44362`
  "feat: implement horizon features and stress test suite") đã có sẵn một bộ khung lớn (~4100
  dòng: `packages/core-ai/geminiLiveService.ts`, `wsGeminiLiveHandler.ts`, `api/gemini-live.ts`,
  contract `packages/core-contracts/geminiLive.ts`, hook `apps/english/src/lib/geminiLiveApi.ts`,
  đã gắn vào `server.ts` chạy thật) — nhưng khi đọc kỹ, `geminiLiveService.ts` **không hề gọi API
  Gemini thật**: mỗi 20 audio chunk người dùng gửi lên, code chỉ **echo ngược chính audio đó** giả
  làm phản hồi AI. Đã sửa `packages/core-ai/geminiLiveService.ts` để **thật sự mở WebSocket** tới
  `wss://generativelanguage.googleapis.com/.../BidiGenerateContent` (đọc `docs/research/dac-ta-gemini-live-2026-08-21.md`
  để biết bối cảnh — chọn Phương án C: Live chỉ cho phần hội thoại, giữ pipeline STT/LLM/TTS cũ
  cho phần sửa lỗi 2 giọng). Đã verify: test đơn vị (mock `ws` qua `_setWebSocketFactoryForTests`,
  6/6 pass), `npm test` toàn bộ 5019/5019 pass, build/typecheck/lint xanh. **CHƯA verify được** với
  `GEMINI_API_KEY` thật (sandbox không có key) — trước khi dùng thật cần: (1) thêm
  `GEMINI_API_KEY` vào `.env`, (2) xác nhận model Live khả dụng qua `GEMINI_LIVE_MODEL` (mặc định
  `gemini-2.0-flash-exp`, Google hay đổi tên/khả dụng model Live), (3) thử 1 phiên thật qua
  `/ws/gemini-live`, (4) audit lại các file "V6.x/V7.0" khác cùng thời điểm với `cf44362` xem có
  scaffolding giả tương tự không (chưa rà — người dùng đã được báo, quyết định xử lý riêng sau).
- ~~🟡~~ **[2026-08-18, cập nhật khi fix PR #603] `eslint-plugin-react-hooks` đã ghim TẠM về lại
  `^4.6.2`** (đúng bản trước PR #574) để CI/lint xanh trở lại ngay — bản `7.1.1` mà PR #574 bump
  lên mang theo 5 rule React Compiler mới, làm lộ **73 lỗi trải trên 45+ file**: `set-state-in-effect`
  (48 lỗi — vd `Work.tsx:103`, `WorkKanban.tsx:53`, `packages/core-ui/ThemeProvider.tsx:36`, phần
  lớn các trang `useEffect(() => { loadData() }, [loadData])`), `purity` (10), `exhaustive-deps`
  (10), `immutability` (8), `static-components` (3). Việc còn lại: **mở PR riêng** để (1) nâng lại
  `eslint-plugin-react-hooks` lên `^7.x`, (2) sửa đúng 73 lỗi theo từng rule (không chỉ thêm
  `eslint-disable`) — có thời gian review kỹ vì đụng logic hook ở nhiều trang/component cùng lúc.
  Danh sách file/line đầy đủ: chạy lại `npm run lint` sau khi bump plugin để lấy danh sách mới nhất
  (số dòng có thể lệch do code đã đổi).
- **[Rà soát Dependabot 2026-08-16] Xử lý 9 PR dependency tồn đọng (#550-559): merge 6, đóng 3.**
  Merge (đều CI xanh thật, chỉ thiếu heading PR template nên `metadata` báo sai): `actions/
setup-node` 4→7 (#550), `actions/upload-artifact` 4→7 (#551), `actions/github-script` 7→9 (#552),
  `actions/checkout` 4→7 (#553), nhóm `production-patch` (`jose` 6.2.4→6.2.8, `nodemailer`
  9.0.3→9.0.5, #556), `@sentry/react` 10.63.0→10.70.0 (#558). **Đóng KHÔNG merge** 3 PR có vấn đề
  thật, không phải lỗi CI vặt:
  - **#559 TypeScript 5.9.3→7.0.2** — vi phạm trực tiếp chính sách ghim phiên bản CLAUDE.md mục 6
    ("KHÔNG nâng ... TS"). Đóng ngay, không cần điều tra thêm.
  - **#555 nhóm dev-deps (13 gói)** — `npm ci` fail thật: `eslint-plugin-react-refresh@0.5.4` đòi
    `eslint@^9||^10`, dự án ghim ESLint 8 có chủ đích (chưa chuyển flat config). Không giải được
    mà không nâng ESLint major (cũng bị cấm). Đóng, để dependabot tách PR khác nếu muốn cập nhật
    12 gói còn lại riêng.
  - **#557 vitest 3.2.6→4.1.10** — `npm ci` fail thật: thiếu bump kèm `@vitest/coverage-v8` (vẫn
    ghim `^3.2.6`) → ERESOLVE. Ngoài lỗi kỹ thuật, đây là major bump test runner đang chạy 3415
    test — rủi ro cao, không tự merge dù sửa được xung đột peer. Để owner quyết định thời điểm
    nâng cấp (cần bump đồng thời coverage-v8 + review breaking changes changelog v4).
    Sau đợt xử lý: `rm -rf node_modules && npm ci` sạch, build ✅ typecheck ✅ lint 0 cảnh báo ✅ test
    **3415/3415** ✅ (208 file), `npm audit` **0 lỗ hổng**.

- **[Rà soát tự động 2026-08-09] `npm audit` VỀ 0 LỖ HỔNG lần đầu tiên — mục react-router ở dưới
  ĐÃ ĐÓNG (không còn là nợ), cộng thêm vá 2 advisory mới phát sinh.** Container mới (chưa có
  `node_modules`) → `npm ci` sạch rồi chạy đủ cổng: build ✅ · typecheck ✅ (4 tsconfig) · lint ✅
  (0 cảnh báo) · test ✅ (**164 file / 2982 test**). Không có lỗi type/lint/test nào trong code.
  - **Tin quan trọng: advisory react-router `GHSA-qwww-vcr4-c8h2` đã được GitHub cập nhật ngày
    2026-08-07, NARROW dải ảnh hưởng xuống `>=7.12.0 <7.18.2`** (trước đó ghi "chưa có bản vá nào
    trong dòng 7.x", xem quyết định 2026-08-03 ở dưới) — nghĩa là **`7.18.2` (bản dự án đang dùng
    sẵn) chính là bản đã vá**, không cần đổi gì. Xác nhận qua `npm ls react-router-dom` (đúng
    `7.18.2`) + `npm audit` không còn liệt kê react-router. **Mục "giữ nguyên v7.18.2, chấp nhận
    báo 2 dòng high dài hạn" ở quyết định 2026-08-03 nay LỖI THỜI — đã đóng, không phải chờ nâng
    React 19 như dự tính.**
  - `npm audit` phát sinh **2 advisory mới** (khác hẳn react-router, do hệ sinh thái cập nhật từ
    2026-08-03 tới nay): `js-yaml` 4.0.0–4.3.0 (`GHSA-5p4m-2wfm-xmqj`, quadratic CPU qua `!!omap`)
    nguồn `eslint`/`@commitlint/cli → cosmiconfig`, và `nanoid` `<3.3.17` (`GHSA-2v37-7h3g-55p8`,
    vòng lặp vô hạn khi `size=0`) nguồn `postcss`. Cả hai đều **thuần devDependency** (lint/build
    time), không vào bundle chạy cho người dùng cuối. `npm audit fix` mặc định kéo theo cả loạt
    gói optional platform (`@esbuild/*`, `@img/sharp-libvips-*`) không liên quan — thay vào đó
    thêm `overrides` trong `package.json` (`js-yaml` `^4.3.1`, `nanoid` `^3.3.18`) rồi `npm
install`, chỉ đổi 2 dòng version trong `package-lock.json`. Xác nhận lại `npm audit`: **0 lỗ
    hổng** (`prod` 239 · `dev` 551 · `optional` 83, tổng 790 gói). Đã chạy lại đủ 4 cổng
    (build/typecheck/lint/test) sau khi đổi, vẫn xanh 100%.
  - Đã sửa `.claude/report-status.sh` mục nợ #1 (không còn ghi "2 dòng high react-router báo lâu
    dài" — đã đóng) để phiên sau không đọc phải thông tin lỗi thời.
  - PR trước của nhánh này (#525) đã merge & xoá nhánh remote trước khi phiên này bắt đầu — theo
    đúng quy ước "tạo PR = coi như đã xong" (CLAUDE.md mục 3): nhánh `claude/jolly-mendel-h56pdm`
    khởi động lại từ `origin/main` (lúc đó trùng khớp HEAD, không có commit lạc), coi lượt này là
    chu kỳ mới trên cùng tên nhánh.

- **[2026-08-04] Luật a11y mới + ĐÃ TRẢ HẾT nợ tương phản AAA.** Luật (CLAUDE.md mục 4.5, theo
  khuyến nghị W3C _Understanding Conformance_): **nội dung & tiêu đề đạt AAA (≥ 7:1)**, **mọi phần
  còn lại đạt AA**. Hai cổng E2E chặn CI, cả hai TUYỆT ĐỐI (không còn baseline):
  - `e2e/a11y.spec.ts` — 0 vi phạm A/AA ở MỌI mức tác động (trước chỉ chặn critical + serious mới),
    thêm tag `wcag22aa`, mở rộng **cả 5 theme** cho mọi trang + trang đăng nhập. 122 test xanh.
  - `e2e/a11y-aaa.spec.ts` (mới) — 15 trang × 5 theme, lọc riêng phần tử nội dung/tiêu đề. 75 test xanh.
  - Nợ tương phản AAA ban đầu **~305 phần tử** (Pink 115 · Nhi đồng 115 · Rực rỡ 48 · Blue sky 26 ·
    Xanh đêm 1) đã **xử lý xong**: gốc rễ chỉ là 2 token `--z-300`/`--z-400` (`text-zinc-300/400`)
    của từng theme trong `apps/english/src/index.css` — chỉnh sắc độ cho đạt 7:1 trên nền sáng nhất
    (theme sáng) / tối nhất (theme tối) là hết. Giá trị mới: dark-blue z-400 `158 173 191` ·
    blue-sky z-400 `64 78 96` · pink z-300 `82 68 76` z-400 `89 75 83` · vibrant z-400
    `190 172 216` · kid z-300 `98 72 45` z-400 `101 75 48`.
- **[2026-08-04] 3 lỗi AA THẬT do cổng siết + quét đủ 5 theme phát hiện (đã sửa):**
  1. 4 nút vote 👍/👎 (Chat, Speaking) rớt `target-size` (WCAG 2.2 AA 2.5.8) → `tap-44` → `h-11 w-11`.
  2. Nút hiện/ẩn mật khẩu ở `/login` chỉ 20×20px → `h-8 w-8` (32px, nằm gọn trong `pr-11` của ô nhập).
  3. **Nặng nhất:** 3 nút OAuth (Facebook/Apple/Microsoft) ở `/login` dùng `text-white` — mà `white`
     map sang token `--c-white`, ở theme nền sáng token này bị ĐẢO thành màu tối → chữ tối trên nền
     thương hiệu tối, tương phản chỉ **1.17–1.33:1**, gần như không đọc được với người dùng theme
     Blue sky/Pink/Nhi đồng. Sửa: dùng `text-[#fff]` (trắng thật). Nút Facebook đổi `#1877F2` →
     `#1772E8` để chữ trắng đạt 4.5:1 (bản gốc 4.23:1).
     Cả 3 đều là lỗi có thật với người dùng, cổng cũ (chỉ chặn critical + serious mới, 4 theme, không
     quét `wcag22aa`) không bắt được.
- ~~**Nợ mới chưa xử lý:** tiện ích `.tap-44` mở rộng vùng chạm bằng `::after` có
  `pointer-events: none`~~ **✅ ĐÃ TRẢ (2026-08-08).** Xem mục "Đợt trả nợ kỹ thuật 2026-08-08" ở đầu file.
- ~~🟡 **Token `--z-500` rớt WCAG AA ở gần như mọi nền, mọi theme**~~ **✅ ĐÃ TRẢ (2026-08-08)** trên
  mọi bề mặt thật (z-950/900/800); chỉ còn nhóm nền `z-700` giữ trong `KNOWN_LOW` CÓ CHỦ Ý. Xem mục
  "Đợt trả nợ kỹ thuật 2026-08-08" ở đầu file.
- ~~🟢 **3 chu trình import trong `apps/english/src/data/`**~~ **✅ ĐÃ TRẢ (2026-08-08)** — thực tế
  lúc bắt tay vào làm là **5 chu trình** (có thêm 2 cái trong `lib/` dính logic chạy thật, phát sinh
  sau lần ghi nhận 2026-08-04). Nay `npm run codemap -- cycles` báo 0.

- **[Rà soát tự động 2026-08-03, phiên sau PR #462]** `npm ci` sạch (container mới, chưa có
  `node_modules`) rồi chạy đủ cổng commit: build ✅ · typecheck ✅ (4 tsconfig) · lint ✅ (0 cảnh
  báo) · test ✅ (**149 file / 2414 test**, tăng nhiều so với lượt trước vì các PR listening/story
  mới đã merge). Không có lỗi type/lint/test mới trong code.
  - `npm audit` sau `npm ci` báo **3 lỗ hổng high** — nhiều hơn 2 dòng đã chốt ở mục ngay dưới, vì
    phát sinh THÊM 1 advisory mới: `fast-uri` 3.0.0–3.1.4 (`GHSA-7p8r-x3mc-p8w7`, host confusion
    qua backslash). Nguồn: `@commitlint/cli → @commitlint/load → config-validator → ajv@8.20.0 →
fast-uri` — thuần devDependency (commitlint hook), không vào bundle chạy cho người dùng cuối.
    Có bản vá không phá vỡ gì trong dải semver cũ → chạy `npm audit fix` (không dùng `--force`),
    nâng `fast-uri` `3.1.4` → `3.1.5`, chỉ đổi `package-lock.json` (không đổi `package.json`).
    Xác nhận lại `npm audit`: về đúng **2 lỗ hổng** (react-router, xem mục dưới — quyết định giữ
    nguyên đã chốt, không đổi gì thêm ở đây).
  - Đây là việc lặp lại theo lịch (audit định kỳ bắt kịp advisory mới của hệ sinh thái), không
    phải lỗi bỏ sót trước đó — bản thân advisory `fast-uri` mới được công bố sau lượt audit PR
    #462. Không có thay đổi code nghiệp vụ nào trong lượt rà soát này.

- **[2026-08-03] Lỗ hổng npm: ĐÃ VÁ 3/4, mục react-router ĐÓNG LẠI bằng quyết định "không nâng"
  (người dùng chốt phương án A).** PR #462. `npm audit`: **5 lỗ hổng → 2** (2 con số còn lại là
  cùng MỘT advisory react-router, xem ngay dưới).
  - Đã vá, **không nâng major gói nào**: `postcss` 8.4.x → **8.5.25** (Path Traversal source map,
    `GHSA-r28c-9q8g-f849`, high) · `brace-expansion` → **1.1.18/2.1.4/5.0.9** (DoS tràn bộ nhớ,
    `GHSA-mh99-v99m-4gvg`, high) · `esbuild` 0.27.7 → **0.28.1** (đọc file tuỳ ý ở dev server trên
    Windows, `GHSA-g7r4-m6w7-qqqr`, low). Cả 3 đều chỉ chạy lúc **build/dev**, không nằm trong
    bundle chạy trên trình duyệt người dùng.
  - `package.json` chỉ đổi đúng 1 dòng: `vite` `7.3.5` → `7.3.6` — **bản vá (patch), vẫn nằm trong
    dải `^7.3.5` cũ**, không vi phạm quy tắc GIỮ NGUYÊN PHIÊN BẢN (CLAUDE.md mục 6). Cần thiết vì
    vite 7.3.5 khoá cứng `esbuild@^0.27.0`; 7.3.6 mới nới sang `^0.27.0 || ^0.28.0` để
    `npm update esbuild` dedupe được về bản đã vá. Ba gói còn lại vá trong dải semver sẵn có nên
    chỉ `package-lock.json` đổi.
  - ⚠️ **ĐÍNH CHÍNH ghi chú rà soát 2026-08-01 phía dưới** (dòng "`npm audit fix` không giải quyết
    dứt điểm 2 mục high vì cần nâng major `eslint`/`tailwindcss`/`vite`"): kết luận đó **SAI/đã lỗi
    thời**. Chạy lại thực tế ngày 2026-08-03 thì cả 2 mục high vá được mà **không cần nâng major
    gói nào** — các gói thượng nguồn đã phát hành bản vá trong dải semver cũ kể từ ngày ghi chú đó.
  - 🔒 **`react-router` (`GHSA-qwww-vcr4-c8h2`, high): QUYẾT ĐỊNH GIỮ NGUYÊN `7.18.2`, KHÔNG nâng.
    Đây là quyết định có chủ đích, không phải việc còn tồn.** Người dùng chốt 2026-08-03 sau khi
    cân nhắc 3 dữ kiện đã kiểm chứng:
    1. **Không ảnh hưởng dự án này.** Advisory ghi rõ _"This only affects your application if you
       are using the unstable RSC APIs."_ Đã grep xác nhận repo không dùng RSC, không dùng
       `RouterProvider`/`createBrowserRouter` — `App.tsx` dùng `BrowserRouter` thuần (SPA).
    2. **Bản vá duy nhất là react-router `8.3.0`**, không có bản vá nào trong dòng 7.x. Mà **v8 yêu
       cầu React `19.2.7+`** (tài liệu chính thức `reactrouter.com/upgrading/v7`) — dự án đang React
       `18.3.1`, nâng react-router ⇒ **buộc nâng React 18 → 19**, đúng thứ CLAUDE.md mục 6 cấm.
       v8 cũng **xoá hẳn gói `react-router-dom`** → 32 file phải đổi import sang
       `react-router` / `react-router/dom`.
    3. `npm audit fix --force` không phải là "nâng" — nó **HẠ CẤP** về `react-router-dom@7.11.0`
       (lùi 7 minor, mất tính năng).
       → Đổi React 18 → 19 để vá một lỗ hổng ở code path app không hề chạy là cái giá không đáng.
       **`npm audit` sẽ còn báo 2 dòng high này lâu dài — đó là kỳ vọng, không phải việc bỏ sót.**
       Xem lại quyết định khi nào: nếu dự án sau này dùng RSC/data router, hoặc khi có lý do độc lập
       để nâng React lên 19.

- **[Rà soát tự động 2026-08-03]** Chạy lại đầy đủ cổng commit sau `npm ci` sạch: build ✅ ·
  typecheck ✅ (4 tsconfig: gốc/api/e2e/`apps/hub`) · lint ✅ (0 cảnh báo) · test ✅ (**103 file /
  1683 test**). Không có lỗi code mới. `npm audit`: **5 lỗ hổng (4 high, 1 low)** — khớp đúng dự
  đoán ở mục nâng cấp react-router bên dưới (2 high cũ `postcss`/`brace-expansion` + 1 high mới
  `react-router` CSRF RSC Mode + 1 low `esbuild`), không phát sinh gì ngoài dự kiến. Phát hiện 1
  tài liệu lỗi thời: `.claude/report-status.sh` dòng nợ kỹ thuật #1 vẫn ghi react-router "chưa
  nâng cấp" dù đã nâng lên v7.18.2 từ 2026-08-02 — đã sửa lại đúng hiện trạng (hết 2 CVE moderate
  cũ, chấp nhận 1 cảnh báo high mới vì app không dùng RSC Mode). E2E Playwright vẫn KHÔNG chạy
  được trong sandbox này (không có `.env`/Postgres thật) — như các lượt rà soát trước.
  ⚠️ **Số liệu `npm audit` trong mục này đã bị thay thế** bởi mục 2026-08-03 ngay phía
  trên (PR #462 đã vá 3/4 lỗ hổng, còn 2). Giữ lại nguyên văn làm bản ghi lịch sử của lượt
  rà soát lúc 00:13 cùng ngày, không phải hiện trạng.

- **[2026-08-02] react-router: ĐÃ NÂNG LÊN v7 (phương án 1 bước), package.json đổi
  `react-router-dom` `^6.24.1` → `^7.18.2`.** Cổng commit đạt đủ: build ✅ · typecheck ✅ (4
  tsconfig) · lint ✅ (0 cảnh báo) · test ✅ (103 file / 1473 test) · dev server khởi động sạch
  (HTTP 200, không lỗi console). Không sửa file nào khác ngoài `package.json`/`package-lock.json`
  — đúng như dự đoán trong đặc tả (Declarative Mode, không data router/loader/action/`<Outlet>`).
  **Lưu ý audit:** `npm audit` hết 2 CVE moderate cũ, nhưng phát sinh 1 cảnh báo **high** MỚI
  (`GHSA-qwww-vcr4-c8h2`, CSRF trong **RSC Mode** — React Server Components, dải
  `>=7.12.0 <8.3.0`) — **chưa có bản vá nào** (react-router v8 chưa phát hành trên npm tính đến
  2026-08-02). App này **không dùng RSC Mode** (không `react-router.config.ts`, không action
  route) nên không khai thác được thực tế — chấp nhận cảnh báo audit này, sẽ tự hết khi có bản vá
  phát hành và nâng tiếp. **Chưa chạy E2E Playwright** (cần Postgres thật, sandbox không có) — cần
  chạy trước khi merge như cổng merge CLAUDE.md mục 9 yêu cầu. Kế hoạch gốc + đánh giá "chuyển
  sang data router/loader/action/SSR" (đã đề xuất KHÔNG làm — chi phí lớn, lợi ích nhỏ vì app hầu
  hết sau đăng nhập, VPS 1 vCPU không nên tăng tải server-render) ở
  `docs/research/dac-ta-nang-cap-react-router-v7-2026-08-02.md`. Trước đó
  chọn phương án trước khi làm.
- **[2026-08-02] `restore:r2 -- --restore-into`: đã viết runbook kiểm thử, CHỜ BẠN TỰ CHẠY TRÊN
  VPS.** Sandbox Claude Code web không có Docker daemon/mạng tới VPS nên không tự test được nhánh
  phá huỷ dữ liệu tại đây. Đã soạn quy trình 7 bước an toàn (dùng database TẠM
  `english_tutor_restore_test`, không đụng `english_tutor` production) ở
  `docs/kiem-thu-restore-into-staging.md` — gồm đối chiếu số liệu trước/sau, dọn dẹp, và lý do cố
  tình KHÔNG tự động hoá thành 1 script (cần người đọc log/phán đoán chênh lệch số liệu).
- **[Audit toàn diện 2026-08-01 — phát hiện mới]** Tầng 1–6 theo `docs/framework/QUY-TRINH-AUDIT.md`
  đều đạt (build/typecheck/lint/format/1033 test/bundle-size ✅, 0 secret hardcode, 0 high/critical
  `npm audit`, coverage 52.94/87.02/79.93/52.94% vượt sàn 48/87/76/48). Nợ còn lại:
  - ~~🟡 `react-router`: 2 lỗ hổng **moderate** (CVE-2025-68470 bypass + arbitrary constructor
    injection qua `deserializeErrors()`), có fix qua `npm audit fix` — chưa nâng cấp, cần kiểm tra
    không phá route trước khi merge (đổi major/minor react-router-dom).~~ **[Lỗi thời]** 2 CVE
    moderate này đã hết khi nâng lên react-router v7 (2026-08-02). Advisory react-router hiện tại
    là `GHSA-qwww-vcr4-c8h2` (high, RSC Mode) — **đã quyết định giữ nguyên, xem mục đầu 2026-08-03.**
  - ~~🟡 `restore:all`/`restore:system`/`restore:r2`: nhánh `--restore-into <db> --yes` CHƯA test
    thật~~ **✅ ĐÃ KIỂM CHỨNG (2026-08-08)** trên cụm Postgres 16 nháp — xem mục "Đợt trả nợ kỹ
    thuật 2026-08-08" ở đầu file. Vẫn giữ nguyên khuyến cáo vận hành: chạy lần đầu trên database
    phụ/staging, không thử trực tiếp trên `english_tutor` production.
  - Đã sửa 2 lỗi tài liệu lỗi thời tìm thấy: `.claude/report-status.sh` (hardcode text cũ báo sai
    Sentry/thanh toán Pro/branch protection/migration Supabase "chưa xong" dù đã xong từ lâu) và
    `docs/framework/QUY-TRINH-AUDIT.md` (ngưỡng CSS bundle ghi 9.7kB thật là 11kB, ngưỡng coverage
    ghi số đo 2026-07-02 đã lỗi thời so với `vitest.config.ts` hiện tại).
  - 2 test a11y (`/progress`, `/profile` theme blue-sky) fail 1 lần do "Execution context destroyed"
    (Playwright flaky khi nhiều test a11y chạy song song dội rate-limit) — chạy lại riêng cả 24 test
    theme blue-sky đều pass, không phải lỗi a11y thật, không cần xử lý thêm.

- **[Rà soát tự động 2026-08-01, phiên sau]** Chạy lại đầy đủ cổng commit: build ✅ · typecheck ✅
  (4 tsconfig: gốc/api/e2e/`apps/hub`) · lint ✅ (0 cảnh báo) · test ✅ (**103 file / 1249 test** — tăng
  từ 1033 vì nội dung Nghe + đối chiếu SGK mới thêm sau ngày ghi audit ở trên). Không có lỗi code mới.
  **Đính chính `npm audit`:** dòng "0 high/critical" ở mục audit toàn diện phía trên **đã lỗi thời** —
  chạy lại `npm audit` ngay bây giờ ra **5 lỗ hổng: 2 high, 2 moderate, 1 low** (advisory database
  npm cập nhật liên tục trong ngày, không phải do code đổi):
  - 🔴 `postcss` (phụ thuộc TRỰC TIẾP qua Tailwind, high, `GHSA-r28c-9q8g-f849`) — Path Traversal khi
    tự nạp source map (`sourceMappingURL`) lộ file `.map` tuỳ ý. Chỉ chạy lúc BUILD, không lọt vào
    bundle chạy trên trình duyệt người dùng — rủi ro thực tế thấp nhưng nên nâng khi có bản vá
    tương thích Tailwind 3.
  - 🔴 `brace-expansion` (gián tiếp qua `eslint`/`glob`, high) — DoS bộ nhớ, chỉ ảnh hưởng tool dev,
    không chạy trên server production.
  - 🟢 `esbuild` (gián tiếp qua Vite, low) — chỉ ảnh hưởng dev server chạy trên Windows.
  - `react-router`/`react-router-dom` (moderate) — vẫn là mục đã biết ở trên, chưa đổi.
  - ~~`npm audit fix` (không `--force`) KHÔNG giải quyết dứt điểm 2 mục high vì bản vá nằm sâu trong
    cây phụ thuộc của `eslint`/`tailwindcss`/`vite` — cần nâng major các gói này mới hết, trái quy
    tắc "GIỮ NGUYÊN PHIÊN BẢN" (CLAUDE.md mục 6) nên CHƯA tự làm, cần người dùng quyết định trước.~~
    ⚠️ **[SAI — đã đính chính 2026-08-03, xem mục đầu "Nợ kỹ thuật còn mở"]** Chạy lại thực tế cho
    thấy cả 3 mục (`postcss`/`brace-expansion`/`esbuild`) vá được mà **KHÔNG cần nâng major gói
    nào**; đã vá xong ở PR #462.
  - E2E (Playwright) KHÔNG chạy trong lượt rà soát này (môi trường phiên không có `.env`/Postgres để
    kết nối) — chỉ xác nhận cổng commit, chưa phải cổng merge đầy đủ.

- **PM2 cluster mode: ĐÃ XÁC NHẬN chạy đúng cơ chế trên VPS thật (2026-07-25),
  nhưng hiệu quả bị giới hạn bởi phần cứng — xem cuối mục.** (nhánh
  `claude/project-100k-active-users-8292zf`, đặc tả `docs/research/dac-ta-gd1-scale-30k.md`
  Việc A + fix PR #322.) Bối cảnh: PM2 cluster mode ĐÃ ROLLBACK
  về fork mode (2026-07-20, PR #285) vì PR #283/#284 làm worker crash im lặng khi chạy thật
  trên VPS (Node `cluster` module không tương thích loader ESM `--import tsx`). Lần này gỡ
  ĐÚNG nguyên nhân: thêm `tsconfig.server.json` + script `build:server` (`npm run build` gọi
  kèm) biên dịch `server.ts` + `api/**/*.ts` sang JS thật ở `dist-server/` (ESM/NodeNext,
  đã phải thêm đuôi `.js` vào ~150 import tương đối trong `api/` cho đúng chuẩn Node ESM).
  `ecosystem.config.cjs` đổi `script: './dist-server/server.js'` (bỏ `interpreter: tsx`),
  `instances: 'max'`, `exec_mode: 'cluster'`. Phát hiện thêm khi build thật: `server.ts` +
  `api/_lib/dictionaryData.ts` dùng `__dirname`/`import.meta.url` để tìm `dist/` (frontend),
  `uploads/`, `public/data/dictionary/` — các đường dẫn này SẼ SAI khi tính từ vị trí file đã
  biên dịch (nằm trong `dist-server/`), đã sửa sang `process.cwd()` (ổn định vì PM2 luôn cwd
  = gốc repo). **Đã kiểm chứng trong sandbox dev**: `node dist-server/server.js` chạy
  standalone, `/api/health` 200, `/api/dictionary` đọc đúng 12.168 từ.

  **[Cập nhật 2026-07-25, xác nhận trên VPS thật]** Deploy đầu tiên sau merge PR #321 phát hiện
  `pm2 reload` không đổi được `exec_mode` của process đang chạy (log vẫn `ids: [ 1 ]`, cluster
  mode chưa hề áp dụng) — đã vá bằng PR #322 (`scripts/pm2-reload.sh` tự phát hiện lệch
  exec_mode → `pm2 delete` + `pm2 start`; đồng thời bật `wait_ready`/`kill_timeout` cho
  zero-downtime thật). Deploy tiếp theo (commit `d801a8e`, run
  [30154933490](https://github.com/seeker19110/bilingual-english-vietnamese/actions/runs/30154933490))
  xác nhận log đúng như thiết kế: phát hiện đổi `fork_mode → cluster_mode`, xoá + start lại,
  health check OK sau 1s.

  **[Lúc đó] log PM2 báo `App [english-tutor] launched (1 instances)`** — dù cấu hình
  `instances: 'max'`, chỉ có đúng 1 tiến trình được tạo, vì VPS lúc đó chỉ có 1 vCPU (`'max'` =
  số core thật của máy).

  **[Cập nhật 2026-08-21] VPS ĐÃ NÂNG CẤP LÊN 3 vCPU / 3GB RAM** (người dùng xác nhận). Theo
  CLAUDE.md mục 13 (cập nhật 2026-08-19), PM2 đang chạy **cluster mode 3 instances thật** tận
  dụng cả 3 core, cùng `REDIS_URL` cho rate-limit tập trung (mục ngay bên dưới) — nghĩa là lợi
  ích song song thật ĐÃ CÓ, không còn bị giới hạn bởi phần cứng như trước. Nợ kỹ thuật này coi
  là **đã đóng hoàn toàn** (cả cơ chế lẫn phần cứng).

  **[Cùng ngày 2026-08-21] Tên tiến trình PM2 đổi từ `english-tutor` sang `dhcb`** (người dùng
  xác nhận đã đổi thật trên VPS). Đã đồng bộ lại trong repo: `ecosystem.config.cjs` (`name`),
  `scripts/deploy.sh` + `scripts/pm2-reload.sh` (`PM2_PROCESS`), `scripts/diagnose-502.sh`, và
  các docs vận hành trực tiếp dùng lệnh `pm2 ...`/đường dẫn `/var/www/...`:
  `docs/deploy-vps-ubuntu.md`, `docs/system-requirements.md`,
  `docs/runbook-platform-v2-production-deployment.md`, `docs/setup-postgresql-vps.md`,
  `docs/ke-hoach-khoi-phuc-su-co-server.md`, `docs/cloudflare-setup.md`, `docs/DEPLOY.md`,
  `docs/rollback-runbook.md`, `docs/runbook-dung-vps-moi-tu-dau.md`,
  `docs/huong-dan-lien-ket-facebook-apple-microsoft.md`, `docs/huong-dan-tu-host-scale-50k.md`,
  `docs/email-setup.md`.

  **[Cập nhật tiếp, cùng ngày] Đã xác minh + dọn xong mục database.** Trên VPS thật có SONG SONG
  2 database (`sudo -u postgres psql -l+`): `dhcb` (356MB, 41 bảng) và `english_tutor` (301MB, 40
  bảng, cùng 18 users) — số liệu gần giống nhau vì `english_tutor` là **bản sao/rác còn sót lại
  từ lúc đổi tên trước đây**. Xác nhận DB thật app đang dùng qua `DATABASE_URL` trong `.env`:
  `postgresql://tutor_app:...@localhost:5432/dhcb` → **`dhcb` mới là DB sống, `english_tutor` là
  rác**. Đã xử lý: backup phòng hờ (`pg_dump english_tutor | gzip > /var/backups/english_tutor-
truoc-khi-xoa-20260821.sql.gz`), xác nhận 0 kết nối đang dùng
  (`pg_stat_activity`), rồi `dropdb english_tutor` — VPS giờ chỉ còn đúng 1 database `dhcb`. Đã
  sửa nốt `docs/ke-hoach-khoi-phuc-su-co-server.md` + `docs/setup-postgresql-vps.md` (toàn bộ
  lệnh `pg_dump`/`dropdb`/`createdb`/`psql -d`/`--restore-into`/tên file backup `*.sql.gz` đổi từ
  `english_tutor` sang `dhcb`; **role `tutor_app` giữ nguyên** — đó là role Postgres thật đang
  dùng, không phải tên cần đổi). Role name khác database name là chủ ý của hệ thống, không phải
  lỗi.

  Còn lại **2 chỗ chưa đổi**, không thuộc hạ tầng vận hành nên chưa cần gấp: (1) tên GitHub repo
  `seeker19110/english-tutor` trong `docs/CODEX_CLOUD_SETUP.md` (khác `seeker19110/donghanh`
  đang dùng thật — có thể là repo cũ trước khi đổi tên, cần người dùng xác nhận có còn dùng
  không); (2) tên gọi dự án "english-tutor" trong `docs/MASTER_SPEC.md` dòng mở đầu (mang tính mô
  tả lịch sử dự án, không phải định danh hạ tầng).

  **[Hoàn tất, cùng ngày] Đã merge + deploy thật lên VPS, xác nhận qua `pm2 list`.** PR #614
  (đổi tên PM2 + dọn DB) merge vào `main` bằng squash (commit `e2477d4`) sau khi vá 2 lỗi CI
  không liên quan tới nội dung đổi tên: (1) PR body thiếu mục bắt buộc khi chuyển draft → ready
  (gate `metadata`) — bổ sung đủ 6 mục theo template; (2) `quality` fail 2 lần vì lỗi format
  Prettier — lần 2 do **lệch phiên bản Prettier** giữa `npx` cache cũ (3.8.1) và bản khai trong
  `package.json` (^3.9.6, đúng bài học CLAUDE.md mục 8 "công cụ phải khớp lockfile"), sửa bằng
  `npm ci` rồi format lại. **Phát hiện phụ, chưa xử lý**: gate coverage của `quality`
  (branches ≥90%) đang FAIL LIÊN TỤC trên `main` qua rất nhiều commit gần đây (89.23%, thấp hơn
  ngưỡng) — không phải lỗi do PR này, là nợ kỹ thuật có sẵn ảnh hưởng mọi PR, `merge_pull_request`
  vẫn cho qua nên `quality` không phải required status check chặn merge trên branch protection
  hiện tại (khác mô tả ở CLAUDE.md mục 13 "CI check quality/e2e xanh"). Cần người dùng quyết định
  có ưu tiên vá coverage hay không.

  Sau merge, người dùng tự chạy trên VPS: `git pull origin main` → `npm ci && npm run build` →
  `pm2 delete english-tutor` → `pm2 start ecosystem.config.cjs` → `pm2 save`. Kết quả xác nhận
  **cả 3 tiến trình `dhcb` chạy `cluster`/`online`**, `english-tutor` đã biến mất khỏi `pm2 list`,
  health check `/api/health` trả `{"status":"ok"}`. Site production đã khôi phục hoàn toàn sau
  sự cố 502 (do 3 tiến trình `english-tutor` cũ bị crash-loop hết `max_restarts` trước khi đổi
  tên — nguyên nhân gốc chưa xác minh kỹ vì standalone `node dist-server/server.js` chạy hoàn
  toàn ổn không lỗi, nhiều khả năng do PM2 exec_mode/wait_ready chưa khớp cấu hình cũ, không phải
  lỗi code).

  Việc còn lại thuộc GĐ2 scale xa hơn (nếu
  cần vượt quá 3 vCPU cho mục tiêu 30k-50k concurrent) là quyết định mở rộng tiếp theo, không
  còn là nợ kỹ thuật cấp thiết.

  Cũng cần đặt `REDIS_URL` (xem mục ngay bên dưới — rate limit chuyển sang Redis) trước khi bật
  cluster mode nhiều tiến trình thật (sau khi thêm VPS ở GĐ2), không thì rate limit lỏng hơn N
  lần (N = số tiến trình).

- **Rate limit chuyển từ `Map` in-memory sang Redis khi có `REDIS_URL` (2026-07-25, Việc B
  cùng đặc tả trên).** `api/_lib/security.ts` `checkRateLimit()` giờ là async: có
  `REDIS_URL` → đếm atomic qua Lua script (INCR + PEXPIRE có điều kiện) dùng chung mọi tiến
  trình/máy; không có (hoặc Redis lỗi) → fallback `Map` in-memory y hệt hành vi cũ
  (FAIL-OPEN, không bắt buộc — dev/local không cần Redis). Đã thêm dependency `ioredis`.
  **Chưa kiểm chứng** bằng Redis thật nhiều tiến trình (sandbox không có Redis server) — cần
  xác nhận trên VPS cùng lúc với cluster mode ở trên.
- ~~**E2E `mockLogin` không còn khớp luồng đăng nhập thật**~~ **ĐÃ TRẢ XONG (PR #282,
  2026-07-20)** — `e2e/helpers/auth.ts` nay gieo đúng key Bearer token
  (`gsa_session_token_v1`) VÀ dùng `page.route()` chặn `GET /api/auth?action=me` trả profile
  giả. Dòng cũ ghi "chưa làm" đã lỗi thời (viết trước PR #282, xác nhận lại 2026-07-20 khi
  quét toàn diện nợ kỹ thuật).
- ~~**2 script deploy trùng lặp**~~ **ĐÃ GỘP (2026-07-20, người dùng xác nhận giữ
  `scripts/deploy.sh`)** — xóa hẳn `deploy.sh` gốc repo (kém đầy đủ hơn); `.github/workflows/
deploy.yml` không còn tự inline các bước, nay gọi thẳng `bash scripts/deploy.sh` (1 nguồn
  chân lý duy nhất cho cả thủ công lẫn tự động). Đã cập nhật mọi doc còn nhắc `deploy.sh` gốc
  (`docs/DEPLOY.md`, `docs/deploy-vps-ubuntu.md`, `DEPLOY_STEPS.md`, `CLAUDE.md`).
- ⚠️ **[Ý tưởng, 2026-07-30] Phòng chat cho bạn bè cùng luyện tập** — ghi "chưa làm, mới bàn sơ
  bộ" nhưng mục `packages/core-chat/redisChat.ts` + `packages/core-chat/wsHandler.ts` ở TRÊN
  trong file này mô tả WebSocket + Redis pub/sub đã code xong (route `/ws/chat`, moderation,
  presence…) — **hai đoạn mâu thuẫn nhau, cần phiên sau xác minh lại tính năng chat bạn bè đã
  triển khai tới đâu thật sự** trước khi coi đây còn là "ý tưởng chưa làm". Ràng buộc phần cứng
  cũ (VPS 1 vCPU, chưa có Redis) đã hết hiệu lực: VPS nay 3 vCPU + `REDIS_URL` đã điền
  (2026-08-21).
- Không còn hạng mục a11y/kiểm thử lớn nào mở. Xem "Tiếp theo" ở trên cho việc sản phẩm còn dở.
- `docs/research/thu-thach-vlog-30-ngay.md` dùng tên cũ "Vlog" (tính năng đã đổi tên thành
  "Challenge" — route `/challenge`, bảng `challenge_entries`) — tài liệu đó là ghi chép lịch sử
  tại thời điểm merge, cố ý giữ nguyên tên cũ, không phải lỗi.
- **Kế hoạch khôi phục sự cố server (2026-07-25).** Thêm
  `docs/ke-hoach-khoi-phuc-su-co-server.md` — quy trình ứng phó tổng thể khi server sập/gặp sự
  cố (chẩn đoán nhanh, phân loại theo triệu chứng, xử lý từng kịch bản: VPS không phản hồi, PM2
  crash, hết ổ đĩa, Postgres lỗi, restore backup, SSL hết hạn, quá tải/DDoS, nghi bị xâm nhập —
  kèm checklist xác minh + mẫu post-mortem). Khác `docs/DEPLOY.md` (deploy + fix nhanh) và
  `docs/rollback-runbook.md` (rollback cấu hình theo PR cụ thể) — 3 file bổ sung nhau, không
  trùng. Đã liệt kê "cải tiến nên cân nhắc" cần người dùng quyết định (chưa tự làm): uptime
  monitoring tự động, điền DSN Sentry, tăng tần suất backup Postgres, và điền thông tin liên hệ
  khẩn/nhà cung cấp VPS vào bảng đầu file (việc duy nhất người dùng cần tự điền tay).

- **[Audit toàn diện 2026-08-08] Tầng 1–3 đạt hết, không phát hiện lỗi mới; thêm hook
  `useMountedRef` chặn setState sau unmount ở Chat/Speaking (PR #514 → đã MERGE, commit
  `e5a371d`).** Chạy lại đầy đủ cổng: build ✅ · typecheck ✅ (4 tsconfig) · lint ✅ (0 cảnh
  báo) · format ✅ · test ✅ **162 file / 2947 test** (trước khi thêm test mới) · bundle-size ✅
  JS 96.32/123kB · CSS 10.46/11kB (brotli) · `npm audit --omit=dev` **0 lỗ hổng** (production
  deps sạch hoàn toàn). Không có secret hardcode, không `.env` bị track, không
  `dangerouslySetInnerHTML`, không `any`/`TODO` mới, 11 `console.log` còn lại đều là log khởi
  động chủ đích (`server.ts`) hoặc logger dùng chung — không phải rác. Quét kỹ thêm: 0 N+1 query
  trong `api/` (mọi vòng lặp xử lý dữ liệu đã lấy sẵn, gửi push dùng `Promise.all` đúng cách),
  0 catch rỗng nuốt lỗi, không có race double-submit ở Chat/Speaking/Writing (đã chặn đủ bằng
  `loading`/`isThrottled`/`limitHit`), data lớn (`curriculum.ts` 9059 dòng...) chỉ import
  `type`, không phình bundle.
  - **Phát hiện + đã vá:** 27 file gọi `fetch()` trực tiếp trong component nhưng chỉ 2 file dùng
    `AbortController`/kiểm tra unmount — rủi ro "setState sau unmount" khi người dùng rời trang
    giữa lúc AI đang trả lời (`callClaude`/TTS có thể mất vài giây). Đã thêm hook dùng chung
    `useMountedRef()` (`apps/english/src/lib/useMountedRef.ts` + test mount/unmount) và áp dụng
    vào 6 hàm gọi AI trong `Chat.tsx`/`Speaking.tsx` (`startSession`, `sendMessage`/
    `sendUserSpeech`, `endAndGrade`) — nơi rủi ro cao nhất. Lượt dùng/lưu phiên (side-effect
    không phụ thuộc component) vẫn chạy bình thường dù đã rời trang, chỉ bỏ qua các `setState`.
    `npm run codemap -- impact` xác nhận chỉ ảnh hưởng `App.tsx`/`main.tsx` (router-level),
    không phá tính năng khác. PR #514, đã merge (squash, `e5a371d`), CI `quality`+`e2e` xanh.
  - **Đề xuất đã bàn nhưng CHƯA làm (người dùng quyết định hoãn — rủi ro > lợi ích trong điều
    kiện sandbox này):**
    - Gộp hook dùng chung giữa `Chat.tsx`/`Speaking.tsx` (2 luồng gần giống nhau: session/
      loading/error/limitHit/evaluation/throttle) — không có sai lệch logic thật giữa 2 file,
      lợi ích chỉ là "gọn hơn". Không có test component nào cho 2 trang này, sandbox không chạy
      được dev server thật (không Postgres/`.env`) để tự smoke-test → hoãn, chỉ nên làm sau khi
      có test component bảo vệ hoặc test tay trên máy có app thật.
    - Tách nhỏ các trang >1000 dòng (`Lessons.tsx` 1537, `Practice.tsx` 1338, `Speaking.tsx`
      1207, `StudyTabs.tsx` 1972...). Đã thử soát `Lessons.tsx`: `LessonView` (dòng 451–1537,
      ~1090 dòng) không tách cơ học được — chứa hàng chục closure lồng nhau tham chiếu trực
      tiếp ~65 `useState`/`useEffect`/`useRef` của component cha, tách sai dễ gây stale-closure
      bug âm thầm mà không có test bắt được. Hoãn tương tự lý do trên.
    - Rủi ro vận hành khác đã nêu nhưng cần người dùng tự làm tay (không phải AI tự làm được):
      uptime monitoring ngoài (UptimeRobot/Better Uptime), PWA/offline (`manifest.json` + service
      worker — có đặc tả sẵn ở `docs/framework/BO-SUNG-nang-cao-i18n-PWA-Sentry-SEO.md` nhưng
      viết cho Next.js, cần điều chỉnh cho Vite), dashboard theo dõi tổng chi phí AI/tháng.

- **[Audit toàn diện 2026-08-21] Tầng 1–3+5a+6 chạy lại đầy đủ theo `docs/framework/QUY-TRINH-AUDIT.md`
  (nhánh `claude/quet-sau-toan-dien-du-an-a3fnv5`), phát hiện 2 vấn đề mới phát sinh cùng đợt thêm bộ
  "10 SOTA Agent Super Skills" (mục 2.1 CLAUDE.md) — cả hai đã VÁ trong cùng PR này, không chờ PR riêng.**
  - **Phát hiện 1 — CORS mở quá rộng:** 18 endpoint REST mới
    (`api/agent-orchestrator.ts`, `avatar-embodiment.ts`, `life-synthesis.ts`, `memory-palace.ts`,
    `debate-arena.ts`, `pvp-arena.ts`, `daily-quests.ts`, `referral-vip.ts`, `mesh-telemetry.ts`,
    `stem-scratchpad.ts`, `action-canvas.ts`, `metacognitive-reflection.ts`, `neural-curriculum.ts`,
    `co-learning-audio.ts`, `gemini-live.ts`, `realtime-multimodal.ts`, `acoustic-phonetics.ts`,
    `proactive-agent.ts`) set cứng `Access-Control-Allow-Origin: '*'` ở OPTIONS preflight, khác thiết
    kế same-origin của các endpoint cũ (whitelist `getCorsHeaders()` trong
    `packages/core-auth/security.ts`, đọc `ALLOWED_ORIGINS`). **Đã sửa:** đổi cả 18 file sang dùng
    `getCorsHeaders(req)` thay vì khối `'*'` tự viết tay — hành vi giữ nguyên với origin hợp lệ, nhưng
    origin lạ giờ bị chặn đúng theo whitelist thay vì luôn được chấp nhận. Cập nhật kèm 3 file test có
    `vi.mock('../packages/core-auth/security.js', ...)` toàn module (thiếu export `getCorsHeaders`,
    gây lỗi mock khi thêm test OPTIONS).
  - **Phát hiện 2 — Coverage branches tụt dưới sàn:** đo được branches 89.23% (tụt từ mốc đặt ngưỡng
    90.32%, dưới sàn 90% ở `vitest.config.ts`) — các service/handler mới của bộ 10 Super Skills thiếu
    test ca biên (OPTIONS, method không hỗ trợ, thiếu field bắt buộc, action không hợp lệ, JSON hỏng,
    404/400 theo nhánh nghiệp vụ). **Đã sửa:** viết thêm ~70 test ca biên cho 10 file
    (`referral-vip`, `agent-orchestrator`, `acoustic-phonetics`, `pvp-arena`, `admin-feedback`,
    `avatar-embodiment`, `gemini-live`, `realtime-multimodal`, `action-canvas`, `life-synthesis`,
    `daily-quests` — không đổi code nghiệp vụ, chỉ thêm test) → branches về **90.02%** (statements
    94.07% · functions 97.15% · lines 94.07%), qua ngưỡng `npm run test:coverage`.
  - Chạy lại toàn bộ cổng sau khi vá: build ✅ · typecheck ✅ (4 tsconfig) · lint ✅ (0 cảnh báo) ·
    format ✅ · test ✅ **417 file / 5018 test** · size ✅ (JS 120.58/123 kB · CSS 15.62/16 kB brotli) ·
    `npm audit --omit=dev` 0 lỗ hổng · 0 secret hardcode · `.env` không bị track · 0 `console.log` rác ·
    0 `TODO`/`any` mới. Git: `origin/main`...HEAD 0 ahead/0 behind lúc audit.
  - **Còn để ngỏ (chưa làm, ghi nhận để phiên sau xử lý nếu cần):** mâu thuẫn nội bộ PROGRESS.md về
    tính năng "phòng chat bạn bè" (một đoạn ghi "chưa làm", đoạn khác mô tả code đã xong ở
    `packages/core-chat/`) — cần audit luồng riêng (mục 5 quy trình audit) để xác minh, không thuộc
    phạm vi đợt này. E2E+a11y và audit luồng dữ liệu sâu (Tầng 5c, Tầng 8–9) chưa chạy lượt này.
  - **[Cập nhật cùng ngày] CI e2e (PR #616) đỏ, xác nhận đỏ Y HỆT trên `main`** (job e2e của cả
    2 nhánh đều "230 passed" + đúng cùng 4 test fail, không phải do PR gây ra) — **đã vá 2/4** vì
    là test lỗi thời theo sau thay đổi sản phẩm thật, không phải bug:
    - `e2e/bottomnav.spec.ts` — tab "Tiến độ" đã bị thay bằng tab "Đồng Hành" (AI companion,
      `/dong-hanh`) ở `BottomNav.tsx` (Platform V7.0), test cũ chưa cập nhật theo. Đã sửa assertion
      sang `/Đồng Hành/`. Trang `/tien-do` vẫn tồn tại (vào qua Cá nhân/Dashboard), chỉ không còn
      là tab riêng.
    - `e2e/admin.spec.ts` (3 test Analytics feedback) — `AdminFeedbackPanel.tsx` giờ có 2 tab con
      "Ý Kiến Người Dùng" (mặc định) và "Đánh Giá Gia Sư AI 👎" (thêm sau PR feedback người dùng,
      `feat(feedback): implement full user feedback & suggestion system`) — nội dung phản hồi gia
      sư AI (`userInput`, dropdown nguồn, tiêu đề "Phản Hồi 👎...") chỉ hiện sau khi bấm sang tab
      con thứ 2. Đã thêm bước click tab trước khi assert. Cả 2 file đã chạy pass cục bộ
      (Playwright Chromium).
  - **[Cùng ngày, tiếp] Đã vá NỐT toàn bộ 68 vi phạm a11y `color-contrast` còn lại** (không dừng ở
    2/4 ban đầu — người dùng yêu cầu xử lý hết). Gốc rễ: nhiều nơi dùng thẳng màu pastel Tailwind
    (`text-emerald-300`, `text-sky-300`, `text-blue-300`, `text-purple-300`, `text-cyan-300`,
    `text-red-300`...) — vốn chỉ đọc tốt trên nền tối — mà THIẾU biến thể `theme-light:` (quy ước
    đã có sẵn ở nhiều nơi khác, `tailwind.config.js` định nghĩa variant `theme-light:` = áp cho
    3 theme nền sáng blue-sky/pink/kid) nên rớt AA trên 3 theme đó. 2 lỗi có tính LAN RỘNG (xuất
    hiện ở gần như MỌI trang vì nằm trong component dùng chung):
    - Nút "Đồng Hành AI" toàn cục trong `Layout.tsx` (header mọi trang) — `text-accent-300` thiếu
      `theme-light:text-accent-800`.
    - `PageHeader.tsx` (subtitle mọi trang có tiêu đề) — có bug NGƯỢC: ai đó thêm
      `theme-light:text-zinc-600` tưởng số càng cao càng đậm (quy ước Tailwind chuẩn), nhưng hệ
      thống token `--z-*` của dự án ĐẢO CHIỀU thang màu cho theme nền sáng (xem
      `packages/core-ui/theme.css` — z-50 đậm nhất/z-950 nhạt nhất ở theme sáng, ngược hẳn theme
      tối) nên `z-600` ở blue-sky lại NHẠT HƠN z-400 mặc định — ghi đè lên đúng giá trị đã đúng sẵn.
      Đã bỏ hẳn override sai (base `text-zinc-400` tự đúng theo theme nhờ CSS var). Cùng bug lặp lại
      ở `Landing.tsx`, `LandingEn.tsx`, `WordDetail.tsx` (`theme-light:text-zinc-600/700`) — đã sửa
      luôn dù 3 trang này chưa có trong `e2e/a11y.spec.ts`, để tránh tái phát khi được thêm vào quét.
    - Còn lại: `Home.tsx` (9 chỗ), `HomeUniversalAiBar.tsx` (6 chỗ badge gợi ý câu hỏi AI),
      `Writing.tsx` (lỗi/sửa lỗi ngữ pháp trong màn chấm bài), `EdgeAiIndicator.tsx` (badge chế độ
      WASM/WebGPU) — mỗi chỗ thêm đúng 1 class `theme-light:text-*-800` (hoặc `-700` cho đỏ, khớp
      quy ước đã dùng ở `CefrLessonViews.tsx`), không đổi cấu trúc/hành vi, chỉ đổi màu chữ ở
      3 theme sáng.
    - **Xác minh:** `e2e/a11y.spec.ts` 122/122 pass · `e2e/a11y-aaa.spec.ts` 75/75 pass · toàn bộ
      `npm run test:e2e` 305/305 pass · `npm test` 417 file/5018 test · build/size/typecheck/
      lint/format đều xanh. Không đổi hành vi nghiệp vụ, chỉ đổi màu chữ ở theme sáng.
    - **`e2e/v2-hubs.spec.ts`** — 1 lỗi KHÁC phát sinh khi CI chạy lại (không có trong danh sách
      fail của `main`, không liên quan CORS/coverage/a11y): `getByText('Bạn Đồng Hành AI')` khớp 2
      phần tử (tiêu đề thẻ AI companion trên Home + mô tả nhiệm vụ hàng ngày "...cùng Bạn Đồng Hành
      AI..." của `DailyQuestsCard`, cả hai đã có sẵn từ commit `f67bbcf`, chỉ là test dùng
      `getByText` không đủ cụ thể + phụ thuộc thời điểm phản hồi `/api/daily-quests` không mock
      trong test này). Đã sửa locator sang `getByRole('heading', { name: /Bạn Đồng Hành AI/ })` cho
      rõ ràng, không đổi sản phẩm.

### Quét lại tài liệu + thống nhất thương hiệu "Đồng Hành Cùng Bạn" — PR #648 (2026-08-24, đã merge)

Người dùng yêu cầu "quét lại toàn dự án và cập nhật thông tin, nhãn, title cho đúng". Phạm vi đã
chọn qua `AskUserQuestion`: tài liệu trạng thái + metadata code/package + nhãn GitHub (không có
open issue nào cần đổi nhãn tại thời điểm làm — đã xác nhận bằng `list_issues`).

- **CLAUDE.md mục 6 "Cấu trúc"**: bổ sung `apps/hub/` (gói `@dhcb/hub`) — app này tồn tại thật,
  build/deploy thật (`npm run build --workspace=@dhcb/hub`, PROGRESS.md nhắc rất nhiều lần: "Hub
  workspace", "Bento Grid", "Global Studio Switcher"...) nhưng chưa từng được liệt kê ở CLAUDE.md,
  khiến phiên trước đọc file không biết app này tồn tại.
- **`apps/dhcb/index.html`**: viết lại `<title>`, meta description/keywords, Open Graph, Twitter
  Card, JSON-LD (`WebApplication`, `EducationalOrganization`, `Course`, `FAQPage`) và
  `apple-mobile-web-app-title` — trước đây chỉ ghi "Gia sư tiếng Anh AI", không nhắc gì tới nền
  tảng "Đồng Hành Cùng Bạn" mà README.md/CLAUDE.md/PROGRESS.md đã dùng từ lâu. Nay đồng bộ với
  `apps/hub/index.html` (đã có sẵn title đúng từ trước).
- **`apps/dhcb/public/manifest.webmanifest`**: name/short_name/description PWA đồng bộ theo.
- **Đổi tên gói `hub` → `@dhcb/hub`** (`apps/hub/package.json` + script `build` ở `package.json`
  gốc) cho khớp quy ước `@dhcb/*` của 15 gói `packages/*` + `apps/dhcb` (`@dhcb/app`) + `apps/server`
  (`@dhcb/server`) — trước đây là ngoại lệ duy nhất không theo quy ước. Đồng bộ lại
  `package-lock.json` sau khi đổi tên, xác nhận `npm ci` sạch.
- **Xác thực**: `npm run build` ✅ (client Vite + `build:server` + build `@dhcb/hub`) ·
  `npm run typecheck` ✅ (4 tsconfig) · `npm run lint` ✅ (0 cảnh báo) · `npx prettier --check .`
  phát hiện `apps/dhcb/index.html` lệch format sau khi sửa, đã `--write` lại. CI PR #648: cả 3
  required check `quality` + `e2e` + `metadata` đều xanh.
- **Ghi chú vận hành merge**: trong lúc chờ merge, `main` được merge liên tục bởi các PR khác
  (#649, #650) khiến PR #648 bị đẩy vào trạng thái `mergeable_state: "behind"` 3 lần liên tiếp —
  phải gọi `update_pull_request_branch` + chờ CI chạy lại từng lần trước khi merge được. Không
  phải lỗi CI, chỉ là do nhiều PR merge cùng lúc vào `main`.
- **Không đổi hành vi nghiệp vụ, không đổi route, không đổi schema DB.** Rủi ro thấp; rollback =
  revert PR, không cần bước dọn dẹp thêm.
