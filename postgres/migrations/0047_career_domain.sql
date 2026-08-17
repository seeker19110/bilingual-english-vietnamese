-- postgres/migrations/0047_career_domain.sql
-- V2-13: Career Domain (first non-learning proof of Personal OS).

create schema if not exists career;

create table if not exists career.profiles (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade unique,
  target_role text not null,
  current_title text,
  years_of_experience integer not null default 0,
  industry text,
  target_salary_min numeric,
  target_salary_max numeric,
  currency text not null default 'VND',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_career_profiles_person on career.profiles (person_id);

create table if not exists career.experiences (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  company text not null,
  role text not null,
  start_date text not null,
  end_date text,
  is_current boolean not null default false,
  achievements jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_career_experiences_person on career.experiences (person_id, created_at desc);

create table if not exists career.goals (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  target_title text not null,
  target_company_type text,
  timeframe text,
  status text not null check (status in ('active', 'completed', 'paused', 'abandoned')),
  skills_required jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_career_goals_person on career.goals (person_id, status);
