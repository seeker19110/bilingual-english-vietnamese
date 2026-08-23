# Đồng Hành Platform V2 — Implementation Roadmap

## Trạng thái

> **[2026-08-23]** Nguồn thi hành duy nhất là `PROGRESS.md` +
> `docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md`. File này giữ vai trò THAM
> KHẢO thiết kế V2 — không coi các Wave ở đây là backlog đang chạy song song.

V2 là roadmap kiến trúc THAM KHẢO (trước đây ghi "active"). English Tutor OS v1 đã frozen; phase v1 chỉ được tiếp tục khi phục vụ stability/migration của production hiện tại.

## Wave A — Architecture & boundaries

### V2-00 — Baseline and ownership map

**Outcome:** biết chính xác hệ thống hiện tại đang sở hữu dữ liệu/luồng nào và phần nào đã triển khai từ v1.

Deliverables:

- inventory routes/API/tables/jobs/providers/contracts;
- trace auth, chat, speaking, learning progress, SRS, payment/entitlement, admin mutation, notification;
- map từng entity sang `platform | learning | legacy`;
- risk register + migration dependencies;
- baseline test/latency/cost có evidence.

**Gate:** chưa refactor production trước khi map source of truth và rollback owner hoàn chỉnh.

### V2-01 — Domain boundaries

**Outcome:** code mới biết rõ biên `Personal OS Core ↔ Learning ↔ shared platform`.

- ADR bounded contexts;
- dependency rules;
- cross-domain read-model/event rules;
- architecture lint/import boundary nếu khả thi;
- xác định những module v1 giữ nguyên trong Learning.

### V2-02 — Core contracts

**Outcome:** contract V2 có thể chạy trong CI trước implementation.

Tối thiểu: Person, PersonalFact, Goal, LifeGraphNode/Edge, MemoryRecord, ConsentGrant, PersonalPolicy, DecisionRecord, CapabilityManifest, ToolManifest, ContextPackage, ProposedAction, DomainEvent.

Không phá contract Learning v1 đang dùng; adapter compatibility bắt buộc.

## Wave B — Personal OS Core

### V2-03 — Personal World Model

- person identity linkage;
- global facts/preferences/constraints/interests;
- provenance/confidence/sensitivity/expiry;
- user-declared vs observed vs derived vs imported;
- optimistic concurrency;
- inspect/correct/delete/export API;
- Learning Profile vẫn thuộc Learning.

**Gate:** không inference nào trở thành authoritative fact chỉ vì model nói vậy.

### V2-04 — Consent + Permissions + Personal Policy

- resource/action/purpose based policy;
- consent scope/version/revoke;
- execution authority: READ/SUGGEST/DRAFT/WRITE_INTERNAL/EXECUTE_WITH_CONFIRMATION/AUTOMATE/DENY
  (owner chốt 2026-08-17: tên đúng là `EXECUTE_WITH_CONFIRMATION` — khớp code đã chạy thật ở
  `packages/core-contracts/personalPolicy.ts` và migration `0042_consent_and_policy.sql`; dòng này
  trước đây viết tắt là `CONFIRM`, đã sửa);
- personal policies do not override security/law/domain invariants;
- complete audit trail.

**Gate:** revoke có hiệu lực ở Context Builder và tool execution.

### V2-05 — Life Graph foundation

Node types tối thiểu: Person, Goal, Project, Skill, Organization, Event, Commitment, Constraint, Decision.

Edges tối thiểu: requires, contributes_to, blocks, conflicts_with, supports, belongs_to, involves.

- graph integrity validator;
- no orphan/cross-user edge;
- goal lifecycle;
- Goal Graph là read view của Life Graph.

**Gate:** một learning goal hiện tại backfill và round-trip an toàn.

### V2-06 — Personal Knowledge Fabric

- memory namespaces;
- provenance/sensitivity/retention;
- memory candidate pipeline;
- semantic/episodic/preference/commitment/domain memory;
- adapters thay vì copy-all;
- inspect/correct/delete.

**Gate:** memory precision + privacy eval đạt threshold; sensitive memory không leak cross-purpose.

