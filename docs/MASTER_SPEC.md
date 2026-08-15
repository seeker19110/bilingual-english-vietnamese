# English Tutor OS — Master Implementation Specification v1.0

## Mission

Evolve `english-tutor` from an AI language-learning web app into an Adaptive AI English Tutor OS: learner model → diagnostic → adaptive curriculum → tutor → assessment → evidence → mastery → memory/SRS → next plan.

## Architectural invariants

1. Learner state is server/domain source of truth; LLM output is never authoritative.
2. Evidence precedes state changes.
3. Agents propose; domain engines and policy validate/commit.
4. Deterministic rules own auth, permissions, workflow state, billing, mastery calculation and SRS scheduling.
5. All AI boundaries use versioned typed contracts and structured-output validation.
6. Critical state mutations are auditable and idempotent.
7. Provider/model choices are behind abstractions.
8. Learning outcome and retention outrank engagement metrics.
9. AI failure must not corrupt learner state.
10. Every phase requires tests, observability and documentation.

## Target layers

- Foundation OS: config, DB, auth, storage, events, jobs, observability.
- Contract OS: versioned schemas and domain boundaries.
- Learner OS: learner profile, goals, preferences, skills, knowledge, evidence, errors, mastery.
- Learning OS: diagnostic, assessment, curriculum, tutor policy, correction, difficulty, SRS.
- Memory OS: working/episodic/semantic/error/preference/progress memory and retrieval.
- AI OS: provider gateway, model router, evaluation, cost controls.
- Workflow OS: durable state machine, retries, timeouts, compensation and audit.
- Multi-Agent OS: manifests, permissions, proposals, arbitration and conflict resolution.
- Voice OS: STT, alignment, pronunciation, fluency, TTS and audio evidence.
- Engineering Intelligence: CI, AI evals, regression, security, performance, cost and architecture governance.

## Repository target

`docs/phases/00-research-baseline.md` through `docs/phases/45-final-audit.md`, plus `PROGRESS.md`. New modules should be introduced incrementally; do not rewrite the application in one step.

## Standard phase contract

Every phase document must define: objective; current-state assumptions; scope/out-of-scope; dependencies; architecture; repository files; DB/migrations; contracts; APIs/events; business rules; AI/agent behavior; workflow; tests; benchmarks; observability; security; performance; migration/backward compatibility; Definition of Done; commit boundary; next-phase dependencies.

## Implementation loop

Inspect → design → smallest coherent implementation → tests → benchmark → security/architecture review → docs/progress → commit → verify → next phase.

## Final learning loop

Goal → Diagnostic → Learner Model → Skill Graph → Gap Analysis → Curriculum → Daily Plan → Tutor → Evidence → Mastery → Forgetting Risk → SRS → Next Session.

## Multi-agent authority

Security > authorization > domain invariants > learner truth > policy > agent proposal > LLM wording. Agents never directly mutate mastery, permissions, billing or authoritative learner state.

## Long-term portability

AIProvider, SpeechProvider, ModelRouter, AgentRouter, WorkflowEngine, EventBus, Storage and Vector/Memory interfaces must prevent vendor lock-in.

## Acceptance

The system is complete only when the full learner loop is executable, observable, testable, resilient to provider failure, and supported by regression/evaluation datasets. See phase files for implementation gates.
