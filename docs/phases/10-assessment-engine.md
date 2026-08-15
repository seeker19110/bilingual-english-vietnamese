# Phase 10 — Assessment Engine

## Objective
Assess grammar, vocabulary, speaking, writing, reading, listening, pronunciation and overall competence independently from tutoring.

## Steps
1. Define assessment item/task contracts and scoring rubrics.
2. Separate raw response, assessor judgment and evidence.
3. Require structured scoring with confidence and rationale metadata.
4. Validate score ranges and skill mapping server-side.
5. Persist assessment version/rubric/model metadata.

## Tests
Rubric boundaries, invalid scores, inconsistent skill mapping, model malformed output, repeated assessment and regression fixtures.

## Acceptance
Assessment can produce reproducible evidence without directly mutating mastery or curriculum.

## Commit
`feat(assessment): establish assessment and scoring engine`