### V2-07 — Context Engine

`request → intent → domain → goal relevance → retrieval → permission → sensitivity → token budget → context package`.

- deterministic filtering before LLM;
- provenance for every injected item;
- context budget + freshness;
- omission of sensitive context measurable.

## Wave C — Companion & capability runtime

### V2-08 — Capability Registry

Đặc tả chi tiết: [V2-08-CAPABILITY-REGISTRY.md](./V2-08-CAPABILITY-REGISTRY.md)

- manifest/version/lifecycle;
- input/output schema;
- permission/risk/cost/audit policy;
- execution mode `deterministic | workflow | ai | agent`;
- register real Learning capabilities first.

### V2-09 — Companion Runtime

Đặc tả chi tiết: [V2-09-COMPANION-RUNTIME.md](./V2-09-COMPANION-RUNTIME.md)

- intent;
- context resolution;
- planner;
- policy validator;
- capability routing;
- result validation;
- state proposal;
- domain commit.

**Invariant:** Planning ≠ Execution ≠ State Mutation.

### V2-10 — Decision Ledger + Outcome Loop

Đặc tả chi tiết: [V2-10-DECISION-LEDGER-OUTCOME-LOOP.md](./V2-10-DECISION-LEDGER-OUTCOME-LOOP.md)

- Decision record;
- assumptions/evidence/options/tradeoffs;
- expected vs actual outcome;
- scheduled review;
- evidence-driven Personal World Model update.

**Gate:** outcome cannot silently rewrite user-declared facts/policies.

## Wave D — Migrate Learning

### V2-11 — Learning ownership migration

Đặc tả chi tiết: [V2-11-LEARNING-OWNERSHIP-MIGRATION.md](./V2-11-LEARNING-OWNERSHIP-MIGRATION.md)

- learner profile split global/domain;
- skill/knowledge/evidence/mastery/SRS remain Learning;
- expose typed Learning read model to Companion;
- remove new direct imports from core into learning internals.

### V2-12 — Multi-subject Learning

Đặc tả chi tiết: [V2-12-MULTI-SUBJECT-LEARNING.md](./V2-12-MULTI-SUBJECT-LEARNING.md)

Bring English, Mathematics, Physics, Chemistry, Biology under one Learning bounded context without forcing language-specific concepts onto STEM.

Shared:

- learner learning profile;
- goals;
- assessment/evidence pattern;
- learning plan;
- scheduling;
- content/versioning primitives.

Subject-owned:

- taxonomy;
- pedagogy;
- question types;
- evaluation rules;
- domain knowledge.

**Gate:** at least two materially different subjects run through shared contracts without conditional spaghetti in core.

## Wave E — Prove cross-domain architecture

### V2-13 — Career Domain

Đặc tả chi tiết: [V2-13-CAREER-DOMAIN.md](./V2-13-CAREER-DOMAIN.md)

Career is the first non-learning proof.

- CareerProfile;
- experience/portfolio;
- career goals;
- skill gap;
- CV/interview/job-search capabilities;
- Learning read model for skills/mastery.

### V2-14 — Cross-domain Life Graph

Đặc tả chi tiết: [V2-14-CROSS-DOMAIN-LIFE-GRAPH.md](./V2-14-CROSS-DOMAIN-LIFE-GRAPH.md)

Example executable flow:

`Career goal: Data Analyst → skill gap SQL/English/Statistics → Learning plans → evidence/mastery → Career progress`.

**Gate:** no Career direct query to Learning tables.

### V2-15 — Work Domain

Đặc tả chi tiết: [V2-15-WORK-DOMAIN.md](./V2-15-WORK-DOMAIN.md)

- projects/tasks/meetings/documents/decisions/deadlines;
- integrations behind tools + permissions;
- confirmation boundary for external writes.

### V2-16 — Startup Domain

Đặc tả chi tiết: [V2-16-STARTUP-DOMAIN.md](./V2-16-STARTUP-DOMAIN.md)

