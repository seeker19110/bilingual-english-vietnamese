# Phase 16 — Difficulty Engine

## Objective
Adapt challenge level from evidence, not intuition.

## Signals
Success/failure rate, response time, mastery, confidence and task difficulty.

## Rules
Sustained success increases challenge; repeated failure decreases it; persistent failure redirects to prerequisites. A single success cannot cause a large jump.

## Steps
Define bounded difficulty bands, smoothing/window rules, transition caps, explainability fields and policy overrides. Benchmark calibration against learner fixtures.

## Tests
Oscillation, sparse data, repeated failure, outliers and boundary conditions.

## Acceptance
Difficulty changes are deterministic, bounded and auditable.

## Commit
`feat(learning): introduce adaptive difficulty engine`
