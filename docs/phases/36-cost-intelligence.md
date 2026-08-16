# Phase 36 — Cost Intelligence

## Objective

Control AI economics without sacrificing learning quality.

## Metrics

Cost/user, session, task, model and provider; token/audio usage; fallback rate.

## Steps

Instrument usage; define per-task budgets; route within quality floor; cache safe deterministic assets; detect anomalies; expose cost dashboards and alerts.

## Acceptance

Budget breaches fail gracefully or downgrade to approved alternatives; no silent unbounded AI spend.

## Commit

`feat(ai): introduce cost intelligence and budgets`

## Task-level cost policy

Replace fixed cost-per-call estimates with an attributable ledger when provider usage is available:

`text cost = input tokens × input rate + output tokens × output rate + cache/storage adjustments`

`voice cost = input/output audio units or seconds × provider rate`

Budgets apply by `task_id × plan × user × day/month`. Budget pressure may select only alternatives already above the Phase 32 quality floor. It must never downgrade billing, permission, mastery or other deterministic invariants to an AI decision.

Track progress toward the optimization targets in [V2 Model API Strategy](../architecture-v2/22-MODEL-API-STRATEGY.md); report measured ranges, not guaranteed savings.
