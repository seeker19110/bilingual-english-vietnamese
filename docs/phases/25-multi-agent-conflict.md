# Phase 25 — Multi-Agent Conflict Resolution

## Objective
Resolve competing agent proposals without allowing consensus hallucination to mutate truth.

## Authority
Security/authorization → domain invariants → learner truth → policy → agent proposals → wording.

## Steps
Collect proposals with evidence; validate permissions/contracts; detect conflicts; apply deterministic policy/authority; request clarification/reassessment when unresolved; record arbitration decision and dissent.

## Example
Tutor proposes higher difficulty while Assessor reports weakness and Mastery is unstable → Policy retains current/reduces difficulty; no agent can override.

## Tests
Contradictory proposals, tie cases, missing evidence, malicious override and deterministic arbitration.

## Acceptance
Every conflict has an auditable resolution reason.

## Commit
`feat(agent): introduce deterministic conflict arbitration`
