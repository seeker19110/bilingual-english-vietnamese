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
| M1/S2 | V2-00 trace 8 critical flows end-to-end       | S1         | chưa viết                            | —     | —    | BACKLOG | —                                                            |
| M1/S3 | V2-00 risk register có owner                  | S1         | chưa viết                            | —     | —    | BACKLOG | —                                                            |
| M1/S4 | V2-00 latency/cost baseline sản xuất thật     | S1         | chưa viết                            | —     | —    | BACKLOG | —                                                            |
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

- Commit `main` đã reconcile: `23fbe0f` (2026-08-16, sau khi merge #549 "standardize idea-to-product
  delivery" — chính PR đưa quy trình này vào repo).
- Goal gap hiện tại: M1/S1 (inventory) đã DONE. M1/S2-S4, M2, M3 đều BACKLOG — chưa có spec cho
  bất kỳ slice nào trong số đó.
- Blocker/câu hỏi mở: **cần owner chọn hướng kế tiếp** — (a) làm tiếp phần còn thiếu của V2-00
  (M1/S2-S4) cho tới khi gate V2-00 đóng hẳn theo đúng thứ tự roadmap, hay (b) nhảy thẳng sang
  V2-01 ADR (M2/S1) dùng inventory hiện có làm nền, chấp nhận M1 chưa đóng hẳn. Đây là quyết định
  phạm vi/kiến trúc — theo `AGENTS.md` mục "Large-goal AI loop" và stop condition trong
  `docs/AI_DELIVERY_LOOP.md` mục 8 ("quyết định product/architecture quan trọng còn mở"), AI không
  tự chọn.
- Next best slice và lý do: chưa chọn — phụ thuộc câu trả lời trên. Nếu owner chọn (a): M1/S2
  (trace 8 luồng) có giá trị risk-reduction cao nhất vì nó là điều kiện của gate roadmap tự đặt ra.
  Nếu owner chọn (b): M2/S1 cần research trước (đọc kỹ `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md`
  để viết ADR đúng).
- Quyền hoặc quyết định cần thêm: owner xác nhận hướng (a) hay (b) ở trên.

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
