# Phase 30 — Job OS

## Objective

Move long-running AI, voice, assessment and analytics work out of synchronous requests.

## Steps

Introduce queue/job contract, worker identity, retries/backoff, timeout, dead-letter queue, idempotency key and progress status. Persist job state independently of process memory.

## Tests

Worker crash, duplicate job, provider timeout, poison job, retry exhaustion and cancellation.

## Acceptance

API requests remain bounded; failed workers can resume without duplicated learner effects.

## Commit

`feat(jobs): introduce durable background job runtime`
