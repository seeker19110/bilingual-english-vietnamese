# Phase 40 — Security

## Objective
Protect learner data and server-authoritative state against application, agent and prompt threats.

## Protected state
Mastery, subscription/usage, permissions, learner profile and goals.

## Steps
Enforce server authorization; tenant/user isolation; secret redaction; prompt-injection defenses; tool allowlists; input/output validation; rate limits; audit logs; secure audio storage; deletion/export controls.

## Tests
Unauthorized access, cross-user leakage, prompt injection, tool abuse, forged IDs, secret exfiltration and rate-limit bypass.

## Acceptance
Security controls are enforced at runtime, not merely described in prompts or UI.

## Commit
`feat(security): harden learner and agent boundaries`