- venture/problem/customer/hypothesis/experiment;
- validated evidence distinct from hypothesis;
- market/product/business model/finance/roadmap capabilities.

**Gate:** model-generated market claims never become facts without evidence/provenance.

### V2-17 — Life foundation

Đặc tả chi tiết: [V2-17-LIFE-FOUNDATION.md](./V2-17-LIFE-FOUNDATION.md)

- planning/habits/personal growth/household/wellbeing primitives;
- high-impact subdomains isolated behind additional policy;
- no generic mega Life Agent.

## Wave F — Automation, hardening, scale

### V2-18 — Approved automation

Đặc tả chi tiết: [V2-18-APPROVED-AUTOMATION.md](./V2-18-APPROVED-AUTOMATION.md)

- explicit automation grants;
- schedule/event triggers;
- budgets/rate limits;
- revoke/pause;
- retries/compensation;
- action receipts.

### V2-19 — Platform evaluation and hardening

Đặc tả chi tiết: [V2-19-PLATFORM-EVALUATION-HARDENING.md](./V2-19-PLATFORM-EVALUATION-HARDENING.md)

- memory precision/correction rate;
- routing accuracy;
- context relevance;
- permission compliance;
- cross-domain handoff success;
- capability success/cost/latency;
- prompt-injection/tool-abuse/red-team suites;
- privacy/export/delete drills.

### V2-20 — Scale and Final Architecture Audit (ACCEPTED — 2026-08-17)

Đặc tả chi tiết: [2026-08-17-v2-20-scale-and-final-architecture-audit.md](../specs/2026-08-17-v2-20-scale-and-final-architecture-audit.md)

V2 accepted: All 8 criteria PASSED with verifiable evidence (`docs/research/v2-final-architecture-audit.md` & `npm run eval:v2:audit`):

- [x] same person uses one Companion across >=2 production domains;
- [x] Life Graph connects cross-domain goal/evidence;
- [x] Personal World Model has provenance/confidence/privacy controls;
- [x] Knowledge Fabric has inspect/correct/delete;
- [x] external side effects enforce authority;
- [x] Decision/Outcome loop works end-to-end;
- [x] provider/agent replacement does not lose person state;
- [x] SLO/cost/security/backup/recovery/audit evidence is complete.

## Release discipline

Mỗi phase là acceptance package, không nhất thiết một PR. Mỗi PR phải nhỏ, reversible/recoverable, cập nhật `PROGRESS.md`, tests/contracts/ADR liên quan và không tự mở phase kế tiếp nếu gate hiện tại chưa accepted.

## Cross-cutting decision — Model API strategy

Model selection is a V2 platform concern shared by Companion and every domain, not an English Tutor implementation detail. The accepted baseline is [22-MODEL-API-STRATEGY.md](./22-MODEL-API-STRATEGY.md).

All AI capabilities introduced from V2-08 onward must use stable task/capability identifiers, server-side model registry/configuration, deterministic-first execution, observable escalation and per-task quality/cost gates. No new capability may hard-code a vendor model in client or business-domain code.

Kế hoạch xuyên suốt để hạn chế gọi API và kiểm soát unit economics:
[`22-API-COST-OPTIMIZATION-PLAN.md`](22-API-COST-OPTIMIZATION-PLAN.md). Tài liệu này không tự mở
phase implementation; từng PR vẫn phải theo gate của wave tương ứng.

## Cross-cutting decision — Event outbox strategy

Cách domain nói chuyện với nhau qua sự kiện (transactional outbox, delivery guarantee, retry,
dead-letter) là quyết định nền tảng dùng chung, không thuộc riêng phase nào — mục 13 kiến trúc đã
đòi "insert outbox event" trong cùng transaction và "consumers idempotent theo event ID", nhưng
chưa có đặc tả. Đặc tả: [`23-EVENT-OUTBOX-STRATEGY.md`](23-EVENT-OUTBOX-STRATEGY.md) (owner yêu cầu
viết 2026-08-17). Mọi phase phát/tiêu thụ domain event (V2-09, V2-14, V2-18) phải theo tài liệu này;
nó không tự mở phase implementation.
