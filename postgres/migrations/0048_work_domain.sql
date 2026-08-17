-- postgres/migrations/0048_work_domain.sql
-- V2-15: Work Domain (projects, tasks, meetings, documents, deadlines).

create schema if not exists work;

create table if not exists work.projects (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  name text not null,
  description text,
  status text not null check (status in ('active', 'completed', 'archived')),
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_work_projects_person on work.projects (person_id, status);

create table if not exists work.tasks (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  project_id uuid references work.projects(id) on delete set null,
  title text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null check (status in ('todo', 'in_progress', 'blocked', 'done')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_work_tasks_person on work.tasks (person_id, status, due_at);

create table if not exists work.meetings (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30,
  summary text,
  action_items jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists idx_work_meetings_person on work.meetings (person_id, scheduled_at desc);

create table if not exists work.documents (
  id uuid primary key,
  person_id uuid not null references personal.persons(id) on delete cascade,
  project_id uuid references work.projects(id) on delete set null,
  title text not null,
  document_type text not null check (document_type in ('spec', 'minutes', 'proposal', 'report', 'note')),
  summary text not null,
  content_uri text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create index if not exists idx_work_documents_person on work.documents (person_id, project_id);
