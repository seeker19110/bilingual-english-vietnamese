# Phase 26 — Agent Permissions

## Objective
Enforce least privilege for agents at runtime.

## Manifest
Agent ID/version, readable resources, writable resources, callable tools, data scope, rate/budget limits.

## Steps
Define permission middleware; validate every tool/action server-side; deny by default; audit grants/denials; prevent privilege escalation through prompts or tool parameters.

## Tests
Unauthorized read/write, cross-user access, tool abuse, forged manifest and permission changes.

## Acceptance
Tutor/Assessor/Curriculum/Memory agents cannot directly mutate protected state outside declared capabilities.

## Commit
`feat(security): enforce runtime agent permissions`
