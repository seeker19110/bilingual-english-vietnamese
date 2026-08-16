# Phase 32 — AI Benchmark

## Objective

Measure AI quality as an engineering artifact.

## Suites

Tutor correctness, correction precision/recall, hallucination, CEFR fit, pedagogy, personalization, memory correctness, difficulty calibration and structured-output validity.

## Steps

Create versioned fixtures; define expected behaviors and scoring; run baseline; store model/prompt/provider metadata; set regression thresholds; review failures before release.

## Acceptance

Every production-critical AI task has a reproducible benchmark and regression threshold.

## Commit

`test(ai): establish versioned AI evaluation suite`

## Model-routing gate

Benchmark each production `task_id` separately. At minimum compare the cheap baseline, approved escalation model and deterministic fallback on the same versioned holdout.

The report must include quality/safety/schema pass rate, p50/p95 latency, input/output tokens, audio seconds where relevant, cost per successful task and escalation/fallback rate. A cheaper model is accepted only above the task quality floor; a stronger model is accepted only when its measured gain justifies its incremental cost.

See [V2 Model API Strategy](../architecture-v2/22-MODEL-API-STRATEGY.md).
