# AGENTS.md — English Tutor

## Repository purpose

This repository contains the production Vietnamese–English AI tutor. Treat learner data,
authentication, payments, entitlements, usage accounting and AI-provider costs as high-risk areas.

## Environment

- Required runtime: Node.js 22 and npm from `package-lock.json`.
- In Codex Cloud, run `bash scripts/codex-cloud-setup.sh` as the setup script and
  `bash scripts/codex-cloud-maintenance.sh` as the maintenance script.
- Cloud uses a disposable local PostgreSQL database. Never connect cloud tasks or tests to the
  production database, Redis, R2 bucket, email provider, payment webhook or AI credentials.
- Do not create or commit `.env`. Use environment settings for non-secret test configuration and
  encrypted secrets only when a task explicitly needs them.

## Working rules

- Read `CLAUDE.md`, `PROGRESS.md` and relevant documents before changing architecture or behavior.
- Use `rg`/`rg --files` for search and `npm run codemap -- impact <file>` before editing hotspots.
- Preserve existing user changes and unrelated untracked files.
- Keep changes small and backward compatible. Use versioned migrations for database changes.
- Never let AI output directly mutate billing, permissions, mastery or authoritative learner state.
- Payment, entitlement and usage changes require atomicity, idempotency and concurrent/retry tests.
- Do not call paid external providers in tests. Use faithful fakes or mocks at provider boundaries.
- Do not push, merge, deploy, rotate secrets or modify production unless the user explicitly asks.

## Large-goal AI loop

- For a goal spanning multiple PRs, follow `docs/AI_DELIVERY_LOOP.md` and create a persistent
  `docs/goals/<goal-id>.md` from `docs/goals/TEMPLATE.md`.
- Reload and reconcile state from current `main` at the start of every iteration. Never infer
  completion from prior chat context or an old checklist.
- Implement one smallest verifiable slice per PR. A feature requires researched, reviewed and merged
  `docs/specs/*` marked **Approved for implementation** before source changes.
- After each merged slice, update evidence, goal gap, risks and next best slice, then repeat until
  Goal DoD passes or a mandatory stop condition is reached.
- Repair the same known failure at most three times. Do not weaken tests, thresholds, validation or
  security controls to make a gate pass.
- `WAITING` and `BLOCKED` are valid checkpoints. Never assume permission to merge, deploy, spend
  money, access production/secrets or make destructive/product/architecture decisions.

## Verification

For code changes, run the checks relevant to the diff and finish with the complete gate:

```bash
npm run build
npm run typecheck
npm run lint
npm run format:check
npm test
```

Run `npm run test:e2e` when UI, routing, auth, API integration or learner flows change. For a
documentation-only change, `npx prettier --check <changed-markdown-files>` and `git diff --check`
are sufficient. Report exact results; do not reuse numbers from an older commit.

## Pull requests

- Use a focused branch and conventional commits.
- PR description must include scope, risk, validation, migration/rollback and unresolved items.
- `main` is protected. Open a PR and wait for required `quality` and `e2e` checks before merge.
- Do not include generated output, `.env`, copyrighted `tai-lieu-sgk/`, local hooks or unrelated
  files in a commit.

## Code review rules

- Flag any path where payment can become terminal before entitlement is granted or reconciled.
- Flag cross-user access, cookie/CSRF regressions, non-idempotent retries and secrets in logs/bundles.
- Flag persistence of unvalidated AI output and changes that bypass usage/cost controls.
- Flag migrations without an additive rollout, verification query and recovery procedure.
