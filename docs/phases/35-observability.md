# Phase 35 — Observability

## Objective
Trace AI, workflow and learning behavior end-to-end.

## Telemetry
AI: request ID, agent/task, provider/model, latency, tokens, cost, validation, fallback, success. Workflow: workflow/step, duration, retry, failure. Learning: learner, skill, evidence and outcome.

## Steps
Add structured logs, metrics and traces; define dashboards/alerts; redact secrets/learner-sensitive content; correlate events.

## Acceptance
A failed learning workflow can be diagnosed from correlation ID without exposing private content.

## Commit
`feat(observability): establish end-to-end telemetry`
