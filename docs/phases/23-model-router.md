# Phase 23 — Model Router

## Objective
Select AI models by task quality, latency, cost, context and structured-output capability.

## Steps
Define task registry; provider/model capabilities; routing policy; fallback chain; budgets; telemetry. Keep provider SDKs behind AIProvider.

## Tests
Capability mismatch, timeout fallback, cost ceiling, unavailable provider, structured-output requirement and deterministic routing under same policy.

## Acceptance
Business code names tasks/capabilities, not vendor-specific models; every selection is observable.

## Commit
`feat(ai): introduce capability-based model router`
