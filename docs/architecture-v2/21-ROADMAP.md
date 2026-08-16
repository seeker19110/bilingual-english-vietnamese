# Đồng Hành Platform V2 — Implementation Roadmap

## Trạng thái

V2 là roadmap kiến trúc active. English Tutor OS v1 đã frozen; phase v1 chỉ được tiếp tục khi phục vụ stability/migration của production hiện tại.

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
- execution authority: READ/SUGGEST/DRAFT/WRITE_INTERNAL/CONFIRM/AUTOMATE/DENY;
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

- manifest/version/lifecycle;
- input/output schema;
- permission/risk/cost/audit policy;
- execution mode `deterministic | workflow | ai | agent`;
- register real Learning capabilities first.

### V2-09 — Companion Runtime

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

- Decision record;
- assumptions/evidence/options/tradeoffs;
- expected vs actual outcome;
- scheduled review;
- evidence-driven Personal World Model update.

**Gate:** outcome cannot silently rewrite user-declared facts/policies.

## Wave D — Migrate Learning

### V2-11 — Learning ownership migration

- learner profile split global/domain;
- skill/knowledge/evidence/mastery/SRS remain Learning;
- expose typed Learning read model to Companion;
- remove new direct imports from core into learning internals.

### V2-12 — Multi-subject Learning

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

Career is the first non-learning proof.

- CareerProfile;
- experience/portfolio;
- career goals;
- skill gap;
- CV/interview/job-search capabilities;
- Learning read model for skills/mastery.

### V2-14 — Cross-domain Life Graph

Example executable flow:

`Career goal: Data Analyst → skill gap SQL/English/Statistics → Learning plans → evidence/mastery → Career progress`.

**Gate:** no Career direct query to Learning tables.

### V2-15 — Work Domain

- projects/tasks/meetings/documents/decisions/deadlines;
- integrations behind tools + permissions;
- confirmation boundary for external writes.

### V2-16 — Startup Domain

- venture/problem/customer/hypothesis/experiment;
- validated evidence distinct from hypothesis;
- market/product/business model/finance/roadmap capabilities.

**Gate:** model-generated market claims never become facts without evidence/provenance.

### V2-17 — Life foundation

- planning/habits/personal growth/household/wellbeing primitives;
- high-impact subdomains isolated behind additional policy;
- no generic mega Life Agent.

## Wave F — Automation, hardening, scale

### V2-18 — Approved automation

- explicit automation grants;
- schedule/event triggers;
- budgets/rate limits;
- revoke/pause;
- retries/compensation;
- action receipts.

### V2-19 — Platform evaluation and hardening

- memory precision/correction rate;
- routing accuracy;
- context relevance;
- permission compliance;
- cross-domain handoff success;
- capability success/cost/latency;
- prompt-injection/tool-abuse/red-team suites;
- privacy/export/delete drills.

### V2-20 — Scale and Final Architecture Audit

V2 accepted only when:

- same person uses one Companion across >=2 production domains;
- Life Graph connects cross-domain goal/evidence;
- Personal World Model has provenance/confidence/privacy controls;
- Knowledge Fabric has inspect/correct/delete;
- external side effects enforce authority;
- Decision/Outcome loop works end-to-end;
- provider/agent replacement does not lose person state;
- SLO/cost/security/backup/recovery/audit evidence is complete.

## Release discipline

Mỗi phase là acceptance package, không nhất thiết một PR. Mỗi PR phải nhỏ, reversible/recoverable, cập nhật `PROGRESS.md`, tests/contracts/ADR liên quan và không tự mở phase kế tiếp nếu gate hiện tại chưa accepted.

## Cross-cutting decision — Model API strategy

Model selection is a V2 platform concern shared by Companion and every domain, not an English Tutor implementation detail. The accepted baseline is [22-MODEL-API-STRATEGY.md](./22-MODEL-API-STRATEGY.md).

All AI capabilities introduced from V2-08 onward must use stable task/capability identifiers, server-side model registry/configuration, deterministic-first execution, observable escalation and per-task quality/cost gates. No new capability may hard-code a vendor model in client or business-domain code.


Kế hoạch xuyên suốt để hạn chế gọi API và kiểm soát unit economics:
[`22-API-COST-OPTIMIZATION-PLAN.md`](22-API-COST-OPTIMIZATION-PLAN.md). Tài liệu này không tự mở
phase implementation; từng PR vẫn phải theo gate của wave tương ứng.
