# Phase 21 — Memory OS

## Objective

Provide scoped, privacy-safe learner memory instead of dumping full chat history into prompts.

## Classes

WORKING, EPISODIC, SEMANTIC, ERROR, PREFERENCE, PROGRESS.

## Steps

Define memory schema/provenance/expiry; extract candidates from events; rank retrieval by task relevance, recency, confidence and scope; enforce per-user isolation; cap context budget; support deletion/export.

## Tests

Cross-user isolation, stale memory, conflicting memory, deletion, context budget and injection via memory.

## Acceptance

Agents receive only relevant, authorized memory with provenance.

## Commit

`feat(memory): establish scoped learner memory OS`
