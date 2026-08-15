# Phase 09 — Diagnostic Engine

## Objective
Estimate current competence and identify the highest-value skill gaps efficiently.

## Pipeline
Goal → candidate skills → adaptive sampling → assessment → evidence → gap analysis → priority/confidence.

## Steps
1. Select skills from goal/CEFR/prerequisites.
2. Sample high-information items first.
3. Stop when confidence threshold is reached; otherwise sample more.
4. Persist diagnostic evidence separately from final learner state.
5. Rank gaps by weakness × goal relevance × prerequisite impact × confidence.

## Tests
Known-level fixtures, sparse evidence, contradictory evidence, early stopping and deterministic ranking.

## Acceptance
Output contains current-level estimate, skill gaps, priority skills and confidence with explainable evidence.

## Commit
`feat(diagnostic): introduce adaptive diagnostic engine`
