-- Migration 0052: Person erasure audit log (V2-19 Privacy Drills)
-- Append-only log of full-person erasure requests. Never deleted.

CREATE TABLE IF NOT EXISTS platform.person_erasure_log (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id        UUID        NOT NULL,
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  erased_at        TIMESTAMPTZ,
  erased_by        TEXT        NOT NULL,   -- 'self' | 'admin:<admin_user_id>'
  schemas_cleared  TEXT[]      NOT NULL DEFAULT '{}',
  records_deleted_count INTEGER NOT NULL DEFAULT 0,
  notes            TEXT
);

CREATE INDEX IF NOT EXISTS person_erasure_log_person_id_idx
  ON platform.person_erasure_log (person_id);

COMMENT ON TABLE platform.person_erasure_log IS
  'Immutable audit log of full-person data erasure. One row per erasure request. '
  'erased_at = NULL means the erasure was initiated but not yet confirmed complete.';
