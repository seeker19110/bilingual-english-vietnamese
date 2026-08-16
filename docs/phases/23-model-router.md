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

## V2 task-based baseline

The normative decision is [V2 Model API Strategy](../architecture-v2/22-MODEL-API-STRATEGY.md).

Implementation must:

- route by stable `task_id`, never by a client-supplied vendor/model;
- use deterministic/cache/data paths before model invocation;
- default high-volume tutor/correction tasks to the approved Flash-Lite baseline;
- reserve the stronger model for writing/assessment or observable escalation conditions;
- load provider, model, fallback and budgets from server-side environment/registry;
- record route reason, provider/model/version, tokens/audio, latency, cost and fallback;
- keep legacy `GEMINI_MODEL` only behind an explicit compatibility adapter.

The first vertical slice is `tutor.chat`; do not migrate every task in one sweeping PR.
