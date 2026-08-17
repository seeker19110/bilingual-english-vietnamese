-- postgres/migrations/0050_life_foundation.sql
-- V2-17: Life Foundation Domain (planning, habits, personal growth, household, wellbeing).
-- High-impact subdomains isolated with additional policy layer.

create schema if not exists life;

create table if not exists life.plans (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  title text not null,
  plan_type text not null check (plan_type in ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start date not null,
  period_end date not null,
  status text not null check (status in ('draft', 'active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1),
  constraint life_plans_period_order check (period_end >= period_start)
);

create index if not exists idx_life_plans_person on life.plans (person_id, status, period_start desc);

create table if not exists life.habits (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  title text not null,
  habit_type text not null check (habit_type in ('build', 'break')),
  frequency text not null check (frequency in ('daily', 'weekly', 'custom')),
  target_count integer not null default 1,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_life_habits_person on life.habits (person_id, is_active);

create table if not exists life.habit_logs (
  id uuid primary key,
  habit_id uuid not null references life.habits(id) on delete cascade,
  person_id uuid not null references personal.persons(id) on delete cascade,
  logged_at date not null default current_date,
  count integer not null default 1,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_life_habit_logs_habit on life.habit_logs (habit_id, logged_at desc);

create table if not exists life.wellbeing_checks (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  mood_score integer not null check (mood_score between 1 and 10),
  energy_score integer not null check (energy_score between 1 and 10),
  stress_score integer not null check (stress_score between 1 and 10),
  notes text,
  checked_at timestamptz not null default now()
);

create index if not exists idx_life_wellbeing_person on life.wellbeing_checks (person_id, checked_at desc);

create table if not exists life.growth_milestones (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  area text not null check (area in ('health', 'career', 'learning', 'relationships', 'finances', 'creativity', 'spirituality', 'other')),
  title text not null,
  description text,
  achieved_at date,
  created_at timestamptz not null default now()
);

create index if not exists idx_life_growth_person on life.growth_milestones (person_id, area);
