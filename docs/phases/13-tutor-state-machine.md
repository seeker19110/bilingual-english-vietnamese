# Phase 13 — Tutor State Machine

## Objective

Make a tutoring session explicit, resumable and auditable.

## States

INIT → LOAD_CONTEXT → PLAN → START → INTERACT → OBSERVE → ASSESS → CORRECT → RETRY/ADAPT → SUMMARY → REVIEW → COMPLETE.

## Steps

1. Define transition guards and required artifacts per state.
2. Persist state/version after each critical transition.
3. Route observation/assessment/evidence to domain engines.
4. Support pause/resume and safe recovery.
5. Prevent shortcuts such as INIT → COMPLETE without required gates.

## Tests

Every legal/illegal transition, crash recovery, duplicate turn and session timeout.

## Acceptance

Session state is server authoritative and can be reconstructed from persisted workflow/events.

## Commit

`feat(tutor): introduce explicit session state machine`
