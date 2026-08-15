# Phase 24 — Agent Router

## Objective
Route a workflow task to the correct specialized agent.

## Steps
Define AgentManifest, task capabilities, input/output contracts, allowed tools and escalation rules. Router selects agent; Model Router then selects model. Unknown task or missing capability fails closed.

## Tests
Wrong-agent rejection, capability matching, permission mismatch, fallback and routing audit.

## Acceptance
Agent selection and model selection remain separate abstractions.

## Commit
`feat(agent): introduce capability-based agent router`
