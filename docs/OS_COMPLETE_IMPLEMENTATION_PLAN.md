# English Tutor OS — Đặc tả triển khai đầy đủ đến khi hoàn thành

> Phiên bản 1.0 — 2026-08-15. Đây là kế hoạch thực thi chi tiết từ hiện trạng production đến
> Final Audit. Nguyên tắc/cổng chung nằm trong [`OS_EXECUTION_GUIDE.md`](./OS_EXECUTION_GUIDE.md),
> trạng thái thực tế duy nhất nằm trong [`../PROGRESS.md`](../PROGRESS.md).

## 1. Cách dùng tài liệu

Mỗi phase dưới đây là một **gói nghiệm thu**, không đồng nghĩa một PR. Một phase có thể chia nhiều
PR nhỏ nhưng chỉ chuyển sang `accepted` khi đạt toàn bộ Exit gate. Không mở wave kế tiếp nếu còn lỗi
P0/P1 về dữ liệu, quyền, thanh toán hoặc khả năng rollback ở wave hiện tại.

Trước mỗi phase:

1. Tạo implementation brief theo mẫu trong `OS_EXECUTION_GUIDE.md`.
2. Gắn owner, estimate theo PR nhỏ, dependency và evidence dự kiến vào `PROGRESS.md`.
3. Chụp baseline test/metric hiện hành; chạy `codemap -- impact` cho hotspot.
4. Thiết kế migration additive, feature flag và rollback/recovery trước khi sửa code.
5. Sau deploy, quan sát đủ cửa sổ đã định rồi mới accepted.

## 2. Các wave và cổng phát hành

| Wave                        | Phase | Mục tiêu                                                      | Cổng ra                                                          |
| --------------------------- | ----- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| A — Baseline & boundaries   | 00–02 | Biết chính xác hệ thống hiện tại; dựng biên kỹ thuật/contract | 8 critical flows được trace; payment atomic; contract executable |
| B — Learner truth           | 03–10 | Xây learner/skill/knowledge/evidence/mastery/assessment       | Một diagnostic thật tạo evidence và mastery tái lập được         |
| C — Adaptive learning       | 11–20 | Workflow, tutor, correction, curriculum, SRS, daily plan      | Một phiên học có thể resume và sinh kế hoạch tiếp theo           |
| D — Memory, routing & voice | 21–28 | Memory có quyền, model/agent routing và pronunciation         | Agent/voice thay thế được, dữ liệu riêng tư có retention/delete  |
| E — Platform intelligence   | 29–36 | Event/jobs/eval/outcome/observability/cost                    | Side effects replay được; SLO/cost/outcome có dashboard          |
| F — Release & governance    | 37–45 | UI, migration, security, hardening, scale, final audit        | Full learner loop đạt release criteria, risk được ký nhận        |

## 3. Wave A — Baseline và nền móng (Phase 00–02)

### Phase 00 — Research & Baseline

**Outcome:** Có bản đồ có thể tái lập của production và test environment trước khi đổi kiến trúc.

**Công việc:**

- Inventory frontend routes, API handlers, tables/migrations, auth/session, payment/entitlement,
  usage, AI/STT/TTS, SRS/CEFR, storage, cron/jobs, deploy/backup.
- Trace tối thiểu 8 luồng: đăng nhập; chat AI + trừ/hoàn lượt; TTS cache; pronunciation; lưu tiến
  độ đa thiết bị; SRS; checkout → webhook → entitlement; admin mutation.
- Với mỗi luồng ghi sequence, source of truth, transaction boundary, failure/retry/idempotency,
  dữ liệu nhạy cảm, metric và owner.
- Dựng Postgres test disposable; chạy build/type/lint/format/unit/integration/E2E trên commit hiện
  hành. E2E phải chạy Express hoặc dev middleware forward Cookie/Origin/IP đúng production.
- Thu sample production đã redact: p50/p95 latency, error/fallback rate, token/cost theo AI task,
  TTS hit/miss và payment reconciliation.
