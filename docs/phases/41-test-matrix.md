# Phase 41 — Test Matrix

## Objective
Protect domain correctness and production workflows.

## Layers
Unit: engines/rules. Integration: DB/queue/AI gateway/events. Contract: schemas/API/events. E2E: onboarding, diagnostic, lesson, conversation, speaking, assessment, SRS, daily plan. Failure: AI timeout/provider failure, DB/queue failure, worker crash, duplicate event, concurrent update and invalid AI output.

## Steps
Map each critical requirement to tests; add fixtures; run deterministically in CI; quarantine only with owner/expiry.

## Acceptance
All critical workflow paths and failure modes have automated coverage and release gates.

## Commit
`test: establish complete platform test matrix`
