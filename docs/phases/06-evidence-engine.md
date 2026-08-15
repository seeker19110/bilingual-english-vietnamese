# Phase 06 — Evidence Engine

## Objective

Turn observed learner performance into validated learning evidence.

## Pipeline

Interaction → observation → assessment → Evidence → validation → persistence → event.

## Evidence fields

learnerId, source, skillId, knowledgeId, result, confidence, difficulty, context, timestamp, provenance and correlation ID.

## Steps

1. Define evidence sources: chat, speaking, writing, quiz, lesson, SRS, diagnostic, exam.
2. Distinguish raw interaction from evidence.
3. Add confidence and provenance.
4. Make writes idempotent and auditable.
5. Emit `evidence.created` only after persistence.

## Tests

Same interaction/noise, duplicate submission, low confidence, conflicting evidence, invalid skill/knowledge, cross-user access.

## Acceptance

Only validated evidence can influence mastery or adaptive decisions.

## Commit

`feat(evidence): establish validated learning evidence pipeline`