- Cập nhật architecture map, dependency graph và risk register P0–P3 có owner/phase đích.

**Bằng chứng/Exit:** `docs/research/baseline.md` có commit SHA, môi trường/lệnh, số đo; 8 trace có
review; mọi blocker có owner; owner dự án ký baseline. Không dùng kết quả CI cũ thay cho lượt đo.

### Phase 01 — Foundation OS

**Outcome:** Critical paths dùng chung biên config/DB/AI/error/log và không còn mutation tài chính
không atomic.

**Công việc:**

- Migrate biến môi trường critical sang `packages/core-config`: DB, cookie/auth, provider keys,
  payment, storage, Redis; production thiếu biến bắt buộc phải fail-fast với log đã redact.
- Chuẩn hóa DB repository/transaction client. Refactor payment webhook để payment status,
  entitlement và email verification cùng transaction hoặc state machine/outbox có reconciliation.
- Thêm test lỗi giữa từng bước và hai webhook song song; alert `paid-but-ungranted`.
- Hoàn thiện `AIProvider` contract cho chat trước, adapter hóa STT/TTS theo interface riêng nhưng
  cùng taxonomy timeout/network/http/malformed/quota; giữ nguyên usage debit/refund.
- Áp `AppError`/API envelope cho một vertical slice critical; có compatibility adapter cho client
  cũ thay vì đổi đồng loạt.
- Request ID xuyên Express → handler → DB/provider; metric in-memory chỉ là fallback, định nghĩa
  export contract để Phase 35 thay backend.
- Quét bundle/log fixture bảo đảm server secret không lọt client/log.

**Tests:** config production/dev; transaction rollback; retry/idempotency; provider timeout/fallback;
malformed body; usage refund exactly-once; secret snapshot; integration Postgres thật.

**Exit:** payment P0 đóng; critical paths dùng abstraction thật; build/test/E2E xanh; canary không
tăng 5xx/cost; rollback rehearsal thành công.

### Phase 02 — Contract OS

**Outcome:** Các biên domain/API/event/AI quan trọng có schema versioned và compatibility test.

**Công việc:**

- Tạo `packages/core-contracts` chứa Zod schema + TypeScript types cho Learner, Goal, Skill,
  Knowledge, Evidence, Error, Mastery, Assessment, Lesson, Activity, Memory, Workflow,
  AgentManifest, AI request/response và error envelope.
- Quy ước ID, UTC timestamp, nullable/optional, enum extension, unknown fields, schema version và
  deprecation window. Tạo fixture `v1` hợp lệ/không hợp lệ.
- Sinh/duy trì API contract registry; endpoint mới import schema, không tự định nghĩa body rời rạc.
- Pipeline output AI bắt buộc parse → schema → domain invariants → policy → commit; raw output chỉ
  lưu ở vùng audit có retention khi được phép.
- Event contract có event ID, correlation/causation, actor, aggregate và payload version.
- Viết compatibility test giữa producer/consumer; cấm breaking change không bump version.

**Exit:** mọi persisted AI output và mutation mới được validate; registry/fixtures chạy trong CI;
ít nhất payment, auth và evidence vertical slices dùng contract thật.

## 4. Wave B — Learner truth (Phase 03–10)

### Phase 03 — Learner OS

**Outcome:** Hồ sơ học viên server-side là nguồn sự thật cho mục tiêu, sở thích và consent.

- Thiết kế `learner_profiles`, `learner_goals`, `learner_preferences`, `learner_consents` với
  version/updated_at; tách dữ liệu toàn cục và riêng môn.
- Quy định merge đa thiết bị cho từng field: monotonic, last-write-wins có version, set union hoặc
  manual conflict. Không merge một object JSON theo timestamp chung.
