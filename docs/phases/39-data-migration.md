# Phase 39 — Data Migration

## Objective

Migrate production data safely into canonical domain schemas.

## Steps

Schema migration → backfill → validation → dual-read → dual-write → cutover → cleanup. Record row counts/checksums and provenance; use transactional batches where possible; define rollback/restore plan before destructive steps.

## Tests

Partial migration, duplicate records, invalid legacy data, rollback and concurrent writes.

## Acceptance

No destructive migration runs without backup, validation and rollback procedure.

## Commit

`feat(migration): establish safe data migration pipeline`
