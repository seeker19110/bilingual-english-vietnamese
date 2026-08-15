# Phase 37 — Learner UI

## Objective
Expose learner state and recommendations transparently without making UI the source of truth.

## Views
Current level, skill strengths/gaps, today's plan, review queue, progress, error patterns and explanations for recommendations.

## Steps
Consume canonical APIs; show provenance/reason; handle loading/offline/failure; keep accessibility and bilingual UX; never derive authoritative mastery locally.

## Tests
E2E flows, accessibility AA, responsive states, stale data and authorization.

## Acceptance
A learner can understand what to study, why, and what evidence drove it.

## Commit
`feat(ui): introduce learner OS dashboard`
