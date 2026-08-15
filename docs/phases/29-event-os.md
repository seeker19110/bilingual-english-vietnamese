# Phase 29 — Event OS

## Objective

Create an append-oriented audit/event backbone for learning state changes.

## Event

`eventId,type,version,aggregateId,userId,payload,timestamp,correlationId,causationId`.

## Core events

session.started, answer.submitted, assessment.completed, error.detected, evidence.created, mastery.updated, lesson.completed, review.scheduled, skill.mastered.

## Steps

Define schema registry; publish after successful transaction; add idempotency/deduplication; consumer versioning; retention and audit access.

## Tests

Duplicate delivery, out-of-order events, consumer retry and schema evolution.

## Acceptance

Business effects remain correct under at-least-once delivery.

## Commit

`feat(events): establish versioned learning event OS`
