# Phase 04 — Skill OS

## Objective
Represent language competence as a versioned skill graph.

## Steps
1. Define Skill with category, CEFR mapping, parent/prerequisite/related edges.
2. Seed canonical English skills across grammar, vocabulary, reading, listening, writing, speaking and pronunciation.
3. Add graph queries: prerequisites, dependents, weak candidates and next skills.
4. Version graph changes; preserve learner references to retired skills.
5. Expose read-only API to learning engines.

## Tests
Cycles rejected, missing prerequisites rejected, graph traversal, version compatibility and tenant/user isolation.

## Acceptance
Diagnostic/curriculum engines can deterministically identify prerequisites and candidate next skills.

## Commit
`feat(skill): establish versioned skill graph`
