# Phase 08 — Mastery Engine

## Objective
Compute authoritative learner mastery from validated evidence.

## State
UNKNOWN, LEARNING, UNSTABLE, PRACTICED, MASTERED, DECAYING.

## Algorithm contract
Inputs: prior mastery, evidence result/confidence, difficulty, recency, repetition, context diversity and retention. Output: score, state, confidence, risk and version. The exact formula must be deterministic, versioned and benchmarked; never let an LLM mutate mastery.

## Steps
1. Define score representation and bounds.
2. Implement deterministic calculator with version.
3. Apply optimistic concurrency/idempotency.
4. Store history for explainability.
5. Emit `mastery.updated` after commit.

## Tests
First evidence, repeated success/failure, conflicting evidence, low confidence, decay, duplicate events, concurrent updates and boundary scores.

## Acceptance
Every mastery change is reproducible from evidence/history; agents cannot directly write mastery.

## Commit
`feat(mastery): introduce deterministic mastery engine`
