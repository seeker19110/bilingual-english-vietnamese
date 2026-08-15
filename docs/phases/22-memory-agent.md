# Phase 22 — Memory Agent

## Objective

Use AI for memory extraction/classification without granting authority over learner truth.

## Steps

Extract candidate memories from approved events → schema validate → classify type → confidence/provenance → policy filter → persist. Retrieval proposals are ranked by Memory OS.

## Guardrails

No direct mastery/goal/permission writes; no cross-user context; no unverified permanent memory.

## Tests

False-memory rejection, sensitive-data filtering, duplicate consolidation, deletion propagation and prompt injection.

## Acceptance

All persisted memories have provenance, confidence, scope and lifecycle.

## Commit

`feat(agent): introduce memory extraction agent`
