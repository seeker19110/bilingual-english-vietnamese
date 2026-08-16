# V2-02 — Field-by-field contract diff + gap list

Status: M3/S1 của `docs/goals/v2-wave-a-architecture-boundaries.md`. Date: 2026-08-16. Nguồn: đọc
trực tiếp toàn bộ 18 file `packages/core-contracts/*.ts` (trừ `version.ts`/`pipeline.ts` — hạ tầng
dùng chung, không phải entity) tại commit sau `337c869`, đối chiếu với 13 contract V2-02 roadmap
liệt kê ở `docs/architecture-v2/21-ROADMAP.md` mục "V2-02 — Core contracts" và hình dạng gợi ý ở
`docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` (mục 4 `PersonalFact`, mục 5 Life Graph, mục 8
`DecisionRecord`, mục 9 `CapabilityManifest`).

**Kết luận sớm quan trọng nhất:** cả 18 contract hiện có đều là **Phase 02/03 "English Tutor OS"
v1** (frozen theo `PROGRESS.md` — "Adopt Personal OS architecture V2 and freeze V1") — TẤT CẢ
khoá theo `learnerId` (English domain), KHÔNG có bất kỳ contract nào khoá theo `personId`
(Personal OS Core). Đây đúng như V2-00 đã xác nhận: Personal OS Core hiện có 0 dòng code.

## 1. Bảng đối chiếu 13 contract V2-02 mục tiêu ↔ hiện trạng

| #   | Contract V2-02 (roadmap)        | Có contract v1 tên giống/gần?                         | Xung đột tên?        |
| --- | ------------------------------- | ----------------------------------------------------- | -------------------- |
| 1   | `Person`                        | Không có                                              | Không                |
| 2   | `PersonalFact`                  | Không có                                              | Không                |
| 3   | `Goal`                          | **CÓ — `goal.ts`, khác hoàn toàn shape**              | **CÓ — trùng tên**   |
| 4   | `LifeGraphNode`/`LifeGraphEdge` | Không có                                              | Không                |
| 5   | `MemoryRecord`                  | **CÓ tên gần — `memory.ts` (`Memory`)**               | Gần trùng, không hẳn |
| 6   | `ConsentGrant`                  | Không có                                              | Không                |
| 7   | `PersonalPolicy`                | Không có                                              | Không                |
| 8   | `DecisionRecord`                | Không có (chỉ có gợi ý shape ở tài liệu, chưa code)   | Không                |
| 9   | `CapabilityManifest`            | **CÓ tên gần — `agentManifest.ts` (`AgentManifest`)** | Gần trùng, không hẳn |
| 10  | `ToolManifest`                  | Không có                                              | Không                |
| 11  | `ContextPackage`                | Không có                                              | Không                |
| 12  | `ProposedAction`                | Không có                                              | Không                |
| 13  | `DomainEvent`                   | **CÓ tên gần — `eventEnvelope.ts` (`EventEnvelope`)** | Gần trùng, không hẳn |

