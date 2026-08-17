-- postgres/migrations/0049_startup_domain.sql
-- V2-16: Startup Domain (ventures, problems, customers, hypotheses, experiments, evidence).

create schema if not exists startup;

create table if not exists startup.ventures (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  name text not null,
  description text,
  stage text not null check (stage in ('ideation', 'validation', 'mvp', 'growth', 'scale', 'exited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_startup_ventures_person on startup.ventures (person_id, stage);

create table if not exists startup.problems (
  id uuid primary key,
  venture_id uuid not null references startup.ventures(id) on delete cascade,
  person_id uuid not null references personal.persons(id) on delete cascade,
  statement text not null,
  customer_segment text not null,
  severity text not null check (severity in ('critical', 'major', 'minor')),
  evidence_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_startup_problems_venture on startup.problems (venture_id, severity);

create table if not exists startup.hypotheses (
  id uuid primary key,
  venture_id uuid not null references startup.ventures(id) on delete cascade,
  person_id uuid not null references personal.persons(id) on delete cascade,
  statement text not null,
  hypothesis_type text not null check (hypothesis_type in ('market', 'customer', 'problem', 'solution', 'business_model')),
  status text not null check (status in ('unverified', 'supported', 'refuted', 'pivoted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_startup_hypotheses_venture on startup.hypotheses (venture_id, status);

-- validated_evidence is DISTINCT from hypothesis — Gate: AI claims never become facts without provenance
create table if not exists startup.evidence (
  id uuid primary key,
  venture_id uuid not null references startup.ventures(id) on delete cascade,
  hypothesis_id uuid references startup.hypotheses(id) on delete set null,
  person_id uuid not null references personal.persons(id) on delete cascade,
  title text not null,
  evidence_type text not null check (evidence_type in ('interview', 'survey', 'analytics', 'test', 'revenue', 'observation')),
  provenance text not null, -- source/method of evidence collection
  findings text not null,
  supports_hypothesis boolean not null,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_startup_evidence_venture on startup.evidence (venture_id, hypothesis_id);
