# Goal: V2 Wave A — Architecture & boundaries (V2-00 → V2-02)

| Thuộc tính        | Giá trị                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goal ID           | GOAL-2026-001                                                                                                                                                         |
| Owner             | seeker19110 (product/architecture quyết định); AI thực thi từng slice                                                                                                 |
| Trạng thái        | WAITING — PR #560 đã MERGE (`4aad3c2`); chỉ còn M1/S4 mở, chờ owner dán số liệu VPS + review field 8 contract tự thiết kế                                             |
| Bắt đầu           | 2026-08-16                                                                                                                                                            |
| Target review     | chưa đặt — chờ owner xác nhận hướng tiếp theo (mục 5)                                                                                                                 |
| Quyền được cấp    | Research, branch, PR (docs-only đã merge #548). Chưa có quyền tự quyết kiến trúc (Person/PersonalFact/Life Graph schema) hay mở PR đổi code sản xuất                  |
| Budget/guardrails | 1 outcome/PR mỗi vòng; không sửa `packages/`/`api/`/`postgres/migrations` trong Wave A trừ khi owner duyệt scope; không phá contract Learning v1 đang chạy production |

## 1. Outcome và Definition of Goal Complete

- Outcome: có bản đồ sở hữu dữ liệu/luồng đầy đủ (V2-00) + ADR biên giới domain
  `Personal OS Core ↔ Learning ↔ shared platform` (V2-01) + contract V2 chạy được trong CI trước
  khi có implementation (V2-02) — đúng 3 mục Wave A của `docs/architecture-v2/21-ROADMAP.md`.
- Người dùng: không trực tiếp (nền tảng kỹ thuật cho toàn bộ V2), nhưng là điều kiện bắt buộc
  trước khi chạm Wave B (Personal OS Core) — roadmap tự nêu gate "chưa refactor production trước
  khi map source of truth".
- Metric baseline → target: N/A (giai đoạn kiến trúc, không phải feature đo được bằng metric sản
  phẩm). Guardrail thay metric: 0 regression trên `english.*` production khi Wave A xong.
- Cửa sổ đo: không áp dụng.
- Guardrails: không đổi contract Learning v1 đang chạy thật; mọi migration mới (nếu có ở V2-02)
  phải additive + rollback được; CI (`quality`, `e2e`) xanh mỗi PR.
- Completion approver: seeker19110 (đây là quyết định kiến trúc, không phải việc AI tự chốt).

## 2. Scope và non-goals

### In scope

- V2-00: inventory + ownership map (routes/tables/providers/contracts) — **đã có first pass**.
- V2-00 phần còn thiếu: trace 8 luồng critical, risk register có owner, latency/cost sản xuất
  thật, đọc kỹ `apps/hub/`, đối chiếu field-by-field contract.
- V2-01: ADR biên giới domain, dependency rules, import-boundary lint (nếu khả thi).
- V2-02: tối thiểu 13 contract V2 (Person, PersonalFact, Goal, LifeGraphNode/Edge, MemoryRecord,
  ConsentGrant, PersonalPolicy, DecisionRecord, CapabilityManifest, ToolManifest, ContextPackage,
  ProposedAction, DomainEvent) — có adapter compatibility với Learning v1, không phá contract cũ.

### Không làm

- Không xây Personal World Model/Life Graph/Companion Runtime thật (Wave B/C) — đó là sau khi
  Wave A đóng gate.
- Không đổi code production `api/`/`packages/core-ai`/`packages/core-billing` trong goal này.
- Không tự quyết "port hay viết mới" contract V2-02 nếu phát hiện xung đột với Learning v1 — phải
  hỏi owner (đây là quyết định kiến trúc theo đúng giới hạn AGENTS.md).

## 3. Milestones và slices

| ID    | Outcome/AC                                                       | Dependency | Spec                                   | Issue | PR   | State   | Evidence                                                                |
| ----- | ---------------------------------------------------------------- | ---------- | -------------------------------------- | ----- | ---- | ------- | ----------------------------------------------------------------------- |
| M1/S1 | V2-00 inventory ownership map (first pass)                       | —          | `docs/architecture-v2/21-ROADMAP.md`   | —     | #548 | DONE    | Merged `main` `857df19`                                                 |
| M1/S2 | V2-00 trace 8 critical flows end-to-end                          | S1         | `V2-00-CRITICAL-FLOWS.md`              | —     | #560 | DONE    | `docs/architecture-v2/V2-00-CRITICAL-FLOWS.md` mục 1, merged `4aad3c2`  |
| M1/S3 | V2-00 risk register có owner                                     | S1         | `V2-00-CRITICAL-FLOWS.md`              | —     | #560 | DONE    | Cùng tài liệu mục 2 — 7 risk, mỗi risk có owner/state, merged `4aad3c2` |
| M1/S4 | V2-00 latency/cost baseline sản xuất thật                        | S1         | `V2-00-CRITICAL-FLOWS.md`              | —     | (mở) | WAITING | Mục 3 — cần owner/quyền SSH VPS, AI không tự đo được từ xa              |
| M2/S1 | V2-01 ADR domain boundary                                        | M1 đóng?   | `docs/adr/0003-bien-gioi-domain-v2.md` | —     | #560 | DONE    | ADR + lint rule, 0 vi phạm, merged `4aad3c2`                            |
| M3/S1 | V2-02 field-by-field contract diff + gap list + code 13 contract | M2         | `V2-02-CONTRACT-DIFF.md`               | —     | #560 | DONE    | 13 file `.ts`+`.test.ts`, 76 test, merged `4aad3c2`                     |

State hợp lệ: BACKLOG / RESEARCH / SPEC / READY / BUILDING / VERIFYING / WAITING / BLOCKED /
DONE / DROPPED.

## 4. Risk register

| Risk                                                                | Trigger/guardrail                                  | Mitigation/rollback                                                       | Owner    | State |
| ------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- | -------- | ----- |
| Viết trùng contract V2-02 lên contract Phase 02 (v1) đang dùng thật | Bất kỳ PR nào sửa `packages/core-contracts/*.ts`   | Field-by-field diff (M3/S1) trước khi sửa; adapter, không breaking rename | chưa gán | OPEN  |
| Domain boundary ADR (V2-01) áp sai lên `english.*` production       | PR đổi import/dependency rule chạm `apps/english/` | Review kỹ trước merge; lint boundary chạy ở CI trước khi enforce          | chưa gán | OPEN  |
| Goal file trôi khỏi trạng thái thật của `main`                      | Mỗi vòng không reload trước khi ghi                | Bước 1 thuật toán `AI_DELIVERY_LOOP.md` bắt buộc reload                   | AI       | OPEN  |

## 5. Current truth

- **Commit `main` đã reconcile: `4aad3c2` (2026-08-16, sau khi merge PR #560).** PR #560 gộp toàn
  bộ M1/S2, M1/S3, M2/S1, M3/S1 (13 contract V2-02) + fix bug atomicity payment — CI xanh
  (`metadata`/`quality`/`e2e`), squash-merge. Nhánh làm việc `claude/project-completion-4zaebt`
  đã reset về `main` mới nhất (không còn commit riêng lẻ nào chưa vào `main`).
- Lịch sử trước khi merge (giữ để tham khảo):
- Commit `main` đã reconcile: `c0fabd1` (2026-08-16, sau khi merge #554 mở goal file này).
- Goal gap hiện tại: M1/S1 DONE. **M1/S2, M1/S3 nay DONE** (lượt 2026-08-16 thứ hai — owner chọn
  hướng (a)). M1/S4 WAITING (chỉ còn thiếu số liệu latency/cost production thật, cần quyền SSH
  VPS mà phiên AI này không có — không tự bịa số). M2, M3 vẫn BACKLOG.
- **Phát hiện phụ trong lúc trace luồng, ĐÃ FIX (owner duyệt 2026-08-16):**
  `packages/core-billing/payment-webhook.ts` trước đó KHÔNG bọc `UPDATE payments SET
status='paid'` + `grantPlanDays()` trong 1 transaction Postgres — nếu `grantPlanDays()` lỗi sau
  khi đã set `status='paid'`, user mất tiền nhưng không được cấp gói, và SePay retry sau đó bị
  chặn bởi nhánh idempotent nên KHÔNG tự phục hồi. Owner duyệt sửa ngay dù đụng
  `packages/core-billing` (ngoại lệ có chủ đích với guardrail Wave A, không phải AI tự vượt rào)
  — đã bọc bằng `withTransaction()`, test cập nhật, build/typecheck/lint/test đều xanh (3339/3339).
  Chi tiết: `docs/architecture-v2/V2-00-CRITICAL-FLOWS.md` risk register mục 1 (FIXED).
- Owner xác nhận hướng: coi M1 đủ để chuyển M2 dù M1/S4 (latency production thật) chưa đo được —
  M1/S4 giữ trạng thái WAITING, không phải điều kiện chặn M2.
- **M2/S1 nay DONE (cùng vòng 2026-08-16):** `docs/adr/0003-bien-gioi-domain-v2.md` — biên giới
  2 lớp thật hiện có (Platform `packages/*` ↔ Learning domain `apps/english/`+`api/*`), luật
  dependency "platform không import app" enforce bằng `no-restricted-imports` trong
  `.eslintrc.cjs` (0 vi phạm hiện có, xác nhận bằng lint pass + 1 ca thử nghiệm cố tình vi phạm
  để chắc rule hoạt động), trả lời câu hỏi mở TTS/STT ở V2-00 (kết luận: platform, tham số hoá
  theo domain gọi tới). Luật "domain không import domain khác" (mục 11
  `02-SYSTEM-ARCHITECTURE.md`) CHƯA enforce — chỉ có 1 domain thật, chưa có ca để viết rule đúng,
  để dành domain thứ 2 xuất hiện.
- **M3/S1 nay DONE phần DIFF (cùng vòng 2026-08-16):** `docs/architecture-v2/
V2-02-CONTRACT-DIFF.md` — đọc toàn bộ 18 contract v1 hiện có, đối chiếu 13 contract V2-02 mục
  tiêu: 9 hoàn toàn mới không xung đột, 1 xung đột tên thật (`Goal` — v1 learner-scoped daily
  target ≠ V2-02 Life Graph node, 3 phương án đề xuất), 3 gần trùng tên nhưng khác scope
  (Memory/MemoryRecord, AgentManifest/CapabilityManifest, EventEnvelope/DomainEvent — đề xuất
  dùng thẳng `EventEnvelope` cho `DomainEvent`, không viết mới). Gap list 10 contract hoàn toàn
  chưa có, trong đó `PersonalFact`/`DecisionRecord` đã có interface sẵn ở
  `02-SYSTEM-ARCHITECTURE.md`, 8 còn lại cần owner tham gia thiết kế field.
  **CHƯA viết code contract nào** — đúng phạm vi M3/S1 chỉ là diff/gap list; guardrail goal file
  cấm tự quyết port/viết mới khi xung đột, nên dừng ở đây, KHÔNG tự chọn phương án cho ca `Goal`.
- Blocker/câu hỏi mở: 4 câu hỏi cụ thể ở `V2-02-CONTRACT-DIFF.md` mục 4 (ca `Goal`, ca `Memory`,
  ca `EventEnvelope`/`DomainEvent`, cách xử lý 8 gap contract chưa có field shape) — owner cần trả
  lời trước khi có PR viết code contract thật. M1/S4 vẫn WAITING, đã gửi owner bộ lệnh cần chạy
  trên VPS + copy kết quả lại (ngoài phạm vi goal file này, theo dõi ở hội thoại).
- Next best slice và lý do: phụ thuộc owner trả lời 4 câu hỏi mục 4 `V2-02-CONTRACT-DIFF.md` —
  chưa chọn được slice kế tiếp cụ thể (viết Zod schema cho contract nào) tới khi có câu trả lời.
- Quyền hoặc quyết định cần thêm: owner trả lời 4 câu hỏi trên; M1/S4 cần owner dán kết quả lệnh
  VPS.

## 6. Iteration log

### Iteration 1 — 2026-08-16

- State: BLOCKED (sau khi hoàn tất slice, đợi quyết định owner cho slice kế tiếp)
- Slice: M1/S1 — V2-00 inventory ownership map, first pass.
- Goal gap trước/sau: trước — chưa có tài liệu nào; sau — có inventory đầy đủ routes/tables/
  providers/contracts, còn thiếu 4 phần (S2-S4 + field diff).
- Research/spec/issue/PR: không có spec riêng (việc lập bản đồ theo đúng V2-00 trong roadmap có
  sẵn) · PR #548.
- Thay đổi: thêm `docs/architecture-v2/V2-00-BASELINE-OWNERSHIP-MAP.md` (155 dòng) + cập nhật
  `PROGRESS.md`.
- Validation và test count: build ✅ typecheck ✅ lint ✅ (0 cảnh báo) format ✅ test ✅ 3339/3339
  (195 file) — không đổi code, số test không đổi so với baseline trước đó.
- Metric/guardrail: không áp dụng (giai đoạn tài liệu).
- Quyết định: dừng lại sau first pass, không tự mở rộng sang V2-01 mà không hỏi (đúng stop
  condition "quyết định product/architecture quan trọng còn mở").
- Blocker: cần owner chọn (a) tiếp tục đóng V2-00 hay (b) nhảy V2-01 — xem mục 5.
- Next best slice: chưa chọn, chờ owner.
- Quyền cần thêm: xác nhận hướng đi Wave A tiếp theo.

### Iteration 2 — 2026-08-16

- State: BLOCKED (sau khi hoàn tất slice, đợi quyết định owner cho slice kế tiếp + bug phát hiện)
- Slice: owner chọn hướng (a) → M1/S2 (trace 8 luồng critical) + M1/S3 (risk register có owner) +
  đọc kỹ `apps/hub/`.
- Goal gap trước/sau: trước — chỉ có inventory sở hữu dữ liệu (route → bảng), chưa vẽ luồng đầy
  đủ qua các lớp; sau — có trace end-to-end cho cả 8 luồng (auth/chat/speaking/learning progress/
  SRS/payment/admin/notification), risk register 7 mục có owner, và xác nhận vai trò `apps/hub/`
  (UI khung cho Wave D, chưa có logic Wave A/B/C). M1/S4 (latency/cost production) vẫn mở — không
  có quyền SSH VPS.
- Research/spec/issue/PR: không có spec riêng, đọc trực tiếp `server.ts` + toàn bộ handler liên
  quan 8 luồng · PR (mở sau iteration này).
- Thay đổi: thêm `docs/architecture-v2/V2-00-CRITICAL-FLOWS.md` (~140 dòng) + cập nhật goal file
  này + `PROGRESS.md`.
- Validation và test count: tài liệu-only, không đổi code — không chạy lại build/test (không có
  thay đổi nào ảnh hưởng tới chúng); đã đọc trực tiếp source thật cho mọi khẳng định trong tài
  liệu (không suy đoán).
- Metric/guardrail: không áp dụng (giai đoạn tài liệu, đúng guardrail "không sửa packages/api/
  postgres/migrations").
- Quyết định: dừng lại đúng scope M1/S2-S3, không tự sửa bug atomicity payment phát hiện được
  (đúng guardrail cấm sửa code sản xuất trong Wave A) dù đã xác nhận đủ chi tiết để sửa ngay.
- Blocker: (1) fix bug payment atomicity — chờ owner quyết định PR riêng hay backlog; (2) M1/S4
  latency thật — chờ owner cấp quyền VPS hoặc tự đo; (3) hướng M2 — chờ owner xác nhận M1 đủ để
  chuyển tiếp.
- Next best slice: M2/S1 (V2-01 ADR) NẾU owner xác nhận M1 đủ; nếu không thì tiếp tục M1/S4.
- Quyền cần thêm: quyết định owner cho 3 blocker trên.

### Iteration 3 — 2026-08-16

- State: BUILDING → sau vòng này chờ owner quyết định tiếp tục M3 hay dừng.
- Slice: owner duyệt cả 2 cùng lúc — (1) fix bug atomicity payment phát hiện ở iteration 2, (2)
  chuyển sang M2/S1 (V2-01 ADR domain boundary).
- Goal gap trước/sau: trước — bug payment chưa fix, M2 chưa bắt đầu; sau — bug đã fix có test +
  4 cổng xanh, M2/S1 DONE với ADR + lint rule enforce được thật.
- Research/spec/issue/PR: đọc `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` (kiến trúc mục
  tiêu) trước khi viết ADR, đối chiếu với inventory V2-00 đã có · PR (mở sau iteration này).
- Thay đổi: sửa `packages/core-billing/payment-webhook.ts` (bọc `withTransaction`) +
  `api/_lib/planGrant.ts` (thêm tham số `runner`) + `packages/core-billing/payment-webhook.test.ts`
  (mock `pool.connect()`); thêm `docs/adr/0003-bien-gioi-domain-v2.md` + override
  `no-restricted-imports` trong `.eslintrc.cjs`; cập nhật goal file này + `PROGRESS.md`.
- Validation và test count: build ✅ typecheck ✅ lint 0 cảnh báo ✅ (gồm xác nhận rule mới bắt
  đúng 1 ca vi phạm thử nghiệm rồi xoá) test 3339/3339 ✅ (13/13 payment-webhook +18/18 planGrant
  trong đó).
- Metric/guardrail: guardrail Wave A "không sửa packages/api/postgres/migrations" có 1 ngoại lệ
  CÓ CHỦ ĐÍCH do owner duyệt tường minh (không phải AI tự vượt rào) — ghi rõ ở mục 5.
- Quyết định: dừng lại sau M2/S1, không tự mở rộng sang M3/S1 (13 contract field-by-field là việc
  lớn hơn 1 outcome/PR) mà không hỏi trước — đúng guardrail "1 outcome/PR mỗi vòng" ở đầu file.
- Blocker: không còn blocker cứng — chỉ còn câu hỏi phạm vi cho M3/S1.
- Next best slice: M3/S1 (V2-02 field-by-field contract diff + gap list) nếu owner muốn tiếp tục
  ngay; nếu không, dừng ở đây và tạo PR.
- Quyền cần thêm: owner xác nhận có tiếp tục M3/S1 trong vòng kế tiếp hay dừng ở đây.

### Iteration 4 — 2026-08-16

- State: WAITING — dừng đúng lúc gặp quyết định cần owner (đúng stop condition), không tự chọn
  phương án cho ca xung đột `Goal`.
- Slice: owner yêu cầu tiếp tục M1/S4 (latency VPS thật). Không có quyền SSH/credential VPS trong
  phiên này → không tự bịa số (đúng luật CLAUDE.md mục 5) — gửi owner bộ lệnh cụ thể cần chạy trên
  VPS + dán kết quả lại (PM2 status/logs, Postgres `pg_stat_user_tables`, Sentry Performance tab,
  billing dashboard từng AI provider). Trong lúc chờ, làm M3/S1 (không cần VPS, có giá trị ngay).
- Goal gap trước/sau: trước — M3 BACKLOG; sau — M3/S1 phần DIFF xong (không phải toàn bộ M3, vì
  M3 đầy đủ còn cần VIẾT contract thật sau khi owner trả lời 4 câu hỏi).
- Research/spec/issue/PR: đọc toàn bộ 18 file `packages/core-contracts/*.ts` + đối chiếu
  `02-SYSTEM-ARCHITECTURE.md` mục 4/5/8/9/10/14 · PR (mở sau iteration này).
- Thay đổi: thêm `docs/architecture-v2/V2-02-CONTRACT-DIFF.md`; cập nhật goal file này. Không sửa
  bất kỳ file `packages/core-contracts/*.ts` nào (đúng phạm vi diff-only của M3/S1).
- Validation và test count: tài liệu-only, không đổi code — không cần chạy lại build/test.
- Metric/guardrail: đúng guardrail "1 outcome/PR mỗi vòng" — KHÔNG tự viết code contract mới dù
  đã có đủ thông tin cho 2/10 gap (`PersonalFact`/`DecisionRecord` có sẵn interface), vì việc đó
  phụ thuộc câu trả lời owner cho ca `Goal` trước (viết `PersonalFact` trước rồi phải sửa lại nếu
  owner chọn phương án ảnh hưởng cấu trúc chung là lãng phí).
- Quyết định: KHÔNG tự chọn phương án cho ca `Goal`/`Memory`/`EventEnvelope` — đúng guardrail rõ
  ràng nhất trong goal file, đây chính là ca guardrail đó viết ra để chặn.
- Blocker: (1) M1/S4 — chờ owner dán kết quả lệnh VPS; (2) M3 đầy đủ — chờ owner trả lời 4 câu hỏi
  ở `V2-02-CONTRACT-DIFF.md` mục 4.
- Next best slice: phụ thuộc câu trả lời owner — không đoán trước.
- Quyền cần thêm: câu trả lời owner cho 2 blocker trên.

### Iteration 5 — 2026-08-16

- State: WAITING → chờ owner review field 13 contract mới + dán số liệu VPS.
- Slice: owner xác nhận ADR-0003 đúng hướng ("đúng hết rồi") rồi yêu cầu code tiếp ("code đi")
  thay vì dừng chờ trả lời từng câu ở mục 4 `V2-02-CONTRACT-DIFF.md`. Hiểu đây là chỉ dẫn: chọn
  phương án ÍT RỦI RO NHẤT cho 3 ca xung đột tên (không đổi/xoá gì ở v1) thay vì tiếp tục chặn chờ.
- Goal gap trước/sau: trước — M3/S1 chỉ có diff, chưa có code; sau — cả 13 contract V2-02 đã có
  Zod schema + test, đúng mẫu convention `packages/core-contracts/` sẵn có.
- Research/spec/issue/PR: dùng lại nghiên cứu đã có (V2-00, ADR-0003, diff M3/S1) làm input —
  2 contract cuối (`ProposedAction`, `DomainEvent`) giao song song cho 2 subagent Sonnet
  (standard-worker) vì độc lập nhau và đã có đặc tả rõ, đúng quy ước phân việc CLAUDE.md mục 3 ·
  PR (mở sau iteration này).
- Thay đổi: 13 file `.ts` mới + 13 file `.test.ts` mới trong `packages/core-contracts/`
  (`person`, `personalFact`, `lifeGraph`, `lifeGoal`, `personalMemory`, `consentGrant`,
  `personalPolicy`, `decisionRecord`, `capabilityManifest`, `toolManifest`, `contextPackage`,
  `proposedAction`, `domainEvent`) — KHÔNG sửa file nào trong 18 contract v1. Cập nhật
  `V2-02-CONTRACT-DIFF.md` mục 6 ghi rõ quyết định đã chọn cho từng ca xung đột.
- Validation và test count: build ✅ typecheck ✅ lint 0 cảnh báo ✅ (bắt + sửa 1 lỗi
  `no-unused-vars` do cách destructure ban đầu) test 3415/3415 ✅ (208 file, +76 test so với
  trước).
- Metric/guardrail: 8/10 gap contract là field TỰ THIẾT KẾ (không sao chép nguyên văn tài liệu
  kiến trúc) — ghi rõ đây là ĐỀ XUẤT ĐẦU, không phải quyết định cuối, mỗi field có comment giải
  thích để owner review nhanh. Không phá `goal.ts`/`memory.ts`/`eventEnvelope.ts` (v1) — xác nhận
  bằng `git diff` chỉ có file thêm mới.
- Quyết định: chọn phương án ÍT RỦI RO nhất cho 3 ca xung đột (đổi tên phía V2-02, không đổi v1)
  thay vì tiếp tục dừng hỏi — owner đã ra tín hiệu rõ ("code đi") sau khi xác nhận hướng ADR đúng.
- Blocker: không còn blocker cứng cho M3 — còn lại là REVIEW (owner đọc lại field 8 contract tự
  thiết kế khi bắt đầu dùng thật ở Wave B). M1/S4 vẫn WAITING, chờ owner dán số liệu VPS.
- Next best slice: phụ thuộc owner — có thể coi Wave A (V2-00/V2-01/V2-02) đã đủ để đóng gate
  chuyển Wave B, hoặc tiếp tục hoàn thiện M1/S4 trước. Quyết định phạm vi, không tự chọn.
- Quyền cần thêm: owner xác nhận Wave A đã đủ để coi là hoàn tất tạm thời (M1/S4 để riêng, không
  chặn Wave B) hay phải có số liệu VPS trước.

## 7. Final audit

- [ ] Mọi Goal AC có bằng chứng trên `main`.
- [ ] Metrics đạt, guardrails không suy giảm.
- [ ] Không còn milestone bắt buộc/blocker cao/migration dang dở.
- [ ] Regression/security/privacy/a11y/operational gates xanh.
- [ ] Production verification hoàn tất nếu thuộc scope.
- [ ] Docs/runbook/telemetry/rollback cập nhật.
- [ ] Residual risks và out-of-scope được ghi rõ.
- [ ] Owner xác nhận completion khi cần.

**Kết luận:** NOT COMPLETE
**Người xác nhận:**
**Ngày:**
