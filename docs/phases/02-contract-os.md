# Phase 02 — Contract OS

## Objective

Make every critical boundary typed, validated and versioned.

## Steps

1. Define canonical schemas for Learner, Goal, Skill, Knowledge, Evidence, Error, Mastery, Assessment, Lesson, Activity, Memory, Workflow, AgentManifest and AIRequest/Response.
2. Add schema versions and compatibility rules.
3. Validate LLM output: parse → schema → domain rules → policy → commit.
4. Replace critical `any`/unvalidated JSON boundaries.
5. Define API/event error contracts and idempotency keys.

## Tests

Valid/invalid payloads, unknown fields, version compatibility, malformed model output, duplicate events.

## Acceptance

No business-critical AI output reaches persistence without validation; contracts are documented and executable.

## Commit

`feat(contracts): establish versioned domain contracts`
