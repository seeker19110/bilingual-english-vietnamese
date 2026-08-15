# Đồng Hành Platform V2 — System Architecture

## 1. Architectural style

V2 dùng **modular monolith + explicit contracts + event boundaries** làm mặc định. PostgreSQL hiện tại tiếp tục là primary transactional store. Service/process riêng chỉ xuất hiện khi có nhu cầu isolation, workload hoặc scaling đã đo được.

Mục tiêu là tách **ownership**, không tách deployment một cách hình thức.

## 2. Layers

### Experience Layer

Web/mobile/voice/messaging trong tương lai. Không sở hữu business truth. UI chỉ gửi intent/command và render read model.

### Companion Layer

Một mặt giao tiếp thống nhất của Đồng Hành:

1. classify/understand intent;
2. resolve relevant goals/context;
3. construct a plan;
4. pass plan through policy;
5. route capabilities;
6. validate results;
7. formulate response.

Companion không trực tiếp UPDATE domain tables.

### Personal Intelligence Layer

- Personal World Model;
- Life Graph;
- Personal Knowledge Fabric;
- Personal Policy;
- Decision Ledger;
- Outcome learning.

Đây là phần tạo continuity xuyên domain và xuyên thời gian.

### Domain Layer

Bounded contexts sở hữu business truth. Domain engine có quyền quyết định state transition của mình sau validation/policy/evidence.

### Capability / Automation Layer

Capability là unit ổn định để Companion gọi. Implementation có thể deterministic function, workflow, AI task hoặc agent.

### Platform Layer

Identity/auth, contracts, DB transaction, events/outbox, jobs, storage, permissions, AI gateway, audit, observability.

## 3. Core request flow

```text
User Input
   │
   ▼
API/Auth boundary
   │
   ▼
Intent Resolver
   │
   ▼
Context Builder
   ├── Personal World Model
   ├── Life Graph
   ├── Knowledge Fabric
   └── Domain read models
   │
   ▼
Companion Planner
   │
   ▼
Policy Engine
   ├── security
   ├── authorization
   ├── consent/purpose
   ├── personal policy
   └── capability risk/budget
   │
   ▼
Capability Router
   │
   ├── Deterministic Engine
   ├── Workflow
   ├── AI Task
   └── Agent
   │
   ▼
Result Validator
   │
   ▼
State Proposal
   │
   ▼
Owning Domain Engine
   │
   ├── reject
   ├── request confirmation
   └── commit + outbox
   │
   ▼
Read model / response
```

## 4. Personal World Model

Personal World Model không phải một object duy nhất. Nó là read model được tạo từ các nguồn có ownership rõ ràng.

### Minimum primitives

```ts
type FactOrigin = 'user_declared' | 'observed' | 'derived' | 'imported'

type Sensitivity = 'public' | 'personal' | 'sensitive' | 'restricted'

interface PersonalFact<T> {
  id: string
  personId: string
  namespace: string
  key: string
  value: T
  origin: FactOrigin
  confidence: number
  source: { type: string; id?: string; occurredAt?: string }
  sensitivity: Sensitivity
  createdAt: string
  updatedAt: string
  lastConfirmedAt?: string
  expiresAt?: string
  supersedes?: string
}
```

Rules:
- `user_declared` thường có confidence 1 nhưng vẫn có thể supersede;
- derived inference không được tự ghi đè user declaration;
- fact nhạy cảm không tự động cross-domain;
- confidence thấp có thể chỉ tồn tại như candidate;
- timestamp không phải provenance.

## 5. Life Graph

### Node types v1 of V2

- Person
- Goal
- Project
- Skill
- Organization
- Event
- Commitment
- Constraint
- Decision

Không bắt đầu bằng generic `Node(type, data JSONB)` làm API domain duy nhất. Core graph có stable IDs/edges, còn payload chuyên sâu thuộc domain/read model.

### Edge rules

```ts
type LifeRelation =
  | 'requires'
  | 'contributes_to'
  | 'supports'
  | 'blocks'
  | 'conflicts_with'
  | 'belongs_to'
  | 'involves'
```

Mọi edge:
- cùng person boundary trừ entity external được policy cho phép;
- có provenance;
- validate type compatibility;
- delete/supersede có audit;
- graph mutation idempotent.

## 6. Personal Knowledge Fabric

Fabric gồm bốn concern tách biệt:

1. **Sources** — DB rows, documents, conversations, email/calendar, external integrations.
2. **Index** — metadata, identity, provenance, classification, embeddings khi có lợi.
3. **Retrieval** — semantic/structured/time/goal/domain retrieval.
4. **Policy** — permission, purpose, sensitivity, retention, token budget.

Không mặc định lưu bản sao raw của email/document/transcript nếu adapter có thể truy xuất tại nguồn.

### Memory candidate pipeline

```text
Observation
  ↓
Candidate extraction
  ↓
Schema validation
  ↓
Dedup / conflict detection
  ↓
Sensitivity + purpose classification
  ↓
Confidence / evidence policy
  ↓
ACCEPT | MERGE | REJECT | ASK_USER | EXPIRE
  ↓
Memory Engine
```

## 7. Personal Policy and authority

Priority:

```text
Security/law
  > authorization
  > domain invariant
  > explicit consent
  > personal policy
  > workflow policy
  > agent proposal
  > LLM wording
```

