# Phase 14 — Tutor Agent

## Objective
Generate pedagogically appropriate responses inside policy/workflow boundaries.

## Input
TutorPolicy, learner context, relevant memory and current turn.

## Output
Typed TutorResponse: message, correction, feedback, question and next action.

## Guardrails
No direct mastery/goal/permission/billing mutation. Tool calls require declared permissions. Context is minimized to relevant learner data. Structured output is schema/domain validated before use.

## Tests
CEFR fit, correction correctness, injection resistance, malformed output, provider failure and no unauthorized mutation.

## Acceptance
Agent is replaceable and cannot bypass domain engines.

## Commit
`feat(agent): introduce policy-bounded tutor agent`
