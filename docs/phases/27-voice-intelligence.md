# Phase 27 — Voice Intelligence

## Objective
Turn speech into high-quality learning evidence while preserving existing STT/TTS features.

## Pipeline
Audio → STT → transcript/alignment → pronunciation/fluency analysis → evidence → tutor response → TTS.

## Steps
Abstract speech providers; retain timestamps/confidence; add phoneme/word alignment where supported; calculate pronunciation, fluency, pauses and prosody; attach evidence provenance; cache audio safely.

## Tests
Noisy audio, silence, accents, provider failure, transcript mismatch and privacy/access controls.

## Acceptance
Voice metrics are versioned and never silently treated as perfect truth.

## Commit
`feat(voice): establish voice intelligence pipeline`
