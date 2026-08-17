# V2-20 — Scale and Final Architecture Audit

**Status:** Approved for implementation  
**Date:** 2026-08-17  
**Wave:** Final Acceptance Gate (after V2-19 Platform Evaluation & Hardening)  
**Author:** AI Delivery Loop

---

## 1. Goal

Formally verify, audit, and accept the complete **Dong Hanh Platform V2** (V2-01 through V2-19).
This milestone serves as the final architecture and scale acceptance gate, ensuring all platform invariants, multi-domain capabilities, personal world models, knowledge fabrics, external side-effects authority, decision/outcome loops, provider independence, and cost/security/SLO criteria are met with verifiable evidence.

---

## 2. Platform V2 Acceptance Invariants

According to `docs/architecture-v2/21-ROADMAP.md`, Platform V2 is accepted only when all 8 conditions are proven:

| #   | Acceptance Condition                                                                                                                             | Verification Method                                              | Evidence Source                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | **Multi-Domain Companion**: Same person uses one Companion across $\ge 2$ production domains.                                                    | End-to-end multi-domain session verification                     | Companion runtime + Domain services integration                                                            |
| 2   | **Cross-Domain Life Graph**: Life Graph connects cross-domain goal/evidence without schema leaking.                                              | CrossDomainGraphService projection check                         | `career.goals` $\rightarrow$ `skill_gap` $\rightarrow$ `learning.mastery` $\rightarrow$ `life_graph`       |
| 3   | **Personal World Model Integrity**: Provenance, confidence, confidentiality, and authority controls enforced.                                    | PersonalPolicy + Memory candidate pipeline + DENY checks         | `eval:v2:permissions`, `eval:v2:memory`, `personal.facts`                                                  |
| 4   | **Knowledge Fabric Inspect / Correct / Delete**: Complete inspect, correction, and cascade deletion across all 13 schemas.                       | Privacy cascade drill & export completeness                      | `eval:v2:privacy`, `personErasureService`                                                                  |
| 5   | **External Side Effects & Authority**: Proposed actions, automation grants, authority checks, action receipts, compensation.                     | Automation engine & Action receipt idempotency tests             | `eval:v2:red-team`, `automationService`                                                                    |
| 6   | **Decision / Outcome Loop**: Decision record ledger $\rightarrow$ outcome tracking $\rightarrow$ feedback loop.                                  | DecisionLedgerService & Outcome recording tests                  | `decisionLedgerService`, `decisionRecord` contracts                                                        |
| 7   | **Provider / Agent Independence**: LLM provider or agent replacement loses zero authoritative person state.                                      | Provider swap simulation test                                    | Authoritative PostgreSQL schemas (`platform`, `personal`, `learning`, `career`, `work`, `startup`, `life`) |
| 8   | **SLO, Cost, Security & Audit Completeness**: Per-capability AI cost tracking, red-team 100% blocked, backup/recovery verified, full gate green. | Automated Audit Harness (`eval:v2:audit`), cost tracker, CI gate | `capabilityCostTracker`, red-team suite, R2 scripts                                                        |

---

## 3. Scope & Components

### 3.1 Per-Capability AI Cost Tracking & Budgeting

- Introduce `CapabilityCostTracker` in `packages/core-ai`:
  - Measure tokens (`prompt_tokens`, `completion_tokens`, `total_tokens`), model name, latency (`latency_ms`), and calculated USD cost per capability invocation (`capability_id` e.g. `learning.tutor_turn`, `career.review_cv`, `work.summarize_meeting`, `startup.validate_hypothesis`).
  - Support tracking by `person_id`, `domain`, `capability_id`.
  - Provide budget threshold checks (`checkBudgetExceeded`) to prevent runaway API spend.

### 3.2 Automated Final Architecture Audit & Scale Suite (`eval:v2:audit`)

- Implement `scripts/eval-v2-final-audit.ts` to execute end-to-end integration and scale checks across all 8 acceptance invariants programmatically.
- Add test harness `scripts/eval-v2-final-audit.test.ts`.

### 3.3 Final Architecture Audit Evidence Documentation

- Generate `docs/research/v2-final-architecture-audit.md` capturing all verification numbers, coverage, red-team results, scale metrics, and signed-off DoD for V2.

---

## 4. Acceptance Criteria

- **AC-1 (Multi-Domain Companion)**: Given a person session, when interacting with learning, career, work, startup, and life domains, the Companion maintains unified conversation context and routes correctly.
- **AC-2 (Cross-Domain Graph)**: Given a career goal with skill gaps, syncing cross-domain graph creates verified graph nodes and edges (`requires`, `supports`) linked to learning mastery.
- **AC-3 (World Model Integrity)**: Given a personal fact without valid provenance or violating confidentiality, it is rejected and never leaked into context.
- **AC-4 (Inspect/Correct/Delete)**: Full export returns data from all 13 schemas; cascade erase deletes all 13 schemas atomically with zero residual records.
- **AC-5 (Side-Effects Authority)**: Automated actions require active grants with unexpired `reviewAt`, enforce `DENY` policy, and emit immutable `ActionReceipt`.
- **AC-6 (Decision/Outcome Loop)**: Decisions are recorded with rationale and options; subsequent outcomes update status and evaluate policy effectiveness.
- **AC-7 (Provider Independence)**: Switching AI provider (e.g. Groq $\leftrightarrow$ Gemini $\leftrightarrow$ Anthropic) preserves all user memories, facts, goals, and domain states.
- **AC-8 (Cost & Audit)**: Per-capability cost tracker logs all invocations with token and dollar accuracy, unit test coverage $\ge 90\%$, all 3900+ tests pass.
