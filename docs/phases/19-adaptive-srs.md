# Phase 19 — Adaptive SRS

## Objective
Schedule review from deterministic forgetting/retention signals.

## Item types
Word, phrase, grammar, error, skill, pronunciation.

## Modes
Recognition, recall, production, speaking, writing.

## Steps
1. Define review item and schedule schema.
2. Implement deterministic scheduler with versioned algorithm.
3. Incorporate correctness, difficulty, confidence and elapsed time.
4. Bound intervals and support suspend/reset.
5. Keep scheduling separate from LLM generation.

## Tests
First review, success/failure streaks, overdue items, duplicates, timezone boundaries and concurrent scheduling.

## Acceptance
Same state + algorithm version produces same next review; every schedule change is auditable.

## Commit
`feat(srs): introduce adaptive spaced repetition engine`
