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
