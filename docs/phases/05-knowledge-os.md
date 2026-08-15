# Phase 05 — Knowledge OS

## Objective
Create structured language knowledge reusable by lessons, assessment, memory and SRS.

## Types
WORD, PHRASE, COLLOCATION, GRAMMAR, PRONUNCIATION, COMMUNICATION_PATTERN, LISTENING_PATTERN.

## Steps
1. Normalize existing dictionary/CEFR data.
2. Add stable IDs, difficulty, CEFR range, frequency and examples.
3. Model synonym, antonym, derivation, prerequisite, related and example-of relations.
4. Separate canonical knowledge from learner mastery.
5. Add search/read APIs and provenance/version metadata.

## Tests
Duplicate normalization, relation integrity, CEFR range validation, multilingual examples and backward compatibility with dictionary features.

## Acceptance
Knowledge can be referenced independently by skills, evidence, errors, lessons and reviews.

## Commit
`feat(knowledge): establish structured language knowledge model`
