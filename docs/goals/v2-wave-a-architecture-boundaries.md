# Goal: V2 Wave A — Architecture & boundaries (V2-00 → V2-02)

| Thuộc tính        | Giá trị                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goal ID           | GOAL-2026-001                                                                                                                                                         |
| Owner             | seeker19110 (product/architecture quyết định); AI thực thi từng slice                                                                                                 |
| Trạng thái        | BLOCKED                                                                                                                                                               |
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

| ID    | Outcome/AC                                    | Dependency | Spec                                 | Issue | PR   | State   | Evidence                                                     |
| ----- | --------------------------------------------- | ---------- | ------------------------------------ | ----- | ---- | ------- | ------------------------------------------------------------ |
| M1/S1 | V2-00 inventory ownership map (first pass)    | —          | `docs/architecture-v2/21-ROADMAP.md` | —     | #548 | DONE    | Merged `main` `857df19`                                      |
| M1/S2 | V2-00 trace 8 critical flows end-to-end       | S1         | `V2-00-CRITICAL-FLOWS.md`            | —     | (mở) | DONE    | `docs/architecture-v2/V2-00-CRITICAL-FLOWS.md` mục 1          |
| M1/S3 | V2-00 risk register có owner                  | S1         | `V2-00-CRITICAL-FLOWS.md`            | —     | (mở) | DONE    | Cùng tài liệu mục 2 — 7 risk, mỗi risk có owner/state          |
| M1/S4 | V2-00 latency/cost baseline sản xuất thật     | S1         | `V2-00-CRITICAL-FLOWS.md`            | —     | (mở) | WAITING | Mục 3 — cần owner/quyền SSH VPS, AI không tự đo được từ xa    |
| M2/S1 | V2-01 ADR domain boundary                     | M1 đóng?   | chưa viết                            | —     | —    | BACKLOG | Chờ owner: bắt đầu trước hay sau khi M1 đóng hẳn — xem mục 5 |
| M3/S1 | V2-02 field-by-field contract diff + gap list | M2         | chưa viết                            | —     | —    | BACKLOG | —                                                            |

State hợp lệ: BACKLOG / RESEARCH / SPEC / READY / BUILDING / VERIFYING / WAITING / BLOCKED /
DONE / DROPPED.

## 4. Risk register

| Risk                                                                | Trigger/guardrail                                  | Mitigation/rollback                                                       | Owner    | State |
| ------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- | -------- | ----- |
| Viết trùng contract V2-02 lên contract Phase 02 (v1) đang dùng thật | Bất kỳ PR nào sửa `packages/core-contracts/*.ts`   | Field-by-field diff (M3/S1) trước khi sửa; adapter, không breaking rename | chưa gán | OPEN  |
| Domain boundary ADR (V2-01) áp sai lên `english.*` production       | PR đổi import/dependency rule chạm `apps/english/` | Review kỹ trước merge; lint boundary chạy ở CI trước khi enforce          | chưa gán | OPEN  |
| Goal file trôi khỏi trạng thái thật của `main`                      | Mỗi vòng không reload trước khi ghi                | Bước 1 thuật toán `AI_DELIVERY_LOOP.md` bắt buộc reload                   | AI       | OPEN  |

## 5. Current truth

- Commit `main` đã reconcile: `c0fabd1` (2026-08-16, sau khi merge #554 mở goal file này).
- Goal gap hiện tại: M1/S1 DONE. **M1/S2, M1/S3 nay DONE** (lượt 2026-08-16 thứ hai — owner chọn
  hướng (a)). M1/S4 WAITING (chỉ còn thiếu số liệu latency/cost production thật, cần quyền SSH
  VPS mà phiên AI này không có — không tự bịa số). M2, M3 vẫn BACKLOG.
- **Phát hiện phụ trong lúc trace luồng (không phải mục tiêu chính nhưng có giá trị):**
  `packages/core-billing/payment-webhook.ts` KHÔNG bọc `UPDATE payments SET status='paid'` +
  `grantPlanDays()` trong 1 transaction Postgres — nếu `grantPlanDays()` lỗi sau khi đã set
  `status='paid'`, user mất tiền nhưng không được cấp gói, và SePay retry sau đó bị chặn bởi
  nhánh idempotent `status==='paid'` nên KHÔNG tự phục hồi. Chi tiết + fix đề xuất:
  `docs/architecture-v2/V2-00-CRITICAL-FLOWS.md` risk register mục 1. Đây là bug production thật
  (không phải suy đoán — đã đọc code xác nhận), nhưng SỬA nó đụng `packages/core-billing` mà
  budget/guardrail của goal này (mục "Thuộc tính" đầu file) **cấm sửa code sản xuất trong Wave A**
  — nên KHÔNG tự sửa ở đây, cần owner quyết định có mở 1 PR riêng ngoài Wave A để fix ngay hay để
  backlog.
- Blocker/câu hỏi mở: (1) owner có muốn mở PR riêng fix bug atomicity payment ở trên ngay không —
  ngoài phạm vi goal này nhưng phát hiện trong lúc làm goal này; (2) hướng tiếp theo cho Wave A —
  coi M1 đủ để chuyển M2 (V2-01 ADR) dù M1/S4 latency thật chưa đo được, hay chờ có quyền VPS mới
  đóng M1 hẳn rồi mới sang M2. Cả hai đều là quyết định phạm vi/kiến trúc — AI không tự chọn.
- Next best slice và lý do: nếu owner xác nhận M1 đủ để chuyển tiếp → M2/S1 (V2-01 ADR domain
  boundary), cần đọc kỹ `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` trước khi viết.
- Quyền hoặc quyết định cần thêm: owner trả lời 2 câu hỏi ở mục "Blocker" trên.

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
