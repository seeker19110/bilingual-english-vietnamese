-- 0043_life_graph.sql — V2-05 Life Graph foundation slice 1.
--
-- Life Graph là read model xuyên domain trong schema `personal`. Goal Learning hiện tại vẫn do
-- `public.profiles.goal` + `daily_minutes` sở hữu; bảng `life_goal_sources` chỉ giữ định danh
-- nguồn để adapter dựng/đọc projection, KHÔNG copy payload Learning thành nguồn sự thật thứ hai.
--
-- Rollback vận hành ưu tiên: gỡ route/code và GIỮ bảng để không mất audit. Chỉ khi chắc chắn chưa
-- có dữ liệu cần giữ: drop theo thứ tự life_graph_audit_log → life_goal_sources → life_goals →
-- life_graph_edges → life_graph_nodes → function enforce_life_goal_node_type. KHÔNG drop schema
-- personal hay bảng V2-03/V2-04.

create table if not exists personal.life_graph_nodes (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references personal.persons(id) on delete cascade,
  type        text not null check (type in (
                'Person', 'Goal', 'Project', 'Skill', 'Organization', 'Event',
                'Commitment', 'Constraint', 'Decision'
              )),
  label       text not null check (char_length(label) between 1 and 200),
  version     integer not null default 1 check (version > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  archived_at timestamptz,
  unique (id, person_id)
);

create index if not exists idx_life_graph_nodes_person_type
  on personal.life_graph_nodes (person_id, type, created_at)
  where archived_at is null;

create unique index if not exists idx_life_graph_person_node_active
  on personal.life_graph_nodes (person_id)
  where type = 'Person' and archived_at is null;

create table if not exists personal.life_graph_edges (
  id           uuid primary key default gen_random_uuid(),
  person_id    uuid not null references personal.persons(id) on delete cascade,
  from_node_id uuid not null,
  to_node_id   uuid not null,
  relation     text not null check (relation in (
                 'requires', 'contributes_to', 'blocks', 'conflicts_with',
                 'supports', 'belongs_to', 'involves'
               )),
  provenance   text not null check (char_length(provenance) between 1 and 100),
  version      integer not null default 1 check (version > 0),
  created_at   timestamptz not null default now(),
  archived_at  timestamptz,
  check (from_node_id <> to_node_id),
  constraint life_graph_edges_from_owner_fk
    foreign key (from_node_id, person_id)
    references personal.life_graph_nodes(id, person_id),
  constraint life_graph_edges_to_owner_fk
    foreign key (to_node_id, person_id)
    references personal.life_graph_nodes(id, person_id)
);

create unique index if not exists idx_life_graph_edges_active_unique
  on personal.life_graph_edges (person_id, from_node_id, to_node_id, relation)
  where archived_at is null;
create index if not exists idx_life_graph_edges_from
  on personal.life_graph_edges (person_id, from_node_id) where archived_at is null;
create index if not exists idx_life_graph_edges_to
  on personal.life_graph_edges (person_id, to_node_id) where archived_at is null;

create table if not exists personal.life_goals (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references personal.persons(id) on delete cascade,
  node_id     uuid not null,
  label       text not null check (char_length(label) between 1 and 200),
  status      text not null default 'active'
              check (status in ('active', 'achieved', 'abandoned', 'blocked')),
  target_date timestamptz,
  version     integer not null default 1 check (version > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (node_id),
  constraint life_goals_node_owner_fk
    foreign key (node_id, person_id)
    references personal.life_graph_nodes(id, person_id)
);

-- Chặn gắn LifeGoal vào node không phải Goal ngay tại DB.
create or replace function personal.enforce_life_goal_node_type()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from personal.life_graph_nodes
    where id = new.node_id and person_id = new.person_id and type = 'Goal'
  ) then
    raise exception 'life_goal node must have type Goal' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_life_goal_node_type on personal.life_goals;
create trigger trg_life_goal_node_type
before insert or update of node_id, person_id on personal.life_goals
for each row execute function personal.enforce_life_goal_node_type();

-- Chỉ định danh nguồn; không lưu snapshot/payload Learning để tránh hai source of truth.
create table if not exists personal.life_goal_sources (
  goal_id       uuid primary key references personal.life_goals(id) on delete cascade,
  person_id     uuid not null references personal.persons(id) on delete cascade,
  source_domain text not null,
  source_type   text not null,
  source_id     text not null,
  created_at    timestamptz not null default now(),
  unique (person_id, source_domain, source_type, source_id)
);

-- Nhật ký append-only cho mutation; service chỉ INSERT, không UPDATE/DELETE bảng này.
create table if not exists personal.life_graph_audit_log (
  id          bigserial primary key,
  person_id   uuid not null references personal.persons(id) on delete cascade,
  entity_type text not null check (entity_type in ('node', 'edge', 'goal')),
  entity_id   uuid not null,
  action      text not null check (action in ('create', 'update', 'archive', 'transition')),
  before_data jsonb,
  after_data  jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_life_graph_audit_person
  on personal.life_graph_audit_log (person_id, created_at desc);
