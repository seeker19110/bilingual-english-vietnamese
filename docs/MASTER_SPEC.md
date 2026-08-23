# Đồng Hành Platform — Master Architecture Specification v2.0

> Trạng thái: **ACTIVE — source of truth TẦM NHÌN/kiến trúc cấp cao** từ 2026-08-15.
> **[2026-08-23]** Thi hành KHÔNG theo file này: nguồn thi hành duy nhất là `PROGRESS.md` +
> `docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md` (chốt Q2 — một lộ trình).
> English Tutor OS v1 đã **FROZEN**; xem `docs/legacy/ENGLISH_TUTOR_OS_V1_FROZEN.md` và `docs/architecture-v2/20-MIGRATION-V1-V2.md`.

## Mission

Tiến hóa `english-tutor` thành **Đồng Hành Platform**: một Personal AI Companion Platform có thể đồng hành lâu dài với một người xuyên suốt học tập, nghề nghiệp, công việc, khởi nghiệp và các mặt khác của cuộc sống.

North Star:

> **Một con người — một Companion — một Personal World Model — một Life Graph — một Knowledge Fabric — nhiều domain.**

Companion là trải nghiệm thống nhất; Personal OS Core là kiến trúc lõi; Learning chỉ là domain đầu tiên và trưởng thành nhất.

## Architectural invariants

1. **Person is the root of identity, not a domain.** Domain không sở hữu danh tính người dùng.
2. **One Companion, many domains.** Người dùng không phải tự chọn bot/agent theo chuyên môn.
3. **Personal World Model is authoritative only where evidence and ownership allow it.** Suy luận AI luôn có provenance/confidence.
4. **Life Graph connects goals, projects, people, skills, organizations, events, constraints, commitments and decisions across domains.**
5. **Memory belongs to the person, not to a model or agent.** Model/provider/agent phải thay thế được mà không mất lịch sử cá nhân.
6. **Domain truth belongs to the owning domain.** Learning mastery, Career state, Startup hypotheses... không bị Companion ghi trực tiếp.
7. **Evidence precedes authoritative state changes.** Assertion, inference hoặc LLM output không tự trở thành sự thật.
8. **AI proposes; policy/domain engines validate and commit.** Không LLM/agent nào trực tiếp ghi permissions, billing, mastery, authoritative profile hoặc external side effects.
9. **Every persistent personal inference has provenance, confidence, sensitivity and retention semantics.**
10. **Sensitive context is permission-scoped and purpose-scoped.** Có quyền kết nối nguồn dữ liệu không đồng nghĩa được dùng cho mọi mục đích.
11. **External side effects require explicit authority.** Quyền mặc định: READ/SUGGEST/DRAFT; hành động bên ngoài cần confirmation hoặc automation grant rõ ràng.
12. **Capabilities are stable abstractions; tools, workflows, agents and models are replaceable implementations.**
13. **Cross-domain access goes through contracts/read models/events, never foreign-table coupling.**
14. **Events and critical mutations are versioned, auditable, idempotent and transactional/recoverable.**
15. **AI failure must not corrupt authoritative personal state.**
16. **Users can inspect, correct, export and delete personal memory/inferences subject to lawful retention requirements.**
17. **Architecture starts as a modular monolith.** Tách service chỉ khi có nhu cầu scale/isolation đã chứng minh.
18. **No platform abstraction is accepted without a real consumer or an imminent migration target.**
19. **Outcome learning outranks engagement.** Hệ thống học từ kết quả thực tế, không tối ưu gây nghiện.
20. **Human agency is final.** Personal Policy và explicit user choices đứng trên agent proposal/LLM wording.

## Target architecture

```text
                         PERSON
                           │
                           ▼
                 EXPERIENCE / COMPANION
                           │
                           ▼
                  PERSONAL OS CORE
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
Personal World Model    Life Graph      Knowledge Fabric
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
              Context + Personal Policy
                           │
                   Companion Runtime
                           │
                   Capability Registry
                           │
      ┌────────────┬───────┼───────┬────────────┐
      ▼            ▼       ▼       ▼            ▼
   Learning      Career   Work   Startup       Life
      │
English / Math / Physics / Chemistry / Biology
                           │
        Deterministic Engines / Workflows / Agents
                           │
                    Tools / Integrations
                           │
                     External World
                           │
       AI Gateway / Events / Jobs / Storage / DB
                           │
            Security / Audit / Observability
```

## Core systems

### 1. Personal World Model

Mô hình có cấu trúc về con người và bối cảnh của họ: identity, preferences, values, constraints, interests, skills, knowledge, habits, projects, relationships, resources và domain profiles. Không dùng một JSONB khổng lồ làm source of truth.

Mọi fact/inference phải phân biệt tối thiểu `user_declared | observed | derived | imported`, có `source`, `confidence`, `sensitivity`, `last_confirmed_at` và `expires_at` khi phù hợp.

### 2. Life Graph

Graph semantic cấp người dùng, nối các node như Goal, Project, Person, Organization, Skill, Asset, Event, Decision, Commitment và Constraint. `Goal Graph` là một view chuyên biệt của Life Graph, không phải kho tách biệt về lâu dài.

### 3. Personal Knowledge Fabric

