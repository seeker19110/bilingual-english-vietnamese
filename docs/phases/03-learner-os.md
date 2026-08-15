# Phase 03 — Learner OS

## Objective

Create the authoritative learner model.

## Data

`learner_profiles`, `learner_goals`, `learner_preferences`; immutable IDs, timestamps, tenant/user ownership and audit metadata.

## Steps

1. Map existing user/profile data.
2. Introduce canonical learner repository/service.
3. Normalize goals, preferences, timezone and target language.
4. Build `LearnerStateService` aggregating profile, goals, preferences, skills, knowledge, errors, recent evidence and risks.
5. Add authorization so users can only access their state.
6. Migrate existing data through adapters/backfill.

## Tests

Isolation, partial profiles, concurrent updates, migration, unauthorized access.

## Acceptance

One server-authoritative learner context exists; legacy callers can use an adapter; no cross-user leakage.

## Commit

`feat(learner): introduce authoritative learner model`