**9/13 hoàn toàn mới, không có gì để xung đột** (Person, PersonalFact, LifeGraphNode,
LifeGraphEdge, ConsentGrant, PersonalPolicy, DecisionRecord, ToolManifest, ContextPackage,
ProposedAction — đúng ra là 10, đếm lại ở mục 3). **3 contract có tên GẦN nhưng KHÁC scope**
(Memory/MemoryRecord, AgentManifest/CapabilityManifest, EventEnvelope/DomainEvent — xem field
diff mục 2.2-2.4). **1 contract TRÙNG TÊN HẲN, khác hoàn toàn shape** (`Goal` — xem mục 2.1, đây
là ca rủi ro cao nhất, đúng risk register #1 của goal file).

## 2. Field-by-field diff cho 4 ca có tên trùng/gần trùng

### 2.1 `Goal` (v1, `packages/core-contracts/goal.ts`) vs `Goal` V2-02 (Life Graph node)

v1 `GoalSchema` (Phase 03 Learner OS, khoá `learnerId`):

```ts
{ id, learnerId, label, targetMinutesPerDay, targetDate?, status: 'active'|'completed'|'abandoned', createdAt }
```

V2-02 `Goal` theo `02-SYSTEM-ARCHITECTURE.md` mục 5 (Life Graph node type, khoá `personId`) —
CHƯA có shape cụ thể trong tài liệu kiến trúc (chỉ liệt kê tên node), nhưng theo mục đích Life
Graph ("goal lifecycle", "Goal Graph là read view của Life Graph") thì Goal V2-02 PHẢI:

- khoá theo `personId`, không phải `learnerId` (Person là 1 người, có thể có nhiều learner
  profile ở nhiều domain — English, Toán... — nhưng chỉ 1 Person);
- có quan hệ graph (`edges`: `requires`/`contributes_to`/`blocks`...) tới Project/Skill/
  Commitment/Constraint khác — v1 Goal không có khái niệm edge nào;
- phạm vi XUYÊN DOMAIN (mục tiêu đời sống nói chung: "học giỏi tiếng Anh", "tìm việc mới"), không
  chỉ "targetMinutesPerDay" (khái niệm luyện tập riêng của việc học 1 kỹ năng).

**Đây là xung đột tên thật, không phải trùng hợp:** v1 Goal là mục tiêu LUYỆN TẬP HÀNG NGÀY của 1
learner trong 1 domain; V2-02 Goal là NÚT TRONG LIFE GRAPH của 1 person, xuyên domain. Không thể
dùng chung 1 type Zod cho cả 2 — 2 khái niệm khác nhau tình cờ trùng tên tiếng Anh.

**3 phương án khả thi (không tự chọn — xem mục 4):**

- (a) Đổi tên contract V2-02 thành `LifeGoal` hoặc `GraphGoal` để tránh trùng tên trong cùng 1
  package `core-contracts/`, giữ nguyên `Goal` (v1) không đổi.
- (b) Đổi tên contract v1 thành `LearningGoal` (rename có kiểm soát — `Goal` v1 CHƯA có dữ liệu
  Postgres thật nào tham chiếu tới nó theo tên "Goal" cụ thể, vì Phase 03 chưa migrate DB thật,
  xem comment đầu `learner.ts`) rồi dùng tên `Goal` cho V2-02.
- (c) Coi v1 Goal là 1 ADAPTER/READ VIEW chiếu từ Life Graph Goal xuống Learning domain (Goal
  V2-02 là nguồn, Goal v1 là projection) — đúng tinh thần "Goal Graph là read view của Life
  Graph" ở `02-SYSTEM-ARCHITECTURE.md` mục 5, nhưng cần thiết kế adapter cụ thể, không chỉ đổi tên.

### 2.2 `Memory` (v1) vs `MemoryRecord` (V2-02)

v1 `MemorySchema` (Phase 21 Memory OS, khoá `learnerId`):

```ts
{ id, learnerId, kind: 'working'|'episodic'|'semantic'|'error'|'preference'|'progress', content: string, createdAt, expiresAt? }
```

V2-02 `MemoryRecord` (Personal Knowledge Fabric, `02-SYSTEM-ARCHITECTURE.md` mục 6) cần thêm tối
thiểu so với v1 Memory: `personId` (không phải `learnerId`), `provenance`, `sensitivity`,
`retention`, kết quả từ "Memory candidate pipeline" (`ACCEPT`/`MERGE`/`REJECT`/`ASK_USER`/
`EXPIRE`) — v1 Memory KHÔNG có sensitivity/provenance/pipeline nào, chỉ có `kind`/`content`/
`expiresAt` đơn giản.

**Không trùng tên hẳn** (`Memory` ≠ `MemoryRecord`) nên KHÔNG bị lỗi TypeScript nếu định nghĩa cả
2 trong `core-contracts/`, nhưng dễ gây nhầm lẫn cho người đọc code sau này (2 khái niệm bộ nhớ
song song). Đề xuất namespace rõ ràng khi viết V2-02 (vd file `personalMemory.ts` thay vì
`memory.ts` đã bị chiếm bởi v1) — quyết định cụ thể để owner chốt cùng lúc với ca Goal.

### 2.3 `AgentManifest` (v1) vs `CapabilityManifest` (V2-02)

v1 `AgentManifestSchema` (Phase 26, khai báo 1 AGENT được đề xuất hành động gì):

```ts
{ name, version, permissions: string[] (mỗi permission dạng "propose_*") }
```

V2-02 `CapabilityManifest` (`02-SYSTEM-ARCHITECTURE.md` mục 9, khai báo 1 CAPABILITY — đơn vị
Companion gọi được):

```ts
{ id, version, domain, description, inputSchema, outputSchema, requiredPermissions, riskLevel, executionMode: 'deterministic'|'workflow'|'ai'|'agent', timeoutMs, costPolicy, auditPolicy, lifecycle }
```

**Khác khái niệm rõ ràng, không phải trùng lặp:** `AgentManifest` mô tả 1 AGENT (ai được đề xuất
gì); `CapabilityManifest` mô tả 1 CAPABILITY (đơn vị thực thi được gọi, có thể do deterministic
code / workflow / AI / agent thực hiện — Agent chỉ là 1 trong 4 `executionMode`). Quan hệ đúng:
1 Agent có thể ĐỀ XUẤT gọi nhiều Capability; AgentManifest.permissions nên tham chiếu tới
CapabilityManifest.id trong tương lai. **Không xung đột, giữ cả 2, không cần đổi tên** — nhưng
field diff này nên đưa vào comment đầu file `capabilityManifest.ts` khi viết V2-02 để người đọc
sau không nhầm 2 khái niệm.

### 2.4 `EventEnvelope` (v1) vs `DomainEvent` (V2-02)

v1 `EventEnvelopeSchema` (Phase 02 mục 5, hạ tầng event chung — CHƯA gắn domain cụ thể nào):

```ts
{ id, idempotencyKey, type: "domain.action", occurredAt, payload: unknown }
```

V2-02 `DomainEvent` theo roadmap mô tả là sự kiện phát ra khi Domain Engine COMMIT state
transition (mục 3 "Core request flow": `... commit + outbox ...`). **Đây thực chất CÙNG 1 khái
niệm** — `EventEnvelope` đã có sẵn đúng field cần (`idempotencyKey`, `type` dạng `"domain.action"`,
`payload`) mà `DomainEvent` V2-02 cần. Không có field nào V2-02 đòi mà `EventEnvelope` thiếu, dựa
trên mô tả hiện có trong roadmap/kiến trúc.

**Đề xuất (không tự quyết — cần owner xác nhận):** KHÔNG tạo `DomainEvent` mới — dùng thẳng
`EventEnvelope` đã có, đổi/thêm alias export `DomainEvent = EventEnvelope` nếu cần khớp tên gọi
trong roadmap. Đây là ca DUY NHẤT trong 13 contract có thể "port thẳng, không viết mới" theo đúng
tinh thần tránh trùng lặp mà guardrail goal file yêu cầu hỏi trước khi quyết.

## 3. Gap list — 10 contract hoàn toàn chưa có gì (đếm lại chính xác)

Không có BẤT KỲ file/type nào hiện có cho các contract sau — viết mới hoàn toàn, không có rủi ro
trùng tên:

1. `Person` — danh tính người dùng cấp Personal OS Core (khác `public.users`/`public.profiles`
   hiện có ở Postgres — 2 bảng đó là auth/billing record, không phải Personal World Model).
2. `PersonalFact` — shape gợi ý đã có sẵn ở `02-SYSTEM-ARCHITECTURE.md` mục 4 (TypeScript
   interface đầy đủ: `id, personId, namespace, key, value, origin, confidence, source,
sensitivity, createdAt, updatedAt, lastConfirmedAt?, expiresAt?, supersedes?`) — viết Zod schema
   tương ứng là việc cơ học khi tới lượt, không cần thiết kế lại.
3. `LifeGraphNode` — node types tối thiểu đã liệt kê (mục 5: Person/Goal/Project/Skill/
   Organization/Event/Commitment/Constraint/Decision).
4. `LifeGraphEdge` — relation types tối thiểu đã liệt kê (`requires`/`contributes_to`/`supports`/
   `blocks`/`conflicts_with`/`belongs_to`/`involves`).
5. `ConsentGrant` — chưa có gợi ý shape cụ thể trong `02-SYSTEM-ARCHITECTURE.md`, chỉ có nguyên
   tắc ở mục 7 ("consent scope/version/revoke").
6. `PersonalPolicy` — cùng mục 7, có "priority chain" (security/law > authorization > domain
   invariant > explicit consent > personal policy > ...) nhưng chưa có field shape cụ thể.
7. `DecisionRecord` — CÓ shape gợi ý đầy đủ ở mục 8 (interface TypeScript sẵn, chỉ cần chuyển
   sang Zod).
8. `ToolManifest` — mục 10 có mô tả field bắt buộc (side effect `none|internal|external`, input/
   output schema, permission, idempotency, timeout, audit) nhưng chưa có interface đầy đủ.
9. `ContextPackage` — mục 14 mô tả quy trình chọn (selection order + lọc permission/purpose/
   sensitivity/freshness/token budget) nhưng chưa có shape field cụ thể.
10. `ProposedAction` — chưa có mô tả field ở `02-SYSTEM-ARCHITECTURE.md`, chỉ có khái niệm trong
    "Core request flow" (`State Proposal` bước trước khi Domain Engine commit).

**Trong số 10 gap: 2 (`PersonalFact`, `DecisionRecord`) đã có interface TypeScript đầy đủ sẵn
sàng chuyển thành Zod schema — việc cơ học. 8 còn lại cần thiết kế field trước khi viết code
(mức độ khác nhau — `LifeGraphNode`/`LifeGraphEdge`/`ToolManifest` có danh sách gợi ý, `Person`/
`ConsentGrant`/`PersonalPolicy`/`ContextPackage`/`ProposedAction` gần như trắng, cần owner tham
gia thiết kế field vì đây là quyết định kiến trúc, không phải suy ra được từ tài liệu có sẵn).**

## 4. Câu hỏi cần owner quyết định trước khi viết code V2-02

Đúng guardrail goal file ("Không tự quyết 'port hay viết mới' contract V2-02 nếu phát hiện xung
đột với Learning v1 — phải hỏi owner"):

1. **Ca `Goal`** (mục 2.1) — chọn phương án (a)/(b)/(c) hay phương án khác owner đề xuất.
2. **Ca `Memory`/`MemoryRecord`** (mục 2.2) — đặt tên file mới nào cho tránh nhầm lẫn (đề xuất
   `personalMemory.ts`), có cần đổi tên `memory.ts` (v1) không hay giữ nguyên.
3. **Ca `EventEnvelope`/`DomainEvent`** (mục 2.4) — có đồng ý dùng thẳng `EventEnvelope` (không
   viết `DomainEvent` mới) không.
4. Với 8 gap contract chưa có field shape rõ (mục 3, không tính `PersonalFact`/`DecisionRecord`
   đã có sẵn) — owner có muốn tự thiết kế field, hay uỷ quyền AI đề xuất field dựa trên tài liệu
   hiện có rồi owner duyệt từng contract một (không làm cả 8 cùng lúc, đúng guardrail "1
   outcome/PR mỗi vòng").

## 5. Việc KHÔNG làm ở tài liệu này

Không viết bất kỳ file `.ts` contract mới nào, không đổi `packages/core-contracts/*.ts` hiện có —
đây thuần là DIFF + GAP LIST theo đúng phạm vi M3/S1. Viết code contract thật là bước tiếp theo
SAU khi owner trả lời mục 4.