- API GET/PATCH versioned, optimistic concurrency (`If-Match`/version), export/delete.
- Backfill additive từ profile/onboarding/settings hiện tại; dual-read so sánh, rồi switch bằng flag.
- Test cross-user, stale write, null/empty, timezone, consent revoke và rollback.

**Exit:** mismatch old/new bằng 0 trên sample; client dùng read model mới; export/delete rehearsal.

### Phase 04 — Skill OS

**Outcome:** Một taxonomy skill ổn định nối curriculum, evidence và mastery.

- Định nghĩa skill hierarchy cho listening/speaking/reading/writing/grammar/vocabulary/
  pronunciation, CEFR mapping, prerequisite edges và lifecycle active/deprecated.
- Bảng `skills`, `skill_prerequisites`, `skill_aliases`, `skill_versions`; ID không phụ thuộc label.
- Tool validate graph: không cycle, không orphan, prerequisite tồn tại, CEFR hợp lệ.
- Map lesson/quiz/dialogue hiện tại sang skill; lưu coverage và unmapped report.
- API read-only/versioned; admin mutation qua audited release workflow.

**Exit:** 100% content thuộc critical learner loop có skill mapping hoặc waiver có owner; graph test
và migration rollback xanh.

### Phase 05 — Knowledge OS

**Outcome:** Nội dung học là knowledge item versioned, có nguồn, ngôn ngữ và lifecycle.

- Schema knowledge item cho word, sense, grammar rule, phrase, dialogue, pronunciation target,
  example và assessment item; tách ID nội dung khỏi bản phát hành.
- Metadata bắt buộc: language/direction, CEFR, source/license, author/reviewer, status, checksum.
- Importer idempotent từ CEFR/dictionary/curriculum hiện tại; duplicate detection theo semantic key.
- Content release manifest; sửa nội dung tạo version mới, không làm mất provenance của evidence cũ.
- Validator kiểm reference, translation pair, answer uniqueness, audio availability/fallback.

**Exit:** manifest reproducible; critical content mapped skill + source; rollback về release trước được.

### Phase 06 — Evidence Engine

**Outcome:** Chỉ observation đã validate mới ảnh hưởng learner state.

- Tách raw interaction khỏi `learning_evidence`; evidence gồm learner/source/skill/knowledge,
  outcome, score, confidence, difficulty, context, provenance, assessor version, occurred_at.
- Tạo idempotency key từ interaction/attempt; repository append-only; correction tạo superseding
  record, không sửa lịch sử.
- Adapter evidence cho quiz, CEFR exam, SRS, writing, speaking, pronunciation và tutor session.
- Ghi evidence và outbox event cùng transaction; payload không chứa raw audio/transcript mặc định.
- Policy loại evidence confidence thấp/không có skill/knowledge/cross-user.

**Exit:** replay cùng input không tạo duplicate; audit truy được từ mastery về attempt; old path
dual-write có reconciliation report.

### Phase 07 — Error Memory

**Outcome:** Lỗi tái diễn được phân loại, gộp và giải thích cho học viên.

- Taxonomy grammar/vocabulary/pronunciation/fluency/comprehension; fingerprint không chứa PII.
- Bảng error occurrence + aggregate; decay/expiry; trạng thái active/improving/resolved.
- Dedupe cùng lỗi trong một attempt; không gộp hai nghĩa/skill khác nhau.
- API learner view cho phép sửa/ẩn; tutor chỉ nhận top relevant errors trong context budget.
- Test Unicode, bilingual direction, false positive, conflicting assessors và delete cascade.

**Exit:** golden set đạt precision/recall đã chốt; user có quyền xem/sửa/xóa; không log raw secret.

### Phase 08 — Mastery Engine

**Outcome:** Mastery deterministic, versioned và có thể recompute từ evidence.

- Chốt thang điểm, confidence, recency/decay, difficulty weight, negative evidence và minimum
  evidence; viết ADR công thức trước code.
