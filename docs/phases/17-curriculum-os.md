# Phase 17 — Curriculum OS

## Objective

Represent learning as goal → CEFR → competency → skill → knowledge → lesson → activity → assessment.

## Lesson contract

Objective, prerequisites, content, examples, practice, assessment and success criteria.

## Steps

1. Map existing CEFR/course content into stable IDs.
2. Attach prerequisites and target skills.
3. Add lesson/activity versioning and provenance.
4. Validate sequencing against skill graph and mastery.
5. Keep content separate from learner state.

## Tests

Prerequisite violations, duplicate activities, version migration and lesson completeness.

## Acceptance

A curriculum can be generated, validated and resumed without embedding learner state in content records.

## Commit

`feat(curriculum): establish curriculum domain model`
