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

## Gemini Voice split

The normative policy is [V2 Model API Strategy — Gemini Voice architecture](../architecture-v2/22-MODEL-API-STRATEGY.md).

Implement two adapters behind the voice registry:

1. `speech.generate`: text-to-audio for stories, examples and corrections; chunk, pre-generate and cache.
2. `voice.live_session`: bidirectional native audio for paid realtime tutoring; meter input/output audio, enforce minute budgets and downgrade to the existing push-to-talk pipeline.

The existing `Audio → STT → analysis → evidence → response → speech` pipeline remains the authoritative evidence path. Native Live audio may improve interaction but must not directly write phoneme scores, mastery or memory.

Additional tests: VAD/silence billing, idle/background disconnect, interruption, live-to-push-to-talk downgrade, preview model removal, audio retry idempotency, cache keys across model/voice/style/locale, and per-plan hard caps.
