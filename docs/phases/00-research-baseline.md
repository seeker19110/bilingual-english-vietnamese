# Phase 00 — Research & Baseline

## Objective

Establish a verified map of the existing application before architectural change.

## Steps

1. Inventory frontend, API, DB schema/migrations, auth, AI/STT/TTS, SRS, CEFR, tests and deployment.
2. Trace each critical request from UI → API → service → DB/provider.
3. Record existing contracts, duplicated logic, unsafe `any`, provider coupling and legacy paths.
4. Run build, typecheck, lint, unit, integration and E2E; record exact baseline.
5. Measure representative AI latency, tokens/cost, provider failure and audio latency.
6. Produce dependency graph and migration risks.

## Deliverables

`docs/research/baseline.md`, architecture map, test baseline, risk register.

## Acceptance

No critical subsystem is undocumented; baseline commands are reproducible; all known blockers have owners/next phase.

## Commit boundary

`docs: establish repository and runtime baseline`