- Bảng mastery snapshot + calculation version; source event/evidence IDs truy vết được.
- Pure function + batch recompute; shadow compare với progress/CEFR cũ trước cutover.
- Không cho AI trực tiếp ghi mastery; manual override phải có reason/audit/expiry.
- Simulation fixtures: learner mới, sparse/noisy/conflicting evidence, long inactivity.

**Exit:** recompute idempotent và khớp snapshot; sai lệch shadow trong ngưỡng; dashboard giải thích
được “vì sao điểm thay đổi”.

### Phase 09 — Diagnostic Engine

**Outcome:** Diagnostic tạo baseline đủ tin cậy với thời lượng/chi phí hữu hạn.

- Blueprint theo skill/CEFR, stop rules, item exposure, confidence target và accessibility fallback.
- State machine start → item → answer → score → next/stop → result; resume sau refresh.
- Chọn item deterministic theo seed/policy; không để model tự quyết đáp án đúng.
- Kết quả tạo assessment + evidence, không ghi mastery nếu incomplete/invalid.
- Đo completion time, abandonment, item discrimination và confidence calibration.

**Exit:** golden personas vào đúng band trong ngưỡng; resume/idempotency/cross-user tests xanh.

### Phase 10 — Assessment Engine

**Outcome:** Quiz/rubric/AI-assisted assessment dùng chung contract và audit.

- Rubric versioned theo task; deterministic scoring trước, AI chỉ ở phần cần ngôn ngữ mở.
- Validate structured AI score, range, evidence quote/reference; uncertainty và moderation rule.
- Human/admin override append-only; appeal/regrade không xóa kết quả cũ.
- Reliability set so sánh model/provider/version; threshold chặn rollout nếu regression.
- Transaction assessment result + evidence + outbox; exactly-once usage accounting.

**Exit:** assessment critical đạt agreement threshold; malformed/provider failure không corrupt state.

## 5. Wave C — Adaptive learning (Phase 11–20)

### Phase 11 — Workflow OS

- Xây workflow definition/version, instance, state, command, transition, timeout và history.
- Command có idempotency key; transition dùng optimistic lock; side effect qua outbox/job.
- Adapter đầu tiên cho diagnostic và tutor session; resume/cancel/expire/compensate rõ ràng.
- Test duplicate command, concurrent tab, crash giữa transition và event, old workflow version.
- **Exit:** replay/history tái hiện state; không double charge/double evidence.

### Phase 12 — Tutor Policy Engine

- Input typed: learner level/goal, mastery gaps, error memory, session state, plan entitlement.
- Output typed: pedagogical action, target skill, difficulty, correction depth, next-question policy.
- Rule priority/security/entitlement deterministic; policy version + explanation trace.
- Shadow-run cạnh prompt logic cũ; compare action distribution và outcome guardrails.
- **Exit:** golden policy cases 100%; AI không override permission/budget/domain invariant.

### Phase 13 — Tutor State Machine

- States: preparing, prompting, awaiting_input, assessing, correcting, planning_next, completed,
  cancelled, failed; định nghĩa transition table và terminal states.
- Persist turn/sequence/version; stale response và setState-after-unmount không commit.
- Resume đa thiết bị, cancel provider request, timeout và duplicate answer handling.
- **Exit:** integration test crash/retry/concurrent answer; session history không mất/lặp turn.

### Phase 14 — Tutor Agent

- TutorResponse schema: learner-facing message, correction, feedback, question, proposed next action,
  safety flags và references.
- Context builder chỉ lấy relevant profile/mastery/error/memory trong token budget; chống prompt
  injection từ learner/content/memory.
- Tool manifest allowlist; mọi mutation là proposal cho workflow/domain engine.
- Eval CEFR fit, correctness, tone, bilingual direction, injection, malformed/fallback/cost.
- **Exit:** agent replaceable theo provider; không unauthorized mutation; eval không dưới baseline.

### Phase 15 — Correction Engine

