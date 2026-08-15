# Phase 31 — Engineering Intelligence

## Objective

Make architecture, code quality and AI behavior continuously testable in CI.

## Gates

Typecheck, lint, unit, integration, E2E, AI evals, prompt regression, cost regression, security, performance and architecture checks.

## Steps

Define CI stages and quality thresholds; publish artifacts; fail on regressions; add change-risk classification; document exceptions with expiry.

## Acceptance

A change cannot silently degrade critical correctness, security, learning quality or cost budgets.

## Commit

`ci: establish engineering intelligence gates`
