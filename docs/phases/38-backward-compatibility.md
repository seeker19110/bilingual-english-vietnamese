# Phase 38 — Backward Compatibility

## Objective
Migrate the existing production app incrementally without a big-bang rewrite.

## Strategy
Legacy → adapter → new engine; dual-read → validate → dual-write → cutover → remove legacy.

## Steps
Inventory callers; wrap legacy APIs; compare old/new results; shadow new path; migrate by cohort/feature flag; monitor; remove only after acceptance window.

## Tests
Legacy clients, rollback, data divergence, feature flags and mixed-version deployment.

## Acceptance
Every migration has a reversible path and measured equivalence before cutover.

## Commit
`refactor(migration): establish compatibility migration strategy`