- Chuẩn hóa original span, corrected span, category, explanation, confidence, alternatives.
- Tách deterministic rules và AI suggestions; dedupe/rank; không “sửa” câu vốn đúng khi confidence
  thấp. Hỗ trợ Vietnamese↔English direction.
- Feedback của learner tạo labeled data, không tự đổi ground truth.
- **Exit:** golden set precision/recall và pedagogy threshold đạt; error memory chỉ nhận correction
  đã validate.

### Phase 16 — Difficulty Engine

- Difficulty theo skill/knowledge/task, không dùng một số CEFR cho mọi dạng bài.
- Khởi tạo từ metadata; cập nhật từ evidence aggregate có sample floor và version.
- Calibration/fairness slices theo level, direction, age group; giới hạn drift.
- **Exit:** simulated learner nhận item trong target success band; rollback model version được.

### Phase 17 — Curriculum OS

- Graph objective → skill → knowledge/activity, prerequisite, required/optional và release version.
- Authoring validator: cycle/orphan, coverage, duplicate, estimated duration, entitlement.
- Import lộ trình/CEFR hiện tại; compatibility mapping cho progress cũ.
- **Exit:** release manifest deterministic; một learner path được giải thích và rollback được.

### Phase 18 — Curriculum Agent

- Planner input learner gaps/goal/time/content availability; output plan proposal typed.
- Domain validator chặn prerequisite, unavailable content, over-budget, unsafe age content.
- Deterministic planner fallback khi AI lỗi; log reason/cost/version.
- **Exit:** scenario suite new/comeback/advanced/sparse-data; agent không trực tiếp publish curriculum.

### Phase 19 — Adaptive SRS

- Định nghĩa scheduler version, state per learner-item, rating mapping và timezone semantics.
- Adapter/migration từ `ts-fsrs` state hiện tại; shadow due dates, không giảm learned progress.
- Evidence/mastery ảnh hưởng scheduler qua policy rõ ràng; offline queue merge idempotent.
- Simulation retention/workload và test clock/DST/concurrent devices.
- **Exit:** due mismatch trong ngưỡng; không mất card; rollback về scheduler cũ có mapping.

### Phase 20 — Daily Plan

- Plan gồm date/timezone, goal, capacity phút, new/review/practice activities, rationale/version.
- Generator deterministic ưu tiên overdue SRS → weak skills → curriculum next; AI chỉ diễn đạt.
- Replan khi bỏ buổi/đổi thời gian; completion partial; freeze lịch sử mỗi ngày.
- **Exit:** capacity không vượt budget; test midnight/timezone/offline/empty content; learner xem được
  lý do và chỉnh pace.

## 6. Wave D — Memory, routing và voice (Phase 21–28)

### Phase 21 — Memory OS

- Phân loại working, episodic, semantic, preference, error và progress memory; owner/TTL/consent.
- Store metadata + encrypted/safe content reference; delete/export theo user; tenant isolation.
- Retrieval contract có purpose, filter, limit và redaction; không trả memory không liên quan.
- **Exit:** privacy threat model, cross-user negative tests, retention/delete job và audit xanh.

### Phase 22 — Memory Agent

- Agent chỉ đề xuất write/update/delete; policy validate type, confidence, consent và duplicate.
- Retrieval rank theo relevance/recency/authority, chống instruction injection trong memory.
- Learner UI xem/sửa/forget; provenance về session/evidence.
- **Exit:** eval retrieval usefulness/leakage; poison/injection/delete tests đạt.

### Phase 23 — Model Router

- Registry capability, context/output limit, region/privacy, cost và health theo provider/model.
- Routing policy theo task/tier/budget/quality; circuit breaker, timeout và deterministic fallback.
- Ghi actual provider/model/tokens/cost/latency; không log content nhạy cảm.
- **Exit:** benchmark gate + failure simulation; budget hard cap; route decision giải thích được.

### Phase 24 — Agent Router

