# Phase 01 — Foundation OS

## Objective
Create stable infrastructure boundaries without changing learner behavior.

## Implementation
1. Centralize typed environment/config validation.
2. Introduce DB access boundary and transaction helpers.
3. Introduce `AIProvider.generate()` gateway with timeout, retry classification and request IDs.
4. Normalize application/domain errors.
5. Add storage abstraction for audio/files.
6. Add structured logging, correlation IDs and basic metrics.
7. Ensure secrets never enter logs or client bundles.

## Contracts
AI request: task, model policy, messages/input, schema, timeout, metadata. AI response: content, parsed output, provider/model, usage, latency, request ID.

## Tests
Config validation, provider timeout/failure, malformed AI response, DB transaction rollback, storage failure, secret redaction.

## Acceptance
Critical code uses abstractions rather than direct provider calls; errors and telemetry are consistent; existing features remain green.

## Commit
`feat(foundation): establish core infrastructure boundaries`
