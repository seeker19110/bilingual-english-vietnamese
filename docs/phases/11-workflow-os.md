# Phase 11 — Workflow OS

## Objective

Provide durable, typed, observable execution state for multi-step learning workflows.

## State

PENDING, RUNNING, WAITING, RETRYING, COMPLETED, FAILED, CANCELLED.

## Steps

1. Define Workflow/WorkflowStep schemas and versions.
2. Implement legal state-transition guards.
3. Add timeout, retry/backoff, cancellation and resume.
4. Persist input/output/error and correlation/causation IDs.
5. Make step execution idempotent.
6. Expose audit history and safe replay.

## Tests

Illegal transitions, retries, timeout, duplicate execution, crash/restart and cancellation.

## Acceptance

A workflow can resume after process failure without duplicating business effects.

## Commit

`feat(workflow): introduce durable workflow runtime`