- Registry agent manifest, permission, input/output, deadline và max depth.
- Delegation DAG có correlation/causation, cancel propagation, no-loop và partial failure policy.
- Result merge chỉ chấp nhận schema-valid proposal.
- **Exit:** timeout/cycle/duplicate/conflict tests; không vượt tool/data permission.

### Phase 25 — Multi-Agent Conflict Resolution

- Conflict types: factual, scoring, policy, plan, correction; giữ provenance/confidence.
- Deterministic authority order; high-impact ambiguity chuyển human/domain rule, không majority mù.
- Lưu resolution record/version và feedback outcome.
- **Exit:** adversarial fixtures; billing/permission/mastery không bao giờ do agent vote quyết định.

### Phase 26 — Agent Permissions

- Permission matrix theo agent/tool/resource/action/field; deny-by-default.
- Capability token nội bộ ngắn hạn gắn workflow/user/purpose; revoke và audit.
- Tool gateway validate schema, ownership, rate/cost và dry-run cho mutation.
- **Exit:** privilege escalation, confused deputy, replay, cross-user tests xanh.

### Phase 27 — Voice Intelligence

- Registry voice/provider/locale/gender/style/tier/capability/version; canonical voice ID.
- Policy chọn voice theo direction, learner pref, entitlement và task; fallback không đoán voice.
- Cache key bắt buộc lang/voice/rate/provider/version; usage/cost và hit/miss telemetry.
- **Exit:** parity client/server allowlist; locale/tier/fallback/cache collision tests; audio sample QA.

### Phase 28 — Pronunciation Profile

- Lưu aggregate phoneme/word/prosody difficulty với confidence, assessor/model version; raw audio có
  consent + TTL riêng.
- Evidence từ browser/Azure/provider khác normalized nhưng không giả vờ cùng độ tin cậy.
- Trend, recommended exercise và user correction/delete.
- **Exit:** benchmark accents/noise/device; không chấm Vietnamese bằng English model; privacy gate.

## 7. Wave E — Platform intelligence (Phase 29–36)

### Phase 29 — Event OS

- Nâng outbox tối thiểu thành schema registry, publisher worker, consumer registry, checkpoint,
  retry/backoff, dead-letter và replay tool.
- At-least-once delivery; consumer idempotent; ordering chỉ bảo đảm trong aggregate khi cần.
- Version evolution upcaster; retention/access policy; dashboard lag/failure.
- **Exit:** crash/replay/out-of-order/duplicate/schema-upgrade tests; business state vẫn đúng.

### Phase 30 — Job OS

- Job table/queue với type, payload version, schedule, lease, attempts, next_run, status và dedupe key.
- Worker heartbeat, lease expiry, exponential backoff, DLQ, cancel và concurrency limit.
- Chuyển reminder, recompute, reconciliation, retention/backfill sang registry có runbook.
- **Exit:** kill worker giữa job không double effect; dashboard/retry/manual recovery hoạt động.

### Phase 31 — Engineering Intelligence

- Thu lead time, deploy frequency, change failure, MTTR, flaky tests, coverage by risk và incident.
- Ownership map CODEOWNERS/module; PR template yêu cầu risk/evidence/rollback.
- Dashboard không thu nội dung learner; metric definition/version rõ ràng.
- **Exit:** review tháng đầu có action owner; dữ liệu CI/deploy khớp nguồn.

### Phase 32 — AI Benchmark

- Dataset versioned cho tutor/correction/assessment/routing/voice, chia train/dev/holdout.
- Evaluator deterministic + human rubric; chống tự chấm chỉ bằng cùng model đang test.
- Threshold quality/safety/format/cost/latency theo task; report diff trong CI/manual gate.
- **Exit:** prompt/model change bị chặn khi regression; baseline chạy tái lập được.

### Phase 33 — Learning Outcome

- Metric learning gain, retention, transfer, completion quality và confidence interval; tách activity.
- Cohort baseline, minimum sample, data quality checks, attribution caveat.
- Nối outcome với policy/curriculum version nhưng không tối ưu gây hại guardrail.
- **Exit:** dashboard có metric dictionary; một cohort analysis được review chuyên môn.

