-- postgres/migrations/0045_proposed_actions.sql — V2-08 ProposedAction & Tool Execution Audit.
-- docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 3, 9, 10 + 21-ROADMAP.md mục V2-08.

create table if not exists personal.proposed_actions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references personal.persons(id) on delete cascade,
  capability_id text not null,
  action text not null,
  target_domain text not null,
  payload jsonb not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'restricted')),
  status text not null check (status in ('pending', 'confirmed', 'rejected', 'committed')),
  version integer not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text,
  execution_result jsonb
);

create index if not exists idx_proposed_actions_person_status
  on personal.proposed_actions(person_id, status, created_at desc);

create table if not exists personal.tool_execution_audit_log (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references personal.persons(id) on delete cascade,
  tool_id text not null,
  proposed_action_id uuid references personal.proposed_actions(id) on delete set null,
  input_payload jsonb not null,
  output_payload jsonb,
  status text not null check (status in ('success', 'failed', 'rejected_by_policy')),
  duration_ms integer not null check (duration_ms >= 0),
  error_message text,
  executed_at timestamptz not null default now()
);

create index if not exists idx_tool_audit_person_executed
  on personal.tool_execution_audit_log(person_id, executed_at desc);