Authority levels:

```text
READ
SUGGEST
DRAFT
WRITE_INTERNAL
EXECUTE_WITH_CONFIRMATION
AUTOMATE
DENY
```

`AUTOMATE` grant phải có subject, action/capability, resource scope, purpose, expiry/review và revoke path.

## 8. Decision Ledger

```ts
interface DecisionRecord {
  id: string
  personId: string
  problem: string
  domain?: string
  options: Array<{ id: string; summary: string }>
  assumptions: EvidenceRef[]
  evidence: EvidenceRef[]
  tradeoffs: string[]
  selectedOptionId?: string
  rationale?: string
  expectedOutcomes: OutcomeExpectation[]
  actualOutcomes?: OutcomeObservation[]
  status: 'open' | 'decided' | 'review_due' | 'reviewed' | 'superseded'
  reviewAt?: string
  createdAt: string
}
```

Decision Ledger không ghi toàn bộ chat. Nó lưu decision artifact có cấu trúc và provenance.

## 9. Capability Registry

```ts
interface CapabilityManifest {
  id: string
  version: number
  domain: string
  description: string
  inputSchema: string
  outputSchema: string
  requiredPermissions: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'restricted'
  executionMode: 'deterministic' | 'workflow' | 'ai' | 'agent'
  timeoutMs: number
  costPolicy: string
  auditPolicy: string
  lifecycle: 'experimental' | 'active' | 'deprecated'
}
```

Capability ID là semantic contract, không chứa model/provider name.

## 10. Tools

Tool là primitive execution, khác capability.

Ví dụ `career.review_cv` capability có thể dùng `document.read`, `resume.extract`, `career.rubric.evaluate`.

Tool manifest bắt buộc khai báo side effect `none | internal | external`, input/output schema, permission, idempotency, timeout và audit.

## 11. Cross-domain protocol

Domain không import repository/table của domain khác.

Allowed:
- typed read model;
- versioned application service;
- domain event;
- capability invocation.

Forbidden:
- Career query `learning_mastery` trực tiếp;
- Startup update Personal World Model table trực tiếp;
- Companion import private domain repository rồi bypass domain policy.

## 12. Domain patterns

### Learning

Learning owns skill/knowledge/evidence/mastery/assessment/diagnostic/curriculum/SRS. `Personal World Model` có thể expose summary như “English speaking level” nhưng source vẫn là Learning read model và provenance phải trỏ về Learning.

### Career

Career owns career state, role goals, experience and skill-gap interpretation. Career consumes Learning skill summary qua contract.

### Startup

Startup tách `hypothesis` khỏi `validated evidence`. LLM-generated market statement mặc định là hypothesis/analysis, không phải fact.

### Work

External write (send message, modify ticket/calendar/document) đi qua tools + confirmation/automation authority.

### Life

Không có generic autonomous Life Agent. High-impact areas thêm policy/guardrails chuyên biệt trước capability.

## 13. Persistence

PostgreSQL remains default. Suggested ownership naming can evolve to schemas/modules, nhưng không bắt buộc physical schema ngay.

Transactions:

```text
BEGIN
  validate expected version / authority
  mutate owning aggregate
  insert audit record
  insert outbox event
COMMIT
```

Consumers idempotent theo event ID.

## 14. Context Builder

Context Builder là security boundary, không chỉ prompt utility.

Selection order:
1. current request;
2. explicit active goal/project;
3. authoritative domain state;
4. relevant user-declared facts;
5. relevant validated/derived memory;
6. recent episodic context.

Sau đó lọc theo permission/purpose/sensitivity/freshness/token budget.

Mỗi item đưa vào AI context có provenance internally available để audit.

## 15. AI and agents

AI Gateway receives task + model policy + privacy + budget + output schema. Domain không hard-code provider.

Use deterministic code when rules can be known. Use workflow when sequence is controlled. Use agent when steps are genuinely dynamic and bounded by tools/policy/budget.

No agent can directly:
- change auth/permissions;
- charge/grant billing;
- set Learning mastery;
- assert Personal Fact as authoritative;
- perform external side effect beyond effective authority.

## 16. Outcome learning

Outcome learning uses `Decision → Action → Observation → Evaluation` evidence. It may propose Personal World Model updates but cannot silently overwrite explicit user declarations or Personal Policies.

## 17. Evaluation

Platform eval minimum:
- intent/domain routing accuracy;
- context precision/recall/relevance;
- memory correction and false-memory rates;
- permission compliance;
- sensitive-context leakage;
- capability selection success;
- confirmation rejection rate;
- cross-domain handoff success;
- outcome-quality measures;
- cost/latency/error/fallback.

## 18. Security and privacy

Users need a future surface equivalent to **“Đồng Hành biết gì về tôi?”** with inspect/source/correct/delete/export controls.

Logs and events avoid raw sensitive content unless explicit operational need and retention policy. Prompt/context traces must support redaction.

## 19. Deployment evolution

Start:

```text
web + Express/API + worker + PostgreSQL
```

Only split when evidence indicates:
- independent scaling;
- strong security isolation;
- background workload separation;
- deployment blast-radius benefit;
- different storage/latency requirement.

V2 architecture is about semantic boundaries first, distributed systems second.