### Phase 34 — Experimentation OS

- Experiment/variant/assignment/exposure/outcome schemas; stable randomization và mutual exclusion.
- Pre-register hypothesis, primary/guardrail metric, sample/stop rule; consent/age restrictions.
- Kill switch và rollback; không đổi payment/auth/security qua experiment không duyệt.
- **Exit:** A/A test đạt; exposure/outcome join đúng; peeking/segment leakage checks.

### Phase 35 — Observability

- Central structured logs, metrics và tracing; request/correlation ID xuyên API→job→provider.
- SLO/error budget cho auth, learning save, AI, TTS, payment; alert có severity/runbook/owner.
- Synthetic smoke và incident drill; redaction/retention/access controls.
- **Exit:** dashboard production + alert drill; truy một failed learner flow end-to-end được.

### Phase 36 — Cost Intelligence

- Cost ledger theo task/provider/model/plan, actual khi có usage và estimate khi không.
- Budget daily/monthly, anomaly, quota forecast; reconciliation với hóa đơn provider.
- Model router dùng cost signal nhưng bị quality/safety floor chặn.
- **Exit:** sai lệch estimate/invoice trong ngưỡng; alert và hard cap simulation xanh.

## 8. Wave F — Release, hardening và hoàn tất (Phase 37–45)

### Phase 37 — Learner UI

- Thiết kế IA cho goal, diagnostic, daily plan, tutor, correction, mastery, error/memory và privacy.
- Mỗi view đủ loading/empty/error/offline/stale/conflict/permission states; giải thích nguồn và độ
  tin cậy, không gamification gây hiểu sai mastery.
- Mobile-first, keyboard/screen reader, 5 theme; analytics event không chứa nội dung nhạy cảm.
- **Exit:** E2E critical journeys, a11y AA/AAA gate hiện có, usability test và performance budget.

### Phase 38 — Backward Compatibility

- Lập matrix old client/new API, old/new data, workflow/event/schema versions và rollback window.
- Compatibility adapter, dual-read/write metric, deprecation header/log; freeze breaking changes.
- **Exit:** test N-1 client/fixtures; zero unknown consumer; removal plan được duyệt.

### Phase 39 — Data Migration

- Inventory/count/checksum/null/orphan trước migration; backup và restore rehearsal.
- Backfill chunked/idempotent với checkpoint/throttle; shadow compare và repair queue.
- Canary cohort → ramp; stop condition; source-of-truth switch; cleanup sau retention.
- **Exit:** reconciliation 100% hoặc waiver row-level có owner; recovery timed drill đạt RTO/RPO.

### Phase 40 — Security

- Threat model assets/actors/trust boundaries cho auth/admin/payment/AI/memory/audio/jobs/events.
- Authz matrix server-side; CSRF cho cookie mutation, session rotation/revoke, rate limit shared,
  webhook signature/idempotency, secret/key rotation, dependency/container/IaC scan.
- Prompt injection/data exfiltration/tool abuse tests; privacy retention/delete/export audit.
- **Exit:** 0 unresolved critical/high; medium có owner/deadline; incident tabletop hoàn tất.

### Phase 41 — Test Matrix

- Map requirement/risk → unit/integration/contract/E2E/load/security/eval; owner và environment.
- Postgres/provider fakes faithful; seed deterministic; clock/network/failure injection.
- Flaky budget, quarantine có expiry, mutation/branch coverage cho domain critical.
- **Exit:** 100% P0/P1 scenarios có automated evidence; CI duration/reliability trong budget.

### Phase 42 — Production Hardening

- Load/soak/chaos cho DB/Redis/provider/storage/jobs; timeout/backpressure/circuit breaker.
- Backup restore, zero-downtime deploy, rollback, migration failure và provider outage drills.
- Capacity thresholds, autoscale/manual scale runbook, disk/connection/quota alerts.
- **Exit:** SLO giữ trong representative load; RTO/RPO và rollback drill đạt.

