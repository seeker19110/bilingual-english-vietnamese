# Phase 18 — Curriculum Agent

## Objective

Use AI to propose personalized curriculum changes while deterministic engines retain authority.

## Input

Goal, CEFR, skill graph, mastery, errors, history, available time.

## Output

Typed proposal: target skills, lesson sequence, activities, rationale and confidence.

## Validation

Prerequisites → policy → difficulty → workload → safety → contract. Invalid proposals are rejected or repaired; agent never writes learner truth directly.

## Tests

Good proposal, missing prerequisite, overloading, hallucinated skill IDs, malformed output and injection.

## Acceptance

Every accepted curriculum decision is traceable to proposal + validation + version.

## Commit

`feat(agent): introduce curriculum proposal agent`
