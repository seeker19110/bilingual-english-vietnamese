# Phase 12 — Tutor Policy Engine

## Objective
Deterministically translate learner state and goals into teaching policy.

## Inputs
LearnerState, goal, session mode, mastery, errors, curriculum and context.

## Outputs
Target skill, difficulty band, activity type, correction mode, feedback language/style and review candidates.

## Rules
Beginner: explicit correction; intermediate: selective; advanced: delayed/self-correction; fluency mode minimizes interruption; accuracy mode emphasizes correction. Rules are versioned and explainable.

## Tests
Policy fixtures for levels/modes, conflicting signals, missing data and deterministic output.

## Acceptance
Tutor behavior can be explained by policy inputs/rules and does not require LLM judgment to choose authoritative state.

## Commit
`feat(tutor): introduce deterministic tutor policy engine`