### Phase 43 — Scale

- Xây workload model theo concurrent/session/request/token/audio/storage; không dùng vanity users.
- Profile bottleneck rồi mới tối ưu: DB indexes/pool, cache, queue, CDN, horizontal workers.
- Stage 1x→2x→5x target, cost envelope và stop conditions; data partition chỉ khi có evidence.
- **Exit:** target load đạt SLO + cost/user; không lỗi correctness/reconciliation dưới tải.

### Phase 44 — Architecture Governance

- ADR lifecycle proposed/accepted/superseded; module owner, dependency direction và forbidden import.
- Architecture tests/codemap gates, quarterly debt/risk review, deprecation budget.
- Exception/waiver có owner/expiry, không tồn tại vĩnh viễn.
- **Exit:** ownership đầy đủ; CI bắt vi phạm chính; một governance review thực tế hoàn tất.

### Phase 45 — Final Audit

- Chạy full learner proof: goal → diagnostic → learner model → gap → curriculum → daily plan →
  tutor → evidence → assessment/correction → mastery/error → SRS/memory → next session.
- Audit architecture/contracts/data/auth/payment/AI/voice/events/jobs/outcome/experiments/
  observability/cost/UI/compatibility/security/tests/hardening/scale/ADR.
- Reconcile docs với production commit/schema/config/dashboard; xóa claim lỗi thời.
- Lập release risk register; critical/high phải đóng, phần chấp nhận còn lại cần owner ký.
- Đóng rehearsal rollback/restore/incident/provider outage và handover vận hành.

**Exit cuối:** toàn bộ phase bắt buộc `accepted` hoặc waiver có chữ ký; benchmark/SLO/cost/outcome
đạt threshold; 0 defect critical về security/data integrity/payment; runbook và on-call owner rõ;
release tag tạo từ commit đã qua toàn bộ gates.

## 9. Thứ tự PR khuyến nghị ngay từ hiện trạng

Không bắt đầu Phase 02. Chuỗi PR gần nhất phải là:

1. **P01-A Payment atomicity:** sửa webhook `paid → entitlement`, integration Postgres, reconciliation.
2. **P00-A Test environment:** Postgres disposable + Express E2E, Cookie/Origin/IP parity.
3. **P00-B Critical traces:** hoàn thiện 8 trace, production metrics sample, owner risk register.
4. **P00-C Baseline sign-off:** cập nhật số liệu theo commit hiện hành và accepted Phase 00.
5. **P01-B Critical config/errors:** migrate payment/auth/AI critical env + compatible error envelope.
6. **P01-C Provider/telemetry:** hoàn thiện gateway taxonomy, request trace và usage exactly-once.
7. **P01-D Foundation sign-off:** canary, rollback rehearsal, accepted Phase 01.
8. **P02-A Contract package:** schema registry + fixtures, rồi từng vertical slice.

Mỗi PR phải nhỏ, deploy được độc lập và không gộp schema migration, sweeping refactor, UI redesign
và provider change trong cùng một diff.

## 10. Điều kiện tuyên bố dự án hoàn thành

Dự án chỉ hoàn thành khi đồng thời thỏa:

- Full learner loop chạy thật, resume được và tạo learner state từ evidence có provenance.
- Payment/usage/auth/admin/data deletion atomic hoặc reconciliation được, có alert/runbook.
- AI/agent/voice đều sau contract, permission, evaluation, cost budget và deterministic fallback.
- Migration/backward compatibility/rollback/restore đã rehearsal, không chỉ viết tài liệu.
- SLO, security, privacy, cost và learning outcome có số đo production.
- Test matrix bao phủ mọi P0/P1; không có flaky/waiver vô owner hoặc vô thời hạn.
- `PROGRESS.md`, ADR, schema, code và production dashboard nhất quán tại release commit.
