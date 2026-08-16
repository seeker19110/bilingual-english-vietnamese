# V2 recent-branch recovery manifest

Status: **recovery complete — all source content superseded, nothing ported**
Date: 2026-08-15 (opened) → 2026-08-16 (closed out)

This manifest records recent unmerged work discovered after V2 became authoritative on `main`.
It deliberately does not merge stale branch snapshots wholesale, because doing so could overwrite newer V2 architecture and runtime changes.

## Source PRs

- #543 `claude/audit-data-flow-discrepancies-ex0185`: 4 unique commits, 30 changed files. Candidate runtime fixes include TTS cache IV hardening, usage/refund correctness, subject-limit enforcement, progress/SRS fixes, provider consistency, safer seed tooling and regression tests.
- #544 `claude/learning-progress-persistence-l1n2e4`: 2 unique commits, 12 changed files. Candidate fixes include monotonic multi-device learning progress, settings synchronization, streak-freeze synchronization and migration `0040_sync_user_settings.sql`.
- #545 `claude/jolly-mendel-xv76vp`: 1 unique commit affecting `PROGRESS.md`; historical notes only.

## Authority rule

Current V2 `main` is authoritative. V1 is frozen legacy input. Recovery must preserve current V2 architecture, contracts, migration plan and roadmap.

## Porting policy

1. Port behavior, not stale full-file snapshots.
2. Re-check each candidate against current `main`; skip changes already present or superseded.
3. Preserve current V2 docs when resolving documentation overlap.
4. Migrations are additive only; never rewrite already-applied migrations.
5. Runtime fixes require their corresponding regression tests.
6. Before merge run build, typecheck, lint and full tests.

## Recovery groups — final disposition

### A — data-flow/runtime correctness (#543) → SUPERSEDED, nothing to port

Checked all 4 commits (`deedf99`, `30703ee`, `dc92ecb`, `27c34c1`) against current `main` by
cherry-picking each in isolation and inspecting every resulting conflict hunk:

- Subject-limit enforcement (`isSubjectEnforced`) — already in `packages/core-db/settings.ts` /
  `packages/core-billing/usage.ts`, main's version reads the same `enforced` flag from migration
  `0029` semantics.
- Usage refund against the original consumed day — `checkAndConsumeUsage`/`refundUsage` on main
  already thread `gate.day` through every call site, including the Anthropic-passthrough branch
  that #543's patch touched.
- Progress/SRS accounting (`grammarKey` lowercasing, `usage-summary` subject filter) — byte-identical
  to main already.
- TTS cache IV hardening — migration `0038_tts_cache_iv.sql` already present on main (same file),
  `packages/core-ai/tts.ts` already stores/reads real per-record IV and additionally has
  `isServableUrl()` + `recordTtsCacheEvent()` (migration `0039_tts_cache_stats.sql`) that #543
  did not yet have — main is strictly ahead here.
- ElevenLabs orphan-protection in `scripts/seed-all.ts` (`isValidElevenVoice`) — already present,
  including the matching `voiceTierParity.test.ts` regression test.
- CLAUDE.md dictionary count correction (12.168 words / 94.9% freq) — already the current text.

Every conflict produced by the cherry-pick was `main`'s version being equal to or a superset of
the source commit's version. No code was ported.

### B — multi-device persistence (#544) → SUPERSEDED, nothing to port

Checked both commits (`7c2e94d`, `10d4173`) the same way:

- Monotonic union merge for `learned`/`hard`/`srs`/`cefrGrammar`/`cefrDialogues`/`cefrUnlocked`/
  `achievements` via `mergeArrayUnion` — already in `api/progress.ts` / `api/_lib/progressMerge.ts`.
- `settings` merged by `updatedAt` (last-write-wins) via `mergeByTimestamp`, `streakFreezeDates`
  merged by union — already in `api/progress.ts`, `apps/english/src/lib/storage.ts`,
  `apps/english/src/lib/progressSync.ts`, `apps/english/src/lib/uiLang.ts`, `sound.ts`, `tts.ts`.
- Migration `0040_sync_user_settings.sql` — already present, identical.

No code was ported.

### C — historical progress notes (#545) → SUPERSEDED, nothing to port

The single commit only added `PROGRESS.md` notes for PR #521/#522/#524 and the 2026-08-09
`npm audit` re-check. Current `main`'s `PROGRESS.md` already contains all of that history
(same section headers, same dates, same content) plus everything that happened after it.

## Exit criteria — met

All candidate changes from #543/#544/#545 were re-checked against current `main` (isolated
cherry-pick per commit + conflict-hunk inspection, not just file-presence grep) and found to be
already present or superseded by newer V2 work. Nothing required porting, so this consolidation
PR carries no runtime changes — only this manifest update and the accompanying `PROGRESS.md`
entry. `#543`, `#544` and `#545` are being closed as superseded by this PR.
