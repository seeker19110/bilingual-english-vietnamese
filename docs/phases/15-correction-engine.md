# Phase 15 — Correction Engine

## Objective

Choose when and how to correct errors and verify improvement.

## Priority

Target skill > repeated error > high severity > minor error.

## Modes

Explicit, recast, hint, self-correction, delayed, none.

## Steps

1. Consume validated error/evidence.
2. Select correction mode from policy.
3. Produce correction content through Tutor Agent.
4. Trigger retry when correction requires verification.
5. Store new evidence and resolve/update error only from validated result.

## Tests

Mode selection, repeated error escalation, fluency mode, successful retry and false correction.

## Acceptance

Correction is an evidence-generating intervention, not merely text formatting.

## Commit

`feat(learning): introduce correction and retry engine`
