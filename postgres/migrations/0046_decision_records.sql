-- postgres/migrations/0046_decision_records.sql
-- V2-10: Decision Ledger + Outcome Loop (02-SYSTEM-ARCHITECTURE.md mục 8).

create table if not exists personal.decision_records (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  problem text not null,
  domain text,
  options jsonb not null default '[]',
  assumptions jsonb not null default '[]',
  evidence jsonb not null default '[]',
  tradeoffs jsonb not null default '[]',
  selected_option_id text,
  rationale text,
  expected_outcomes jsonb not null default '[]',
  actual_outcomes jsonb not null default '[]',
  status text not null check (status in ('open', 'decided', 'review_due', 'reviewed', 'superseded')),
  review_at timestamptz,
  version integer not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_personal_decision_records_person_status
  on personal.decision_records (person_id, status);

create index if not exists idx_personal_decision_records_review_due
  on personal.decision_records (status, review_at)
  where status = 'decided' and review_at is not null;

create table if not exists personal.decision_reviews_audit_log (
  id bigserial primary key,
  decision_id uuid not null references personal.decision_records(id) on delete cascade,
  person_id uuid not null references personal.persons(id) on delete cascade,
  actor text not null,
  action text not null check (action in ('create', 'decide', 'record_outcome', 'mark_review_due', 'review', 'supersede')),
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_personal_decision_audit_decision
  on personal.decision_reviews_audit_log (decision_id, created_at desc);
