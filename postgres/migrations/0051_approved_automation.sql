-- postgres/migrations/0051_approved_automation.sql — V2-18 Approved Automation.
-- docs/architecture-v2/21-ROADMAP.md mục V2-18 (Wave F).
-- Explicit automation grants, schedule/event triggers, budgets/rate limits, revoke/pause lifecycle, retries/compensation, and immutable action receipts.

create table if not exists personal.automation_grants (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references personal.persons(id) on delete cascade,
  name text not null,
  description text,
  capability_id text not null,
  action text not null,
  target_domain text not null,
  trigger_config jsonb not null,
  budget_config jsonb not null,
  compensation_config jsonb,
  status text not null default 'active' check (status in ('active', 'paused', 'revoked', 'expired')),
  version integer not null default 1 check (version >= 1),
  review_at timestamptz not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index if not exists idx_automation_grants_active
  on personal.automation_grants (person_id, capability_id, action)
  where status = 'active';

create index if not exists idx_automation_grants_person_status
  on personal.automation_grants (person_id, status, created_at desc);

create table if not exists personal.action_receipts (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references personal.persons(id) on delete cascade,
  grant_id uuid not null references personal.automation_grants(id) on delete cascade,
  capability_id text not null,
  action text not null,
  idempotency_key text not null,
  trigger_source text not null,
  input_payload jsonb not null,
  execution_result jsonb,
  status text not null check (status in ('success', 'failed', 'compensated')),
  retry_count integer not null default 0 check (retry_count >= 0),
  duration_ms integer not null check (duration_ms >= 0),
  error_message text,
  compensation_result jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_action_receipts_idempotency
  on personal.action_receipts (person_id, idempotency_key);

create index if not exists idx_action_receipts_grant
  on personal.action_receipts (grant_id, created_at desc);

create index if not exists idx_action_receipts_person_created
  on personal.action_receipts (person_id, created_at desc);
