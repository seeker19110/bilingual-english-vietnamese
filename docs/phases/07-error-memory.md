# Phase 07 — Error Memory

## Objective

Persist recurring learner errors as actionable learning objects.

## Model

Error: learnerId, skillId, knowledgeId, type, original, correction, severity, confidence, occurrenceCount, firstSeen, lastSeen, resolved.

## Steps

1. Extract candidate errors from validated assessment/evidence.
2. Normalize equivalent errors into patterns.
3. Track recurrence, severity and resolution.
4. Generate targeted retry/review candidates without changing mastery directly.
5. Emit error.detected/error.resolved events.

## Tests

Equivalent-pattern grouping, repeated errors, false positives, resolved recurrence, duplicate evidence and authorization.

## Acceptance

Errors have lifecycle `detected → repeated → targeted → retry → delayed success → resolved` and remain auditable.

## Commit

`feat(error): introduce persistent error memory`