Lớp hợp nhất context cá nhân từ memory, documents, email, calendar, work artifacts, learning evidence và các nguồn được cấp quyền. Fabric không đồng nghĩa copy mọi dữ liệu vào một DB; nó cung cấp identity/provenance/index/retrieval policy thống nhất.

### 4. Personal Policy

Nguyên tắc người dùng đặt cho Companion, ví dụ ưu tiên gia đình hơn thu nhập, không tự gửi email, ưu tiên phần mềm mã nguồn mở. Personal Policy được policy engine áp dụng trước capability/tool execution.

### 5. Decision Ledger

Lưu quyết định quan trọng theo cấu trúc: problem, options, assumptions, evidence, trade-offs, selected option, rationale, expected outcome, actual outcome và review date. Đây là nguồn để Outcome Learning Loop đánh giá quyết định theo thời gian.

### 6. Outcome Learning Loop

`Understand → Plan → Decide → Act → Observe → Learn → Update World Model → Plan better`.

Việc cập nhật model sau outcome phải dựa trên evidence; không tự củng cố hallucination hoặc suy luận cũ.

### 7. Companion Runtime

Companion chịu trách nhiệm intent, context resolution, planning, policy validation và capability routing. Planning, execution và state mutation là ba bước tách biệt.

### 8. Capability Registry

Capability là abstraction nghiệp vụ ổn định như `learning.explain_math`, `career.review_cv`, `startup.validate_idea`. Mỗi capability khai báo domain, input/output schema, permission, risk, execution mode, timeout, cost và audit policy.

### 9. Domain Platform

Các bounded context đầu tiên:

- `Learning`: languages, mathematics, physics, chemistry, biology; sở hữu curriculum, skill/knowledge graph, assessment, evidence, mastery, diagnostic, SRS và learning plan.
- `Career`: career profile, experience, portfolio, skill gap, CV, interview, job search, career plan.
- `Work`: projects, tasks, meetings, documents, decisions, deadlines và work integrations.
- `Startup`: venture, problem, customer, hypothesis, experiment, market, product, business model, metrics, finance, roadmap.
- `Life`: umbrella cho planning, habits, personal growth, relationships, household, wellbeing; high-impact subdomains phải có policy riêng.

## Source-of-truth hierarchy

```text
Security
  > Authorization / Consent
  > Explicit user declaration
  > Authoritative domain state
  > Validated evidence
  > Derived Personal World Model state
  > Agent proposal
  > LLM wording
```

## Execution authority

Mức quyền chuẩn:

`READ → SUGGEST → DRAFT → WRITE_INTERNAL → EXECUTE_WITH_CONFIRMATION → AUTOMATE → DENY`

Agent/tool không được tự nâng authority. `AUTOMATE` chỉ tồn tại khi người dùng đã cấp scope, purpose, thời hạn và khả năng revoke rõ ràng.

## Data and contract rules

- Core entity/versioned contract đặt trong `packages/core-contracts` hoặc package kế nhiệm.
- Mutation retryable có idempotency key.
- Event có `id`, `name`, `schemaVersion`, `occurredAt`, `actor`, `aggregate`, `correlationId`, `causationId?`, `payload`.
- State + outbox phải cùng transaction khi cần phát event.
- Context Builder chỉ inject dữ liệu cần thiết sau permission/sensitivity/purpose filtering; không dump toàn bộ Personal World Model vào prompt.
- Domain không query bảng domain khác trực tiếp; dùng typed read model/API/event.

## AI rules

Mọi AI call qua AI Gateway với task, model policy, budget, privacy policy, timeout, correlation id và structured output khi cần. Model selection dựa trên capability, cost, latency, context, privacy và provider health; domain không hard-code provider/model.

Agents chỉ dùng cho công việc có đường đi động; deterministic engines tiếp tục sở hữu auth, permissions, billing, mastery, state transitions và các luật nghiệp vụ có thể xác định.

## Repository target

```text
donghanhcungban/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── admin/
├── platform/
│   ├── identity/
│   ├── personal-model/
│   ├── life-graph/
│   ├── knowledge-fabric/
│   ├── memory/
│   ├── goals/
│   ├── policies/
│   ├── permissions/
│   ├── decisions/
│   ├── companion/
│   ├── capabilities/
│   ├── tools/
│   ├── ai/
│   ├── workflow/
│   ├── events/
│   └── observability/
├── domains/
│   ├── learning/
│   ├── career/
│   ├── work/
│   ├── startup/
│   └── life/
├── packages/
└── docs/
```

Đây là target ownership, **không phải yêu cầu move folder ngay**.

## Migration rule

Không rewrite. V1 được đóng băng làm baseline/legacy reference; code production hiện tại tiếp tục chạy. V2 áp dụng strangler migration: contracts additive → dual-read/write khi cần → shadow comparison → feature flag/canary → source-of-truth switch → retention window → xóa đường cũ sau rehearsal rollback/recovery.

Mapping và thứ tự thực thi: `docs/architecture-v2/20-MIGRATION-V1-V2.md` và `docs/architecture-v2/21-ROADMAP.md`.

## Acceptance

Architecture V2 chỉ được coi là hoàn thành khi một người có thể dùng cùng Companion qua ít nhất hai domain thật, context/memory có provenance và permission, goal/life graph nối được cross-domain evidence, external action có authority rõ ràng, outcome được quan sát và Personal World Model cập nhật lại an toàn; toàn bộ flow có test, audit, observability và rollback/recovery evidence.
